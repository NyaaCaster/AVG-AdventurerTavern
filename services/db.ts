import { WorldState, ManagementStats, RevenueLog, UserRecipe, GameSettings, CharacterUnlocks, QuestStateMap, CharacterStat, CharacterEquipment, BattlePartySlots } from '../types';
import {
    buildCharacterBattleStats,
    getCharacterBattleStatsFromSaveData,
    CharacterBattleStatsResult
} from './characterBattleStats';
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
  managementStats?: ManagementStats;
  characterStats?: Record<string, CharacterStat>;
  characterEquipments?: Record<string, CharacterEquipment>;
  battleParty?: BattlePartySlots;
  checkedInCharacters?: string[];
  sceneLevels?: Record<string, number>;
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

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number; needDiscordBind?: boolean }> => {
    const res = await apiCall('/login', { username, password });
    return res;
};

// --- Discord 认证服务 ---

/**
 * 获取认证配置
 */
export const getAuthConfig = async (): Promise<{ enablePasswordLogin: boolean; forceDiscordBind: boolean } | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/config`);
        if (!response.ok) return null;
        const res = await response.json();
        return res.success ? res : null;
    } catch (e) {
        console.error('Failed to get auth config:', e);
        return null;
    }
};

/**
 * 获取 Discord 授权 URL
 */
export const getDiscordAuthUrl = async (): Promise<string | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/discord`);
        if (!response.ok) return null;
        const res = await response.json();
        return res.success ? res.url : null;
    } catch (e) {
        console.error('Failed to get Discord auth URL:', e);
        return null;
    }
};

/**
 * 绑定 Discord 到现有账号
 */
export const bindDiscord = async (userId: number, code: string): Promise<{ success: boolean; message: string; discordUsername?: string }> => {
    const res = await apiCall('/auth/discord/bind', { userId, code });
    return res;
};

/**
 * 检查 Discord 绑定状态
 */
export const getDiscordStatus = async (userId: number): Promise<{ isBound: boolean; discordUsername?: string } | null> => {
    const res = await apiCall('/auth/discord/status', { userId });
    return res.success ? res : null;
};

/**
 * 迁移旧账号数据到 Discord 账号
 * [2026-03-08] 已停用账号迁移功能
 */
