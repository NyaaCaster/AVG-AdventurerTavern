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
  | 'blind'
  | 'silence'
  | 'berserk'
  | 'confuse'
  | 'charm'
  | 'paralyze'
  | 'hp_regen'
  | 'provoke'
  | 'weakness'
  | 'evasion_up'
  | 'crit_up'
  | 'counter_up';

export type StatusEffectType = 'negative' | 'positive' | 'special';

export interface StatusEffectData {
  /** 状态效果ID */
  id: StatusEffectId;
  /** 显示名称 */
  name: string;
  /** 图标 */
  icon: string;
  /** 描述文本 */
  description: string;
  /** 状态类型：负面/正面/特殊 */
  type: StatusEffectType;
  
  /** 默认持续回合数，-1表示永久或特殊持续时间 */
  defaultDuration: number;
  /** 是否跳过回合 */
  skipTurn: boolean;
  /** 受到物理攻击时是否苏醒 */
  wakeOnPhysicalHit: boolean;
  /** 每回合HP流失百分比 */
  hpDrainPercent: number;
  /** 每回合HP回复百分比 */
  hpRegenPercent: number;
  /** 命中率修正 */
  hitRateModifier: number;
  /** 是否可以使用技能 */
  canUseSkill: boolean;
  /** 是否强制攻击敌人 */
  forceAttackEnemy: boolean;
  /** 是否随机选择目标 */
  randomTarget: boolean;
  /** 是否攻击友方 */
  attackAlly: boolean;
  /** 受到伤害时解除的概率百分比 */
  removeOnDamagePercent: number;
  /** 是否可叠加 */
  canStack: boolean;
  /** 战斗结束后是否持续 */
  persistAfterBattle: boolean;
  /** 受到伤害倍率 */
  damageReceivedMultiplier: number;
  /** 反击率加成 */
  counterRateBonus: number;
  /** 暴击率加成 */
  critRateBonus: number;
  /** 回避率加成 */
  evasionBonus: number;
}

export const STATUS_EFFECTS: Record<StatusEffectId, StatusEffectData> = {
  dead: {
    id: 'dead',
    name: '死亡',
    icon: '⚰️',
    description: '无法战斗，需要技能或道具复活，战斗结束后恢复。',
    type: 'negative',
    defaultDuration: -1,
    skipTurn: true,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: false,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  horny: {
    id: 'horny',
    name: '发情',
    icon: '💗',
    description: '受到女神遗香或特殊攻击的影响，暂时无法通过常规手段解除，直到次日清晨。',
    type: 'special',
    defaultDuration: -1,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: true,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  sleep: {
    id: 'sleep',
    name: '睡眠',
    icon: '💤',
    description: '陷入沉睡，无法采取任何行动，受到物理攻击时会苏醒。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: true,
    wakeOnPhysicalHit: true,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 50,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  stun: {
    id: 'stun',
    name: '晕眩',
    icon: '💫',
    description: '失去平衡或受到重击，暂时无法采取任何行动。',
    type: 'negative',
    defaultDuration: 1,
    skipTurn: true,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  poison: {
    id: 'poison',
    name: '中毒',
    icon: '☠️',
    description: '体内含有毒素，每回合持续损失最大生命值的10%。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0.1,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  blind: {
    id: 'blind',
    name: '暗闇',
    icon: '🌑',
    description: '视力受损，命中率下降50%。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 0.5,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  silence: {
    id: 'silence',
    name: '沈黙',
    icon: '🔇',
    description: '无法使用技能。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: false,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  berserk: {
    id: 'berserk',
    name: '激昂',
    icon: '😡',
    description: '陷入狂暴状态，只能攻击敌人。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: true,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 50,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  confuse: {
    id: 'confuse',
    name: '混乱',
    icon: '😵',
    description: '精神混乱，随机攻击敌我双方。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: true,
    attackAlly: false,
    removeOnDamagePercent: 50,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  charm: {
    id: 'charm',
    name: '魅惑',
    icon: '💕',
    description: '被魅惑控制，转而攻击友方。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: true,
    removeOnDamagePercent: 50,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  paralyze: {
    id: 'paralyze',
    name: '麻痺',
    icon: '⚡',
    description: '身体麻痹，无法采取任何行动。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: true,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  hp_regen: {
    id: 'hp_regen',
    name: 'HP再生',
    icon: '💚',
    description: '每回合回复10%最大HP。',
    type: 'positive',
    defaultDuration: 4,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0.1,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  provoke: {
    id: 'provoke',
    name: '挑衅',
    icon: '😤',
    description: '被敌人敌视，被攻击概率上升。',
    type: 'negative',
    defaultDuration: 5,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  weakness: {
    id: 'weakness',
    name: '弱点暴露',
    icon: '🎯',
    description: '弱点被暴露，受到的伤害增加20%。',
    type: 'negative',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1.2,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0
  },
  evasion_up: {
    id: 'evasion_up',
    name: '回避率提升',
    icon: '💨',
    description: '回避率提升10%。',
    type: 'positive',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0,
    evasionBonus: 0.1
  },
  crit_up: {
    id: 'crit_up',
    name: '暴击率提升',
    icon: '💥',
    description: '暴击率提升10%。',
    type: 'positive',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0,
    critRateBonus: 0.1,
    evasionBonus: 0
  },
  counter_up: {
    id: 'counter_up',
    name: '反击率提升',
    icon: '🔄',
    description: '反击率提升10%。',
    type: 'positive',
    defaultDuration: 3,
    skipTurn: false,
    wakeOnPhysicalHit: false,
    hpDrainPercent: 0,
    hpRegenPercent: 0,
    hitRateModifier: 1,
    canUseSkill: true,
    forceAttackEnemy: false,
    randomTarget: false,
    attackAlly: false,
    removeOnDamagePercent: 0,
    canStack: false,
    persistAfterBattle: false,
    damageReceivedMultiplier: 1,
    counterRateBonus: 0.1,
    critRateBonus: 0,
    evasionBonus: 0
  }
};

export const STATUS_EFFECT_ID_MAP: Record<number, StatusEffectId> = {
  1: 'dead',
  4: 'poison',
  5: 'blind',
  6: 'silence',
  7: 'berserk',
  8: 'confuse',
  9: 'charm',
  10: 'sleep',
  11: 'provoke',
  12: 'paralyze',
  13: 'stun',
  15: 'hp_regen',
  1000: 'horny',
  1001: 'weakness',
  1103: 'evasion_up',
  1105: 'crit_up',
  1107: 'counter_up'
};

export function getStatusEffectByDataId(dataId: number): StatusEffectData | undefined {
  const id = STATUS_EFFECT_ID_MAP[dataId];
  return id ? STATUS_EFFECTS[id] : undefined;
}
