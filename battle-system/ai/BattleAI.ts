/**
 * 战斗AI模块 - AI核心类
 * 整合条件解析、评估、目标选择和行动选择，提供统一的AI决策接口
 * 
 * 数据流：
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                         BattleAI 决策流程                            │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │   AIDecisionContext                                                 │
 * │        │                                                            │
 * │        ▼                                                            │
 * │   ┌─────────────────┐                                               │
 * │   │  ActionSelector │ ◄── AIConfig (style, level, ratingVariance)   │
 * │   │                 │                                               │
 * │   │  ┌───────────┐  │                                               │
 * │   │  │Condition  │  │ ◄── 技能note标签                               │
 * │   │  │Parser     │  │                                               │
 * │   │  └───────────┘  │                                               │
 * │   │        │        │                                               │
 * │   │        ▼        │                                               │
 * │   │  ┌───────────┐  │                                               │
 * │   │  │Condition  │  │ ◄── BattleUnit状态                             │
 * │   │  │Evaluator  │  │                                               │
 * │   │  └───────────┘  │                                               │
 * │   └────────┬────────┘                                               │
 * │            │                                                        │
 * │            ▼                                                        │
 * │   ┌─────────────────┐                                               │
 * │   │ TargetSelector  │ ◄── AITargetStrategy                          │
 * │   └────────┬────────┘                                               │
 * │            │                                                        │
 * │            ▼                                                        │
 * │   AIDecisionResult                                                   │
 * │   (action, skill, targetIds, isGuard, reason)                       │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { BattleUnit, SkillData } from '../types';
import type { EnemyAction } from '../../data/battle-data/enemies';
import {
  AIStyle,
  AIConfig,
  AIDecisionContext,
  AIDecisionResult,
  DEFAULT_AI_CONFIG,
  ENEMY_AI_CONFIG,
  ALLY_AI_CONFIG,
  ActionCandidate,
  TargetSelectionResult
} from './types';
import { ConditionParser } from './ConditionParser';
import { ConditionEvaluator, EvaluationContext } from './ConditionEvaluator';
import { TargetSelector } from './TargetSelector';
import { ActionSelector, ActionSelectionContext } from './ActionSelector';
import { CooldownManager } from './CooldownManager';

/** BattleAI配置 */
export interface BattleAIOptions extends AIConfig {
  /** 条件解析器实例（可选，用于共享缓存） */
  conditionParser?: ConditionParser;
  /** 目标选择器实例（可选） */
  targetSelector?: TargetSelector;
  /** 冷却管理器实例（可选） */
  cooldownManager?: CooldownManager;
}

/**
 * 战斗AI核心类
 * 提供统一的AI决策接口，支持敌人和队友共用
 */
export class BattleAI {
  private config: BattleAIOptions;
  private conditionParser: ConditionParser;
  private actionSelector: ActionSelector;
  private targetSelector: TargetSelector;
  private cooldownManager: CooldownManager;

  constructor(config: Partial<BattleAIOptions> = {}) {
    this.config = {
      ...DEFAULT_AI_CONFIG,
      ...config
    };

    this.conditionParser = config.conditionParser || new ConditionParser();
    this.targetSelector = config.targetSelector || new TargetSelector();
    this.cooldownManager = config.cooldownManager || new CooldownManager();
    this.actionSelector = new ActionSelector({
      ...this.config,
      conditionParser: this.conditionParser,
      cooldownManager: this.cooldownManager
    });
  }

