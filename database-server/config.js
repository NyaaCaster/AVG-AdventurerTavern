
/**
 * 后端服务配置文件
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 登录系统模式：由 .env 的 AUTH_MODE 控制，二选一唯一生效
// password = 账号密码登录系统  |  discord = Discord OAuth 登录系统
const AUTH_MODE = (process.env.AUTH_MODE || 'password').toLowerCase();

module.exports = {
    // 后端服务监听端口
    PORT: 3097,

    // HTTPS 配置
    HTTPS_ENABLED: true,
    SSL_KEY_PATH: path.join(__dirname, 'SSL', 'h.nyaa.host.key'),
    SSL_CERT_PATH: path.join(__dirname, 'SSL', 'h.nyaa.host_bundle.crt'),

    // 数据库文件存放路径 (使用数据卷以持久化)
    DB_PATH: process.env.DB_PATH || path.join(__dirname, 'data', 'database.sqlite'),

    // 前端 URL (用于 Discord OAuth 回调重定向)
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://h.nyaa.host',

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
    // 由 .env 的 AUTH_MODE 单一开关控制，password / discord 互斥唯一生效
    AUTH: {
        MODE: AUTH_MODE,                              // 'password' | 'discord'
        ENABLE_PASSWORD_LOGIN: AUTH_MODE === 'password', // 账号密码登录系统是否生效
        ENABLE_DISCORD_LOGIN: AUTH_MODE === 'discord',   // Discord 登录系统是否生效
        // 账号密码模式下无需强制绑定 Discord；仅在确有需要时由 Discord 模式逻辑使用
        FORCE_DISCORD_BIND: false
    },

    // 游戏常量（与前端 gameConstants.ts 保持同步）
    GAME_CONSTANTS: {
        INITIAL_INSPIRATION: 10,           // 初始灵感
        INSPIRATION_TO_SANITY_RATIO: 10000 // 灵感转理智比例
    }
};
