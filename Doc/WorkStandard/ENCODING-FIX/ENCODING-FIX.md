# 编码问题修复指南

## 问题症状

GitHub Actions 构建时出现：

```
ERROR: Unexpected ")"
53 |    onBackToMenu: () =&gt; void;
   |                   ^
```

TypeScript 源文件中的箭头函数 `=>` 被错误编码为 HTML 实体 `=&gt;`，导致 Vite 构建失败。

## 根本原因

- Windows 与 Linux 行尾符不一致（CRLF vs LF）
- Git `core.autocrlf` 未关闭，文件传输时触发字符转换
- 从网页/富文本编辑器复制代码时引入 HTML 实体

## 已实施的防护措施

| 文件 | 作用 |
|------|------|
| `.editorconfig` | 强制编辑器使用 UTF-8 + LF |
| `.gitattributes` | Git 层面强制 UTF-8 + LF |
| `.githooks/pre-commit` | 提交前自动检查编码 |
| `scripts/check-encoding.js` | 扫描 HTML 实体 |
| `scripts/fix-encoding.js` | 批量修复 HTML 实体 |
| `Dockerfile` | 添加 `LANG=C.UTF-8` 环境变量 |
| `.github/workflows/docker-publish.yml` | CI 中配置 Git 编码参数 |

## 修复流程

### 快速修复（推荐）

```powershell
# 1. 自动修复所有编码问题
npm run fix-encoding

# 2. 提交
git add .
git commit -m "fix: 修复文件编码问题"
git push
```

### 首次环境配置（只需执行一次）

```powershell
# 配置 Git
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf false

# 启用 Git hooks
git config core.hooksPath .githooks

# 重新规范化所有文件
git add --renormalize .
git commit -m "chore: 规范化文件编码"
```

### 问题持续时的完全重置

```powershell
# 清除 Git 缓存并重新添加
git rm --cached -r .
git reset --hard
git add .
git commit -m "fix: 重新添加所有文件"

# 清除 Docker 构建缓存
docker builder prune -af
```

## 验证修复

```powershell
# 本地构建验证
npm run build
# 期望：✓ built in XXXms

# 检查是否还有 HTML 实体
npm run check-encoding
# 期望：No encoding issues found
```

## 常见问题

**Q: 为什么会出现 HTML 实体？**
从网页或富文本编辑器复制代码、Git 配置不当、Windows/Linux 跨平台传输都可能导致。

**Q: GitHub Actions 缓存导致旧问题复现？**
进入仓库 Actions → Caches 页面，删除所有缓存后重新触发构建。

**Q: 如何确认文件编码正确？**
```powershell
# Windows PowerShell
Get-Content components/GameScene.tsx -Encoding Byte -TotalCount 3
# 期望前三字节：239 187 191（UTF-8 BOM）或直接是内容字节
```


---

最后更新：2026-02-27
