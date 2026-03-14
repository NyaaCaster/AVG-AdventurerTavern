/**
 * 战斗管理器模块
 * 
 * 管理完整的回合制战斗流程，包括：
 * - 战斗初始化
 * - 回合流程控制
 * - 行动队列管理（按敏捷值排序）
 * - 胜负判定
 * - 战斗结束处理
 * 
 * ═══════════════════════════════════════════════════════════════
 * 回合流程
 * ═══════════════════════════════════════════════════════════════
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      战斗开始                                │
 * │  initializeBattle() → 创建 BattleState                      │
 * └─────────────────────────────────────────────────────────────┘
 *                             │
 *                             ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      回合开始                                │
 * │  startTurn() → 按AGI排序所有存活单位                         │
 * └─────────────────────────────────────────────────────────────┘
 *                             │
 *                             ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      行动阶段                                │
 * │  processNextAction() → 执行下一个单位行动                    │
 * │  checkBattleEnd() → 检查战斗是否结束                         │
 * └─────────────────────────────────────────────────────────────┘
 *                             │
 *                             ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      回合结束                                │
 * │  endTurn() → 处理状态效果、冷却时间递减                      │
 * └─────────────────────────────────────────────────────────────┘
 *                             │
 *                             ↓
 *                      进入下一回合
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import {
  BattleUnit,
  BattleState,
  TurnAction,
  BattleLogEntry,
  Faction,
  SkillData,
  SkillExecutionResult
} from './types';
import { executeSkill, processTurnEnd, checkBattleEnd } from './skill-executor';
import { checkCounterAttack, executeCounterAttack } from './counter';
import { clearNonPersistentEffects } from './status-effects';
import { executeEscapeCommand, checkBattleEnd as checkPlayerBattleEnd } from './player-commands';

/**
 * 战斗初始化选项
 */
export interface BattleInitOptions {
  /** 玩家战斗单位列表 */
  playerUnits: BattleUnit[];
  /** 敌人战斗单位列表 */
  enemyUnits: BattleUnit[];
}

/**
 * 行动执行结果
 */
export interface ActionExecutionResult {
  /** 是否成功执行 */
  success: boolean;
  /** 技能执行结果（如果是技能行动） */
  skillResult?: SkillExecutionResult;
  /** 是否触发反击 */
  counterTriggered?: boolean;
  /** 反击伤害 */
  counterDamage?: number;
  /** 战斗是否结束 */
  battleEnded?: boolean;
  /** 获胜方 */
  winner?: Faction;
  /** 日志条目 */
  logEntries: BattleLogEntry[];
}

/**
 * 回合处理结果
 */
export interface TurnProcessResult {
  /** 回合数 */
  turnNumber: number;
  /** 执行的行动列表 */
  actions: ActionExecutionResult[];
  /** 回合结束时的日志 */
  endTurnLogs: BattleLogEntry[];
  /** 战斗是否结束 */
  battleEnded: boolean;
  /** 获胜方 */
  winner?: Faction;
}

/**
 * 战斗管理器类
 * 
 * 负责管理完整的战斗流程，提供战斗状态查询和行动执行接口。
 * 
 * @example
 * // 初始化战斗
 * const manager = new BattleManager();
 * manager.initializeBattle({
 *   playerUnits: [playerUnit1, playerUnit2],
 *   enemyUnits: [enemyUnit1, enemyUnit2]
 * });
 * 
 * // 开始第一回合
 * manager.startTurn();
 * 
 * // 执行行动
 * while (manager.hasMoreActions()) {
 *   const result = manager.processNextAction(skill, targetIds);
 *   if (result.battleEnded) break;
 * }
 * 
 * // 结束回合
 * manager.endTurn();
 */
export class BattleManager {
  /** 战斗状态 */
  private state: BattleState | null = null;
  /** 当前行动队列 */
  private actionQueue: BattleUnit[] = [];
  /** 当前行动单位索引 */
  private currentActionIndex: number = 0;

  /**
   * 初始化战斗
   * 
   * 创建初始战斗状态，清除所有单位的非持久状态效果。
   * 
   * @param options 战斗初始化选项
   * @returns 初始化后的战斗状态
   */
  initializeBattle(options: BattleInitOptions): BattleState {
    const { playerUnits, enemyUnits } = options;

    for (const unit of [...playerUnits, ...enemyUnits]) {
      clearNonPersistentEffects(unit);
    }

    this.state = {
      playerUnits,
      enemyUnits,
      turnNumber: 0,
      actionQueue: [],
      battleLog: [],
      isEnded: false
    };

    this.actionQueue = [];
    this.currentActionIndex = 0;

    this.addLogEntry({
      turn: 0,
      type: 'system',
      description: '战斗开始！'
    });

    return this.state;
  }

  /**
   * 获取当前战斗状态
   * @returns 战斗状态，未初始化则返回 null
   */
  getState(): BattleState | null {
    return this.state;
  }

