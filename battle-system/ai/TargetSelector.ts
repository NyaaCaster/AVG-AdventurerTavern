/**
 * 战斗AI模块 - 目标选择器
 * 根据技能范围和目标选择策略选择合适的目标
 */

import { SkillScope } from '../types';
import type { BattleUnit, SkillData } from '../types';
import type { AITargetStrategy, TargetSelectionResult } from './types';

/** 目标选择器配置 */
export interface TargetSelectorConfig {
  /** 默认目标选择策略 */
  defaultStrategy?: AITargetStrategy;
}

/**
 * 目标选择器类
 * 负责根据技能范围和策略选择目标
 */
export class TargetSelector {
  private config: TargetSelectorConfig;

  constructor(config: TargetSelectorConfig = {}) {
    this.config = {
      defaultStrategy: 'random',
      ...config
    };
  }

  /**
   * 选择技能目标
   * @param skill 技能数据
   * @param user 行动使用者
   * @param playerUnits 玩家单位列表
   * @param enemyUnits 敌人单位列表
   * @param strategy 目标选择策略（可选，覆盖技能默认策略）
   * @returns 目标选择结果
   */
  selectTargets(
    skill: SkillData,
    user: BattleUnit,
    playerUnits: BattleUnit[],
    enemyUnits: BattleUnit[],
    strategy?: AITargetStrategy
  ): TargetSelectionResult {
    const effectiveStrategy = strategy || this.config.defaultStrategy!;
    
    const candidates = this.getCandidates(skill.scope, user, playerUnits, enemyUnits);
    
    const validCandidates = candidates.filter(unit => unit.isAlive);
    
    if (validCandidates.length === 0) {
      return {
        targets: [],
        strategy: effectiveStrategy
      };
    }

    if (skill.scope === SkillScope.SELF || skill.scope === SkillScope.ALLY_ALL || skill.scope === SkillScope.ENEMY_ALL) {
      return {
        targets: validCandidates,
        strategy: effectiveStrategy
      };
    }

    const selectedTargets = this.applyStrategy(validCandidates, effectiveStrategy, user);

    return {
      targets: selectedTargets,
      strategy: effectiveStrategy
    };
  }

  /**
   * 根据技能范围获取候选目标
   */
  private getCandidates(
    scope: SkillScope,
    user: BattleUnit,
    playerUnits: BattleUnit[],
    enemyUnits: BattleUnit[]
  ): BattleUnit[] {
    const isPlayer = user.faction === 'player';
    switch (scope) {
      case SkillScope.SELF:
        return [user];
      case SkillScope.ENEMY_SINGLE:
      case SkillScope.ENEMY_ALL:
      case SkillScope.ENEMY_ALL_CONTINUOUS:
      case SkillScope.ENEMY_RANDOM_SINGLE:
      case SkillScope.ENEMY_RANDOM_X2:
      case SkillScope.ENEMY_SINGLE_CONTINUOUS:
        return isPlayer 
          ? enemyUnits.filter(u => u.isAlive)
          : playerUnits.filter(u => u.isAlive);
      case SkillScope.ALLY_SINGLE:
      case SkillScope.ALLY_ALL:
      case SkillScope.ALLY_ALL_CONTINUOUS:
        return isPlayer
          ? playerUnits.filter(u => u.isAlive)
          : enemyUnits.filter(u => u.isAlive);
      case SkillScope.SELF_AFFECT_ALLY_ALL:
        return [...playerUnits, ...enemyUnits].filter(u => u.id !== user.id && u.isAlive);
      default:
        return [];
    }
  }

