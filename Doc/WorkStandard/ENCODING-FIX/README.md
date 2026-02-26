# 编码修复文档

本目录包含项目编码问题的修复方案、开发规范和贡献指南。

## 文档列表

| 文件 | 用途 |
|------|------|
| [ENCODING-FIX.md](ENCODING-FIX.md) | 编码问题技术详解、根因分析、完整修复方案 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 开发工作流、编码规范、提交流程、检查清单 |

## 快速导航

**构建失败 / 遇到编码错误** → [ENCODING-FIX.md](ENCODING-FIX.md)

**首次克隆 / 准备提交代码** → [CONTRIBUTING.md](CONTRIBUTING.md)

## 常用命令

```powershell
# 检查编码问题
npm run check-encoding

# 自动修复编码
npm run fix-encoding

# 推送前完整检查（编码 + 类型 + 构建）
npm run pre-push
```

## 相关项目文件

- `.editorconfig` — 编辑器统一配置
- `.gitattributes` — Git 强制 UTF-8 / LF
- `.githooks/pre-commit` — 提交前自动检查
- `scripts/check-encoding.js` — 编码检查脚本
- `scripts/fix-encoding.js` — 编码修复脚本
- `scripts/pre-push-check.ps1` — 推送前检查（Windows）
- `scripts/pre-push-check.sh` — 推送前检查（Linux/Mac）


---

最后更新：2026-02-27
