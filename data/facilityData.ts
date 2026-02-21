
import { SceneId } from '../types';

export interface FacilityConfig {
  id: SceneId;
  name: string;
  maxLevel: number;
  // 升级消耗基数
  baseCostGold: number;
  baseCostMat: number; // 灵木、幻皮、魔晶石
  
  // 依赖限制
  unlockInnLevel: number; // 出现该设施建设选项所需的柜台等级
  dependencyFactor?: number; // 最大等级 = 柜台等级 / factor (或者 * factor)
  dependencyType: 'multiply' | 'divide'; // 依赖计算方式
  
  // 描述生成函数
  getEffectDescription: (level: number) => string;
}

// 导出计算函数，供其他模块使用（需要先定义，因为 FACILITY_DATA 会引用它们）

// 柜台 (scen_1) - 客房基础价格
export const calculateRoomPrice = (innLevel: number) => {
  return 50 + (innLevel - 1) * 10;
};

// 客房区域 (scen_2) - 住宿人数上限
export const calculateMaxOccupancy = (roomLevel: number) => {
  return 20 + (roomLevel - 1) * 5;
};

// 酒场 (scen_3) - 餐饮溢价和栏位
export const calculateTavernBonus = (tavernLevel: number) => {
  const bonus = (tavernLevel - 1) * 2;
  const slots = 1 + Math.floor((tavernLevel - 1) / 5);
  return { bonus, slots };
};

// 训练场 (scen_4) - 训练经验值
export const calculateTrainingExp = (trainingLevel: number) => {
  return 50 + (trainingLevel - 1) * 25;
};

// 武器店 (scen_5) - 出售武器品质
export const calculateWeaponQuality = (weaponShopLevel: number) => {
  if (weaponShopLevel === 0) return null;
  const qualities = ['E', 'D', 'C', 'B', 'A', 'S'];
  return qualities[Math.min(weaponShopLevel - 1, 5)];
};

// 防具店 (scen_6) - 出售防具品质
export const calculateArmorQuality = (armorShopLevel: number) => {
  if (armorShopLevel === 0) return null;
  const qualities = ['E', 'D', 'C', 'B', 'A', 'S'];
  return qualities[Math.min(armorShopLevel - 1, 5)];
};

// 露天温泉 (scen_7) - 生命恢复加成
export const calculateHotSpringBonus = (hotSpringLevel: number) => {
  if (hotSpringLevel === 0) return 0;
  return hotSpringLevel * 10; // Lv1=10%, Lv20=200%
};

// 按摩室 (scen_8) - 魔力恢复加成
export const calculateMassageBonus = (massageLevel: number) => {
  if (massageLevel === 0) return 0;
  return massageLevel * 5; // Lv1=5%, Lv20=100%
};

export const FACILITY_DATA: Partial<Record<SceneId, FacilityConfig>> = {
  'scen_1': {
    id: 'scen_1',
    name: '柜台',
    maxLevel: 100,
    baseCostGold: 3000,
    baseCostMat: 10,
    unlockInnLevel: 1,
    dependencyType: 'multiply', // 自身无依赖
    getEffectDescription: (level) => `客房基础价格: ${calculateRoomPrice(level)} G`,
  },
  'scen_2': {
    id: 'scen_2',
    name: '客房区域',
    maxLevel: 50,
    baseCostGold: 2000,
    baseCostMat: 5,
    unlockInnLevel: 1,
    dependencyFactor: 1, // MaxLv = InnLv
    dependencyType: 'multiply',
    getEffectDescription: (level) => `住宿人数上限: ${calculateMaxOccupancy(level)} 人`,
  },
  'scen_3': {
    id: 'scen_3',
    name: '酒场',
    maxLevel: 50,
    baseCostGold: 1000,
    baseCostMat: 5,
    unlockInnLevel: 1,
    dependencyFactor: 1, // MaxLv = InnLv
    dependencyType: 'multiply',
    getEffectDescription: (level) => {
      const { bonus, slots } = calculateTavernBonus(level);
      return `餐饮溢价 +${bonus}% / 栏位: ${slots}`;
    },
  },
  'scen_4': {
    id: 'scen_4',
    name: '训练场',
    maxLevel: 30,
    baseCostGold: 3000,
    baseCostMat: 10,
    unlockInnLevel: 1,
    dependencyFactor: 1, // MaxLv = InnLv
    dependencyType: 'multiply',
    getEffectDescription: (level) => `训练经验值: ${calculateTrainingExp(level)}`,
  },
  'scen_5': {
    id: 'scen_5',
    name: '武器店',
    maxLevel: 6,
    baseCostGold: 5000,
    baseCostMat: 30,
    unlockInnLevel: 10,
    dependencyFactor: 10, // MaxLv = InnLv / 10 (即每10级柜台升1级)
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "未建设";
        const quality = calculateWeaponQuality(level);
        return `出售武器品质: ${quality}`;
    },
  },
  'scen_6': {
    id: 'scen_6',
    name: '防具店',
    maxLevel: 6,
    baseCostGold: 5000,
    baseCostMat: 30,
    unlockInnLevel: 10,
    dependencyFactor: 10, // MaxLv = InnLv / 10
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "未建设";
        const quality = calculateArmorQuality(level);
        return `出售防具品质: ${quality}`;
    },
  },
  'scen_7': {
    id: 'scen_7',
    name: '露天温泉',
    maxLevel: 20,
    baseCostGold: 2500,
    baseCostMat: 25,
    unlockInnLevel: 5,
    dependencyFactor: 5, // MaxLv = InnLv / 5
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "未建设";
        const bonus = calculateHotSpringBonus(level);
        return `生命恢复加成: +${bonus}%`;
    },
  },
  'scen_8': {
    id: 'scen_8',
    name: '按摩室',
    maxLevel: 20,
    baseCostGold: 2500,
    baseCostMat: 25,
    unlockInnLevel: 5,
    dependencyFactor: 5, // MaxLv = InnLv / 5
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "未建设";
        const bonus = calculateMassageBonus(level);
        return `魔力恢复加成: +${bonus}%`;
    },
  },
};

export const UPGRADE_MATERIALS = [
    { id: 'res-0001', name: '灵木' },
    { id: 'res-0002', name: '幻皮' },
    { id: 'res-0003', name: '魔晶石' }
];
