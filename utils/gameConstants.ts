
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
  'scen_10': '道具店'
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

export const INITIAL_CHARACTER_STATS: Record<string, { level: number; affinity: number }> = {
  'char_101': { level: 1, affinity: 10 }, // 莉莉娅
  'char_102': { level: 99, affinity: 5 }, // 米娜
  'char_103': { level: 2, affinity: 5 }, // 欧若拉
  'char_104': { level: 4, affinity: 1 }, // 朱迪斯
  'char_105': { level: 9, affinity: 1 }, // 莲华
  'char_106': { level: 7, affinity: 1 }, // 艾琳
  'char_107': { level: 7, affinity: 1 }, // 菲洛
  'char_108': { level: 7, affinity: 1 }, // 卡特琳娜
  'char_109': { level: 5, affinity: 3 }, // 莱拉
  'char_110': { level: 9, affinity: 1 }, // 琉卡
  'char_111': { level: 9, affinity: 1 }, // 吉娜
};

export const INITIAL_GOLD = 100000;

export const INITIAL_INVENTORY: Record<string, number> = {
    'res-0001': 1500, // 灵木
    'res-0002': 1500, // 幻皮
    'res-0003': 1500, // 魔晶石
    'res-0101': 99, // 狂暴兔肉
    'res-0201': 99, // 青菜
    'res-0301': 99, // 发光菌伞
    'res-0401': 99, // 面粉
    'res-0501': 99, // 渡鸦蛋
    'res-0601': 99, // 牛奶
    'res-0701': 99, // 啤酒
    'res-0801': 99, // 史莱姆凝胶
    'res-0901': 99, // 木灵的胡椒
    'itm-01': 5, // 治疗药·小
    'itm-07': 1, // 精灵粉尘
    'wpn-102': 1, // 铁剑
    'arm-201': 1, // 皮甲Lv1
    'spc-00': 1, // 「莫比乌斯」
    'spc-05': 2, // 棉绳
};

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
