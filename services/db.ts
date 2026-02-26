mport { WorldState, ManagementStats, RevenueLog, UserRecipe, GameSettings, CharacterUnlocks } from '../types';
import { AppConfig } from '../config';

// 閰嶇疆鏈嶅姟鍣ㄥ湴鍧€
// 浠?config.ts 涓鍙栭厤缃紝鏂逛究缁熶竴绠＄悊
const API_BASE_URL = AppConfig.apiBaseUrl;

// --- 鎺ュ彛瀹氫箟 ---

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
  characterStats?: Record<string, { level: number; affinity: number }>;
}

// --- API 杈呭姪鍑芥暟 ---

const apiCall = async (endpoint: string, body: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            mode: 'cors', // 鏄惧紡澹版槑璺ㄥ煙妯″紡
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`API Call Failed [${endpoint}]:`, e);
        return { success: false, message: `鏃犳硶杩炴帴鍒版湇鍔″櫒 (${API_BASE_URL})銆俓n璇锋鏌?\n1. server/config.js 閰嶇疆鏄惁姝ｇ‘\n2. 鍚庣鏈嶅姟鏄惁杩愯` };
    }
};

// --- 鐢ㄦ埛璁よ瘉鏈嶅姟 ---

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number }> => {
    const res = await apiCall('/register', { username, password });
    return res;
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number }> => {
    const res = await apiCall('/login', { username, password });
    return res;
};

// --- 瀛樻。鏈嶅姟灞傚嚱鏁?---

/**
 * 鎵ц瀛樻。鎿嶄綔 (涓婁紶鍒版湇鍔″櫒)
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
        data // 鐩存帴鍙戦€佹暣涓璞?    });
    
    if (!res.success) {
        console.error("Save failed:", res.message);
        alert("淇濆瓨澶辫触: " + (res.message || "鏈嶅姟鍣ㄦ棤鍝嶅簲"));
    }
};

/**
 * 璇诲彇瀛樻。鏁版嵁 (浠庢湇鍔″櫒涓嬭浇)
 */
export const loadGame = async (userId: number, slotId: number) => {
    const res = await apiCall('/load', { userId, slotId });
    
    if (res.success && res.data) {
        return {
            ...res.data,
            savedAt: Date.now() // 鏈嶅姟鍣ㄨ嫢鏈繑鍥炴椂闂达紝浣跨敤褰撳墠鏃堕棿
        };
    }
    return null;
};

/**
 * 鑾峰彇鎸囧畾鐢ㄦ埛鐨勬墍鏈夊瓨妗ｆЫ浣嶄俊鎭? */
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
            characterStats: s.characterStats || {}
        }));
    }
    return [];
};

/**
 * 鍒犻櫎瀛樻。
 */
export const deleteGame = async (userId: number, slotId: number) => {
    await apiCall('/delete', { userId, slotId });
};

/**
 * 娓呴櫎鎵€鏈夋暟鎹?(鏈湴搴熷純)
 */
export const clearAllData = async () => {
    console.warn("clearAllData is deprecated in Cloud Mode");
};

// --- 瑙掕壊瑙ｉ攣鐘舵€佹湇鍔?---

/**
 * 鑾峰彇鍗曚釜瑙掕壊鐨勮В閿佺姸鎬? */
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
 * 鏇存柊瑙掕壊瑙ｉ攣鐘舵€? */
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
 * 鎵归噺鑾峰彇鎵€鏈夎鑹茬殑瑙ｉ攣鐘舵€? */
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

// --- AI 鑱婂ぉ璁板繂绯荤粺鏈嶅姟 ---

/**
 * 鑾峰彇瑙掕壊鐨勮亰澶╁巻鍙诧紙鐭湡宸ヤ綔璁板繂锛? */
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
 * 娣诲姞涓€鏉℃柊鐨勮亰澶╄褰? */
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
 * 鑾峰彇瑙掕壊鐨勬牳蹇冭蹇嗭紙闀挎湡璁板繂锛? */
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
 * 鎵归噺娣诲姞鏍稿績璁板繂
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
 * 鍚屾瀛樻。妲戒綅鐨勮亰澶╁拰璁板繂鏁版嵁
 * 鐢ㄤ簬鎵嬪姩瀛樻。鏃讹紝灏嗗綋鍓嶅璇濈幆澧冨鍒跺埌鐩爣妲戒綅
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
 * 鏇存柊瑙掕壊鐨勫巻鍙叉憳瑕侊紙婊氬姩鏇存柊锛? */
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
 * 鍒犻櫎宸叉€荤粨鐨勬棫瀵硅瘽璁板綍
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

