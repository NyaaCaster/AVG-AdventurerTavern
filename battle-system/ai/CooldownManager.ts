/**
 * 战斗AI模块 - 冷却管理器
 * 追踪技能冷却状态，确保AI不会在冷却期间重复使用技能
 */

import type { SkillCooldown, CooldownTracker } from './types';

/**
 * 冷却管理器类
 * 实现技能冷却追踪功能
 */
export class CooldownManager implements CooldownTracker {
  private cooldowns: Map<number, SkillCooldown>;

  constructor() {
    this.cooldowns = new Map();
  }

  /**
   * 获取技能剩余冷却回合数
   * @param skillId 技能ID
   * @param currentTurn 当前回合数
   * @returns 剩余冷却回合数（0表示可用）
   */
  getRemainingCooldown(skillId: number, currentTurn: number): number {
    const record = this.cooldowns.get(skillId);
    if (!record) {
      return 0;
    }

    const elapsedTurns = currentTurn - record.lastUsedTurn;
    const remaining = record.cooldown - elapsedTurns;
    
    return Math.max(0, remaining);
  }

  /**
   * 检查技能是否可用（冷却是否结束）
   * @param skillId 技能ID
   * @param currentTurn 当前回合数
   * @returns 是否可用
   */
  isSkillAvailable(skillId: number, currentTurn: number): boolean {
    return this.getRemainingCooldown(skillId, currentTurn) === 0;
  }

  /**
   * 记录技能使用
   * @param skillId 技能ID
   * @param currentTurn 当前回合数
   * @param cooldown 冷却回合数
   */
  recordSkillUse(skillId: number, currentTurn: number, cooldown: number): void {
    this.cooldowns.set(skillId, {
      skillId,
      lastUsedTurn: currentTurn,
      cooldown
    });
  }

  /**
   * 移除技能冷却记录
   * @param skillId 技能ID
   */
  removeCooldown(skillId: number): void {
    this.cooldowns.delete(skillId);
  }

  /**
   * 清除所有冷却记录
   */
  clear(): void {
    this.cooldowns.clear();
  }

  /**
   * 获取所有正在冷却的技能
   * @param currentTurn 当前回合数
   * @returns 正在冷却的技能列表及其剩余回合
   */
  getActiveCooldowns(currentTurn: number): Array<{
    skillId: number;
    remainingTurns: number;
  }> {
    const result: Array<{ skillId: number; remainingTurns: number }> = [];
    
    this.cooldowns.forEach((record, skillId) => {
      const remaining = this.getRemainingCooldown(skillId, currentTurn);
      if (remaining > 0) {
        result.push({
          skillId,
          remainingTurns: remaining
        });
      }
    });

    return result;
  }

  /**
   * 清理已过期的冷却记录
   * @param currentTurn 当前回合数
   */
  cleanupExpiredCooldowns(currentTurn: number): void {
    const expiredSkillIds: number[] = [];
    
    this.cooldowns.forEach((record, skillId) => {
      const remaining = this.getRemainingCooldown(skillId, currentTurn);
      if (remaining === 0) {
        expiredSkillIds.push(skillId);
      }
    });

    expiredSkillIds.forEach(skillId => this.cooldowns.delete(skillId));
  }

  /**
   * 获取冷却记录数量
   */
  get size(): number {
    return this.cooldowns.size;
  }
}

/** 默认冷却管理器实例 */
export const defaultCooldownManager = new CooldownManager();

/**
 * 创建冷却管理器
 */
export function createCooldownManager(): CooldownManager {
  return new CooldownManager();
}
