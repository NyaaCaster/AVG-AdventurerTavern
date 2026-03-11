/**
 * 玩家战斗单位工厂模块
 * 
 * 将角色数据转换为战斗系统可用的 BattleUnit。
 * 
 * ═══════════════════════════════════════════════════════════════
 * 数据流程
 * ═══════════════════════════════════════════════════════════════
 * 
 * 存档数据 / 角色配置
 *     │
 *     ├── characterId: string (角色ID)
 *     ├── level: number (角色等级)
 *     └── equipment: CharacterEquipment (装备配置)
 *             │
 *             ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │                 createPlayerBattleUnit()                     │
 * ├─────────────────────────────────────────────────────────────┤
 * │  1. 获取角色战斗属性 (buildCharacterBattleStats)             │
 * │  2. 获取角色技能列表 (CharacterBattleData.skills)            │
 * │  3. 构建 BattleStats 对象                                    │
 * │  4. 返回 PlayerBattleUnit                                    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { BattleUnit, BattleStats, Faction } from './types';
import { 
  buildCharacterBattleStats, 
  CharacterBattleStatsResult 
} from '../services/characterBattleStats';
import { CharacterEquipment, CharacterSkills } from '../types';
import { CHARACTERS } from '../data/scenarioData';

/**
 * 玩家战斗单位接口
 * 
 * 继承自 BattleUnit，扩展了玩家特有的数据字段。
 * 
 * @extends BattleUnit
 * @property {string} characterId - 角色ID (如 'char_101')
 * @property {CharacterSkills} skillSlots - 角色配置的技能槽位
 */
export interface PlayerBattleUnit extends BattleUnit {
  characterId: string;
  skillSlots: CharacterSkills;
}

/**
 * 创建玩家战斗单位的选项接口
 * 
 * @property {string} characterId - 角色ID (如 'char_101')
 * @property {number} level - 角色等级 (1-100)
 * @property {number} position - 战斗位置 (1-3)
 * @property {CharacterEquipment} [equipment] - 装备配置（可选，默认使用初始装备）
 * @property {CharacterSkills} [skillSlots] - 技能槽位配置（可选）
 */
export interface CreatePlayerUnitOptions {
  characterId: string;
  level: number;
  position: number;
  equipment?: Partial<CharacterEquipment> | null;
  skillSlots?: CharacterSkills;
}

/**
 * 创建单个玩家战斗单位
 * 
 * 将角色配置转换为战斗系统可用的 PlayerBattleUnit 对象。
 * 
 * 处理流程：
 * 1. 获取角色战斗属性（包含等级、装备加成等）
 * 2. 获取角色技能列表
 * 3. 构建 BattleStats 对象
 * 4. 返回完整的 PlayerBattleUnit
 * 
 * @param {CreatePlayerUnitOptions} options - 创建选项
 * @returns {PlayerBattleUnit | null} 玩家战斗单位，角色不存在则返回 null
 * 
 * @example
 * const unit = createPlayerBattleUnit({
 *   characterId: 'char_101',
 *   level: 25,
 *   position: 1,
 *   equipment: { weaponId: 'wpn_001', armorId: 'arm_001' }
 * });
 */
