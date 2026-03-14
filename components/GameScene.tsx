import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { getSceneBackground } from '../utils/sceneUtils';
import { calculateCharacterLocations } from '../utils/gameLogic';
import { saveGame, loadGame, deleteGame, syncChatSlot, updateCharacterUnlocks, consumeSanity } from '../services/db';
import { inspirationToSanity } from '../data/currency-value-table'; 

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
import ShopWpnModal from './ShopWpnModal'; // 武器商店（scen_5 使用）
import ShopArmModal from './ShopArmModal'; // 防具商店（scen_6 使用）
import RestModal from './RestModal'; // 休息 - 第四面壁对话框
import ShopResModal from './ShopResModal'; // 市集食材店（scen_market 使用）
import QuestBoardModal from './QuestBoardModal';
import InspirationDashboardModal from './InspirationDashboardModal';
import PartyFormationModal from './PartyFormationModal';
import PartyEquipmentModal from './PartyEquipmentModal';
import PartySkillSetModal from './PartySkillSetModal';
import ToastManager, { ToastData } from './ToastManager';
import { INITIAL_CHECKED_IN_CHARACTERS } from '../utils/gameConstants';
import { getEligibleCheckInCharacters } from './RoomCheckInSystem';
import { CHARACTERS } from '../data/scenarioData';
import { ITEMS } from '../data/items';
import { SKILLS } from '../data/battle-data/skills';
import { QUESTS } from '../data/quest-list';
import { getResValue } from '../data/item-value-table';
import { calculateTavernBonus } from '../data/facilityData';
import { GameSettings, ConfigTab, RevenueLog, RevenueType, SceneId, CharacterUnlocks, QuestState, CharacterStat } from '../types';
import { SCENE_NAMES } from '../utils/gameConstants';
import { getCharacterSprite } from '../utils/gameLogic';
import { UNLOCK_STATUS_NAMES } from '../data/unlockConditions';

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
import ScenTown from './scenes/scen_town';
import ScenGuild from './scenes/scen_guild';
import ScenMarket from './scenes/scen_market';

import { useCoreState } from '../hooks/useCoreState';
import { useWorldSystem } from '../hooks/useWorldSystem';
import { useGameAudio } from '../hooks/useGameAudio';
import { useDialogueSystem } from '../hooks/useDialogueSystem';
import { useBattleSystem } from '../hooks/useBattleSystem';
import { BattleEndReason } from '../battle-system/player-commands';

import BattleScene from './scenes/BattleScene';



interface GameSceneProps {
  userId: number; 
  currentSlotId: number;
  onBackToMenu: () => void;
  onOpenSettings: (tab?: ConfigTab) => void;
  onSettingsChange: (newSettings: GameSettings) => void; 
  settings: GameSettings;
  onLoadGame?: () => void;
  initialSaveData?: any; 
  inspirationBalance: number;
  onUpdateInspirationBalance?: () => void;
}

