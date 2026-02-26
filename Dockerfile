# 客户端 Dockerfile - 仅构建前端静态资源
# 后端数据库服务器已分离到 database-server/ 目录

# Build stage - Frontend
FROM node:20-alpine3.20 AS builder

# Set locale and encoding
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Accept build arguments
ARG VITE_QWEATHER_HOST
ARG VITE_QWEATHER_KEY
ARG GIT_COMMIT_HASH=unknown

# Set environment variables for Vite
ENV VITE_QWEATHER_HOST=${VITE_QWEATHER_HOST}
ENV VITE_QWEATHER_KEY=${VITE_QWEATHER_KEY}
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

WORKDIR /app

# Copy frontend dependency files
COPY package.json ./

# Install frontend dependencies (including devDependencies for build)
RUN --mount=type=cache,target=/root/.npm \
    npm install --silent --prefer-offline

# Copy configuration files
COPY tsconfig.json vite.config.ts vite-env.d.ts config.ts ./

# Copy source code directories
COPY components/ ./components/
COPY services/ ./services/
COPY utils/ ./utils/
COPY hooks/ ./hooks/
COPY data/ ./data/
COPY scripts/ ./scripts/

# Copy root source files
COPY *.tsx *.ts *.html ./

# Verify file encoding (check for HTML entities)
RUN echo "Checking for HTML entities..." && \
    if find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "&gt;\|&lt;\|&quot;\|&amp;" 2>/dev/null; then \
        echo "ERROR: HTML entities found in source files!"; \
        find . -name "*.tsx" -o -name "*.ts" | xargs grep -n "&gt;\|&lt;\|&quot;\|&amp;" 2>/dev/null || true; \
        exit 1; \
    else \
        echo "✓ No HTML entities found"; \
    fi

# Build frontend
RUN npm run build && \
    rm -rf node_modules .npm

# Production stage - Use nginx-alpine as base image
FROM nginx:1.27-alpine3.20

# Set timezone and locale
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Configure timezone
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

# Create SSL certificate directory
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl

WORKDIR /app

# Copy frontend build artifacts
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy SSL certificates (from build secrets, requires Base64 decoding)
RUN --mount=type=secret,id=ssl_cert \
    --mount=type=secret,id=ssl_key \
    if [ -f /run/secrets/ssl_cert ] && [ -f /run/secrets/ssl_key ]; then \
        base64 -d /run/secrets/ssl_cert > /etc/nginx/ssl/certificate.crt && \
        base64 -d /run/secrets/ssl_key > /etc/nginx/ssl/certificate.key && \
        chmod 644 /etc/nginx/ssl/certificate.crt && \
        chmod 600 /etc/nginx/ssl/certificate.key && \
        chown nginx:nginx /etc/nginx/ssl/certificate.* ; \
    fi

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directories required for nginx
RUN mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Clean up nginx default configuration
RUN rm -f /etc/nginx/conf.d/default.conf.default && \
    rm -rf /etc/nginx/http.d/default.conf

# Set health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || wget --no-verbose --tries=1 --spider --no-check-certificate https://localhost:443/ || exit 1

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]