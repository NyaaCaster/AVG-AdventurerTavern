# 修复检查清单

在推送代码前，请确保完成以下所有步骤：

## ✅ 初始设置（首次执行）

- [ ] 运行 `npm run fix-encoding` 修复现有文件
- [ ] 配置 Git：
  ```bash
  git config --global core.autocrlf false
  git config --global core.eol lf
  git config --global core.safecrlf false
  ```
- [ ] 启用 Git hooks：
  ```bash
  git config core.hooksPath .githooks
  chmod +x .githooks/pre-commit  # Linux/Mac only
  chmod +x scripts/pre-push-check.sh  # Linux/Mac only
  ```
- [ ] 重新规范化文件：
  ```bash
  git add --renormalize .
  ```

## ✅ 提交前检查

- [ ] 运行 `npm run check-encoding` 确认无编码问题
- [ ] 运行 `npm run lint` 确认无类型错误
- [ ] 运行 `npm run build` 确认本地构建成功
- [ ] 检查 Git diff，确认更改正确

## ✅ 提交步骤

- [ ] 添加所有更改：`git add .`
- [ ] 提交更改（Git hooks 会自动检查）：
  ```bash
  git commit -m "fix: 修复文件编码问题和构建配置
  
  - 添加 .editorconfig 统一编辑器配置
  - 更新 .gitattributes 强制 UTF-8 和 LF
  - 修复 Dockerfile 编码配置
  - 修复 vite.config.ts 导入语句
  - 添加编码检查和修复工具
  - 添加 Git hooks 防止编码问题
  - 更新 CI/CD 配置
  - 添加详细文档"
  ```

## ✅ 推送前检查

- [ ] 运行 `npm run pre-push` 进行完整检查
- [ ] 确认所有检查通过
- [ ] 推送到远程：`git push`

## ✅ 推送后验证

- [ ] 访问 GitHub Actions 页面
- [ ] 等待构建完成（约 5-10 分钟）
- [ ] 确认构建状态为绿色 ✅
- [ ] 如果失败，查看构建日志并根据错误信息修复

## 📝 快速命令参考

```bash
# 完整流程（复制粘贴执行）
npm run fix-encoding
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.safecrlf false
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
chmod +x scripts/pre-push-check.sh
git add --renormalize .
git add .
git commit -m "fix: 修复文件编码问题和构建配置"
npm run pre-push
git push
```

## 🆘 如果遇到问题

1. 查看 `QUICK-FIX.md` 获取快速解决方案
2. 查看 `ENCODING-FIX.md` 获取详细说明
3. 查看 `BUILD-FIX-SUMMARY.md` 了解所有修改

---

**完成所有步骤后，在此打勾**: ✅
</contents>