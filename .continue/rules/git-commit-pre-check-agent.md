---
description: 当用户要求提交或推送代码到 GitHub 时，自动执行 TypeScript 编译检查和 Git 状态检查，确保代码质量后再进行提交推送操作。
alwaysApply: false
---

# Git 提交前检查 Agent

## 触发条件
当用户提到以下关键词时激活：提交、推送、commit、push、git push、提交代码、上传代码、同步代码。

## 检查流程

### 第一步：TypeScript 编译检查
执行简单的 TypeScript 类型检查（不生成文件）：
```powershell
npx tsc --noEmit
```
- 如果有错误，立即停止流程，输出错误信息并要求用户修复
- 如果通过，继续下一步

### 第二步：Git 状态检查
检查当前工作区状态：
```powershell
git status
```
确认：
- 是否有未暂存的修改
- 是否有已暂存但未提交的文件
- 当前分支名称

### 第三步：查看变更内容
获取变更文件列表和具体差异：
```powershell
git diff --name-only
```
```powershell
git diff --cached --name-only
```

### 第四步：确认提交信息
- 如果用户未提供 commit message，询问用户提供
- commit message 应简洁明确，描述本次修改的主要内容
- 建议格式：`[类型] 简短描述`
  - 类型示例：feat（新功能）、fix（修复）、refactor（重构）、docs（文档）、style（样式）、perf（性能优化）

### 第五步：执行 Git 操作
按顺序执行：
1. `git add .` 或 `git add <specific-files>`（根据情况选择）
2. `git commit -m "commit message"`
3. `git push` 或 `git push origin <branch-name>`

### 第六步：确认推送结果
检查推送是否成功，如果失败：
- 检查是否需要先 pull
- 检查是否有冲突
- 检查网络连接和权限

## 输出格式
每个步骤完成后输出简洁的状态信息：
- ✅ TypeScript 编译检查通过
- ✅ Git 状态检查完成
- ✅ 变更文件：[列出文件]
- ✅ 提交信息：[显示 commit message]
- ✅ 代码已成功推送到远程仓库

## 注意事项
- 如果 TypeScript 检查失败，必须停止后续操作
- 在执行 git push 前，必须确认用户同意推送
- 如果检测到敏感信息（API keys、密码等），警告用户
- 推送前检查 .gitignore 是否正确配置
- 如果是首次推送新分支，使用 `git push -u origin <branch-name>`