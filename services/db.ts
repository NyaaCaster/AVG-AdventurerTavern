
import Dexie, { type Table } from 'dexie';
import { WorldState, ManagementStats, RevenueLog, SceneId } from '../types';

// --- 数据库记录接口定义 ---

// 0. 用户表 (新增)
export interface UserData {
  id?: number; // UID, 自增, max 65535
  username: string; // 唯一索引
  password: string; // 明文存储 (原型阶段)
  createdAt: number;
}

// 1. 存档主表：记录全局状态
export interface GameSaveData {
  id?: number;
  userId: number; // 新增：关联用户ID
  slotId: number; // 0: 自动存档, 1-3: 手动存档
  label: string;  // 存档显示名称 (如 "第5天 - 12:00")
  savedAt: number; // 时间戳
  gold: number;
  currentSceneId: string;
  worldState: WorldState;
  managementStats: ManagementStats;
}

// 2. 道具关联表
export interface SavedInventoryItem {
  id?: number;
  saveId: number; // 外键 -> GameSaveData.id
  itemId: string;
  count: number;
}

// 3. 角色状态关联表
export interface SavedCharacterState {
  id?: number;
  saveId: number; // 外键
  charId: string;
  level: number;
  affinity: number;
}

// 4. 设施等级关联表
export interface SavedFacilityState {
  id?: number;
  saveId: number; // 外键
  facilityId: string;
  level: number;
}

// 5. 营收日志关联表
export interface SavedRevenueLog {
  id?: number;
  saveId: number; // 外键
  logId: string;  // 原始日志ID
  timestamp: number;
  dateStr: string;
  timeStr: string;
  type: 'accommodation' | 'tavern';
  amount: number;
}

// --- 数据库类定义 ---

export class AdventurerTavernDB extends Dexie {
  users!: Table<UserData>;
  saves!: Table<GameSaveData>;
  savedInventory!: Table<SavedInventoryItem>;
  savedCharacters!: Table<SavedCharacterState>;
  savedFacilities!: Table<SavedFacilityState>;
  savedRevenueLogs!: Table<SavedRevenueLog>;

  constructor() {
    super('AdventurerTavernDB');
    
    // 版本升级：添加 users 表，更新 saves 索引
    // userId+slotId 复合索引用于确保每个用户的每个槽位唯一
    (this as any).version(2).stores({
      users: '++id, &username', 
      saves: '++id, userId, [userId+slotId]', 
      savedInventory: '++id, saveId, itemId',
      savedCharacters: '++id, saveId, charId',
      savedFacilities: '++id, saveId, facilityId',
      savedRevenueLogs: '++id, saveId, timestamp'
    });
  }
}

export const db = new AdventurerTavernDB();

// --- 用户认证服务 ---

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number }> => {
  try {
    // 检查用户名是否存在
    const existing = await db.users.where('username').equals(username).first();
    if (existing) {
      return { success: false, message: '用户名已存在' };
    }

    // 检查 UID 上限 (虽然 Dexie 自增很难达到 65535，但按需求检查)
    const count = await db.users.count();
    if (count >= 65535) {
        return { success: false, message: '服务器人数已满 (UID Limit)' };
    }

    // 创建用户
    const uid = await db.users.add({
      username,
      password,
      createdAt: Date.now()
    });

    // 双重检查 UID (Dexie 返回的主键)
    if (Number(uid) > 65535) {
        await db.users.delete(uid);
        return { success: false, message: 'UID 超出范围' };
    }

    return { success: true, message: '注册成功', uid: Number(uid) };
  } catch (e: any) {
    console.error("Registration error:", e);
    return { success: false, message: `注册失败: ${e.message}` };
  }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message: string; uid?: number }> => {
  try {
    const user = await db.users.where('username').equals(username).first();
    if (!user) {
      return { success: false, message: '用户名不存在' };
    }
    if (user.password !== password) {
      return { success: false, message: '密码错误' };
    }
    return { success: true, message: '登录成功', uid: user.id };
  } catch (e: any) {
    return { success: false, message: `登录错误: ${e.message}` };
  }
};

// --- 存档服务层函数 (已更新支持 userId) ---

