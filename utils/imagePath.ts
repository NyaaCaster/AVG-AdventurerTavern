
/**
 * 视觉小说资源路径解析工具
 */

// 项目资源根目录
const PROJECT_BASE_URL = "https://h.hony-wen.com:5100/files/AVG-AdventurerTavern/";

/**
 * 将项目内部的逻辑路径解析为远程真实 URL
 * @param path 逻辑路径，例如 "img/bg/_Title.png"
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

  // 如果路径以 img/ 开头，则拼接项目根目录 (变为 .../AVG-AdventurerTavern/img/...)
  if (normalizedPath.startsWith("img/")) {
    return PROJECT_BASE_URL + normalizedPath;
  }
  
  return normalizedPath;
};
