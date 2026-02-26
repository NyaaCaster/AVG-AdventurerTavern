# Git Hooks

此目录包含用于确保代码质量的 Git hooks。

## 设置方法

要启用这些 hooks，请运行：

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Hooks 说明

### pre-commit

在提交前检查源文件中是否存在 HTML 实体编码。这可以防止导致构建失败的编码问题。
</contents>