import {
  BattleUnit,
  BattleStats,
  DamageResult,
  ElementType,
  DamageType
} from './types';

export interface DamageCalculationParams {
  source: BattleUnit;
  target: BattleUnit;
  basePower: number;
  isPhysical: boolean;
  isMagical: boolean;
  element?: ElementType;
  canCritical?: boolean;
  hasVariance?: boolean;
  ignoreDefense?: boolean;
}

export interface CriticalHitResult {
  isCritical: boolean;
  chance: number;
}

const MIN_DAMAGE = 100;
const BASE_CRITICAL_CHANCE = 0.01;
const CRITICAL_LUK_FACTOR = 0.0005;
const MAX_CRITICAL_CHANCE = 0.30;
const DAMAGE_VARIANCE = 0.20;

export function calculateCriticalChance(attackerLuk: number, defenderLuk: number): number {
  const lukDifference = attackerLuk - defenderLuk;
  const chance = BASE_CRITICAL_CHANCE + lukDifference * CRITICAL_LUK_FACTOR;
  return Math.max(0, Math.min(MAX_CRITICAL_CHANCE, chance));
}

export function rollCritical(attackerLuk: number, defenderLuk: number): CriticalHitResult {
  const chance = calculateCriticalChance(attackerLuk, defenderLuk);
  const roll = Math.random();
  return {
    isCritical: roll < chance,
    chance
  };
}

export function calculateDamageVariance(): number {
  const variance = (Math.random() * 2 - 1) * DAMAGE_VARIANCE;
  return 1 + variance;
}

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

export function calculatePhysicalDamage(
  attackerAtk: number,
  defenderDef: number,
  guardMultiplier: number = 1
): number {
  const damage = attackerAtk * 4 - defenderDef * 2;
  const finalDamage = Math.max(MIN_DAMAGE, damage) * guardMultiplier;
  return Math.floor(finalDamage);
}

export function calculateMagicalDamage(
  attackerMat: number,
  defenderMdf: number,
  guardMultiplier: number = 1
): number {
  const damage = attackerMat * 4 - defenderMdf * 2;
  const finalDamage = Math.max(MIN_DAMAGE, damage) * guardMultiplier;
  return Math.floor(finalDamage);
}

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
      baseDamage = Math.max(MIN_DAMAGE, attackerStats.mat * 4);
    } else {
      baseDamage = calculateMagicalDamage(
        attackerStats.mat,
        defenderStats.mdf,
        guardMultiplier
      );
    }
  } else {
    baseDamage = basePower;
  }
  
  baseDamage = Math.floor(baseDamage * (basePower / 100));
  
  let criticalResult: CriticalHitResult;
  if (canCritical) {
    criticalResult = rollCritical(attackerStats.luk, defenderStats.luk);
  } else {
    criticalResult = { isCritical: false, chance: 0 };
  }
  
  if (criticalResult.isCritical) {
    baseDamage = Math.floor(baseDamage * 1.5);
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

export function applyDamageToTarget(target: BattleUnit, damage: number): number {
  const actualDamage = Math.min(damage, target.stats.hp);
  target.stats.hp = Math.max(0, target.stats.hp - actualDamage);
  
  if (target.stats.hp === 0) {
    target.isAlive = false;
  }
  
  return actualDamage;
}

export function checkDeath(target: BattleUnit): boolean {
  return target.stats.hp <= 0;
}

export function getElementalMultiplier(
  attackerElement: ElementType,
  defenderElement: ElementType
): number {
  const elementalAdvantage: Record<number, Record<number, number>> = {
    [ElementType.FIRE]: {
      [ElementType.ICE]: 1.5,
      [ElementType.WATER]: 0.5
    },
    [ElementType.ICE]: {
      [ElementType.WIND]: 1.5,
      [ElementType.FIRE]: 0.5
    },
    [ElementType.THUNDER]: {
      [ElementType.WATER]: 1.5,
      [ElementType.EARTH]: 0.5
    },
    [ElementType.WATER]: {
      [ElementType.FIRE]: 1.5,
      [ElementType.THUNDER]: 0.5
    },
    [ElementType.EARTH]: {
      [ElementType.THUNDER]: 1.5,
      [ElementType.WIND]: 0.5
    },
    [ElementType.WIND]: {
      [ElementType.EARTH]: 1.5,
      [ElementType.ICE]: 0.5
    },
    [ElementType.LIGHT]: {
      [ElementType.DARK]: 1.5
    },
    [ElementType.DARK]: {
      [ElementType.LIGHT]: 1.5
    }
  };
  
  if (attackerElement === ElementType.NONE || defenderElement === ElementType.NONE) {
    return 1;
  }
  
  return elementalAdvantage[attackerElement]?.[defenderElement] ?? 1;
}
