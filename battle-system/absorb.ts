/**
 * 战斗系统 - HP/MP吸收模块
 * 处理伤害吸收和MP吸取相关逻辑
 */

import {
  BattleUnit,
  DamageResult,
  ElementType
} from './types';
import {
  calculateDamage,
  DamageCalculationParams,
  applyDamageToTarget
} from './damage';
import { applyHealingToTarget } from './healing';

/**
 * 吸收计算参数接口
 */
export interface AbsorbCalculationParams {
  /** 攻击者 */
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
  /** 吸收比例，默认0.5（50%） */
  absorbRatio?: number;
}

/**
 * 计算吸收伤害
 * @param params 吸收计算参数
 * @returns 伤害结果
 */
export function calculateAbsorbDamage(params: AbsorbCalculationParams): DamageResult {
  const {
    source,
    target,
    basePower,
    isPhysical,
    isMagical,
    element = ElementType.NONE,
    canCritical = true,
    hasVariance = true,
    absorbRatio = 0.5
  } = params;

  const damageParams: DamageCalculationParams = {
    source,
    target,
    basePower,
    isPhysical,
    isMagical,
    element,
    canCritical,
    hasVariance
  };

  const damageResult = calculateDamage(damageParams);
  
  return {
    ...damageResult,
    isAbsorb: true
  };
}

/**
 * 执行吸收效果
 * 对目标造成伤害并治疗攻击者
 * @param source 攻击者
 * @param target 目标
 * @param damageResult 伤害结果
 * @param absorbRatio 吸收比例，默认0.5（50%）
 * @returns 造成的伤害和治疗量
 */
export function executeAbsorb(
  source: BattleUnit,
  target: BattleUnit,
  damageResult: DamageResult,
  absorbRatio: number = 0.5
): { damageDealt: number; healingDone: number } {
  const damageResult_ = applyDamageToTarget(target, damageResult.value, true);
  const damageDealt = damageResult_.actualDamage;
  
  const healingAmount = Math.floor(damageDealt * absorbRatio);
  const healingDone = applyHealingToTarget(source, healingAmount);
  
  return { damageDealt, healingDone };
}

/**
 * 计算并执行吸收攻击
 * 组合计算伤害和执行吸收的完整流程
 * @param params 吸收计算参数
 * @returns 伤害结果、造成的伤害和治疗量
 */
export function calculateAndExecuteAbsorb(
  params: AbsorbCalculationParams
): { damageResult: DamageResult; damageDealt: number; healingDone: number } {
  const { absorbRatio = 0.5 } = params;
  
  const damageResult = calculateAbsorbDamage(params);
  const { damageDealt, healingDone } = executeAbsorb(
    params.source,
    params.target,
    damageResult,
    absorbRatio
  );
  
  return { damageResult, damageDealt, healingDone };
}

/**
 * 计算MP吸取
 * 从目标吸取MP并恢复给攻击者
 * @param source 攻击者
 * @param target 目标
 * @param amount 吸取量
 * @param isPercentage 是否为百分比，默认false
 * @returns 实际吸取的MP和实际获得的MP
 */
export function calculateMpAbsorb(
  source: BattleUnit,
  target: BattleUnit,
  amount: number,
  isPercentage: boolean = false
): { mpDrained: number; mpGained: number } {
  let mpToDrain: number;
  
  if (isPercentage) {
    mpToDrain = Math.floor(target.stats.maxMp * (amount / 100));
  } else {
    mpToDrain = amount;
  }
  
  const actualDrain = Math.min(mpToDrain, target.stats.mp);
  target.stats.mp = Math.max(0, target.stats.mp - actualDrain);
  
  const actualGain = Math.min(actualDrain, source.stats.maxMp - source.stats.mp);
  source.stats.mp = Math.min(source.stats.maxMp, source.stats.mp + actualGain);
  
  return { mpDrained: actualDrain, mpGained: actualGain };
}
