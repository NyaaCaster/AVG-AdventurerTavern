import {
  BattleUnit,
  StatusEffectInstance,
  StatusEffectType,
  EffectCode,
  AppliedEffect
} from './types';
import { applyDamageToTarget } from './damage';
import { applyHealingToTarget } from './healing';

export interface StatusEffectDefinition {
  id: number;
  name: string;
  type: StatusEffectType;
  baseDuration: number;
  damagePerTurn?: number;
  healPerTurn?: number;
  restrictAction?: boolean;
  restrictSkill?: boolean;
  restrictItem?: boolean;
  restrictMagic?: boolean;
  isPercentageDamage?: boolean;
  isPercentageHeal?: boolean;
}

export function hasStatusEffect(unit: BattleUnit, effectId: number): boolean {
  return unit.statusEffects.some(effect => effect.effectId === effectId);
}

export function getStatusEffect(unit: BattleUnit, effectId: number): StatusEffectInstance | undefined {
  return unit.statusEffects.find(effect => effect.effectId === effectId);
}

export function applyStatusEffect(
  unit: BattleUnit,
  definition: StatusEffectDefinition,
  successRate: number = 1
): AppliedEffect {
  const roll = Math.random();
  const success = roll < successRate;
  
  if (!success) {
    return {
      type: EffectCode.ADD_STATE,
      name: definition.name,
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  const existingEffect = getStatusEffect(unit, definition.id);
  
  if (existingEffect) {
    existingEffect.turnsRemaining = Math.max(
      existingEffect.turnsRemaining,
      definition.baseDuration
    );
  } else {
    const instance: StatusEffectInstance = {
      effectId: definition.id,
      name: definition.name,
      type: definition.type,
      turnsRemaining: definition.baseDuration,
      damagePerTurn: definition.damagePerTurn,
      healPerTurn: definition.healPerTurn,
      restrictAction: definition.restrictAction,
      restrictSkill: definition.restrictSkill,
      restrictItem: definition.restrictItem,
      restrictMagic: definition.restrictMagic
    };
    unit.statusEffects.push(instance);
  }
  
  return {
    type: EffectCode.ADD_STATE,
    name: definition.name,
    value: 1,
    duration: definition.baseDuration,
    success: true
  };
}

export function removeStatusEffect(unit: BattleUnit, effectId: number): boolean {
  const index = unit.statusEffects.findIndex(effect => effect.effectId === effectId);
  if (index === -1) {
    return false;
  }
  unit.statusEffects.splice(index, 1);
  return true;
}

export function removeStatusEffectsByType(
  unit: BattleUnit,
  type: StatusEffectType
): number {
  const initialLength = unit.statusEffects.length;
  unit.statusEffects = unit.statusEffects.filter(effect => effect.type !== type);
  return initialLength - unit.statusEffects.length;
}

export function processStatusEffectTurn(unit: BattleUnit): {
  damageTaken: number;
  healingReceived: number;
  effectsExpired: string[];
} {
  let damageTaken = 0;
  let healingReceived = 0;
  const effectsExpired: string[] = [];
  
  for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
    const effect = unit.statusEffects[i];
    
    if (effect.damagePerTurn && effect.damagePerTurn > 0) {
      const damage = effect.damagePerTurn;
      damageTaken += applyDamageToTarget(unit, damage);
    }
    
    if (effect.healPerTurn && effect.healPerTurn > 0) {
      const healing = effect.healPerTurn;
      healingReceived += applyHealingToTarget(unit, healing);
    }
    
    effect.turnsRemaining--;
    
    if (effect.turnsRemaining <= 0) {
      effectsExpired.push(effect.name);
      unit.statusEffects.splice(i, 1);
    }
  }
  
  return { damageTaken, healingReceived, effectsExpired };
}

export function canAct(unit: BattleUnit): boolean {
  return !unit.statusEffects.some(effect => effect.restrictAction);
}

export function isSkillRestricted(unit: BattleUnit): boolean {
  return unit.statusEffects.some(effect => effect.restrictSkill);
}

export function canUseItem(unit: BattleUnit): boolean {
  return !unit.statusEffects.some(effect => effect.restrictItem);
}

export function canUseMagic(unit: BattleUnit): boolean {
  return !unit.statusEffects.some(effect => effect.restrictMagic);
}

export function isPoisoned(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, 1);
}

export function isParalyzed(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, 2);
}

export function isSilenced(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, 3);
}

export function isBlinded(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, 4);
}

export function isStunned(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, 5);
}

export function clearAllNegativeEffects(unit: BattleUnit): number {
  return removeStatusEffectsByType(unit, StatusEffectType.NEGATIVE);
}

export function clearAllPositiveEffects(unit: BattleUnit): number {
  return removeStatusEffectsByType(unit, StatusEffectType.POSITIVE);
}

export function getNegativeEffectCount(unit: BattleUnit): number {
  return unit.statusEffects.filter(e => e.type === StatusEffectType.NEGATIVE).length;
}

export function getPositiveEffectCount(unit: BattleUnit): number {
  return unit.statusEffects.filter(e => e.type === StatusEffectType.POSITIVE).length;
}
