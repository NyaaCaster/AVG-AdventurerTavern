---
name: rebuild
description: Rebuild the AVG-AdventurerTavern Docker image and push to NyaaDockerHUB private registry. Use this whenever the project needs a Docker rebuild (e.g., after Dockerfile, docker-compose.yml, vite.config.ts, config.ts, or any source change that affects the bundled frontend image). Runs rebuild.py which builds, tags, pushes to private registry, and cleans old tags.
---

# rebuild

本项目需要重新编译 Docker 镜像并推送到 NyaaDockerHUB 时调用此 skill。

## 触发场景

- 用户明确要求"重新编译"、"重建镜像"、"rebuild"。
- 改动了 `Dockerfile`、`docker-compose.yml`、`nginx.conf`、`.dockerignore` 等容器构建相关文件。
- 改动了 `vite.config.ts` / `config.ts` / `src/**` / `package.json` 等会影响镜像内构建产物的源码 / 配置。
- 通过 `/rebuild` 显式调用。

## 执行

**统一使用 Python 脚本**（跨平台，无执行策略问题）：

```bash
python rebuild.py
```

如需全量重建（跳过层缓存）：
```bash
python rebuild.py --no-cache
```

仅本地构建不推送（离线/调试）：
```bash
python rebuild.py --skip-push
```

## 脚本流程

1. 读取 `.env` 获取 `PRIVATE_DOCKER_REGISTRY_HOST` 和 `URL`
2. `git rev-parse --short=7 HEAD` 获取版本标签
3. Registry 健康检查（`/v2/`）
4. `docker build` 双标签：`<registry>/avg-adventurer-tavern:<sha>` + `:latest`
5. `docker push` 双标签（各重试 3 次，间隔 2 秒）
6. Registry HTTP API 清理旧 tag（仅保留当前 SHA 和 latest）
7. 本地清理旧标签 + 悬空镜像
8. 所有输出中仓库地址掩码为 `<PRIVATE_REGISTRY>`

## rebuild 后推送 .env 到 macmini

镜像构建推送到私有仓库后，**必须**将 `.env` 同步到 macmini 并重启容器，确保运行时环境变量与本机一致：

```bash
scp .env U-MacMini-1:/root/DockerContainer/AVG-AdventurerTavern/.env && ssh U-MacMini-1 "export PATH=\$PATH:/snap/bin && cd /root/DockerContainer/AVG-AdventurerTavern && python3 restart.py"
```

### .env 变更强制推送规则

**只要 `.env` 中发生了影响 macmini 发布侧运行时行为的变更（如 `AVG_DATABASE_API_URL`、`PRIVATE_DOCKER_REGISTRY_*` 等容器内通过 `env_file` / Vite `define` / `process.env` 读取的变量），即使本次不需要 rebuild，也必须单独推送 `.env` 并重启 macmini 容器：**

```bash
scp .env U-MacMini-1:/root/DockerContainer/AVG-AdventurerTavern/.env && ssh U-MacMini-1 "export PATH=\$PATH:/snap/bin && cd /root/DockerContainer/AVG-AdventurerTavern && python3 restart.py"
```

> `AVG_DATABASE_API_URL` 等 Vite `define` 变量是 build-time 注入，值已随镜像走；但**.env 默认一律推送**，避免遗漏 runtime 变更。

## 关于缓存策略

脚本默认走 Docker 的层缓存（不带 `--no-cache`）。

什么时候确实需要全量重建：
- 怀疑 base image 自身有脏状态（很少见）。
- 改了 npm 镜像源 / 私有 registry 配置，担心旧缓存层里残留旧凭据。
- 排查"为什么改了 X 镜像里没生效"——先确认 Dockerfile 里这一层应该被 invalidate，再考虑 `--no-cache`。

需要时用 `python rebuild.py --no-cache`。

## 不要做的事

- 不要绕过脚本直接调用 `docker compose build`/`up`/`down`——使用脚本能保证流程一致。
- 不要随手 `docker system prune -a` —— 脚本里只清理 dangling 镜像，足够且安全。
- 不要将 registry 地址硬编码在任何文件中——始终从 `.env` 读取。
