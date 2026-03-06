
import { useState, useEffect } from 'react';
import { 
    ManagementStats, RevenueLog, UserRecipe, SceneId, CharacterUnlocks, TavernMenuState,
    QuestStateMap, QuestStatus, CharacterStat, CharacterEquipment, BattlePartySlots
} from '../types';
import { ITEMS } from '../data/items';
import { getDefaultUnlocks } from '../data/unlockConditions';
import { 
    INITIAL_INVENTORY, INITIAL_SCENE_LEVELS, 
    INITIAL_CHARACTER_LEVEL, INITIAL_CHARACTER_AFFINITY, INITIAL_MANAGEMENT_STATS, INITIAL_GOLD,
    INITIAL_CHARACTER_UNLOCKS, INITIAL_CHARACTER_EQUIPMENT, MAX_GOLD, INITIAL_BATTLE_PARTY
} from '../utils/gameConstants';
import { calculateRoomPrice, calculateMaxOccupancy } from '../data/facilityData';
import { EXP_TABLE } from '../data/battle-data/exp_table';
import { CHARACTERS } from '../data/scenarioData';
import { ITEMS_EQUIP } from '../data/item-equip';

export const useCoreState = (initialSaveData?: any) => {
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  const [gold, setGold] = useState<number>(INITIAL_GOLD); 
  const [sceneLevels, setSceneLevels] = useState<Record<string, number>>(INITIAL_SCENE_LEVELS);
  
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [foodStock, setFoodStock] = useState<Record<string, number>>({});
  const [tavernMenu, setTavernMenu] = useState<TavernMenuState>({ foods: [], drinks: [] });
  const [battleParty, setBattleParty] = useState<BattlePartySlots>(INITIAL_BATTLE_PARTY);

  const getMaxLevelByCharacter = (charId: string): number => {
      return CHARACTERS[charId]?.battleData?.maxLevel ?? 99;
  };

  const normalizeBattleParty = (rawParty?: any): BattlePartySlots => {
      const fallback: BattlePartySlots = [...INITIAL_BATTLE_PARTY];
      if (!Array.isArray(rawParty) || rawParty.length !== 4) return fallback;

      const usedIds = new Set<string>();
      const result: BattlePartySlots = ['char_1', null, null, null];

      for (let i = 1; i < 4; i++) {
          const candidate = rawParty[i];
          if (typeof candidate !== 'string') continue;
          const id = candidate.trim();
          if (!id || id === 'char_1') continue;
          if (!CHARACTERS[id]) continue;
          if (usedIds.has(id)) continue;
          usedIds.add(id);
          result[i] = id;
      }

      return result;
  };

  const normalizeCharacterStats = (rawStats?: Record<string, any>): Record<string, CharacterStat> => {
      const normalized: Record<string, CharacterStat> = {};

      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
          const raw = rawStats?.[charId] || {};
          const maxLevel = getMaxLevelByCharacter(charId);
          const safeLevel = Math.max(1, Math.min(maxLevel, Number(raw.level) || 1));
          const safeAffinity = Math.max(0, Math.min(100, Number(raw.affinity) || 0));
          const safeExp = safeLevel >= maxLevel ? 0 : Math.max(0, Number(raw.exp) || 0);

          normalized[charId] = {
              level: safeLevel,
              affinity: safeAffinity,
              exp: safeExp
          };
      });

      return normalized;
  };

  const normalizeCharacterEquipments = (rawEquipments?: Record<string, any>): Record<string, CharacterEquipment> => {
      const normalized: Record<string, CharacterEquipment> = {};

      const toValidId = (value: any, category: 'wpn' | 'arm' | 'acs'): string | null => {
          if (typeof value !== 'string' || !value.trim()) return null;
          const id = value.trim();
          const item = ITEMS_EQUIP[id];
          if (!item || item.category !== category) return null;
          return id;
      };

      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
          const base = INITIAL_CHARACTER_EQUIPMENT[charId] || { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null };
          const raw = rawEquipments?.[charId] || {};

          normalized[charId] = {
              weaponId: toValidId(raw.weaponId ?? base.weaponId, 'wpn'),
              armorId: toValidId(raw.armorId ?? base.armorId, 'arm'),
              accessory1Id: toValidId(raw.accessory1Id ?? base.accessory1Id, 'acs'),
              accessory2Id: toValidId(raw.accessory2Id ?? base.accessory2Id, 'acs')
          };
      });

      return normalized;
  };

  const getLevelUpNeedExp = (currentLevel: number): number => {
      const nextLevel = currentLevel + 1;
      if (nextLevel >= EXP_TABLE.length) return Number.MAX_SAFE_INTEGER;
      const currentTotal = EXP_TABLE[currentLevel] ?? 0;
      const nextTotal = EXP_TABLE[nextLevel] ?? currentTotal;
      return Math.max(0, nextTotal - currentTotal);
  };

  const applyExpGainToStat = (charId: string, stat: CharacterStat, gainedExp: number): CharacterStat => {
      if (gainedExp <= 0) return stat;

      const maxLevel = getMaxLevelByCharacter(charId);
      let level = Math.max(1, Math.min(maxLevel, stat.level || 1));
      let exp = Math.max(0, stat.exp || 0) + gainedExp;

      while (level < maxLevel) {
          const needExp = getLevelUpNeedExp(level);
          if (needExp <= 0 || exp < needExp) break;
          exp -= needExp;
          level += 1;
      }

      if (level >= maxLevel) {
          level = maxLevel;
          exp = 0;
      }

      return {
          ...stat,
          level,
          exp
      };
  };
  
  const [characterStats, setCharacterStats] = useState<Record<string, CharacterStat>>(() => {
    const initialStats: Record<string, CharacterStat> = {};
    Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
      initialStats[charId] = {
        level: 1,
        affinity: INITIAL_CHARACTER_AFFINITY[charId],
        exp: 0
      };
    });
    return initialStats;
  });
  const [characterEquipments, setCharacterEquipments] = useState<Record<string, CharacterEquipment>>(() => normalizeCharacterEquipments());
  const [characterUnlocks, setCharacterUnlocks] = useState<Record<string, CharacterUnlocks>>({});
  const [managementStats, setManagementStats] = useState<ManagementStats>(() => {
    // Calculate initial values based on facility levels
    const innLevel = INITIAL_SCENE_LEVELS['scen_1'] || 1;
    const roomLevel = INITIAL_SCENE_LEVELS['scen_2'] || 1;
    return {
      ...INITIAL_MANAGEMENT_STATS,
      roomPrice: calculateRoomPrice(innLevel),
      maxOccupancy: calculateMaxOccupancy(roomLevel)
    };
  });
  const [revenueLogs, setRevenueLogs] = useState<RevenueLog[]>([]);
  const [questStates, setQuestStates] = useState<QuestStateMap>({});

  // Apply loaded data
  useEffect(() => {
      if (initialSaveData) {
          applyLoadedData(initialSaveData);
      }
  }, [initialSaveData]);

  // Initialize character unlocks with default values
  useEffect(() => {
      const initialUnlocks: Record<string, CharacterUnlocks> = {};
      
      // For each character in INITIAL_CHARACTER_LEVEL
      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
          // Get character-specific initial unlocks or use all zeros
          const charSpecificUnlocks = INITIAL_CHARACTER_UNLOCKS[charId] || {};
          
          // Create full unlock object with defaults
          initialUnlocks[charId] = {
              accept_battle_party: 0,
              accept_flirt_topic: 0,
              accept_nsfw_topic: 0,
              accept_physical_contact: 0,
              accept_indirect_sexual: 0,
              accept_become_lover: 0,
              accept_direct_sexual: 0,
              accept_sexual_partner: 0,
              accept_public_exposure: 0,
              accept_public_sexual: 0,
              accept_group_sexual: 0,
              accept_prostitution: 0,
              accept_sexual_slavery: 0,
              accept_bathing_together: 0,
              accept_player_massage: 0,
              accept_character_massage: 0,
              ...charSpecificUnlocks // Override with character-specific values
          };
      });
      
      setCharacterUnlocks(initialUnlocks);
  }, []);

  const applyLoadedData = (data: any) => {
      if (!data) return;
      setGold(data.gold);
      setManagementStats(data.managementStats);
      setInventory(data.inventory);
      setCharacterStats(normalizeCharacterStats(data.characterStats));
      setCharacterEquipments(normalizeCharacterEquipments(data.characterEquipments));
      setBattleParty(normalizeBattleParty(data.battleParty));
      setSceneLevels(data.sceneLevels);
      setRevenueLogs(data.revenueLogs);
      
      if (data.userRecipes) setUserRecipes(data.userRecipes);
      if (data.foodStock) setFoodStock(data.foodStock);
      if (data.characterUnlocks) setCharacterUnlocks(data.characterUnlocks);
      if (data.tavernMenu) setTavernMenu(data.tavernMenu);
      if (data.questStates) setQuestStates(data.questStates);
  };

  // --- Handlers ---

  const handleUpdateTavernMenu = (type: 'foods' | 'drinks', index: number, itemId: string | null) => {
      setTavernMenu(prev => {
          const newList = [...prev[type]];
          // Ensure array size
          while (newList.length <= index) newList.push(null);
          newList[index] = itemId;
          return { ...prev, [type]: newList };
      });
  };

  const handleClearTavernMenu = () => {
      setTavernMenu({ foods: [], drinks: [] });
  };

  const handleTavernSales = (earnedGold: number, foodSold: Record<string, number>, drinksSold: Record<string, number>) => {
      if (earnedGold > 0) {
          setGold(prev => Math.min(MAX_GOLD, prev + earnedGold));
      }

      if (Object.keys(foodSold).length > 0) {
          setFoodStock(prev => {
              const next = { ...prev };
              Object.entries(foodSold).forEach(([id, count]) => {
                  next[id] = Math.max(0, (next[id] || 0) - count);
              });
              return next;
          });
      }

      if (Object.keys(drinksSold).length > 0) {
          setInventory(prev => {
              const next = { ...prev };
              Object.entries(drinksSold).forEach(([id, count]) => {
                  next[id] = Math.max(0, (next[id] || 0) - count);
              });
              return next;
          });
      }
  };

  const handleManagementAction = (cost: number, changes: Partial<ManagementStats>) => {
      if (gold < cost) return;
      setGold(prev => prev - cost);
      
      setManagementStats(prev => {
          let newStats = { ...prev };
          if (changes.satisfaction !== undefined) newStats.satisfaction = Math.max(0, Math.min(100, prev.satisfaction + changes.satisfaction));
          if (changes.attraction !== undefined) newStats.attraction = Math.max(0, Math.min(100, prev.attraction + changes.attraction));
          if (changes.reputation !== undefined) newStats.reputation = Math.max(0, Math.min(100, prev.reputation + changes.reputation));
          return newStats;
      });
  };

  const handleUpgradeFacility = (facilityId: SceneId, costGold: number, costMatIds: string[], costMatCount: number) => {
      if (gold < costGold) return;
      for (const matId of costMatIds) {
          if ((inventory[matId] || 0) < costMatCount) return;
      }

      setGold(prev => prev - costGold);
      setInventory(prev => {
          const newInv = { ...prev };
          for (const matId of costMatIds) {
              newInv[matId] = (newInv[matId] || 0) - costMatCount;
          }
          return newInv;
      });

      setSceneLevels(prev => {
          const newLevels = { ...prev };
          const newLevel = (newLevels[facilityId] || 0) + 1;
          newLevels[facilityId] = newLevel;
          
          // Update related stats immediately with new level
          if (facilityId === 'scen_1') {
              setManagementStats(prevStats => ({
                  ...prevStats,
                  roomPrice: calculateRoomPrice(newLevel)
              }));
          } else if (facilityId === 'scen_2') {
              setManagementStats(prevStats => ({
                  ...prevStats,
                  maxOccupancy: calculateMaxOccupancy(newLevel)
              }));
          }
          
          return newLevels;
      });
  };

  // --- Cooking Handlers ---
  const handleAddRecipe = (newRecipe: UserRecipe) => {
      setUserRecipes(prev => [newRecipe, ...prev]);
      setFoodStock(prev => ({
          ...prev,
          [newRecipe.id]: (prev[newRecipe.id] || 0) + 1
      }));
  };

  const handleConsumeIngredients = (items: {id: string, count: number}[]) => {
      setInventory(prev => {
          const newInv = { ...prev };
          items.forEach(item => {
              newInv[item.id] = Math.max(0, (newInv[item.id] || 0) - item.count);
          });
          return newInv;
      });
  };

  const handleCraftRecipe = (recipeId: string, count: number, ingredients: {id: string, count: number}[]) => {
      handleConsumeIngredients(ingredients);
      setFoodStock(prev => ({
          ...prev,
          [recipeId]: (prev[recipeId] || 0) + count
      }));
  };

  const handleDeleteRecipe = (recipeId: string) => {
      setUserRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const handleRenameRecipe = (recipeId: string, newName: string) => {
      setUserRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, name: newName } : r));
  };

  const handleAddItems = (items: { id: string; count: number }[]) => {
      setInventory(prev => {
          const newInventory = { ...prev };
          items.forEach(item => {
              if (item.id && item.count > 0) {
                  const newCount = (newInventory[item.id] || 0) + item.count;
                  const itemData = ITEMS[item.id];
                  const maxStack = itemData?.maxStack;
                  newInventory[item.id] = maxStack ? Math.min(newCount, maxStack) : newCount;
              }
          });
          return newInventory;
      });
  };

  // --- Quest Handlers ---
  const handleAcceptQuest = (questId: string) => {
      setQuestStates(prev => ({
          ...prev,
          [questId]: { questId, status: 'active' as QuestStatus, acceptedAt: Date.now() }
      }));
  };

  const handleCompleteQuest = (questId: string) => {
      setQuestStates(prev => ({
          ...prev,
          [questId]: { questId, status: 'completed' as QuestStatus, acceptedAt: prev[questId]?.acceptedAt }
      }));
  };

  const handleDeliverQuest = (questId: string) => {
      // 交付后从状态中移除（重置为可接受）
      setQuestStates(prev => {
          const next = { ...prev };
          delete next[questId];
          return next;
      });
  };

  const addCharacterExp = (characterId: string, gainedExp: number) => {
      if (!characterId || gainedExp <= 0) return;

      setCharacterStats(prev => {
          const current = prev[characterId] || { level: 1, affinity: 0, exp: 0 };
          const updated = applyExpGainToStat(characterId, current, gainedExp);
          return {
              ...prev,
              [characterId]: updated
          };
      });
  };

  const removeFromBattleParty = (slotIndex: number) => {
      if (slotIndex < 1 || slotIndex > 3) return;
      setBattleParty(prev => {
          const next: BattlePartySlots = [...prev];
          next[slotIndex] = null;
          return next;
      });
  };

  const addToBattleParty = (characterId: string, preferredSlotIndex?: number): boolean => {
      if (!characterId || characterId === 'char_1') return false;
      if (!CHARACTERS[characterId]) return false;

      let added = false;
      setBattleParty(prev => {
          if (prev.includes(characterId)) return prev;

          const next: BattlePartySlots = [...prev];
          if (typeof preferredSlotIndex === 'number' && preferredSlotIndex >= 1 && preferredSlotIndex <= 3 && !next[preferredSlotIndex]) {
              next[preferredSlotIndex] = characterId;
              added = true;
              return next;
          }

          const emptyIndex = next.findIndex((id, idx) => idx >= 1 && !id);
          if (emptyIndex !== -1) {
              next[emptyIndex] = characterId;
              added = true;
              return next;
          }

          return prev;
      });

      return added;
  };

  const updateGold = (newGold: number) => setGold(Math.min(MAX_GOLD, Math.max(0, newGold)));
  const updateInventoryItem = (itemId: string, newCount: number) => {
      setInventory(prev => ({ ...prev, [itemId]: newCount }));
  };

  // Character unlock handlers
  const updateCharacterUnlock = (
      characterId: string,
      unlockKey: keyof CharacterUnlocks,
      value: 0 | 1
  ) => {
      setCharacterUnlocks(prev => ({
          ...prev,
          [characterId]: {
              ...(prev[characterId] || getDefaultUnlocks()),
              [unlockKey]: value
          }
      }));
  };

  const updateCharacterUnlocks = (characterId: string, unlocks: Partial<CharacterUnlocks>) => {
      setCharacterUnlocks(prev => ({
          ...prev,
          [characterId]: {
              ...(prev[characterId] || getDefaultUnlocks()),
              ...unlocks
          }
      }));
  };

  return {
      inventory, setInventory,
      gold, setGold,
      sceneLevels, setSceneLevels,
      userRecipes, setUserRecipes,
      foodStock, setFoodStock,
      characterStats, setCharacterStats,
      characterEquipments, setCharacterEquipments,
      characterUnlocks, setCharacterUnlocks,
      managementStats, setManagementStats,
      revenueLogs, setRevenueLogs,
      
      // Handlers
      handleManagementAction,
      handleUpgradeFacility,
      handleAddRecipe,
      handleConsumeIngredients,
      handleCraftRecipe,
      handleDeleteRecipe,
      handleRenameRecipe,
      handleAddItems,
      addCharacterExp,
      updateGold,
      updateInventoryItem,
      updateCharacterUnlock,
      updateCharacterUnlocks,
      applyLoadedData,
      tavernMenu, setTavernMenu,
      handleUpdateTavernMenu,
      handleClearTavernMenu,
      handleTavernSales,
      questStates, setQuestStates,
      handleAcceptQuest,
      handleCompleteQuest,
      handleDeliverQuest,
      battleParty,
      setBattleParty,
      addToBattleParty,
      removeFromBattleParty
  };
};
