
import { useState, useEffect } from 'react';
import { 
    ManagementStats, RevenueLog, UserRecipe, SceneId, CharacterUnlocks 
} from '../types';
import { 
    INITIAL_INVENTORY, INITIAL_SCENE_LEVELS, 
    INITIAL_CHARACTER_STATS, INITIAL_MANAGEMENT_STATS, INITIAL_GOLD,
    INITIAL_CHARACTER_UNLOCKS
} from '../utils/gameConstants';
import { calculateRoomPrice, calculateMaxOccupancy } from '../data/facilityData';

export const useCoreState = (initialSaveData?: any) => {
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  const [gold, setGold] = useState<number>(INITIAL_GOLD); 
  const [sceneLevels, setSceneLevels] = useState<Record<string, number>>(INITIAL_SCENE_LEVELS);
  
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [foodStock, setFoodStock] = useState<Record<string, number>>({});
  
  const [characterStats, setCharacterStats] = useState<Record<string, { level: number; affinity: number }>>(INITIAL_CHARACTER_STATS);
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

  // Apply loaded data
  useEffect(() => {
      if (initialSaveData) {
          applyLoadedData(initialSaveData);
      }
  }, [initialSaveData]);

  // Initialize character unlocks with default values
  useEffect(() => {
      const initialUnlocks: Record<string, CharacterUnlocks> = {};
      
      // For each character in INITIAL_CHARACTER_STATS
      Object.keys(INITIAL_CHARACTER_STATS).forEach(charId => {
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
      setCharacterStats(data.characterStats);
      setSceneLevels(data.sceneLevels);
      setRevenueLogs(data.revenueLogs);
      
      if (data.userRecipes) setUserRecipes(data.userRecipes);
      if (data.foodStock) setFoodStock(data.foodStock);
      if (data.characterUnlocks) setCharacterUnlocks(data.characterUnlocks);
  };

  // --- Handlers ---

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
      const newInventory = { ...inventory };
      items.forEach(item => {
          if (item.id && item.count > 0) {
              newInventory[item.id] = (newInventory[item.id] || 0) + item.count;
          }
      });
      setInventory(newInventory);
  };

  // Debug Modifiers
  const updateGold = (newGold: number) => setGold(newGold);
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
              ...(prev[characterId] || {
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
                  accept_sexual_slavery: 0
              }),
              [unlockKey]: value
          }
      }));
  };

  const updateCharacterUnlocks = (characterId: string, unlocks: Partial<CharacterUnlocks>) => {
      setCharacterUnlocks(prev => ({
          ...prev,
          [characterId]: {
              ...(prev[characterId] || {
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
                  accept_sexual_slavery: 0
              }),
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
      updateGold,
      updateInventoryItem,
      updateCharacterUnlock,
      updateCharacterUnlocks,
      applyLoadedData
  };
};