export function createPlayerBattleUnit(options: CreatePlayerUnitOptions): PlayerBattleUnit | null {
  const { characterId, level, position, equipment, skillSlots } = options;
  
  const character = CHARACTERS[characterId];
  if (!character) {
    console.warn(`[PlayerUnitFactory] 未找到角色ID: ${characterId}`);
    return null;
  }

  const battleStatsResult = buildCharacterBattleStats(characterId, level, equipment);
  
  const stats: BattleStats = {
    maxHp: battleStatsResult.finalStats.hp,
    hp: battleStatsResult.finalStats.hp,
    maxMp: battleStatsResult.finalStats.mp,
    mp: battleStatsResult.finalStats.mp,
    atk: battleStatsResult.finalStats.atk,
    def: battleStatsResult.finalStats.def,
    matk: battleStatsResult.finalStats.matk,
    mdef: battleStatsResult.finalStats.mdef,
    agi: battleStatsResult.finalStats.agi,
    luk: battleStatsResult.finalStats.luk
  };

  const defaultSkillSlots: CharacterSkills = {
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
    slot5: null,
    slot6: null,
    slot7: null,
    slot8: null
  };

  return {
    id: `player_${characterId}_pos${position}`,
    name: character.name,
    faction: Faction.PLAYER,
    position,
    level: battleStatsResult.level,
    stats,
    baseStats: { ...stats },
    buffs: [],
    statusEffects: [],
    isAlive: true,
    isGuarding: false,
    cooldowns: new Map(),
    characterId,
    skillSlots: skillSlots || defaultSkillSlots
  };
}

/**
 * 创建玩家队伍的选项接口
 * 
 * @property {Array<{characterId: string; position: number}>} members - 队伍成员配置
 * @property {Record<string, number>} levels - 角色等级映射 (characterId -> level)
 * @property {Record<string, CharacterEquipment>} [equipments] - 装备映射（可选）
 * @property {Record<string, CharacterSkills>} [skillSlots] - 技能槽位映射（可选）
 */
export interface CreatePlayerPartyOptions {
  members: Array<{ characterId: string; position: number }>;
  levels: Record<string, number>;
  equipments?: Record<string, CharacterEquipment>;
  skillSlots?: Record<string, CharacterSkills>;
}

/**
 * 创建玩家队伍
 * 
 * 批量创建多个玩家战斗单位，用于初始化战斗场景。
 * 
 * @param {CreatePlayerPartyOptions} options - 创建选项
 * @returns {PlayerBattleUnit[]} 玩家战斗单位数组（过滤掉创建失败的单位）
 * 
 * @example
 * const playerUnits = createPlayerParty({
 *   members: [
 *     { characterId: 'char_101', position: 1 },
 *     { characterId: 'char_102', position: 2 },
 *     { characterId: 'char_103', position: 3 }
 *   ],
 *   levels: { char_101: 25, char_102: 23, char_103: 22 },
 *   equipments: saveData.characterEquipments,
 *   skillSlots: saveData.characterSkills
 * });
 */
export function createPlayerParty(options: CreatePlayerPartyOptions): PlayerBattleUnit[] {
  const { members, levels, equipments, skillSlots } = options;
  
  const units: PlayerBattleUnit[] = [];
  
  for (const member of members) {
    const level = levels[member.characterId] ?? 1;
    const equipment = equipments?.[member.characterId];
    const skills = skillSlots?.[member.characterId];
    
    const unit = createPlayerBattleUnit({
      characterId: member.characterId,
      level,
      position: member.position,
      equipment,
      skillSlots: skills
    });
    
    if (unit) {
      units.push(unit);
    }
  }
  
  return units;
}

/**
 * 从存档数据创建玩家队伍
 * 
 * 便捷函数，直接从存档数据结构创建玩家队伍。
 * 
 * @param {any} saveData - 存档数据
 * @param {string[]} characterIds - 要创建的角色ID列表
 * @returns {PlayerBattleUnit[]} 玩家战斗单位数组
 * 
 * @example
 * const playerUnits = createPlayerPartyFromSaveData(saveData, ['char_101', 'char_102', 'char_103']);
 */
export function createPlayerPartyFromSaveData(
  saveData: any, 
  characterIds: string[]
): PlayerBattleUnit[] {
  const members = characterIds.map((characterId, index) => ({
    characterId,
    position: index + 1
  }));
  
  const levels: Record<string, number> = {};
  characterIds.forEach(characterId => {
    levels[characterId] = saveData?.characterStats?.[characterId]?.level ?? 1;
  });
  
  return createPlayerParty({
    members,
    levels,
    equipments: saveData?.characterEquipments,
    skillSlots: saveData?.characterSkills
  });
}

export type { CharacterBattleStatsResult };
