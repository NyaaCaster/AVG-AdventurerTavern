# 数据库服务器 Dockerfile
# 仅用于本地构建和部署

# 构建阶段 - 安装编译依赖并构建原生模块
FROM node:20-alpine3.20 AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
RUN npm install --silent --omit=dev && \
    find node_modules -name '*.md' -delete && \
    find node_modules -name 'LICENSE*' -delete && \
    find node_modules -name 'CHANGELOG*' -delete

# 运行阶段 - 只复制编译好的产物
FROM node:20-alpine3.20

RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY index.js config.js discord-auth.js ./

RUN mkdir -p /app/data && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

VOLUME ["/app/data"]

EXPOSE 3097

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3097/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "index.js"]