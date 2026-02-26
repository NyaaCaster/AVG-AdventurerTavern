
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

export const useCoreState = (initialSaveData?: any) =&gt; {
  const [inventory, setInventory] = useState&lt;Record&lt;string, number&gt;&gt;(INITIAL_INVENTORY);
  const [gold, setGold] = useState&lt;number&gt;(INITIAL_GOLD); 
  const [sceneLevels, setSceneLevels] = useState&lt;Record&lt;string, number&gt;&gt;(INITIAL_SCENE_LEVELS);
  
  const [userRecipes, setUserRecipes] = useState&lt;UserRecipe[]&gt;([]);
  const [foodStock, setFoodStock] = useState&lt;Record&lt;string, number&gt;&gt;({});
  const [tavernMenu, setTavernMenu] = useState&lt;TavernMenuState&gt;({ foods: [], drinks: [] });
  
  const [characterStats, setCharacterStats] = useState&lt;Record&lt;string, { level: number; affinity: number }&gt;&gt;(() =&gt; {
    const initialStats: Record&lt;string, { level: number; affinity: number }&gt; = {};
    Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId =&gt; {
      initialStats[charId] = {
        level: INITIAL_CHARACTER_LEVEL[charId],
        affinity: INITIAL_CHARACTER_AFFINITY[charId]
      };
    });
    return initialStats;
  });
  const [characterUnlocks, setCharacterUnlocks] = useState&lt;Record&lt;string, CharacterUnlocks&gt;&gt;({});
  const [managementStats, setManagementStats] = useState&lt;ManagementStats&gt;(() =&gt; {
    const innLevel = INITIAL_SCENE_LEVELS['scen_1'] || 1;
    const roomLevel = INITIAL_SCENE_LEVELS['scen_2'] || 1;
    return {
      ...INITIAL_MANAGEMENT_STATS,
      roomPrice: calculateRoomPrice(innLevel),
      maxOccupancy: calculateMaxOccupancy(roomLevel)
    };
  });
  const [revenueLogs, setRevenueLogs] = useState&lt;RevenueLog[]&gt;([]);

  useEffect(() =&gt; {
      if (initialSaveData) {
          applyLoadedData(initialSaveData);
      }
  }, [initialSaveData]);

  useEffect(() =&gt; {
      const initialUnlocks: Record&lt;string, CharacterUnlocks&gt; = {};
      
      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId =&gt; {
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

  const applyLoadedData = (data: any) =&gt; {
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

  const handleUpdateTavernMenu = (type: 'foods' | 'drinks', index: number, itemId: string | null) =&gt; {
      setTavernMenu(prev =&gt; {
          const newList = [...prev[type]];
          while (newList.length &lt;= index) newList.push(null);
          newList[index] = itemId;
          return { ...prev, [type]: newList };
      });
  };

  const handleClearTavernMenu = () =&gt; {
      setTavernMenu({ foods: [], drinks: [] });
  };

  const handleTavernSales = (earnedGold: number, foodSold: Record&lt;string, number&gt;, drinksSold: Record&lt;string, number&gt;) =&gt; {
      if (earnedGold &gt; 0) {
          setGold(prev =&gt; Math.min(MAX_GOLD, prev + earnedGold));
      }

      if (Object.keys(foodSold).length &gt; 0) {
          setFoodStock(prev =&gt; {
              const next = { ...prev };
              Object.entries(foodSold).forEach(([id, count]) =&gt; {
                  next[id] = Math.max(0, (next[id] || 0) - count);
              });
              return next;
          });
      }

      if (Object.keys(drinksSold).length &gt; 0) {
          setInventory(prev =&gt; {
              const next = { ...prev };
              Object.entries(drinksSold).forEach(([id, count]) =&gt; {
                  next[id] = Math.max(0, (next[id] || 0) - count);
              });
              return next;
          });
      }
  };

  const handleManagementAction = (cost: number, changes: Partial&lt;ManagementStats&gt;) =&gt; {
      if (gold &lt; cost) return;
      setGold(prev =&gt; prev - cost);
      
      setManagementStats(prev =&gt; {
          let newStats = { ...prev };
          if (changes.satisfaction !== undefined) newStats.satisfaction = Math.max(0, Math.min(100, prev.satisfaction + changes.satisfaction));
          if (changes.attraction !== undefined) newStats.attraction = Math.max(0, Math.min(100, prev.attraction + changes.attraction));
          if (changes.reputation !== undefined) newStats.reputation = Math.max(0, Math.min(100, prev.reputation + changes.reputation));
          return newStats;
      });
  };

  const handleUpgradeFacility = (facilityId: SceneId, costGold: number, costMatIds: string[], costMatCount: number) =&gt; {
      if (gold &lt; costGold) return;
      for (const matId of costMatIds) {
          if ((inventory[matId] || 0) &lt; costMatCount) return;
      }

      setGold(prev =&gt; prev - costGold);
      setInventory(prev =&gt; {
          const newInv = { ...prev };
          for (const matId of costMatIds) {
              newInv[matId] = (newInv[matId] || 0) - costMatCount;
          }
          return newInv;
      });

      setSceneLevels(prev =&gt; {
          const newLevels = { ...prev };
          const newLevel = (newLevels[facilityId] || 0) + 1;
          newLevels[facilityId] = newLevel;
          
          if (facilityId === 'scen_1') {
              setManagementStats(prevStats =&gt; ({
                  ...prevStats,
                  roomPrice: calculateRoomPrice(newLevel)
              }));
          } else if (facilityId === 'scen_2') {
              setManagementStats(prevStats =&gt; ({
                  ...prevStats,
                  maxOccupancy: calculateMaxOccupancy(newLevel)
              }));
          }
          
          return newLevels;
      });
  };

  const handleAddRecipe = (newRecipe: UserRecipe) =&gt; {
      setUserRecipes(prev =&gt; [newRecipe, ...prev]);
      setFoodStock(prev =&gt; ({
          ...prev,
          [newRecipe.id]: (prev[newRecipe.id] || 0) + 1
      }));
  };

  const handleConsumeIngredients = (items: {id: string, count: number}[]) =&gt; {
      setInventory(prev =&gt; {
          const newInv = { ...prev };
          items.forEach(item =&gt; {
              newInv[item.id] = Math.max(0, (newInv[item.id] || 0) - item.count);
          });
          return newInv;
      });
  };

  const handleCraftRecipe = (recipeId: string, count: number, ingredients: {id: string, count: number}[]) =&gt; {
      handleConsumeIngredients(ingredients);
      setFoodStock(prev =&gt; ({
          ...prev,
          [recipeId]: (prev[recipeId] || 0) + count
      }));
  };

  const handleDeleteRecipe = (recipeId: string) =&gt; {
      setUserRecipes(prev =&gt; prev.filter(r =&gt; r.id !== recipeId));
  };

  const handleRenameRecipe = (recipeId: string, newName: string) =&gt; {
      setUserRecipes(prev =&gt; prev.map(r =&gt; r.id === recipeId ? { ...r, name: newName } : r));
  };

  const handleAddItems = (items: { id: string; count: number }[]) =&gt; {
      const newInventory = { ...inventory };
      items.forEach(item =&gt; {
          if (item.id &amp;&amp; item.count &gt; 0) {
              newInventory[item.id] = (newInventory[item.id] || 0) + item.count;
          }
      });
      setInventory(newInventory);
  };

  const handleShopTransaction = (changes: { goldChange: number; inventoryChanges: Record&lt;string, number&gt; }) =&gt; {
      const { goldChange, inventoryChanges } = changes;
      setGold(prev =&gt; Math.min(MAX_GOLD, Math.max(0, prev + goldChange)));
      setInventory(prev =&gt; {
          const newInv = { ...prev };
          Object.entries(inventoryChanges).forEach(([itemId, count]) =&gt; {
              if (count &lt;= 0) {
                  delete newInv[itemId];
              } else {
                  newInv[itemId] = count;
              }
          });
          return newInv;
      });
  };

  const updateGold = (newGold: number) =&gt; setGold(Math.min(MAX_GOLD, Math.max(0, newGold)));
  const updateInventoryItem = (itemId: string, newCount: number) =&gt; {
      setInventory(prev =&gt; ({ ...prev, [itemId]: newCount }));
  };

  const updateCharacterUnlock = (
      characterId: string,
      unlockKey: keyof CharacterUnlocks,
      value: 0 | 1
  ) =&gt; {
      setCharacterUnlocks(prev =&gt; ({
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

  const updateCharacterUnlocks = (characterId: string, unlocks: Partial&lt;CharacterUnlocks&gt;) =&gt; {
      setCharacterUnlocks(prev =&gt; ({
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
