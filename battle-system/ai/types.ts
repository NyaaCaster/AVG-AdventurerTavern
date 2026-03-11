/**
 * 战斗AI模块 - 类型定义
 * 定义AI决策系统使用的所有接口、枚举和类型
 */

import type { BattleUnit, SkillData, SkillScope, Faction, BattleStats } from '../types';
import type { EnemyAction } from '../../data/battle-data/enemies';

/** AI风格枚举 */
export enum AIStyle {
  /** 经典风格 - 基于评分权重选择行动 */
  CLASSIC = 'classic',
  /** Gambit风格 - 按行动列表顺序选择第一个有效行动 */
  GAMBIT = 'gambit',
  /** 随机风格 - 仅基于条件随机选择 */
  CASUAL = 'casual',
  /** 完全随机 - 仅检查技能可用性 */
  RANDOM = 'random'
}

/**
 * 统一行动接口
 * 
 * 用于统一敌人和玩家的行动格式，使AI模块能够无差别处理。
 * 
 * 敌人行动：直接使用 EnemyAction（含 rating、conditionType 等）
 * 玩家行动：从技能槽位转换，使用默认值
 */
export interface UnitAction {
  /** 技能ID */
  skillId: number;
  /** 行动优先级权重 (0-100)，数值越高越优先 */
  rating: number;
  /** 条件类型：0=无条件、1=回合数、2=HP百分比、3=MP百分比、4=状态等 */
  conditionType: number;
  /** 条件参数1 */
  conditionParam1: number;
  /** 条件参数2 */
  conditionParam2: number;
  /** 来源类型：'enemy' = 敌人配置，'player' = 玩家技能槽 */
  source: 'enemy' | 'player';
  /** 原始行动数据（如果是敌人行动） */
  originalAction?: EnemyAction;
}

/**
 * 将敌人行动转换为统一行动格式
 */
export function enemyActionToUnitAction(action: EnemyAction): UnitAction {
  return {
    skillId: action.skillId,
    rating: action.rating,
    conditionType: action.conditionType,
    conditionParam1: action.conditionParam1,
    conditionParam2: action.conditionParam2,
    source: 'enemy',
    originalAction: action
  };
}

/**
 * 将技能ID转换为玩家行动格式
 * 
 * 玩家技能默认：
 * - rating: 50 (中等优先级)
 * - conditionType: 0 (无条件限制)
 */
export function skillIdToUnitAction(skillId: number, rating: number = 50): UnitAction {
  return {
    skillId,
    rating,
    conditionType: 0,
    conditionParam1: 0,
    conditionParam2: 0,
    source: 'player'
  };
}

/**
 * 将技能槽位配置转换为行动列表
 * 
 * @param skills 技能槽位配置 (CharacterSkills)
 * @param defaultRating 默认优先级
 * @returns 统一行动列表
 */
export function characterSkillsToActions(
  skills: { slot1: number | null; slot2: number | null; slot3: number | null; slot4: number | null; slot5: number | null; slot6: number | null; slot7: number | null; slot8: number | null },
  defaultRating: number = 50
): UnitAction[] {
  const actions: UnitAction[] = [];
  const slotKeys = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7', 'slot8'] as const;
  
  slotKeys.forEach((key, index) => {
    const skillId = skills[key];
    if (skillId !== null) {
      actions.push(skillIdToUnitAction(skillId, defaultRating - index));
    }
  });
  
  return actions;
}

/** AI配置接口 */
export interface AIConfig {
  /** AI风格 */
  style: AIStyle;
  /** AI等级 (0-100)，影响条件严格程度 */
  level: number;
  /** 评分方差 (0-9)，控制选择随机性 */
  ratingVariance: number;
}

/** 条件逻辑类型 */
export enum ConditionLogic {
  /** 所有条件必须满足 */
  ALL = 'all',
  /** 任一条件满足即可 */
  ANY = 'any'
}

/** 条件操作符 */
export type ConditionOperator = '>=' | '<=' | '>' | '<' | '===' | '!==';

/** 条件主体 */
export type ConditionSubject = 'user' | 'target' | 'lowest' | 'highest';

/** 基础条件接口 */
export interface BaseCondition {
  /** 原始条件字符串 */
  raw: string;
  /** 是否取反 */
  negate: boolean;
}

