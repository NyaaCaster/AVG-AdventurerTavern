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

1. **Use batch commands instead of per-file operations**
   - ✅ `git diff --stat` - View all changes summary
   - ✅ `git diff` - View all changes at once
   - ❌ `git diff file1.ts`, `git diff file2.ts` - DO NOT run per-file

2. **Serial execution, NOT parallel**
   - Wait for each command to complete before running the next
   - Never run multiple git commands simultaneously

3. **Set appropriate timeouts**
   - Use `wait_ms_before_check` for status polling
   - Handle long-running operations gracefully

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

### Step 2: Check Repository Status
```bash
git status
```
Wait for result, analyze changes.

### Step 3: View Changes Summary
```bash
git diff --stat
```
Get overview of modified files and line counts.

### Step 4: View Detailed Changes (if needed)
```bash
git diff
```
View all changes in one command. DO NOT run per-file.

### Step 5: Stage Changes
```bash
git add .
```
Or stage specific files if user requests.

### Step 6: Commit
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

### Step 7: Push to Remote
```bash
git push origin <branch>
```
Push to the current branch.

### Step 8: Check Database Server Rebuild Requirement

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
- Unit test status (passed/skipped/failed)
- Commit hash
- Commit message
- Files changed count
- Lines added/removed
- Push status
- Database rebuild warning (if applicable)

## Example Output

```markdown
## 提交推送完成

**单元测试**: ✅ 868 passed (17 files)
**TypeScript**: ✅ 无错误
**Commit**: abc1234
**Message**: [功能] 添加战斗视觉效果单元测试
**Files**: 7 changed
**Lines**: +1,234 / -56
**Push**: ✅ 成功推送到 origin/main

⚠️ 需要重建数据库服务器以应用更改！
```
