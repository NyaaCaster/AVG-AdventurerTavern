/**
 * 战斗系统 - 状态效果管理模块
 * 处理异常状态的添加、移除、回合处理等逻辑
 * 
 * 状态效果类型：
 * - 负面状态：中毒、暗闇、沈黙、睡眠、麻痺、晕眩等
 * - 正面状态：HP再生、回避率提升、暴击率提升、反击率提升等
 * - 特殊状态：死亡、发情等
 */

import {
  BattleUnit,
  StatusEffectInstance,
  EffectCode,
  AppliedEffect,
  Faction
} from './types';
import {
  STATUS_EFFECTS,
  STATUS_EFFECT_ID_MAP,
  StatusEffectData,
  StatusEffectId,
  StatusEffectType
} from '../data/battle-data/status_effects';

export { STATUS_EFFECTS, STATUS_EFFECT_ID_MAP };
export type { StatusEffectData, StatusEffectId, StatusEffectType };

/**
 * 根据效果ID获取状态效果定义
 * @param effectId 状态效果数据ID
 * @returns 状态效果定义，如果不存在则返回undefined
 */
export function getStatusEffectDefinition(effectId: number): StatusEffectData | undefined {
  const id = STATUS_EFFECT_ID_MAP[effectId];
  return id ? STATUS_EFFECTS[id] : undefined;
}

/**
 * 根据数据ID获取状态效果ID
 * @param dataId 数据ID
 * @returns 状态效果ID
 */
export function getStatusEffectIdFromDataId(dataId: number): StatusEffectId | undefined {
  return STATUS_EFFECT_ID_MAP[dataId];
}

/**
 * 检查单位是否拥有指定状态效果
 * @param unit 战斗单位
 * @param effectId 状态效果ID
 * @returns 是否拥有该状态
 */
export function hasStatusEffect(unit: BattleUnit, effectId: number): boolean {
  return unit.statusEffects.some(effect => effect.effectId === effectId);
}

/**
 * 获取单位的状态效果实例
 * @param unit 战斗单位
 * @param effectId 状态效果ID
 * @returns 状态效果实例，如果不存在则返回undefined
 */
export function getStatusEffect(unit: BattleUnit, effectId: number): StatusEffectInstance | undefined {
  return unit.statusEffects.find(effect => effect.effectId === effectId);
}

/**
 * 为单位应用状态效果
 * 处理成功率判定、状态叠加、持续时间刷新等逻辑
 * 
 * @param unit 战斗单位
 * @param definition 状态效果定义
 * @param successRate 成功率，默认1（100%）
 * @returns 应用效果结果
 * 
 * @example
 * // 应用中毒状态
 * const poisonDef = STATUS_EFFECTS.poison;
 * const result = applyStatusEffect(target, poisonDef, 0.5); // 50%成功率
 */