/** HP百分比条件 */
export interface HPPercentCondition extends BaseCondition {
  type: 'hp_percent';
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** MP百分比条件 */
export interface MPPercentCondition extends BaseCondition {
  type: 'mp_percent';
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** HP绝对值条件 */
export interface HPValueCondition extends BaseCondition {
  type: 'hp_value';
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** MP绝对值条件 */
export interface MPValueCondition extends BaseCondition {
  type: 'mp_value';
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** 状态条件 */
export interface StateCondition extends BaseCondition {
  type: 'has_state';
  stateId: number;
  subject: ConditionSubject;
}

/** 状态回合数条件 */
export interface StateTurnsCondition extends BaseCondition {
  type: 'state_turns';
  stateId: number;
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** Buff层数条件 */
export interface BuffStacksCondition extends BaseCondition {
  type: 'buff_stacks';
  stat: keyof Pick<BattleStats, 'atk' | 'def' | 'matk' | 'mdef' | 'agi' | 'luk'>;
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
  isDebuff: boolean;
}

/** 队伍存活成员数条件 */
export interface TeamAliveCondition extends BaseCondition {
  type: 'team_alive';
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** 队伍死亡成员数条件 */
export interface TeamDeadCondition extends BaseCondition {
  type: 'team_dead';
  operator: ConditionOperator;
  value: number;
  subject: ConditionSubject;
}

/** 随机概率条件 */
export interface RandomChanceCondition extends BaseCondition {
  type: 'random_chance';
  value: number;
}

/** 开关条件 */
export interface SwitchCondition extends BaseCondition {
  type: 'switch';
  switchId: number;
  expectedValue: boolean;
}

/** 变量条件 */
export interface VariableCondition extends BaseCondition {
  type: 'variable';
  variableId: number;
  operator: ConditionOperator;
  value: number;
}

/** 自定义表达式条件 */
export interface CustomExpressionCondition extends BaseCondition {
  type: 'custom';
  expression: string;
}

/** 回合数条件 */
export interface TurnCondition extends BaseCondition {
  type: 'turn';
  operator: ConditionOperator;
  value: number;
}

/** 伤害计算条件 */
export interface DamageCondition extends BaseCondition {
  type: 'damage';
  operator: ConditionOperator;
  value: number;
}

/** 属性比较条件 */
export interface StatCompareCondition extends BaseCondition {
  type: 'stat_compare';
  statA: keyof BattleStats;
  statB: keyof BattleStats;
  operator: ConditionOperator;
  multiplier?: number;
}

/** AI条件联合类型 */
export type AICondition =
  | HPPercentCondition
  | MPPercentCondition
  | HPValueCondition
  | MPValueCondition
  | StateCondition
  | StateTurnsCondition
  | BuffStacksCondition
  | TeamAliveCondition
  | TeamDeadCondition
  | RandomChanceCondition
  | SwitchCondition
  | VariableCondition
  | CustomExpressionCondition
  | TurnCondition
  | DamageCondition
  | StatCompareCondition;

/** 解析后的技能AI配置 */
export interface SkillAIConfig {
  /** ALL条件列表 */
  allConditions: AICondition[];
  /** ANY条件列表 */
  anyConditions: AICondition[];
  /** 目标选择策略 */
  targetStrategy?: AITargetStrategy;
  /** 冷却回合数 */
  cooldown?: number;
}

/** 目标选择策略 */
export type AITargetStrategy =
  | 'lowest_hp'
  | 'highest_hp'
  | 'lowest_hp_percent'
  | 'highest_hp_percent'
  | 'lowest_mp'
  | 'highest_mp'
  | 'highest_atk'
  | 'lowest_atk'
  | 'highest_def'
  | 'lowest_def'
  | 'highest_matk'
  | 'lowest_matk'
  | 'highest_mdef'
  | 'lowest_mdef'
  | 'highest_agi'
  | 'lowest_agi'
  | 'highest_luk'
  | 'lowest_luk'
  | 'highest_level'
  | 'lowest_level'
  | 'highest_negative_state_count'
  | 'random'
  | 'first'
  | 'last';

/** 行动候选项 */
export interface ActionCandidate {
  /** 行动配置（统一格式） */
  action: UnitAction;
  /** 对应的技能数据 */
  skill: SkillData;
  /** 解析后的AI配置 */
  aiConfig: SkillAIConfig;
  /** 是否满足条件 */
  isValid: boolean;
  /** 评估分数（用于Classic风格） */
  score: number;
}

/** AI决策上下文 */
export interface AIDecisionContext {
  /** 决策单位 */
  unit: BattleUnit;
  /** 当前回合数 */
  turnNumber: number;
  /** 玩家单位列表 */
  playerUnits: BattleUnit[];
  /** 敌人单位列表 */
  enemyUnits: BattleUnit[];
  /** 可用行动列表（统一格式） */
  availableActions: UnitAction[];
  /** 技能数据映射 */
  skillMap: Map<number, SkillData>;
  /** 开关状态映射 */
  switches?: Map<number, boolean>;
  /** 变量值映射 */
  variables?: Map<number, number>;
}

/** AI决策结果 */
export interface AIDecisionResult {
  /** 选择的行动（统一格式） */
  action: UnitAction | null;
  /** 选择的技能 */
  skill: SkillData | null;
  /** 目标单位ID列表 */
  targetIds: string[];
  /** 是否防御 */
  isGuard: boolean;
  /** 决策原因描述 */
  reason: string;
}

/** 目标选择结果 */
export interface TargetSelectionResult {
  /** 目标单位列表 */
  targets: BattleUnit[];
  /** 选择策略 */
  strategy: AITargetStrategy;
}

/** 条件评估结果 */
export interface ConditionEvalResult {
  /** 是否满足 */
  satisfied: boolean;
  /** 条件类型 */
  conditionType: string;
  /** 评估详情 */
  details?: string;
}

/** AI模块默认配置 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  style: AIStyle.CLASSIC,
  level: 100,
  ratingVariance: 3
};

/** 敌人AI默认配置 */
export const ENEMY_AI_CONFIG: AIConfig = {
  style: AIStyle.CLASSIC,
  level: 100,
  ratingVariance: 3
};

/** 队友AI默认配置 */
export const ALLY_AI_CONFIG: AIConfig = {
  style: AIStyle.CLASSIC,
  level: 100,
  ratingVariance: 1
};

/** 技能冷却记录 */
export interface SkillCooldown {
  /** 技能ID */
  skillId: number;
  /** 上次使用回合数 */
  lastUsedTurn: number;
  /** 冷却回合数 */
  cooldown: number;
}

/** 冷却追踪器 */
export interface CooldownTracker {
  /** 获取技能剩余冷却回合数 */
  getRemainingCooldown(skillId: number, currentTurn: number): number;
  /** 记录技能使用 */
  recordSkillUse(skillId: number, currentTurn: number, cooldown: number): void;
  /** 清除所有冷却记录 */
  clear(): void;
}
