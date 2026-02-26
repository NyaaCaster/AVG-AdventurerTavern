import { useState, useEffect } from 'react';
import { 
  ManagementStats, RevenueLog, UserRecipe, SceneId, CharacterUnlocks, TavernMenuState
} from '../types';
import { 
  INITIAL_INVENTORY, INITIAL_SCENE_LEVELS, 
  INITIAL_CHARACTER_LEVEL, INITIAL_CHARACTER_AFFINITY, INITIAL_MANAGEMENT_STATS, INITIAL_GOLD,
  INITIAL_CHARACTER_UNLOCKS, MAX_GOLD
} from '../utils/gameConstants';
import { calculateRoomPrice, calculateMaxOccupancy } from '../data/facilityData';

export const useCoreState = (initialSaveData?: any) => {
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  const [gold, setGold] = useState<number>(INITIAL_GOLD); 
  const [sceneLevels, setSceneLevels] = useState<Record<string, number>>(INITIAL_SCENE_LEVELS);
  
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [foodStock, setFoodStock] = useState<Record<string, number>>({});
  const [tavernMenu, setTavernMenu] = useState<TavernMenuState>({ foods: [], drinks: [] });
  
  const [characterStats, setCharacterStats] = useState<Record<string, { level: number; affinity: number }>>(() => {
    const initialStats: Record<string, { level: number; affinity: number }> = {};
    Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
      initialStats[charId] = {
        level: INITIAL_CHARACTER_LEVEL[charId],
        affinity: INITIAL_CHARACTER_AFFINITY[charId]
      };
    });
    return initialStats;
  });
  const [characterUnlocks, setCharacterUnlocks] = useState<Record<string, CharacterUnlocks>>({});
  const [managementStats, setManagementStats] = useState<ManagementStats>(() => {
    const innLevel = INITIAL_SCENE_LEVELS['scen_1'] || 1;
    const roomLevel = INITIAL_SCENE_LEVELS['scen_2'] || 1;
    return {
      ...INITIAL_MANAGEMENT_STATS,
      roomPrice: calculateRoomPrice(innLevel),
      maxOccupancy: calculateMaxOccupancy(roomLevel)
    };
  });
  const [revenueLogs, setRevenueLogs] = useState<RevenueLog[]>([]);

  useEffect(() => {
      if (initialSaveData) {
          applyLoadedData(initialSaveData);
      }
  }, [initialSaveData]);

  useEffect(() => {
      const initialUnlocks: Record<string, CharacterUnlocks> = {};
      
      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
          const charSpecificUnlocks = INITIAL_CHARACTER_UNLOCKS[charId] || {};
          
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
              ...charSpecificUnlocks
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
      if (data.tavernMenu) setTavernMenu(data.tavernMenu);
  };

  const handleUpdateTavernMenu = (type: 'foods' | 'drinks', index: number, itemId: string | null) => {
      setTavernMenu(prev => {
          const newList = [...prev[type]];
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

  const handleShopTransaction = (changes: { goldChange: number; inventoryChanges: Record<string, number> }) => {
      const { goldChange, inventoryChanges } = changes;
      setGold(prev => Math.min(MAX_GOLD, Math.max(0, prev + goldChange)));
      setInventory(prev => {
          const newInv = { ...prev };
          Object.entries(inventoryChanges).forEach(([itemId, count]) => {
              if (count <= 0) {
                  delete newInv[itemId];
              } else {
                  newInv[itemId] = count;
              }
          });
          return newInv;
      });
  };

  const updateGold = (newGold: number) => setGold(Math.min(MAX_GOLD, Math.max(0, newGold)));
  const updateInventoryItem = (itemId: string, newCount: number) => {
      setInventory(prev => ({ ...prev, [itemId]: newCount }));
  };

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
      applyLoadedData,
      tavernMenu, setTavernMenu,
      handleUpdateTavernMenu,
      handleClearTavernMenu,
      handleTavernSales,
      handleShopTransaction
  };
};

