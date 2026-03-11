/**
 * 战斗系统 - 反击模块
 * 处理物理攻击触发的反击机制
 */

import {
  BattleUnit,
  CounterAttackResult
} from './types';
import {
  canAct,
  shouldSkipTurn,
  getCounterBonus
} from './status-effects';
import {
  calculateDamage,
  applyDamageToTarget
} from './damage';

/**
 * 检查是否触发反击
 * 反击必须同时满足以下条件：
 * 1. 必须是物理攻击（魔法攻击不会触发反击）
 * 2. 目标必须能够行动（麻痹、睡眠、眩晕等状态下无法反击）
 * 3. 概率判定成功
 * 
 * @param attacker 攻击者
 * @param target 目标（可能的反击者）
 * @param isPhysical 是否为物理攻击
 * @returns 反击结果
 */
export function checkCounterAttack(
  attacker: BattleUnit,
  target: BattleUnit,
  isPhysical: boolean
): CounterAttackResult {
  if (!isPhysical) {
    return { triggered: false, rate: 0 };
  }
  
  if (shouldSkipTurn(target)) {
    return { triggered: false, rate: 0 };
  }
  
  if (!canAct(target)) {
    return { triggered: false, rate: 0 };
  }
  
  const counterRate = getCounterBonus(target);
  const roll = Math.random();
  
  if (roll < counterRate) {
    return { triggered: true, rate: counterRate };
  }
  
  return { triggered: false, rate: counterRate };
}

/**
 * 执行反击攻击
 * 反击使用普通攻击，可暴击，有伤害浮动
 * 
 * @param counter 反击者
 * @param originalAttacker 原攻击者（反击目标）
 * @returns 反击结果
 */
export function executeCounterAttack(
  counter: BattleUnit,
  originalAttacker: BattleUnit
): {
  damage: number;
  isCritical: boolean;
  wokenEffects: string[];
  removedEffects: string[];
  targetDied: boolean;
} {
  const damageResult = calculateDamage({
    source: counter,
    target: originalAttacker,
    basePower: 100,
    isPhysical: true,
    isMagical: false,
    canCritical: true,
    hasVariance: true,
    ignoreDefense: false
  });
  
  const applyResult = applyDamageToTarget(originalAttacker, damageResult.value, true);
  
  return {
    damage: applyResult.actualDamage,
    isCritical: damageResult.isCritical,
    wokenEffects: applyResult.wokenEffects,
    removedEffects: applyResult.removedEffects,
    targetDied: applyResult.targetDied
  };
}