  /**
   * 执行AI决策
   * @param context AI决策上下文
   * @returns AI决策结果
   */
  makeDecision(context: AIDecisionContext): AIDecisionResult {
    if (context.availableActions.length === 0) {
      return this.createGuardResult('无可用行动');
    }

    const actionContext: ActionSelectionContext = {
      user: context.unit,
      turnNumber: context.turnNumber,
      playerUnits: context.playerUnits,
      enemyUnits: context.enemyUnits,
      actions: context.availableActions,
      skillMap: context.skillMap,
      switches: context.switches,
      variables: context.variables
    };

    const candidate = this.actionSelector.selectAction(actionContext);

    if (!candidate) {
      return this.createGuardResult('无满足条件的行动');
    }

    const targetResult = this.targetSelector.selectTargets(
      candidate.skill,
      context.unit,
      context.playerUnits,
      context.enemyUnits,
      candidate.aiConfig.targetStrategy
    );

    const reason = this.buildDecisionReason(candidate, targetResult);

    if (candidate.aiConfig.cooldown && candidate.aiConfig.cooldown > 0) {
      this.cooldownManager.recordSkillUse(
        candidate.skill.id,
        context.turnNumber,
        candidate.aiConfig.cooldown
      );
    }

    return {
      action: candidate.action,
      skill: candidate.skill,
      targetIds: targetResult.targets.map(t => t.id),
      isGuard: false,
      reason
    };
  }

  /**
   * 评估特定行动是否可用
   * @param context AI决策上下文
   * @param action 要评估的行动
   * @returns 是否可用及原因
   */
  evaluateAction(context: AIDecisionContext, action: EnemyAction): {
    isValid: boolean;
    reason: string;
  } {
    const skill = context.skillMap.get(action.skillId);
    if (!skill) {
      return { isValid: false, reason: `技能ID ${action.skillId} 不存在` };
    }

    if (context.unit.stats.mp < skill.mpCost) {
      return { isValid: false, reason: `MP不足 (需要 ${skill.mpCost}, 当前 ${context.unit.stats.mp})` };
    }

    const aiConfig = this.conditionParser.parseSkillAIConfig(skill.note || '');

    if (aiConfig.cooldown && aiConfig.cooldown > 0) {
      const isAvailable = this.cooldownManager.isSkillAvailable(skill.id, context.turnNumber);
      if (!isAvailable) {
        const remaining = this.cooldownManager.getRemainingCooldown(skill.id, context.turnNumber);
        return { isValid: false, reason: `技能冷却中 (剩余 ${remaining} 回合)` };
      }
    }

    const evalContext: EvaluationContext = {
      user: context.unit,
      turnNumber: context.turnNumber,
      playerUnits: context.playerUnits,
      enemyUnits: context.enemyUnits,
      switches: context.switches,
      variables: context.variables
    };

    const evaluator = new ConditionEvaluator(evalContext);

    if (aiConfig.allConditions.length > 0) {
      const allMet = evaluator.evaluateAll(aiConfig.allConditions);
      if (!allMet) {
        return { isValid: false, reason: 'ALL条件未满足' };
      }
    }

    if (aiConfig.anyConditions.length > 0) {
      const anyMet = evaluator.evaluateAny(aiConfig.anyConditions);
      if (!anyMet) {
        return { isValid: false, reason: 'ANY条件未满足' };
      }
    }

    return { isValid: true, reason: '所有条件满足' };
  }

  /**
   * 获取所有可用行动
   * @param context AI决策上下文
   * @returns 可用行动列表及其评估结果
   */
  getAvailableActions(context: AIDecisionContext): Array<{
    action: EnemyAction;
    skill: SkillData;
    isValid: boolean;
    reason: string;
  }> {
    const results: Array<{
      action: EnemyAction;
      skill: SkillData;
      isValid: boolean;
      reason: string;
    }> = [];

    for (const action of context.availableActions) {
      const skill = context.skillMap.get(action.skillId);
      if (!skill) continue;

      const evaluation = this.evaluateAction(context, action);
      results.push({
        action,
        skill,
        isValid: evaluation.isValid,
        reason: evaluation.reason
      });
    }

    return results;
  }

