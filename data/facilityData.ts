
import { SceneId } from '../types';

export interface FacilityConfig {
  id: SceneId;
  name: string;
  maxLevel: number;
  // 升级消耗基数
  baseCostGold: number;
  baseCostMat: number; // 灵木、幻皮、魔晶石
  
  // 依赖限制
  unlockInnLevel: number; // 出现该设施建设选项所需的宿屋等级
  dependencyFactor?: number; // 最大等级 = 宿屋等级 / factor (或者 * factor)
  dependencyType: 'multiply' | 'divide'; // 依赖计算方式
  
  // 描述生成函数
  getEffectDescription: (level: number) => string;
}

export const FACILITY_DATA: Partial<Record<SceneId, FacilityConfig>> = {
  'scen_1': {
    id: 'scen_1',
    name: '柜台',
    maxLevel: 100,
    baseCostGold: 3000,
    baseCostMat: 10,
    unlockInnLevel: 1,
    dependencyType: 'multiply', // 自身无依赖
    getEffectDescription: (level) => `客房基础价格: ${50 + (level - 1) * 10} G`,
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
    getEffectDescription: (level) => `住宿人数上限: ${20 + (level - 1) * 5} 人`,
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
      const slots = 1 + Math.floor((level - 1) / 5);
      const bonus = (level - 1) * 2;
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
    getEffectDescription: (level) => `训练经验值: ${50 + (level - 1) * 25}`,
  },
  'scen_5': {
    id: 'scen_5',
    name: '武器店',
    maxLevel: 6,
    baseCostGold: 5000,
    baseCostMat: 30,
    unlockInnLevel: 10,
    dependencyFactor: 10, // MaxLv = InnLv / 10 (即每10级宿屋升1级)
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "未建设";
        const qualities = ['E', 'D', 'C', 'B', 'A', 'S'];
        return `出售武器品质: ${qualities[Math.min(level - 1, 5)]}`;
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
        const qualities = ['E', 'D', 'C', 'B', 'A', 'S'];
        return `出售防具品质: ${qualities[Math.min(level - 1, 5)]}`;
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
        // 初始10%，每级线性增长到200%。Lv1=10, Lv20=200. 每级+10%
        return `生命恢复加成: +${level * 10}%`;
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
        // 初始5%，每级线性增长到100%。Lv1=5, Lv20=100. 每级+5%
        return `魔力恢复加成: +${level * 5}%`;
    },
  },
};

export const UPGRADE_MATERIALS = [
    { id: 'res-0001', name: '灵木' },
    { id: 'res-0002', name: '幻皮' },
    { id: 'res-0003', name: '魔晶石' }
];
