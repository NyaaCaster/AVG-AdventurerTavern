# AVG-AdventurerTavern (冒险者酒馆)

## 项目概况

AdventurerTavern 是一款高保真视觉小说（Visual Novel）风格的角色扮演游戏框架，结合 LLM 技术提供沉浸式的异世界酒馆经营与恋爱模拟体验。

- 堆栈：Vite + React 19 + TypeScript + Tailwind 4
- 部署：Docker 镜像（`honywen/adv-tavern`），从 Docker Hub 拉取
- 辅助服务：`database-server/` + `file-server/`（各独立管理，含子模块）
- 仓库：https://github.com/NyaaCaster/AVG-AdventurerTavern.git
- 主分支：master
- 访问：HTTP `localhost:3098` / HTTPS `localhost:3096`

## 交流语言

默认始终以**简体中文**与用户交流，除非用户在某次对话中明确要求改用其他语言。

## 重新编译 Docker 镜像并重启容器

本项目 Docker 镜像从 Docker Hub 拉取，本地不构建：

- 仅拉取最新代码 + 最新镜像并重启：`powershell -ExecutionPolicy Bypass -File .\update-and-restart.ps1`（Windows）或 `bash ./update-and-restart.sh`（Linux/macOS）。
- `-ExecutionPolicy Bypass` 参数在 Windows 下**必须**带上。
- 数据库服务和文件服务器独立管理，分别通过各自目录下的 `rebuild-and-restart.ps1` 操作。
- 仅改 `.env` 不需要重启——但拉取脚本也会顺手处理，不必特意区分。

## Git 提交与推送

每当用户明确要求提交/推送，使用 `commit-push` skill 完成。要点：

- **未经用户明确请求，绝不自动 commit / push**。
- 提交信息使用 **Conventional Commits**（英文，小写起首）；**不**附加 `Co-Authored-By` 行。
- 始终用 `git add <file>` 明确指定文件，**禁止** `git add -A` / `git add .`。
- `.env`（含 API 密钥）、`.claude/settings.local.json` **绝不入库**——已在 `.gitignore` 中排除，但提交前仍要肉眼复核 `git status` 输出。
- 严禁：force push、`--amend` 已推送的 commit、`--no-verify`、修改 `git config`、`reset --hard` 等高破坏性操作（除非用户显式同意）。
- 注意子模块 (`file-server`) 和独立服务 (`database-server`) 的改动需分别提交。

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # Vite 开发服务器
npm run build      # 生产构建
npm run lint       # TypeScript 类型检查（无 emit）
npm run test       # Vitest 测试
```

## Vibo Coding 工作规范

> 本项目为存量项目，适用"**部分适用**"级别——跳过初始设计和审核阶段，从当前 P 阶段续接。

### 版本与阶段（V + P）

- **V（闭环版本）**：一个对外可用、功能闭环的版本。
- **P（功能模块阶段）**：一个 V 内部按功能模块拆分的最小交付单元，每个 P 必须**可独立验证、可独立提交**。

### Plan 模式开发

所有 P 阶段的实现工作在 **plan 模式**下进行：
1. 针对当前 P 阶段用 `EnterPlanMode` 进入 plan 模式
2. 明确本 P 的实现方案、涉及文件、验证步骤
3. 用户批准 plan 后执行实现
4. 完成验证

### P 阶段收尾（每 P 必做）

每个 P 阶段完成后，**必须**执行：

1. **Git 提交与推送** — 通过 `commit-push` skill，提交前必须做 `git status` 和 secret 检查
2. **更新或创建交接文档** — 落于 `.docs/阶段交接-XXX.md`，使用以下结构：
   - 交接目的 + 必读文档列表
   - 当前进度（本 P 完成了什么）
   - 本轮已修复/已实现（按文件列出）
   - 仍需验证/已知问题
   - **续接提示词**（可直接粘贴给新对话的提示词，约 10-20 行，含必读文档、当前进度、下一步行动、关键约束）
3. **更新 Memory** — 关键节点写入 memory 跟踪进度

### 跨对话接续

新对话继续开发时：读取本 CLAUDE.md → 读取最新交接文档 → 根据"续接提示词"确定下一步 → plan 模式进入。
