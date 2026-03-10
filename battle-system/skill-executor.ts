import {
  BattleUnit,
  BattleState,
  SkillData,
  SkillExecutionResult,
  TargetResult,
  DamageResult,
  AppliedEffect,
  EffectCode,
  DamageType,
  BattleLogEntry,
  StatusEffectType
} from './types';
import { selectTargetsByScope, TargetSelection } from './targeting';
import {
  calculateDamage,
  applyDamageToTarget,
  getElementalMultiplier
} from './damage';
import {
  calculateHealing,
  applyHealingToTarget,
  reviveUnit
} from './healing';
import {
  calculateAndExecuteAbsorb
} from './absorb';
import {
  applyStatusEffect,
  removeStatusEffect,
  processStatusEffectTurn,
  StatusEffectDefinition
} from './status-effects';
import {
  applyBuff,
  removeBuff,
  removeAllBuffs,
  removeAllDebuffs,
  BuffableStat,
  applyStandardBuff
} from './buffs-debuffs';

export interface SkillExecutionContext {
  state: BattleState;
  source: BattleUnit;
  skill: SkillData;
  targetIds?: string[];
}

const STATUS_EFFECTS: Record<number, StatusEffectDefinition> = {
  1: { id: 1, name: '中毒', type: StatusEffectType.NEGATIVE, baseDuration: 5, damagePerTurn: 50 },
  2: { id: 2, name: '麻痹', type: StatusEffectType.NEGATIVE, baseDuration: 3, restrictAction: true },
  3: { id: 3, name: '沉默', type: StatusEffectType.NEGATIVE, baseDuration: 3, restrictSkill: true },
  4: { id: 4, name: '失明', type: StatusEffectType.NEGATIVE, baseDuration: 3 },
  5: { id: 5, name: '眩晕', type: StatusEffectType.NEGATIVE, baseDuration: 2, restrictAction: true },
  6: { id: 6, name: '再生', type: StatusEffectType.POSITIVE, baseDuration: 5, healPerTurn: 30 },
  7: { id: 7, name: '护盾', type: StatusEffectType.POSITIVE, baseDuration: 3 },
  8: { id: 8, name: '狂暴', type: StatusEffectType.POSITIVE, baseDuration: 4 },
  9: { id: 9, name: '反射', type: StatusEffectType.SPECIAL, baseDuration: 2 },
  10: { id: 10, name: '即死', type: StatusEffectType.SPECIAL, baseDuration: 1 }
};

export function canUseSkill(unit: BattleUnit, skill: SkillData): boolean {
  if (!unit.isAlive) return false;
  if (unit.stats.mp < skill.mpCost) return false;
  if (skill.cooldown && unit.cooldowns.get(skill.id) && unit.cooldowns.get(skill.id)! > 0) {
    return false;
  }
  return true;
}

export function consumeMp(unit: BattleUnit, amount: number): void {
  unit.stats.mp = Math.max(0, unit.stats.mp - amount);
}

export function setSkillCooldown(unit: BattleUnit, skillId: number, cooldown: number): void {
  unit.cooldowns.set(skillId, cooldown);
}

export function processCooldowns(unit: BattleUnit): void {
  for (const [skillId, turns] of unit.cooldowns) {
    if (turns > 0) {
      unit.cooldowns.set(skillId, turns - 1);
    }
  }
}

export function executeSkill(context: SkillExecutionContext): SkillExecutionResult {
  const { state, source, skill, targetIds } = context;
  
  if (!canUseSkill(source, skill)) {
    return {
      skillId: skill.id,
      skillName: skill.name,
      source: source.name,
      targets: [],
      success: false,
      message: `${source.name} 无法使用 ${skill.name}`
    };
  }
  
  consumeMp(source, skill.mpCost);
  
  if (skill.cooldown) {
    setSkillCooldown(source, skill.id, skill.cooldown);
  }
  
  const targetSelection = selectTargetsByScope(source, state, skill.scope, targetIds?.[0]);
  
  if (!targetSelection.isValid || targetSelection.targets.length === 0) {
    return {
      skillId: skill.id,
      skillName: skill.name,
      source: source.name,
      targets: [],
      success: false,
      message: `${skill.name} 没有有效目标`
    };
  }
  
  const targets = targetSelection.targets;
  const targetResults: TargetResult[] = [];
  
  for (const target of targets) {
    const result = executeSkillOnTarget(source, target, skill);
    targetResults.push(result);
  }
  
  const success = targetResults.some(r => !r.missed);
  
  return {
    skillId: skill.id,
    skillName: skill.name,
    source: source.name,
    targets: targetResults,
    success,
    message: success ? `${source.name} 使用了 ${skill.name}` : `${skill.name} 失败了`
  };
}

