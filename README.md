
# 🏰 AdventurerTavern (冒险者酒馆)

**AdventurerTavern** 是一款高保真的视觉小说（Visual Novel）风格的角色扮演游戏框架。它结合了现代 LLM（大语言模型）技术，为玩家提供沉浸式的、动态的异世界酒馆经营与恋爱模拟体验。

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

## 🐳 部署方案 B：基于 Docker (推荐/稳定部署)

如果你希望在服务器上部署，或者想要一个隔离的运行环境，推荐使用 Docker。

### 1. 环境准备
*   安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) 或 Docker Engine (Linux)。
*   安装 Git。

### 2. 获取代码

```bash
git clone https://github.com/NyaaCaster/AVG-AdventurerTavern.git
cd AVG-AdventurerTavern
```

### 3. 构建并启动容器
我们提供了 `docker-compose.yml` 配置，一键启动：

```bash
# 构建镜像并后台运行
docker-compose up -d --build
```

### 4. 访问游戏
Docker 部署默认映射端口为 `3098`。请访问：
👉 **http://localhost:3098**

### 5. 服务管理

*   **停止服务** (保留容器状态):
    ```bash
    docker-compose stop
    ```

*   **启动服务** (启动已存在的容器):
    ```bash
    docker-compose start
    ```

*   **停止并移除容器** (彻底关闭):
    ```bash
    docker-compose down
    ```

*   **查看日志**:
    ```bash
    docker-compose logs -f
    ```

---

## 📂 项目结构简介

*   `components/`: React UI 组件 (场景、对话框、设置菜单等)
*   `data/`: 游戏数据 (角色人设 `characters/`、提示词 `prompts/`、日程表 `schedules.ts`)
*   `services/`: LLM 通信服务逻辑
*   `types/`: TypeScript 类型定义
*   `img/` & `audio/`: 静态资源占位 (实际逻辑中通过 `utils/imagePath.ts` 解析)

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