  /**
   * 应用目标选择策略
   */
  private applyStrategy(
    candidates: BattleUnit[],
    strategy: AITargetStrategy,
    user: BattleUnit
  ): BattleUnit[] {
    if (candidates.length === 0) {
      return [];
    }

    if (candidates.length === 1) {
      return candidates;
    }

    switch (strategy) {
      case 'lowest_hp':
        return [this.findLowest(candidates, u => u.stats.hp)];
      case 'highest_hp':
        return [this.findHighest(candidates, u => u.stats.hp)];
      case 'lowest_hp_percent':
        return [this.findLowest(candidates, u => u.stats.hp / u.stats.maxHp)];
      case 'highest_hp_percent':
        return [this.findHighest(candidates, u => u.stats.hp / u.stats.maxHp)];
      case 'lowest_mp':
        return [this.findLowest(candidates, u => u.stats.mp)];
      case 'highest_mp':
        return [this.findHighest(candidates, u => u.stats.mp)];
      case 'highest_atk':
        return [this.findHighest(candidates, u => u.stats.atk)];
      case 'lowest_atk':
        return [this.findLowest(candidates, u => u.stats.atk)];
      case 'highest_def':
        return [this.findHighest(candidates, u => u.stats.def)];
      case 'lowest_def':
        return [this.findLowest(candidates, u => u.stats.def)];
      case 'highest_matk':
        return [this.findHighest(candidates, u => u.stats.matk)];
      case 'lowest_matk':
        return [this.findLowest(candidates, u => u.stats.matk)];
      case 'highest_mdef':
        return [this.findHighest(candidates, u => u.stats.mdef)];
      case 'lowest_mdef':
        return [this.findLowest(candidates, u => u.stats.mdef)];
      case 'highest_agi':
        return [this.findHighest(candidates, u => u.stats.agi)];
      case 'lowest_agi':
        return [this.findLowest(candidates, u => u.stats.agi)];
      case 'highest_luk':
        return [this.findHighest(candidates, u => u.stats.luk)];
      case 'lowest_luk':
        return [this.findLowest(candidates, u => u.stats.luk)];
      case 'highest_level':
        return [this.findHighest(candidates, u => u.level)];
      case 'lowest_level':
        return [this.findLowest(candidates, u => u.level)];
      case 'highest_negative_state_count':
        return [this.findHighest(candidates, u => this.countNegativeStates(u))];
      case 'random':
        return [this.selectRandom(candidates)];
      case 'first':
        return [candidates[0]];
      case 'last':
        return [candidates[candidates.length - 1]];
      default:
        return [this.selectRandom(candidates)];
    }
  }

  /**
   * 找到指定属性最低的单位
   */
  private findLowest(candidates: BattleUnit[], getValue: (unit: BattleUnit) => number): BattleUnit {
    return candidates.reduce((min, unit) => {
      const minValue = getValue(min);
      const unitValue = getValue(unit);
      return unitValue < minValue ? unit : min;
    });
  }

  /**
   * 找到指定属性最高的单位
   */
  private findHighest(candidates: BattleUnit[], getValue: (unit: BattleUnit) => number): BattleUnit {
    return candidates.reduce((max, unit) => {
      const maxValue = getValue(max);
      const unitValue = getValue(unit);
      return unitValue > maxValue ? unit : max;
    });
  }

  /**
   * 随机选择一个单位
   */
  private selectRandom(candidates: BattleUnit[]): BattleUnit {
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  }

  /**
   * 计算单位拥有的负面状态数量
   */
  private countNegativeStates(unit: BattleUnit): number {
    return unit.statusEffects.filter(effect => {
      return effect.type === 'negative';
    }).length;
  }

  /**
   * 获取所有有效的目标选择策略
   */
  static getValidStrategies(): AITargetStrategy[] {
    return [
      'lowest_hp', 'highest_hp',
      'lowest_hp_percent', 'highest_hp_percent',
      'lowest_mp', 'highest_mp',
      'highest_atk', 'lowest_atk',
      'highest_def', 'lowest_def',
      'highest_matk', 'lowest_matk',
      'highest_mdef', 'lowest_mdef',
      'highest_agi', 'lowest_agi',
      'highest_luk', 'lowest_luk',
      'highest_level', 'lowest_level',
      'highest_negative_state_count',
      'random', 'first', 'last'
    ];
  }

  /**
   * 验证目标选择策略是否有效
   */
  static isValidStrategy(strategy: string): strategy is AITargetStrategy {
    return this.getValidStrategies().includes(strategy as AITargetStrategy);
  }
}

/** 默认目标选择器实例 */
export const targetSelector = new TargetSelector();

/**
 * 快捷函数：选择技能目标
 */
export function selectSkillTargets(
  skill: SkillData,
  user: BattleUnit,
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
  strategy?: AITargetStrategy
): TargetSelectionResult {
  return targetSelector.selectTargets(skill, user, playerUnits, enemyUnits, strategy);
}
