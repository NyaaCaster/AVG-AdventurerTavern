/**
 * 战斗系统 - 技能执行模块
 * 处理技能的使用、伤害计算、效果应用等核心逻辑
 * 
 * 主要功能：
 * - 技能可用性检查（MP、冷却时间等）
 * - 技能目标选择
 * - 伤害计算与执行
 * - 状态效果应用
 * - 增益/减益效果应用
 * - 回合结束处理
 */

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
  StatusEffectType,
  Faction
} from './types';
import { selectTargetsByScope, TargetSelection } from './targeting';
import {
  calculateDamage,
  calculateHitChance,
  applyDamageToTarget,
  ApplyDamageResult
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
  getStatusEffectDefinition,
  checkWakeOnPhysicalHit,
  checkRemoveOnDamage,
  determineActionTarget,
  getHitRateModifier,
  getCritBonus,
  getCounterBonus,
  getEvasionBonus,
  getProvokeWeight,
  clearNonPersistentEffects,
  getDamageReceivedMultiplier
} from './status-effects';
import {
  applyBuff,
  removeBuff,
  removeAllBuffs,
  removeAllDebuffs,
  BuffableStat,
  applyStandardBuff
} from './buffs-debuffs';
import { calculateSkillDamage } from './formula-parser';
import { CRITICAL_CONFIG } from '../data/battle-data/critical-config';

/**
 * 技能执行上下文
 * 包含执行技能所需的所有信息
 */
export interface SkillExecutionContext {
  /** 战斗状态 */
  state: BattleState;
  /** 技能来源单位 */
  source: BattleUnit;
  /** 技能数据 */
  skill: SkillData;
  /** 目标ID列表（可选） */
  targetIds?: string[];
}

/**
 * 检查单位是否可以使用技能
 * 验证以下条件：
 * 1. 单位是否存活
 * 2. MP是否足够
 * 3. 技能是否在冷却中
 * 
 * @param unit 战斗单位
 * @param skill 技能数据
 * @returns 是否可以使用技能
 * 
 * @example
 * if (canCastSkill(unit, skill)) {
 *   executeSkill({ state, source: unit, skill });
 * }
 */
export function canCastSkill(unit: BattleUnit, skill: SkillData): boolean {
  if (!unit.isAlive) return false;
  if (unit.stats.mp < skill.mpCost) return false;
  const cooldown = getSkillCooldown(skill);
  if (cooldown && unit.cooldowns.get(skill.id) && unit.cooldowns.get(skill.id)! > 0) {
    return false;
  }
  return true;
}

/**
 * 获取技能的冷却时间
 * 优先使用 skill.cooldown 字段，如果没有则从 note 字段解析
 * 
 * @param skill 技能数据
 * @returns 冷却回合数
 * 
 * @example
 * // 从 note 字段解析: "<Cooldown: 2>"
 * const cd = getSkillCooldown(skill); // 2
 */
export function getSkillCooldown(skill: SkillData): number {
  if (skill.cooldown !== undefined) {
    return skill.cooldown;
  }
  
  if (skill.note) {
    const cooldownMatch = skill.note.match(/<Cooldown:\s*(\d+)>/i);
    if (cooldownMatch) {
      return parseInt(cooldownMatch[1], 10);
    }
  }
  
  return 0;
}

/**
 * 消耗单位的MP
 * @param unit 战斗单位
 * @param amount 消耗量
 */
export function consumeMp(unit: BattleUnit, amount: number): void {
  unit.stats.mp = Math.max(0, unit.stats.mp - amount);
}

/**
 * 设置技能冷却时间
 * @param unit 战斗单位
 * @param skillId 技能ID
 * @param cooldown 冷却回合数
 */
export function setSkillCooldown(unit: BattleUnit, skillId: number, cooldown: number): void {
  unit.cooldowns.set(skillId, cooldown);
}

/**
 * 处理回合结束时的冷却时间递减
 * 所有冷却中的技能冷却时间减1
 * @param unit 战斗单位
 */
export function processCooldowns(unit: BattleUnit): void {
  for (const [skillId, turns] of unit.cooldowns) {
    if (turns > 0) {
      unit.cooldowns.set(skillId, turns - 1);
    }
  }
}

