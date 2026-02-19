
# 🏰 AdventurerTavern (冒险者酒馆)

[![Docker Image](https://img.shields.io/docker/v/honywen/adv-tavern?label=Docker%20Hub&logo=docker)](https://hub.docker.com/r/honywen/adv-tavern)
[![Docker Image Size](https://img.shields.io/docker/image-size/honywen/adv-tavern/latest)](https://hub.docker.com/r/honywen/adv-tavern)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/NyaaCaster/AVG-AdventurerTavern/docker-publish.yml?label=Build&logo=github)](https://github.com/NyaaCaster/AVG-AdventurerTavern/actions)
[![License](https://img.shields.io/github/license/NyaaCaster/AVG-AdventurerTavern)](./LICENSE)

**AdventurerTavern** 是一款高保真的视觉小说（Visual Novel）风格的角色扮演游戏框架。它结合了现代 LLM（大语言模型）技术，为玩家提供沉浸式的、动态的异世界酒馆经营与恋爱模拟体验。

## 🚀 快速开始

```bash
# 使用 Docker（推荐）
docker run -d -p 3098:80 -p 3097:3097 honywen/adv-tavern:latest

# 访问游戏（HTTP）
http://localhost:3098
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

### 方式 1：使用 Docker Hub 镜像（推荐）

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
Docker 部署默认映射端口：
- **3098**: HTTP 前端访问端口
- **3097**: 后端 API 服务端口（容器内部使用 HTTPS）

请访问：
👉 **http://localhost:3098**

#### 4. 更新到最新版本

```bash
# 拉取最新镜像并重启
docker-compose pull
docker-compose up -d
```

### 方式 2：从源码构建（开发者）

如果你需要修改代码或本地开发：

```bash
# 克隆代码
git clone https://github.com/NyaaCaster/AVG-AdventurerTavern.git
cd AVG-AdventurerTavern

# 使用本地构建配置
docker-compose -f docker-compose.local.yml up -d --build
```

### 服务管理命令

*   **停止服务**:
    ```bash
    docker-compose stop
    ```

*   **启动服务**:
    ```bash
    docker-compose start
    ```

*   **重启服务**:
    ```bash
    docker-compose restart
    ```

*   **停止并移除容器**:
    ```bash
    docker-compose down
    ```

*   **查看日志**:
    ```bash
    docker-compose logs -f
    ```

*   **查看容器状态**:
    ```bash
    docker-compose ps
    ```

---

## 🐋 Docker Hub

本项目的 Docker 镜像托管在 Docker Hub 上，通过 GitHub Actions 自动构建和发布。

*   **镜像地址**: [honywen/adv-tavern](https://hub.docker.com/r/honywen/adv-tavern)
*   **可用标签**:
    *   `latest` - 主分支最新稳定版本
    *   `dev` - 开发版本
    *   `vX.X.X` - 特定版本号

### 直接使用 Docker 运行

```bash
# 拉取镜像
docker pull honywen/adv-tavern:latest

# 运行容器
docker run -d \
  --name adventurertavern \
  -p 3098:80 \
  -p 3097:3097 \
  --restart unless-stopped \
  honywen/adv-tavern:latest
```

### CI/CD 自动化

本项目使用 GitHub Actions 实现自动化构建和部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发构建
3. 构建 Docker 镜像
4. 推送到 Docker Hub
5. 自动打上 `latest` 和 `dev` 标签

查看构建状态：[GitHub Actions](https://github.com/NyaaCaster/AVG-AdventurerTavern/actions)

#### 🚀 Docker 镜像优化说明

本项目 Dockerfile 经过深度优化，提供更小、更快、更安全的镜像：

**镜像优化**
- ✅ 使用 `nginx:1.27-alpine3.20` 作为基础镜像（更小更安全）
- ✅ 多阶段构建分离前端和后端构建过程
- ✅ 仅保留运行时必需的文件和依赖
- ✅ 移除 supervisor，使用轻量级 shell 脚本管理进程（减少 ~10MB）
- ✅ 清理构建缓存和不必要文件（.md, LICENSE, .map 等）
- ✅ 镜像体积优化至 ~160-170MB

**构建加速**
- ✅ 启用 BuildKit 缓存挂载 (`--mount=type=cache`)
- ✅ npm 依赖缓存复用，重复构建速度提升 50-70%
- ✅ 使用 `--prefer-offline` 加速依赖安装
- ✅ 优化层缓存策略，减少不必要的重建

**安全性提升**
- ✅ 使用最新的 Alpine Linux 3.20
- ✅ 创建专用非特权用户 `nodejs` (UID 1001)
- ✅ 数据库文件存储在数据卷 `/app/data`（持久化且安全）
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
- **镜像名称**: `honywen/adv-tavern:latest`
- **镜像大小**: ~160-170MB (已优化)
- **支持架构**: linux/amd64, linux/arm64
- **基础镜像**: nginx:1.27-alpine3.20 + Node.js 20
- **构建方式**: GitHub Actions 自动构建 (启用 BuildKit)
- **更新频率**: 推送到 main 分支自动更新

### 端口配置
| 端口 | 协议 | 说明 |
|------|------|------|
| **80** | HTTP | 前端访问端口（映射到宿主机 3098） |
| **3097** | HTTPS | 后端 API 服务端口（容器内部使用 HTTPS） |

### 包含组件
| 组件 | 版本 | 说明 |
|------|------|------|
| **前端** | Nginx 1.27 + React 19 | 静态资源服务（HTTP） |
| **后端** | Node.js 20 + Express | API 服务（端口 3097） |
| **数据库** | SQLite 3 | 轻量级数据存储 |
| **进程管理** | Shell Script | 轻量级进程管理 |
| **基础系统** | Alpine Linux 3.20 | 最小化 Linux 发行版 |

### 功能特性
- ✅ 用户注册和登录
- ✅ 云存档（跨设备同步）
- ✅ 数据持久化（需要数据卷）
- ✅ 健康检查（使用 wget）
- ✅ 自动重启
- ✅ 多阶段构建优化
- ✅ BuildKit 缓存加速
- ✅ 非特权用户运行（安全性提升）

### 资源要求
- **CPU**: 0.5-1.0 核心
- **内存**: 256-512MB (优化后内存占用更低)
- **磁盘**: 镜像 ~170MB + 数据库文件（通常 < 100MB）
- **网络**: 需要访问 LLM API 服务

---

## 📂 项目结构简介

*   `components/`: React UI 组件 (场景、对话框、设置菜单等)
*   `data/`: 游戏数据 (角色人设 `characters/`、提示词 `prompts/`、日程表 `schedules.ts`)
*   `services/`: LLM 通信服务逻辑
*   `types/`: TypeScript 类型定义
*   `utils/`: 工具函数 (图片路径解析、场景工具等)
*   `.github/workflows/`: GitHub Actions CI/CD 配置
*   `Dockerfile`: Docker 镜像构建配置
*   `docker-compose.yml`: Docker Compose 部署配置

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

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📊 项目状态

*   **开发状态**: 活跃开发中
*   **Docker 镜像**: 自动构建和发布
*   **镜像大小**: ~160-170MB (已优化)
*   **支持架构**: linux/amd64, linux/arm64
*   **基础镜像**: nginx:1.27-alpine3.20 + Node.js 20
*   **构建工具**: Docker BuildKit + 多阶段构建
*   **安全扫描**: Trivy (GitHub Actions)
*   **部署方式**: Docker / Node.js

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