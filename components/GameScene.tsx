import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { getSceneBackground } from '../utils/sceneUtils';
import { calculateCharacterLocations } from '../utils/gameLogic';
import { saveGame, loadGame, deleteGame, syncChatSlot, updateCharacterUnlocks } from '../services/db'; 

import DialogueBox from './DialogueBox'; 
import DialogueLogModal from './DialogueLogModal';
import DebugLogModal from './DebugLogModal';
import GameEnvironmentWidget from './GameEnvironmentWidget';
import SystemMenu from './SystemMenu';
import ChatInterface from './ChatInterface';
import InventoryModal from './InventoryModal';
import ManagementModal from './ManagementModal';
import ExpansionModal from './ExpansionModal'; 
import CookingModal from './CookingModal'; 
import TavernMenuModal from './TavernMenuModal';
import ShopItemModal from './ShopItemModal';
import DebugMenu from './DebugMenu';
import DebugSchedulesModal from './DebugSchedulesModal';
import DebugResourceModal from './DebugResourceModal';
import DebugUnlocksModal from './DebugUnlocksModal';
import SaveLoadModal from './SaveLoadModal'; 
import ItemToast from './ItemToast'; 
import AffinityToast from './AffinityToast'; 
import { CHARACTERS } from '../data/scenarioData';
import { ITEMS } from '../data/items';
import { getResValue } from '../data/item-value-table';
import { GameSettings, ConfigTab, RevenueLog, RevenueType, SceneId } from '../types';
import { SCENE_NAMES } from '../utils/gameConstants';
import { getCharacterSprite } from '../utils/gameLogic';

import Scen1 from './scenes/scen_1';
import Scen2 from './scenes/scen_2';
import Scen3 from './scenes/scen_3';
import Scen4 from './scenes/scen_4';
import Scen5 from './scenes/scen_5';
import Scen6 from './scenes/scen_6';
import Scen7 from './scenes/scen_7';
import Scen8 from './scenes/scen_8';
import Scen9 from './scenes/scen_9';
import Scen10 from './scenes/scen_10';

import { useCoreState } from '../hooks/useCoreState';
import { useWorldSystem } from '../hooks/useWorldSystem';
import { useGameAudio } from '../hooks/useGameAudio';
import { useDialogueSystem } from '../hooks/useDialogueSystem';

interface GameSceneProps {
  userId: number; 
  currentSlotId: number;
  onBackToMenu: () => void;
  onOpenSettings: (tab?: ConfigTab) => void;
  onSettingsChange: (newSettings: GameSettings) => void; 
  settings: GameSettings;
  onLoadGame?: () => void;
  initialSaveData?: any; 
}

