# Client Dockerfile - builds frontend static assets only
# Backend database server is separated into database-server/ directory

# Build stage - frontend
FROM node:20-alpine3.20 AS builder

# Receive build arguments
ARG VITE_QWEATHER_HOST
ARG VITE_QWEATHER_KEY
ARG FILE_SERVER_API_KEY
ARG GIT_COMMIT_HASH=unknown

# Set environment variables for Vite
ENV VITE_QWEATHER_HOST=${VITE_QWEATHER_HOST}
ENV VITE_QWEATHER_KEY=${VITE_QWEATHER_KEY}
ENV FILE_SERVER_API_KEY=${FILE_SERVER_API_KEY}
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

WORKDIR /app

# Copy frontend dependency files
COPY package.json ./

# Install frontend dependencies (including devDependencies for build)
RUN --mount=type=cache,target=/root/.npm \
    npm install --silent --prefer-offline

# Copy config files
COPY tsconfig.json vite.config.ts vite-env.d.ts config.ts ./

# Copy source directories
COPY components/ ./components/
COPY services/ ./services/
COPY utils/ ./utils/
COPY hooks/ ./hooks/
COPY data/ ./data/
COPY scripts/ ./scripts/
COPY battle-system/ ./battle-system/

# Copy root source files
COPY *.tsx *.ts *.html *.css ./

# Build frontend
RUN npm run build && \
    rm -rf node_modules .npm

# Production stage - nginx-alpine
FROM nginx:1.27-alpine3.20

# Set timezone
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

# Create SSL certificate directory
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl

WORKDIR /app

# Copy frontend build output
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy SSL certificates (from build secrets, Base64 decoded)
# h.hony-wen.com 证书
RUN --mount=type=secret,id=ssl_cert \
    --mount=type=secret,id=ssl_key \
    if [ -f /run/secrets/ssl_cert ] && [ -f /run/secrets/ssl_key ]; then \
        base64 -d /run/secrets/ssl_cert > /etc/nginx/ssl/certificate.crt && \
        base64 -d /run/secrets/ssl_key > /etc/nginx/ssl/certificate.key && \
        chmod 644 /etc/nginx/ssl/certificate.crt && \
        chmod 600 /etc/nginx/ssl/certificate.key && \
        chown nginx:nginx /etc/nginx/ssl/certificate.* ; \
    fi

# h.nyaa.host 证书（若未提供该域名 secret，则回退复用 h.hony-wen.com 证书，保证 nginx 可正常启动）
RUN --mount=type=secret,id=ssl_cert_nyaa \
    --mount=type=secret,id=ssl_key_nyaa \
    if [ -f /run/secrets/ssl_cert_nyaa ] && [ -f /run/secrets/ssl_key_nyaa ]; then \
        base64 -d /run/secrets/ssl_cert_nyaa > /etc/nginx/ssl/nyaa.host.crt && \
        base64 -d /run/secrets/ssl_key_nyaa > /etc/nginx/ssl/nyaa.host.key ; \
    elif [ -f /etc/nginx/ssl/certificate.crt ] && [ -f /etc/nginx/ssl/certificate.key ]; then \
        cp /etc/nginx/ssl/certificate.crt /etc/nginx/ssl/nyaa.host.crt && \
        cp /etc/nginx/ssl/certificate.key /etc/nginx/ssl/nyaa.host.key ; \
    fi && \
    if [ -f /etc/nginx/ssl/nyaa.host.crt ] && [ -f /etc/nginx/ssl/nyaa.host.key ]; then \
        chmod 644 /etc/nginx/ssl/nyaa.host.crt && \
        chmod 600 /etc/nginx/ssl/nyaa.host.key && \
        chown nginx:nginx /etc/nginx/ssl/nyaa.host.* ; \
    fi

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx runtime directories
RUN mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Remove nginx default config
RUN rm -f /etc/nginx/conf.d/default.conf.default && \
    rm -rf /etc/nginx/http.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || wget --no-verbose --tries=1 --spider --no-check-certificate https://localhost:443/ || exit 1

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]