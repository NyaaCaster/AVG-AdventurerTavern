/**
 * 战斗系统 - 类型定义模块
 * 定义战斗系统中使用的所有接口、枚举和类型
 */

/** 伤害类型枚举 */
export enum DamageType {
  /** 无伤害 */
  NONE = 0,
  /** HP伤害 */
  HP_DAMAGE = 1,
  /** HP回复 */
  HP_RECOVERY = 3,
  /** HP吸收 */
  HP_ABSORB = 5
}

/** 效果代码枚举 */
export enum EffectCode {
  /** 添加状态 */
  ADD_STATE = 21,
  /** 移除状态 */
  REMOVE_STATE = 22,
  /** 添加增益 */
  ADD_BUFF = 31,
  /** 添加减益 */
  ADD_DEBUFF = 32,
  /** 移除增益 */
  REMOVE_BUFF = 33,
  /** 移除减益 */
  REMOVE_DEBUFF = 34,
  /** 特殊效果 */
  SPECIAL = 44
}

/** 技能范围枚举 */
export enum SkillScope {
  /** 无目标 */
  NONE = 0,
  /** 敌方单体 */
  ENEMY_SINGLE = 1,
  /** 敌方全体 */
  ENEMY_ALL = 2,
  /** 敌方全体(连续) */
  ENEMY_ALL_CONTINUOUS = 3,
  /** 敌方随机1体 */
  ENEMY_RANDOM_SINGLE = 4,
  /** 敌方随机2体 */
  ENEMY_RANDOM_X2 = 5,
  /** 我方单体 */
  ALLY_SINGLE = 6,
  /** 我方全体 */
  ALLY_ALL = 7,
  /** 我方全体(连续) */
  ALLY_ALL_CONTINUOUS = 8,
  /** 自身 */
  SELF = 9,
  /** 自身影响我方全体 */
  SELF_AFFECT_ALLY_ALL = 10,
  /** 敌方单体(连续) */
  ENEMY_SINGLE_CONTINUOUS = 11
}

/** 阵营枚举 */
export enum Faction {
  /** 玩家阵营 */
  PLAYER = 'player',
  /** 敌人阵营 */
  ENEMY = 'enemy'
}

/** 属性枚举 */
export enum ElementType {
  /** 无属性 */
  NONE = 0,
  /** 火属性 */
  FIRE = 1,
  /** 冰属性 */
  ICE = 2,
  /** 雷属性 */
  THUNDER = 3,
  /** 水属性 */
  WATER = 4,
  /** 土属性 */
  EARTH = 5,
  /** 风属性 */
  WIND = 6,
  /** 光属性 */
  LIGHT = 7,
  /** 暗属性 */
  DARK = 8
}

import type { StatusEffectType } from '../data/battle-data/status_effects';
export type { StatusEffectType };

/** 战斗属性接口 */
export interface BattleStats {
  /** 最大HP */
  maxHp: number;
  /** 当前HP */
  hp: number;
  /** 最大MP */
  maxMp: number;
  /** 当前MP */
  mp: number;
  /** 物理攻击 */
  atk: number;
  /** 物理防御 */
  def: number;
  /** 魔法攻击 */
  matk: number;
  /** 魔法防御 */
  mdef: number;
  /** 敏捷 */
  agi: number;
  /** 幸运 */
  luk: number;
}

/** 增益/减益修饰符接口 */
export interface BuffModifier {
  /** 影响的属性 */
  stat: keyof Pick<BattleStats, 'atk' | 'def' | 'matk' | 'mdef' | 'agi' | 'luk'>;
  /** 增益数值 */
  value: number;
  /** 剩余回合数 */
  turnsRemaining: number;
  /** 是否为减益 */
  isDebuff: boolean;
}

/** 状态效果实例接口 */
export interface StatusEffectInstance {
  /** 状态效果ID */
  effectId: number;
  /** 状态名称 */
  name: string;
  /** 状态图标 */
  icon: string;
  /** 状态类型 */
  type: StatusEffectType;
  /** 剩余回合数 */
  turnsRemaining: number;
  /** 是否跳过回合 */
  skipTurn: boolean;
  /** 受到物理攻击是否苏醒 */
  wakeOnPhysicalHit: boolean;
  /** HP流失百分比 */
  hpDrainPercent: number;
  /** HP回复百分比 */
  hpRegenPercent: number;
  /** 命中率修正 */
  hitRateModifier: number;
  /** 是否能使用技能 */
  canUseSkill: boolean;
  /** 是否强制攻击敌人 */
  forceAttackEnemy: boolean;
  /** 是否随机选择目标 */
  randomTarget: boolean;
  /** 是否攻击友方 */
  attackAlly: boolean;
  /** 受伤时解除概率 */
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
  /** 闪避率加成 */
  evasionBonus: number;
}

/** 战斗单位接口 */
export interface BattleUnit {
  /** 单位唯一ID */
  id: string;
  /** 单位名称 */
  name: string;
  /** 所属阵营 */
  faction: Faction;
  /** 战斗位置 */
  position: number;
  /** 单位等级 (1-99) */
  level: number;
  /** 当前属性 */
  stats: BattleStats;
  /** 基础属性 */
  baseStats: BattleStats;
  /** 增益/减益列表 */
  buffs: BuffModifier[];
  /** 状态效果列表 */
  statusEffects: StatusEffectInstance[];
  /** 是否存活 */
  isAlive: boolean;
  /** 是否防御中 */
  isGuarding: boolean;
  /** 技能冷却映射 */
  cooldowns: Map<number, number>;
}

