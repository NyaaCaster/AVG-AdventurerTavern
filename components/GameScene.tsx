
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { getSceneBackground } from '../utils/sceneUtils';
import { saveGame, loadGame, deleteGame } from '../services/db'; 

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
import ResourceDebugModal from './ResourceDebugModal'; 
import SaveLoadModal from './SaveLoadModal'; 
import ItemToast from './ItemToast'; 
import AffinityToast from './AffinityToast'; 
import { CHARACTERS } from '../data/scenarioData';
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

const GameScene = React.forwardRef<GameSceneRef, GameSceneProps>(({ userId, onBackToMenu, onOpenSettings, onSettingsChange, settings, initialSaveData }, ref) => {
  // --- Hooks ---
  const core = useCoreState(initialSaveData);
  const world = useWorldSystem(core.sceneLevels);
  const audioRef = useGameAudio(world.currentSceneId, settings);
  
  // --- UI Local State ---
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isExpansionOpen, setIsExpansionOpen] = useState(false); 
  const [isCookingOpen, setIsCookingOpen] = useState(false);
  
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load'>('load');
  
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isScheduleViewerOpen, setIsScheduleViewerOpen] = useState(false);
  const [isResourceDebugOpen, setIsResourceDebugOpen] = useState(false);
  
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
          const charName = CHARACTERS[charId]?.name || '角色';
          const targetName = SCENE_NAMES[targetId as any];
          setMoveNotification(`${charName} 将前往 ${targetName}`);
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

  const dialogue = useDialogueSystem({
      settings,
      worldState: world.worldState,
      characterStats: core.characterStats,
      onItemsGained: handleItemsGained,
      onCharacterMove: handleCharacterMove,
      onAffinityChange: handleAffinityChange
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

          const settlementHours = [6, 8, 12, 20];
          if (settlementHours.includes(currentHour)) {
              let revType: RevenueType = 'accommodation';
              let amount = 0;

              if (currentHour === 6) {
                  revType = 'tavern';
                  amount = Math.floor(1000 * (stats.attraction / 100) * (0.8 + Math.random() * 0.5));
              } else {
                  revType = 'accommodation';
                  amount = Math.floor(newOccupancy * stats.roomPrice * (stats.satisfaction / 100) * (stats.reputation / 100));
              }

              if (amount > 0) {
                  core.setGold(g => g + amount);
                  const newLog: RevenueLog = {
                      id: `log-${Date.now()}`,
                      timestamp: Date.now(),
                      dateStr: world.worldState.dateStr,
                      timeStr: `${currentHour.toString().padStart(2, '0')}:00`,
                      type: revType,
                      amount
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
            if (world.characterLocations[target.id] === 'scen_2') {
                return target;
            }
            return null;
        }

        if (world.presentCharacters.length > 0) {
            if (world.currentSceneId === 'scen_3') {
                const mina = world.presentCharacters.find(c => c.id === 'char_102');
                if (mina) return mina;
            }
            const randomIndex = Math.floor(Math.random() * world.presentCharacters.length);
            return world.presentCharacters[randomIndex];
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
    }
  }, [world.currentSceneId, world.isSceneTransitioning, dialogue.isDialogueMode]);

  // --- Actions ---
  const handleAction = (action: string, param?: any) => {
    console.log(`Action triggered: ${action}`, param);
    if (action === 'cook') {
        setIsCookingOpen(true);
    }
  };

  const handleSaveGame = async (slotId: number) => {
      const label = `${world.worldState.dateStr} ${world.worldState.timeStr} - ${world.worldState.sceneName}`;
      await saveGame(userId, slotId, label, {
          gold: core.gold,
          currentSceneId: world.currentSceneId,
          worldState: world.worldState,
          managementStats: core.managementStats,
          inventory: core.inventory,
          characterStats: core.characterStats,
          sceneLevels: core.sceneLevels,
          revenueLogs: core.revenueLogs,
          userRecipes: core.userRecipes,
          foodStock: core.foodStock,
          settings: settings
      });
  };

  const handleLoadGame = async (slotId: number) => {
      const data = await loadGame(userId, slotId);
      if (data) {
          core.applyLoadedData(data);
          // Restore world state
          world.setCurrentSceneId(data.currentSceneId);
          world.setWorldState(data.worldState);
          world.setForcedLocations({});
          // Restore settings
          if (data.settings && onSettingsChange) {
              onSettingsChange(data.settings);
          }
          // Reset UI
          dialogue.setIsDialogueMode(false);
          dialogue.setHistory([]);
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
      setIsScheduleViewerOpen(false); 
      setIsResourceDebugOpen(false);
  };

  const handleFinalCloseDialogue = () => {
      dialogue.handleFinalClose();
      // Handle delayed movement clearing if needed, but hook handles movement set.
      // We might want to clear forced movement after a scene change or explicitly here if needed.
      // For now, worldSystem keeps it until nav.
      
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
        userRecipes: core.userRecipes,
        foodStock: core.foodStock
    };

    switch(world.currentSceneId) {
        case 'scen_1': return <Scen1 {...commonProps} onOpenManagement={() => setIsManagementOpen(true)} onOpenExpansion={() => setIsExpansionOpen(true)} />;
        case 'scen_2': return <Scen2 {...commonProps} />;
        case 'scen_3': return <Scen3 {...commonProps} />;
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
                      characterName={CHARACTERS[notification.charId]?.name || '角色'}
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

          {isDebugMenuOpen && (
              <div className="absolute top-16 right-4 z-[60] flex flex-col gap-2 bg-black/80 backdrop-blur p-2 rounded border border-yellow-500/30 shadow-lg pointer-events-auto animate-fadeIn">
                  <button onClick={() => { setIsScheduleViewerOpen(true); setIsDebugMenuOpen(false); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2">
                      <i className="fa-solid fa-calendar-days"></i> Schedules
                  </button>
                  <button onClick={() => { setIsResourceDebugOpen(true); setIsDebugMenuOpen(false); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2">
                      <i className="fa-solid fa-screwdriver-wrench"></i> 资源调整
                  </button>
              </div>
          )}

          {isScheduleViewerOpen && (
              <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm pointer-events-auto animate-fadeIn" onClick={() => setIsScheduleViewerOpen(false)}>
                  <div className="bg-slate-900 border border-yellow-500/30 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-lg">
                          <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2"><i className="fa-solid fa-clock"></i> Current Location Distribution ({world.worldState.periodLabel})</h3>
                          <button onClick={() => setIsScheduleViewerOpen(false)} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                      <div className="p-4 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.keys(SCENE_NAMES).map(key => {
                              const sid = key as SceneId;
                              const chars = Object.values(CHARACTERS).filter(c => world.characterLocations[c.id] === sid);
                              return (
                                  <div key={sid} className="bg-slate-800/50 border border-slate-700 p-3 rounded">
                                      <div className="font-bold text-slate-300 text-sm mb-1 flex justify-between">
                                          <span>{SCENE_NAMES[sid]}</span><span className="text-slate-600 font-mono text-xs">{sid}</span>
                                      </div>
                                      <div className="min-h-[20px] flex flex-wrap gap-1">
                                          {chars.length > 0 ? chars.map(c => <span key={c.id} className="px-1.5 py-0.5 bg-indigo-900/50 text-indigo-200 text-xs rounded border border-indigo-500/20">{c.name}</span>) : <span className="text-slate-600 text-xs italic">Empty</span>}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          )}

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

      <ResourceDebugModal isOpen={isResourceDebugOpen} onClose={() => setIsResourceDebugOpen(false)} gold={core.gold} inventory={core.inventory} onUpdateGold={core.updateGold} onUpdateInventory={core.updateInventoryItem} />

      <SaveLoadModal isOpen={isSaveLoadOpen} onClose={() => setIsSaveLoadOpen(false)} mode={saveLoadMode} userId={userId} onSave={handleSaveGame} onLoad={handleLoadGame} onDelete={handleDeleteSave} />
    </div>
  );
});

export default GameScene;
