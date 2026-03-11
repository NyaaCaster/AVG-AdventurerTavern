/**
 * 战斗系统 - 玩家指令模块
 * 处理玩家角色在战斗中的指令输入和执行
 */

import { BattleUnit, BattleState, SkillData, SkillScope } from './types';
import { selectTargetsByScope, selectDeadAllyTarget, getAliveUnits, getDeadUnits } from './targeting';

/**
 * 玩家指令类型
 */
export enum PlayerCommand {
  /** 攻击 */
  ATTACK = 'attack',
  /** 技能 */
  SKILL = 'skill',
  /** 道具 */
  ITEM = 'item',
  /** 防御 */
  GUARD = 'guard',
  /** 逃跑 */
  ESCAPE = 'escape',
  /** 发言（预留） */
  MESSAGE = 'message'
}

/**
 * 技能可用性检查结果
 */
export interface SkillAvailability {
  /** 技能是否可用 */
  isAvailable: boolean;
  /** 不可用的原因 */
  reason?: 'cooldown' | 'mp_insufficient';
  /** MP不足时需要的MP值 */
  requiredMp?: number;
  /** 冷却剩余回合 */
  cooldownRemaining?: number;
}

/**
 * 道具可用性检查结果
 */
export interface ItemAvailability {
  /** 道具是否可用 */
  isAvailable: boolean;
  /** 不可用的原因 */
  reason?: 'invalid_target' | 'target_not_dead' | 'hp_full' | 'mp_full';
  /** 目标要求描述 */
  targetRequirement?: string;
}

/**
 * 逃跑判定结果
 */
export interface EscapeResult {
  /** 是否成功逃跑 */
  success: boolean;
  /** 成功率 */
  successRate: number;
  /** 随机值 */
  randomValue: number;
  /** 玩家AGI */
  playerAgi: number;
  /** 敌人最高AGI */
  maxEnemyAgi: number;
}

/**
 * 战斗结束原因
 */
export enum BattleEndReason {
  /** 胜利 - 敌人全灭 */
  VICTORY = 'victory',
  /** 失败 - 玩家全灭 */
  DEFEAT = 'defeat',
  /** 逃跑成功 */
  ESCAPED = 'escaped'
}

/**
执行结果
 */