export interface GameSceneRef {
    autoSave: () => Promise<void>;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

const GameScene = React.forwardRef<GameSceneRef, GameSceneProps>(({ userId, currentSlotId, onBackToMenu, onOpenSettings, onSettingsChange, settings, initialSaveData, inspirationBalance, onUpdateInspirationBalance }, ref) => {
  // --- 核心 Hooks ---
  const core = useCoreState(initialSaveData);
  const [checkedInCharacters, setCheckedInCharacters] = useState<string[]>(() => {
    // 初始化时若有存档数据，立即补全入住角色列表
    if (initialSaveData) {
      const savedCheckedIn: string[] = initialSaveData.checkedInCharacters ?? INITIAL_CHECKED_IN_CHARACTERS;
      const eligibleFromLevels = getEligibleCheckInCharacters(initialSaveData.sceneLevels ?? {});
      return Array.from(new Set([...savedCheckedIn, ...eligibleFromLevels]));
    }
    return INITIAL_CHECKED_IN_CHARACTERS;
  });
  const world = useWorldSystem(core.sceneLevels, initialSaveData, checkedInCharacters);
  
  const battle = useBattleSystem({
    battleParty: core.battleParty,
    characterStats: core.characterStats,
    characterEquipments: core.characterEquipments,
    userName: settings.userName,
    onItemConsumed: (itemId: string) => {
      const currentCount = core.inventory[itemId] || 0;
      if (currentCount > 0) {
        core.updateInventoryItem(itemId, currentCount - 1);
      }
    }
  });
  
  const audioRef = useGameAudio(world.currentSceneId, settings, battle.isOpen);
  
  // --- UI 本地状态 ---
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isExpansionOpen, setIsExpansionOpen] = useState(false); 
  const [isCookingOpen, setIsCookingOpen] = useState(false);
  const [isTavernMenuOpen, setIsTavernMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState<'buy' | 'sell'>('buy'); // 记录从哪个页签打开商店
  const [isFoodShopOpen, setIsFoodShopOpen] = useState(false);
  const [isWpnShopOpen, setIsWpnShopOpen] = useState(false);
  const [wpnShopInitialTab, setWpnShopInitialTab] = useState<'buy' | 'sell'>('buy');
  const [isArmShopOpen, setIsArmShopOpen] = useState(false);
  const [armShopInitialTab, setArmShopInitialTab] = useState<'buy' | 'sell'>('buy');
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isQuestBoardOpen, setIsQuestBoardOpen] = useState(false);
  const [isInspirationDashboardOpen, setIsInspirationDashboardOpen] = useState(false);
  const [isPartyFormationOpen, setIsPartyFormationOpen] = useState(false);
  const [isPartyEquipmentOpen, setIsPartyEquipmentOpen] = useState(false);
  const [isPartySkillSetOpen, setIsPartySkillSetOpen] = useState(false);

  // --- 全局任务倒计时检测（无论告示板是否打开都运行）---
  const QUEST_DURATION_SECONDS_GLOBAL: Record<number, number> = {
    1: 1*60, 2: 2*60, 3: 3*60, 4: 4*60, 5: 5*60,
    6: 6*60, 7: 7*60, 8: 8*60, 9: 9*60, 10: 10*60,
  };
  
  // [已弃用] 倒计时触发战斗逻辑不再使用
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     Object.values(core.questStates).forEach((state: QuestState) => {
  //       if (state.status === 'active' && state.acceptedAt) {
  //         const quest = QUESTS[state.questId];
  //         if (!quest) return;
  //         const duration = QUEST_DURATION_SECONDS_GLOBAL[quest.star] || 300;
  //         const elapsed = Math.floor((Date.now() - state.acceptedAt) / 1000);
  //         if (elapsed >= duration && !battle.isOpen) {
  //           battle.startBattle(quest);
  //         }
  //       }
  //     });
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [core.questStates, battle.isOpen]);
  
  // 战斗结算处理：仅胜利时更新任务状态（奖励在交付时发放）
  useEffect(() => {
    if (!battle.isOpen && battle.endReason === BattleEndReason.VICTORY && battle.quest) {
      const quest = battle.quest;
      core.handleCompleteQuest(quest.quest_id);
      
      setTimeout(() => handleAutoSave().catch(err => console.error('Auto-save after battle victory failed:', err)), 100);
      
      // 胜利后打开任务详情界面
      setHighlightQuestId(quest.quest_id);
      setIsQuestBoardOpen(true);
    }
    
    // 失败或逃跑后也打开任务详情界面
    if (!battle.isOpen && (battle.endReason === BattleEndReason.DEFEAT || battle.endReason === BattleEndReason.ESCAPED) && battle.quest) {
      setHighlightQuestId(battle.quest.quest_id);
      setIsQuestBoardOpen(true);
    }
  }, [battle.isOpen, battle.endReason, battle.quest]);
  
  const [highlightQuestId, setHighlightQuestId] = useState<string | null>(null);
  
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load'>('load');
  
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isScheduleViewerOpen, setIsScheduleViewerOpen] = useState(false);
  const [isResourceDebugOpen, setIsResourceDebugOpen] = useState(false);
  const [isUnlocksDebugOpen, setIsUnlocksDebugOpen] = useState(false);
  
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [moveNotification, setMoveNotification] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');

  // --- 对话系统事件处理 ---
  const handleItemsGained = (items: { id: string; count: number }[]) => {
      core.handleAddItems(items);
      const newToasts = items.map(item => ({
          id: Date.now() + Math.random().toString(),
          type: 'item' as const,
          itemId: item.id,
          count: item.count
      }));
      setToasts(prev => [...prev, ...newToasts]);
      // 获得道具后立即触发自动存档，防止道具丢失
      handleAutoSave().catch(err => console.error('Auto-save after item gain failed:', err));
  };

      const handleCharacterMove = (charId: string, targetId: SceneId) => {
        if (SCENE_NAMES[targetId]) {
          const charName = CHARACTERS[charId]?.name || '角色';
          const targetName = SCENE_NAMES[targetId];
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
          const current = prev[charId] || { level: 1, affinity: 0, exp: 0 };
          const newAffinity = Math.max(0, Math.min(100, current.affinity + change));
          return {
              ...prev,
              [charId]: { ...current, affinity: newAffinity }
          };
      });

      // 显示好感度变化通知
      const newToast = {
          id: Date.now() + Math.random().toString(),
          type: 'affinity' as const,
          charId,
          characterName: CHARACTERS[charId]?.name || '角色',
          change
      };
      setToasts(prev => [...prev, newToast]);
  };

