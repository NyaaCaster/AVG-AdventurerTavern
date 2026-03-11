/**
 * 闪避系统配置
 * 用于计算物理攻击的闪避概率
 */

export interface EvasionConfig {
  /** 基础闪避率 */
  baseEvasionChance: number;
  /** AGI差值因子，闪避率 = 基础闪避率 + (攻击者AGI - 目标AGI) × 因子 */
  agiDifferenceFactor: number;
  /** 最大闪避率上限 */
  maxEvasionChance: number;
  /** 最小闪避率下限 */
  minEvasionChance: number;
}

export const EVASION_CONFIG: EvasionConfig = {
  baseEvasionChance: 0.02,
  agiDifferenceFactor: 0.002,
  maxEvasionChance: 0.50,
  minEvasionChance: 0
};