/** 技能效果接口 */
export interface SkillEffect {
  /** 效果代码 */
  code: EffectCode;
  /** 效果关联数据ID */
  dataId: number;
  /** 效果参数1 */
  value1: number;
  /** 效果参数2 */
  value2: number;
}

/** 技能伤害配置接口 */
export interface SkillDamage {
  /** 伤害类型 */
  type: DamageType;
  /** 属性ID */
  elementId: ElementType;
  /** 伤害公式 */
  formula?: string;
  /** 伤害浮动百分比 */
  variance?: number;
  /** 是否可暴击 */
  critical?: boolean;
}

/** 技能数据接口 */
export interface SkillData {
  /** 技能ID */
  id: number;
  /** 技能名称 */
  name: string;
  /** 技能描述 */
  description: string;
  /** 目标范围 */
  scope: SkillScope;
  /** MP消耗 */
  mpCost: number;
  /** 伤害配置 */
  damage?: SkillDamage;
  /** 效果列表 */
  effects?: SkillEffect[];
  /** 速度修正 */
  speed: number;
  /** 成功率 */
  successRate: number;
  /** 重复次数 */
  repeats: number;
  /** 命中类型：0=必定命中、1=物理、2=魔法 */
  hitType: number;
  /** 冷却回合数 */
  cooldown?: number;
  /** 备注标签 */
  note?: string;
  /** 是否被动技能 */
  isPassive?: boolean;
  /** AI配置（由ConditionParser解析note生成） */
  aiConfig?: import('./ai/types').SkillAIConfig;
}

/** 伤害结果接口 */
export interface DamageResult {
  /** 伤害/治疗数值 */
  value: number;
  /** 是否暴击 */
  isCritical: boolean;
  /** 是否为治疗 */
  isHealing: boolean;
  /** 是否为吸收 */
  isAbsorb: boolean;
  /** 属性类型 */
  element: ElementType;
  /** 浮动因子 */
  variance: number;
}

/** 反击结果接口 */
export interface CounterAttackResult {
  /** 是否触发 */
  triggered: boolean;
  /** 触发概率 */
  rate: number;
}

/** 技能执行结果接口 */
export interface SkillExecutionResult {
  /** 技能ID */
  skillId: number;
  /** 技能名称 */
  skillName: string;
  /** 使用者ID */
  source: string;
  /** 目标结果列表 */
  targets: TargetResult[];
  /** 是否成功 */
  success: boolean;
  /** 执行消息 */
  message: string;
}

/** 目标结果接口 */
export interface TargetResult {
  /** 目标ID */
  targetId: string;
  /** 目标名称 */
  targetName: string;
  /** 伤害结果 */
  damage?: DamageResult;
  /** 应用效果列表 */
  effects?: AppliedEffect[];
  /** 是否未命中 */
  missed: boolean;
}

/** 应用效果接口 */
export interface AppliedEffect {
  /** 效果类型 */
  type: EffectCode;
  /** 效果名称 */
  name: string;
  /** 效果数值 */
  value: number;
  /** 持续回合 */
  duration: number;
  /** 是否成功 */
  success: boolean;
}

/** 回合行动接口 */
export interface TurnAction {
  /** 行动单位 */
  unit: BattleUnit;
  /** 使用的技能 */
  skill?: SkillData;
  /** 目标ID列表 */
  targetIds?: string[];
  /** 是否防御 */
  isGuard?: boolean;
  /** 是否使用道具 */
  isItem?: boolean;
  /** 道具ID */
  itemId?: number;
  /** 行动优先级 */
  priority: number;
}

/** 战斗状态接口 */
export interface BattleState {
  /** 玩家单位列表 */
  playerUnits: BattleUnit[];
  /** 敌人单位列表 */
  enemyUnits: BattleUnit[];
  /** 当前回合数 */
  turnNumber: number;
  /** 行动队列 */
  actionQueue: TurnAction[];
  /** 战斗日志 */
  battleLog: BattleLogEntry[];
  /** 战斗是否结束 */
  isEnded: boolean;
  /** 获胜阵营 */
  winner?: Faction;
}

/** 战斗日志条目接口 */
export interface BattleLogEntry {
  /** 回合数 */
  turn: number;
  /** 日志类型 */
  type: 'damage' | 'heal' | 'effect' | 'death' | 'revive' | 'buff' | 'debuff' | 'system';
  /** 来源单位 */
  source?: string;
  /** 来源单位ID */
  sourceId?: string;
  /** 目标单位 */
  target?: string;
  /** 目标单位ID */
  targetId?: string;
  /** 数值 */
  value?: number;
  /** 描述 */
  description: string;
  /** 额外详情 */
  details?: Record<string, unknown>;
}

/** 属性键类型 */
export type StatKey = 'maxHp' | 'hp' | 'maxMp' | 'mp' | 'atk' | 'def' | 'matk' | 'mdef' | 'agi' | 'luk';
