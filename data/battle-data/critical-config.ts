/**
 * 暴击系统配置
 * 用于计算暴击概率和暴击伤害倍数
 */

export interface CriticalConfig {
  /** 基础暴击率 */
  baseCriticalChance: number;
  /** LUK差值因子，暴击率 = 基础暴击率 + (攻击者LUK - 防御者LUK) × 因子 */
  lukDifferenceFactor: number;
  /** 最大暴击率上限 */
  maxCriticalChance: number;
  /** 最小暴击率下限 */
  minCriticalChance: number;
  /** 暴击伤害倍数 */
  criticalDamageMultiplier: number;
}

export const CRITICAL_CONFIG: CriticalConfig = {
  baseCriticalChance: 0.01,      // 基础暴击率 1%
  lukDifferenceFactor: 0.0005,   // LUK差值因子 0.05%
  maxCriticalChance: 0.30,       // 最大暴击率 30%
  minCriticalChance: 0,          // 最小暴击率 0%
  criticalDamageMultiplier: 3    // 暴击伤害倍数 300%
};
