import { getBaseStats, BaseStats } from '../data/battle-data/base_stats_table';
import { ITEMS_EQUIP } from '../data/item-equip';
import { CHARACTERS } from '../data/scenarioData';
import { CharacterEquipment } from '../types';
import { INITIAL_CHARACTER_EQUIPMENT, INITIAL_CHARACTER_LEVEL } from '../utils/gameConstants';

type StatKey = keyof BaseStats;

const STAT_KEYS: StatKey[] = ['hp', 'mp', 'atk', 'def', 'matk', 'mdef', 'agi', 'luk'];

export interface CharacterBattleStatsResult {
  characterId: string;
  level: number;
  equipment: CharacterEquipment;
  baseStats: BaseStats;
  multipliedStats: BaseStats;
  equipmentBonus: BaseStats;
  finalStats: BaseStats;
}

const EMPTY_STATS: BaseStats = {
  hp: 0,
  mp: 0,
  atk: 0,
  def: 0,
  matk: 0,
  mdef: 0,
  agi: 0,
  luk: 0
};

const createEmptyStats = (): BaseStats => ({ ...EMPTY_STATS });

const toValidEquipId = (value: string | null | undefined, expectedCategory: 'wpn' | 'arm' | 'acs'): string | null => {
  if (!value) return null;
  const item = ITEMS_EQUIP[value];
  if (!item || item.category !== expectedCategory) return null;
  return value;
};

const normalizeEquipment = (characterId: string, equipment?: Partial<CharacterEquipment> | null): CharacterEquipment => {
  const fallback = INITIAL_CHARACTER_EQUIPMENT[characterId] || {
    weaponId: null,
    armorId: null,
    accessory1Id: null,
    accessory2Id: null
  };

  return {
    weaponId: toValidEquipId(equipment?.weaponId ?? fallback.weaponId, 'wpn'),
    armorId: toValidEquipId(equipment?.armorId ?? fallback.armorId, 'arm'),
    accessory1Id: toValidEquipId(equipment?.accessory1Id ?? fallback.accessory1Id, 'acs'),
    accessory2Id: toValidEquipId(equipment?.accessory2Id ?? fallback.accessory2Id, 'acs')
  };
};

const getSafeLevel = (characterId: string, rawLevel: unknown): number => {
  const maxLevel = CHARACTERS[characterId]?.battleData?.maxLevel ?? 100;
  const initialLevel = INITIAL_CHARACTER_LEVEL[characterId] || 1;
  const level = Number(rawLevel) || initialLevel;
  return Math.max(1, Math.min(maxLevel, Math.floor(level)));
};

const applyCharacterMultipliers = (characterId: string, base: BaseStats): BaseStats => {
  const multipliers = CHARACTERS[characterId]?.battleData?.statMultipliers;
  if (!multipliers) return { ...base };

  const result = createEmptyStats();
  STAT_KEYS.forEach((key) => {
    const ratio = Number(multipliers[key]) || 100;
    result[key] = Math.round(base[key] * (ratio / 100));
  });
  return result;
};

const collectEquipmentBonus = (equipment: CharacterEquipment): BaseStats => {
  const result = createEmptyStats();
  const equipIds = [equipment.weaponId, equipment.armorId, equipment.accessory1Id, equipment.accessory2Id];

  equipIds.forEach((equipId) => {
    if (!equipId) return;
    const stats = ITEMS_EQUIP[equipId]?.stats;
    if (!stats) return;

    STAT_KEYS.forEach((key) => {
      result[key] += Number(stats[key] || 0);
    });
  });

  return result;
};

const mergeStats = (left: BaseStats, right: BaseStats): BaseStats => {
  const result = createEmptyStats();
  STAT_KEYS.forEach((key) => {
    result[key] = left[key] + right[key];
  });
  return result;
};

export const buildCharacterBattleStats = (
  characterId: string,
  level: number,
  equipment?: Partial<CharacterEquipment> | null
): CharacterBattleStatsResult => {
  const safeLevel = getSafeLevel(characterId, level);
  const normalizedEquipment = normalizeEquipment(characterId, equipment);
  const baseStats = getBaseStats(safeLevel);
  const multipliedStats = applyCharacterMultipliers(characterId, baseStats);
  const equipmentBonus = collectEquipmentBonus(normalizedEquipment);
  const finalStats = mergeStats(multipliedStats, equipmentBonus);

  return {
    characterId,
    level: safeLevel,
    equipment: normalizedEquipment,
    baseStats,
    multipliedStats,
    equipmentBonus,
    finalStats
  };
};

export const getCharacterBattleStatsFromSaveData = (
  saveData: any,
  characterId: string
): CharacterBattleStatsResult => {
  const initialLevel = INITIAL_CHARACTER_LEVEL[characterId] || 1;
  const level = saveData?.characterStats?.[characterId]?.level ?? initialLevel;
  const equipment = saveData?.characterEquipments?.[characterId] || null;
  return buildCharacterBattleStats(characterId, level, equipment);
};


