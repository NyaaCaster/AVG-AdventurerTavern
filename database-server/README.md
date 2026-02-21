# AdventurerTavern 数据库服务器

后端 API 服务，负责用户认证和存档管理。

## 快速部署

```bash
# 1. 准备 SSL 证书（可选）
mkdir -p SSL
cp /path/to/your.key SSL/
cp /path/to/your.crt SSL/

# 2. 修改 config.js 中的证书路径（如需要）

# 3. 构建并启动
docker-compose up -d --build

# 4. 验证服务
curl http://localhost:3097/api/health
```

## 配置

编辑 `config.js`：

```javascript
module.exports = {
    PORT: 3097,
    HTTPS_ENABLED: true,
    SSL_KEY_PATH: path.join(__dirname, 'SSL', 'your.key'),
    SSL_CERT_PATH: path.join(__dirname, 'SSL', 'your.crt'),
    DB_PATH: '/app/data/database.sqlite',
    CORS_CONFIG: { origin: true, credentials: true }
};
```

## API 端点

- `GET /api/health` - 健康检查
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `POST /api/save` - 上传存档
- `POST /api/load` - 下载存档
- `POST /api/slots` - 获取存档列表
- `POST /api/delete` - 删除存档

## 管理命令

```bash
# 停止/启动/重启
docker-compose down
docker-compose start
docker-compose restart

# 查看日志
docker-compose logs -f

# 备份数据库
cp data/database.sqlite data/backup-$(date +%Y%m%d).sqlite

# 进入容器
docker-compose exec database-server sh
```

## 注意事项

- SSL 证书文件不会被提交到 Git（已在 `.gitignore` 中排除）
- 数据库文件位于 `./data/database.sqlite`，通过 Docker 卷持久化
- 生产环境建议配置具体的 CORS 域名白名单
- 定期备份数据库文件

## 开发模式

```bash
npm install
node index.js
```