/**
 * 执行技能的主函数
 * 处理完整的技能执行流程：
 * 1. 检查技能是否可用
 * 2. 消耗MP
 * 3. 设置冷却时间
 * 4. 选择目标
 * 5. 对每个目标执行技能效果
 * 
 * @param context 技能执行上下文
 * @returns 技能执行结果
 * 
 * @example
 * const result = executeSkill({
 *   state: battleState,
 *   source: attacker,
 *   skill: skillData,
 *   targetIds: ['enemy-1']
 * });
 */
export function executeSkill(context: SkillExecutionContext): SkillExecutionResult {
  const { state, source, skill, targetIds } = context;
  
  if (!canCastSkill(source, skill)) {
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
  
  const cooldown = getSkillCooldown(skill);
  if (cooldown > 0) {
    setSkillCooldown(source, skill.id, cooldown);
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

/**
 * 对单个目标执行技能
 * 处理成功率判定、伤害计算、效果应用
 * 
 * @param source 技能来源单位
 * @param target 目标单位
 * @param skill 技能数据
 * @returns 目标执行结果
 */
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
    
    if (damage && !damage.isHealing && !damage.isAbsorb && damage.value > 0) {
      const hitType = skill.hitType ?? 1;
      const isPhysical = hitType === 1;
      applyDamageToTarget(target, damage.value, isPhysical);
    } else if (damage && damage.isHealing && damage.value > 0) {
      applyHealingToTarget(target, damage.value);
    } else if (damage && damage.isAbsorb && damage.value > 0) {
      const hitType = skill.hitType ?? 1;
      const isPhysical = hitType === 1;
      calculateAndExecuteAbsorb({
        source,
        target,
        basePower: damage.value,
        isPhysical,
        isMagical: !isPhysical
      });
    }
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

/**
 * 执行伤害计算
 * 完整的伤害计算流程：
 * 1. 解析伤害公式计算基础伤害
 * 2. 应用弱点倍率
 * 3. 判定暴击（暴击时跳过闪避判定）
 * 4. 判定闪避（仅物理攻击，魔法必定命中）
 * 5. 应用伤害浮动
 * 6. 根据伤害类型返回结果
 * 
 * @param source 攻击者
 * @param target 目标
 * @param skill 技能数据
 * @returns 伤害结果
 */
function executeDamage(source: BattleUnit, target: BattleUnit, skill: SkillData): DamageResult {
  if (!skill.damage) {
    throw new Error('Skill has no damage data');
  }
  
  const { damage } = skill;
  const formula = damage.formula;
  const variancePercent = damage.variance ?? 20;
  const hitType = skill.hitType ?? 1;
  
  let baseDamage: number;
  
  if (formula) {
    baseDamage = calculateSkillDamage(formula, source, target);
  } else {
    baseDamage = 100;
  }
  
  const damageMultiplier = getDamageReceivedMultiplier(target);
  if (damageMultiplier !== 1) {
    baseDamage = Math.floor(baseDamage * damageMultiplier);
  }
  
  const critBonus = getCritBonus(source);
  let isCritical = false;
  if (damage.critical ?? true) {
    const critChance = calculateCriticalChance(source.stats.luk, target.stats.luk, critBonus);
    isCritical = Math.random() < critChance;
  }
  
  if (isCritical) {
    baseDamage = Math.floor(baseDamage * CRITICAL_CONFIG.criticalDamageMultiplier);
  } else {
    if (hitType !== 0) {
      const hitResult = calculateHitChance(source, target, hitType === 1);
      if (!hitResult.hits) {
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
  }
  
  let varianceFactor = 1;
  if (variancePercent > 0) {
    const variance = (Math.random() * 2 - 1) * (variancePercent / 100);
    varianceFactor = 1 + variance;
  }
  
  const finalDamage = Math.max(0, Math.floor(baseDamage * varianceFactor));
  
  switch (damage.type) {
    case DamageType.HP_DAMAGE:
      return {
        value: finalDamage,
        isCritical,
        isHealing: false,
        isAbsorb: false,
        element: damage.elementId,
        variance: varianceFactor
      };
    
    case DamageType.HP_RECOVERY:
      return {
        value: finalDamage,
        isCritical: false,
        isHealing: true,
        isAbsorb: false,
        element: damage.elementId,
        variance: varianceFactor
      };
    
    case DamageType.HP_ABSORB:
      return {
        value: finalDamage,
        isCritical,
        isHealing: false,
        isAbsorb: true,
        element: damage.elementId,
        variance: varianceFactor
      };
    
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

/**
 * 计算暴击概率
 * 公式：基础暴击率 + LUK差值 × 因子 + 额外加成
 * 结果限制在配置的最小/最大值之间
 * 
 * @param attackerLuk 攻击者幸运值
 * @param defenderLuk 防御者幸运值
 * @param critBonus 额外暴击加成
 * @returns 暴击概率（0~30%）
 */
function calculateCriticalChance(attackerLuk: number, defenderLuk: number, critBonus: number): number {
  const lukDifference = attackerLuk - defenderLuk;
  const chance = CRITICAL_CONFIG.baseCriticalChance + 
    lukDifference * CRITICAL_CONFIG.lukDifferenceFactor + 
    critBonus;
  return Math.max(
    CRITICAL_CONFIG.minCriticalChance, 
    Math.min(CRITICAL_CONFIG.maxCriticalChance, chance)
  );
}

/**
 * 执行技能效果
 * 根据效果代码分发到对应的处理函数
 * 
 * 支持的效果类型：
 * - ADD_STATE: 添加状态效果
 * - REMOVE_STATE: 移除状态效果
 * - ADD_BUFF: 添加增益
 * - ADD_DEBUFF: 添加减益
 * - REMOVE_BUFF: 移除增益
 * - REMOVE_DEBUFF: 移除减益
 * - SPECIAL: 特殊效果（复活、驱散、净化等）
 * 
 * @param source 效果来源
 * @param target 效果目标
 * @param effect 效果配置
 * @returns 应用效果结果
 */
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

/**
 * 执行添加状态效果
 * @param target 目标单位
 * @param stateId 状态ID
 * @param chance 成功概率（0~1）
 * @returns 应用效果结果
 */
function executeAddState(target: BattleUnit, stateId: number, chance: number): AppliedEffect {
  const statusEffect = getStatusEffectDefinition(stateId);
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

/**
 * 执行移除状态效果
 * @param target 目标单位
 * @param stateId 状态ID
 * @returns 应用效果结果
 */
function executeRemoveState(target: BattleUnit, stateId: number): AppliedEffect {
  const statusEffect = getStatusEffectDefinition(stateId);
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

/**
 * 执行特殊效果
 * 支持的特殊效果：
 * - effectId 1: 复活，value为复活后HP百分比
 * - effectId 2: 驱散，移除目标所有增益效果
 * - effectId 3: 净化，移除目标所有减益效果
 * 
 * @param source 效果来源
 * @param target 目标单位
 * @param effectId 特殊效果ID
 * @param value 效果数值
 * @returns 应用效果结果
 */
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

/**
 * 根据属性ID获取可增益属性类型
 * 属性ID映射：1=ATK, 2=DEF, 3=MAT, 4=MDF, 5=AGI, 6=LUK
 * 
 * @param statId 属性ID
 * @returns 属性类型，如果无效则返回undefined
 */
function getStatFromId(statId: number): BuffableStat | undefined {
  const stats: BuffableStat[] = ['atk', 'def', 'matk', 'mdef', 'agi', 'luk'];
  return stats[statId - 1];
}

/**
 * 处理回合结束
 * 执行以下操作：
 * 1. 处理所有存活单位的状态效果回合
 * 2. 记录状态效果造成的伤害/治疗
 * 3. 记录过期的状态效果
 * 4. 递减技能冷却时间
 * 
 * @param state 战斗状态
 * @returns 战斗日志条目列表
 */
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

/**
 * 检查战斗是否结束
 * 判断条件：一方阵营所有单位死亡
 * 
 * @param state 战斗状态
 * @returns 战斗结束结果，包含是否结束和获胜方
 */
export function checkBattleEnd(state: BattleState): { isEnded: boolean; winner?: Faction } {
  const playerAlive = state.playerUnits.some(u => u.isAlive);
  const enemyAlive = state.enemyUnits.some(u => u.isAlive);
  
  if (!playerAlive) {
    return { isEnded: true, winner: Faction.ENEMY };
  }
  
  if (!enemyAlive) {
    return { isEnded: true, winner: Faction.PLAYER };
  }
  
  return { isEnded: false };
}
