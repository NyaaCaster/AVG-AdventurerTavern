/**
 * 战斗系统 - 伤害计算模块
 * 处理物理/魔法伤害计算、暴击判定、命中闪避等核心逻辑
 */

import {
  BattleUnit,
  BattleStats,
  DamageResult,
  ElementType,
  DamageType
} from './types';
import {
  getHitRateModifier,
  getCritBonus,
  getEvasionBonus,
  checkWakeOnPhysicalHit,
  checkRemoveOnDamage,
  getDamageReceivedMultiplier
} from './status-effects';
import { EVASION_CONFIG } from '../data/battle-data/evasion-config';

/**
 * 伤害计算参数接口
 */
export interface DamageCalculationParams {
  /** 攻击来源 */
  source: BattleUnit;
  /** 目标 */
  target: BattleUnit;
  /** 基础威力 */
  basePower: number;
  /** 是否物理攻击 */
  isPhysical: boolean;
  /** 是否魔法攻击 */
  isMagical: boolean;
  /** 属性类型 */
  element?: ElementType;
  /** 是否可暴击 */
  canCritical?: boolean;
  /** 是否有伤害浮动 */
  hasVariance?: boolean;
  /** 是否无视防御 */
  ignoreDefense?: boolean;
}

/** 暴击判定结果 */
export interface CriticalHitResult {
  /** 是否暴击 */
  isCritical: boolean;
  /** 暴击概率 */
  chance: number;
}

/** 命中判定结果 */
export interface HitResult {
  /** 是否命中 */
  hits: boolean;
  /** 是否闪避 */
  evaded: boolean;
  /** 未命中率 */
  missChance: number;
}

/** 最小伤害值 */
const MIN_DAMAGE = 100;
/** 基础暴击率 1% */
const BASE_CRITICAL_CHANCE = 0.01;
/** 幸运差值因子 0.05% */
const CRITICAL_LUK_FACTOR = 0.0005;
/** 最大暴击率 30% */
const MAX_CRITICAL_CHANCE = 0.30;
/** 伤害浮动比例 20% */
const DAMAGE_VARIANCE = 0.20;

/**
 * 计算暴击概率
 * 暴击率 = 基础暴击率 + (攻击者LUK - 防御者LUK) × 因子
 * @param attackerLuk 攻击者幸运值
 * @param defenderLuk 防御者幸运值
 * @param critBonus 额外暴击加成
 * @returns 暴击概率（0~30%）
 */
export function calculateCriticalChance(
  attackerLuk: number,
  defenderLuk: number,
  critBonus: number = 0
): number {
  const lukDifference = attackerLuk - defenderLuk;
  const chance = BASE_CRITICAL_CHANCE + lukDifference * CRITICAL_LUK_FACTOR + critBonus;
  return Math.max(0, Math.min(MAX_CRITICAL_CHANCE, chance));
}

/**
 * 进行暴击判定
 * @param attackerLuk 攻击者幸运值
 * @param defenderLuk 防御者幸运值
 * @param critBonus 额外暴击加成
 * @returns 暴击判定结果
 */
export function rollCritical(
  attackerLuk: number,
  defenderLuk: number,
  critBonus: number = 0
): CriticalHitResult {
  const chance = calculateCriticalChance(attackerLuk, defenderLuk, critBonus);
  const roll = Math.random();
  return {
    isCritical: roll < chance,
    chance
  };
}

/**
 * 计算伤害浮动因子
 * @returns 浮动因子（0.8~1.2）
 */
export function calculateDamageVariance(): number {
  const variance = (Math.random() * 2 - 1) * DAMAGE_VARIANCE;
  return 1 + variance;
}

/**
 * 计算命中概率
 * 物理攻击可被闪避，魔法攻击必定命中
 * 闪避率基于AGI差值计算
 * @param source 攻击者
 * @param target 目标
 * @param isPhysical 是否物理攻击
 * @returns 命中判定结果
 */
