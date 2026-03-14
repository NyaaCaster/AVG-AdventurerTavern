/**
 * 战斗AI模块 - 条件评估器
 * 评估AI条件是否满足，支持所有条件类型的运行时检查
 */

import type { BattleUnit, BattleStats, Faction } from '../types';
import type {
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
  ConditionEvalResult,
  ConditionSubject
} from './types';

/** 条件评估上下文 */
export interface EvaluationContext {
  /** 行动使用者 */
  user: BattleUnit;
  /** 潜在目标（用于Target条件） */
  target?: BattleUnit;
  /** 当前回合数 */
  turnNumber: number;
  /** 玩家单位列表 */
  playerUnits: BattleUnit[];
  /** 敌人单位列表 */
  enemyUnits: BattleUnit[];
  /** 开关状态映射 */
  switches?: Map<number, boolean>;
  /** 变量值映射 */
  variables?: Map<number, number>;
}

/**
 * 条件评估器类
 * 负责评估各种AI条件是否满足
 */
export class ConditionEvaluator {
  private context: EvaluationContext;

  constructor(context: EvaluationContext) {
    this.context = context;
  }

  /**
   * 评估单个条件
   * @param condition AI条件
   * @returns 评估结果
   */
  evaluate(condition: AICondition): ConditionEvalResult {
    switch (condition.type) {
      case 'hp_percent':
        return this.evaluateHPPercent(condition);
      case 'mp_percent':
        return this.evaluateMPPercent(condition);
      case 'hp_value':
        return this.evaluateHPValue(condition);
      case 'mp_value':
        return this.evaluateMPValue(condition);
      case 'has_state':
        return this.evaluateState(condition);
      case 'state_turns':
        return this.evaluateStateTurns(condition);
      case 'buff_stacks':
        return this.evaluateBuffStacks(condition);
      case 'team_alive':
        return this.evaluateTeamAlive(condition);
      case 'team_dead':
        return this.evaluateTeamDead(condition);
      case 'random_chance':
        return this.evaluateRandomChance(condition);
      case 'switch':
        return this.evaluateSwitch(condition);
      case 'variable':
        return this.evaluateVariable(condition);
      case 'turn':
        return this.evaluateTurn(condition);
      case 'damage':
        return this.evaluateDamage(condition);
      case 'stat_compare':
        return this.evaluateStatCompare(condition);
      case 'custom':
        return this.evaluateCustomExpression(condition);
      default:
        return {
          satisfied: false,
          conditionType: 'unknown',
          details: `未知条件类型`
        };
    }
  }

  /**
   * 评估条件列表（ALL逻辑）
   * @param conditions 条件列表
   * @returns 是否全部满足
   */
  evaluateAll(conditions: AICondition[]): boolean {
    for (const condition of conditions) {
      const result = this.evaluate(condition);
      if (!result.satisfied) {
        return false;
      }
    }
    return true;
  }

