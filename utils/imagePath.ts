
/**
 * 视觉小说资源路径解析工具
 */

import { PLAYER_AVATAR_URL } from '../data/resources/characterImageResources';
import { fileUploadService } from '../services/fileUpload';

// 项目资源根目录
const PROJECT_BASE_URL = "https://h.hony-wen.com:5102/files/";

let isHDMode = false;

/**
 * 用户头像信息接口
 */
export interface PlayerAvatarInfo {
    has_custom_avatar: boolean;
    custom_avatar_url?: string;
}

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
    if (isHDMode && normalizedPath.startsWith("img/char/")) {
      // HD 模式下只变更角色图片路径
      // 例如 img/char/char_101/1_1/1_1_01.png -> img/char-hd/char_101/1_1/1_1_01.png
      return PROJECT_BASE_URL + normalizedPath.replace(/^img\/char\//, 'img/char-hd/');
    } else {
      // 普通模式或非角色图片
      return PROJECT_BASE_URL + normalizedPath;
    }
  }
  
  // 其他情况（虽然目前没有其他资源类型），默认直接拼接
  return normalizedPath;
};

/**
 * 获取玩家头像 URL
 * @param avatarInfo 用户头像信息，包含 has_custom_avatar 和 custom_avatar_url
 * @param timestamp 可选的时间戳，用于避免浏览器缓存
 * @returns 完整的头像 URL
 */
export const getPlayerAvatarUrl = (
    avatarInfo: PlayerAvatarInfo | null | undefined,
    timestamp?: number
): string => {
    if (avatarInfo?.has_custom_avatar && avatarInfo.custom_avatar_url) {
        const baseUrl = fileUploadService.getFileUrl(avatarInfo.custom_avatar_url);
        if (timestamp) {
            return `${baseUrl}?t=${timestamp}`;
        }
        return baseUrl;
    }
    return resolveImgPath(PLAYER_AVATAR_URL);
};
