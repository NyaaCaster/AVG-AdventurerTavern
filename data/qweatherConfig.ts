
/**
 * 和风天气 (QWeather) API 凭证配置文件
 * 
 * === 获取 API 凭证 ===
 * 1. API Host 获取地址：https://console.qweather.com/setting?lang=zh
 *    (通常为 api.qweather.com 或您的专属 Host)
 * 
 * 2. API KEY 获取地址：https://console.qweather.com/project?lang=zh
 *    (创建项目后生成的 Key)
 * 
 * === GitHub Actions 部署配置 ===
 * 为保护 API 凭证安全，需要在 GitHub 仓库中配置 Repository Secrets：
 * 
 * 1. 访问：https://github.com/你的用户名/你的仓库名/settings/secrets/actions
 * 2. 点击 "New repository secret" 添加以下两个 secrets：
 *    - Name: QWEATHER_HOST, Value: 你的 API Host
 *    - Name: QWEATHER_KEY, Value: 你的 API Key
 * 
 * === 本地开发配置 ===
 * 在项目根目录创建 .env 文件（已在 .gitignore 中）：
 * 
 * VITE_QWEATHER_HOST=你的API_Host
 * VITE_QWEATHER_KEY=你的API_Key
 * 
 * ⚠️ 安全提示：
 * - 永远不要将真实的 API Key 提交到 Git 仓库
 * - 如果不小心泄露了 Key，立即在和风天气控制台重新生成
 */

export const QWEATHER_CONFIG = {
  // API Host (例如: abcxyz.qweatherapi.com)
  // 从环境变量读取，生产环境必须配置 GitHub Secrets
  HOST: import.meta.env.VITE_QWEATHER_HOST || '',

  // API KEY (例如: ABCD1234EFGH)
  // 从环境变量读取，生产环境必须配置 GitHub Secrets
  KEY: import.meta.env.VITE_QWEATHER_KEY || '',

  // 默认定位坐标 (经度,纬度)，当无法获取浏览器定位时使用
  // 默认为北京坐标
  DEFAULT_LOCATION: '116.41,39.92' 
};