  /**
   * 预览目标选择
   * @param skill 技能数据
   * @param user 使用者
   * @param playerUnits 玩家单位列表
   * @param enemyUnits 敌人单位列表
   * @returns 目标选择结果
   */
  previewTargets(
    skill: SkillData,
    user: BattleUnit,
    playerUnits: BattleUnit[],
    enemyUnits: BattleUnit[]
  ): TargetSelectionResult {
    const aiConfig = this.conditionParser.parseSkillAIConfig(skill.note || '');
    
    return this.targetSelector.selectTargets(
      skill,
      user,
      playerUnits,
      enemyUnits,
      aiConfig.targetStrategy
    );
  }

  /**
   * 获取技能剩余冷却回合数
   * @param skillId 技能ID
   * @param currentTurn 当前回合数
   * @returns 剩余冷却回合数
   */
  getRemainingCooldown(skillId: number, currentTurn: number): number {
    return this.cooldownManager.getRemainingCooldown(skillId, currentTurn);
  }

  /**
   * 获取所有正在冷却的技能
   * @param currentTurn 当前回合数
   * @returns 正在冷却的技能列表
   */
  getActiveCooldowns(currentTurn: number): Array<{ skillId: number; remainingTurns: number }> {
    return this.cooldownManager.getActiveCooldowns(currentTurn);
  }

  /**
   * 更新AI配置
   */
  updateConfig(config: Partial<BattleAIOptions>): void {
    this.config = { ...this.config, ...config };
    this.actionSelector.updateConfig(this.config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): BattleAIOptions {
    return { ...this.config };
  }

  /**
   * 设置AI风格
   */
  setStyle(style: AIStyle): void {
    this.updateConfig({ style });
  }

  /**
   * 设置AI等级
   */
  setLevel(level: number): void {
    this.updateConfig({ level: Math.max(0, Math.min(100, level)) });
  }

  /**
   * 设置评分方差
   */
  setRatingVariance(variance: number): void {
    this.updateConfig({ ratingVariance: Math.max(0, Math.min(9, variance)) });
  }

  /**
   * 清除条件解析缓存
   */
  clearCache(): void {
    this.conditionParser.clearCache();
  }

  /**
   * 清除冷却记录
   */
  clearCooldowns(): void {
    this.cooldownManager.clear();
  }

  /**
   * 重置AI状态（清除缓存和冷却）
   */
  reset(): void {
    this.clearCache();
    this.clearCooldowns();
  }

  /**
   * 创建防御结果
   */
  private createGuardResult(reason: string): AIDecisionResult {
    return {
      action: null,
      skill: null,
      targetIds: [],
      isGuard: true,
      reason: `选择防御: ${reason}`
    };
  }

  /**
   * 构建决策原因描述
   */
  private buildDecisionReason(
    candidate: ActionCandidate,
    targetResult: TargetSelectionResult
  ): string {
    const parts: string[] = [];

    parts.push(`选择技能: ${candidate.skill.name}`);
    parts.push(`评分: ${candidate.score}`);
    parts.push(`策略: ${targetResult.strategy}`);
    parts.push(`目标数: ${targetResult.targets.length}`);

    if (targetResult.targets.length > 0) {
      const targetNames = targetResult.targets.map(t => t.name).join(', ');
      parts.push(`目标: ${targetNames}`);
    }

    return parts.join(' | ');
  }
}

/** 默认AI实例 */
export const defaultBattleAI = new BattleAI();

/** 敌人AI实例 */
export const enemyBattleAI = new BattleAI(ENEMY_AI_CONFIG);

/** 队友AI实例 */
export const allyBattleAI = new BattleAI(ALLY_AI_CONFIG);

/**
 * 创建BattleAI实例
 */
export function createBattleAI(config?: Partial<BattleAIOptions>): BattleAI {
  return new BattleAI(config);
}

/**
 * 快捷函数：执行敌人AI决策
 */
export function makeEnemyDecision(context: AIDecisionContext): AIDecisionResult {
  return enemyBattleAI.makeDecision(context);
}

/**
 * 快捷函数：执行队友AI决策
 */
export function makeAllyDecision(context: AIDecisionContext): AIDecisionResult {
  return allyBattleAI.makeDecision(context);
}