  const handleUnlockUpdate = (charId: string, unlockKey: keyof import('../types').CharacterUnlocks) => {
      console.log(`[GameScene] Updating unlock for ${charId}: ${unlockKey}`);
      core.updateCharacterUnlock(charId, unlockKey, 1);
      
      // 显示解锁 Toast
      const character = CHARACTERS[charId];
      console.log(`[Unlock Toast] Character found:`, character);
      console.log(`[Unlock Toast] Unlock name:`, UNLOCK_STATUS_NAMES[unlockKey]);
      
      if (character) {
          const newToast = {
              id: Date.now() + Math.random().toString(),
              type: 'unlock' as const,
              charId,
              characterName: character.name,
              unlockName: UNLOCK_STATUS_NAMES[unlockKey] || unlockKey,
              avatarUrl: character.avatarUrl
          };
          console.log(`[Unlock Toast] Creating toast:`, newToast);
          setToasts(prev => {
              console.log(`[Unlock Toast] Previous toasts:`, prev);
              const updated = [...prev, newToast];
              console.log(`[Unlock Toast] Updated toasts:`, updated);
              return updated;
          });
      }
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
      onUnlockUpdate: handleUnlockUpdate,
      onSkillLearned: async (characterId: string): Promise<{ skillId: number; skillName: string; characterName: string } | null> => {
          const skillId = core.getCharacterLearnableSkill(characterId);
          if (skillId === null) {
              console.log(`[技能学习] 角色 ${characterId} 没有可学习的技能`);
              return null;
          }
          const learned = await handleLearnPlayerSkill(skillId);
          if (learned) {
              const skillData = SKILLS.find(s => s.id === skillId);
              const skillName = skillData?.name || `技能${skillId}`;
              const characterData = CHARACTERS[characterId];
              const characterName = characterData?.name || characterId;
              
              console.log(`[技能学习] 玩家从角色 ${characterName} 习得技能 ${skillName}`);
              
              setToasts(prev => [
                  ...prev,
                  { id: Date.now() + Math.random().toString(), type: 'skill', skillId, skillName, characterName }
              ]);
              
              return { skillId, skillName, characterName };
          }
          return null;
      }
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

              // 餐饮溢价：酒场等级加成
              const tavernLevel = core.sceneLevels['scen_3'] || 1;
              const { bonus: tavernBonus } = calculateTavernBonus(tavernLevel);

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
                      // 应用餐饮溢价：料理售价 × (1 + bonus%)
                      const priceWithBonus = Math.floor(recipe.price * (1 + tavernBonus / 100));
                      totalTavernRevenue += sales * priceWithBonus;
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
            console.log(`[环境角色] 场景: ${world.currentSceneId}, 角色: ${char.name} (${char.id}), 立绘: ${sprite}`);
            
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
        dialogue.setCurrentSprite('');
        console.log(`[环境角色] 场景: ${world.currentSceneId}, 无角色在场`);
    }
  }, [world.currentSceneId, world.isSceneTransitioning, dialogue.isDialogueMode]);

  // --- 场景动作处理 ---
  const handleUpgradeFacility = (facilityId: SceneId, costGold: number, costMatIds: string[], costMatCount: number) => {
      const newLevels = { ...core.sceneLevels, [facilityId]: (core.sceneLevels[facilityId] || 0) + 1 };
      const eligible = getEligibleCheckInCharacters(newLevels);
      const newlyCheckedIn = eligible.filter(id => !checkedInCharacters.includes(id));
      if (newlyCheckedIn.length > 0) {
          setCheckedInCharacters(prev => [...prev, ...newlyCheckedIn]);
          const newToasts = newlyCheckedIn.map(charId => ({
              id: Date.now() + Math.random().toString(),
              type: 'checkin' as const,
              charId,
              characterName: CHARACTERS[charId]?.name || '新住客',
              avatarUrl: CHARACTERS[charId]?.avatarUrl
          }));
          setToasts(prev => [...prev, ...newToasts]);
      }
      core.handleUpgradeFacility(facilityId, costGold, costMatIds, costMatCount);
  };

  const handleConsumeInspiration = async (inspirationAmount: number) => {
    try {
      // 转换为理智值后调用数据库接口
      const sanityAmount = inspirationToSanity(inspirationAmount);
      await consumeSanity(userId, 'quest_instant_complete', sanityAmount);
      // 消费成功后刷新余额
      if (onUpdateInspirationBalance) {
        onUpdateInspirationBalance();
      }
      // 显示灵感消耗 toast
      setToasts(prev => [
        ...prev,
        { id: Date.now() + Math.random().toString(), type: 'inspiration', amount: inspirationAmount }
      ]);
    } catch (error) {
      console.error('Failed to consume inspiration:', error);
    }
  };

  const handleAction = (action: string, param?: any) => {
    console.log(`[动作] ${action}`, param);
    if (action === 'cook') {
        setIsCookingOpen(true);
    }
    if (action === 'open_food_shop') {
        setIsFoodShopOpen(true);
    }
    if (action === 'open_quest_board') {
        setIsQuestBoardOpen(true);
    }
    if (action === 'buy_weapon') {
        setWpnShopInitialTab('buy');
        setIsWpnShopOpen(true);
    }
    if (action === 'sell_weapon') {
        setWpnShopInitialTab('sell');
        setIsWpnShopOpen(true);
    }
    if (action === 'buy_armor') {
        setArmShopInitialTab('buy');
        setIsArmShopOpen(true);
    }
    if (action === 'sell_armor') {
        setArmShopInitialTab('sell');
        setIsArmShopOpen(true);
    }
    if (action === 'rest') {
        // 先触发自动存档，再弹出第四面壁提示
        handleAutoSave()
            .catch(err => console.error('Auto-save on rest failed:', err))
            .finally(() => setIsRestModalOpen(true));
    }
  };

  const handleSaveGame = async (slotId: number) => {
      const label = `${world.worldState.dateStr} ${world.worldState.timeStr} - ${world.worldState.sceneName}`;
      
      // 保存前从数据库获取最新的角色解锁状态（以 character_unlocks 表为准）
      // 注意：始终使用当前游戏槽位的解锁状态，而不是目标存档槽位
      let unlocksToSave = core.characterUnlocks;
      try {
          const { getAllCharacterUnlocks } = await import('../services/db');
          const latestUnlocks = await getAllCharacterUnlocks(userId, currentSlotId);
          
          // 如果数据库中有数据，使用数据库的；否则使用内存中的
          if (Object.keys(latestUnlocks).length > 0) {
              unlocksToSave = latestUnlocks;
              core.setCharacterUnlocks(latestUnlocks);
          }
      } catch (error) {
          console.error('[存档] 获取角色解锁状态失败，使用内存数据:', error);
      }
      
      // 保存游戏数据
      await saveGame(userId, slotId, label, {
          gold: core.gold,
          questStates: core.questStates,
          currentSceneId: world.currentSceneId,
          worldState: world.worldState,
          managementStats: core.managementStats,
          inventory: core.inventory,
          characterStats: core.characterStats,
          characterEquipments: core.characterEquipments,
          characterSkills: core.characterSkills,
          playerLearnedSkills: core.playerLearnedSkills,
          battleParty: core.battleParty,
          characterUnlocks: unlocksToSave,
          sceneLevels: core.sceneLevels,
          revenueLogs: core.revenueLogs,
          userRecipes: core.userRecipes,
          foodStock: core.foodStock,
          tavernMenu: core.tavernMenu,
          checkedInCharacters,
          settings: settings
      });
      
      // 如果是手动存档（slotId 1-3），同步聊天记忆
      if (slotId >= 1 && slotId <= 3) {
          console.log(`[AI Memory] Syncing chat memory from slot 0 to slot ${slotId}`);
          await syncChatSlot(userId, 0, slotId);
      }
  };

  // 自动存档：同时保存到当前槽位和0号槽位（备份）
  const handleAutoSave = async () => {
      console.log(`[AutoSave] Saving to slot ${currentSlotId} and slot 0 (backup)...`);
      
      // 先保存到当前槽位
      await handleSaveGame(currentSlotId);
      
      // 如果当前不是0号槽位，再保存到0号槽位作为备份
      // 注意：服务器端 /api/save 会自动同步所有独立表（包括 character_unlocks）
      if (currentSlotId !== 0) {
          await handleSaveGame(0);
      }
  };

  const handleLearnPlayerSkill = async (skillId: number): Promise<boolean> => {
      const learned = core.learnPlayerSkill(skillId);
      if (learned) {
          console.log(`[Skill] Player learned skill ${skillId}, auto-saving...`);
          await handleAutoSave().catch(err => console.error('Auto-save after learning skill failed:', err));
      }
      return learned;
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
                  await updateCharacterUnlocks(userId, slotId, characterId, unlocks as Partial<CharacterUnlocks>);
              }
          }
          
          // 恢复入住角色列表：合并存档数据 + 根据当前场景等级补全符合条件的角色
          // 兼容旧存档（无 checkedInCharacters 字段）及版本更新后条件已满足但未触发的情况
          const savedCheckedIn: string[] = data.checkedInCharacters ?? INITIAL_CHECKED_IN_CHARACTERS;
          const eligibleFromLevels = getEligibleCheckInCharacters(data.sceneLevels ?? {});
          const mergedCheckedIn = Array.from(new Set([...savedCheckedIn, ...eligibleFromLevels]));
          setCheckedInCharacters(mergedCheckedIn);

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
      autoSave: handleAutoSave
  }));

  // --- 自动存档（每5分钟，非对话/非切换场景时触发）---
  useEffect(() => {
      const autoSaveInterval = setInterval(() => {
          if (!dialogue.isDialogueMode && !world.isSceneTransitioning) {
              handleAutoSave();
          }
      }, 60000 * 5); 
      return () => clearInterval(autoSaveInterval);
  }, [dialogue.isDialogueMode, world.isSceneTransitioning, core.gold, world.worldState, core.inventory, userId, currentSlotId]);

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
              console.log(`[角色移动系统] ${dialogue.activeCharacter.name} 已移动到 ${SCENE_NAMES[actualLocation as SceneId] || actualLocation}，清除当前场景的 Ambient 显示`);
          }
      }
      
      // 对话结束时触发自动存档（保存角色好感度等数据）
      handleAutoSave().catch(err => console.error('Auto-save failed:', err));
  };

  const currentSceneLevel = core.sceneLevels[world.currentSceneId] || (['scen_5','scen_6','scen_7','scen_8'].includes(world.currentSceneId) ? 0 : 1);
  const currentBgUrl = getSceneBackground(world.currentSceneId, world.worldState.period, currentSceneLevel);
  const currentStats: CharacterStat = dialogue.activeCharacter ? (core.characterStats[dialogue.activeCharacter.id] || { level: 1, affinity: 0, exp: 0 }) : { level: 1, affinity: 0, exp: 0 };
  const ambientStats: CharacterStat = dialogue.ambientCharacter ? (core.characterStats[dialogue.ambientCharacter.id] || { level: 1, affinity: 0, exp: 0 }) : { level: 1, affinity: 0, exp: 0 };

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
        characterStats: core.characterStats,
        characterEquipments: core.characterEquipments,
        battleParty: core.battleParty,
        userRecipes: core.userRecipes,
        foodStock: core.foodStock
    };

    switch(world.currentSceneId) {
        case 'scen_1': return <Scen1 {...commonProps} onOpenManagement={() => setIsManagementOpen(true)} onOpenExpansion={() => setIsExpansionOpen(true)} onOpenPartyFormation={() => setIsPartyFormationOpen(true)} onOpenPartyEquipment={() => setIsPartyEquipmentOpen(true)} onOpenPartySkillSet={() => setIsPartySkillSetOpen(true)} />;
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
        // --- 额外场景组（非旅店设施，不可升级）---
        case 'scen_town': return <ScenTown {...commonProps} />;
        case 'scen_guild': return <ScenGuild {...commonProps} onOpenPartyFormation={() => setIsPartyFormationOpen(true)} onOpenPartyEquipment={() => setIsPartyEquipmentOpen(true)} onOpenPartySkillSet={() => setIsPartySkillSetOpen(true)} />;
        case 'scen_market': return <ScenMarket {...commonProps} />;
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

      {/* 通知层 - 独立于 z-50 父容器之外，确保始终在最上层 */}
      <div className="absolute inset-0 z-[110] pointer-events-none">
        <ToastManager 
          toasts={toasts} 
          onRemoveToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} 
        />

        {moveNotification && (
            <div className="absolute bottom-[300px] left-4 animate-fadeIn">
                <div className="bg-indigo-900/90 border-l-4 border-indigo-400 text-indigo-100 px-6 py-3 rounded-r shadow-2xl flex items-center gap-3 backdrop-blur-md">
<i className="fa-solid fa-shoe-prints text-indigo-300"></i>
                    <span className="font-bold tracking-wider text-sm">{moveNotification}</span>
                </div>
            </div>
        )}

        {dialogue.errorMessage && (
          <div onClick={() => dialogue.setErrorMessage(null)} className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500/50 text-red-100 px-6 py-4 rounded pointer-events-auto cursor-pointer">
              {dialogue.errorMessage}
          </div>
        )}
      </div>

      <div className={`absolute inset-0 z-50 transition-opacity duration-500 pointer-events-none ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>
          <GameEnvironmentWidget worldState={world.worldState} gold={core.gold} inspiration={inspirationBalance} onClickInspiration={() => setIsInspirationDashboardOpen(true)} />

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
            characterLocations={world.characterLocations as Record<string, SceneId>}
          />

            {isResourceDebugOpen && (
    <DebugResourceModal
      isOpen={isResourceDebugOpen}
      onClose={() => setIsResourceDebugOpen(false)}
      gold={core.gold}
      inventory={core.inventory}
      onUpdateGold={core.updateGold}
      onUpdateInventory={core.updateInventoryItem}
    />
  )}

          <DebugUnlocksModal
            isOpen={isUnlocksDebugOpen}
            onClose={() => setIsUnlocksDebugOpen(false)}
            characterUnlocks={core.characterUnlocks}
            characterStats={core.characterStats}
            onUpdateCharacterAffinity={(charId, newAffinity) => {
              core.setCharacterStats(prev => {
                const current = prev[charId] || { level: 1, affinity: 0, exp: 0 };
                return {
                  ...prev,
                  [charId]: { ...current, affinity: newAffinity }
                };
              });
            }}
            onUpdateCharacterUnlock={core.updateCharacterUnlock}
            onSaveGame={() => handleAutoSave()}
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
      <PartyFormationModal
          isOpen={isPartyFormationOpen}
          onClose={() => setIsPartyFormationOpen(false)}
          battleParty={core.battleParty}
          characterUnlocks={core.characterUnlocks}
          characterStats={core.characterStats}
          characterEquipments={core.characterEquipments}
          onAddMember={core.addToBattleParty}
          onRemoveMember={core.removeFromBattleParty}
          userName={settings.userName}
          onAutoSave={() => handleAutoSave().catch(err => console.error('Auto-save after party formation close failed:', err))}
      />
      <PartyEquipmentModal
          isOpen={isPartyEquipmentOpen}
          onClose={() => setIsPartyEquipmentOpen(false)}
          battleParty={core.battleParty}
          characterStats={core.characterStats}
          characterEquipments={core.characterEquipments}
          inventory={core.inventory}
          userName={settings.userName}
          onUpdateEquipment={(characterId, equipment, inventoryChanges) => {
            core.setCharacterEquipments(prev => ({
              ...prev,
              [characterId]: equipment
            }));
            if (Object.keys(inventoryChanges).length > 0) {
              core.setInventory(prev => {
                const next = { ...prev };
                Object.entries(inventoryChanges).forEach(([itemId, change]) => {
                  next[itemId] = Math.max(0, (next[itemId] || 0) + change);
                });
                return next;
              });
            }
          }}
          onAutoSave={() => handleAutoSave().catch(err => console.error('Auto-save after equipment modal close failed:', err))}
      />
      
      <PartySkillSetModal
          isOpen={isPartySkillSetOpen}
          onClose={() => setIsPartySkillSetOpen(false)}
          battleParty={core.battleParty}
          characterUnlocks={core.characterUnlocks}
          characterStats={core.characterStats}
          characterSkills={core.characterSkills}
          playerLearnedSkills={core.playerLearnedSkills}
          userName={settings.userName}
          onUpdateCharacterSkills={core.updateCharacterSkills}
          onAutoSave={() => handleAutoSave().catch(err => console.error('Auto-save after skill set modal close failed:', err))}
      />
      
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
      <RestModal isOpen={isRestModalOpen} onClose={() => setIsRestModalOpen(false)} />

      <QuestBoardModal
        isOpen={isQuestBoardOpen}
        onClose={() => setIsQuestBoardOpen(false)}
        questStates={core.questStates}
        currentGold={core.gold}
        inspirationBalance={inspirationBalance}
        onAcceptQuest={(questId) => {
          core.handleAcceptQuest(questId);
          setTimeout(() => handleAutoSave().catch(err => console.error('Auto-save after quest accept failed:', err)), 100);
        }}
        onCompleteQuest={(questId) => {
          core.handleCompleteQuest(questId);
          setTimeout(() => handleAutoSave().catch(err => console.error('Auto-save after quest complete failed:', err)), 100);
        }}
        onDeliverQuest={core.handleDeliverQuest}
        onStartBattle={(quest) => {
          battle.startBattle(quest);
        }}
        onAbandonQuest={(questId) => {
          core.handleAbandonQuest(questId);
        }}
        onAddGold={(amount) => core.updateGold(core.gold + amount)}
        onConsumeInspiration={handleConsumeInspiration}
        onAddItems={(items) => core.handleAddItems(items)}
        onAddCharacterExp={(exp) => core.addCharacterExp('char_1', exp)}
        onShowRewardToasts={(gold, items) => {
          // 金币通知
          setToasts(prev => [
            ...prev,
            { id: Date.now() + Math.random().toString(), type: 'gold', amount: gold }
          ]);
          // 道具 toasts（延迟依次显示）
          items.forEach((item, idx) => {
            setTimeout(() => {
              setToasts(prev => [
                ...prev,
                { id: Date.now() + Math.random().toString(), type: 'item', itemId: item.id, count: item.count }
              ]);
            }, (idx + 1) * 600);
          });
        }}
        highlightQuestId={highlightQuestId}
      />

      {/* ShopResModal - 市集食材店（scen_market 使用）*/}
      <ShopResModal
        isOpen={isFoodShopOpen}
        onClose={() => setIsFoodShopOpen(false)}
        inventory={core.inventory}
        currentGold={core.gold}
        onTransaction={({ goldChange, inventoryChanges }) => {
          core.updateGold(core.gold + goldChange);
          Object.entries(inventoryChanges).forEach(([id, count]) => {
            core.updateInventoryItem(id, count as number);
          });
        }}
      />


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
            core.updateInventoryItem(id, count as number);
          });
        }}
      />

      <ShopWpnModal
        isOpen={isWpnShopOpen}
        onClose={() => setIsWpnShopOpen(false)}
        initialTab={wpnShopInitialTab}
        inventory={core.inventory}
        currentGold={core.gold}
        shopLevel={core.sceneLevels['scen_5'] || 0}
        onTransaction={({ goldChange, inventoryChanges }) => {
          core.updateGold(core.gold + goldChange);
          Object.entries(inventoryChanges).forEach(([id, count]) => {
            core.updateInventoryItem(id, count as number);
          });
        }}
      />

      <ShopArmModal
        isOpen={isArmShopOpen}
        onClose={() => setIsArmShopOpen(false)}
        initialTab={armShopInitialTab}
        inventory={core.inventory}
        currentGold={core.gold}
        shopLevel={core.sceneLevels['scen_6'] || 0}
        onTransaction={({ goldChange, inventoryChanges }) => {
          core.updateGold(core.gold + goldChange);
          Object.entries(inventoryChanges).forEach(([id, count]) => {
            core.updateInventoryItem(id, count as number);
          });
        }}
      />

      <InspirationDashboardModal 
          isOpen={isInspirationDashboardOpen} 
          onClose={() => {
              setIsInspirationDashboardOpen(false);
              if (onUpdateInspirationBalance) {
                  onUpdateInspirationBalance();
              }
          }} 
          userId={userId} 
      />
      
      {battle.isOpen && battle.battleState && battle.quest && (
        <BattleScene
          isOpen={true}
          onClose={battle.closeBattle}
          quest={battle.quest}
          battleState={battle.battleState}
          battleParty={core.battleParty}
          characterStats={core.characterStats}
          characterEquipments={core.characterEquipments}
          inventory={core.inventory}
          userName={settings.userName}
          currentTurnUnit={battle.currentTurnUnit}
          turnOrder={battle.turnOrder}
          endReason={battle.endReason}
          onExecuteCommand={battle.onExecuteCommand}
          onAutoSave={handleAutoSave}
          enableDebug={settings.enableDebug}
        />
      )}
    </div>
  );
});

export default GameScene;