  /**
   * 开始新回合
   * 
   * 执行以下操作：
   * 1. 回合数 +1
   * 2. 按敏捷值排序所有存活单位
   * 3. 重置行动索引
   * 
   * @returns 排序后的行动队列
   */
  startTurn(): BattleUnit[] {
    if (!this.state) {
      throw new Error('Battle not initialized');
    }

    this.state.turnNumber++;
    
    const allUnits = [...this.state.playerUnits, ...this.state.enemyUnits];
    const aliveUnits = allUnits.filter(u => u.isAlive);
    
    this.actionQueue = aliveUnits.sort((a, b) => b.stats.agi - a.stats.agi);
    this.currentActionIndex = 0;

    this.addLogEntry({
      turn: this.state.turnNumber,
      type: 'system',
      description: `第 ${this.state.turnNumber} 回合开始`
    });

    return [...this.actionQueue];
  }

  /**
   * 获取当前行动单位
   * @returns 当前应该行动的单位，无则返回 null
   */
  getCurrentUnit(): BattleUnit | null {
    if (this.currentActionIndex >= this.actionQueue.length) {
      return null;
    }
    return this.actionQueue[this.currentActionIndex];
  }

  /**
   * 检查是否还有未执行的行动
   * @returns 是否还有行动
   */
  hasMoreActions(): boolean {
    return this.currentActionIndex < this.actionQueue.length;
  }

  /**
   * 获取剩余行动数量
   * @returns 剩余行动数
   */
  getRemainingActions(): number {
    return Math.max(0, this.actionQueue.length - this.currentActionIndex);
  }

  /**
   * 处理下一个行动
   * 
   * 执行当前单位的行动，包括：
   * 1. 检查单位是否可以行动（状态效果）
   * 2. 执行技能
   * 3. 检查反击
   * 4. 检查战斗结束
   * 
   * @param skill 要使用的技能
   * @param targetIds 目标ID列表（可选）
   * @returns 行动执行结果
   */
  processNextAction(skill: SkillData, targetIds?: string[]): ActionExecutionResult {
    if (!this.state) {
      throw new Error('Battle not initialized');
    }

    const currentUnit = this.getCurrentUnit();
    if (!currentUnit) {
      return {
        success: false,
        logEntries: []
      };
    }

    this.currentActionIndex++;

    const logEntries: BattleLogEntry[] = [];

    if (!currentUnit.isAlive) {
      return {
        success: false,
        logEntries: [{
          turn: this.state.turnNumber,
          type: 'system',
          description: `${currentUnit.name} 已死亡，跳过行动`
        }]
      };
    }

    const skipTurn = currentUnit.statusEffects.some(e => e.skipTurn);
    if (skipTurn) {
      const skipEffect = currentUnit.statusEffects.find(e => e.skipTurn);
      return {
        success: false,
        logEntries: [{
          turn: this.state.turnNumber,
          type: 'effect',
          target: currentUnit.name,
          description: `${currentUnit.name} 因 ${skipEffect?.name ?? '状态效果'} 无法行动`
        }]
      };
    }

    const skillResult = executeSkill({
      state: this.state,
      source: currentUnit,
      skill,
      targetIds
    });

    if (skillResult.success) {
      for (const targetResult of skillResult.targets) {
        if (targetResult.damage && targetResult.damage.value > 0) {
          const isCritical = targetResult.damage.isCritical;
          const critText = isCritical ? '【暴击】' : '';
          const logType = targetResult.damage.isHealing ? 'heal' : 'damage';
          const actionText = targetResult.damage.isHealing ? '恢复了' : '造成';
          this.addLogEntry({
            turn: this.state.turnNumber,
            type: logType,
            source: currentUnit.name,
            sourceId: currentUnit.id,
            target: targetResult.targetName,
            targetId: targetResult.targetId,
            value: targetResult.damage.value,
            description: `${critText}${currentUnit.name} 对 ${targetResult.targetName} ${actionText} ${targetResult.damage.value} 点${targetResult.damage.isHealing ? '生命值' : '伤害'}`,
            details: { isCritical }
          });
        }
        
        if (targetResult.effects && targetResult.effects.length > 0) {
          for (const effect of targetResult.effects) {
            if (effect.success) {
              const EffectCode = { ADD_STATE: 21, ADD_BUFF: 31, ADD_DEBUFF: 32 };
              const isDebuff = effect.type === EffectCode.ADD_DEBUFF || effect.type === EffectCode.ADD_STATE;
              this.addLogEntry({
                turn: this.state.turnNumber,
                type: isDebuff ? 'debuff' : 'buff',
                source: currentUnit.name,
                sourceId: currentUnit.id,
                target: targetResult.targetName,
                targetId: targetResult.targetId,
                value: effect.value,
                description: `${targetResult.targetName} 获得了 ${effect.name} 效果`,
                details: { effectName: effect.name, duration: effect.duration }
              });
            }
          }
        }
      }
    }

    let counterTriggered = false;
    let counterDamage = 0;

    if (skillResult.success && skill.damage) {
      const isPhysical = skill.hitType === 1;
      for (const targetResult of skillResult.targets) {
        if (targetResult.damage && targetResult.damage.value > 0 && !targetResult.damage.isHealing) {
          const target = this.findUnitById(targetResult.targetId);
          if (target) {
            const counterCheck = checkCounterAttack(currentUnit, target, isPhysical);
            if (counterCheck.triggered) {
              counterTriggered = true;
              const counterResult = executeCounterAttack(target, currentUnit);
              counterDamage = counterResult.damage;
              
              this.addLogEntry({
                turn: this.state.turnNumber,
                type: 'damage',
                source: target.name,
                target: currentUnit.name,
                value: counterResult.damage,
                description: `${target.name} 发动反击，对 ${currentUnit.name} 造成 ${counterResult.damage} 点伤害`
              });
            }
          }
        }
      }
    }

    const endCheck = checkBattleEnd(this.state);

    return {
      success: skillResult.success,
      skillResult,
      counterTriggered,
      counterDamage,
      battleEnded: endCheck.isEnded,
      winner: endCheck.winner,
      logEntries
    };
  }

