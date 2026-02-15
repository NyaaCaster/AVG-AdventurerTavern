
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { getSceneBackground } from '../utils/sceneUtils';
import { llmService } from '../services/llmService';
import DialogueBox from './DialogueBox'; 
import DialogueLogModal from './DialogueLogModal';
import DebugLogModal from './DebugLogModal';
import GameEnvironmentWidget from './GameEnvironmentWidget';
import SystemMenu from './SystemMenu';
import ChatInterface from './ChatInterface';
import InventoryModal from './InventoryModal';
import ManagementModal from './ManagementModal';
import ItemToast from './ItemToast'; 
import { generateSystemPrompt, USER_INFO_TEMPLATE, CHARACTERS } from '../data/scenarioData';
import { GameSettings, ConfigTab, WorldState, DialogueEntry, SceneId, Character, LogEntry, ClothingState, ManagementStats, RevenueLog, RevenueType } from '../types';
import { SCENE_BGM } from '../data/resources/audioResources';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';

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

interface GameSceneProps {
  onBackToMenu: () => void;
  onOpenSettings: (tab?: ConfigTab) => void;
  settings: GameSettings;
  onLoadGame?: () => void;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

const SCENE_NAMES: Record<SceneId, string> = {
  'scen_1': '宿屋',
  'scen_2': '客房',
  'scen_3': '酒场',
  'scen_4': '训练场',
  'scen_5': '武器店',
  'scen_6': '防具店',
  'scen_7': '温泉',
  'scen_8': '按摩室',
  'scen_9': '库房',
  'scen_10': '道具店'
};

const SCENE_LEVELS: Record<string, number> = {
  'scen_1': 1,
  'scen_2': 1,
  'scen_3': 1,
  'scen_4': 1,
  'scen_5': 1,
  'scen_6': 1,
  'scen_7': 1,
  'scen_8': 1,
  'scen_9': 1,
  'scen_10': 1,
};

const CHARACTER_STATS: Record<string, { level: number; affinity: number }> = {
  'char_101': { level: 5, affinity: 85 },
  'char_102': { level: 99, affinity: 45 },
  'char_103': { level: 1, affinity: 20 },
  'char_104': { level: 12, affinity: 35 },
  'char_105': { level: 20, affinity: 15 },
  'char_106': { level: 30, affinity: 5 },
  'char_107': { level: 50, affinity: 60 },
  'char_108': { level: 40, affinity: 70 },
  'char_109': { level: 8, affinity: 90 },
  'char_110': { level: 15, affinity: 50 },
  'char_111': { level: 10, affinity: 40 },
};

const INITIAL_INVENTORY: Record<string, number> = {
    'res-0001': 15, 
    'res-0003': 2,  
    'res-0101': 5,  
    'res-0701': 20, 
    'itm-01': 5,    
    'itm-07': 1,    
    'wpn-102': 1,   
    'arm-201': 1,   
    'spc-00': 1,    
    'spc-05': 2, 
    'res-1011': 2,
    'res-1025': 5,
    'res-1032': 2,
    'res-1047': 10,
    'res-1055': 1,
    'res-1065': 2,
    'res-1079': 6,
    'res-1086': 5,
    'res-1095': 1,
    'res-1108': 3,
    'res-1113': 1,
};

// Initial Management Stats
const INITIAL_STATS: ManagementStats = {
    occupancy: 12,
    maxOccupancy: 20,
    roomPrice: 500,
    satisfaction: 85,
    attraction: 78,
    reputation: 92
};

const calculateWorldState = (currentSceneName: string): WorldState => {
  const now = new Date();
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const h = now.getHours();
  
  let period: 'day' | 'evening' | 'night' = 'night';
  let periodLabel = "夜晚";
  let weatherCode = "150"; 
  let weather = "晴朗的夜晚";

  if (h >= 6 && h < 17) {
      period = 'day';
      periodLabel = "日间";
      weatherCode = "100"; 
      weather = "晴朗的白天";
  } else if (h >= 17 && h < 20) {
      period = 'evening';
      periodLabel = "傍晚";
      weatherCode = "100"; 
      weather = "日落时分的傍晚";
  }

  return {
      dateStr: `${now.getMonth() + 1}月${now.getDate()}日`,
      weekDay: days[now.getDay()],
      timeStr: `${h.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      period,
      periodLabel,
      weatherCode,
      weather,
      sceneName: currentSceneName
  };
};

const getSceneDisplayName = (sceneId: SceneId, params?: any): string => {
    if (sceneId === 'scen_2') {
        if (params?.target === 'user') return '我的房间';
        if (params?.target && CHARACTERS[params.target]) return `${CHARACTERS[params.target].name}的房间`;
        return '客房';
    }
    return SCENE_NAMES[sceneId] || '未知区域';
};

const getCharacterSprite = (character: Character, state: ClothingState, emotion: string): string => {
    const imageConfig = CHARACTER_IMAGES[character.id];
    
    if (!imageConfig) {
        return character.emotions?.[emotion] || character.spriteUrl || '';
    }

    const config = imageConfig[state] || imageConfig['default'];
    
    if (!config) return character.spriteUrl || '';

    let imgList = config.emotions[emotion];
    
    if (!imgList) {
        if (state !== 'default' && imageConfig['default']) {
             imgList = imageConfig['default'].emotions[emotion];
        }
        if (!imgList) {
            imgList = config.emotions['normal'];
        }
    }

    if (imgList && imgList.length > 0) {
        const randIndex = Math.floor(Math.random() * imgList.length);
        return imgList[randIndex];
    }

    return config.spriteUrl || character.spriteUrl || '';
};

// --- Character Distribution Logic ---

const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const m = array.length;
    const shuffled = [...array];
    for (let i = 0; i < m; i++) {
        const r = Math.floor(seededRandom(seed + i) * (m - i)) + i;
        [shuffled[i], shuffled[r]] = [shuffled[r], shuffled[i]];
    }
    return shuffled;
};

const calculateCharacterLocations = (period: 'day'|'evening'|'night', dateStr: string, timeStr: string): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const sceneOccupancy: Record<string, number> = {};
    
    const seedString = dateStr + timeStr.split(':')[0]; 
    let seed = 0;
    for(let i=0; i<seedString.length; i++) seed += seedString.charCodeAt(i);

    const allCharIds = Object.keys(CHARACTERS);
    const shuffledIds = shuffleArray(allCharIds, seed);

    const sortedIds = [
        'char_102', 
        ...shuffledIds.filter(id => id !== 'char_102')
    ];

    sortedIds.forEach(charId => {
        const char = CHARACTERS[charId];
        const schedule = char.schedule;
        const possibleScenes = schedule?.[period] || [];

        let selectedScene = 'scen_2';

        if (possibleScenes.length > 0) {
            const validScenes = possibleScenes.filter(sid => {
                if (sid === 'scen_2') return true;
                
                if (sid === 'scen_3') {
                    if (charId === 'char_102') return true; 
                    return (sceneOccupancy['scen_3'] || 0) < 5;
                }
                
                return (sceneOccupancy[sid] || 0) === 0;
            });

            const qualifiedScenes = validScenes.filter(sid => {
                if (char.appearanceConditions) {
                    for (const cond of char.appearanceConditions) {
                        if (cond.sceneId === sid) {
                            const sceneLevel = SCENE_LEVELS[sid] || 1;
                            if (sceneLevel < cond.minLevel) return false;
                        }
                    }
                }
                return true;
            });

            if (qualifiedScenes.length > 0) {
                const index = Math.floor(seededRandom(seed + charId.charCodeAt(0)) * qualifiedScenes.length);
                selectedScene = qualifiedScenes[index];
            }
        }

        mapping[charId] = selectedScene;
        
        if (selectedScene === 'scen_3' && charId === 'char_102') {
        } else {
             sceneOccupancy[selectedScene] = (sceneOccupancy[selectedScene] || 0) + 1;
        }
    });

    return mapping;
};


const GameScene: React.FC<GameSceneProps> = ({ onBackToMenu, onOpenSettings, onLoadGame, settings }) => {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>('scen_1');
  const [sceneParams, setSceneParams] = useState<any>({});
  
  const [worldState, setWorldState] = useState<WorldState>(() => calculateWorldState(getSceneDisplayName('scen_1')));
  
  const [characterLocations, setCharacterLocations] = useState<Record<string, string>>({});
  // Forced overrides for characters moved via dialogue
  const [forcedLocations, setForcedLocations] = useState<Record<string, string>>({});
  
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  const [gold, setGold] = useState<number>(5000); // 初始金币

  // --- Management System State ---
  const [managementStats, setManagementStats] = useState<ManagementStats>(INITIAL_STATS);
  const [revenueLogs, setRevenueLogs] = useState<RevenueLog[]>([]);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const lastSettlementHourRef = useRef<number | null>(null);

  // Initialize some dummy revenue logs for "history"
  useEffect(() => {
      const initialLogs: RevenueLog[] = [];
      const now = new Date();
      // Generate logs for the last 3 days
      for (let i = 2; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
          
          // Times: 06:00 (Tavern), 08:00 (Acc), 12:00 (Acc), 20:00 (Acc)
          const events = [
              { hour: 6, type: 'tavern' as const },
              { hour: 8, type: 'accommodation' as const },
              { hour: 12, type: 'accommodation' as const },
              { hour: 20, type: 'accommodation' as const }
          ];

          events.forEach(event => {
              // Skip future events today
              if (i === 0 && event.hour > now.getHours()) return;

              let amount = 0;
              if (event.type === 'accommodation') {
                  // Rule: Occupancy * Price * Satisfaction * Reputation
                  // Add some randomness
                  const occ = Math.floor(INITIAL_STATS.occupancy * (0.8 + Math.random() * 0.4)); // 80%-120% variation
                  amount = Math.floor(occ * INITIAL_STATS.roomPrice * (INITIAL_STATS.satisfaction / 100) * (INITIAL_STATS.reputation / 100));
              } else {
                  // Tavern: Simplified calculation
                  amount = Math.floor(1000 * (INITIAL_STATS.attraction / 100) * (0.8 + Math.random() * 0.5));
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
      setRevenueLogs(initialLogs.reverse()); // Newest first
  }, []);

  // Management Action Handler
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

  const [itemNotifications, setItemNotifications] = useState<{id: string, itemId: string, count: number}[]>([]);
  const [moveNotification, setMoveNotification] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{charId: string, targetId: string} | null>(null);

  const presentCharacters = useMemo(() => Object.values(CHARACTERS).filter(char => {
      if (currentSceneId === 'scen_2') {
          if (sceneParams?.target === 'user') return false; 
          if (sceneParams?.target) return char.id === sceneParams.target && characterLocations[char.id] === 'scen_2';
          return false; 
      }
      return characterLocations[char.id] === currentSceneId;
  }), [currentSceneId, sceneParams, characterLocations]);

  const [isDialogueMode, setIsDialogueMode] = useState(false);
  const [isDialogueEnding, setIsDialogueEnding] = useState(false); 
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [clothingState, setClothingState] = useState<ClothingState>('default'); 
  
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isScheduleViewerOpen, setIsScheduleViewerOpen] = useState(false);

  const [ambientCharacter, setAmbientCharacter] = useState<Character | null>(null);
  const [ambientText, setAmbientText] = useState<string>('');
  const [isAmbientLoading, setIsAmbientLoading] = useState(false);
  const [isAmbientSleeping, setIsAmbientSleeping] = useState(false); 
  const [isAmbientBathing, setIsAmbientBathing] = useState(false); 
  const [showAmbientDialogue, setShowAmbientDialogue] = useState(true); 

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');
  const [currentDialogue, setCurrentDialogue] = useState<{ speaker: string; text: string }>({
    speaker: '',
    text: ''
  });
  const [currentSprite, setCurrentSprite] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<DialogueEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebugLog, setShowDebugLog] = useState(false); 
  const [debugLogs, setDebugLogs] = useState<LogEntry[]>([]); 
  const [isUIHidden, setIsUIHidden] = useState(false);

  const [transitionOpacity, setTransitionOpacity] = useState(0); 
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper to check for environment key
  const hasEnvKey = useMemo(() => {
      try {
          return !!(typeof process !== 'undefined' && process.env && process.env.API_KEY);
      } catch(e) {
          return false;
      }
  }, []);

  useEffect(() => {
    const update = () => {
        const newState = calculateWorldState(getSceneDisplayName(currentSceneId, sceneParams));
        setWorldState(newState);
        const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr);
        // Apply forced locations overlay
        const finalLocs = { ...locs, ...forcedLocations };
        setCharacterLocations(finalLocs);
    };

    update();

    const timer = setInterval(() => {
        setWorldState(prev => {
             const newState = calculateWorldState(prev.sceneName);
             const currentHour = parseInt(newState.timeStr.split(':')[0]);

             // --- Revenue & Stats Calculation Logic ---
             if (lastSettlementHourRef.current !== currentHour) {
                 
                 // 1. Refresh Occupancy every hour (on the hour)
                 // Formula: maxOccupancy * (attraction/100) * (satisfaction/100)
                 const calculatedOccupancy = Math.floor(
                     managementStats.maxOccupancy * 
                     (managementStats.attraction / 100) * 
                     (managementStats.satisfaction / 100)
                 );
                 const newOccupancy = Math.max(0, Math.min(managementStats.maxOccupancy, calculatedOccupancy));

                 setManagementStats(prevStats => ({
                     ...prevStats,
                     occupancy: newOccupancy
                 }));

                 // 2. Perform Settlement if at specific hours
                 const settlementHours = [6, 8, 12, 20];
                 if (settlementHours.includes(currentHour)) {
                     let revType: RevenueType = 'accommodation';
                     let amount = 0;

                     if (currentHour === 6) {
                         // Tavern Settlement (06:00)
                         revType = 'tavern';
                         amount = Math.floor(1000 * (managementStats.attraction / 100) * (0.8 + Math.random() * 0.5));
                     } else {
                         // Accommodation Settlement (08:00, 12:00, 20:00)
                         revType = 'accommodation';
                         // Use newOccupancy calculated above
                         amount = Math.floor(newOccupancy * managementStats.roomPrice * (managementStats.satisfaction / 100) * (managementStats.reputation / 100));
                     }

                     if (amount > 0) {
                         setGold(g => g + amount);
                         const newLog: RevenueLog = {
                             id: `log-${Date.now()}`,
                             timestamp: Date.now(),
                             dateStr: newState.dateStr,
                             timeStr: `${currentHour.toString().padStart(2, '0')}:00`,
                             type: revType,
                             amount
                         };
                         setRevenueLogs(prev => [newLog, ...prev].slice(0, 100));
                     }
                 }
                 lastSettlementHourRef.current = currentHour;
             }
             // ---------------------------------

             if (newState.timeStr !== prev.timeStr || newState.period !== prev.period) {
                 const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr);
                 // Apply forced locations overlay
                 const finalLocs = { ...locs, ...forcedLocations };
                 setCharacterLocations(finalLocs);
             }
             return newState;
        });
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, [currentSceneId, sceneParams, forcedLocations, managementStats]); 

  useEffect(() => {
    const unsubscribe = llmService.subscribeLogs((logs) => {
        setDebugLogs([...logs]); 
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setAmbientCharacter(null);
    setAmbientText('');
    setIsAmbientSleeping(false);
    setIsAmbientBathing(false);
    setShowAmbientDialogue(true);
    
    if (isDialogueMode || isSceneTransitioning) return;

    const findCharacterForScene = () => {
        if (currentSceneId === 'scen_2' && sceneParams?.target && sceneParams.target !== 'user') {
            const target = CHARACTERS[sceneParams.target];
            if (characterLocations[target.id] === 'scen_2') {
                return target;
            }
            return null;
        }

        if (presentCharacters.length > 0) {
            if (currentSceneId === 'scen_3') {
                const mina = presentCharacters.find(c => c.id === 'char_102');
                if (mina) return mina;
            }
            const randomIndex = Math.floor(Math.random() * presentCharacters.length);
            return presentCharacters[randomIndex];
        }

        return null;
    };

    const char = findCharacterForScene();
    
    if (char) {
        setAmbientCharacter(char);
        const isSleeping = currentSceneId === 'scen_2' && worldState.period === 'night';
        const isBathing = currentSceneId === 'scen_7';

        setIsAmbientSleeping(isSleeping);
        setIsAmbientBathing(isBathing);

        if (isSleeping) {
            setAmbientText("zzz……ZZZ……");
            setCurrentSprite(''); 
        } else {
            const ambientState = isBathing ? 'nude' : 'default';
            const sprite = getCharacterSprite(char, ambientState, 'normal');
            setCurrentSprite(sprite);
            
            if (currentSceneId === 'scen_3' && char.id !== 'char_102') {
                setAmbientText('');
            } else {
                generateAmbientLine(char, ambientState);
            }
        }
    }

  }, [currentSceneId, worldState.period, isDialogueMode, isSceneTransitioning, sceneParams, presentCharacters]);

  const generateAmbientLine = async (char: Character, state: ClothingState) => {
      // Allow if settings key is present OR if env key is present
      if (!settings.apiConfig.apiKey && !hasEnvKey) {
          setAmbientText("......");
          return;
      }

      setIsAmbientLoading(true);
      try {
          await initLLM(char);
          
          const stats = CHARACTER_STATS[char.id] || { level: 1, affinity: 0 };
          let prompt = "";

          if (currentSceneId === 'scen_7') {
              prompt = `
[系统指令: 此消息仅生成环境氛围台词]
你现在正在温泉里泡澡，非常放松。
你没有注意到玩家(${settings.userName})的到来，正在自言自语。
请结合当前的舒适环境，生成一句简短的、符合你性格的自言自语。
不要与玩家对话，不要使用第二人称。
`;
          } else {
              prompt = `
[系统指令: 此消息仅生成环境氛围台词]
你目前身处【${worldState.sceneName}】，时间是【${worldState.periodLabel}】，天气【${worldState.weather}】。
玩家(${settings.userName})刚刚进入这个场景，但还没有和你搭话。
当前你对玩家的好感度为: ${stats.affinity}。
请根据你的性格、当前时间、地点和心情，生成一句简短的“闲聊”或“自言自语”。
或者是注意到玩家进来后的一句简单的招呼（如果是外向性格）。
`;
          }

          const response = await llmService.sendMessage(prompt);
          let text = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
          setAmbientText(text);
          
          if (response.emotion) {
              const sprite = getCharacterSprite(char, state, response.emotion);
              setCurrentSprite(sprite);
          }

      } catch (e) {
          console.error("Ambient Gen Error", e);
          setAmbientText("......");
      } finally {
          setIsAmbientLoading(false);
      }
  };

  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current) {
        audioRef.current.volume = settings.isMuted ? 0 : Math.max(0, Math.min(1, settings.masterVolume / 100));
    }
  }, [settings.masterVolume, settings.isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const bgmFile = SCENE_BGM[currentSceneId];
    const targetSrc = bgmFile ? resolveImgPath(bgmFile) : "";
    const maxVolume = settings.isMuted ? 0 : Math.max(0, Math.min(1, settings.masterVolume / 100));

    if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
    }

    if (audio.src === targetSrc) {
        if (!audio.paused && audio.volume < maxVolume) {
             const stepTime = 50;
             const stepVol = maxVolume / 10; 
             fadeIntervalRef.current = setInterval(() => {
                 if (audio.volume >= maxVolume - 0.01) {
                     audio.volume = maxVolume;
                     if(fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
                 } else {
                     audio.volume = Math.min(maxVolume, audio.volume + stepVol);
                 }
             }, stepTime);
        } else if (!audio.paused) {
            audio.volume = maxVolume;
        }
        return;
    }

    const FADE_OUT_DURATION = 800;
    const FADE_IN_DURATION = 1500;
    const STEP_INTERVAL = 50;

    const startFadeIn = () => {
        if (!targetSrc) {
            audio.pause();
            audio.src = "";
            return;
        }
        
        audio.src = targetSrc;
        audio.volume = 0;
        audio.play().catch(err => console.warn("BGM Playback Error:", err));

        const steps = FADE_IN_DURATION / STEP_INTERVAL;
        const volStep = maxVolume / steps;

        fadeIntervalRef.current = setInterval(() => {
            if (audio.volume >= maxVolume - 0.01) {
                audio.volume = maxVolume;
                if(fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
            } else {
                audio.volume = Math.min(maxVolume, audio.volume + volStep);
            }
        }, STEP_INTERVAL);
    };

    if (!audio.paused && audio.src && audio.volume > 0) {
        const steps = FADE_OUT_DURATION / STEP_INTERVAL;
        const volStep = audio.volume / steps;

        fadeIntervalRef.current = setInterval(() => {
            if (audio.volume <= 0.01) {
                audio.volume = 0;
                if(fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                startFadeIn();
            } else {
                audio.volume = Math.max(0, audio.volume - volStep);
            }
        }, STEP_INTERVAL);
    } else {
        startFadeIn();
    }

  }, [currentSceneId]);

  const currentSceneLevel = SCENE_LEVELS[currentSceneId] || 1;
  const currentBgUrl = getSceneBackground(currentSceneId, worldState.period, currentSceneLevel);

  useEffect(() => {
     if (!settings.apiConfig.apiKey && !hasEnvKey) {
       setConnectionStatus('disconnected');
     } else {
       setConnectionStatus('connected');
     }
  }, [settings.apiConfig, hasEnvKey]);

  const initLLM = async (char: Character) => {
    const dynamicUserInfo = USER_INFO_TEMPLATE.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    let systemPrompt = generateSystemPrompt(char, dynamicUserInfo, settings.innName, settings.enableNSFW);
    systemPrompt = systemPrompt.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    const fullPrompt = `${systemPrompt}\n\n${dynamicUserInfo}`;
    
    // Inject Env Key if needed
    const config = { ...settings.apiConfig };
    if (!config.apiKey && hasEnvKey) {
        try {
            config.apiKey = process.env.API_KEY || '';
            // Default to Gemini model if env key is used and model is not set or default
            if (!config.model || config.model === 'grok-3') {
                config.model = 'gemini-3-flash-preview';
                config.provider = 'google';
            }
        } catch (e) {}
    }

    await llmService.initChat(char, fullPrompt, config);
  };

  const handleNavigate = (sceneId: SceneId, params?: any) => {
    if (isSceneTransitioning) return;
    if (sceneId === currentSceneId && JSON.stringify(params) === JSON.stringify(sceneParams)) return;

    setIsSceneTransitioning(true);
    setTransitionOpacity(1); 

    setTimeout(() => {
        setCurrentSceneId(sceneId);
        setSceneParams(params || {});
        setIsDialogueMode(false); 
        setIsDialogueEnding(false);
        setErrorMessage(null);
        setActiveCharacter(null); 
        setClothingState('default'); 
        
        setAmbientCharacter(null);
        setAmbientText('');
        setIsAmbientSleeping(false);
        setIsAmbientBathing(false);
        
        const newSceneName = getSceneDisplayName(sceneId, params);
        const newState = calculateWorldState(newSceneName);
        setWorldState(newState);
        
        const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr);
        // Apply forced locations overlay
        const finalLocs = { ...locs, ...forcedLocations };
        setCharacterLocations(finalLocs);

        setTimeout(() => {
            setTransitionOpacity(0); 
            
            setTimeout(() => {
                setIsSceneTransitioning(false);
            }, 500);
        }, 100);
    }, 500);
  };

  const handleAction = (action: string, param?: any) => {
    console.log(`Action triggered: ${action}`, param);
    if (action === 'rest') {
    }
  };

  const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    const char = CHARACTERS[characterId];
    if (!char) return;

    let nextClothingState: ClothingState = 'default';
    if (
        (actionType === 'peep' || actionType === 'bath_together') || 
        (actionType === 'massage_give' || actionType === 'massage_receive') 
    ) {
        nextClothingState = 'nude';
    }
    
    setClothingState(nextClothingState);
    setActiveCharacter(char);
    
    const sprite = getCharacterSprite(char, nextClothingState, 'normal');
    setCurrentSprite(sprite);
    
    setCurrentDialogue({ speaker: char.name, text: "..." });
    
    setIsDialogueMode(true);
    setIsDialogueEnding(false);
    
    const stats = CHARACTER_STATS[characterId] || { level: 1, affinity: 0 };
    
    if (connectionStatus === 'connected') {
        setIsLoading(true);
        try {
            await initLLM(char);
            
            const contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为剧情生成指令]
玩家(${settings.userName})在【${worldState.periodLabel}】的【${worldState.sceneName}】找到了你。
玩家当前的行动意图是:【${actionType}】。
当前你对玩家的好感度为: ${stats.affinity} (0-100)。
你的衣着状态是: ${nextClothingState === 'nude' ? '裸体/未穿衣' : '日常装束'}。
请根据你的性格、当前时间、地点、好感度以及玩家的行为，生成一句符合情境的开场白或反应。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
            
            const response = await llmService.sendMessage(contextPrompt);
            const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);

            setCurrentDialogue({ speaker: char.name, text: displayText });
            
            setHistory(prev => [...prev, { 
                speaker: char.name, 
                text: displayText, 
                timestamp: Date.now(), 
                type: 'npc', 
                avatarUrl: char.avatarUrl,
                tokens: response.usage?.completion_tokens 
            }]);

            if (response.emotion) {
                const emotionSprite = getCharacterSprite(char, nextClothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
            
            setIsTyping(true);
        } catch(e) {
            console.error(e);
            setErrorMessage("角色初始化失败");
            setCurrentDialogue({ speaker: char.name, text: `*(${char.name}看着你)* ...有什么事吗？` });
        } finally {
            setIsLoading(false);
        }
    } else {
        setCurrentDialogue({ speaker: char.name, text: `*(${char.name}似乎正在发呆)* ...` });
    }
  };

  const handleEndDialogueGeneration = async () => {
    if (isLoading || isDialogueEnding || !activeCharacter) return;
    
    const stats = CHARACTER_STATS[activeCharacter.id] || { level: 1, affinity: 0 };
    setIsLoading(true);

    try {
        const contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为系统指令]
玩家决定结束当前的对话离开。
请根据当前场景【${worldState.sceneName}】、时间【${worldState.periodLabel}】、好感度(${stats.affinity})以及刚才的对话氛围，生成一句简短自然的告别语。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
        
        let displayText = '';
        let tokensUsed = 0;

        if (connectionStatus === 'connected') {
            const response = await llmService.sendMessage(contextPrompt);
            displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
            tokensUsed = response.usage?.completion_tokens || 0;
            
            if (response.emotion) {
                const emotionSprite = getCharacterSprite(activeCharacter, clothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
        } else {
             displayText = `*(${activeCharacter.name}微笑着挥了挥手)* 下次见。`;
        }

        setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
        setHistory(prev => [...prev, { 
            speaker: activeCharacter.name, 
            text: displayText, 
            timestamp: Date.now(), 
            type: 'npc', 
            avatarUrl: activeCharacter.avatarUrl,
            tokens: tokensUsed
        }]);
        
        setIsTyping(true);
        setIsDialogueEnding(true); 

    } catch(e) {
        console.error(e);
        setCurrentDialogue({ speaker: activeCharacter.name, text: `*(${activeCharacter.name}点了点头)* 回见。` });
        setIsTyping(true);
        setIsDialogueEnding(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFinalClose = () => {
      setIsDialogueMode(false);
      setIsDialogueEnding(false);
      
      // Apply pending move logic if character decided to move
      if (pendingMove) {
          setForcedLocations(prev => ({
              ...prev,
              [pendingMove.charId]: pendingMove.targetId
          }));
          setPendingMove(null);
      }

      setActiveCharacter(null);
      setClothingState('default');
  };

  const handleItemsGained = (items: { id: string; count: number }[]) => {
      if (!items || items.length === 0) return;

      const newNotifications: typeof itemNotifications = [];
      const newInventory = { ...inventory };

      items.forEach(item => {
          if (item.id && item.count > 0) {
              newInventory[item.id] = (newInventory[item.id] || 0) + item.count;
              
              newNotifications.push({
                  id: Date.now() + Math.random().toString(),
                  itemId: item.id,
                  count: item.count
              });
          }
      });

      setInventory(newInventory);
      setItemNotifications(prev => [...prev, ...newNotifications]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !activeCharacter) return;
    if (connectionStatus === 'disconnected') {
        setErrorMessage("请配置 API Key。");
        return;
    }

    const userMessage = inputText;
    setInputText('');
    setIsLoading(true);
    setHistory(prev => [...prev, { speaker: settings.userName, text: userMessage, timestamp: Date.now(), type: 'user', avatarUrl: 'img/face/1.png' }]);

    try {
      const contextBlock = `\n[当前环境]\n场景: ${worldState.sceneName}\n时间: ${worldState.timeStr}\n衣着: ${clothingState}\n`;
      const enrichedMessage = `${contextBlock}\n用户发言: "${userMessage}"`;
      
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
      
      setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
      
      if (response.items && response.items.length > 0) {
          handleItemsGained(response.items);
      }

      if (settings.enableNSFW && response.clothing) {
          const newClothing = response.clothing.toLowerCase();
          if (['default', 'nude', 'bondage'].includes(newClothing) && newClothing !== clothingState) {
              setClothingState(newClothing as ClothingState);
          }
      }

      // Handle Character Movement Instruction
      if (response.move_to && SCENE_NAMES[response.move_to as SceneId]) {
          const targetName = SCENE_NAMES[response.move_to as SceneId];
          setMoveNotification(`${activeCharacter.name} 将前往 ${targetName}`);
          setPendingMove({ charId: activeCharacter.id, targetId: response.move_to });
          
          // Clear notification after 4 seconds
          setTimeout(() => setMoveNotification(null), 4000);
      }

      setHistory(prev => {
        const newHistory = [...prev];
        
        for (let i = newHistory.length - 1; i >= 0; i--) {
            if (newHistory[i].type === 'user' && !newHistory[i].tokens) {
                 if (response.usage) {
                     newHistory[i] = { ...newHistory[i], tokens: response.usage.prompt_tokens };
                 }
                 break; 
            }
        }

        newHistory.push({ 
            speaker: activeCharacter.name, 
            text: displayText, 
            timestamp: Date.now(), 
            type: 'npc', 
            avatarUrl: activeCharacter.avatarUrl,
            tokens: response.usage?.completion_tokens 
        });

        return newHistory;
      });

      const effectiveClothingState = (settings.enableNSFW && response.clothing && ['default', 'nude', 'bondage'].includes(response.clothing)) 
                                     ? response.clothing 
                                     : clothingState;

      if (response.emotion) {
        const sprite = getCharacterSprite(activeCharacter, effectiveClothingState, response.emotion);
        setCurrentSprite(sprite);
      } else {
        const sprite = getCharacterSprite(activeCharacter, effectiveClothingState, 'normal');
        setCurrentSprite(sprite);
      }
      setIsTyping(true);
    } catch (error) {
      setErrorMessage(`通信故障: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerate = async () => {
     if(isLoading || !activeCharacter) return;
     setIsLoading(true);
     try {
         const response = await llmService.redoLastMessage();
         if(response) {
            const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
            setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
            setIsTyping(true);
            
            if (response.items && response.items.length > 0) {
                handleItemsGained(response.items);
            }

            if (settings.enableNSFW && response.clothing) {
                const newClothing = response.clothing.toLowerCase();
                if (['default', 'nude', 'bondage'].includes(newClothing) && newClothing !== clothingState) {
                    setClothingState(newClothing as ClothingState);
                }
            }

            if (response.move_to && SCENE_NAMES[response.move_to as SceneId]) {
                const targetName = SCENE_NAMES[response.move_to as SceneId];
                setMoveNotification(`${activeCharacter.name} 将前往 ${targetName}`);
                setPendingMove({ charId: activeCharacter.id, targetId: response.move_to });
                setTimeout(() => setMoveNotification(null), 4000);
            }

            setHistory(prev => {
                const newHistory = [...prev];
                if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'npc') {
                     newHistory.pop();
                }
                
                if (response.usage) {
                    for (let i = newHistory.length - 1; i >= 0; i--) {
                        if (newHistory[i].type === 'user') {
                            newHistory[i] = { ...newHistory[i], tokens: response.usage.prompt_tokens };
                            break;
                        }
                    }
                }

                newHistory.push({
                    speaker: activeCharacter.name,
                    text: displayText,
                    timestamp: Date.now(),
                    type: 'npc',
                    avatarUrl: activeCharacter.avatarUrl,
                    tokens: response.usage?.completion_tokens
                });
                return newHistory;
            });

             const effectiveClothingState = (settings.enableNSFW && response.clothing && ['default', 'nude', 'bondage'].includes(response.clothing)) 
                                     ? response.clothing 
                                     : clothingState;

             if (response.emotion) {
                const sprite = getCharacterSprite(activeCharacter, effectiveClothingState, response.emotion);
                setCurrentSprite(sprite);
            }
         }
     } catch (e) {
         setErrorMessage("重生成失败");
     } finally {
         setIsLoading(false);
     }
  };

  const handleOpenDebug = () => {
      setIsDebugMenuOpen(!isDebugMenuOpen);
      setIsScheduleViewerOpen(false); 
  };

  const renderScene = () => {
    const commonProps = {
        onNavigate: handleNavigate,
        onAction: handleAction,
        onEnterDialogue: handleEnterDialogue,
        isMenuVisible: !isDialogueMode,
        worldState,
        targetCharacterId: sceneParams.target,
        settings, 
        presentCharacters, 
        inventory 
    };

    switch(currentSceneId) {
        case 'scen_1': return <Scen1 {...commonProps} onOpenManagement={() => setIsManagementOpen(true)} />;
        case 'scen_2': return <Scen2 {...commonProps} />;
        case 'scen_3': return <Scen3 {...commonProps} />;
        case 'scen_4': return <Scen4 {...commonProps} />;
        case 'scen_5': return <Scen5 {...commonProps} />;
        case 'scen_6': return <Scen6 {...commonProps} />;
        case 'scen_7': return <Scen7 {...commonProps} />;
        case 'scen_8': return <Scen8 {...commonProps} />;
        case 'scen_9': return <Scen9 {...commonProps} />;
        case 'scen_10': return <Scen10 {...commonProps} />;
        default: return <Scen1 {...commonProps} onOpenManagement={() => setIsManagementOpen(true)} />;
    }
  };

  const currentStats = activeCharacter ? (CHARACTER_STATS[activeCharacter.id] || { level: 1, affinity: 0 }) : { level: 1, affinity: 0 };
  const ambientStats = ambientCharacter ? (CHARACTER_STATS[ambientCharacter.id] || { level: 1, affinity: 0 }) : { level: 1, affinity: 0 };

  return (
    <div 
        className="relative w-full h-full bg-black overflow-hidden" 
        onClick={() => { if (isUIHidden) setIsUIHidden(false); }}
    >
      <audio ref={audioRef} loop className="hidden" />

      <div 
        className="absolute inset-0 bg-black z-[80] pointer-events-none transition-opacity ease-in-out duration-500"
        style={{ opacity: transitionOpacity }}
      />

      <div className="absolute inset-0 z-0">
        <img src={resolveImgPath(currentBgUrl)} alt="BG" className="w-full h-full object-cover transition-all duration-700" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10" />
      </div>

      <div className={`absolute inset-0 z-10 flex items-end justify-center pointer-events-none transition-all duration-500 ${isDialogueMode ? '-translate-y-[2%] opacity-100' : 'translate-y-10 opacity-0'}`}>
         {isDialogueMode && currentSprite && (
            <img 
                src={resolveImgPath(currentSprite)} 
                alt="Sprite" 
                className="h-[100%] md:h-[95%] object-contain drop-shadow-2xl" 
            />
         )}
      </div>

      <div className={`absolute inset-0 z-10 flex items-end pointer-events-none transition-all duration-700 ${(!isDialogueMode && ambientCharacter && !isAmbientSleeping && !isAmbientBathing) ? 'opacity-100' : 'opacity-0'}`}>
         {ambientCharacter && !isAmbientSleeping && currentSprite && (
            <div className="relative h-[95%] w-full">
                <img 
                    src={resolveImgPath(currentSprite)} 
                    alt="Ambient Sprite" 
                    className="absolute bottom-0 left-[30%] transform -translate-x-1/2 h-full object-contain drop-shadow-xl filter brightness-95" 
                />
            </div>
         )}
      </div>

      <div className={`absolute inset-0 z-50 transition-opacity duration-500 pointer-events-none ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>
          
          <GameEnvironmentWidget worldState={worldState} gold={gold} />

          {/* Item Gain Notifications */}
          <div className="absolute bottom-[200px] left-4 flex flex-col gap-2 z-[70] pointer-events-none">
              {itemNotifications.map(notification => (
                  <ItemToast 
                      key={notification.id}
                      itemId={notification.itemId}
                      count={notification.count}
                      onComplete={() => setItemNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  />
              ))}
          </div>

          {/* Movement Notification */}
          {moveNotification && (
              <div className="absolute bottom-[300px] left-4 z-[70] animate-fadeIn pointer-events-none">
                  <div className="bg-indigo-900/90 border-l-4 border-indigo-400 text-indigo-100 px-6 py-3 rounded-r shadow-2xl flex items-center gap-3 backdrop-blur-md">
                      <i className="fa-solid fa-shoe-prints text-indigo-300"></i>
                      <span className="font-bold tracking-wider text-sm">{moveNotification}</span>
                  </div>
              </div>
          )}

          {errorMessage && (
            <div 
                onClick={() => setErrorMessage(null)}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-red-900/90 border border-red-500/50 text-red-100 px-6 py-4 rounded pointer-events-auto cursor-pointer"
            >
                {errorMessage}
            </div>
          )}

          <SystemMenu 
            onLoadGame={onLoadGame} 
            onOpenSettings={onOpenSettings} 
            onBackToMenu={onBackToMenu} 
            onDebug={handleOpenDebug}
            showDebug={settings.enableDebug}
          />

          {isDebugMenuOpen && (
              <div className="absolute top-16 right-4 z-[60] flex flex-col gap-2 bg-black/80 backdrop-blur p-2 rounded border border-yellow-500/30 shadow-lg pointer-events-auto animate-fadeIn">
                  <button 
                    onClick={() => { setIsScheduleViewerOpen(true); setIsDebugMenuOpen(false); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
                  >
                      <i className="fa-solid fa-calendar-days"></i>
                      Schedules
                  </button>
              </div>
          )}

          {isScheduleViewerOpen && (
              <div 
                className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm pointer-events-auto animate-fadeIn" 
                onClick={() => setIsScheduleViewerOpen(false)}
              >
                  <div 
                    className="bg-slate-900 border border-yellow-500/30 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl" 
                    onClick={e => e.stopPropagation()}
                  >
                      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-lg">
                          <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
                              <i className="fa-solid fa-clock"></i>
                              Current Location Distribution ({worldState.periodLabel})
                          </h3>
                          <button onClick={() => setIsScheduleViewerOpen(false)} className="text-slate-400 hover:text-white">
                              <i className="fa-solid fa-xmark"></i>
                          </button>
                      </div>
                      
                      <div className="p-4 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.keys(SCENE_NAMES).map(key => {
                              const sid = key as SceneId;
                              const chars = Object.values(CHARACTERS).filter(c => characterLocations[c.id] === sid);
                              return (
                                  <div key={sid} className="bg-slate-800/50 border border-slate-700 p-3 rounded">
                                      <div className="font-bold text-slate-300 text-sm mb-1 flex justify-between">
                                          <span>{SCENE_NAMES[sid]}</span>
                                          <span className="text-slate-600 font-mono text-xs">{sid}</span>
                                      </div>
                                      <div className="min-h-[20px] flex flex-wrap gap-1">
                                          {chars.length > 0 ? (
                                              chars.map(c => (
                                                  <span key={c.id} className="px-1.5 py-0.5 bg-indigo-900/50 text-indigo-200 text-xs rounded border border-indigo-500/20">
                                                      {c.name}
                                                  </span>
                                              ))
                                          ) : (
                                              <span className="text-slate-600 text-xs italic">Empty</span>
                                          )}
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

          {!isDialogueMode && ambientCharacter && ambientText && showAmbientDialogue && (
              <div className="absolute bottom-4 w-full flex flex-col items-center pointer-events-auto z-40 animate-fadeIn">
                  <div className="relative w-full px-0 md:px-4 mb-2">
                      <DialogueBox 
                          speaker={ambientCharacter.name}
                          text={ambientText}
                          isTyping={true} 
                          typingEnabled={settings.enableTypewriter}
                          transparency={settings.dialogueTransparency}
                          onHideUI={() => setIsUIHidden(true)}
                          onShowHistory={undefined}
                          onShowDebugLog={undefined}
                          onClose={() => setShowAmbientDialogue(false)} 
                          level={ambientStats.level}
                          affinity={ambientStats.affinity}
                      />
                  </div>
              </div>
          )}

          {isDialogueMode && activeCharacter && (
              <ChatInterface 
                 currentDialogue={currentDialogue}
                 isTyping={isTyping}
                 setIsTyping={setIsTyping}
                 settings={settings}
                 onHideUI={() => setIsUIHidden(true)}
                 onShowHistory={() => setShowHistory(true)}
                 onShowDebugLog={() => setShowDebugLog(true)} 
                 inputText={inputText}
                 setInputText={setInputText}
                 handleSend={handleSend}
                 handleRegenerate={handleRegenerate}
                 handleEndDialogueGeneration={handleEndDialogueGeneration}
                 handleFinalClose={handleFinalClose}
                 isEnding={isDialogueEnding}
                 isLoading={isLoading}
                 connectionStatus={connectionStatus}
                 onOpenSettings={onOpenSettings}
                 stats={currentStats}
              />
          )}
      </div>

      <DialogueLogModal isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} />
      
      <DebugLogModal isOpen={showDebugLog} onClose={() => setShowDebugLog(false)} logs={debugLogs} />

      <ManagementModal 
          isOpen={isManagementOpen} 
          onClose={() => setIsManagementOpen(false)} 
          stats={managementStats}
          logs={revenueLogs}
          onAction={handleManagementAction}
          currentGold={gold}
      />
    </div>
  );
};

export default GameScene;
