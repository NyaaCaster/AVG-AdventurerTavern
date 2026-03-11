/**
 * 战斗AI模块
 * 提供统一的自动战斗AI决策框架，支持敌人和队友共用核心决策逻辑
 * 
 * 模块结构：
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                         AI模块架构                                   │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │   types.ts ─────────────► 类型定义、枚举、接口                        │
 * │        │                                                            │
 * │        ▼                                                            │
 * │   ConditionParser.ts ───► 条件解析器（技能note标签 → 结构化条件）      │
 * │        │                                                            │
 * │        ▼                                                            │
 * │   ConditionEvaluator.ts ► 条件评估器（运行时条件检查）                │
 * │        │                                                            │
 * │        ├─────────────────► ActionSelector.ts（行动选择）             │
 * │        │                                                            │
 * │        └─────────────────► TargetSelector.ts（目标选择）             │
 * │                                                                     │
 * │   BattleAI.ts ──────────► AI核心类（整合所有组件）                    │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * 使用方式：
 * ```typescript
 * import { BattleAI, ENEMY_AI_CONFIG } from './battle-system/ai';
 * 
 * const ai = new BattleAI(ENEMY_AI_CONFIG);
 * const decision = ai.makeDecision(context);
 * ```
 */

// 类型定义
export type {
  AIConfig,
  AICondition,
  HPPercentCondition,
  MPPercentCondition,
  HPValueCondition,
  MPValueCondition,
  StateCondition,
  StateTurnsCondition,
  BuffStacksCondition,
  TeamAliveCondition,
  TeamDeadCondition,
  RandomChanceCondition,
  SwitchCondition,
  VariableCondition,
  CustomExpressionCondition,
  TurnCondition,
  DamageCondition,
  StatCompareCondition,
  SkillAIConfig,
  AITargetStrategy,
  ActionCandidate,
  AIDecisionContext,
  AIDecisionResult,
  TargetSelectionResult,
  ConditionEvalResult,
  ConditionOperator,
  ConditionSubject,
  BaseCondition,
  SkillCooldown,
  CooldownTracker,
  UnitAction
} from './types';

// 枚举
export {
  AIStyle,
  ConditionLogic,
  DEFAULT_AI_CONFIG,
  ENEMY_AI_CONFIG,
  ALLY_AI_CONFIG,
  enemyActionToUnitAction,
  skillIdToUnitAction,
  characterSkillsToActions
} from './types';

// 条件解析器
export {
  ConditionParser,
  conditionParser,
  parseSkillAIConfig
} from './ConditionParser';

// 条件评估器
export {
  ConditionEvaluator,
  createConditionEvaluator
} from './ConditionEvaluator';
export type { EvaluationContext } from './ConditionEvaluator';

// 目标选择器
export {
  TargetSelector,
  targetSelector,
  selectSkillTargets
} from './TargetSelector';
export type { TargetSelectorConfig } from './TargetSelector';

// 行动选择器
export {
  ActionSelector,
  createActionSelector
} from './ActionSelector';
export type {
  ActionSelectorConfig,
  ActionSelectionContext
} from './ActionSelector';

// 冷却管理器
export {
  CooldownManager,
  defaultCooldownManager,
  createCooldownManager
} from './CooldownManager';

// AI核心类
export {
  BattleAI,
  defaultBattleAI,
  enemyBattleAI,
  allyBattleAI,
  createBattleAI,
  makeEnemyDecision,
  makeAllyDecision
} from './BattleAI';
export type { BattleAIOptions } from './BattleAI';
