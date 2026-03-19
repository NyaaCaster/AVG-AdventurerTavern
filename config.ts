
/**
 * 前端全局配置文件
 * 用于配置 API 连接地址和其他全局参数
 */
export const AppConfig = {
  database: {
    apiBaseUrl: 'https://h.hony-wen.com:3097/api',
  },
  fileServer: {
    baseUrl: 'https://h.hony-wen.com:5102',
    /**
     * 文件服务器 API Key
     * 
     * 来源：GitHub Actions Repository Secret `FILE_SERVER_API_KEY`
     * 配置路径：Settings → Secrets and variables → Actions → New repository secret
     * 
     * 构建时通过 vite.config.ts 的 define 注入
     * 本地开发时可在 .env.local 中设置：FILE_SERVER_API_KEY=your-key
     */
    apiKey: typeof __FILE_SERVER_API_KEY__ !== 'undefined' ? __FILE_SERVER_API_KEY__ : '',
  },
};

export type AppConfigType = typeof AppConfig;
