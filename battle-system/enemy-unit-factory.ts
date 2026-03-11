/**
 * 敌人战斗单位工厂模块
 * 
 * 将敌人配置数据转换为战斗系统可用的 BattleUnit。
 * 
 * ═══════════════════════════════════════════════════════════════
 * 数据流程
 * ═══════════════════════════════════════════════════════════════
 * 
 * 任务配置 (quest-list.ts)
 *     │
 *     ├── star: 1-10 (任务星级 → 敌人等级)
 *     └── battle_config.enemies[] (敌人配置)
 *             │
 *             ├── enemy_id: number (敌人ID)
 *             └── position: number (战斗位置)
 *                     │
 *                     ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    createEnemyBattleUnit()                   │
 * ├─────────────────────────────────────────────────────────────┤
 * │  1. 查找敌人数据 (ENEMIES.find)                              │
 * │  2. 获取基础属性 (getBaseStats(enemyLevel))                  │
 * │  3. 应用属性修正 (applyStatMultipliers)                      │
 * │  4. 构建 BattleStats 对象                                    │
 * │  5. 返回 EnemyBattleUnit                                    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { EnemyData, EnemyAction, EnemyTrait, ENEMIES } from '../data/battle-data/enemies';
import { getBaseStats, BaseStats } from '../data/battle-data/base_stats_table';
import { BattleUnit, BattleStats, Faction } from './types';
import { EnemyConfig } from '../types';

/**
 * 敌人战斗单位接口
 * 
 * 继承自 BattleUnit，扩展了敌人特有的数据字段。
 * 
 * @extends BattleUnit
 * @property {EnemyData} enemyData - 敌人原始配置数据
 * @property {EnemyAction[]} actions - 敌人可用的行动列表（用于AI决策）
 * @property {EnemyTrait[]} traits - 敌人特性列表（如属性抗性、状态免疫等）
 */
export interface EnemyBattleUnit extends BattleUnit {
  enemyData: EnemyData;
  actions: EnemyAction[];
  traits: EnemyTrait[];
}

/**
 * 创建敌人战斗单位的选项接口
 * 
 * @property {EnemyConfig} enemyConfig - 敌人配置（来自任务配置）
 * @property {number} enemyLevel - 敌人等级（1-99），用于获取基础属性
 * @property {Partial<BaseStats>} [statMultipliers] - 可选的属性修正系数（百分比形式）
 */
export interface CreateEnemyUnitOptions {
  enemyConfig: EnemyConfig;
  enemyLevel: number;
  statMultipliers?: Partial<BaseStats>;
}

/**
 * 查找敌人数据
 * 
 * 根据敌人ID从 ENEMIES 数组中查找对应的敌人配置数据。
 * 
 * @param {number} enemyId - 敌人ID
 * @returns {EnemyData | undefined} 敌人数据，未找到则返回 undefined
 * 
 * @example
 * const enemy = findEnemyData(101);
 * if (enemy) {
 *   console.log(enemy.name); // 敌人名称
 * }
 */
export function findEnemyData(enemyId: number): EnemyData | undefined {
  return ENEMIES.find(e => e.id === enemyId);
}

/**
 * 创建单个敌人战斗单位
 * 
 * 将敌人配置转换为战斗系统可用的 EnemyBattleUnit 对象。
 * 
 * 处理流程：
 * 1. 根据 enemy_id 查找敌人数据
 * 2. 使用 enemyLevel 作为等级获取基础属性
 * 3. 应用可选的属性修正系数
 * 4. 构建 BattleStats 对象（属性命名转换：hp → maxHp/hp）
 * 5. 返回完整的 EnemyBattleUnit
 * 
 * @param {CreateEnemyUnitOptions} options - 创建选项
 * @returns {EnemyBattleUnit | null} 敌人战斗单位，未找到敌人数据则返回 null
 * 
 * @example
 * const unit = createEnemyBattleUnit({
 *   enemyConfig: { enemy_id: 101, position: 1 },
 *   enemyLevel: 30,
 *   statMultipliers: { atk: 120, def: 80 } // 攻击+20%，防御-20%
 * });
 */
