
/**
 * 视觉小说资源路径解析工具
 */

// 项目资源根目录
const PROJECT_BASE_URL = "https://h.hony-wen.com:5100/files/AVG-AdventurerTavern/";

let isHDMode = false;

/**
 * 设置是否开启高清模式
 * @param enabled true 为开启
 */
export const setHDMode = (enabled: boolean) => {
  isHDMode = enabled;
};

/**
 * 将项目内部的逻辑路径解析为远程真实 URL
 * @param path 逻辑路径，例如 "img/bg/_Title.png" 或 "audio/bgm/track1.mp3"
 * @returns 完整的远程 URL
 */
export const resolveImgPath = (path: string): string => {
  if (!path) return "";
  
  // 规范化路径：将 Windows 风格的反斜杠转换为正斜杠
  const normalizedPath = path.replace(/\\/g, '/');
  
  // 如果是 HTTP 链接直接返回
  if (normalizedPath.startsWith("http")) {
      return normalizedPath;
  }

  // 音频文件不区分 HD，始终使用 audio/ 目录
  if (normalizedPath.startsWith("audio/")) {
    return PROJECT_BASE_URL + normalizedPath;
  }

  // 图片文件处理
  if (normalizedPath.startsWith("img/")) {
    if (isHDMode) {
      // 开启 HD 模式时，将 img/ 替换为 img-hd/
      // 例如 img/bg/Title.png -> img-hd/bg/Title.png
      return PROJECT_BASE_URL + normalizedPath.replace(/^img\//, 'img-hd/');
    } else {
      // 普通模式
      return PROJECT_BASE_URL + normalizedPath;
    }
  }
  
  // 其他情况（虽然目前没有其他资源类型），默认直接拼接
  return normalizedPath;
};
