
/**
 * 后端服务配置文件
 */
const path = require('path');
const fs = require('fs');

module.exports = {
    // 后端服务监听端口
    PORT: 3097,

    // HTTPS 配置
    HTTPS_ENABLED: true,
    SSL_KEY_PATH: '/etc/nginx/ssl/h.hony-wen.com.key',
    SSL_CERT_PATH: '/etc/nginx/ssl/h.hony-wen.com_bundle.crt',

    // 数据库文件存放路径 (使用数据卷以持久化)
    DB_PATH: '/app/data/database.sqlite',

    // CORS (跨域资源共享) 配置
    CORS_CONFIG: {
        origin: true, // 允许所有来源 (开发环境)，生产环境建议设为具体域名
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};
