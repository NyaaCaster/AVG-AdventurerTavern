
/**
 * 后端服务配置文件
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config();

module.exports = {
    // 后端服务监听端口
    PORT: 3097,

    // HTTPS 配置
    HTTPS_ENABLED: true,
    SSL_KEY_PATH: path.join(__dirname, 'SSL', 'h.hony-wen.com.key'),
    SSL_CERT_PATH: path.join(__dirname, 'SSL', 'h.hony-wen.com_bundle.crt'),

    // 数据库文件存放路径 (使用数据卷以持久化)
    DB_PATH: process.env.DB_PATH || path.join(__dirname, 'data', 'database.sqlite'),

    // 前端 URL (用于 Discord OAuth 回调重定向)
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://h.hony-wen.com',

    // CORS (跨域资源共享) 配置
    CORS_CONFIG: {
        origin: true, // 允许所有来源 (开发环境)，生产环境建议设为具体域名
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    // Discord OAuth 配置
    DISCORD: {
        CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
        BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
        GUILD_ID: process.env.DISCORD_GUILD_ID,
        REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || `https://localhost:${process.env.PORT || 3097}/auth/discord/callback`
    },

    // 登录方式配置
    // [2026-03-08] 已关闭账号密码登录，只保留 Discord 登录
    AUTH: {
        ENABLE_PASSWORD_LOGIN: false, // 关闭账号密码登录
        FORCE_DISCORD_BIND: false // 关闭强制绑定（已无密码登录，无需绑定）
    }
};
