/**
 * 鍜岄澶╂皵 (QWeather) API 鍑瘉閰嶇疆鏂囦欢
 * 
 * === 鑾峰彇 API 鍑瘉 ===
 * 1. API Host 鑾峰彇鍦板潃锛歨ttps://console.qweather.com/setting?lang=zh
 *    (閫氬父涓?api.qweather.com 鎴栨偍鐨勪笓灞?Host)
 * 
 * 2. API KEY 鑾峰彇鍦板潃锛歨ttps://console.qweather.com/project?lang=zh
 *    (鍒涘缓椤圭洰鍚庣敓鎴愮殑 Key)
 * 
 * === GitHub Actions 閮ㄧ讲閰嶇疆 ===
 * 涓轰繚鎶?API 鍑瘉瀹夊叏锛岄渶瑕佸湪 GitHub 浠撳簱涓厤缃?Repository Secrets锛? * 
 * 1. 璁块棶锛歨ttps://github.com/浣犵殑鐢ㄦ埛鍚?浣犵殑浠撳簱鍚?settings/secrets/actions
 * 2. 鐐瑰嚮 "New repository secret" 娣诲姞浠ヤ笅涓や釜 secrets锛? *    - Name: QWEATHER_HOST, Value: 浣犵殑 API Host
 *    - Name: QWEATHER_KEY, Value: 浣犵殑 API Key
 * 
 * === 鏈湴寮€鍙戦厤缃?===
 * 鍦ㄩ」鐩牴鐩綍鍒涘缓 .env 鏂囦欢锛堝凡鍦?.gitignore 涓級锛? * 
 * VITE_QWEATHER_HOST=浣犵殑API_Host
 * VITE_QWEATHER_KEY=浣犵殑API_Key
 * 
 * 鈿狅笍 瀹夊叏鎻愮ず锛? * - 姘歌繙涓嶈灏嗙湡瀹炵殑 API Key 鎻愪氦鍒?Git 浠撳簱
 * - 濡傛灉涓嶅皬蹇冩硠闇蹭簡 Key锛岀珛鍗冲湪鍜岄澶╂皵鎺у埗鍙伴噸鏂扮敓鎴? */

export const QWEATHER_CONFIG = {
  // API Host (渚嬪: abcxyz.qweatherapi.com)
  // 浠庣幆澧冨彉閲忚鍙栵紝鐢熶骇鐜蹇呴』閰嶇疆 GitHub Secrets
  HOST: import.meta.env.VITE_QWEATHER_HOST || '',

  // API KEY (渚嬪: ABCD1234EFGH)
  // 浠庣幆澧冨彉閲忚鍙栵紝鐢熶骇鐜蹇呴』閰嶇疆 GitHub Secrets
  KEY: import.meta.env.VITE_QWEATHER_KEY || '',

  // 榛樿瀹氫綅鍧愭爣 (缁忓害,绾害)锛屽綋鏃犳硶鑾峰彇娴忚鍣ㄥ畾浣嶆椂浣跨敤
  // 榛樿涓哄寳浜潗鏍?  DEFAULT_LOCATION: '116.41,39.92' 
};