export interface GameSceneRef {
    saveGame: (slotId: number) => Promise<void>;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

const GameScene = React.forwardRef<GameSceneRef, GameSceneProps>(({ userId, currentSlotId, onBackToMenu, onOpenSettings, onSettingsChange, settings, initialSaveData }, ref) => {
  // --- Hooks ---
  const core = useCoreState(initialSaveData);
  const world = useWorldSystem(core.sceneLevels, initialSaveData);
  const audioRef = useGameAudio(world.currentSceneId, settings);
  
  // --- UI Local State ---
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isExpansionOpen, setIsExpansionOpen] = useState(false); 
  const [isCookingOpen, setIsCookingOpen] = useState(false);
  const [isTavernMenuOpen, setIsTavernMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState<'buy' | 'sell'>('buy');
  
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load'>('load');
  
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isScheduleViewerOpen, setIsScheduleViewerOpen] = useState(false);
  const [isResourceDebugOpen, setIsResourceDebugOpen] = useState(false);
  const [isUnlocksDebugOpen, setIsUnlocksDebugOpen] = useState(false);
  
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [itemNotifications, setItemNotifications] = useState<{id: string, itemId: string, count: number}[]>([]);
  const [affinityNotifications, setAffinityNotifications] = useState<{id: string, charId: string, change: number}[]>([]);
  const [moveNotification, setMoveNotification] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');

  // --- Dialogue System Setup ---
  const handleItemsGained = (items: { id: string; count: number }[]) => {
      core.handleAddItems(items);
      const newNotifications = items.map(item => ({
          id: Date.now() + Math.random().toString(),
          itemId: item.id,
          count: item.count
      }));
      setItemNotifications(prev => [...prev, ...newNotifications]);
  };

  const handleCharacterMove = (charId: string, targetId: string) => {
      if (SCENE_NAMES[targetId as any]) {
          const charName = CHARACTERS[charId]?.name || '瑙掕壊';
          const targetName = SCENE_NAMES[targetId as any];
          setMoveNotification(`${charName} 灏嗗墠寰€ ${targetName}`);
          setTimeout(() => setMoveNotification(null), 4000);
          
          // Apply forced location immediately logic is handled in final close or effect
          // Here we set a pending state, but useWorldSystem handles forcedLocations.
          // Since the prompt requires movement, we set it directly in the hook
          world.setForcedLocations(prev => ({ ...prev, [charId]: targetId }));
      }
  };

  const handleAffinityChange = (charId: string, change: number) => {
      if (change === 0) return;
      
      // Update character stats
      core.setCharacterStats(prev => {
          const current = prev[charId] || { level: 1, affinity: 0 };
          const newAffinity = Math.max(0, Math.min(100, current.affinity + change));
          return {
              ...prev,
              [charId]: { ...current, affinity: newAffinity }
          };
      });

      // Show notification
      const newNotification = {
          id: Date.now() + Math.random().toString(),
          charId,
          change
      };
      setAffinityNotifications(prev => [...prev, newNotification]);
  };

  const handleUnlockUpdate = (charId: string, unlockKey: keyof import('../types').CharacterUnlocks) => {
      console.log(`[GameScene] Updating unlock for ${charId}: ${unlockKey}`);
      core.updateCharacterUnlock(charId, unlockKey, 1);
  };

  const dialogue = useDialogueSystem({
      settings,
      worldState: world.worldState,
      characterStats: core.characterStats,
      characterUnlocks: core.characterUnlocks,
      userId,
      currentSlotId,
      onItemsGained: handleItemsGained,
      onCharacterMove: handleCharacterMove,
      onAffinityChange: handleAffinityChange,
      onUnlockUpdate: handleUnlockUpdate
  });

  // --- Game Loop: Revenue & Time ---
  const lastSettlementHourRef = useRef<number | null>(null);

  useEffect(() => {
      const currentHour = parseInt(world.worldState.timeStr.split(':')[0]);
      
      if (lastSettlementHourRef.current !== currentHour) {
          const stats = core.managementStats;
          // Recalculate Occupancy
          const calculatedOccupancy = Math.floor(
             stats.maxOccupancy * (stats.attraction / 100) * (stats.satisfaction / 100)
          );
          const newOccupancy = Math.max(0, Math.min(stats.maxOccupancy, calculatedOccupancy));
          
          core.setManagementStats(prev => ({ ...prev, occupancy: newOccupancy }));

          // 1. 浣忓缁撶畻 (8, 12, 20鐐?
          const accomHours = [8, 12, 20];
          if (accomHours.includes(currentHour)) {
              const amount = Math.floor(newOccupancy * stats.roomPrice * (stats.satisfaction / 100) * (stats.reputation / 100));
              if (amount > 0) {
                  core.setGold(g => g + amount);
                  const newLog: RevenueLog = {
                      id: `log-${Date.now()}-accom`,
                      timestamp: Date.now(),
                      dateStr: world.worldState.dateStr,
                      timeStr: `${currentHour.toString().padStart(2, '0')}:00`,
                      type: 'accommodation',
                      amount
                  };
                  core.setRevenueLogs(prev => [newLog, ...prev].slice(0, 100));
              }
          }

          // 2. 閰掑満姣忓皬鏃剁粨绠?(鍌嶆櫄鍜屽鏅?
          if (world.worldState.period === 'evening' || world.worldState.period === 'night') {
              let totalTavernRevenue = 0;
              const soldFoods: Record<string, number> = {};
              const soldDrinks: Record<string, number> = {};
              
              // 浣跨敤涓存椂搴撳瓨閬垮厤瓒呭崠
              const tempFoodStock = { ...core.foodStock };
              const tempDrinkStock = { ...core.inventory };

              // 閿€鍞熀鏁帮細鍙楅泦瀹㈠姏褰卞搷 (0~5浠?灏忔椂)
              const baseSalesVolume = Math.max(1, Math.floor(5 * (stats.attraction / 100)));

              // 澶勭悊椁愮偣閿€鍞?              core.tavernMenu.foods.forEach(recipeId => {
                  if (!recipeId) return;
                  const stock = tempFoodStock[recipeId] || 0;
                  if (stock <= 0) return;

                  const recipe = core.userRecipes.find(r => r.id === recipeId);
                  if (!recipe) return;

                  // 闅忔満閿€閲?                  const sales = Math.min(stock, Math.floor(Math.random() * baseSalesVolume) + 1);
                  if (sales > 0) {
                      soldFoods[recipeId] = (soldFoods[recipeId] || 0) + sales;
                      tempFoodStock[recipeId] -= sales;
                      totalTavernRevenue += sales * recipe.price;
                  }
              });

              // 澶勭悊閰掓按閿€鍞?              core.tavernMenu.drinks.forEach(itemId => {
                  if (!itemId) return;
                  const stock = tempDrinkStock[itemId] || 0;
                  if (stock <= 0) return;

                  const item = ITEMS[itemId];
                  if (!item) return;

                  // 闅忔満閿€閲?                  const sales = Math.min(stock, Math.floor(Math.random() * baseSalesVolume) + 1);
                  if (sales > 0) {
                      soldDrinks[itemId] = (soldDrinks[itemId] || 0) + sales;
                      tempDrinkStock[itemId] -= sales;
                      // 閰掓按鍞环锛氬熀鍑嗕环鍊?                      totalTavernRevenue += sales * getResValue(item.star);
                  }
              });

              if (totalTavernRevenue > 0) {
                  core.handleTavernSales(totalTavernRevenue, soldFoods, soldDrinks);
                  const newLog: RevenueLog = {
                      id: `log-${Date.now()}-tavern`,
                      timestamp: Date.now(),
                      dateStr: world.worldState.dateStr,
                      timeStr: `${currentHour.toString().padStart(2, '0')}:00`,
                      type: 'tavern',
                      amount: totalTavernRevenue
                  };
                  core.setRevenueLogs(prev => [newLog, ...prev].slice(0, 100));
              }
          }
          lastSettlementHourRef.current = currentHour;
      }
  }, [world.worldState.timeStr]);

  // --- Initial Revenue Logs (Dummy Data) ---
  useEffect(() => {
      if (initialSaveData) return;
      // Only generate if empty
      if (core.revenueLogs.length > 0) return;

      const initialLogs: RevenueLog[] = [];
      const now = new Date();
      
      // Use actual initial stats from managementStats state
      const stats = core.managementStats;
      
      for (let i = 2; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getMonth() + 1}鏈?{date.getDate()}鏃;
          
          const events = [
              { hour: 6, type: 'tavern' as const },
              { hour: 8, type: 'accommodation' as const },
              { hour: 12, type: 'accommodation' as const },
              { hour: 20, type: 'accommodation' as const }
          ];

          events.forEach(event => {
              if (i === 0 && event.hour > now.getHours()) return;
              let amount = 0;
              if (event.type === 'accommodation') {
                  const occ = Math.floor(stats.occupancy * (0.8 + Math.random() * 0.4)); 
                  amount = Math.floor(occ * stats.roomPrice * (stats.satisfaction / 100) * (stats.reputation / 100));
              } else {
                  amount = Math.floor(1000 * (stats.attraction / 100) * (0.8 + Math.random() * 0.5));
              }
              initialLogs.push({
                  id: `log-${date.getTime()}-${event.hour}`,
                  timestamp: date.setHours(event.hour, 0, 0, 0),
                  dateStr,
                  timeStr: `${event.hour.toString().padStart(2, '0')}:00`,
                  type: event.type,
                  amount
              });
          });
      }
      core.setRevenueLogs(initialLogs.reverse()); 
  }, [initialSaveData, core.managementStats]); // Run once on mount if no initial data

  // --- Connection Status Check ---
  useEffect(() => {
     setConnectionStatus(!settings.apiConfig.apiKey ? 'disconnected' : 'connected');
  }, [settings.apiConfig]);

  // --- Ambient Logic ---
  const lastAmbientSceneRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Handle Scene Transition (Reset)
    if (world.isSceneTransitioning) {
        dialogue.setAmbientCharacter(null);
        dialogue.setAmbientText('');
        dialogue.setIsAmbientSleeping(false);
        dialogue.setIsAmbientBathing(false);
        dialogue.setShowAmbientDialogue(false);
        lastAmbientSceneRef.current = null;
        return;
    }

    // 2. Handle Dialogue Mode (Pause)
    if (dialogue.isDialogueMode) {
        return;
    }

    // 3. Check if already initialized for this scene visit
    // If we are in the same scene and have initialized, restore visibility if needed but don't re-roll
    if (lastAmbientSceneRef.current === world.currentSceneId) {
        if (!dialogue.showAmbientDialogue) dialogue.setShowAmbientDialogue(true);
        return;
    }

    // 4. Initialize for new scene entry
    lastAmbientSceneRef.current = world.currentSceneId;
    dialogue.setShowAmbientDialogue(true);

    const findCharacterForScene = () => {
        if (world.currentSceneId === 'scen_2' && world.sceneParams?.target && world.sceneParams.target !== 'user') {
            const target = CHARACTERS[world.sceneParams.target];
            // [瑙掕壊绉诲姩绯荤粺] 妫€鏌ヨ鑹叉槸鍚︾湡鐨勫湪杩欎釜鍦烘櫙
            const actualLocation = world.forcedLocations[target.id] || world.characterLocations[target.id];
            if (actualLocation === 'scen_2') {
                return target;
            }
            return null;
        }

        if (world.presentCharacters.length > 0) {
            if (world.currentSceneId === 'scen_3') {
                const mina = world.presentCharacters.find(c => c.id === 'char_102');
                if (mina) {
                    // [瑙掕壊绉诲姩绯荤粺] 纭 Mina 鐪熺殑鍦ㄩ厭鍦?                    const actualLocation = world.forcedLocations[mina.id] || world.characterLocations[mina.id];
                    if (actualLocation === 'scen_3') return mina;
                }
            }
            // [瑙掕壊绉诲姩绯荤粺] 杩囨护鎺夊凡缁忕Щ鍔ㄨ蛋鐨勮鑹?            const actuallyPresentChars = world.presentCharacters.filter(c => {
                const actualLocation = world.forcedLocations[c.id] || world.characterLocations[c.id];
                return actualLocation === world.currentSceneId;
            });
            
            if (actuallyPresentChars.length === 0) return null;
            
            const randomIndex = Math.floor(Math.random() * actuallyPresentChars.length);
            return actuallyPresentChars[randomIndex];
        }
        return null;
    };

    const char = findCharacterForScene();
    
    if (char) {
        dialogue.setAmbientCharacter(char);
        const isSleeping = world.currentSceneId === 'scen_2' && world.worldState.period === 'night';
        const isBathing = world.currentSceneId === 'scen_7';

        dialogue.setIsAmbientSleeping(isSleeping);
        dialogue.setIsAmbientBathing(isBathing);

        if (isSleeping) {
            dialogue.setAmbientText("zzz鈥︹€ZZ鈥︹€?);
            dialogue.setCurrentSprite(''); 
        } else {
            const ambientState = isBathing ? 'nude' : 'default';
            const sprite = getCharacterSprite(char, ambientState, 'normal');
            dialogue.setCurrentSprite(sprite);
            
            if (world.currentSceneId === 'scen_3' && char.id !== 'char_102') {
                dialogue.setAmbientText('');
            } else {
                dialogue.generateAmbientLine(char, ambientState, world.currentSceneId);
            }
        }
    } else {
        dialogue.setAmbientCharacter(null);
        dialogue.setAmbientText('');
        dialogue.setShowAmbientDialogue(false);
    }
  }, [world.currentSceneId, world.isSceneTransitioning, dialogue.isDialogueMode]);

  // --- Actions ---
  const handleAction = (action: string, param?: any) => {
    console.log(`Action triggered: ${action}`, param);
    if (action === 'cook') {
        setIsCookingOpen(true);
    } else if (action === 'buy_item') {
        setShopInitialTab('buy');
        setIsShopOpen(true);
    } else if (action === 'sell_item') {
        setShopInitialTab('sell');
        setIsShopOpen(true);
    }
  };

  const handleSaveGame = async (slotId: number) => {
      const label = `${world.worldState.dateStr} ${world.worldState.timeStr} - ${world.worldState.sceneName}`;
      
      // 淇濆瓨娓告垙鏁版嵁
      await saveGame(userId, slotId, label, {
          gold: core.gold,
          currentSceneId: world.currentSceneId,
          worldState: world.worldState,
          managementStats: core.managementStats,
          inventory: core.inventory,
          characterStats: core.characterStats,
          characterUnlocks: core.characterUnlocks,
          sceneLevels: core.sceneLevels,
          revenueLogs: core.revenueLogs,
          userRecipes: core.userRecipes,
          foodStock: core.foodStock,
          tavernMenu: core.tavernMenu,
          settings: settings
      });
      
      // 濡傛灉鏄墜鍔ㄥ瓨妗ｏ紙slotId 1-3锛夛紝鍚屾鑱婂ぉ璁板繂
      if (slotId >= 1 && slotId <= 3) {
          console.log(`[AI Memory] Syncing chat memory from slot 0 to slot ${slotId}`);
          await syncChatSlot(userId, 0, slotId);
      }
  };

  const handleLoadGame = async (slotId: number) => {
      const data = await loadGame(userId, slotId);
      if (data) {
          core.applyLoadedData(data);
          // Restore world state
          world.setCurrentSceneId(data.currentSceneId);
          world.setWorldState(data.worldState);
          world.setForcedLocations({});
          // 绔嬪嵆鏇存柊瑙掕壊浣嶇疆锛岀‘淇漰resentCharacters璁＄畻姝ｇ‘
          const locs = calculateCharacterLocations(data.worldState.period, data.worldState.dateStr, data.worldState.timeStr, core.sceneLevels);
          world.setCharacterLocations(locs);
          // Restore settings
          if (data.settings && onSettingsChange) {
              onSettingsChange(data.settings);
          }
          
          // 鐢ㄥ瓨妗ｇ殑瑙ｉ攣鐘舵€佽鐩栨暟鎹簱
          if (data.characterUnlocks) {
              for (const [characterId, unlocks] of Object.entries(data.characterUnlocks)) {
                  await updateCharacterUnlocks(userId, slotId, characterId, unlocks);
              }
          }
          
          // Reset UI
          dialogue.setIsDialogueMode(false);
          dialogue.setHistory([]);
          // 閲嶇疆鐜閫昏緫鐘舵€?          dialogue.setAmbientCharacter(null);
          dialogue.setAmbientText('');
          dialogue.setShowAmbientDialogue(false);
      }
  };

  const handleDeleteSave = async (slotId: number) => {
      await deleteGame(userId, slotId);
  };

  useImperativeHandle(ref, () => ({
      saveGame: handleSaveGame
  }));

  // Auto-Save
  useEffect(() => {
      const autoSaveInterval = setInterval(() => {
          if (!dialogue.isDialogueMode && !world.isSceneTransitioning) {
              handleSaveGame(0);
          }
      }, 60000 * 5); 
      return () => clearInterval(autoSaveInterval);
  }, [dialogue.isDialogueMode, world.isSceneTransitioning, core.gold, world.worldState, core.inventory, userId]);

  // --- Rendering Helpers ---
  const handleOpenDebug = () => {
      setIsDebugMenuOpen(!isDebugMenuOpen);
  };

  const handleFinalCloseDialogue = () => {
      dialogue.handleFinalClose();
      
      // [瑙掕壊绉诲姩绯荤粺] 瀵硅瘽缁撴潫鍚庯紝妫€鏌ヨ鑹叉槸鍚﹀凡绉诲姩
      // 濡傛灉瑙掕壊宸茬粡绉诲姩鍒板叾浠栧満鏅紝娓呴櫎褰撳墠鍦烘櫙鐨?Ambient 鏄剧ず
      if (dialogue.activeCharacter) {
          const charId = dialogue.activeCharacter.id;
          const actualLocation = world.forcedLocations[charId] || world.characterLocations[charId];
          
          if (actualLocation !== world.currentSceneId) {
              // 瑙掕壊宸茬粡涓嶅湪褰撳墠鍦烘櫙锛屾竻闄?Ambient
              dialogue.setAmbientCharacter(null);
              dialogue.setAmbientText('');
              dialogue.setShowAmbientDialogue(false);
              console.log(`[瑙掕壊绉诲姩绯荤粺] ${dialogue.activeCharacter.name} 宸茬Щ鍔ㄥ埌 ${SCENE_NAMES[actualLocation as any] || actualLocation}锛屾竻闄ゅ綋鍓嶅満鏅殑 Ambient 鏄剧ず`);
          }
      }
      
      // 瀵硅瘽缁撴潫鏃惰Е鍙戣嚜鍔ㄥ瓨妗ｏ紙淇濆瓨瑙掕壊濂芥劅搴︾瓑鏁版嵁锛?      handleSaveGame(0).catch(err => console.error('Auto-save failed:', err));
  };

  const currentSceneLevel = core.sceneLevels[world.currentSceneId] || (['scen_5','scen_6','scen_7','scen_8'].includes(world.currentSceneId) ? 0 : 1);
  const currentBgUrl = getSceneBackground(world.currentSceneId, world.worldState.period, currentSceneLevel);
  const currentStats = dialogue.activeCharacter ? (core.characterStats[dialogue.activeCharacter.id] || { level: 1, affinity: 0 }) : { level: 1, affinity: 0 };
  const ambientStats = dialogue.ambientCharacter ? (core.characterStats[dialogue.ambientCharacter.id] || { level: 1, affinity: 0 }) : { level: 1, affinity: 0 };

  const renderScene = () => {
    const commonProps = {
        onNavigate: world.handleNavigate,
        onAction: handleAction,
        onEnterDialogue: dialogue.handleEnterDialogue,
        isMenuVisible: !dialogue.isDialogueMode,
        worldState: world.worldState,
        targetCharacterId: world.sceneParams.target,
        settings, 
        presentCharacters: world.presentCharacters, 
        inventory: core.inventory,
        sceneLevels: core.sceneLevels,
        characterUnlocks: core.characterUnlocks,
        userRecipes: core.userRecipes,
        foodStock: core.foodStock
    };

    switch(world.currentSceneId) {
        case 'scen_1': return <Scen1 {...commonProps} onOpenManagement={() => setIsManagementOpen(true)} onOpenExpansion={() => setIsExpansionOpen(true)} />;
        case 'scen_2': return <Scen2 {...commonProps} />;
        case 'scen_3': return <Scen3 {...commonProps} onOpenTavernMenu={() => setIsTavernMenuOpen(true)} />;
        case 'scen_4': return <Scen4 {...commonProps} />;
        case 'scen_5': return <Scen5 {...commonProps} />;
        case 'scen_6': return <Scen6 {...commonProps} />;
        case 'scen_7': return <Scen7 {...commonProps} />;
        case 'scen_8': return <Scen8 {...commonProps} />;
        case 'scen_9': return <Scen9 {...commonProps} />;
        case 'scen_10': return <Scen10 {...commonProps} />;
        default: return <Scen1 {...commonProps} />;
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" onClick={() => { if (isUIHidden) setIsUIHidden(false); }}>
      <audio ref={audioRef} loop className="hidden" />

      <div className="absolute inset-0 bg-black z-[80] pointer-events-none transition-opacity ease-in-out duration-500" style={{ opacity: world.transitionOpacity }} />

      <div className="absolute inset-0 z-0">
        <img src={resolveImgPath(currentBgUrl)} alt="BG" className="w-full h-full object-cover transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10" />
      </div>

      <div className={`absolute inset-0 z-10 flex items-end justify-center pointer-events-none transition-all duration-500 ${dialogue.isDialogueMode ? '-translate-y-[2%] opacity-100' : 'translate-y-10 opacity-0'}`}>
         {dialogue.isDialogueMode && dialogue.currentSprite && (
            <img src={resolveImgPath(dialogue.currentSprite)} alt="Sprite" className="h-[100%] md:h-[95%] object-contain drop-shadow-2xl" />
         )}
      </div>

      <div className={`absolute inset-0 z-10 flex items-end pointer-events-none transition-all duration-700 ${(!dialogue.isDialogueMode && dialogue.ambientCharacter && !dialogue.isAmbientSleeping && !dialogue.isAmbientBathing) ? 'opacity-100' : 'opacity-0'}`}>
         {dialogue.ambientCharacter && !dialogue.isAmbientSleeping && dialogue.currentSprite && (
            <div className="relative h-[95%] w-full">
                <img src={resolveImgPath(dialogue.currentSprite)} alt="Ambient Sprite" className="absolute bottom-0 left-[30%] transform -translate-x-1/2 h-full object-contain drop-shadow-xl filter brightness-95" />
            </div>
         )}
      </div>

      <div className={`absolute inset-0 z-50 transition-opacity duration-500 pointer-events-none ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>
          <GameEnvironmentWidget worldState={world.worldState} gold={core.gold} />

          <div className="absolute bottom-[200px] left-4 flex flex-col gap-2 z-[70] pointer-events-none">
              {itemNotifications.map(notification => (
                  <ItemToast 
                      key={notification.id}
                      itemId={notification.itemId}
                      count={notification.count}
                      onComplete={() => setItemNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  />
              ))}
              {affinityNotifications.map(notification => (
                  <AffinityToast 
                      key={notification.id}
                      change={notification.change}
                      characterName={CHARACTERS[notification.charId]?.name || '瑙掕壊'}
                      onComplete={() => setAffinityNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  />
              ))}
          </div>

          {moveNotification && (
              <div className="absolute bottom-[300px] left-4 z-[70] animate-fadeIn pointer-events-none">
                  <div className="bg-indigo-900/90 border-l-4 border-indigo-400 text-indigo-100 px-6 py-3 rounded-r shadow-2xl flex items-center gap-3 backdrop-blur-md">
                      <i className="fa-solid fa-shoe-prints text-indigo-300"></i>
                      <span className="font-bold tracking-wider text-sm">{moveNotification}</span>
                  </div>
              </div>
          )}

          {dialogue.errorMessage && (
            <div onClick={() => dialogue.setErrorMessage(null)} className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-red-900/90 border border-red-500/50 text-red-100 px-6 py-4 rounded pointer-events-auto cursor-pointer">
                {dialogue.errorMessage}
            </div>
          )}

          <SystemMenu 
            onLoadGame={() => { setIsSaveLoadOpen(true); setSaveLoadMode('load'); }} 
            onSaveGame={() => { setIsSaveLoadOpen(true); setSaveLoadMode('save'); }}
            onOpenSettings={onOpenSettings} 
            onBackToMenu={onBackToMenu} 
            onDebug={handleOpenDebug}
            showDebug={settings.enableDebug}
          />

          <DebugMenu
            isOpen={isDebugMenuOpen}
            onClose={() => setIsDebugMenuOpen(false)}
            onOpenSchedules={() => setIsScheduleViewerOpen(true)}
            onOpenResources={() => setIsResourceDebugOpen(true)}
            onOpenUnlocks={() => setIsUnlocksDebugOpen(true)}
          />

          <DebugSchedulesModal
            isOpen={isScheduleViewerOpen}
            onClose={() => setIsScheduleViewerOpen(false)}
            periodLabel={world.worldState.periodLabel}
            characterLocations={world.characterLocations}
          />

          <DebugResourceModal
            isOpen={isResourceDebugOpen}
            onClose={() => setIsResourceDebugOpen(false)}
            gold={core.gold}
            inventory={core.inventory}
            onUpdateGold={core.updateGold}
            onUpdateInventory={core.updateInventoryItem}
          />

          <DebugUnlocksModal
            isOpen={isUnlocksDebugOpen}
            onClose={() => setIsUnlocksDebugOpen(false)}
            characterUnlocks={core.characterUnlocks}
            characterStats={core.characterStats}
            onUpdateCharacterAffinity={(charId, newAffinity) => {
              core.setCharacterStats(prev => {
                const current = prev[charId] || { level: 1, affinity: 0 };
                return {
                  ...prev,
                  [charId]: { ...current, affinity: newAffinity }
                };
              });
            }}
            onUpdateCharacterUnlock={core.updateCharacterUnlock}
            onSaveGame={() => handleSaveGame(0)}
          />

          <div className="pointer-events-auto">
             {renderScene()}
          </div>

          {!dialogue.isDialogueMode && dialogue.ambientCharacter && dialogue.ambientText && dialogue.showAmbientDialogue && (
              <div className="absolute bottom-4 w-full flex flex-col items-center pointer-events-auto z-40 animate-fadeIn">
                  <div className="relative w-full px-0 md:px-4 mb-2">
                      <DialogueBox 
                          speaker={dialogue.ambientCharacter.name}
                          text={dialogue.ambientText}
                          isTyping={true} 
                          typingEnabled={settings.enableTypewriter}
                          transparency={settings.dialogueTransparency}
                          onHideUI={() => setIsUIHidden(true)}
                          onClose={() => dialogue.setShowAmbientDialogue(false)} 
                          level={ambientStats.level}
                          affinity={ambientStats.affinity}
                      />
                  </div>
              </div>
          )}

          {dialogue.isDialogueMode && dialogue.activeCharacter && (
              <ChatInterface 
                 currentDialogue={dialogue.currentDialogue}
                 isTyping={dialogue.isTyping}
                 setIsTyping={dialogue.setIsTyping}
                 settings={settings}
                 onHideUI={() => setIsUIHidden(true)}
                 onShowHistory={() => setShowHistory(true)}
                 onShowDebugLog={() => setShowDebugLog(true)} 
                 inputText={dialogue.inputText}
                 setInputText={dialogue.setInputText}
                 handleSend={dialogue.handleSend}
                 handleRegenerate={dialogue.handleRegenerate}
                 handleEndDialogueGeneration={dialogue.handleEndDialogueGeneration}
                 handleFinalClose={handleFinalCloseDialogue}
                 isEnding={dialogue.isDialogueEnding}
                 isLoading={dialogue.isLoading}
                 connectionStatus={connectionStatus}
                 onOpenSettings={onOpenSettings}
                 stats={currentStats}
                 affinityChange={dialogue.lastAffinityChange}
                 sessionAffinityTotal={dialogue.sessionAffinityTotal}
                 clothingState={dialogue.clothingState}
              />
          )}
      </div>

      <DialogueLogModal isOpen={showHistory} onClose={() => setShowHistory(false)} history={dialogue.history} />
      <DebugLogModal isOpen={showDebugLog} onClose={() => setShowDebugLog(false)} logs={dialogue.debugLogs} />

      <ManagementModal isOpen={isManagementOpen} onClose={() => setIsManagementOpen(false)} stats={core.managementStats} logs={core.revenueLogs} onAction={core.handleManagementAction} currentGold={core.gold} />
      <ExpansionModal isOpen={isExpansionOpen} onClose={() => setIsExpansionOpen(false)} currentLevels={core.sceneLevels} inventory={core.inventory} gold={core.gold} onUpgrade={core.handleUpgradeFacility} />
      
      <CookingModal 
          isOpen={isCookingOpen}
          onClose={() => setIsCookingOpen(false)}
          inventory={core.inventory} 
          userRecipes={core.userRecipes}
          foodStock={core.foodStock}
          onAddRecipe={core.handleAddRecipe}
          onConsumeIngredients={core.handleConsumeIngredients}
          onCraftRecipe={core.handleCraftRecipe}
          onDeleteRecipe={core.handleDeleteRecipe}
          onRenameRecipe={core.handleRenameRecipe}
          apiConfig={settings.apiConfig}
      />

      <TavernMenuModal
          isOpen={isTavernMenuOpen}
          onClose={() => setIsTavernMenuOpen(false)}
          inventory={core.inventory}
          userRecipes={core.userRecipes}
          foodStock={core.foodStock}
          tavernLevel={core.sceneLevels['scen_3'] || 1}
          tavernMenu={core.tavernMenu}
          onUpdateMenu={core.handleUpdateTavernMenu}
      />

      <ShopItemModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          initialTab={shopInitialTab}
          inventory={core.inventory}
          currentGold={core.gold}
          onTransaction={core.handleShopTransaction}
      />

      <SaveLoadModal isOpen={isSaveLoadOpen} onClose={() => setIsSaveLoadOpen(false)} mode={saveLoadMode} userId={userId} onSave={handleSaveGame} onLoad={handleLoadGame} onDelete={handleDeleteSave} />
    </div>
  );
});

export default GameScene;


