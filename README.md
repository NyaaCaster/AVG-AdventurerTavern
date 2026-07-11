# 🏰 AdventurerTavern (冒险者酒馆)

**AdventurerTavern** 是一款高保真的视觉小说（Visual Novel）风格的角色扮演游戏框架。它结合了现代 LLM（大语言模型）技术，为玩家提供沉浸式的、动态的异世界酒馆经营与恋爱模拟体验。

## 🚀 快速开始

```bash
# 构建镜像并推送到私有仓库，然后重启容器
python rebuild.py

# 仅远端拉取最新镜像并重启（macmini 侧）
python restart.py
```

- HTTP: `http://localhost:3098`
- HTTPS: `https://localhost:3096`

## 📖 游戏内容与玩法

你将扮演传说中的退隐勇者，与姐姐**莉莉娅**共同经营位于边境的"夜莺亭"旅店。在这里，你将邂逅性格迥异的女性角色——从傲娇的皇女、社恐的拳师，到慵懒的前魔王。

### 核心特色

*   **🤖 LLM 深度驱动**: 所有角色的对话均由 AI 实时生成。角色拥有详细的人设（Persona）、记忆和情感逻辑，拒绝千篇一律的剧本。
*   **🕰️ 动态世界系统**: 游戏内置时间系统（日间/傍晚/深夜），角色会根据特定的**日程表**在不同场景（酒馆、客房、温泉等）移动。
*   **❤ 好感度与互动**: 通过深入的对话与日常互动提升角色好感度，解锁更亲密的剧情。
*   **🎨 沉浸式视听**: 精美的动态立绘、随时间变化的场景背景、以及符合氛围的背景音乐。
*   **🔧 高度自定义**: 支持配置 OpenAI 兼容格式的 API（如 GPT-4, Claude, Grok, DeepSeek 等），支持自定义主角姓名与旅店名称。

---

## 🛠️ 部署方案 A：基于 Node.js (开发/本地运行)

如果你想在本地快速运行或修改代码，推荐使用此方式。

### 1. 环境准备
请先下载并安装 [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)。

### 2. 获取代码
打开终端（Terminal）或命令行工具，运行以下命令：

```bash
# 克隆项目代码（包含 submodule）
git clone --recursive https://github.com/NyaaCaster/AVG-AdventurerTavern.git

# 进入项目目录
cd AVG-AdventurerTavern
```

> **💡 关于 `--recursive` 参数**：本项目包含 `file-server` 子模块（文件服务器），使用 `--recursive` 可自动拉取子模块代码。如果已克隆但 `file-server` 目录为空，请运行：
> ```bash
> git submodule update --init --recursive
> ```

### 3. 安装依赖
在项目根目录下运行：

```bash
npm install
```

### 4. 启动服务
依赖安装完成后，启动开发服务器：

```bash
npm run dev
```

### 5. 访问游戏
服务启动后，浏览器通常会自动打开。如果没有，请访问：
👉 **http://localhost:3000**

> **注意**: 进入游戏后，请点击主界面的"系统设置"，在 **API 设置** 中填入你的 API Key 和 Base URL 才能开始对话。

### 6. 关闭服务
在运行命令的窗口中，按下 `Ctrl + C` 即可停止服务。

---

## 🐳 部署方案 B：基于 Docker (生产环境)

项目采用三服务 Docker 架构，镜像通过私有仓库 NyaaDockerHUB 分发，部署目标为内网 macmini 服务器。

### 服务架构

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| **adv-tavern** | `adv-tavern:latest` | 3098 (HTTP) / 3096 (HTTPS) | 前端 Nginx + React 静态资源 |
| **adv-tavern-db** | `adv-tavern-db:latest` | 3097 | Node.js 数据库 API 后端 |
| **adv-file-server** | `adv-file-server:latest` | 5101–5103 | 文件上传服务 (Git Submodule) |

### 构建与部署流程

```
Windows 开发机                     macmini 服务器
─────────────                     ─────────────
python rebuild.py                 python restart.py
  ├─ docker build                   ├─ docker compose pull
  ├─ docker push → 私有仓库 ────────→├─ docker compose down
  └─ docker compose up -d           ├─ docker compose up -d
                                    └─ docker image prune -f
```

### 本地构建与推送

```bash
# 标准构建 + 推送 + 重启
python rebuild.py

# 强制无缓存重建
python rebuild.py --no-cache

# 仅本地构建调试（不推送）
python rebuild.py --skip-push
```

`rebuild.py` 自动完成：读取 `.env` 配置 → `docker build`（BuildKit，注入 build-args 与 SSL 证书）→ 打 `:sha` + `:latest` 标签 → 推送到私有仓库 → 拉取并重启容器 → 清理旧标签与悬空镜像。

### 远端拉取与重启（macmini）

```bash
# 拉取最新镜像并重启
python restart.py

# 跳过拉取，仅用已有镜像重启
python restart.py --no-pull
```

### 环境配置

项目依赖 `.env` 文件注入运行参数（API 密钥、仓库地址等），该文件不入 Git。部署前请确保 `.env` 已正确配置。

### 镜像优化要点

- ✅ 多阶段构建 (`node:20-alpine` → `nginx:1.27-alpine`)，仅保留前端静态资源
- ✅ Nginx gzip 压缩 + 静态资源长缓存
- ✅ 支持 `linux/amd64` 和 `linux/arm64` 多架构
- ✅ BuildKit 缓存挂载加速重复构建

