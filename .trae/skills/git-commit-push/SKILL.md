---
name: "git-commit-push"
description: "Handles git commit and push workflow with optimized command execution. Invoke when user wants to commit, push, or sync code changes to remote repository."
---

# Git Commit & Push

This skill handles the complete git commit and push workflow with optimized command execution strategy.

## When to Invoke

- User asks to commit changes
- User asks to push code
- User asks to submit/sync changes to remote
- User says "提交推送" or similar commit-related requests

## Execution Strategy

### CRITICAL: Command Execution Rules

1. **Serial execution, NOT parallel**
   - Wait for each command to complete before running the next
   - Never run multiple git commands simultaneously

2. **Set appropriate timeouts**
   - Use `wait_ms_before_check` for status polling
   - Handle long-running operations gracefully

3. **Avoid `git diff` commands**
   - `git diff` outputs ALL file contents which can cause terminal buffer overflow
   - `git status` provides sufficient information for commit decisions
   - Only use `git diff` when user explicitly requests to view changes

## Workflow Steps

### Step 0: Unit Test Check (REQUIRED)

**必须在提交前检查单元测试状态！**

检查对话记录中是否在本次提交推送请求之前进行过单元测试：

1. **检查条件**：
   - 对话中是否执行过 `npm test` 或 `vitest run`
   - 测试是否在最近的代码修改之后执行
   - 测试是否全部通过

2. **如果未进行单元测试**：
   - 停止提交流程
   - 触发 `unit-test-writer` skill 进行单元测试
   - 等待测试完成后继续提交流程

3. **如果测试失败**：
   - 停止提交流程
   - 向用户反馈失败的测试
   - 建议修复后再提交

**触发单元测试的判断逻辑**：
```
IF 对话中没有执行过 npm test THEN
  触发 unit-test-writer skill
  等待测试完成
  IF 测试失败 THEN
    停止提交，报告错误
  END IF
END IF
```

### Step 1: TypeScript Compilation Check (REQUIRED)
```bash
npx tsc --noEmit
```
**必须在提交前执行此检查！**
- 如果编译失败：停止提交流程，向用户反馈错误信息
- 如果编译通过：继续执行后续步骤
- 这确保不会提交有类型错误的代码

### Step 2: Check Submodule Status (REQUIRED for projects with submodules)

**检查子模块状态：**
```bash
git submodule status
```

如果本项目包含子模块（如 `file-server`），需要：
1. 检查子模块是否有未提交的更改
2. 如果有更改，先处理子项目的提交推送
3. 子项目处理完成后再处理主项目

**子模块处理流程：**
```bash
# 进入子模块目录
cd file-server

# 检查状态
git status

# 如果有更改，提交推送
git add .
git commit -m '[类型]描述'
git push origin main

# 返回主项目
cd ..
```

**重要**：子项目的修改必须先同步到子项目的远程仓库，再提交主项目的子模块引用更新。

**子模块 .gitignore 检查**：
在处理子模块前，确认子项目的 `.gitignore` 已正确配置：
- `node_modules/` 必须被排除（否则会导致 git 操作缓慢和 index.lock 问题）
- `coverage/` 测试覆盖率报告
- 其他大目录或临时文件

**index.lock 问题处理**：
如果遇到 `index.lock` 文件残留导致 git 命令失败：
1. 检查是否有其他 git 进程在运行
2. 提醒用户手动删除锁文件：
   ```powershell
   Remove-Item -Force ".git/modules/file-server/index.lock"
   ```
3. 检查子项目的 `.gitignore` 是否正确配置

### Step 3: Check Repository Status
```bash
git status
```
Wait for result, analyze changes. This provides sufficient information for commit decisions.

### Step 4: Stage Changes
```bash
git add .
```
Or stage specific files if user requests.

### Step 5: Commit
```bash
git commit -m '[类型]描述'
```
**重要：在 PowerShell 环境下，必须使用单引号包裹 commit message！**
- 中括号 `[]` 在 PowerShell 中是特殊字符
- 使用单引号：`git commit -m '[功能] 添加新特性'` ✅
- 使用双引号会导致解析错误 ❌

使用中文 conventional commit 格式：
- `[功能]` - 新功能
- `[修复]` - Bug 修复
- `[重构]` - 代码重构
- `[文档]` - 文档更新
- `[样式]` - 代码风格调整
- `[维护]` - 维护任务
- `[测试]` - 测试相关

Commit message 必须使用中文编写，简洁明了地描述本次更改内容。

### Step 6: Push to Remote
```bash
git push origin <branch>
```
Push to the current branch.

### Step 7: Check Database Server Rebuild Requirement

**判断是否需要重建数据库服务器：**

检查本次提交是否修改了以下文件/目录：
- `database-server/` 目录下的任何文件
- `services/db.ts`
- 任何涉及数据库表结构变更的文件

**需要重建的情况：**
1. 修改了 `database-server/index.js` 中的表结构定义
2. 添加了新的数据库表
3. 修改了数据库同步函数（如 `syncCharacterProgress`, `syncCharacterEquipment` 等）
4. 修改了 API 端点中的数据库操作逻辑

**输出提示（仅提醒，不执行）：**
如果需要重建，在完成摘要中添加：
```
⚠️ 需要重建数据库服务器以应用更改！
```

**注意**：不要自动执行重建命令，用户有自己的 rebuild 脚本（docker build）。

## Error Handling

- **未进行单元测试**：触发 unit-test-writer skill，等待测试完成
- **单元测试失败**：停止提交，向用户展示失败的测试，建议修复后再提交
- **TypeScript 编译失败**：停止提交，向用户展示错误信息，建议修复后再提交
- If no changes: Inform user, do not create empty commit
- If push fails: Check remote status, suggest solutions
- If merge conflict: Alert user, do not auto-resolve
- 注意敏感信息与 .gitignore，不要提交敏感数据

## Integration with unit-test-writer Skill

当检测到需要进行单元测试时，执行以下流程：

1. **识别修改的模块**：
   - 从 `git status` 获取修改的文件列表
   - 分类为：核心逻辑、UI组件、服务层、工具函数

2. **触发 unit-test-writer**：
   - 使用多Agent模式分析修改的模块
   - 创建或更新相应的测试文件
   - 执行 `npm test` 验证测试通过

3. **测试结果处理**：
   - 测试通过：继续提交流程
   - 测试失败：停止提交，报告错误

## Output Format

Provide clear summary after completion:
- Submodule status (if applicable)
- Unit test status (passed/skipped/failed)
- Commit hash
- Commit message
- Files changed count
- Push status
- Database rebuild warning (if applicable)

## Example Output

```markdown
## 提交推送完成

**子模块**: ✅ file-server 已同步
**单元测试**: ✅ 868 passed (17 files)
**TypeScript**: ✅ 无错误
**Commit**: abc1234
**Message**: [功能] 添加战斗视觉效果单元测试
**Files**: 7 changed
**Push**: ✅ 成功推送到 origin/main

⚠️ 需要重建数据库服务器以应用更改！
```