/**
 * 执行存档操作
 * 这是一个事务操作，会先清理该用户同槽位的旧数据，然后写入新数据
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
  }
) => {
  return (db as any).transaction('rw', db.saves, db.savedInventory, db.savedCharacters, db.savedFacilities, db.savedRevenueLogs, async () => {
    // 1. 查找并清理该用户该槽位的旧存档
    const existingSave = await db.saves.where({ userId, slotId }).first();
    
    if (existingSave && existingSave.id) {
        // 级联删除关联数据
        await db.savedInventory.where({ saveId: existingSave.id }).delete();
        await db.savedCharacters.where({ saveId: existingSave.id }).delete();
        await db.savedFacilities.where({ saveId: existingSave.id }).delete();
        await db.savedRevenueLogs.where({ saveId: existingSave.id }).delete();
        // 删除主记录
        await db.saves.delete(existingSave.id);
    }

    // 2. 写入新的主存档记录
    const saveId = await db.saves.add({
        userId,
        slotId,
        label,
        savedAt: Date.now(),
        gold: data.gold,
        currentSceneId: data.currentSceneId,
        worldState: data.worldState,
        managementStats: data.managementStats
    });

    const numericSaveId = Number(saveId);

    // 3. 批量写入关联数据 (比单条写入快得多)
    
    // Inventory
    const invItems = Object.entries(data.inventory).map(([itemId, count]) => ({
        saveId: numericSaveId,
        itemId,
        count
    }));
    if (invItems.length > 0) await db.savedInventory.bulkAdd(invItems);

    // Characters
    const charStates = Object.entries(data.characterStats).map(([charId, stats]) => ({
        saveId: numericSaveId,
        charId,
        level: stats.level,
        affinity: stats.affinity
    }));
    if (charStates.length > 0) await db.savedCharacters.bulkAdd(charStates);

    // Facilities
    const facStates = Object.entries(data.sceneLevels).map(([facilityId, level]) => ({
        saveId: numericSaveId,
        facilityId,
        level
    }));
    if (facStates.length > 0) await db.savedFacilities.bulkAdd(facStates);

    // Revenue Logs (仅保留最近的100条以节省空间)
    const logsToSave = data.revenueLogs.slice(0, 100).map(log => ({
        saveId: numericSaveId,
        logId: log.id,
        timestamp: log.timestamp,
        dateStr: log.dateStr,
        timeStr: log.timeStr,
        type: log.type,
        amount: log.amount
    }));
    if (logsToSave.length > 0) await db.savedRevenueLogs.bulkAdd(logsToSave);
  });
};

/**
 * 读取存档数据
 */
export const loadGame = async (userId: number, slotId: number) => {
    const save = await db.saves.where({ userId, slotId }).first();
    if (!save || !save.id) return null;

    const saveId = save.id;

    // 并行获取所有关联数据
    const [invItems, charStates, facStates, dbLogs] = await Promise.all([
        db.savedInventory.where({ saveId }).toArray(),
        db.savedCharacters.where({ saveId }).toArray(),
        db.savedFacilities.where({ saveId }).toArray(),
        db.savedRevenueLogs.where({ saveId }).sortBy('timestamp')
    ]);

    // 重构数据结构以匹配应用状态
    const inventory: Record<string, number> = {};
    invItems.forEach(item => inventory[item.itemId] = item.count);

    const characterStats: Record<string, { level: number; affinity: number }> = {};
    charStates.forEach(c => characterStats[c.charId] = { level: c.level, affinity: c.affinity });

    const sceneLevels: Record<string, number> = {};
    facStates.forEach(f => sceneLevels[f.facilityId] = f.level);

    // 日志在 DB 中按时间戳升序排序，这里反转回降序（UI通常显示最新在最前）
    const revenueLogs: RevenueLog[] = dbLogs.reverse().map(l => ({
        id: l.logId,
        timestamp: l.timestamp,
        dateStr: l.dateStr,
        timeStr: l.timeStr,
        type: l.type,
        amount: l.amount
    }));

    return {
        gold: save.gold,
        currentSceneId: save.currentSceneId as SceneId,
        worldState: save.worldState,
        managementStats: save.managementStats,
        inventory,
        characterStats,
        sceneLevels,
        revenueLogs,
        savedAt: save.savedAt
    };
};

/**
 * 获取指定用户的所有存档槽位信息
 */
export const getSaveSlots = async (userId: number) => {
    return await db.saves.where('userId').equals(userId).toArray();
};

/**
 * 清除所有数据 (危险操作)
 */
export const clearAllData = async () => {
    await (db as any).delete();
    await (db as any).open();
};