  /**
   * 执行防御行动
   * 
   * @returns 行动执行结果
   */
  processGuardAction(): ActionExecutionResult {
    if (!this.state) {
      throw new Error('Battle not initialized');
    }

    const currentUnit = this.getCurrentUnit();
    if (!currentUnit) {
      return {
        success: false,
        logEntries: []
      };
    }

    this.currentActionIndex++;

    currentUnit.isGuarding = true;

    this.addLogEntry({
      turn: this.state.turnNumber,
      type: 'system',
      target: currentUnit.name,
      description: `${currentUnit.name} 进行防御`
    });

    return {
      success: true,
      logEntries: []
    };
  }

  /**
   * 跳过当前单位行动
   * 
   * @returns 是否成功跳过
   */
  skipCurrentAction(): boolean {
    if (!this.hasMoreActions()) {
      return false;
    }

    const currentUnit = this.getCurrentUnit();
    this.currentActionIndex++;

    if (currentUnit && this.state) {
      this.addLogEntry({
        turn: this.state.turnNumber,
        type: 'system',
        target: currentUnit.name,
        description: `${currentUnit.name} 跳过行动`
      });
    }

    return true;
  }

  /**
   * 结束当前回合
   * 
   * 执行以下操作：
   * 1. 处理所有单位的状态效果回合
   * 2. 递减技能冷却时间
   * 3. 重置防御状态
   * 4. 检查战斗结束
   * 
   * @returns 回合处理结果
   */
  endTurn(): TurnProcessResult {
    if (!this.state) {
      throw new Error('Battle not initialized');
    }

    const endTurnLogs = processTurnEnd(this.state);

    const allUnits = [...this.state.playerUnits, ...this.state.enemyUnits];
    for (const unit of allUnits) {
      unit.isGuarding = false;
    }

    for (const log of endTurnLogs) {
      this.addLogEntry(log);
    }

    const endCheck = checkBattleEnd(this.state);
    if (endCheck.isEnded) {
      this.state.isEnded = true;
      this.state.winner = endCheck.winner;
      
      this.addLogEntry({
        turn: this.state.turnNumber,
        type: 'system',
        description: endCheck.winner === 'player' ? '战斗胜利！' : '战斗失败...'
      });
    }

    return {
      turnNumber: this.state.turnNumber,
      actions: [],
      endTurnLogs,
      battleEnded: endCheck.isEnded,
      winner: endCheck.winner
    };
  }

  /**
   * 检查战斗是否结束
   * @returns 战斗结束结果
   */
  checkBattleEnd(): { isEnded: boolean; winner?: Faction } {
    if (!this.state) {
      return { isEnded: true };
    }
    return checkBattleEnd(this.state);
  }

  /**
   * 获取所有存活的玩家单位
   * @returns 存活的玩家单位列表
   */
  getAlivePlayerUnits(): BattleUnit[] {
    if (!this.state) return [];
    return this.state.playerUnits.filter(u => u.isAlive);
  }

  /**
   * 获取所有存活的敌人单位
   * @returns 存活的敌人单位列表
   */
  getAliveEnemyUnits(): BattleUnit[] {
    if (!this.state) return [];
    return this.state.enemyUnits.filter(u => u.isAlive);
  }

  /**
   * 根据ID查找战斗单位
   * @param unitId 单位ID
   * @returns 战斗单位，未找到则返回 undefined
   */
  findUnitById(unitId: string): BattleUnit | undefined {
    if (!this.state) return undefined;
    
    const allUnits = [...this.state.playerUnits, ...this.state.enemyUnits];
    return allUnits.find(u => u.id === unitId);
  }

  /**
   * 获取战斗日志
   * @returns 战斗日志列表
   */
  getBattleLog(): BattleLogEntry[] {
    return this.state?.battleLog ?? [];
  }

  /**
   * 添加日志条目
   * @param entry 日志条目
   */
  private addLogEntry(entry: BattleLogEntry): void {
    if (this.state) {
      this.state.battleLog.push(entry);
    }
  }
}

/**
 * 创建战斗管理器实例
 * @returns 战斗管理器实例
 */
export function createBattleManager(): BattleManager {
  return new BattleManager();
}
