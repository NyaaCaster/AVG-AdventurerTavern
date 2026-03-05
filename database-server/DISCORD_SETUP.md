# Discord 登录配置指南

## 环境变量配置

在服务器上创建 `database-server/.env` 文件，添加以下配置：

```env
# Discord OAuth 配置
DISCORD_CLIENT_ID=你的客户端ID
DISCORD_CLIENT_SECRET=你的客户端密钥
DISCORD_BOT_TOKEN=你的Bot令牌
DISCORD_GUILD_ID=你的服务器ID
DISCORD_REDIRECT_URI=https://你的域名:3097/auth/discord/callback

# 登录方式配置
ENABLE_PASSWORD_LOGIN=true        # 是否启用账号密码登录
FORCE_DISCORD_BIND=true           # 账号密码登录后是否强制绑定 Discord

# 数据库路径（生产环境）
DB_PATH=/app/data/database.sqlite
```

## 部署步骤

### 1. 在服务器上运行数据库迁移

```bash
cd database-server
node migrate-discord.js
```

### 2. 重启服务

```bash
# 如果使用 Docker
docker-compose down
docker-compose up -d --build

# 如果直接运行
pm2 restart database-server
# 或
npm start
```

## 功能说明

### 登录方式

1. **Discord 登录**（推荐）
   - 新用户通过 Discord 登录自动创建账号
   - 使用 Discord 用户名作为游戏用户名
   - 自动验证是否在指定服务器中

2. **账号密码登录**（可配置关闭）
   - 通过 `ENABLE_PASSWORD_LOGIN=false` 关闭
   - 关闭后只能使用 Discord 登录

### 强制绑定流程

当 `FORCE_DISCORD_BIND=true` 时：
- 用户使用账号密码登录后
- 如果未绑定 Discord，会弹出绑定提示
- 必须完成 Discord 绑定才能继续游戏

### API 端点

- `GET /api/auth/config` - 获取认证配置
- `GET /api/auth/discord` - 获取 Discord 授权 URL
- `GET /auth/discord/callback` - Discord 回调处理
- `POST /api/auth/discord/bind` - 绑定 Discord 到现有账号
- `POST /api/auth/discord/status` - 检查 Discord 绑定状态

## 注意事项

⚠️ **安全提示**
- `.env` 文件包含敏感信息，已在 `.gitignore` 中排除
- 不要将 `.env` 文件提交到 Git 仓库
- 在 GitHub Actions 中使用 Repository Secrets 存储敏感配置

⚠️ **Discord 配置**
- 确保 Bot 已加入你的 Discord 服务器
- 确保启用了 `SERVER MEMBERS INTENT`
- 重定向 URI 必须与 Discord Developer Portal 中配置的完全一致