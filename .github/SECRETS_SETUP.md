# GitHub Secrets 设置指南

为了让 GitHub Actions 能够安全地使用 SSL 证书，你需要将证书文件内容存储为 GitHub Secrets。

## 设置步骤

### 1. 准备证书文件（在本地执行）

在你的本地仓库目录中，运行以下命令将证书文件转换为 base64 编码：

**Windows PowerShell:**
```powershell
# 转换 SSL 证书文件
[Convert]::ToBase64String([IO.File]::ReadAllBytes("SSL/h.hony-wen.com.key"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("SSL/h.hony-wen.com_bundle.crt"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("SSL/h.hony-wen.com_bundle.pem"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("SSL/h.hony-wen.com.csr"))
```

**Linux/Mac:**
```bash
base64 -w 0 SSL/h.hony-wen.com.key
base64 -w 0 SSL/h.hony-wen.com_bundle.crt
base64 -w 0 SSL/h.hony-wen.com_bundle.pem
base64 -w 0 SSL/h.hony-wen.com.csr
```

### 2. 添加 GitHub Secrets

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 secrets（将上一步生成的 base64 内容粘贴进去）：

| Secret 名称 | 内容 |
|------------|------|
| `SSL_KEY` | h.hony-wen.com.key 的 base64 编码 |
| `SSL_BUNDLE_CRT` | h.hony-wen.com_bundle.crt 的 base64 编码 |
| `SSL_BUNDLE_PEM` | h.hony-wen.com_bundle.pem 的 base64 编码 |
| `SSL_CSR` | h.hony-wen.com.csr 的 base64 编码 |

### 3. 从 Git 历史中移除证书文件

⚠️ **重要：** 由于证书文件已经被提交到 Git 历史中，你需要清理历史记录：

```bash
# 从 Git 历史中移除 SSL 目录
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch SSL/" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送到远程仓库（会重写历史）
git push origin --force --all
git push origin --force --tags
```

### 4. 重新生成证书（推荐）

由于旧证书已经暴露在 Git 历史中，建议重新生成新的 SSL 证书并更新 GitHub Secrets。

## 验证

设置完成后，推送代码到 GitHub，GitHub Actions 会自动运行并使用存储的证书文件进行构建。

你可以在仓库的 **Actions** 标签页查看工作流运行状态。

## 安全提示

- ✅ 证书文件现在存储在 GitHub Secrets 中，不会出现在代码仓库中
- ✅ GitHub Secrets 是加密存储的，只有有权限的人才能访问
- ✅ 在 Actions 日志中，secret 值会被自动屏蔽显示为 `***`
- ⚠️ 定期更新证书并更新对应的 Secrets
"