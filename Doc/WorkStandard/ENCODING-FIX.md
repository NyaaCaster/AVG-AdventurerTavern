# 编码问题修复指南

## 问题描述

GitHub Actions 构建时出现以下错误：

```
ERROR: Unexpected ")"
53 |    onBackToMenu: () =&gt; void;
   |                   ^
```

这是因为 TypeScript 源文件中的箭头函数 `=>` 被错误地编码为 HTML 实体 `=&gt;`。

## 根本原因

1. **Git 配置问题**：不同操作系统的行尾符处理不一致
2. **字符编码问题**：文件在传输过程中被错误编码
3. **Docker 构建环境**：构建环境的字符集配置不正确

## 解决方案

### 1. 本地修复

运行以下命令检查和修复编码问题：

```bash
# 检查编码问题
npm run check-encoding

# 自动修复编码问题
npm run fix-encoding
```

### 2. 配置 Git

确保 Git 配置正确：

```bash
# 禁用自动转换
git config --global core.autocrlf false

# 使用 LF 行尾符
git config --global core.eol lf

# 禁用安全检查
git config --global core.safecrlf false

# 启用 Git hooks
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

### 3. 重新规范化文件

如果问题持续存在，需要重新规范化所有文件：

```bash
# 1. 提交所有更改
git add --renormalize .
git commit -m "Normalize line endings"

# 2. 删除 Git 缓存
git rm --cached -r .

# 3. 重新添加所有文件
git reset --hard

# 4. 重新添加文件
git add .
git commit -m "Re-add files with correct encoding"
```

### 4. 验证修复

```bash
# 本地构建测试
npm run build

# 检查文件编码
file -i components/GameScene.tsx
# 应该显示: charset=utf-8

# 检查行尾符
file components/GameScene.tsx
# 应该显示: ASCII text 或 UTF-8 Unicode text
```

## 已实施的修复

### 1. 文件配置

- ✅ 创建 `.editorconfig` - 统一编辑器配置
- ✅ 更新 `.gitattributes` - 强制使用 UTF-8 和 LF
- ✅ 更新 `Dockerfile` - 添加编码验证和环境变量
- ✅ 修复 `vite.config.ts` - 修复缺失的 `i`

### 2. 自动化脚本

- ✅ `scripts/check-encoding.js` - 检查 HTML 实体
- ✅ `scripts/fix-encoding.js` - 自动修复编码问题
- ✅ `.githooks/pre-commit` - 提交前检查

### 3. CI/CD 配置

- ✅ GitHub Actions 添加 Git 配置步骤
- ✅ Dockerfile 添加文件验证步骤
- ✅ 构建前自动检查编码

## 预防措施

### 开发环境设置

1. **使用 UTF-8 编码**
   - VS Code: 设置 `"files.encoding": "utf8"`
   - 其他编辑器: 确保默认编码为 UTF-8

2. **使用 LF 行尾符**
   - VS Code: 设置 `"files.eol": "\n"`
   - Git: 配置 `core.eol=lf`

3. **启用 EditorConfig**
   - 安装 EditorConfig 插件
   - 项目已包含 `.editorconfig` 文件

### 提交前检查

```bash
# 每次提交前运行
npm run check-encoding

# 或启用 Git hooks（推荐）
git config core.hooksPath .githooks
```

## 常见问题

### Q: 为什么会出现 HTML 实体编码？

A: 可能的原因：
- 复制粘贴时从网页或富文本编辑器复制
- Git 配置不当导致字符转换
- 编辑器自动转换特殊字符
- Windows 和 Linux 系统间的文件传输

### Q: 如何确认文件编码正确？

A: 运行以下命令：

```bash
# Linux/Mac
file -i components/GameScene.tsx

# Windows (PowerShell)
[System.Text.Encoding]::GetEncoding((Get-Content components/GameScene.tsx -Encoding Byte -TotalCount 4))
```

### Q: 构建仍然失败怎么办？

A: 按顺序尝试：

1. 运行 `npm run fix-encoding`
2. 重新规范化 Git 仓库（见上文）
3. 清除 Docker 缓存：`docker builder prune -af`
4. 清除 GitHub Actions 缓存
5. 检查是否有其他文件存在编码问题

## 相关文件

- `.editorconfig` - 编辑器配置
- `.gitattributes` - Git 属性配置
- `.githooks/pre-commit` - 提交前检查钩子
- `scripts/check-encoding.js` - 编码检查脚本
- `scripts/fix-encoding.js` - 编码修复脚本
- `Dockerfile` - 包含编码验证
- `.github/workflows/docker-publish.yml` - CI/CD 配置

## 总结

这个问题的核心是**字符编码一致性**。通过以下措施可以彻底解决：

1. ✅ 统一使用 UTF-8 编码
2. ✅ 统一使用 LF 行尾符
3. ✅ 配置 Git 正确处理文本文件
4. ✅ 添加自动化检查和修复工具
5. ✅ 在 CI/CD 中验证文件编码

按照本指南操作后，应该不会再出现编码相关的构建错误。
</contents>