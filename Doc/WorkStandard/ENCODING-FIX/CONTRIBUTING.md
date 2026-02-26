# 贡献指南

## 首次环境配置

```powershell
# 克隆并安装依赖
git clone https://github.com/NyaaCaster/AVG-AdventurerTavern.git
cd AVG-AdventurerTavern
npm install

# 配置 Git 编码（必须）
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf false

# 启用 Git hooks
git config core.hooksPath .githooks
```

Linux/Mac 额外执行：
```bash
chmod +x .githooks/pre-commit
chmod +x scripts/pre-push-check.sh
```

## 日常开发工作流

```powershell
npm run dev       # 启动开发服务器（http://localhost:3000）
npm run build     # 本地构建验证
npm run lint      # TypeScript 类型检查
```

## 提交流程

```powershell
# 1. 检查编码（Git hook 会自动执行，也可手动）
npm run check-encoding

# 2. 提交（hook 自动拦截编码问题）
git add .
git commit -m "feat: 你的提交信息"

# 3. 推送前完整检查（编码 + 类型 + 构建）
npm run pre-push
git push
```

## 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

| 类型 | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `refactor` | 重构 |
| `chore` | 构建/工具相关 |

示例：`git commit -m "feat(dialogue): 添加角色对话系统"`

## 编码规范

- 文件编码：UTF-8，行尾符：LF
- 缩进：2 个空格
- 组件命名：PascalCase（`GameScene.tsx`）
- 函数/变量：camelCase（`handleClick`）
- 常量：UPPER_SNAKE_CASE（`MAX_LEVEL`）

## VS Code 配置

安装 EditorConfig 插件，在 `.vscode/settings.json` 中添加：

```json
{
  "files.encoding": "utf8",
  "files.eol": "\n",
  "editor.formatOnSave": true
}
```

## 提交前检查清单

- [ ] `npm run check-encoding` 无报错
- [ ] `npm run lint` 无类型错误
- [ ] `npm run build` 本地构建成功
- [ ] 提交信息符合规范
- [ ] GitHub Actions 构建通过

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| 编码错误 / HTML 实体 | `npm run fix-encoding` |
| 类型错误 | `npm run lint` 查看详情 |
| 依赖问题 | 删除 `node_modules` 后重新 `npm install` |
| 行尾符不一致 | `git add --renormalize .` 后提交 |
| 构建仍失败 | 参考 [ENCODING-FIX.md](ENCODING-FIX.md) 完全重置流程 |


---

最后更新：2026-02-27
