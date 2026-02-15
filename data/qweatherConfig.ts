
/**
 * 和风天气 (QWeather) API 凭证配置文件
 * 
 * 请根据您的实际部署环境修改以下配置。
 * 
 * 1. API Host 获取地址：
 *    https://console.qweather.com/setting?lang=zh
 *    (通常为 api.qweather.com 或您的专属 Host)
 * 
 * 2. API KEY 获取地址：
 *    https://console.qweather.com/project?lang=zh
 *    (创建项目后生成的 Key)
 */

export const QWEATHER_CONFIG = {
  // API Host (例如: abcxyz.qweatherapi.com)
  HOST: 'ng7p3yju6m.re.qweatherapi.com',

  // API KEY (例如: ABCD1234EFGH)
  KEY: '4ef868c742724feea153a9d175917839',

  // 默认定位坐标 (经度,纬度)，当无法获取浏览器定位时使用
  // 默认为北京坐标
  DEFAULT_LOCATION: '116.41,39.92' 
};