export function applyStatusEffect(
  unit: BattleUnit,
  definition: StatusEffectData,
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
  
  const dataId = getDataIdFromStatusEffectId(definition.id);
  if (dataId === undefined) {
    return {
      type: EffectCode.ADD_STATE,
      name: definition.name,
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  if (definition.id === 'dead') {
    unit.statusEffects = unit.statusEffects.filter(effect => effect.persistAfterBattle);
    const instance = createStatusEffectInstance(definition);
    unit.statusEffects.push(instance);
    return {
      type: EffectCode.ADD_STATE,
      name: definition.name,
      value: 1,
      duration: definition.defaultDuration,
      success: true
    };
  }
  
  const mutexIds = getMutexStatusIds(dataId);
  for (const mutexId of mutexIds) {
    if (hasStatusEffect(unit, mutexId)) {
      removeStatusEffect(unit, mutexId);
    }
  }
  
  if (hasStatusEffect(unit, dataId)) {
    if (!definition.canStack) {
      const existingEffect = getStatusEffect(unit, dataId);
      if (existingEffect) {
        existingEffect.turnsRemaining = Math.max(
          existingEffect.turnsRemaining,
          definition.defaultDuration
        );
      }
    } else {
      const stackCount = unit.statusEffects.filter(e => e.effectId === dataId).length;
      if (stackCount >= MAX_STATUS_STACKS) {
        const existingEffect = getStatusEffect(unit, dataId);
        if (existingEffect) {
          existingEffect.turnsRemaining = Math.max(
            existingEffect.turnsRemaining,
            definition.defaultDuration
          );
        }
      } else {
        const instance = createStatusEffectInstance(definition);
        unit.statusEffects.push(instance);
      }
    }
  } else {
    const instance = createStatusEffectInstance(definition);
    unit.statusEffects.push(instance);
  }
  
  return {
    type: EffectCode.ADD_STATE,
    name: definition.name,
    value: 1,
    duration: definition.defaultDuration,
    success: true
  };
}

/**
 * 创建状态效果实例
 * 从状态效果定义创建一个可应用于单位的实例
 * 
 * @param definition 状态效果定义
 * @returns 状态效果实例
 */
export function createStatusEffectInstance(definition: StatusEffectData): StatusEffectInstance {
  return {
    effectId: getDataIdFromStatusEffectId(definition.id) ?? 0,
    name: definition.name,
    icon: definition.icon,
    type: definition.type as StatusEffectType,
    turnsRemaining: definition.defaultDuration,
    skipTurn: definition.skipTurn,
    wakeOnPhysicalHit: definition.wakeOnPhysicalHit,
    hpDrainPercent: definition.hpDrainPercent,
    hpRegenPercent: definition.hpRegenPercent,
    hitRateModifier: definition.hitRateModifier,
    canUseSkill: definition.canUseSkill,
    forceAttackEnemy: definition.forceAttackEnemy,
    randomTarget: definition.randomTarget,
    attackAlly: definition.attackAlly,
    removeOnDamagePercent: definition.removeOnDamagePercent,
    canStack: definition.canStack,
    persistAfterBattle: definition.persistAfterBattle,
    damageReceivedMultiplier: definition.damageReceivedMultiplier,
    counterRateBonus: definition.counterRateBonus,
    critRateBonus: definition.critRateBonus,
    evasionBonus: definition.evasionBonus
  };
}

/**
 * 从状态效果ID获取数据ID
 * 用于在状态效果ID和数据ID之间进行转换
 * 
 * @param id 状态效果ID
 * @returns 数据ID，如果不存在则返回undefined
 */
function getDataIdFromStatusEffectId(id: StatusEffectId): number | undefined {
  for (const [dataId, statusId] of Object.entries(STATUS_EFFECT_ID_MAP)) {
    if (statusId === id) {
      return parseInt(dataId, 10);
    }
  }
  return undefined;
}

/**
 * 移除单位的状态效果
 * 
 * @param unit 战斗单位
 * @param effectId 状态效果ID
 * @returns 是否成功移除
 */
export function removeStatusEffect(unit: BattleUnit, effectId: number): boolean {
  const index = unit.statusEffects.findIndex(effect => effect.effectId === effectId);
  if (index === -1) {
    return false;
  }
  unit.statusEffects.splice(index, 1);
  return true;
}

/**
 * 按类型移除状态效果
 * 移除指定类型的所有状态效果
 * 
 * @param unit 战斗单位
 * @param type 状态效果类型
 * @returns 移除的状态效果数量
 */
export function removeStatusEffectsByType(
  unit: BattleUnit,
  type: StatusEffectType
): number {
  const initialLength = unit.statusEffects.length;
  unit.statusEffects = unit.statusEffects.filter(effect => effect.type !== type);
  return initialLength - unit.statusEffects.length;
}

/**
 * 清除所有负面状态效果
 * @param unit 战斗单位
 * @returns 移除的状态效果数量
 */
export function clearAllNegativeEffects(unit: BattleUnit): number {
  return removeStatusEffectsByType(unit, 'negative');
}

/**
 * 清除所有正面状态效果
 * @param unit 战斗单位
 * @returns 移除的状态效果数量
 */
export function clearAllPositiveEffects(unit: BattleUnit): number {
  return removeStatusEffectsByType(unit, 'positive');
}

/**
 * 处理状态效果的回合结算
 * 执行以下操作：
 * 1. 处理HP流失（如中毒）
 * 2. 处理HP回复（如再生）
 * 3. 减少状态效果持续时间
 * 4. 移除过期的状态效果
 * 
 * @param unit 战斗单位
 * @returns 回合结算结果，包含伤害、治疗和过期状态列表
 */
export function processStatusEffectTurn(unit: BattleUnit): {
  damageTaken: number;
  healingReceived: number;
  effectsExpired: string[];
} {
  let damageTaken = 0;
  let healingReceived = 0;
  const effectsExpired: string[] = [];
  
  const drainEffects: Array<{ effect: StatusEffectInstance; index: number }> = [];
  const regenEffects: Array<{ effect: StatusEffectInstance; index: number }> = [];
  
  for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
    const effect = unit.statusEffects[i];
    if (effect.hpDrainPercent > 0) {
      drainEffects.push({ effect, index: i });
    }
    if (effect.hpRegenPercent > 0) {
      regenEffects.push({ effect, index: i });
    }
  }
  
  for (const { effect } of regenEffects) {
    const healing = Math.floor(unit.stats.maxHp * effect.hpRegenPercent);
    const actualHealing = Math.min(healing, unit.stats.maxHp - unit.stats.hp);
    unit.stats.hp = Math.min(unit.stats.maxHp, unit.stats.hp + actualHealing);
    healingReceived += actualHealing;
  }
  
  for (const { effect } of drainEffects) {
    const damage = Math.floor(unit.stats.maxHp * effect.hpDrainPercent);
    unit.stats.hp = Math.max(0, unit.stats.hp - damage);
    damageTaken += damage;
  }
  
  for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
    const effect = unit.statusEffects[i];
    
    if (effect.turnsRemaining > 0) {
      effect.turnsRemaining--;
    }
    
    if (effect.turnsRemaining === 0) {
      effectsExpired.push(effect.name);
      unit.statusEffects.splice(i, 1);
    }
  }
  
  return { damageTaken, healingReceived, effectsExpired };
}

