# 数据库服务器 Dockerfile
# 仅用于本地构建和部署

FROM node:20-alpine3.20

# 安装编译依赖
RUN apk add --no-cache python3 make g++ tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# 复制依赖文件
COPY package.json ./

# 安装依赖
RUN npm install --silent --omit=dev && \
    find node_modules -name '*.md' -delete && \
    find node_modules -name 'LICENSE*' -delete && \
    find node_modules -name 'CHANGELOG*' -delete

# 复制应用代码
COPY index.js ./
COPY config.js ./

# 创建数据目录
RUN mkdir -p /app/data && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 切换到非特权用户
USER nodejs

# 数据卷
VOLUME ["/app/data"]

# 暴露端口
EXPOSE 3097

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3097/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# 启动应用
CMD ["node", "index.js"]