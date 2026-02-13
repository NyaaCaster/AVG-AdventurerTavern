# Docker 部署指南

本项目使用 GitHub Actions 自动构建 Docker 镜像并推送到 Docker Hub。

## 📦 Docker Hub 镜像

- **镜像地址**: `honywen/adv-tavern`
- **标签**:
  - `latest` - 主分支最新版本
  - `dev` - 开发版本
  - `vX.X.X` - 版本号标签

## 🚀 快速部署

### 方法 1：使用 Docker Compose（推荐）

```bash
# 拉取最新镜像并启动
docker-compose pull
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方法 2：直接使用 Docker

```bash
# 拉取镜像
docker pull honywen/adv-tavern:latest

# 运行容器
docker run -d \
  --name adventurertavern \
  -p 3098:80 \
  --restart unless-stopped \
  -e TZ=Asia/Shanghai \
  honywen/adv-tavern:latest

# 查看日志
docker logs -f adventurertavern

# 停止容器
docker stop adventurertavern
docker rm adventurertavern
```

## 🔄 更新镜像

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d

# 或者一键更新
docker-compose pull && docker-compose up -d
```

## 📋 配置文件说明

### docker-compose.yml
- **用途**: 生产环境部署，从 Docker Hub 拉取镜像
- **镜像源**: `honywen/adv-tavern:latest`
- **端口**: 3098:80

### docker-compose.local.yml（备份）
- **用途**: 本地开发，从源码构建镜像
- **构建**: 使用本地 Dockerfile
- **注意**: 此文件已加入 `.gitignore`，不会提交到仓库

## 🛠️ 本地开发

如果需要本地构建和测试：

```bash
# 使用本地构建配置
docker-compose -f docker-compose.local.yml up -d --build

# 或者直接构建
docker build -t adventurertavern:local .
docker run -d -p 3098:80 adventurertavern:local
```

## 🌐 访问应用

部署成功后，访问：
- **应用地址**: http://localhost:3098
- **健康检查**: http://localhost:3098/health

## 📊 资源配置

- **CPU 限制**: 1 核心
- **内存限制**: 256MB
- **内存预留**: 128MB
- **健康检查**: 每 30 秒检查一次
- **日志轮转**: 最大 10MB，保留 3 个文件

## 🔧 故障排查

### 容器无法启动

```bash
# 查看容器状态
docker ps -a

# 查看详细日志
docker logs adventurertavern

# 检查健康状态
docker inspect --format='{{.State.Health.Status}}' adventurertavern
```

### 端口冲突

如果端口 3098 被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3099:80"  # 改为其他端口
```

### 镜像拉取失败

```bash
# 手动拉取镜像
docker pull honywen/adv-tavern:latest

# 如果网络问题，可以使用代理
docker pull honywen/adv-tavern:latest --platform linux/amd64
```

## 🔐 安全建议

1. 定期更新镜像：`docker-compose pull && docker-compose up -d`
2. 监控容器日志：`docker-compose logs -f`
3. 检查资源使用：`docker stats adventurertavern`
4. 定期清理未使用的镜像：`docker image prune -a`

## 📝 CI/CD 流程

1. 推送代码到 GitHub
2. GitHub Actions 自动触发构建
3. 构建 Docker 镜像
4. 推送到 Docker Hub
5. 在服务器上执行 `docker-compose pull && docker-compose up -d` 更新

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/NyaaCaster/AVG-AdventurerTavern
- **Docker Hub**: https://hub.docker.com/r/honywen/adv-tavern
- **GitHub Actions**: https://github.com/NyaaCaster/AVG-AdventurerTavern/actions
</contents>