export function canAct(unit: BattleUnit): boolean {
  return !unit.statusEffects.some(effect => effect.skipTurn);
}

export function isSkillUseBlocked(unit: BattleUnit): boolean {
  return unit.statusEffects.some(effect => !effect.canUseSkill);
}

export function getHitRateModifier(unit: BattleUnit): number {
  let modifier = 1;
  for (const effect of unit.statusEffects) {
    modifier *= effect.hitRateModifier;
  }
  return modifier;
}

export function shouldSkipTurn(unit: BattleUnit): boolean {
  return unit.statusEffects.some(effect => effect.skipTurn);
}

export function isForcedToAttackEnemy(unit: BattleUnit): boolean {
  return unit.statusEffects.some(effect => effect.forceAttackEnemy);
}

export function hasRandomTarget(unit: BattleUnit): boolean {
  return unit.statusEffects.some(effect => effect.randomTarget);
}

export function shouldAttackAlly(unit: BattleUnit): boolean {
  return unit.statusEffects.some(effect => effect.attackAlly);
}

export function checkWakeOnPhysicalHit(unit: BattleUnit): string[] {
  const wokenEffects: string[] = [];
  
  for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
    const effect = unit.statusEffects[i];
    if (effect.wakeOnPhysicalHit) {
      wokenEffects.push(effect.name);
      unit.statusEffects.splice(i, 1);
    }
  }
  
  return wokenEffects;
}

export function checkRemoveOnDamage(unit: BattleUnit): string[] {
  const removedEffects: string[] = [];
  
  for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
    const effect = unit.statusEffects[i];
    if (effect.removeOnDamagePercent > 0) {
      if (Math.random() * 100 < effect.removeOnDamagePercent) {
        removedEffects.push(effect.name);
        unit.statusEffects.splice(i, 1);
      }
    }
  }
  
  return removedEffects;
}

export function clearNonPersistentEffects(unit: BattleUnit): string[] {
  const clearedEffects: string[] = [];
  
  for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
    const effect = unit.statusEffects[i];
    if (!effect.persistAfterBattle) {
      clearedEffects.push(effect.name);
      unit.statusEffects.splice(i, 1);
    }
  }
  
  return clearedEffects;
}

export const STATUS_DATA_IDS = {
  DEAD: 1,
  POISON: 4,
  BLIND: 5,
  SILENCE: 6,
  BERSERK: 7,
  CONFUSE: 8,
  CHARM: 9,
  SLEEP: 10,
  PROVOKE: 11,
  PARALYZE: 12,
  STUN: 13,
  HP_REGEN: 15,
  HORNY: 1000,
  WEAKNESS: 1001,
  EVASION_UP: 1103,
  CRIT_UP: 1105,
  COUNTER_UP: 1107
} as const;

const MUTEX_STATUS_GROUPS: number[][] = [
  [STATUS_DATA_IDS.SLEEP, STATUS_DATA_IDS.CONFUSE, STATUS_DATA_IDS.CHARM, 
   STATUS_DATA_IDS.BERSERK, STATUS_DATA_IDS.STUN, STATUS_DATA_IDS.PARALYZE]
];

const MAX_STATUS_STACKS = 5;

