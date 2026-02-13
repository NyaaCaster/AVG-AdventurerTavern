# 构建阶段 - 使用多阶段构建减少镜像大小
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies用于构建）
RUN npm ci --silent && \
    npm cache clean --force

# 复制项目文件
COPY . .

# 构建项目 - 清理构建缓存
RUN npm run build && \
    rm -rf node_modules

# 生产阶段 - 使用更小的基础镜像
FROM nginx:alpine

# 设置时区 - 优化时区设置，减少层数
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# 暴露端口
EXPOSE 80

# 启动 nginx (nginx会以root启动master进程，worker进程以nginx用户运行)
CMD ["nginx", "-g", "daemon off;"]

