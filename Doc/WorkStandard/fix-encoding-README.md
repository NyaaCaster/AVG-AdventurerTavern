# 编码修复文档索引

本目录包含项目的编码问题修复、开发规范和贡献指南。

## 📚 文档列表

### 1. [QUICK-FIX.md](QUICK-FIX.md)
**快速修复指南**

- 🎯 用途：遇到构建错误时的快速解决方案
- 👥 适用人群：所有开发者
- ⏱️ 阅读时间：5 分钟
- 📋 内容：
  - 5 步快速修复流程
  - 日常使用命令
  - 常见问题解答
  - 故障排除步骤

### 2. [ENCODING-FIX.md](ENCODING-FIX.md)
**编码问题详解**

- 🎯 用途：深入理解和解决文件编码问题
- 👥 适用人群：遇到编码问题的开发者
- ⏱️ 阅读时间：10 分钟
- 📋 内容：
  - 问题根本原因分析
  - 详细解决方案
  - 预防措施
  - Git 配置说明
  - 常见问题解答

### 3. [BUILD-FIX-SUMMARY.md](BUILD-FIX-SUMMARY.md)
**构建修复总结**

- 🎯 用途：了解所有已实施的修复措施
- 👥 适用人群：项目维护者、新加入的开发者
- ⏱️ 阅读时间：15 分钟
- 📋 内容：
  - 问题诊断
  - 已实施的修复清单
  - 下一步操作指南
  - 日常工作流程
  - 故障排除

### 4. [CONTRIBUTING.md](CONTRIBUTING.md)
**贡献指南**

- 🎯 用途：规范开发流程和代码提交
- 👥 适用人群：所有贡献者
- ⏱️ 阅读时间：10 分钟
- 📋 内容：
  - 快速开始指南
  - 开发工作流
  - 编码规范
  - 提交信息规范
  - 编辑器配置
  - 问题排查

## 🚀 快速导航

### 我是新手，刚克隆了仓库
👉 阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 的「快速开始」部分

### 构建失败了，需要快速修复
👉 阅读 [QUICK-FIX.md](QUICK-FIX.md)

### 遇到编码相关的错误
👉 阅读 [ENCODING-FIX.md](ENCODING-FIX.md)

### 想了解项目做了哪些修复
👉 阅读 [BUILD-FIX-SUMMARY.md](BUILD-FIX-SUMMARY.md)

### 准备提交代码
👉 阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 的「提交流程」部分

## 📖 推荐阅读顺序

### 对于新开发者

1. **第一次设置**：[CONTRIBUTING.md](CONTRIBUTING.md) → 快速开始
2. **遇到问题**：[QUICK-FIX.md](QUICK-FIX.md)
3. **深入了解**：[ENCODING-FIX.md](ENCODING-FIX.md)
4. **全面掌握**：[BUILD-FIX-SUMMARY.md](BUILD-FIX-SUMMARY.md)

### 对于项目维护者

1. [BUILD-FIX-SUMMARY.md](BUILD-FIX-SUMMARY.md) - 了解所有修复
2. [ENCODING-FIX.md](ENCODING-FIX.md) - 深入技术细节
3. [CONTRIBUTING.md](CONTRIBUTING.md) - 规范团队协作
4. [QUICK-FIX.md](QUICK-FIX.md) - 快速参考

## 🔗 相关资源

### 项目根目录文件

- `CHECKLIST.md` - 提交前检查清单
- `.editorconfig` - 编辑器配置
- `.gitattributes` - Git 属性配置
- `.githooks/` - Git hooks 脚本
- `scripts/` - 自动化工具脚本

### 自动化工具

```bash
# 检查编码
npm run check-encoding

# 修复编码
npm run fix-encoding

# 推送前检查
npm run pre-push
```

## 💡 最佳实践

1. **首次克隆后**：立即执行 [CONTRIBUTING.md](CONTRIBUTING.md) 中的配置步骤
2. **每次提交前**：运行 `npm run check-encoding`
3. **推送前**：运行 `npm run pre-push` 进行完整检查
4. **遇到问题**：先查看 [QUICK-FIX.md](QUICK-FIX.md)
5. **定期更新**：关注文档更新，了解最新规范

## 🆘 获取帮助

如果文档无法解决你的问题：

1. 搜索项目 Issues
2. 查看 GitHub Actions 构建日志
3. 创建新的 Issue 并附上：
   - 问题描述
   - 错误信息
   - 已尝试的解决方案
   - 环境信息

## 📝 文档维护

- **最后更新**：2026-02-26
- **维护者**：项目团队
- **更新频率**：根据项目需求

---

**提示**：建议将本目录加入浏览器书签，方便快速查阅。
</contents>