export function calculateHitChance(
  source: BattleUnit,
  target: BattleUnit,
  isPhysical: boolean
): HitResult {
  if (!isPhysical) {
    return {
      hits: true,
      evaded: false,
      missChance: 0
    };
  }
  
  const hitRateModifier = getHitRateModifier(source);
  const evasionBonus = getEvasionBonus(target);
  
  const agiDifference = source.stats.agi - target.stats.agi;
  const agiBasedEvasion = EVASION_CONFIG.baseEvasionChance + 
    (agiDifference * EVASION_CONFIG.agiDifferenceFactor);
  const baseEvasion = Math.max(
    EVASION_CONFIG.minEvasionChance,
    Math.min(EVASION_CONFIG.maxEvasionChance, agiBasedEvasion)
  );
  
  const totalEvasion = baseEvasion + evasionBonus;
  
  const baseHitChance = 1.0;
  const adjustedHitChance = baseHitChance * hitRateModifier;
  const finalHitChance = Math.max(0, adjustedHitChance - totalEvasion);
  
  const roll = Math.random();
  
  const evaded = roll > finalHitChance && roll <= finalHitChance + totalEvasion;
  const missed = roll > finalHitChance;
  
  return {
    hits: !missed && !evaded,
    evaded,
    missChance: 1 - finalHitChance
  };
}

/**
 * 获取单位的有效属性值
 * 计算基础属性加上所有增益/减益后的最终值
 * 
 * @param unit 战斗单位
 * @returns 计算后的有效属性对象
 * 
 * @example
 * // 单位有攻击力100，且有+25%攻击增益
 * const effectiveStats = getEffectiveStats(unit);
 * // effectiveStats.atk = 125
 */
export function getEffectiveStats(unit: BattleUnit): BattleStats {
  const stats = { ...unit.stats };
  
  for (const buff of unit.buffs) {
    if (buff.stat in stats) {
      const statKey = buff.stat as keyof BattleStats;
      const modifier = buff.isDebuff ? -buff.value : buff.value;
      stats[statKey] = Math.max(0, stats[statKey] + modifier);
    }
  }
  
  return stats;
}

/**
 * 计算物理伤害
 * 公式：伤害 = 攻击力 × 4 - 防御力 × 2，最低100
 * 
 * @param attackerAtk 攻击者的攻击力
 * @param defenderDef 防御者的防御力
 * @param guardMultiplier 防御倍率，默认1（防御时为0.5）
 * @returns 计算后的物理伤害值
 * 
 * @example
 * // 攻击力100，防御力50，未防御
 * calculatePhysicalDamage(100, 50); // 300
 * // 攻击力100，防御力50，防御中
 * calculatePhysicalDamage(100, 50, 0.5); // 150
 */
export function calculatePhysicalDamage(
  attackerAtk: number,
  defenderDef: number,
  guardMultiplier: number = 1
): number {
  const damage = attackerAtk * 4 - defenderDef * 2;
  const finalDamage = Math.max(MIN_DAMAGE, damage) * guardMultiplier;
  return Math.floor(finalDamage);
}

/**
 * 计算魔法伤害
 * 公式：伤害 = 魔法攻击 × 4 - 魔法防御 × 2，最低100
 * 
 * @param attackerMat 攻击者的魔法攻击力
 * @param defenderMdf 防御者的魔法防御力
 * @param guardMultiplier 防御倍率，默认1（防御时为0.5）
 * @returns 计算后的魔法伤害值
 * 
 * @example
 * // 魔法攻击80，魔法防御30
 * calculateMagicalDamage(80, 30); // 260
 */
export function calculateMagicalDamage(
  attackerMat: number,
  defenderMdf: number,
  guardMultiplier: number = 1
): number {
  const damage = attackerMat * 4 - defenderMdf * 2;
  const finalDamage = Math.max(MIN_DAMAGE, damage) * guardMultiplier;
  return Math.floor(finalDamage);
}

/**
 * 计算伤害的主函数
 * 综合处理物理/魔法伤害、暴击、浮动、弱点等所有因素
 * 
 * 计算流程：
 * 1. 获取攻击者和防御者的有效属性
 * 2. 计算基础伤害（物理或魔法）
 * 3. 应用弱点倍率
 * 4. 判定暴击
 * 5. 应用伤害浮动
 * 
 * @param params 伤害计算参数
 * @returns 伤害结果对象
 * 
 * @example
 * const result = calculateDamage({
 *   source: attacker,
 *   target: defender,
 *   basePower: 100,
 *   isPhysical: true,
 *   isMagical: false,
 *   canCritical: true,
 *   hasVariance: true
 * });
 */
