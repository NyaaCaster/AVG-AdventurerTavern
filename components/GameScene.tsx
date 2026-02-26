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
import DebugMenu from './DebugMenu';
import DebugSchedulesModal from './DebugSchedulesModal';
import DebugResourceModal from './DebugResourceModal';
import DebugUnlocksModal from './DebugUnlocksModal';
import SaveLoadModal from './SaveLoadModal'; 
import ShopItemModal from './ShopItemModal'; // 道具商店（scen_10 使用）
import ItemToast from './ItemToast'; 
import AffinityToast from './AffinityToast'; 
import RoomCheckInToast from './RoomCheckInToast';
import { INITIAL_CHECKED_IN_CHARACTERS } from '../utils/gameConstants';
import { getEligibleCheckInCharacters } from './RoomCheckInSystem';
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
  // --- 核心 Hooks ---
  const core = useCoreState(initialSaveData);
  const [checkedInCharacters, setCheckedInCharacters] = useState<string[]>(INITIAL_CHECKED_IN_CHARACTERS);
  const world = useWorldSystem(core.sceneLevels, initialSaveData, checkedInCharacters);
  const audioRef = useGameAudio(world.currentSceneId, settings);
  
  // --- UI 本地状态 ---
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isExpansionOpen, setIsExpansionOpen] = useState(false); 
  const [isCookingOpen, setIsCookingOpen] = useState(false);
  const [isTavernMenuOpen, setIsTavernMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState<'buy' | 'sell'>('buy'); // 记录从哪个页签打开商店
  
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
  const [checkInNotifications, setCheckInNotifications] = useState<{id: string, charId: string}[]>([]);
  const [moveNotification, setMoveNotification] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');

  // --- 对话系统事件处理 ---
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
          const charName = CHARACTERS[charId]?.name || '角色';
          const targetName = SCENE_NAMES[targetId as any];
          setMoveNotification(`${charName} 将前往 ${targetName}`);
          setTimeout(() => setMoveNotification(null), 4000);
          
          // 立即写入强制位置，useWorldSystem 会在下次渲染时更新 presentCharacters
          world.setForcedLocations(prev => ({ ...prev, [charId]: targetId }));
      }
  };

  const handleAffinityChange = (charId: string, change: number) => {
      if (change === 0) return;
      
      // 更新角色好感度数值
      core.setCharacterStats(prev => {
          const current = prev[charId] || { level: 1, affinity: 0 };
          const newAffinity = Math.max(0, Math.min(100, current.affinity + change));
          return {
              ...prev,
              [charId]: { ...current, affinity: newAffinity }
          };
      });

      // 显示好感度变化通知
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

  // --- 游戏循环：收入结算与时间推进 ---
  const lastSettlementHourRef = useRef<number | null>(null);

  useEffect(() => {
      const currentHour = parseInt(world.worldState.timeStr.split(':')[0]);
      
      if (lastSettlementHourRef.current !== currentHour) {
          const stats = core.managementStats;
                    // 重新计算当前住宿人数
          const calculatedOccupancy = Math.floor(
             stats.maxOccupancy * (stats.attraction / 100) * (stats.satisfaction / 100)
          );
          const newOccupancy = Math.max(0, Math.min(stats.maxOccupancy, calculatedOccupancy));
          
          core.setManagementStats(prev => ({ ...prev, occupancy: newOccupancy }));

          // 1. 住宿结算 (8, 12, 20点)
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

          // 2. 酒场每小时结算 (傍晚和夜晚)
          if (world.worldState.period === 'evening' || world.worldState.period === 'night') {
              let totalTavernRevenue = 0;
              const soldFoods: Record<string, number> = {};
              const soldDrinks: Record<string, number> = {};
              
              // 使用临时库存避免超卖
              const tempFoodStock = { ...core.foodStock };
              const tempDrinkStock = { ...core.inventory };

              // 销售基数：受集客力影响 (0~5份/小时)
              const baseSalesVolume = Math.max(1, Math.floor(5 * (stats.attraction / 100)));

              // 处理餐点销售
              core.tavernMenu.foods.forEach(recipeId => {
                  if (!recipeId) return;
                  const stock = tempFoodStock[recipeId] || 0;
                  if (stock <= 0) return;

                  const recipe = core.userRecipes.find(r => r.id === recipeId);
                  if (!recipe) return;

                  // 随机销量
                  const sales = Math.min(stock, Math.floor(Math.random() * baseSalesVolume) + 1);
                  if (sales > 0) {
                      soldFoods[recipeId] = (soldFoods[recipeId] || 0) + sales;
                      tempFoodStock[recipeId] -= sales;
                      totalTavernRevenue += sales * recipe.price;
                  }
              });

              // 处理酒水销售
              core.tavernMenu.drinks.forEach(itemId => {
                  if (!itemId) return;
                  const stock = tempDrinkStock[itemId] || 0;
                  if (stock <= 0) return;

                  const item = ITEMS[itemId];
                  if (!item) return;

                  // 随机销量
                  const sales = Math.min(stock, Math.floor(Math.random() * baseSalesVolume) + 1);
                  if (sales > 0) {
                      soldDrinks[itemId] = (soldDrinks[itemId] || 0) + sales;
                      tempDrinkStock[itemId] -= sales;
                      // 酒水售价：基准价值
                      totalTavernRevenue += sales * getResValue(item.star);
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

  // --- 初始收入记录（仅首次启动时生成示例数据）---
  useEffect(() => {
      if (initialSaveData) return;
      // 已有记录则跳过
      if (core.revenueLogs.length > 0) return;

      const initialLogs: RevenueLog[] = [];
      const now = new Date();
      
      // 使用当前旅店属性作为基准
      const stats = core.managementStats;
      
      for (let i = 2; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
          
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
  }, [initialSaveData, core.managementStats]); // 仅在首次挂载且无存档时执行

  // --- API 连接状态检测 ---
  useEffect(() => {
     setConnectionStatus(!settings.apiConfig.apiKey ? 'disconnected' : 'connected');
  }, [settings.apiConfig]);

  // --- 环境角色逻辑（场景内随机台词）---
  const lastAmbientSceneRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. 场景切换中：重置所有环境状态
    if (world.isSceneTransitioning) {
        dialogue.setAmbientCharacter(null);
        dialogue.setAmbientText('');
        dialogue.setIsAmbientSleeping(false);
        dialogue.setIsAmbientBathing(false);
        dialogue.setShowAmbientDialogue(false);
        lastAmbientSceneRef.current = null;
        return;
    }

    // 2. 对话模式中：暂停环境逻辑
    if (dialogue.isDialogueMode) {
        return;
    }

    // 3. 同一场景已初始化：恢复显示但不重新抽取角色
    if (lastAmbientSceneRef.current === world.currentSceneId) {
        if (!dialogue.showAmbientDialogue) dialogue.setShowAmbientDialogue(true);
        return;
    }

    // 4. 进入新场景：初始化环境角色
    lastAmbientSceneRef.current = world.currentSceneId;
    dialogue.setShowAmbientDialogue(true);

    const findCharacterForScene = () => {
        if (world.currentSceneId === 'scen_2' && world.sceneParams?.target && world.sceneParams.target !== 'user') {
            const target = CHARACTERS[world.sceneParams.target];
            // [角色移动系统] 检查角色是否真的在这个场景
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
                    // [角色移动系统] 确认 Mina 真的在酒场
                    const actualLocation = world.forcedLocations[mina.id] || world.characterLocations[mina.id];
                    if (actualLocation === 'scen_3') return mina;
                }
            }
            // [角色移动系统] 过滤掉已经移动走的角色
            const actuallyPresentChars = world.presentCharacters.filter(c => {
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
            dialogue.setAmbientText("zzz……ZZZ……");
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

  // --- 场景动作处理 ---
  const handleUpgradeFacility = (facilityId: SceneId, costGold: number, costMatIds: string[], costMatCount: number) => {
      const newLevels = { ...core.sceneLevels, [facilityId]: (core.sceneLevels[facilityId] || 0) + 1 };
      const eligible = getEligibleCheckInCharacters(newLevels);
      const newlyCheckedIn = eligible.filter(id => !checkedInCharacters.includes(id));
      if (newlyCheckedIn.length > 0) {
          setCheckedInCharacters(prev => [...prev, ...newlyCheckedIn]);
          setCheckInNotifications(prev => [
              ...prev,
              ...newlyCheckedIn.map(charId => ({ id: Date.now() + Math.random().toString(), charId }))
]);
      }
      core.handleUpgradeFacility(facilityId, costGold, costMatIds, costMatCount);
  };

  const handleAction = (action: string, param?: any) => {
    console.log(`[动作] ${action}`, param);
    if (action === 'cook') {
        setIsCookingOpen(true);
    }
  };

  const handleSaveGame = async (slotId: number) => {
      const label = `${world.worldState.dateStr} ${world.worldState.timeStr} - ${world.worldState.sceneName}`;
      
      // 保存游戏数据
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
      
      // 如果是手动存档（slotId 1-3），同步聊天记忆
      if (slotId >= 1 && slotId <= 3) {
          console.log(`[AI Memory] Syncing chat memory from slot 0 to slot ${slotId}`);
          await syncChatSlot(userId, 0, slotId);
      }
  };

  const handleLoadGame = async (slotId: number) => {
      const data = await loadGame(userId, slotId);
      if (data) {
          core.applyLoadedData(data);
          // 恢复世界状态
          world.setCurrentSceneId(data.currentSceneId);
          world.setWorldState(data.worldState);
          world.setForcedLocations({});
          // 立即更新角色位置，确保presentCharacters计算正确
          const locs = calculateCharacterLocations(data.worldState.period, data.worldState.dateStr, data.worldState.timeStr, core.sceneLevels);
          world.setCharacterLocations(locs);
          // 恢复设置
          if (data.settings && onSettingsChange) {
              onSettingsChange(data.settings);
          }
          
          // 用存档的解锁状态覆盖数据库
          if (data.characterUnlocks) {
              for (const [characterId, unlocks] of Object.entries(data.characterUnlocks)) {
                  await updateCharacterUnlocks(userId, slotId, characterId, unlocks);
              }
          }
          
          // 重置 UI 状态
          dialogue.setIsDialogueMode(false);
          dialogue.setHistory([]);
          // 重置环境逻辑状态
          dialogue.setAmbientCharacter(null);
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

  // --- 自动存档（每5分钟，非对话/非切换场景时触发）---
  useEffect(() => {
      const autoSaveInterval = setInterval(() => {
          if (!dialogue.isDialogueMode && !world.isSceneTransitioning) {
              handleSaveGame(0);
          }
      }, 60000 * 5); 
      return () => clearInterval(autoSaveInterval);
  }, [dialogue.isDialogueMode, world.isSceneTransitioning, core.gold, world.worldState, core.inventory, userId]);

  // --- 渲染辅助函数 ---
  const handleOpenDebug = () => {
      setIsDebugMenuOpen(!isDebugMenuOpen);
  };

  const handleFinalCloseDialogue = () => {
      dialogue.handleFinalClose();
      
      // [角色移动系统] 对话结束后，检查角色是否已移动
      // 如果角色已经移动到其他场景，清除当前场景的 Ambient 显示
      if (dialogue.activeCharacter) {
          const charId = dialogue.activeCharacter.id;
          const actualLocation = world.forcedLocations[charId] || world.characterLocations[charId];
          
          if (actualLocation !== world.currentSceneId) {
              // 角色已经不在当前场景，清除 Ambient
              dialogue.setAmbientCharacter(null);
              dialogue.setAmbientText('');
              dialogue.setShowAmbientDialogue(false);
              console.log(`[角色移动系统] ${dialogue.activeCharacter.name} 已移动到 ${SCENE_NAMES[actualLocation as any] || actualLocation}，清除当前场景的 Ambient 显示`);
          }
      }
      
      // 对话结束时触发自动存档（保存角色好感度等数据）
      handleSaveGame(0).catch(err => console.error('Auto-save failed:', err));
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
        checkedInCharacters,
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
        // onOpenShop: 'buy' = 道具购入页签，'sell' = 素材出售页签
        case 'scen_10': return <Scen10 {...commonProps} onOpenShop={(tab) => { setShopInitialTab(tab); setIsShopOpen(true); }} />;
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

          <div className="absolute bottom-[200px] left-4 flex flex-col gap-2 z-[110] pointer-events-none">
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
                      characterName={CHARACTERS[notification.charId]?.name || '角色'}
                      onComplete={() => setAffinityNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  />
              ))}
              {checkInNotifications.map(notification => (
                  <RoomCheckInToast
                      key={notification.id}
                      characterName={CHARACTERS[notification.charId]?.name || '新住客'}
                      avatarUrl={CHARACTERS[notification.charId]?.avatarUrl}
                      onComplete={() => setCheckInNotifications(prev => prev.filter(n => n.id !== notification.id))}
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
      <ExpansionModal isOpen={isExpansionOpen} onClose={() => setIsExpansionOpen(false)} currentLevels={core.sceneLevels} inventory={core.inventory} gold={core.gold} onUpgrade={handleUpgradeFacility} />
      
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

      <SaveLoadModal isOpen={isSaveLoadOpen} onClose={() => setIsSaveLoadOpen(false)} mode={saveLoadMode} userId={userId} onSave={handleSaveGame} onLoad={handleLoadGame} onDelete={handleDeleteSave} />

      {/*
        ShopItemModal - 道具商店
        - goldChange 为差值（负=花费，正=收入），需加上当前金币换算为绝对值传给 updateGold
        - inventoryChanges 已是绝对数量，直接传给 updateInventoryItem
        - 若需新增其他商店，复用此组件并传入不同数据源即可
      */}
      <ShopItemModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        initialTab={shopInitialTab}
        inventory={core.inventory}
        currentGold={core.gold}
        onTransaction={({ goldChange, inventoryChanges }) => {
          core.updateGold(core.gold + goldChange);
          Object.entries(inventoryChanges).forEach(([id, count]) => {
            core.updateInventoryItem(id, count);
          });
        }}
      />
    </div>
  );
});

export default GameScene;