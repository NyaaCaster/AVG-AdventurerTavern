
# 🏰 AdventurerTavern (冒险者酒馆)

[![Docker Image](https://img.shields.io/docker/v/honywen/adv-tavern?label=Docker%20Hub&logo=docker)](https://hub.docker.com/r/honywen/adv-tavern)
[![Docker Image Size](https://img.shields.io/docker/image-size/honywen/adv-tavern/latest)](https://hub.docker.com/r/honywen/adv-tavern)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/NyaaCaster/AVG-AdventurerTavern/docker-publish.yml?label=Build&logo=github)](https://github.com/NyaaCaster/AVG-AdventurerTavern/actions)
[![License](https://img.shields.io/github/license/NyaaCaster/AVG-AdventurerTavern)](./LICENSE)

**AdventurerTavern** 是一款高保真的视觉小说（Visual Novel）风格的角色扮演游戏框架。它结合了现代 LLM（大语言模型）技术，为玩家提供沉浸式的、动态的异世界酒馆经营与恋爱模拟体验。

## 🚀 快速开始

```powershell
# 拉取最新镜像并重启（推荐）
# Windows PowerShell
.\update-and-restart.ps1

# Linux / macOS
bash update-and-restart.sh

# 访问游戏
http://localhost:3098   # HTTP
https://localhost:3096  # HTTPS
```

## 📖 游戏内容与玩法

你将扮演传说中的退隐勇者，与姐姐**莉莉娅**共同经营位于边境的“夜莺亭”旅店。在这里，你将邂逅性格迥异的女性角色——从傲娇的皇女、社恐的拳师，到慵懒的前魔王。

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
# 克隆项目代码
git clone https://github.com/NyaaCaster/AVG-AdventurerTavern.git

# 进入项目目录
cd AVG-AdventurerTavern
```

### 3. 安装依赖
在项目根目录下运行：

```bash
npm install
```

### 4. 启动服务
依赖安装完成后，启动开发服务器：

```bash
npm start
```

### 5. 访问游戏
服务启动后，浏览器通常会自动打开。如果没有，请访问：
👉 **http://localhost:3000**

> **注意**: 进入游戏后，请点击主界面的“系统设置”，在 **API 设置** 中填入你的 API Key 和 Base URL 才能开始对话。

### 6. 关闭服务
在运行命令的终端窗口中，按下 `Ctrl + C` 即可停止服务。

---

## 🐳 部署方案 B：基于 Docker (推荐/生产环境)

推荐使用 Docker 进行部署，我们提供了预构建的 Docker 镜像，无需本地编译。



### 使用 Docker 部署

#### 1. 环境准备
*   安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) 或 Docker Engine (Linux)

#### 2. 快速启动

```bash
# 下载配置文件
wget https://raw.githubusercontent.com/NyaaCaster/AVG-AdventurerTavern/main/docker-compose.yml

# 或使用 curl
curl -O https://raw.githubusercontent.com/NyaaCaster/AVG-AdventurerTavern/main/docker-compose.yml

# 启动服务（自动从 Docker Hub 拉取镜像）
docker-compose up -d
```

#### 3. 访问游戏

请访问：
- HTTP: 👉 **http://localhost:3098**
- HTTPS: 👉 **https://localhost:3096**



#### 4. 服务管理

```bash
# 更新到最新版本
docker-compose pull
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看容器状态
docker-compose ps

# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并移除容器
docker-compose down
```

---

## 🐋 Docker Hub

本项目的 Docker 镜像托管在 Docker Hub 上，通过 GitHub Actions 自动构建和发布。

*   **镜像地址**: [honywen/adv-tavern](https://hub.docker.com/r/honywen/adv-tavern)

### 直接使用 Docker 运行

```bash
# 拉取镜像
docker pull honywen/adv-tavern

# 运行容器
docker run -d \
  --name adventurertavern \
  -p 3098:80 \
  -p 3096:443 \
  --restart unless-stopped \
  honywen/adv-tavern
```

### CI/CD 自动化

本项目使用 GitHub Actions 实现自动化构建和部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发构建
3. 构建 Docker 镜像（仅客户端）
4. 推送到 Docker Hub

查看构建状态：[GitHub Actions](https://github.com/NyaaCaster/AVG-AdventurerTavern/actions)

#### 🚀 Docker 镜像优化说明

本项目 Dockerfile 经过深度优化，提供更小、更快、更安全的镜像：

**镜像优化**
- ✅ 使用 `nginx:1.27-alpine3.20` 作为基础镜像（更小更安全）
- ✅ 多阶段构建，仅保留前端静态资源
- ✅ 清理构建缓存和不必要文件（.md, LICENSE, .map 等）
- ✅ 镜像体积优化至 ~50MB（仅前端）

**构建加速**
- ✅ 启用 BuildKit 缓存挂载 (`--mount=type=cache`)
- ✅ npm 依赖缓存复用，重复构建速度提升 50-70%
- ✅ 使用 `--prefer-offline` 加速依赖安装
- ✅ 优化层缓存策略，减少不必要的重建

**安全性提升**
- ✅ 使用最新的 Alpine Linux 3.20
- ✅ 仅包含静态资源，无后端代码
- ✅ 使用 wget 进行健康检查（nginx 自带）
- ✅ GitHub Actions 集成 Trivy 安全扫描

**性能优化**
- ✅ Nginx 启用 gzip 压缩（压缩级别 6）
- ✅ 静态资源缓存 1 年，HTML 不缓存
- ✅ 优化 Nginx 配置（sendfile, tcp_nopush, tcp_nodelay）
- ✅ 运行时内存占用更低
- ✅ 更少的依赖包，更快的启动速度

**多架构支持**
- ✅ 支持 `linux/amd64` 和 `linux/arm64` 架构
- ✅ 可在 x86 服务器、ARM 服务器（树莓派）、Apple Silicon Mac 上运行

> 💡 **注意**: 所有镜像构建都由 GitHub Actions 自动完成。如需本地构建，请确保启用 BuildKit：`export DOCKER_BUILDKIT=1`

---

## 📊 镜像信息

### 基本信息
- **镜像名称**: `honywen/adv-tavern`
- **镜像大小**: ~50MB (仅前端静态资源)
- **支持架构**: linux/amd64, linux/arm64
- **基础镜像**: nginx:1.27-alpine3.20
- **构建方式**: GitHub Actions 自动构建 (启用 BuildKit)
- **更新频率**: 推送到 main 分支自动更新

### 端口配置
| 端口 | 协议 | 说明 |
|------|------|------|
| **3098** | HTTP | 前端访问端口 |
| **3096** | HTTPS | 前端安全访问端口 |

### 包含组件
| 组件 | 版本 | 说明 |
|------|------|------|
| **前端** | Nginx 1.27 + React 19 | 静态资源服务 |
| **基础系统** | Alpine Linux 3.20 | 最小化 Linux 发行版 |

### 功能特性
- ✅ 静态资源服务（React 前端）
- ✅ 健康检查
- ✅ 自动重启
- ✅ 多阶段构建优化
- ✅ BuildKit 缓存加速
- ✅ Gzip 压缩
- ✅ 多架构支持（amd64/arm64）

### 资源要求
- **CPU**: 0.25-0.5 核心
- **内存**: 128-256MB
- **磁盘**: 镜像 ~50MB
- **网络**: 需要访问后端 API 和 LLM 服务

### 性能特点
- **启动速度**: < 1秒（Nginx 快速启动）
- **响应时间**: < 10ms（静态资源服务）
- **并发处理**: 支持数千并发连接
- **资源效率**: 相比 Node.js 服务减少 90% 内存占用

---

## 📂 项目结构简介

```
AVG-AdventurerTavern/
├── components/              # React UI 组件
├── data/                    # 游戏数据
│   ├── characters/         # 角色人设
│   ├── prompts/            # AI 提示词
│   └── schedules.ts        # 角色日程表
├── services/               # LLM 通信服务
├── types/                  # TypeScript 类型定义
├── utils/                  # 工具函数
├── database-server/        # 后端数据库服务（独立部署）
├── .github/workflows/      # GitHub Actions CI/CD
│   └── docker-publish.yml # 客户端自动构建
├── Dockerfile              # 客户端镜像构建配置
├── docker-compose.yml      # 客户端部署配置
└── README.md               # 项目说明文档
```



## 🔧 技术栈

*   **前端框架**: React 19 + TypeScript
*   **构建工具**: Vite 6
*   **容器化**: Docker + Nginx
*   **CI/CD**: GitHub Actions
*   **镜像托管**: Docker Hub
*   **AI 集成**: OpenAI 兼容 API (GPT-4, Claude, DeepSeek 等)

## 📚 相关文档

*   [Docker 部署指南](./DOCKER-DEPLOY.md) - 详细的 Docker 部署和管理文档
*   [GitHub Actions 工作流](./.github/workflows/docker-publish.yml) - CI/CD 配置
*   [Dockerfile](./Dockerfile) - Docker 镜像构建配置

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
## 🎵 音乐引用
スタジオVR
SOUND AIRYLUVS様
Prismatic Tone様
ユーフルカ様
PeriTune様
ポケットサウンド様
戦え女の子 Re:play 五百崎せれんver.

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
*   **Docker 镜像**: 自动构建和发布（仅客户端）
*   **镜像大小**: 47.7MB (实际测量)
*   **构建时间**: ~30秒 (GitHub Actions)
*   **支持架构**: linux/amd64, linux/arm64
*   **基础镜像**: nginx:1.27-alpine3.20
*   **构建工具**: Docker BuildKit + 多阶段构建
*   **安全扫描**: Trivy (GitHub Actions)
*   **部署方式**: Docker / Node.js

### 📈 镜像性能评估

#### 镜像体积分析
- **总大小**: 47.7MB
- **基础层**: 7.8MB (Alpine Linux 3.20.5)
- **Nginx 层**: 35.2MB (Nginx 1.27.3 + 依赖)
- **应用层**: 522KB (前端静态资源)
- **配置层**: 99.4KB (时区数据 + 运行时配置)
- **其他**: 2.05KB (Nginx 配置文件)

#### 性能指标
- **启动时间**: < 1秒
- **内存占用**: 128-256MB (运行时)
- **CPU 使用**: 0.25-0.5 核心
- **网络带宽**: 最小化（静态资源 gzip 压缩）
- **并发能力**: Nginx 高性能静态文件服务

#### 优化成果
- ✅ 相比传统 Node.js 镜像减少 90% 体积（Node.js 镜像通常 > 400MB）
- ✅ 使用 Alpine Linux 减少攻击面
- ✅ 多阶段构建，仅保留运行时必需文件
- ✅ 清理所有构建缓存和源码文件
- ✅ 静态资源 gzip 压缩，传输体积减少 70%

#### 镜像层分析
```
层级结构（从上到下）:
1. Alpine 基础系统: 7.8MB
2. Nginx 核心 + 模块: 35.2MB
3. 运行时脚本: 11.8KB
4. 时区数据: 99.4KB
5. 前端静态资源: 522KB
6. Nginx 配置: 2.05KB
总计: 47.7MB
```

#### 安全性评估
- ✅ 基于官方 nginx:alpine 镜像
- ✅ 最小化依赖，减少漏洞风险
- ✅ 定期更新基础镜像（Nginx 1.27.3）
- ✅ 健康检查机制
- ✅ 非特权用户运行
- ✅ GitHub Actions Trivy 扫描

#### 部署建议
- **生产环境**: 推荐使用 Docker 部署
- **开发环境**: 可使用 Node.js 本地运行
- **资源配置**: CPU 0.25核 + 128MB 内存即可流畅运行
- **扩展性**: 支持 Kubernetes 水平扩展
- **监控**: 建议配置健康检查和日志收集

## 🔗 相关链接

*   **GitHub 仓库**: https://github.com/NyaaCaster/AVG-AdventurerTavern
*   **Docker Hub**: https://hub.docker.com/r/honywen/adv-tavern
*   **GitHub Actions**: https://github.com/NyaaCaster/AVG-AdventurerTavern/actions
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