export function createEnemyBattleUnit(options: CreateEnemyUnitOptions): EnemyBattleUnit | null {
  const { enemyConfig, enemyLevel, statMultipliers } = options;
  
  const enemyData = findEnemyData(enemyConfig.enemy_id);
  if (!enemyData) {
    console.warn(`[EnemyUnitFactory] 未找到敌人ID: ${enemyConfig.enemy_id}`);
    return null;
  }

  const baseStats = getBaseStats(enemyLevel);
  
  const finalStats = applyStatMultipliers(baseStats, statMultipliers);

  const stats: BattleStats = {
    maxHp: finalStats.hp,
    hp: finalStats.hp,
    maxMp: finalStats.mp,
    mp: finalStats.mp,
    atk: finalStats.atk,
    def: finalStats.def,
    matk: finalStats.matk,
    mdef: finalStats.mdef,
    agi: finalStats.agi,
    luk: finalStats.luk
  };

  return {
    id: `enemy_${enemyConfig.enemy_id}_pos${enemyConfig.position}`,
    name: enemyData.name,
    faction: Faction.ENEMY,
    position: enemyConfig.position,
    level: enemyLevel,
    stats,
    baseStats: { ...stats },
    buffs: [],
    statusEffects: [],
    isAlive: true,
    isGuarding: false,
    cooldowns: new Map(),
    enemyData,
    actions: enemyData.actions,
    traits: enemyData.traits
  };
}

/**
 * 应用属性修正系数
 * 
 * 将基础属性按照修正系数进行调整。
 * 修正系数为百分比形式：100 = 无修正，120 = +20%，80 = -20%
 * 
 * @param {BaseStats} base - 基础属性
 * @param {Partial<BaseStats>} [multipliers] - 属性修正系数（可选）
 * @returns {BaseStats} 修正后的属性
 * 
 * @example
 * const base = { hp: 1000, atk: 100, ... };
 * const result = applyStatMultipliers(base, { atk: 150 }); // 攻击+50%
 * // result.atk = 150
 */
function applyStatMultipliers(base: BaseStats, multipliers?: Partial<BaseStats>): BaseStats {
  if (!multipliers) return { ...base };
  
  return {
    hp: Math.round(base.hp * ((multipliers.hp ?? 100) / 100)),
    mp: Math.round(base.mp * ((multipliers.mp ?? 100) / 100)),
    atk: Math.round(base.atk * ((multipliers.atk ?? 100) / 100)),
    def: Math.round(base.def * ((multipliers.def ?? 100) / 100)),
    matk: Math.round(base.matk * ((multipliers.matk ?? 100) / 100)),
    mdef: Math.round(base.mdef * ((multipliers.mdef ?? 100) / 100)),
    agi: Math.round(base.agi * ((multipliers.agi ?? 100) / 100)),
    luk: Math.round(base.luk * ((multipliers.luk ?? 100) / 100))
  };
}

/**
 * 创建敌人队伍的选项接口
 * 
 * @property {EnemyConfig[]} enemies - 敌人配置数组
 * @property {number} enemyLevel - 敌人等级（1-99），用于获取基础属性
 * @property {Partial<BaseStats>} [statMultipliers] - 可选的属性修正系数（应用于所有敌人）
 */
export interface CreateEnemyPartyOptions {
  enemies: EnemyConfig[];
  enemyLevel: number;
  statMultipliers?: Partial<BaseStats>;
}

/**
 * 创建敌人队伍
 * 
 * 批量创建多个敌人战斗单位，用于初始化战斗场景。
 * 
 * @param {CreateEnemyPartyOptions} options - 创建选项
 * @returns {EnemyBattleUnit[]} 敌人战斗单位数组（过滤掉创建失败的单位）
 * 
 * @example
 * // 从任务配置创建敌人队伍
 * const enemyUnits = createEnemyParty({
 *   enemies: [
 *     { enemy_id: 101, position: 1 },
 *     { enemy_id: 101, position: 2 },
 *     { enemy_id: 102, position: 3 }
 *   ],
 *   enemyLevel: 30
 * });
 * 
 * // enemyUnits.length = 3
 */
export function createEnemyParty(options: CreateEnemyPartyOptions): EnemyBattleUnit[] {
  const { enemies, enemyLevel, statMultipliers } = options;
  
  const units: EnemyBattleUnit[] = [];
  
  for (const enemyConfig of enemies) {
    const unit = createEnemyBattleUnit({
      enemyConfig,
      enemyLevel,
      statMultipliers
    });
    
    if (unit) {
      units.push(unit);
    }
  }
  
  return units;
}

export type { EnemyData, EnemyAction, EnemyTrait };
export { ENEMIES };
