
import { useState, useEffect } from 'react';
import { 
    ManagementStats, RevenueLog, UserRecipe, SceneId 
} from '../types';
import { 
    INITIAL_INVENTORY, INITIAL_SCENE_LEVELS, 
    INITIAL_CHARACTER_STATS, INITIAL_MANAGEMENT_STATS 
} from '../utils/gameConstants';

export const useCoreState = (initialSaveData?: any) => {
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  const [gold, setGold] = useState<number>(3000); 
  const [sceneLevels, setSceneLevels] = useState<Record<string, number>>(INITIAL_SCENE_LEVELS);
  
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [foodStock, setFoodStock] = useState<Record<string, number>>({});
  
  const [characterStats, setCharacterStats] = useState<Record<string, { level: number; affinity: number }>>(INITIAL_CHARACTER_STATS);
  const [managementStats, setManagementStats] = useState<ManagementStats>(INITIAL_MANAGEMENT_STATS);
  const [revenueLogs, setRevenueLogs] = useState<RevenueLog[]>([]);

  // Apply loaded data
  useEffect(() => {
      if (initialSaveData) {
          applyLoadedData(initialSaveData);
      }
  }, [initialSaveData]);

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
          newLevels[facilityId] = (newLevels[facilityId] || 0) + 1;
          return newLevels;
      });

      // Update related stats
      if (facilityId === 'scen_1') {
          setManagementStats(prev => ({
              ...prev,
              roomPrice: 50 + ((sceneLevels['scen_1'] || 1) + 1 - 1) * 10 
          }));
      } else if (facilityId === 'scen_2') {
          setManagementStats(prev => ({
              ...prev,
              maxOccupancy: 20 + ((sceneLevels['scen_2'] || 1) + 1 - 1) * 5
          }));
      }
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

  return {
      inventory, setInventory,
      gold, setGold,
      sceneLevels, setSceneLevels,
      userRecipes, setUserRecipes,
      foodStock, setFoodStock,
      characterStats, setCharacterStats,
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
      applyLoadedData
  };
};
