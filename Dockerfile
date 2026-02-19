# 构建阶段 - 前端
FROM node:20-alpine3.20 AS frontend-builder

WORKDIR /app

# 复制前端依赖文件
COPY package.json ./

# 安装前端依赖（包括 devDependencies 用于构建）
# 使用缓存挂载加速构建（需要 Docker BuildKit）
RUN --mount=type=cache,target=/root/.npm \
    npm ci --silent --prefer-offline

# 只复制构建所需的文件（根据 .dockerignore）
COPY *.tsx *.ts *.html *.json ./
COPY components/ ./components/
COPY services/ ./services/
COPY utils/ ./utils/
COPY WorldInfo/ ./WorldInfo/
COPY vite.config.ts ./

# 构建前端
RUN npm run build && \
    # 清理构建缓存
    rm -rf node_modules .npm

# 构建阶段 - 后端（编译 sqlite3 native 模块）
FROM node:20-alpine3.20 AS backend-builder

# 安装编译依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app/server

# 复制后端依赖文件
COPY server/package.json ./

# 安装后端依赖（仅生产依赖）
RUN --mount=type=cache,target=/root/.npm \
    npm ci --silent --omit=dev --prefer-offline && \
    # 清理不必要的文件
    find node_modules -name '*.md' -delete && \
    find node_modules -name 'LICENSE*' -delete && \
    find node_modules -name 'CHANGELOG*' -delete && \
    find node_modules -name '*.map' -delete

# 生产阶段 - 使用 nginx-alpine 作为基础镜像
FROM nginx:1.27-alpine3.20

# 安装必要的运行时依赖（最小化）
RUN apk add --no-cache \
    nodejs \
    tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /app

# 复制前端构建产物（仅dist目录）
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# 复制后端文件（仅必要文件）
COPY --from=backend-builder /app/server/node_modules /app/server/node_modules
COPY server/index.js /app/server/
COPY server/package.json /app/server/

# 复制配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建非特权用户和数据目录
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/data && \
    chown -R nodejs:nodejs /app/data /app/server && \
    chmod 755 /app/data && \
    # 创建 nginx 运行所需的目录
    mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx

# 清理 nginx 默认配置和不必要的文件
RUN rm -f /etc/nginx/conf.d/default.conf.default && \
    rm -rf /usr/share/nginx/html/index.html && \
    rm -rf /var/log/nginx/* && \
    rm -rf /etc/nginx/http.d/default.conf

# 创建启动脚本（替代 supervisor）
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# 启动后端服务（后台运行）' >> /entrypoint.sh && \
    echo 'cd /app/server' >> /entrypoint.sh && \
    echo 'su -s /bin/sh nodejs -c "node index.js" &' >> /entrypoint.sh && \
    echo 'BACKEND_PID=$!' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# 等待后端启动' >> /entrypoint.sh && \
    echo 'sleep 2' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# 启动 nginx（前台运行）' >> /entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# 创建健康检查脚本
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget --no-verbose --tries=1 --spider http://localhost:80/health 2>&1 || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["/healthcheck.sh"]

# 数据卷
VOLUME ["/app/data"]

# 暴露端口
EXPOSE 80

# 使用启动脚本
CMD ["/entrypoint.sh"]