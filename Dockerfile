# 客户端 Dockerfile - 仅构建前端静态资源
# 后端数据库服务器已分离到 database-server/ 目录

# 构建阶段 - 前端
FROM node:20-alpine3.20 AS builder

# 接收构建参数
ARG VITE_QWEATHER_HOST
ARG VITE_QWEATHER_KEY
ARG GIT_COMMIT_HASH=unknown

# 设置环境变量供 Vite 使用
ENV VITE_QWEATHER_HOST=${VITE_QWEATHER_HOST}
ENV VITE_QWEATHER_KEY=${VITE_QWEATHER_KEY}
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

WORKDIR /app

# 复制前端依赖文件
COPY package.json ./

# 安装前端依赖（包括 devDependencies 用于构建）
RUN --mount=type=cache,target=/root/.npm \
    npm install --silent --prefer-offline

# 复制所有构建所需的文件
COPY *.tsx *.ts *.html ./
COPY components/ ./components/
COPY services/ ./services/
COPY utils/ ./utils/
COPY hooks/ ./hooks/
COPY data/ ./data/
COPY scripts/ ./scripts/
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY vite-env.d.ts ./

# 构建前端
RUN npm run build && \
    rm -rf node_modules .npm

# 生产阶段 - 使用 nginx-alpine 作为基础镜像
FROM nginx:1.27-alpine3.20

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# 复制前端构建产物
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建 nginx 运行所需的目录
RUN mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# 清理 nginx 默认配置
RUN rm -f /etc/nginx/conf.d/default.conf.default && \
    rm -rf /etc/nginx/http.d/default.conf

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]