export interface SkillExecuteResult {
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 道具执行结果
 */
export interface ItemExecuteResult {
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 检查角色状态是否限制行动
 * 
 * @param unit 角色单位
 * @returns 是否被限制行动（true=无法行动）
 */
export function isActionRestricted(unit: BattleUnit): boolean {
  // 检查是否有跳过回合的状态效果
  for (const effect of unit.statusEffects) {
    if (effect.skipTurn) {
      return true;
    }
  }
  
  // 检查死亡状态
  if (!unit.isAlive) {
    return true;
  }
  
  return false;
}

/**
 * 获取状态限制的类型
 * 
 * @param unit 角色单位
 * @returns 限制类型的描述，或null表示无限制
 */
export function getRestrictionType(unit: BattleUnit): string | null {
  if (!unit.isAlive) return '已死亡';
  
  for (const effect of unit.statusEffects) {
    if (effect.skipTurn) {
      return `${effect.name}中`;
    }
  }
  
  return null;
}

/**
 * 检查角色是否可以使用技能（受限于状态）
 * 
 * @param unit 角色单位
 * @returns 是否可以使用技能
 */
export function canUseSkillDueToStatus(unit: BattleUnit): boolean {
  // 检查是否有禁止使用技能的状态效果
  for (const effect of unit.statusEffects) {
    if (effect.canUseSkill === false) {
      return false;
    }
  }
  
  return true;
}

/**
 * 检查技能是否可用（MP、冷却）
 * 
 * @param unit 角色单位
 * @param skill 技能数据
 * @returns 可用性检查结果
 */
export function checkSkillAvailability(unit: BattleUnit, skill: SkillData): SkillAvailability {
  // 检查冷却
  const cooldown = unit.cooldowns.get(skill.id);
  if (cooldown !== undefined && cooldown > 0) {
    return {
      isAvailable: false,
      reason: 'cooldown',
      cooldownRemaining: cooldown
    };
  }
  
  // 检查MP
  if (unit.stats.mp < skill.mpCost) {
    return {
      isAvailable: false,
      reason: 'mp_insufficient',
      requiredMp: skill.mpCost
    };
  }
  
  return { isAvailable: true };
}

/**
 * 检查道具是否可用（目标条件）
 * 
 * @param unit 使用道具的角色
 * @param item 道具数据
 * @param state 战斗状态
 * @param targetId 指定目标ID（可选）
 * @returns 可用性检查结果
 */
export function checkItemAvailability(
  unit: BattleUnit,
  item: { consumableEffects?: any },
  state: BattleState,
  targetId?: string
): ItemAvailability {
  const effects = item.consumableEffects || {};
  
  // 复活道具
  if (effects.revive) {
    const allies = state.playerUnits.filter(u => u.faction === unit.faction);
    const deadAllies = getDeadUnits(allies);
    
    if (deadAllies.length === 0) {
      return {
        isAvailable: false,
        reason: 'target_not_dead',
        targetRequirement: '需要死亡的我方单位'
      };
    }
    
    // 如果指定了目标，检查目标是否死亡
    if (targetId) {
      const target = deadAllies.find(u => u.id === targetId);
      if (!target) {
        return {
          isAvailable: false,
          reason: 'invalid_target',
          targetRequirement: '需要选择死亡的我方单位'
        };
      }
    }
  }
  
  // HP回复道具
  if (effects.recoverHpPercent !== undefined) {
    const allies = state.playerUnits.filter(u => u.faction === unit.faction);
    const aliveAllies = getAliveUnits(allies);
    
    // 检查是否有可回复的单位
    const canRecover = aliveAllies.some(u => u.stats.hp < u.stats.maxHp);
    if (!canRecover) {
      return {
        isAvailable: false,
        reason: 'hp_full',
        targetRequirement: '需要HP不足的我方单位'
      };
    }
  }
  
  // MP回复道具
  if (effects.recoverMpPercent !== undefined) {
    const allies = state.playerUnits.filter(u => u.faction === unit.faction);
    const aliveAllies = getAliveUnits(allies);
    
    const canRecover = aliveAllies.some(u => u.stats.mp < u.stats.maxMp);
    if (!canRecover) {
      return {
        isAvailable: false,
        reason: 'mp_full',
        targetRequirement: '需要MP不足的我方单位'
      };
    }
  }
  
  // 状态解除道具
  if (effects.removeStatus && effects.removeStatus.length > 0) {
    const allies = state.playerUnits.filter(u => u.faction === unit.faction);
    const aliveAllies = getAliveUnits(allies);
    
    const hasTargetStatus = aliveAllies.some(u => 
      u.statusEffects.some(e => effects.removeStatus.includes(e.effectId))
    );
    
    if (!hasTargetStatus) {
      const statusNames = effects.removeStatus.join('、');
      return {
        isAvailable: false,
        reason: 'invalid_target',
        targetRequirement: `需要处于${statusNames}状态的我方单位`
      };
    }
  }
  
  return { isAvailable: true };
}

/**
 * 执行防御指令
 * 
 * @param unit 角色单位
 * @param state 战斗状态
 */
export function executeGuardCommand(unit: BattleUnit, state: BattleState): void {
  unit.isGuarding = true;
}

/**
 * 执行逃跑指令
 * 
 * 使用RPG Maker MZ原生逃跑公式：
 * 成功率 = 150 × 玩家AGI / (150 + 敌人平均AGI)
 * 
 * @param unit 逃跑的角色（通常是char_1）
 * @param state 战斗状态
 * @returns 逃跑结果
 */
export function executeEscapeCommand(unit: BattleUnit, state: BattleState): EscapeResult {
  // 获取玩家AGI
  const playerAgi = unit.stats.agi;
  
  // 获取敌人平均AGI（RPG Maker原生使用平均AGI）
  const enemyAgiValues = state.enemyUnits
    .filter(u => u.isAlive)
    .map(u => u.stats.agi);
  
  const avgEnemyAgi = enemyAgiValues.length > 0 
    ? enemyAgiValues.reduce((a, b) => a + b, 0) / enemyAgiValues.length 
    : 0;
  
  // RPG Maker原生公式：成功率 = 150 × 玩家AGI / (150 + 敌人平均AGI)
  const successRate = avgEnemyAgi > 0 
    ? (150 * playerAgi) / (150 + avgEnemyAgi) 
    : 100;
  
  // 随机判定
  const randomValue = Math.random() * 100;
  const success = randomValue < successRate;
  
  return {
    success,
    successRate: Math.round(successRate * 10) / 10,  // 保留一位小数
    randomValue: Math.round(randomValue),
    playerAgi,
    maxEnemyAgi: Math.round(avgEnemyAgi)  // 返回平均AGI
  };
}

/**
 * 根据技能范围获取可选目标列表
 * 
 * @param source 技能来源
 * @param state 战斗状态
 * @param scope 技能范围
 * @returns 可选目标列表
 */
export function getSelectableTargets(
  source: BattleUnit,
  state: BattleState,
  scope: SkillScope
): BattleUnit[] {
  switch (scope) {
    case SkillScope.ENEMY_SINGLE:
    case SkillScope.ENEMY_SINGLE_CONTINUOUS:
      return getAliveUnits(state.enemyUnits);
    
    case SkillScope.ENEMY_ALL:
    case SkillScope.ENEMY_ALL_CONTINUOUS:
      return [];
    
    case SkillScope.ALLY_SINGLE:
    case SkillScope.ALLY_ALL:
    case SkillScope.ALLY_ALL_CONTINUOUS:
      return getAliveUnits(state.playerUnits);
    
    case SkillScope.SELF:
      return [source];
    
    case SkillScope.SELF_AFFECT_ALLY_ALL:
      return [];
    
    case 9: // 复活用
      return getDeadUnits(state.playerUnits);
    
    default:
      return [];
  }
}

/**
 * 检查战斗是否结束
 * 
 * @param state 战斗状态
 * @returns 结束原因，或null表示战斗继续
 */
export function checkBattleEnd(state: BattleState): BattleEndReason | null {
  const alivePlayers = state.playerUnits.filter(u => u.isAlive);
  const aliveEnemies = state.enemyUnits.filter(u => u.isAlive);
  
  // 敌人全灭 - 胜利
  if (aliveEnemies.length === 0) {
    return BattleEndReason.VICTORY;
  }
  
  // 玩家全灭 - 失败
  if (alivePlayers.length === 0) {
    return BattleEndReason.DEFEAT;
  }
  
  return null;
}
