import { WorldState, ManagementStats, RevenueLog, UserRecipe, GameSettings, CharacterUnlocks } from '../types';
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
    characterUnlocks: Record<string, CharacterUnlocks>;
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

// --- 角色解锁状态服务 ---

/**
 * 获取单个角色的解锁状态
 */
export const getCharacterUnlocks = async (
    userId: number,
    slotId: number,
    characterId: string
): Promise<CharacterUnlocks | null> => {
    const res = await apiCall('/character_unlocks/get', {
        userId,
        slotId,
        characterId
    });
    
    if (res.success && res.unlocks) {
        return res.unlocks;
    }
    
    console.error('Failed to get character unlocks:', res.message);
    return null;
};

/**
 * 更新角色解锁状态
 */
export const updateCharacterUnlocks = async (
    userId: number,
    slotId: number,
    characterId: string,
    unlocks: Partial<CharacterUnlocks>
): Promise<boolean> => {
    const res = await apiCall('/character_unlocks/update', {
        userId,
        slotId,
        characterId,
        unlocks
    });
    
    if (!res.success) {
        console.error('Failed to update character unlocks:', res.message);
        return false;
    }
    
    return true;
};

/**
 * 批量获取所有角色的解锁状态
 */
export const getAllCharacterUnlocks = async (
    userId: number,
    slotId: number
): Promise<Record<string, CharacterUnlocks>> => {
    const res = await apiCall('/character_unlocks/get_all', {
        userId,
        slotId
    });
    
    if (res.success && res.data) {
        return res.data;
    }
    
    console.error('Failed to get all character unlocks:', res.message);
    return {};
};

// --- AI 聊天记忆系统服务 ---

/**
 * 获取角色的聊天历史（短期工作记忆）
 */
export const getChatMessages = async (
    userId: number,
    slotId: number,
    characterId: string,
    limit: number = 20
): Promise<Array<{ role: string; content: string; created_at: number }>> => {
    const res = await apiCall('/chat/messages/get', {
        userId,
        slotId,
        characterId,
        limit
    });
    
    if (res.success && Array.isArray(res.messages)) {
        return res.messages;
    }
    
    console.error('Failed to get chat messages:', res.message);
    return [];
};

/**
 * 添加一条新的聊天记录
 */
export const addChatMessage = async (
    userId: number,
    slotId: number,
    characterId: string,
    role: 'user' | 'assistant',
    content: string
): Promise<boolean> => {
    const res = await apiCall('/chat/messages/add', {
        userId,
        slotId,
        characterId,
        role,
        content
    });
    
    if (!res.success) {
        console.error('Failed to add chat message:', res.message);
        return false;
    }
    
    return true;
};

/**
 * 获取角色的核心记忆（长期记忆）
 */
export const getCharacterMemories = async (
    userId: number,
    slotId: number,
    characterId: string
): Promise<Array<{ memory_type: string; content: string; created_at: number }>> => {
    const res = await apiCall('/chat/memories/get', {
        userId,
        slotId,
        characterId
    });
    
    if (res.success && Array.isArray(res.memories)) {
        return res.memories;
    }
    
    console.error('Failed to get character memories:', res.message);
    return [];
};

/**
 * 批量添加核心记忆
 */
export const addCharacterMemories = async (
    userId: number,
    slotId: number,
    characterId: string,
    memories: string[],
    type: 'core_fact' | 'summary' = 'core_fact'
): Promise<boolean> => {
    const res = await apiCall('/chat/memories/add_batch', {
        userId,
        slotId,
        characterId,
        memories,
        type
    });
    
    if (!res.success) {
        console.error('Failed to add character memories:', res.message);
        return false;
    }
    
    return true;
};

/**
 * 同步存档槽位的聊天和记忆数据
 * 用于手动存档时，将当前对话环境复制到目标槽位
 */
export const syncChatSlot = async (
    userId: number,
    sourceSlotId: number,
    targetSlotId: number
): Promise<boolean> => {
    const res = await apiCall('/chat/sync_slot', {
        userId,
        sourceSlotId,
        targetSlotId
    });
    
    if (!res.success) {
        console.error('Failed to sync chat slot:', res.message);
        return false;
    }
    
    return true;
};

/**
 * 更新角色的历史摘要（滚动更新）
 */
export const updateCharacterSummary = async (
    userId: number,
    slotId: number,
    characterId: string,
    summaryText: string
): Promise<boolean> => {
    const res = await apiCall('/chat/summary/update', {
        userId,
        slotId,
        characterId,
        summaryText
    });
    
    if (!res.success) {
        console.error('Failed to update character summary:', res.message);
        return false;
    }
    
    return true;
};

/**
 * 删除已总结的旧对话记录
 */
export const deleteOldMessages = async (
    userId: number,
    slotId: number,
    characterId: string,
    beforeTimestamp: number
): Promise<boolean> => {
    const res = await apiCall('/chat/messages/delete_old', {
        userId,
        slotId,
        characterId,
        beforeTimestamp
    });
    
    if (!res.success) {
        console.error('Failed to delete old messages:', res.message);
        return false;
    }
    
    return true;
};