---

## 📂 项目结构

```
AVG-AdventurerTavern/
├── components/              # React UI 组件（含 scenes/、icons/）
├── hooks/                   # React Hooks（状态/对话/战斗/音频/世界/AI记忆）
├── services/                # LLM 通信 + 数据库 + 文件上传服务层
├── data/                    # 游戏数据
│   ├── characters/          # 角色人设
│   ├── prompts/             # AI 提示词 (char_101~111)
│   ├── battle-data/         # 战斗数据
│   └── resources/           # 静态资源
├── battle-system/           # 回合制战斗系统（伤害/治疗/技能/Buff/AI）
├── database-server/         # 后端数据库 API 服务（独立部署）
├── file-server/             # 文件服务器（Git Submodule，独立部署）
├── tests/                   # Vitest 测试套件
├── types.ts                 # TypeScript 类型定义
├── config.ts                # 前端运行配置
├── version.ts               # 版本号
├── Dockerfile               # 多阶段构建配置
├── docker-compose.yml       # 本地 Docker 部署配置
├── docker-compose.publish.yml # macmini 生产部署配置
├── rebuild.py               # 构建 → 推送 → 重启（Windows 端）
├── restart.py               # 拉取 → 重启（macmini 端）
└── nginx.conf               # Nginx 配置（双域名）
```

---

## 🔧 技术栈

*   **前端框架**: React 19 + TypeScript
*   **样式**: Tailwind CSS 4
*   **构建工具**: Vite 6
*   **测试**: Vitest
*   **容器化**: Docker + Nginx (Alpine)
*   **构建脚本**: Python 3（标准库）
*   **文件服务**: [file-server](https://github.com/NyaaCaster/file-server)（独立子模块）
*   **镜像分发**: 私有 Docker Registry (NyaaDockerHUB)
*   **AI 集成**: OpenAI 兼容 API (GPT-4, Claude, DeepSeek 等)

## 📦 子模块

### file-server（文件服务器）

独立的文件上传服务，提供：
- 文件上传/删除/列表 API
- API Key 鉴权
- HTTPS 安全传输
- 多目录分类存储

**项目地址**：https://github.com/NyaaCaster/file-server

---

## 👥 AdvTavern 团队

本项目由以下团队成员倾力打造：

### 核心团队
- **Team Leader / 设计师**: [NyaaCaster](https://github.com/NyaaCaster) (honywen)
- **前端工程师**: Gemini (3.0 Pro Preview)
- **后端工程师**: Claude (Sonnet 4.5)
- **首席团队助理**: Continue

### 创意团队
- **视觉艺术团队**: Comfy & WAI-illustrious-SDXL
- **文学创作团队**: Qwen & Deepseek & You

### 基础设施
- **运维支持团队**: GitHub & Docker Hub
- **人力资源管理**: [QinyAPI](https://love.qinyan.icu/)

### 工作环境
- **团队总部**: Visual Studio Code
- **团队支部**: Google AI Studio

感谢所有团队成员的倾力支持！

---
## 🎵 音乐
*   スタジオVR
*   SOUND AIRYLUVS様
*   Prismatic Tone様
*   ユーフルカ様
*   PeriTune様
*   ポケットサウンド様
*   戦え女の子 Re:play 五百崎せれんver.

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📊 项目状态

*   **开发状态**: 活跃开发中
*   **部署方式**: Docker 三服务架构，内网 macmini 服务器
*   **镜像分发**: 私有 Docker Registry (NyaaDockerHUB)
*   **镜像大小**: ~50MB (前端静态资源)
*   **支持架构**: linux/amd64, linux/arm64
*   **基础镜像**: nginx:1.27-alpine3.20
*   **构建工具**: Docker BuildKit + 多阶段构建

## 🔗 相关链接

*   **GitHub 仓库**: https://github.com/NyaaCaster/AVG-AdventurerTavern
*   **问题反馈**: https://github.com/NyaaCaster/AVG-AdventurerTavern/issues

## 📜 开源许可 (License)

本项目采用 **GNU Affero General Public License v3.0 (AGPL-3.0)** 进行许可。

**⚠️ 重要提示：AGPL-3.0 是一份强 Copyleft 许可证。**

如果您修改了本项目的代码，并通过网络提供服务（例如部署在服务器上供他人访问），根据 AGPL-3.0 协议规定，您**必须**向所有用户公开您的完整源代码。

### 许可摘要

#### ✅ Permissions (权限)
*   **Commercial use**: 允许商业用途。
*   **Modification**: 允许修改代码。
*   **Distribution**: 允许分发副本。
*   **Patent use**: 授予专利使用权。
*   **Private use**: 允许私有使用。

#### ❌ Limitations (限制)
*   **Liability**: 作者不承担责任。
*   **Warranty**: 不提供担保。

#### ℹ️ Conditions (条件)
*   **Disclose source (强制开源)**: 分发软件或通过网络与用户交互时，必须公开源代码。
*   **Network use is distribution**: 通过网络与用户交互也被视为分发，需遵守开源义务。
*   **Same license**: 修改后的版本必须使用相同的许可证发布 (AGPL-3.0)。
*   **License and copyright notice**: 必须保留许可和版权声明。
*   **State changes**: 修改后的文件必须声明变更。
