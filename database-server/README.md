# AdventurerTavern 数据库服务器

后端 API 服务，负责用户认证和存档管理。

## 快速部署

```bash
# 1. 准备证书目录（挂载到容器 /app/SSL，只读）
#    需含 Let's Encrypt SAN 证书 fullchain.pem + privkey.pem
#    （macmini 上由宿主 acme.sh 续期 → acme/reload_certs.py 同步 + SIGHUP 热加载）
mkdir -p SSL
cp /path/to/fullchain.pem SSL/
cp /path/to/privkey.pem   SSL/
chmod 640 SSL/privkey.pem   # 服务以非 root（uid 1001）运行，需组可读

# 2. 构建并启动（标准流程：本地 rebuild.py 构建推送 → macmini restart.py 部署）
# Windows: python rebuild.py --skip-push   macmini: python3 restart.py

# 3. 验证服务（https）
curl -k https://localhost:3097/api/health
```

## 配置

编辑 `config.js`（或用同名环境变量覆盖）：

```javascript
module.exports = {
    PORT: 3097,
    HTTPS_ENABLED: true,
    // 默认 LE SAN 证书；可用 SSL_CERT_PATH / SSL_KEY_PATH 环境变量覆盖
    SSL_KEY_PATH: path.join(__dirname, 'SSL', 'privkey.pem'),
    SSL_CERT_PATH: path.join(__dirname, 'SSL', 'fullchain.pem'),
    // 兼容旧 TrustAsia 命名（h.nyaa.host.key / h.nyaa.host_bundle.crt），仅在新证书缺失时回退
    DB_PATH: '/app/data/database.sqlite',
    CORS_CONFIG: { origin: true, credentials: true }
};
```

**证书热加载**：进程收到 `SIGHUP` 会重读挂载目录中的证书并 `setSecureContext`，无需重启容器
（acme 续期 hook 即用此机制：`docker kill -s HUP adventurertavern-db`）。

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
