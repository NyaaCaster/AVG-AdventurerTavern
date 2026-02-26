# 快速修复指南

## 🚨 如果构建失败，立即执行以下步骤：

### 步骤 1: 修复编码问题

```bash
# 自动检测并修复所有编码问题
npm run fix-encoding
```

### 步骤 2: 配置 Git（首次设置）

```bash
# Windows (PowerShell)
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf false

# Linux/Mac (Bash)
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf false
```

### 步骤 3: 启用 Git Hooks

```bash
# 设置 hooks 路径
git config core.hooksPath .githooks

# Linux/Mac: 添加执行权限
chmod +x .githooks/pre-commit
chmod +x scripts/pre-push-check.sh
```

### 步骤 4: 重新规范化文件

```bash
# 重新规范化所有文件
git add --renormalize .

# 提交更改
git commit -m "fix: 修复文件编码问题"
```

### 步骤 5: 推送并验证

```bash
# 推送到远程仓库
git push

# 检查 GitHub Actions 构建状态
# 访问: https://github.com/你的用户名/AVG-AdventurerTavern/actions
```

## 📋 日常使用

### 提交前检查

```bash
# 方式 1: 自动检查（推荐，已配置 Git hooks）
git commit -m "你的提交信息"
# Git hooks 会自动运行编码检查

# 方式 2: 手动检查
npm run check-encoding
```

### 推送前完整检查

```bash
# 运行完整的推送前检查（编码 + 类型 + 构建）
npm run pre-push

# 如果通过，再推送
git push
```

## 🔧 常用命令

```bash
# 检查编码问题
npm run check-encoding

# 修复编码问题
npm run fix-encoding

# 类型检查
npm run lint

# 本地构建测试
npm run build

# 完整检查
npm run pre-push
```

## ⚠️ 注意事项

1. **首次克隆仓库后**，必须运行步骤 2 和 3
2. **每次提交前**，确保运行 `npm run check-encoding`
3. **推送前**，建议运行 `npm run pre-push` 进行完整检查
4. **如果编辑器自动格式化**，确保配置为 UTF-8 和 LF

## 🆘 仍然失败？

如果按照上述步骤操作后仍然失败：

1. 清除本地 Git 缓存：
   ```bash
   git rm --cached -r .
   git reset --hard
   git add .
   git commit -m "fix: 重新添加文件"
   ```

2. 清除 Docker 缓存：
   ```bash
   docker builder prune -af
   ```

3. 清除 GitHub Actions 缓存：
   - 访问仓库的 Actions 页面
   - 点击 "Caches" 标签
   - 删除所有缓存

4. 查看详细文档：
   - 阅读 `ENCODING-FIX.md` 获取完整说明

## ✅ 验证修复成功

```bash
# 1. 本地构建成功
npm run build
# 应该看到: ✓ built in XXXms

# 2. 检查文件编码
file -i components/GameScene.tsx
# 应该显示: charset=utf-8

# 3. GitHub Actions 构建成功
# 访问 Actions 页面，查看最新的构建状态
```

---

**记住**：编码问题的根源是字符集不一致。只要确保所有文件都是 UTF-8 编码和 LF 行尾符，就不会有问题。
</contents>