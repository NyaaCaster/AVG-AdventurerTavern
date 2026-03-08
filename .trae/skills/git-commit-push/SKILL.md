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

### Step 0: TypeScript Compilation Check (REQUIRED)
```bash
npx tsc --noEmit
```
**必须在提交前执行此检查！**
- 如果编译失败：停止提交流程，向用户反馈错误信息
- 如果编译通过：继续执行后续步骤
- 这确保不会提交有类型错误的代码

### Step 1: Check Repository Status
```bash
git status
```
Wait for result, analyze changes.

### Step 2: View Changes Summary
```bash
git diff --stat
```
Get overview of modified files and line counts.

### Step 3: View Detailed Changes (if needed)
```bash
git diff
```
View all changes in one command. DO NOT run per-file.

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

- **TypeScript 编译失败**：停止提交，向用户展示错误信息，建议修复后再提交
- If no changes: Inform user, do not create empty commit
- If push fails: Check remote status, suggest solutions
- If merge conflict: Alert user, do not auto-resolve
- 注意敏感信息与 .gitignore，不要提交敏感数据

## Output Format

Provide clear summary after completion:
- Commit hash
- Commit message
- Files changed count
- Lines added/removed
- Push status
