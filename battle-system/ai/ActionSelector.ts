/**
 * 战斗AI模块 - 行动选择器
 * 根据AI风格和评分方差选择行动
 * 
 * 行动选择流程：
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                     行动选择流程                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │   ActionSelectionContext                                            │
 * │        │                                                            │
 * │        ▼                                                            │
 * │   ┌─────────────────┐                                               │
 * │   │  过滤行动列表   │                                               │
 * │   │  - MP检查       │                                               │
 * │   │  - 冷却检查     │ ◄── CooldownManager                           │
 * │   │  - 条件检查     │ ◄── ConditionEvaluator                        │
 * │   └────────┬────────┘                                               │
 * │            │                                                        │
 * │            ▼                                                        │
 * │   ┌─────────────────┐                                               │
 * │   │  AI风格选择     │ ◄── AIStyle (CLASSIC/GAMBIT/CASUAL/RANDOM)    │
 * │   └────────┬────────┘                                               │
 * │            │                                                        │
 * │            ▼                                                        │
 * │   ActionCandidate | null                                            │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { BattleUnit, SkillData } from '../types';
import type { EnemyAction } from '../../data/battle-data/enemies';
import {
  AIStyle,
  AIConfig,
  ActionCandidate,
  SkillAIConfig,
  UnitAction
} from './types';
import { ConditionParser } from './ConditionParser';
import { ConditionEvaluator, EvaluationContext } from './ConditionEvaluator';
import type { CooldownManager } from './CooldownManager';

/** 行动选择器配置 */
export interface ActionSelectorConfig extends AIConfig {
  /** 条件解析器实例 */
  conditionParser?: ConditionParser;
  /** 冷却管理器实例 */
  cooldownManager?: CooldownManager;
}

/** 行动选择上下文 */
export interface ActionSelectionContext {
  /** 行动使用者 */
  user: BattleUnit;
  /** 当前回合数 */
  turnNumber: number;
  /** 玩家单位列表 */
  playerUnits: BattleUnit[];
  /** 敌人单位列表 */
  enemyUnits: BattleUnit[];
  /** 可用行动列表（支持统一格式） */
  actions: UnitAction[];
  /** 技能数据映射 */
  skillMap: Map<number, SkillData>;
  /** 开关状态映射 */
  switches?: Map<number, boolean>;
  /** 变量值映射 */
  variables?: Map<number, number>;
}

/**
 * 行动选择器类
 * 负责根据AI风格和条件选择行动
 */
export class ActionSelector {
  private config: ActionSelectorConfig;
  private conditionParser: ConditionParser;

  constructor(config: ActionSelectorConfig) {
    this.config = config;
    this.conditionParser = config.conditionParser || new ConditionParser();
  }

  /**
   * 选择行动
   * @param context 行动选择上下文
   * @returns 选择的行动候选项，或null（无有效行动时）
   */
  selectAction(context: ActionSelectionContext): ActionCandidate | null {
    const candidates = this.evaluateActions(context);

    if (candidates.length === 0) {
      return null;
    }

    switch (this.config.style) {
      case AIStyle.CLASSIC:
        return this.selectClassic(candidates);

      case AIStyle.GAMBIT:
        return this.selectGambit(candidates);

      case AIStyle.CASUAL:
        return this.selectCasual(candidates);

      case AIStyle.RANDOM:
        return this.selectRandom(candidates);

      default:
        return this.selectClassic(candidates);
    }
  }

  /**
   * 评估所有行动
   * @param context 行动选择上下文
   * @returns 行动候选项列表
   */
  evaluateActions(context: ActionSelectionContext): ActionCandidate[] {
    const candidates: ActionCandidate[] = [];

    for (const action of context.actions) {
      const skill = context.skillMap.get(action.skillId);
      if (!skill) {
        continue;
      }

      const aiConfig = this.conditionParser.parseSkillAIConfig(skill.note || '');

      const isValid = this.checkActionValidity(action, skill, aiConfig, context);

      const score = action.rating;

      candidates.push({
        action,
        skill,
        aiConfig,
        isValid,
        score
      });
    }

    return candidates;
  }

