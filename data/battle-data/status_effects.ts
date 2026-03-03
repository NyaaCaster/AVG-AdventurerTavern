/**
 * 战斗系统 - 异常状态枚举与配置表
 * 用于各系统的逻辑判断与前端 UI 的显示
 */

export type StatusEffectId = 
  | 'dead'
  | 'horny'
  | 'sleep'
  | 'stun'
  | 'poison'
  | 'bleed';

export type StatusEffectType = 'negative' | 'special';

export interface StatusEffectData {
  id: StatusEffectId;
  name: string;
  icon: string;
  description: string;
  type: StatusEffectType;
  
  // --- 战斗系统逻辑参数 ---
  /** 默认持续回合数 (-1 表示永久，直到特定条件或战斗结束解除) */
  defaultDuration: number;
  /** 是否导致角色在回合中无法行动(跳过回合) */
  skipTurn: boolean;
  /** 是否在受到物理攻击时立刻解除此状态 */
  wakeOnPhysicalHit: boolean;
  /** 每回合结束时流失的最大HP百分比 (例如 0.05 代表 5%) */
  hpDrainPercent: number;
  /** 当角色已存在该状态时，再次被施加此状态是否能附加上去 (true为可叠加/刷新，false为免疫/不附加) */
  canStack: boolean;
  /** 战斗结束时是否保留该状态 (true: 战斗外持续保留，false: 战斗结束自动解除) */
  persistAfterBattle: boolean;
}

export const STATUS_EFFECTS: Record<StatusEffectId, StatusEffectData> = {
  dead: {
    id: 'dead',
    name: '死亡',
    icon: '⚰️',
    description: '无法战斗，需要复活道具或在旅店休息恢复。',
    type: 'negative',
    defaultDuration: -1,
    skipTurn: true,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    canStack: false,
    persistAfterBattle: true
  },
  horny: {
    id: 'horny',
    name: '发情',
    icon: '💗',
    description: '受到女神遗香或特殊攻击的影响，暂时无法通过常规手段解除，直到次日清晨。',
    type: 'special',
    defaultDuration: -1, // 持续到次日清晨
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    canStack: false,
    persistAfterBattle: true
  },
  sleep: {
    id: 'sleep',
    name: '昏睡',
    icon: '💤',
    description: '陷入沉睡，无法采取任何行动，受到物理攻击时会苏醒。',
    type: 'negative',
    defaultDuration: 5,
    skipTurn: true,
    wakeOnPhysicalHit: true,
    hpDrainPercent: 0,
    canStack: false,
    persistAfterBattle: false
  },
  stun: {
    id: 'stun',
    name: '晕眩',
    icon: '🌀',
    description: '失去平衡或受到重击，暂时无法采取任何行动。',
    type: 'negative',
    defaultDuration: 5,
    skipTurn: true,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    canStack: false,
    persistAfterBattle: false
  },
  poison: {
    id: 'poison',
    name: '中毒',
    icon: '☠️',
    description: '体内含有毒素，每回合持续损失最大生命值的5%。',
    type: 'negative',
    defaultDuration: 5,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0.05,
    canStack: false,
    persistAfterBattle: false
  },
  bleed: {
    id: 'bleed',
    name: '流血',
    icon: '🩸',
    description: '伤口无法愈合，每回合持续损失最大生命值的5%。',
    type: 'negative',
    defaultDuration: 5,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0.05,
    canStack: false,
    persistAfterBattle: false
  }
};
