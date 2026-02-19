
import { WorldState, ManagementStats, RevenueLog, UserRecipe, GameSettings } from '../types';
import { AppConfig } from '../config';

// 配置服务器地址
// 从 config.ts 中读取配置，方便统一管理
const API_BASE_URL = AppConfig.apiBaseUrl;

// --- 接口定义 ---

export interface GameSaveData {
  id?: number;
  userId: number;
  slotId: number;
  label: string;
  savedAt: number;
  gold: number;
  currentSceneId: string;
  worldState: WorldState;
  managementStats: ManagementStats;
}

// --- API 辅助函数 ---

const apiCall = async (endpoint: string, body: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            mode: 'cors', // 显式声明跨域模式
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`API Call Failed [${endpoint}]:`, e);
        return { success: false, message: `无法连接到服务器 (${API_BASE_URL})。\n请检查:\n1. server/config.js 配置是否正确\n2. 后端服务是否运行` };
    }
};

// --- 用户认证服务 ---

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number }> => {
    const res = await apiCall('/register', { username, password });
    return res;
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number }> => {
    const res = await apiCall('/login', { username, password });
    return res;
};

// --- 存档服务层函数 ---

/**
 * 执行存档操作 (上传到服务器)
 */
export const saveGame = async (
  userId: number,
  slotId: number,
  label: string,
  data: {
    gold: number;
    currentSceneId: string;
    worldState: WorldState;
    managementStats: ManagementStats;
    inventory: Record<string, number>;
    characterStats: Record<string, { level: number; affinity: number }>;
    sceneLevels: Record<string, number>;
    revenueLogs: RevenueLog[];
    userRecipes?: UserRecipe[];
    foodStock?: Record<string, number>;
    settings?: GameSettings; // Add settings to save data
  }
) => {
    const res = await apiCall('/save', {
        userId,
        slotId,
        label,
        data // 直接发送整个对象
    });
    
    if (!res.success) {
        console.error("Save failed:", res.message);
        alert("保存失败: " + (res.message || "服务器无响应"));
    }
};

/**
 * 读取存档数据 (从服务器下载)
 */
export const loadGame = async (userId: number, slotId: number) => {
    const res = await apiCall('/load', { userId, slotId });
    
    if (res.success && res.data) {
        return {
            ...res.data,
            savedAt: Date.now() // 服务器若未返回时间，使用当前时间
        };
    }
    return null;
};

/**
 * 获取指定用户的所有存档槽位信息
 */
export const getSaveSlots = async (userId: number) => {
    const res = await apiCall('/slots', { userId });
    
    if (res.success && Array.isArray(res.slots)) {
        // 适配前端 UI 需要的格式
        return res.slots.map((s: any) => ({
            slotId: s.slotId,
            label: s.label,
            savedAt: s.savedAt,
            // 填充伪数据以满足 UI 类型检查 (实际加载时会获取完整数据)
            gold: 0, 
            worldState: { dateStr: 'Cloud', timeStr: 'Save', sceneName: '服务器存档' },
            currentSceneId: ''
        }));
    }
    return [];
};

/**
 * 删除存档
 */
export const deleteGame = async (userId: number, slotId: number) => {
    await apiCall('/delete', { userId, slotId });
};

/**
 * 清除所有数据 (本地废弃)
 */
export const clearAllData = async () => {
    console.warn("clearAllData is deprecated in Cloud Mode");
};