  /**
   * 检查行动是否有效
   */
  private checkActionValidity(
    action: UnitAction,
    skill: SkillData,
    aiConfig: SkillAIConfig,
    context: ActionSelectionContext
  ): boolean {
    if (context.user.stats.mp < skill.mpCost) {
      return false;
    }

    if (this.config.cooldownManager) {
      const cooldown = aiConfig.cooldown || 0;
      if (cooldown > 0) {
        const isAvailable = this.config.cooldownManager.isSkillAvailable(
          action.skillId,
          context.turnNumber
        );
        if (!isAvailable) {
          return false;
        }
      }
    }

    const shouldCheckConditions = this.shouldCheckConditionsByLevel();
    if (!shouldCheckConditions) {
      return true;
    }

    const evalContext: EvaluationContext = {
      user: context.user,
      turnNumber: context.turnNumber,
      playerUnits: context.playerUnits,
      enemyUnits: context.enemyUnits,
      switches: context.switches,
      variables: context.variables
    };

    const evaluator = new ConditionEvaluator(evalContext);

    const allConditionsMet = aiConfig.allConditions.length === 0 || 
      evaluator.evaluateAll(aiConfig.allConditions);

    if (!allConditionsMet) {
      return false;
    }

    const anyConditionsMet = aiConfig.anyConditions.length === 0 ||
      evaluator.evaluateAny(aiConfig.anyConditions);

    return anyConditionsMet;
  }

  private shouldCheckConditionsByLevel(): boolean {
    if (this.config.level >= 100) {
      return true;
    }
    if (this.config.level <= 0) {
      return false;
    }
    const checkChance = this.config.level / 100;
    return Math.random() < checkChance;
  }

  /**
   * Classic风格选择算法
   * 基于评分权重随机选择，评分方差影响随机性
   */
  private selectClassic(candidates: ActionCandidate[]): ActionCandidate | null {
    const validCandidates = candidates.filter(c => c.isValid);
    if (validCandidates.length === 0) {
      return null;
    }

    validCandidates.sort((a, b) => b.score - a.score);

    const maxScore = validCandidates[0].score;
    const threshold = maxScore - this.config.ratingVariance;

    const eligibleCandidates = validCandidates.filter(c => c.score >= threshold);

    const randomIndex = Math.floor(Math.random() * eligibleCandidates.length);
    return eligibleCandidates[randomIndex];
  }

  /**
   * Gambit风格选择算法
   * 按列表顺序选择第一个有效行动
   */
  private selectGambit(candidates: ActionCandidate[]): ActionCandidate | null {
    for (const candidate of candidates) {
      if (candidate.isValid) {
        return candidate;
      }
    }
    return null;
  }

  /**
   * Casual风格选择算法
   * 从满足条件的行动中随机选择
   */
  private selectCasual(candidates: ActionCandidate[]): ActionCandidate | null {
    const validCandidates = candidates.filter(c => c.isValid);
    if (validCandidates.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * validCandidates.length);
    return validCandidates[randomIndex];
  }

  /**
   * Random风格选择算法
   * 仅检查技能可用性，完全随机选择
   */
  private selectRandom(candidates: ActionCandidate[]): ActionCandidate | null {
    const usableCandidates = candidates.filter(c => 
      c.isValid || c.skill.mpCost <= c.action.rating
    );

    if (usableCandidates.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * usableCandidates.length);
    return usableCandidates[randomIndex];
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ActionSelectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): ActionSelectorConfig {
    return { ...this.config };
  }
}

/**
 * 创建行动选择器
 */
export function createActionSelector(config: ActionSelectorConfig): ActionSelector {
  return new ActionSelector(config);
}