/*
export const migrateOldAccount = async (newUserId: number, oldUsername: string, oldPassword: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiCall('/auth/discord/migrate', { newUserId, oldUsername, oldPassword });
    return res;
};
*/
export const migrateOldAccount = async (newUserId: number, oldUsername: string, oldPassword: string): Promise<{ success: boolean; message: string }> => {
    return { success: false, message: '账号迁移功能已停用' };
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
    characterStats: Record<string, CharacterStat>;
    characterEquipments?: Record<string, CharacterEquipment>;
    characterSkills?: Record<string, import('../types').CharacterSkills>;
    battleParty?: BattlePartySlots;
    characterUnlocks: Record<string, CharacterUnlocks>;
    sceneLevels: Record<string, number>;
    revenueLogs: RevenueLog[];
    userRecipes?: UserRecipe[];
    foodStock?: Record<string, number>;
    tavernMenu?: import('../types').TavernMenuState;
    checkedInCharacters?: string[];
    questStates?: QuestStateMap;
    settings?: GameSettings;
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

// --- 角色战斗属性服务（统一导出）---

export { buildCharacterBattleStats, getCharacterBattleStatsFromSaveData };
export type { CharacterBattleStatsResult };

/**
 * 从指定存档读取单个角色的最终战斗属性
 */
export const getCharacterBattleStats = async (
    userId: number,
    slotId: number,
    characterId: string
): Promise<CharacterBattleStatsResult | null> => {
    const saveData = await loadGame(userId, slotId);
    if (!saveData) return null;
    return getCharacterBattleStatsFromSaveData(saveData, characterId);
};

/**
 * 从指定存档读取全部角色的最终战斗属性
 */
export const getAllCharacterBattleStats = async (
    userId: number,
    slotId: number
): Promise<Record<string, CharacterBattleStatsResult> | null> => {
    const saveData = await loadGame(userId, slotId);
    if (!saveData) return null;

    const characterStatsMap = saveData?.characterStats || {};
    const characterEquipmentsMap = saveData?.characterEquipments || {};
    const characterIds = Array.from(new Set([
        ...Object.keys(characterStatsMap),
        ...Object.keys(characterEquipmentsMap)
    ]));

    if (characterIds.length === 0) return {};

    const result: Record<string, CharacterBattleStatsResult> = {};
    characterIds.forEach((characterId) => {
        result[characterId] = getCharacterBattleStatsFromSaveData(saveData, characterId);
    });
    return result;
};

/**
 * 获取指定用户的所有存档槽位信息
 */
export const getSaveSlots = async (userId: number): Promise<GameSaveData[]> => {
    const res = await apiCall('/slots', { userId });
    
    if (res.success && Array.isArray(res.slots)) {
        return res.slots.map((s: any) => ({
            userId,
            slotId: s.slotId,
            label: s.label,
            savedAt: s.savedAt,
            gold: s.gold || 0,
            currentSceneId: s.currentSceneId || '',
            worldState: s.worldState || { dateStr: '', timeStr: '', sceneName: '' },
            characterStats: s.characterStats || {},
            characterEquipments: s.characterEquipments || {},
            battleParty: s.battleParty,
            checkedInCharacters: s.checkedInCharacters,
            sceneLevels: s.sceneLevels
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

// --- 理智账本服务 ---
// --- 理智账本类型配置 ---

/**
 * 理智消耗类型配置
 * 用于客户端显示和类型约束
 */
export const SANITY_CONSUME_TYPES = {
    ai_memory: '对话记忆',
    ai_summary: '摘要压缩',
    quest_instant_complete: '任务立即完成',
} as const;

export type SanityConsumeType = keyof typeof SANITY_CONSUME_TYPES | (string & {});

/**
 * 理智充值类型配置
 * 用于客户端显示和类型约束
 */
export const SANITY_RECHARGE_TYPES = {
    register: '注册赠送',
    recharge: '付费充值',
} as const;

export type SanityRechargeType = keyof typeof SANITY_RECHARGE_TYPES | (string & {});

/** 账本单条记录（查询返回） */
export interface SanityRecord {
    id: number;
    type: string;
    amount: number;
    description: string | null;
    client_ip: string | null;
    created_at: number;
}

/**
 * 记录理智消耗（负值）
 * @param amount 消耗量，传正数，函数内部自动转负
 */
export const consumeSanity = async (
    userId: number,
    type: SanityConsumeType,
    amount: number,
    description?: string
): Promise<boolean> => {
    const res = await apiCall('/sanity/consume', {
        userId,
        type,
        amount,
        description: description || null
    });

    if (!res.success) {
        console.error('[Sanity] Failed to record consume:', res.message);
        return false;
    }

    return true;
};

/**
 * 记录理智充值 / 赠送（正值）
 */
export const rechargeSanity = async (
    userId: number,
    type: SanityRechargeType,
    amount: number,
    description?: string
): Promise<boolean> => {
    const res = await apiCall('/sanity/recharge', {
        userId,
        type,
        amount,
        description: description || null
    });

    if (!res.success) {
        console.error('[Sanity] Failed to record recharge:', res.message);
        return false;
    }

    return true;
};

/**
 * 查询用户理智余额及最近明细
 */
export const getSanityBalance = async (
    userId: number,
    limit: number = 20
): Promise<{ balance: number; records: SanityRecord[] } | null> => {
    const res = await apiCall('/sanity/balance', { userId, limit });

    if (res.success) {
        return { balance: res.balance, records: res.records };
    }

    console.error('[Sanity] Failed to get balance:', res.message);
    return null;
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

/**
 * 获取理智面板概况
 */
      export const getSanityDashboard = async (userId: number): Promise<{ todayRequests: number; chartData: { date: string; amount: number; aiAmount: number }[] } | null> => {
      const res = await apiCall('/sanity/dashboard', { userId });
      if (res.success) {
          return {
              todayRequests: res.todayRequests,
              chartData: res.chartData
          };
    }
    return null;
};

/**
 * 获取理智分页明细
 */
export const getSanityRecords = async (
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    category?: 'all' | 'consume' | 'recharge',
    startTime?: number,
    endTime?: number
): Promise<{ total: number; records: SanityRecord[] } | null> => {
    const body: any = { userId, page, pageSize };
    if (category && category !== 'all') body.category = category;
    if (startTime) body.startTime = startTime;
    if (endTime) body.endTime = endTime;

    const res = await apiCall('/sanity/admin/records', body);
    if (res.success) {
        return { total: res.total, records: res.records };
    }
    return null;
};

// --- 角色技能配置服务 ---

export interface CharacterSkillsData {
    characterId: string;
    slot1: number | null;
    slot2: number | null;
    slot3: number | null;
    slot4: number | null;
    slot5: number | null;
    slot6: number | null;
    slot7: number | null;
    slot8: number | null;
}

export const getCharacterSkills = async (
    userId: number,
    slotId: number,
    characterId: string
): Promise<CharacterSkillsData | null> => {
    const res = await apiCall('/character_skills/get', {
        userId,
        slotId,
        characterId
    });
    
    if (res.success && res.skills) {
        return res.skills;
    }
    
    console.error('Failed to get character skills:', res.message);
    return null;
};

export const updateCharacterSkills = async (
    userId: number,
    slotId: number,
    characterId: string,
    skills: Partial<CharacterSkillsData>
): Promise<boolean> => {
    const res = await apiCall('/character_skills/update', {
        userId,
        slotId,
        characterId,
        skills
    });
    
    if (!res.success) {
        console.error('Failed to update character skills:', res.message);
        return false;
    }
    
    return true;
};

export const getAllCharacterSkills = async (
    userId: number,
    slotId: number
): Promise<Record<string, CharacterSkillsData>> => {
    const res = await apiCall('/character_skills/get_all', {
        userId,
        slotId
    });
    
    if (res.success && res.data) {
        return res.data;
    }
    
    console.error('Failed to get all character skills:', res.message);
    return {};
};
