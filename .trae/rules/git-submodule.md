# Git Submodule 规则

本项目包含 `file-server` 子模块（文件服务器），位于 `file-server/` 目录。

## 子模块操作规范

### 克隆项目
```bash
git clone --recursive https://github.com/NyaaCaster/AVG-AdventurerTavern.git
```

### 拉取更新
```bash
git pull
git submodule update --init --recursive
```

### 提交推送
在提交主项目前，检查子模块是否有未提交的更改：
1. 先提交推送子项目 `file-server/`
2. 再提交推送主项目

### 子项目独立仓库
`file-server` 是独立的 Git 仓库，有自己的远程地址：
- 子项目仓库：https://github.com/NyaaCaster/file-server
- 子项目的修改需要单独同步到其仓库

## .gitignore 配置

子项目必须正确配置 `.gitignore`，排除以下目录：
- `node_modules/` - Node.js 依赖（可能导致数千个文件）
- `coverage/` - 测试覆盖率报告
- `test-uploads/` - 测试临时文件
- `*.lock` - 锁文件（如 `index.lock`）

**重要**：未排除 `node_modules` 会导致 git 操作缓慢，可能触发 `index.lock` 问题。

## index.lock 问题处理

如果遇到 `index.lock` 文件残留：
1. 确保没有其他 git 进程在运行
2. 手动删除锁文件：`Remove-Item -Force ".git/modules/file-server/index.lock"`
3. 检查 `.gitignore` 是否正确排除了大目录
