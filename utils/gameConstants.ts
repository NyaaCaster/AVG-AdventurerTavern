import { SceneId, ManagementStats, CharacterUnlocks } from '../types';

export const SCENE_NAMES: Record<SceneId, string> = {
  'scen_1': '柜台',
  'scen_2': '客房',
  'scen_3': '酒场',
  'scen_4': '训练场',
  'scen_5': '武器店',
  'scen_6': '防具店',
  'scen_7': '温泉',
  'scen_8': '按摩室',
  'scen_9': '库房',
  'scen_10': '道具店',
  // --- 额外场景组（非旅店设施，不可升级）---
  'scen_town': '小镇',
  'scen_guild': '冒险者公会',
  'scen_market': '市集',
};

export const INITIAL_SCENE_LEVELS: Record<string, number> = {
  'scen_1': 1, // 柜台
  'scen_2': 1, // 客房
  'scen_3': 1, // 酒场
  'scen_4': 1, // 训练场
  'scen_5': 0,  // 武器店
  'scen_6': 0,  // 防具店
  'scen_7': 0,  // 温泉
  'scen_8': 0,  // 按摩室
  'scen_9': 1, // 库房
  'scen_10': 1, // 道具店
};

export const INITIAL_CHARACTER_LEVEL: Record<string, number> = {
  'char_1': 1, // {{user}}
  'char_101': 1, // 莉莉娅
  'char_102': 99, // 米娜
  'char_103': 2, // 欧若拉
  'char_104': 4, // 朱迪斯
  'char_105': 9, // 莲华
  'char_106': 7, // 艾琳
  'char_107': 7, // 菲洛
  'char_108': 7, // 卡特琳娜
  'char_109': 5, // 莱拉
  'char_110': 9, // 琉卡
  'char_111': 9, // 吉娜
};

export const INITIAL_CHARACTER_AFFINITY: Record<string, number> = {
  'char_1': 0, // {{user}}
  'char_101': 10, // 莉莉娅
  'char_102': 5, // 米娜
  'char_103': 5, // 欧若拉
  'char_104': 1, // 朱迪斯
  'char_105': 1, // 莲华
  'char_106': 1, // 艾琳
  'char_107': 1, // 菲洛
  'char_108': 1, // 卡特琳娜
  'char_109': 3, // 莱拉
  'char_110': 1, // 琉卡
  'char_111': 1, // 吉娜
};

/**
 * 角色初始武器配置
 * 非战斗人员不配置初始武器
 */
export const INITIAL_CHARACTER_WEAPON: Record<string, string> = {
  'char_1': 'wpn-101', // {{user}} - 木剑
  // 'char_101': '', // 莉莉娅 - 非战斗人员
  // 'char_102': '', // 米娜 - 非战斗人员
  'char_103': 'wpn-201', // 欧若拉 - 《实用魔法大全》
  'char_104': 'wpn-301', // 朱迪斯 - 「三岁准用」
  'char_105': 'wpn-401', // 莲华 - 绑带
  'char_106': 'wpn-501', // 艾琳 - 晾衣杆
  'char_107': 'wpn-201', // 菲洛 - 《实用魔法大全》
  'char_108': 'wpn-101', // 卡特琳娜 - 木剑
  'char_109': 'wpn-601', // 莱拉 - 手斧
  'char_110': 'wpn-701', // 琉卡 - 练习弓
  'char_111': 'wpn-301', // 吉娜 - 「三岁准用」
};

export const INITIAL_GOLD = 100000; // 原：5000
export const MAX_GOLD = 999999; // 金币上限

// --- 灵感系统常量（账号级货币，不随存档变更）---
// 客户端使用灵感(Inspiration)作为显示和传递单位
// 数据库层使用理智(Sanity)作为存储单位，1灵感 = 10000理智
export const INITIAL_INSPIRATION = 10; // 灵感初始值（新账号默认赠送，对应100000理智）
// 灵感无最大值限制，作为充值货币由服务端余额决定上限

export const INITIAL_INVENTORY: Record<string, number> = {
    'res-0001': 99, // 灵木，原：15
    'res-0002': 99, // 幻皮，原：15
    'res-0003': 99, // 魔晶石，原：15
    'res-0101': 10, // 肉干
    'res-0201': 10, // 白萝卜
    'res-0301': 10, // 草菇
    'res-0401': 10, // 面粉
    'res-0501': 10, // 鸡蛋
    'res-0601': 10, // 牛奶
    'res-0701': 30, // 啤酒
    'res-0801': 10, // 果胶
    'res-0901': 10, // 盐
    'itm-01': 5, // 治疗药·小
    'itm-07': 1, // 精灵粉尘
    'wpn-102': 1, // 铁剑
    'arm-201': 1, // 皮甲Lv1
    'spc-00': 1, // 「莫比乌斯」
    // 'spc-05': 2, // 棉绳
};

/**
 * 游戏开始时已入住旅店的角色列表
 * 不在此列表中的角色视为「缺席」，房间显示为空室
 */
export const INITIAL_CHECKED_IN_CHARACTERS: string[] = [
  'char_1', // {{user}} - 玩家角色
  'char_101', // 莉莉娅
  'char_102', // 米娜
  'char_103', // 欧若拉
  // 'char_104', // 朱迪斯
  // 'char_105', // 莲华
  // 'char_106', // 艾琳
  // 'char_107', // 菲洛
  // 'char_109', // 莱拉
  // 'char_108', // 卡特琳娜
  // 'char_110', // 琉卡
  // 'char_111', // 吉娜
];

// 旅店管理初始数据（不包含由设施等级计算的值）
export const INITIAL_MANAGEMENT_STATS = {
    occupancy: 12, // 当前入住人数
    satisfaction: 85, // 满意度
    attraction: 78, // 吸引力
    reputation: 92 // 声望
};

// --- 角色解锁系统常量 ---

/**
 * 特定角色的初始解锁状态
 * 只列出需要特殊初始化的角色和状态，未列出的默认为 0（未解锁）
 */
export const INITIAL_CHARACTER_UNLOCKS: Record<string, Partial<CharacterUnlocks>> = {
    // 莉莉娅 - 旅店老板娘，主角的姐姐
    'char_101': {
        accept_flirt_topic: 1,          // 暧昧话题
        accept_physical_contact: 1      // 身体接触
    },
    // 米娜 - 酒场服务员
    'char_102': {
        accept_flirt_topic: 1,         // 暧昧话题
        accept_physical_contact: 1,    // 身体接触
        accept_indirect_sexual: 1      // 间接性行为
    },
    // 欧若拉
    'char_103': {
        accept_battle_party: 1,         // 战斗组队
        accept_flirt_topic: 1,          // 暧昧话题
        accept_physical_contact: 1,     // 身体接触
        accept_indirect_sexual: 1      // 间接性行为
    },
    // 朱迪斯
    'char_104': {
        accept_physical_contact: 1,     // 身体接触
        accept_direct_sexual: 1         // 直接性行为
    },
    // 吉娜
    'char_111': {
        accept_nsfw_topic: 1            // 色情话题
    }
};