function executeSkillOnTarget(source: BattleUnit, target: BattleUnit, skill: SkillData): TargetResult {
  const effects: AppliedEffect[] = [];
  let damage: DamageResult | undefined;
  let missed = false;
  
  const successRoll = Math.random();
  if (successRoll > skill.successRate) {
    missed = true;
    return {
      targetId: target.id,
      targetName: target.name,
      effects,
      missed
    };
  }
  
  if (skill.damage) {
    damage = executeDamage(source, target, skill);
  }
  
  if (skill.effects) {
    for (const effect of skill.effects) {
      const appliedEffect = executeEffect(source, target, effect);
      effects.push(appliedEffect);
    }
  }
  
  return {
    targetId: target.id,
    targetName: target.name,
    damage,
    effects,
    missed
  };
}

function executeDamage(source: BattleUnit, target: BattleUnit, skill: SkillData): DamageResult {
  if (!skill.damage) {
    throw new Error('Skill has no damage data');
  }
  
  const { damage } = skill;
  
  switch (damage.type) {
    case DamageType.HP_DAMAGE:
      return calculateDamage({
        source,
        target,
        basePower: 100,
        isPhysical: true,
        isMagical: false,
        element: damage.elementId,
        canCritical: damage.critical ?? true,
        hasVariance: damage.variance ?? true
      });
    
    case DamageType.HP_RECOVERY:
      return calculateHealing({
        source,
        target,
        basePower: 100,
        scaleWithMat: true,
        hasVariance: damage.variance ?? true
      });
    
    case DamageType.HP_ABSORB:
      const absorbResult = calculateAndExecuteAbsorb({
        source,
        target,
        basePower: 100,
        isPhysical: true,
        isMagical: false,
        element: damage.elementId,
        canCritical: damage.critical ?? true,
        hasVariance: damage.variance ?? true
      });
      return absorbResult.damageResult;
    
    default:
      return {
        value: 0,
        isCritical: false,
        isHealing: false,
        isAbsorb: false,
        element: damage.elementId,
        variance: 1
      };
  }
}

function executeEffect(
  source: BattleUnit,
  target: BattleUnit,
  effect: { code: EffectCode; dataId: number; value1: number; value2: number }
): AppliedEffect {
  switch (effect.code) {
    case EffectCode.ADD_STATE:
      return executeAddState(target, effect.dataId, effect.value1);
    
    case EffectCode.REMOVE_STATE:
      return executeRemoveState(target, effect.dataId);
    
    case EffectCode.ADD_BUFF:
      return executeAddBuff(target, effect.dataId, effect.value1, effect.value2);
    
    case EffectCode.ADD_DEBUFF:
      return executeAddDebuff(target, effect.dataId, effect.value1, effect.value2);
    
    case EffectCode.REMOVE_BUFF:
      return executeRemoveBuff(target, effect.dataId);
    
    case EffectCode.REMOVE_DEBUFF:
      return executeRemoveDebuff(target, effect.dataId);
    
    case EffectCode.SPECIAL:
      return executeSpecialEffect(source, target, effect.dataId, effect.value1);
    
    default:
      return {
        type: effect.code,
        name: '未知效果',
        value: 0,
        duration: 0,
        success: false
      };
  }
}

