# 贡献指南

感谢你对本项目的贡献！为了确保代码质量和构建成功，请遵循以下指南。

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/NyaaCaster/AVG-AdventurerTavern.git
cd AVG-AdventurerTavern
```

### 2. 配置开发环境

```bash
# 安装依赖
npm install

# 配置 Git（重要！）
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf false

# 启用 Git hooks
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit  # Linux/Mac
chmod +x scripts/pre-push-check.sh  # Linux/Mac
```

### 3. 开始开发

```bash
# 启动开发服务器
npm run dev
```

## 📝 开发工作流

### 编码规范

1. **文件编码**：所有文件必须使用 UTF-8 编码
2. **行尾符**：所有文本文件使用 LF（\n）行尾符
3. **缩进**：使用 2 个空格缩进
4. **命名**：
   - 组件：PascalCase（如 `GameScene.tsx`）
   - 函数/变量：camelCase（如 `handleClick`）
   - 常量：UPPER_SNAKE_CASE（如 `MAX_LEVEL`）

### 提交流程

#### 步骤 1: 检查代码

```bash
# 检查编码问题
npm run check-encoding

# 类型检查
npm run lint

# 本地构建测试
npm run build
```

#### 步骤 2: 提交更改

```bash
# 添加文件
git add .

# 提交（Git hooks 会自动检查）
git commit -m "feat: 添加新功能"
```

#### 步骤 3: 推送前检查

```bash
# 完整检查（推荐）
npm run pre-push

# 推送
git push
```

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**：
```bash
git commit -m "feat(dialogue): 添加角色对话系统"
git commit -m "fix(build): 修复 Docker 构建编码问题"
git commit -m "docs: 更新 README 文档"
```

## 🛠️ 可用命令

### 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # TypeScript 类型检查
```

### 质量检查命令

```bash
npm run check-encoding  # 检查文件编码
npm run fix-encoding    # 修复编码问题
npm run pre-push        # 推送前完整检查
```

## 🔧 编辑器配置

### VS Code（推荐）

安装以下扩展：
- EditorConfig for VS Code
- ESLint
- Prettier

在 `.vscode/settings.json` 中添加：
```json
{
  "files.encoding": "utf8",
  "files.eol": "\n",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 其他编辑器

确保配置：
- 文件编码：UTF-8
- 行尾符：LF
- 缩进：2 个空格
- 自动应用 `.editorconfig`

## 🐛 问题排查

### 构建失败

1. **编码问题**
   ```bash
   npm run fix-encoding
   ```

2. **类型错误**
   ```bash
   npm run lint
   ```

3. **依赖问题**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Git 问题

1. **行尾符不一致**
   ```bash
   git config core.autocrlf false
   git add --renormalize .
   git commit -m "fix: 规范化行尾符"
   ```

2. **编码问题**
   ```bash
   npm run fix-encoding
   git add .
   git commit -m "fix: 修复文件编码"
   ```

## 📚 相关文档

- [QUICK-FIX.md](QUICK-FIX.md) - 快速修复指南
- [ENCODING-FIX.md](ENCODING-FIX.md) - 编码问题详解
- [BUILD-FIX-SUMMARY.md](BUILD-FIX-SUMMARY.md) - 构建修复总结
- [CHECKLIST.md](CHECKLIST.md) - 提交检查清单

## 🤝 获取帮助

如果遇到问题：

1. 查看相关文档
2. 搜索已有的 Issues
3. 创建新的 Issue 并提供：
   - 问题描述
   - 复现步骤
   - 错误信息
   - 环境信息（操作系统、Node 版本等）

## ✅ Pull Request 检查清单

提交 PR 前确保：

- [ ] 代码遵循项目规范
- [ ] 通过所有自动化检查
- [ ] 添加必要的测试
- [ ] 更新相关文档
- [ ] 提交信息清晰明确
- [ ] 本地构建成功
- [ ] GitHub Actions 构建通过

---

感谢你的贡献！🎉
</contents>