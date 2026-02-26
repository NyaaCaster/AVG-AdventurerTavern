# Client Dockerfile - builds frontend static assets only
# Backend database server is separated into database-server/ directory

# Build stage - frontend
FROM node:20-alpine3.20 AS builder

# Receive build arguments
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

# Copy config files
COPY tsconfig.json vite.config.ts vite-env.d.ts config.ts ./

# Copy source directories
COPY components/ ./components/
COPY services/ ./services/
COPY utils/ ./utils/
COPY hooks/ ./hooks/
COPY data/ ./data/
COPY scripts/ ./scripts/

# Copy root source files
COPY *.tsx *.ts *.html ./

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
RUN --mount=type=secret,id=ssl_cert \
    --mount=type=secret,id=ssl_key \
    if [ -f /run/secrets/ssl_cert ] && [ -f /run/secrets/ssl_key ]; then \
        base64 -d /run/secrets/ssl_cert > /etc/nginx/ssl/certificate.crt && \
        base64 -d /run/secrets/ssl_key > /etc/nginx/ssl/certificate.key && \
        chmod 644 /etc/nginx/ssl/certificate.crt && \
        chmod 600 /etc/nginx/ssl/certificate.key && \
        chown nginx:nginx /etc/nginx/ssl/certificate.* ; \
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