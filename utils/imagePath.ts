/**
 * 瑙嗚灏忚璧勬簮璺緞瑙ｆ瀽宸ュ叿
 */

// 椤圭洰璧勬簮鏍圭洰褰?const PROJECT_BASE_URL = "https://h.hony-wen.com:5100/files/AVG-AdventurerTavern/";

let isHDMode = false;

/**
 * 璁剧疆鏄惁寮€鍚珮娓呮ā寮? * @param enabled true 涓哄紑鍚? */
export const setHDMode = (enabled: boolean) => {
  isHDMode = enabled;
};

/**
 * 灏嗛」鐩唴閮ㄧ殑閫昏緫璺緞瑙ｆ瀽涓鸿繙绋嬬湡瀹?URL
 * @param path 閫昏緫璺緞锛屼緥濡?"img/bg/_Title.png" 鎴?"audio/bgm/track1.mp3"
 * @returns 瀹屾暣鐨勮繙绋?URL
 */
export const resolveImgPath = (path: string): string => {
  if (!path) return "";
  
  // 瑙勮寖鍖栬矾寰勶細灏?Windows 椋庢牸鐨勫弽鏂滄潬杞崲涓烘鏂滄潬
  const normalizedPath = path.replace(/\\/g, '/');
  
  // 濡傛灉鏄?HTTP 閾炬帴鐩存帴杩斿洖
  if (normalizedPath.startsWith("http")) {
      return normalizedPath;
  }

  // 闊抽鏂囦欢涓嶅尯鍒?HD锛屽缁堜娇鐢?audio/ 鐩綍
  if (normalizedPath.startsWith("audio/")) {
    return PROJECT_BASE_URL + normalizedPath;
  }

  // 鍥剧墖鏂囦欢澶勭悊
  if (normalizedPath.startsWith("img/")) {
    if (isHDMode) {
      // 寮€鍚?HD 妯″紡鏃讹紝灏?img/ 鏇挎崲涓?img-hd/
      // 渚嬪 img/bg/Title.png -> img-hd/bg/Title.png
      return PROJECT_BASE_URL + normalizedPath.replace(/^img\//, 'img-hd/');
    } else {
      // 鏅€氭ā寮?      return PROJECT_BASE_URL + normalizedPath;
    }
  }
  
  // 鍏朵粬鎯呭喌锛堣櫧鐒剁洰鍓嶆病鏈夊叾浠栬祫婧愮被鍨嬶級锛岄粯璁ょ洿鎺ユ嫾鎺?  return normalizedPath;
};

