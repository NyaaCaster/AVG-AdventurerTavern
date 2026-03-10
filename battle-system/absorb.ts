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

export interface AbsorbCalculationParams {
  source: BattleUnit;
  target: BattleUnit;
  basePower: number;
  isPhysical: boolean;
  isMagical: boolean;
  element?: ElementType;
  canCritical?: boolean;
  hasVariance?: boolean;
  absorbRatio?: number;
}

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
    absorbRatio = 1
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

export function executeAbsorb(
  source: BattleUnit,
  target: BattleUnit,
  damageResult: DamageResult,
  absorbRatio: number = 1
): { damageDealt: number; healingDone: number } {
  const damageDealt = applyDamageToTarget(target, damageResult.value);
  
  const healingAmount = Math.floor(damageDealt * absorbRatio);
  const healingDone = applyHealingToTarget(source, healingAmount);
  
  return { damageDealt, healingDone };
}

export function calculateAndExecuteAbsorb(
  params: AbsorbCalculationParams
): { damageResult: DamageResult; damageDealt: number; healingDone: number } {
  const { absorbRatio = 1 } = params;
  
  const damageResult = calculateAbsorbDamage(params);
  const { damageDealt, healingDone } = executeAbsorb(
    params.source,
    params.target,
    damageResult,
    absorbRatio
  );
  
  return { damageResult, damageDealt, healingDone };
}

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