function getMutexStatusIds(effectId: number): number[] {
  const result: number[] = [];
  for (const group of MUTEX_STATUS_GROUPS) {
    if (group.includes(effectId)) {
      result.push(...group.filter(id => id !== effectId));
    }
  }
  return result;
}

export function isDead(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.DEAD);
}

export function isPoisoned(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.POISON);
}

export function isBlinded(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.BLIND);
}

export function isSilenced(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.SILENCE);
}

export function isBerserk(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.BERSERK);
}

export function isConfused(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.CONFUSE);
}

export function isCharmed(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.CHARM);
}

export function isAsleep(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.SLEEP);
}

export function isProvoked(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.PROVOKE);
}

export function isParalyzed(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.PARALYZE);
}

export function isStunned(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.STUN);
}

export function hasHpRegen(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.HP_REGEN);
}

export function hasHorny(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.HORNY);
}

export function hasWeakness(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.WEAKNESS);
}

export function hasEvasionUp(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.EVASION_UP);
}

export function hasCritUp(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.CRIT_UP);
}

export function hasCounterUp(unit: BattleUnit): boolean {
  return hasStatusEffect(unit, STATUS_DATA_IDS.COUNTER_UP);
}

export function getNegativeEffectCount(unit: BattleUnit): number {
  return unit.statusEffects.filter(e => e.type === 'negative').length;
}

export function getPositiveEffectCount(unit: BattleUnit): number {
  return unit.statusEffects.filter(e => e.type === 'positive').length;
}

export function selectTargetForConfusedUnit(
  unit: BattleUnit,
  allUnits: BattleUnit[]
): BattleUnit | undefined {
  const aliveUnits = allUnits.filter(u => u.isAlive && u.id !== unit.id);
  if (aliveUnits.length === 0) return undefined;
  return aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
}

export function selectTargetForCharmedUnit(
  unit: BattleUnit,
  allyUnits: BattleUnit[]
): BattleUnit | undefined {
  const aliveAllies = allyUnits.filter(u => u.isAlive && u.id !== unit.id);
  if (aliveAllies.length === 0) return undefined;
  return aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
}

export function selectTargetForBerserkUnit(
  unit: BattleUnit,
  enemyUnits: BattleUnit[]
): BattleUnit | undefined {
  const aliveEnemies = enemyUnits.filter(u => u.isAlive);
  if (aliveEnemies.length === 0) return undefined;
  return aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
}

export function determineActionTarget(
  unit: BattleUnit,
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
  originalTarget: BattleUnit | undefined
): { target: BattleUnit | undefined; targetOverride: boolean } {
  if (shouldSkipTurn(unit)) {
    return { target: undefined, targetOverride: true };
  }
  
  if (shouldAttackAlly(unit)) {
    const allies = unit.faction === Faction.PLAYER ? playerUnits : enemyUnits;
    const target = selectTargetForCharmedUnit(unit, allies);
    return { target, targetOverride: true };
  }
  
  if (isForcedToAttackEnemy(unit)) {
    const enemies = unit.faction === Faction.PLAYER ? enemyUnits : playerUnits;
    const target = selectTargetForBerserkUnit(unit, enemies);
    return { target, targetOverride: true };
  }
  
  if (hasRandomTarget(unit)) {
    const allUnits = [...playerUnits, ...enemyUnits];
    const target = selectTargetForConfusedUnit(unit, allUnits);
    return { target, targetOverride: true };
  }
  
  return { target: originalTarget, targetOverride: false };
}

export function getEvasionBonus(unit: BattleUnit): number {
  let bonus = 0;
  for (const effect of unit.statusEffects) {
    bonus += effect.evasionBonus;
  }
  return bonus;
}

export function getCritBonus(unit: BattleUnit): number {
  let bonus = 0;
  for (const effect of unit.statusEffects) {
    bonus += effect.critRateBonus;
  }
  return bonus;
}

export function getCounterBonus(unit: BattleUnit): number {
  let bonus = 0;
  for (const effect of unit.statusEffects) {
    bonus += effect.counterRateBonus;
  }
  return bonus;
}

export function hasProvoke(unit: BattleUnit): boolean {
  return isProvoked(unit);
}

export function getProvokeWeight(unit: BattleUnit): number {
  return hasProvoke(unit) ? 3 : 1;
}

export function getDamageReceivedMultiplier(unit: BattleUnit): number {
  let multiplier = 1;
  for (const effect of unit.statusEffects) {
    multiplier *= effect.damageReceivedMultiplier;
  }
  return multiplier;
}