export function calculateDamage(params: DamageCalculationParams): DamageResult {
  const {
    source,
    target,
    basePower,
    isPhysical,
    isMagical,
    element = ElementType.NONE,
    canCritical = true,
    hasVariance = true,
    ignoreDefense = false
  } = params;

  const attackerStats = getEffectiveStats(source);
  const defenderStats = getEffectiveStats(target);
  
  const guardMultiplier = target.isGuarding ? 0.5 : 1;
  
  let baseDamage: number;
  
  if (isPhysical) {
    if (ignoreDefense) {
      baseDamage = Math.max(MIN_DAMAGE, attackerStats.atk * 4);
    } else {
      baseDamage = calculatePhysicalDamage(
        attackerStats.atk,
        defenderStats.def,
        guardMultiplier
      );
    }
  } else if (isMagical) {
    if (ignoreDefense) {
      baseDamage = Math.max(MIN_DAMAGE, attackerStats.matk * 4);
    } else {
      baseDamage = calculateMagicalDamage(
        attackerStats.matk,
        defenderStats.mdef,
        guardMultiplier
      );
    }
  } else {
    baseDamage = basePower;
  }
  
  baseDamage = Math.floor(baseDamage * (basePower / 100));
  
  const damageMultiplier = getDamageReceivedMultiplier(target);
  if (damageMultiplier !== 1) {
    baseDamage = Math.floor(baseDamage * damageMultiplier);
  }
  
  const critBonus = getCritBonus(source);
  let criticalResult: CriticalHitResult;
  if (canCritical) {
    criticalResult = rollCritical(attackerStats.luk, defenderStats.luk, critBonus);
  } else {
    criticalResult = { isCritical: false, chance: 0 };
  }
  
  if (criticalResult.isCritical) {
    baseDamage = Math.floor(baseDamage * 3);
  }
  
  let varianceFactor = 1;
  if (hasVariance) {
    varianceFactor = calculateDamageVariance();
  }
  
  const finalDamage = Math.max(0, Math.floor(baseDamage * varianceFactor));
  
  return {
    value: finalDamage,
    isCritical: criticalResult.isCritical,
    isHealing: false,
    isAbsorb: false,
    element,
    variance: varianceFactor
  };
}

/**
 * 应用伤害结果接口
 */
export interface ApplyDamageResult {
  /** 实际造成的伤害值 */
  actualDamage: number;
  /** 被物理攻击唤醒的状态效果列表 */
  wokenEffects: string[];
  /** 因受伤而解除的状态效果列表 */
  removedEffects: string[];
  /** 目标是否死亡 */
  targetDied: boolean;
}

/**
 * 将伤害应用到目标
 * 执行以下操作：
 * 1. 扣除目标HP
 * 2. 检查是否唤醒睡眠等状态
 * 3. 检查是否解除混乱等状态
 * 4. 检查目标是否死亡
 * 
 * @param target 目标单位
 * @param damage 伤害数值
 * @param isPhysical 是否物理攻击，默认true
 * @returns 应用伤害结果
 */
export function applyDamageToTarget(
  target: BattleUnit,
  damage: number,
  isPhysical: boolean = true
): ApplyDamageResult {
  const actualDamage = Math.min(damage, target.stats.hp);
  target.stats.hp = Math.max(0, target.stats.hp - actualDamage);
  
  // 如果物理攻击，唤醒目标 (如睡眠状态)
  const wokenEffects = isPhysical ? checkWakeOnPhysicalHit(target) : [];
  
  const removedEffects = checkRemoveOnDamage(target);
  
  // 检查是否死亡
  let targetDied = false;
  if (target.stats.hp === 0) {
    target.isAlive = false;
    targetDied = true;
  }
  
  return {
    actualDamage,
    wokenEffects,
    removedEffects,
    targetDied
  };
}

/**
 * 检查目标是否死亡
 * @param target 目标单位
 * @returns 是否死亡（HP <= 0）
 */
export function checkDeath(target: BattleUnit): boolean {
  return target.stats.hp <= 0;
}
