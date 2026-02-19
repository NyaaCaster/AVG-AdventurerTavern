
/**
 * 后端服务配置文件
 */
const path = require('path');

module.exports = {
    // 后端服务监听端口
    PORT: 3097,

    // 数据库文件存放路径 (相对于 server/ 目录)
    DB_PATH: path.resolve(__dirname, 'database.sqlite'),

    // CORS (跨域资源共享) 配置
    CORS_CONFIG: {
        origin: true, // 允许所有来源 (开发环境)，生产环境建议设为具体域名
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};