function executeAddState(target: BattleUnit, stateId: number, chance: number): AppliedEffect {
  const statusEffect = STATUS_EFFECTS[stateId];
  if (!statusEffect) {
    return {
      type: EffectCode.ADD_STATE,
      name: '未知状态',
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  return applyStatusEffect(target, statusEffect, chance);
}

function executeRemoveState(target: BattleUnit, stateId: number): AppliedEffect {
  const statusEffect = STATUS_EFFECTS[stateId];
  if (!statusEffect) {
    return {
      type: EffectCode.REMOVE_STATE,
      name: '未知状态',
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  const success = removeStatusEffect(target, stateId);
  return {
    type: EffectCode.REMOVE_STATE,
    name: statusEffect.name,
    value: 1,
    duration: 0,
    success
  };
}

function executeAddBuff(
  target: BattleUnit,
  statId: number,
  value: number,
  duration: number
): AppliedEffect {
  const stat = getStatFromId(statId);
  if (!stat) {
    return {
      type: EffectCode.ADD_BUFF,
      name: '未知增益',
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  return applyStandardBuff(target, stat, duration, false);
}

function executeAddDebuff(
  target: BattleUnit,
  statId: number,
  value: number,
  duration: number
): AppliedEffect {
  const stat = getStatFromId(statId);
  if (!stat) {
    return {
      type: EffectCode.ADD_DEBUFF,
      name: '未知减益',
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  return applyStandardBuff(target, stat, duration, true);
}

function executeRemoveBuff(target: BattleUnit, statId: number): AppliedEffect {
  const stat = getStatFromId(statId);
  if (!stat) {
    return {
      type: EffectCode.REMOVE_BUFF,
      name: '未知增益',
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  const success = removeBuff(target, stat, false);
  return {
    type: EffectCode.REMOVE_BUFF,
    name: `${stat}增益`,
    value: 1,
    duration: 0,
    success
  };
}

function executeRemoveDebuff(target: BattleUnit, statId: number): AppliedEffect {
  const stat = getStatFromId(statId);
  if (!stat) {
    return {
      type: EffectCode.REMOVE_DEBUFF,
      name: '未知减益',
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  const success = removeBuff(target, stat, true);
  return {
    type: EffectCode.REMOVE_DEBUFF,
    name: `${stat}减益`,
    value: 1,
    duration: 0,
    success
  };
}

function executeSpecialEffect(
  source: BattleUnit,
  target: BattleUnit,
  effectId: number,
  value: number
): AppliedEffect {
  switch (effectId) {
    case 1:
      const reviveResult = reviveUnit(target, value);
      return {
        type: EffectCode.SPECIAL,
        name: '复活',
        value: reviveResult.hpRecovered,
        duration: 0,
        success: reviveResult.success
      };
    
    case 2:
      const removedBuffs = removeAllBuffs(target);
      return {
        type: EffectCode.SPECIAL,
        name: '驱散',
        value: removedBuffs,
        duration: 0,
        success: removedBuffs > 0
      };
    
    case 3:
      const removedDebuffs = removeAllDebuffs(target);
      return {
        type: EffectCode.SPECIAL,
        name: '净化',
        value: removedDebuffs,
        duration: 0,
        success: removedDebuffs > 0
      };
    
    default:
      return {
        type: EffectCode.SPECIAL,
        name: '未知特殊效果',
        value: 0,
        duration: 0,
        success: false
      };
  }
}

function getStatFromId(statId: number): BuffableStat | undefined {
  const stats: BuffableStat[] = ['atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
  return stats[statId - 1];
}

export function processTurnEnd(state: BattleState): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  
  const allUnits = [...state.playerUnits, ...state.enemyUnits];
  
  for (const unit of allUnits) {
    if (!unit.isAlive) continue;
    
    const statusResult = processStatusEffectTurn(unit);
    
    if (statusResult.damageTaken > 0) {
      logs.push({
        turn: state.turnNumber,
        type: 'damage',
        source: '状态效果',
        target: unit.name,
        value: statusResult.damageTaken,
        description: `${unit.name} 受到状态效果伤害 ${statusResult.damageTaken}`
      });
    }
    
    if (statusResult.healingReceived > 0) {
      logs.push({
        turn: state.turnNumber,
        type: 'heal',
        source: '状态效果',
        target: unit.name,
        value: statusResult.healingReceived,
        description: `${unit.name} 通过状态效果恢复 ${statusResult.healingReceived} HP`
      });
    }
    
    for (const effectName of statusResult.effectsExpired) {
      logs.push({
        turn: state.turnNumber,
        type: 'effect',
        target: unit.name,
        description: `${unit.name} 的 ${effectName} 效果消失了`
      });
    }
    
    processCooldowns(unit);
  }
  
  return logs;
}

export function checkBattleEnd(state: BattleState): { isEnded: boolean; winner?: 'player' | 'enemy' } {
  const playerAlive = state.playerUnits.some(u => u.isAlive);
  const enemyAlive = state.enemyUnits.some(u => u.isAlive);
  
  if (!playerAlive) {
    return { isEnded: true, winner: 'enemy' };
  }
  
  if (!enemyAlive) {
    return { isEnded: true, winner: 'player' };
  }
  
  return { isEnded: false };
}