  /**
   * 评估条件列表（ANY逻辑）
   * @param conditions 条件列表
   * @returns 是否任一满足
   */
  evaluateAny(conditions: AICondition[]): boolean {
    if (conditions.length === 0) {
      return true;
    }
    for (const condition of conditions) {
      const result = this.evaluate(condition);
      if (result.satisfied) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取条件主体对应的单位
   * 
   * 对于 'target' 主体：
   * - 如果已有明确目标，使用该目标
   * - 如果目标未确定（目标选择阶段前），使用潜在目标列表的第一个有效目标
   *   这样可以在目标选择前预评估条件
   */
  private getSubjectUnit(subject: ConditionSubject): BattleUnit | null {
    switch (subject) {
      case 'user':
        return this.context.user;
      case 'target':
        return this.context.target || null;
      case 'lowest':
        return this.findLowestHPUnit();
      case 'highest':
        return this.findHighestHPUnit();
      default:
        return null;
    }
  }

  /**
   * 找到HP最低的单位
   */
  private findLowestHPUnit(): BattleUnit | null {
    const allies = this.getAllies();
    if (allies.length === 0) return null;
    return allies.reduce((min, unit) => 
      unit.stats.hp < min.stats.hp ? unit : min
    );
  }

  /**
   * 找到HP最高的单位
   */
  private findHighestHPUnit(): BattleUnit | null {
    const enemies = this.getEnemies();
    if (enemies.length === 0) return null;
    return enemies.reduce((max, unit) => 
      unit.stats.hp > max.stats.hp ? unit : max
    );
  }

  /**
   * 获取友方单位列表
   */
  private getAllies(): BattleUnit[] {
    const isPlayer = this.context.user.faction === 'player';
    return isPlayer 
      ? this.context.playerUnits.filter(u => u.isAlive)
      : this.context.enemyUnits.filter(u => u.isAlive);
  }

  /**
   * 获取敌方单位列表
   */
  private getEnemies(): BattleUnit[] {
    const isPlayer = this.context.user.faction === 'player';
    return isPlayer 
      ? this.context.enemyUnits.filter(u => u.isAlive)
      : this.context.playerUnits.filter(u => u.isAlive);
  }

  /**
   * 比较数值
   */
  private compare(left: number, operator: string, right: number): boolean {
    switch (operator) {
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '>': return left > right;
      case '<': return left < right;
      case '===': return left === right;
      case '!==': return left !== right;
      default: return false;
    }
  }

  /**
   * 评估HP百分比条件
   */
  private evaluateHPPercent(condition: HPPercentCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'hp_percent',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const hpPercent = (unit.stats.hp / unit.stats.maxHp) * 100;
    const satisfied = this.compare(hpPercent, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'hp_percent',
      details: `${condition.subject} HP%: ${hpPercent.toFixed(1)} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估MP百分比条件
   */
  private evaluateMPPercent(condition: MPPercentCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'mp_percent',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const mpPercent = (unit.stats.mp / unit.stats.maxMp) * 100;
    const satisfied = this.compare(mpPercent, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'mp_percent',
      details: `${condition.subject} MP%: ${mpPercent.toFixed(1)} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估HP绝对值条件
   */
  private evaluateHPValue(condition: HPValueCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'hp_value',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const satisfied = this.compare(unit.stats.hp, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'hp_value',
      details: `${condition.subject} HP: ${unit.stats.hp} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估MP绝对值条件
   */
  private evaluateMPValue(condition: MPValueCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'mp_value',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const satisfied = this.compare(unit.stats.mp, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'mp_value',
      details: `${condition.subject} MP: ${unit.stats.mp} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估状态条件
   */
  private evaluateState(condition: StateCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'has_state',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const hasState = unit.statusEffects.some(
      effect => effect.effectId === condition.stateId
    );
    const result = condition.negate ? !hasState : hasState;

    return {
      satisfied: result,
      conditionType: 'has_state',
      details: `${condition.subject} ${hasState ? '有' : '无'}状态 ${condition.stateId}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估状态回合数条件
   */
  private evaluateStateTurns(condition: StateTurnsCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'state_turns',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const stateEffect = unit.statusEffects.find(
      effect => effect.effectId === condition.stateId
    );

    const turns = stateEffect?.turnsRemaining ?? 0;
    const satisfied = this.compare(turns, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'state_turns',
      details: `${condition.subject} 状态 ${condition.stateId} 回合: ${turns} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估Buff层数条件
   */
  private evaluateBuffStacks(condition: BuffStacksCondition): ConditionEvalResult {
    const unit = this.getSubjectUnit(condition.subject);
    if (!unit) {
      return {
        satisfied: false,
        conditionType: 'buff_stacks',
        details: `找不到条件主体: ${condition.subject}`
      };
    }

    const stacks = this.getBuffStacks(unit, condition.stat, condition.isDebuff);
    const satisfied = this.compare(stacks, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'buff_stacks',
      details: `${condition.subject} ${condition.stat} ${condition.isDebuff ? 'debuff' : 'buff'} 层数: ${stacks} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 获取Buff/Debuff层数
   */
  private getBuffStacks(unit: BattleUnit, stat: keyof BattleStats, isDebuff: boolean): number {
    const matchingBuffs = unit.buffs.filter(b => 
      b.stat === stat && b.isDebuff === isDebuff
    );
    return matchingBuffs.length;
  }

  /**
   * 评估队伍存活成员数条件
   */
  private evaluateTeamAlive(condition: TeamAliveCondition): ConditionEvalResult {
    let team: BattleUnit[];
    
    if (condition.subject === 'user' || condition.subject === 'lowest') {
      team = this.getAllies();
    } else {
      team = this.getEnemies();
    }

    const aliveCount = team.filter(u => u.isAlive).length;
    const satisfied = this.compare(aliveCount, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'team_alive',
      details: `队伍存活成员: ${aliveCount} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估队伍死亡成员数条件
   */
  private evaluateTeamDead(condition: TeamDeadCondition): ConditionEvalResult {
    let team: BattleUnit[];
    
    if (condition.subject === 'user' || condition.subject === 'lowest') {
      team = this.context.user.faction === 'player' 
        ? this.context.playerUnits 
        : this.context.enemyUnits;
    } else {
      team = this.context.user.faction === 'player' 
        ? this.context.enemyUnits 
        : this.context.playerUnits;
    }

    const deadCount = team.filter(u => !u.isAlive).length;
    const satisfied = this.compare(deadCount, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'team_dead',
      details: `队伍死亡成员: ${deadCount} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估随机概率条件
   */
  private evaluateRandomChance(condition: RandomChanceCondition): ConditionEvalResult {
    const roll = Math.random() * 100;
    const satisfied = roll < condition.value;

    return {
      satisfied,
      conditionType: 'random_chance',
      details: `随机检定: ${roll.toFixed(1)} < ${condition.value} = ${satisfied}`
    };
  }

  /**
   * 评估开关条件
   */
  private evaluateSwitch(condition: SwitchCondition): ConditionEvalResult {
    if (!this.context.switches) {
      return {
        satisfied: false,
        conditionType: 'switch',
        details: `开关状态映射未提供`
      };
    }

    const currentValue = this.context.switches.get(condition.switchId) ?? false;
    const satisfied = currentValue === condition.expectedValue;

    return {
      satisfied,
      conditionType: 'switch',
      details: `开关 ${condition.switchId}: ${currentValue} === ${condition.expectedValue} = ${satisfied}`
    };
  }

  /**
   * 评估变量条件
   */
  private evaluateVariable(condition: VariableCondition): ConditionEvalResult {
    if (!this.context.variables) {
      return {
        satisfied: false,
        conditionType: 'variable',
        details: `变量值映射未提供`
      };
    }

    const currentValue = this.context.variables.get(condition.variableId) ?? 0;
    const satisfied = this.compare(currentValue, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'variable',
      details: `变量 ${condition.variableId}: ${currentValue} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估回合数条件
   */
  private evaluateTurn(condition: TurnCondition): ConditionEvalResult {
    const satisfied = this.compare(this.context.turnNumber, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'turn',
      details: `回合: ${this.context.turnNumber} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估伤害计算条件
   */
  private evaluateDamage(condition: DamageCondition): ConditionEvalResult {
    if (!this.context.target) {
      return {
        satisfied: false,
        conditionType: 'damage',
        details: `无目标，无法计算伤害`
      };
    }

    const user = this.context.user;
    const target = this.context.target;
    
    const baseDamage = user.stats.atk * 4 - target.stats.def * 2;
    const satisfied = this.compare(baseDamage, condition.operator, condition.value);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'damage',
      details: `预估伤害: ${baseDamage} ${condition.operator} ${condition.value} = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估属性比较条件
   */
  private evaluateStatCompare(condition: StatCompareCondition): ConditionEvalResult {
    const user = this.context.user;
    const statA = user.stats[condition.statA] * (condition.multiplier || 1);
    const statB = user.stats[condition.statB];
    
    const satisfied = this.compare(statA, condition.operator, statB);
    const result = condition.negate ? !satisfied : satisfied;

    return {
      satisfied: result,
      conditionType: 'stat_compare',
      details: `${condition.statA}(${statA}) ${condition.operator} ${condition.statB}(${statB}) = ${satisfied}${condition.negate ? ' (取反)' : ''}`
    };
  }

  /**
   * 评估自定义表达式条件
   */
  private evaluateCustomExpression(condition: CustomExpressionCondition): ConditionEvalResult {
    try {
      const user = this.context.user;
      const target = this.context.target;
      
      const a = {
        param: (index: number) => {
          const stats = user.stats;
          const paramMap: Record<number, number> = {
            0: stats.maxHp, 1: stats.maxMp, 2: stats.atk, 3: stats.def,
            4: stats.matk, 5: stats.mdef, 6: stats.agi, 7: stats.luk
          };
          return paramMap[index] ?? 0;
        }
      };

      const b = target ? {
        param: (index: number) => {
          const stats = target.stats;
          const paramMap: Record<number, number> = {
            0: stats.maxHp, 1: stats.maxMp, 2: stats.atk, 3: stats.def,
            4: stats.matk, 5: stats.mdef, 6: stats.agi, 7: stats.luk
          };
          return paramMap[index] ?? 0;
        }
      } : null;

      const gameSwitches = {
        value: (id: number) => this.context.switches?.get(id) ?? false
      };

      const gameVariables = {
        value: (id: number) => this.context.variables?.get(id) ?? 0
      };

      const expression = condition.expression
        .replace(/a\.param/g, 'a.param')
        .replace(/b\.param/g, 'b?.param')
        .replace(/\$gameSwitches/g, 'gameSwitches')
        .replace(/\$gameVariables/g, 'gameVariables');

      const fn = new Function('a', 'b', 'gameSwitches', 'gameVariables', `return ${expression}`);
      const result = fn(a, b, gameSwitches, gameVariables);

      return {
        satisfied: !!result,
        conditionType: 'custom',
        details: `自定义表达式: ${condition.expression} = ${result}`
      };
    } catch (error) {
      return {
        satisfied: false,
        conditionType: 'custom',
        details: `表达式执行错误: ${error}`
      };
    }
  }

  /**
   * 更新评估上下文
   */
  updateContext(context: Partial<EvaluationContext>): void {
    this.context = { ...this.context, ...context };
  }
}

/**
 * 创建条件评估器
 */
export function createConditionEvaluator(context: EvaluationContext): ConditionEvaluator {
  return new ConditionEvaluator(context);
}
