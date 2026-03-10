import {
  BattleUnit,
  DamageResult,
  ElementType
} from './types';
import { getEffectiveStats, calculateDamageVariance } from './damage';

export interface HealingCalculationParams {
  source: BattleUnit;
  target: BattleUnit;
  basePower: number;
  isFixed?: boolean;
  scaleWithMat?: boolean;
  hasVariance?: boolean;
}

export function calculateHealing(params: HealingCalculationParams): DamageResult {
  const {
    source,
    target,
    basePower,
    isFixed = false,
    scaleWithMat = true,
    hasVariance = true
  } = params;

  const sourceStats = getEffectiveStats(source);
  
  let baseHealing: number;
  
  if (isFixed) {
    baseHealing = basePower;
  } else if (scaleWithMat) {
    baseHealing = Math.floor(sourceStats.mat * 4 * (basePower / 100));
  } else {
    baseHealing = basePower;
  }
  
  let varianceFactor = 1;
  if (hasVariance) {
    varianceFactor = calculateDamageVariance();
  }
  
  const finalHealing = Math.max(0, Math.floor(baseHealing * varianceFactor));
  
  return {
    value: finalHealing,
    isCritical: false,
    isHealing: true,
    isAbsorb: false,
    element: ElementType.NONE,
    variance: varianceFactor
  };
}

export function applyHealingToTarget(target: BattleUnit, healing: number): number {
  const actualHealing = Math.min(healing, target.stats.maxHp - target.stats.hp);
  target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + actualHealing);
  
  if (target.stats.hp > 0) {
    target.isAlive = true;
  }
  
  return actualHealing;
}

export function calculatePercentageHealing(
  target: BattleUnit,
  percentage: number
): number {
  const healingAmount = Math.floor(target.stats.maxHp * (percentage / 100));
  return healingAmount;
}

export function applyPercentageHealing(
  target: BattleUnit,
  percentage: number
): number {
  const healing = calculatePercentageHealing(target, percentage);
  return applyHealingToTarget(target, healing);
}

export function calculateMpRecovery(
  target: BattleUnit,
  amount: number,
  isPercentage: boolean = false
): number {
  if (isPercentage) {
    return Math.floor(target.stats.maxMp * (amount / 100));
  }
  return amount;
}

export function applyMpRecovery(
  target: BattleUnit,
  amount: number,
  isPercentage: boolean = false
): number {
  const recovery = calculateMpRecovery(target, amount, isPercentage);
  const actualRecovery = Math.min(recovery, target.stats.maxMp - target.stats.mp);
  target.stats.mp = Math.min(target.stats.maxMp, target.stats.mp + actualRecovery);
  return actualRecovery;
}

export function canRevive(target: BattleUnit): boolean {
  return !target.isAlive && target.stats.hp === 0;
}

export function reviveUnit(
  target: BattleUnit,
  hpPercentage: number = 25
): { success: boolean; hpRecovered: number } {
  if (!canRevive(target)) {
    return { success: false, hpRecovered: 0 };
  }
  
  const hpToRecover = Math.floor(target.stats.maxHp * (hpPercentage / 100));
  target.stats.hp = hpToRecover;
  target.isAlive = true;
  
  return { success: true, hpRecovered: hpToRecover };
}
