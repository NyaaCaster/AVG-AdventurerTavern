
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { getSceneBackground } from '../utils/sceneUtils';
import { llmService } from '../services/llmService';
import DialogueBox from './DialogueBox'; // Ensure explicit import
import DialogueLogModal from './DialogueLogModal';
import DebugLogModal from './DebugLogModal';
import GameEnvironmentWidget from './GameEnvironmentWidget';
import SystemMenu from './SystemMenu';
import ChatInterface from './ChatInterface';
import InventoryModal from './InventoryModal';
import ItemToast from './ItemToast'; // 新增导入
import { generateSystemPrompt, USER_INFO_TEMPLATE, CHARACTERS } from '../data/scenarioData';
import { GameSettings, ConfigTab, WorldState, DialogueEntry, SceneId, Character, LogEntry, ClothingState } from '../types';
import { SCENE_BGM } from '../data/resources/audioResources';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';

// Import Scenes
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

// 模拟场景等级数据 (未来可移至全局状态管理)
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

// 模拟角色状态数据 (未来可移至全局状态管理)
const CHARACTER_STATS: Record<string, { level: number; affinity: number }> = {
  'char_101': { level: 5, affinity: 85 }, // Lilia
  'char_102': { level: 99, affinity: 45 }, // Mina
  'char_103': { level: 1, affinity: 20 }, // Aurora
  'char_104': { level: 12, affinity: 35 }, // Judith
  'char_105': { level: 20, affinity: 15 }, // Renka
  'char_106': { level: 30, affinity: 5 }, // Erin
  'char_107': { level: 50, affinity: 60 }, // Philo
  'char_108': { level: 40, affinity: 70 }, // Catalina
  'char_109': { level: 8, affinity: 90 }, // Laila
  'char_110': { level: 15, affinity: 50 }, // Ryuka
  'char_111': { level: 10, affinity: 40 }, // Gina
};

// 模拟初始库存数据
const INITIAL_INVENTORY: Record<string, number> = {
    'res-0001': 15, // 灵木
    'res-0003': 2,  // 魔晶石
    'res-0101': 5,  // 狂暴兔肉
    'res-0701': 20, // 啤酒
    'itm-01': 5,    // 治疗药小
    'itm-07': 1,    // 精灵粉尘
    'wpn-102': 1,   // 铁剑
    'arm-201': 1,   // 皮甲
    'spc-00': 1,    // 莫比乌斯
    'spc-05': 2,    // 棉绳
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

// 辅助函数：根据状态和情绪获取随机立绘
const getCharacterSprite = (character: Character, state: ClothingState, emotion: string): string => {
    // 获取全局配置中的角色图片配置
    const imageConfig = CHARACTER_IMAGES[character.id];
    
    if (!imageConfig) {
        // 回退到旧逻辑 (兼容 Character 接口中的旧字段)
        return character.emotions?.[emotion] || character.spriteUrl || '';
    }

    // 获取对应衣着状态配置，若不存在则回退到 default
    const config = imageConfig[state] || imageConfig['default'];
    
    if (!config) return character.spriteUrl || '';

    // 获取情绪对应的图片列表
    // 如果该状态下没有该情绪，回退到 normal (或者列表的第一个key，这里简化为normal)
    let imgList = config.emotions[emotion];
    
    // 兼容逻辑：如果新状态下没有 'normal'，尝试回退到 default 状态的同名情绪
    if (!imgList) {
        if (state !== 'default' && imageConfig['default']) {
             imgList = imageConfig['default'].emotions[emotion];
        }
        // 如果还找不到，尝试当前状态的 'normal'
        if (!imgList) {
            imgList = config.emotions['normal'];
        }
    }

    if (imgList && imgList.length > 0) {
        // 随机选择一张
        const randIndex = Math.floor(Math.random() * imgList.length);
        return imgList[randIndex];
    }

    return config.spriteUrl || character.spriteUrl || '';
};

// --- Character Distribution Logic ---

// Seeded random helper for deterministic distribution per hour
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

// Calculate where each character is currently located
const calculateCharacterLocations = (period: 'day'|'evening'|'night', dateStr: string, timeStr: string): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const sceneOccupancy: Record<string, number> = {};
    
    // Seed based on date + hour to keep locations stable within the hour
    const seedString = dateStr + timeStr.split(':')[0]; 
    let seed = 0;
    for(let i=0; i<seedString.length; i++) seed += seedString.charCodeAt(i);

    // Get all chars
    const allCharIds = Object.keys(CHARACTERS);
    
    // Shuffle to ensure fair distribution of scarce slots
    const shuffledIds = shuffleArray(allCharIds, seed);

    // Prioritize Mina (char_102) processing first to ensure she gets her specific spots easily
    const sortedIds = [
        'char_102', 
        ...shuffledIds.filter(id => id !== 'char_102')
    ];

    sortedIds.forEach(charId => {
        const char = CHARACTERS[charId];
        const schedule = char.schedule;
        const possibleScenes = schedule?.[period] || [];

        // Fallback is always scen_2
        let selectedScene = 'scen_2';

        if (possibleScenes.length > 0) {
            // Find valid scenes based on capacity rules
            const validScenes = possibleScenes.filter(sid => {
                // Rule: Default to room is always valid (capacity unlimited for separate rooms)
                if (sid === 'scen_2') return true;
                
                if (sid === 'scen_3') {
                    // Rule: Tavern max 5 characters other than Mina
                    if (charId === 'char_102') return true; // Mina always fits
                    return (sceneOccupancy['scen_3'] || 0) < 5;
                }
                
                // Rule: Other scenes have max 1 character
                return (sceneOccupancy[sid] || 0) === 0;
            });

            // Rule: Check Appearance Conditions (Levels)
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
                // Pick one deterministically from valid options
                const index = Math.floor(seededRandom(seed + charId.charCodeAt(0)) * qualifiedScenes.length);
                selectedScene = qualifiedScenes[index];
            }
        }

        mapping[charId] = selectedScene;
        
        // Update occupancy
        // Only count towards capacity limits for non-Mina characters in Tavern
        if (selectedScene === 'scen_3' && charId === 'char_102') {
             // Mina doesn't consume the "guest" slots in tavern
        } else {
             sceneOccupancy[selectedScene] = (sceneOccupancy[selectedScene] || 0) + 1;
        }
    });

    return mapping;
};


const GameScene: React.FC<GameSceneProps> = ({ onBackToMenu, onOpenSettings, onLoadGame, settings }) => {
  // State
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>('scen_1');
  const [sceneParams, setSceneParams] = useState<any>({});
  
  const [worldState, setWorldState] = useState<WorldState>(() => calculateWorldState(getSceneDisplayName('scen_1')));
  
  // Dynamic Character Locations
  const [characterLocations, setCharacterLocations] = useState<Record<string, string>>({});
  
  // Inventory State
  const [inventory, setInventory] = useState<Record<string, number>>(INITIAL_INVENTORY);
  // Item Toast Notifications Queue
  const [itemNotifications, setItemNotifications] = useState<{id: string, itemId: string, count: number}[]>([]);

  // Derived state: present characters in CURRENT scene
  const presentCharacters = useMemo(() => Object.values(CHARACTERS).filter(char => {
      // For Guest Rooms (scen_2), if params.target is set, we check that specific character
      if (currentSceneId === 'scen_2') {
          if (sceneParams?.target === 'user') return false; // User room has no NPC
          if (sceneParams?.target) return char.id === sceneParams.target && characterLocations[char.id] === 'scen_2';
          return false; // General hallway has no one usually? Or we list everyone in their rooms? Scen2 menu handles list.
      }
      return characterLocations[char.id] === currentSceneId;
  }), [currentSceneId, sceneParams, characterLocations]);

  const [isDialogueMode, setIsDialogueMode] = useState(false);
  const [isDialogueEnding, setIsDialogueEnding] = useState(false); // 新增：是否处于对话结束确认阶段
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [clothingState, setClothingState] = useState<ClothingState>('default'); // 新增：衣着状态
  
  // Debug State
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [isScheduleViewerOpen, setIsScheduleViewerOpen] = useState(false);

  // Ambient Mode State
  const [ambientCharacter, setAmbientCharacter] = useState<Character | null>(null);
  const [ambientText, setAmbientText] = useState<string>('');
  const [isAmbientLoading, setIsAmbientLoading] = useState(false);
  const [isAmbientSleeping, setIsAmbientSleeping] = useState(false); // 是否处于睡眠状态
  const [isAmbientBathing, setIsAmbientBathing] = useState(false); // 是否处于沐浴状态 (温泉场景)
  const [showAmbientDialogue, setShowAmbientDialogue] = useState(true); // 控制环境对话框的显示

  // Chat State
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
  const [showDebugLog, setShowDebugLog] = useState(false); // 新增：控制调试日志显示
  const [debugLogs, setDebugLogs] = useState<LogEntry[]>([]); // 新增：调试日志数据
  const [isUIHidden, setIsUIHidden] = useState(false);

  // Transition State
  const [transitionOpacity, setTransitionOpacity] = useState(0); // 0: Transparent, 1: Black
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);

  // Audio Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Time Loop & Location Update
  useEffect(() => {
    // 初始计算一次
    const update = () => {
        const newState = calculateWorldState(getSceneDisplayName(currentSceneId, sceneParams));
        setWorldState(newState);
        // Update character locations based on new time
        const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr);
        setCharacterLocations(locs);
    };

    update();

    const timer = setInterval(() => {
        setWorldState(prev => {
             const newState = calculateWorldState(prev.sceneName);
             
             // Only recalculate locations if time string changed (minutely) or significant change
             if (newState.timeStr !== prev.timeStr || newState.period !== prev.period) {
                 const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr);
                 setCharacterLocations(locs);
             }
             
             return newState;
        });
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, [currentSceneId, sceneParams]); // 依赖场景ID，切换场景时也会重新计算

  // Subscribe to LLM Logs
  useEffect(() => {
    const unsubscribe = llmService.subscribeLogs((logs) => {
        setDebugLogs([...logs]); // 创建副本以触发更新
    });
    return () => unsubscribe();
  }, []);

  // Check for Ambient Character on Scene/Time Change
  useEffect(() => {
    // Reset Ambient State
    setAmbientCharacter(null);
    setAmbientText('');
    setIsAmbientSleeping(false);
    setIsAmbientBathing(false);
    setShowAmbientDialogue(true);
    
    // 如果正在正式对话或转场中，不触发环境逻辑
    if (isDialogueMode || isSceneTransitioning) return;

    const findCharacterForScene = () => {
        // Special logic for Guest Rooms (scen_2)
        if (currentSceneId === 'scen_2' && sceneParams?.target && sceneParams.target !== 'user') {
            const target = CHARACTERS[sceneParams.target];
            // Check if target is actually in the room based on dynamic location
            if (characterLocations[target.id] === 'scen_2') {
                return target;
            }
            return null;
        }

        // For public scenes, pick a character from presentCharacters
        if (presentCharacters.length > 0) {
            // Tavern Rule (scen_3): Prioritize Mina if present
            if (currentSceneId === 'scen_3') {
                const mina = presentCharacters.find(c => c.id === 'char_102');
                if (mina) return mina;
            }

            // Simple logic: pick random or first
            const randomIndex = Math.floor(Math.random() * presentCharacters.length);
            return presentCharacters[randomIndex];
        }

        return null;
    };

    const char = findCharacterForScene();
    
    if (char) {
        setAmbientCharacter(char);
        
        // 睡眠状态判定：客房 + 夜晚
        const isSleeping = currentSceneId === 'scen_2' && worldState.period === 'night';
        // 沐浴状态判定：温泉
        const isBathing = currentSceneId === 'scen_7';

        setIsAmbientSleeping(isSleeping);
        setIsAmbientBathing(isBathing);

        if (isSleeping) {
            setAmbientText("zzz……ZZZ……");
            setCurrentSprite(''); // 隐藏立绘
        } else {
            // 设置立绘
            // 环境模式下，温泉使用 nude 状态，其他默认
            const ambientState = isBathing ? 'nude' : 'default';
            const sprite = getCharacterSprite(char, ambientState, 'normal');
            setCurrentSprite(sprite);
            
            // Tavern Rule (scen_3): Only Mina speaks. If not Mina, suppress text.
            if (currentSceneId === 'scen_3' && char.id !== 'char_102') {
                setAmbientText('');
            } else {
                // 生成环境台词 (包含温泉特殊逻辑)
                generateAmbientLine(char, ambientState);
            }
        }
    }

  }, [currentSceneId, worldState.period, isDialogueMode, isSceneTransitioning, sceneParams, presentCharacters]);

  const generateAmbientLine = async (char: Character, state: ClothingState) => {
      if (!settings.apiConfig.apiKey) {
          setAmbientText("......");
          return;
      }

      setIsAmbientLoading(true);
      try {
          // 初始化 LLM (重置上下文)
          await initLLM(char);
          
          const stats = CHARACTER_STATS[char.id] || { level: 1, affinity: 0 };
          let prompt = "";

          // 特殊场景判定：温泉
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
          
          // 如果生成了表情，更新立绘
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

  // Audio Control - Volume (Normal update)
  useEffect(() => {
    // Only update volume directly if NOT fading. If fading, the fade loop handles the target.
    if (audioRef.current && !fadeIntervalRef.current) {
        audioRef.current.volume = settings.isMuted ? 0 : Math.max(0, Math.min(1, settings.masterVolume / 100));
    }
  }, [settings.masterVolume, settings.isMuted]);

  // Audio Control - Scene BGM with Crossfade
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const bgmFile = SCENE_BGM[currentSceneId];
    const targetSrc = bgmFile ? resolveImgPath(bgmFile) : "";
    const maxVolume = settings.isMuted ? 0 : Math.max(0, Math.min(1, settings.masterVolume / 100));

    // Clear any ongoing fade operation
    if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
    }

    // Check if we are already playing the target track
    if (audio.src === targetSrc) {
        // If volume is low (e.g. interrupted fade out), fade back up
        if (!audio.paused && audio.volume < maxVolume) {
             const stepTime = 50;
             const stepVol = maxVolume / 10; // ~0.5s restore
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

    // Fade Configuration
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

    // Logic: If playing, fade out first, then switch. If stopped, fade in directly.
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

  // Background Image Logic
  const currentSceneLevel = SCENE_LEVELS[currentSceneId] || 1;
  const currentBgUrl = getSceneBackground(currentSceneId, worldState.period, currentSceneLevel);

  // Initialize Chat (Connection Status Only)
  useEffect(() => {
     if (!settings.apiConfig.apiKey) {
       setConnectionStatus('disconnected');
     } else {
       setConnectionStatus('connected');
     }
  }, [settings.apiConfig]);

  const initLLM = async (char: Character) => {
    const dynamicUserInfo = USER_INFO_TEMPLATE.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    // Pass enableNSFW to generateSystemPrompt
    let systemPrompt = generateSystemPrompt(char, dynamicUserInfo, settings.innName, settings.enableNSFW);
    systemPrompt = systemPrompt.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    const fullPrompt = `${systemPrompt}\n\n${dynamicUserInfo}`;
    await llmService.initChat(char, fullPrompt, settings.apiConfig);
  };

  // --- Handlers ---

  const handleNavigate = (sceneId: SceneId, params?: any) => {
    if (isSceneTransitioning) return;
    if (sceneId === currentSceneId && JSON.stringify(params) === JSON.stringify(sceneParams)) return;

    // Start Transition
    setIsSceneTransitioning(true);
    setTransitionOpacity(1); // Fade out to black

    // Wait for fade out animation (500ms match with CSS)
    setTimeout(() => {
        // Perform State Updates while hidden
        setCurrentSceneId(sceneId);
        setSceneParams(params || {});
        setIsDialogueMode(false); // Reset dialogue mode on nav
        setIsDialogueEnding(false);
        setErrorMessage(null);
        setActiveCharacter(null); // Clear character on nav
        setClothingState('default'); // Reset clothing
        
        // Clear ambient state on manual navigation (will rely on effect to repopulate)
        setAmbientCharacter(null);
        setAmbientText('');
        setIsAmbientSleeping(false);
        setIsAmbientBathing(false);
        
        // Update World State Scene Name
        const newSceneName = getSceneDisplayName(sceneId, params);
        // Force calculation of present characters for the new scene instantly (avoiding 1-frame lag)
        const newState = calculateWorldState(newSceneName);
        setWorldState(newState);
        
        // Recalculate locations on scene change just in case time jumped or to ensure consistency
        const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr);
        setCharacterLocations(locs);

        // Wait a short moment then Fade In
        setTimeout(() => {
            setTransitionOpacity(0); // Fade in from black
            
            // Allow input after fade in complete
            setTimeout(() => {
                setIsSceneTransitioning(false);
            }, 500);
        }, 100);
    }, 500);
  };

  const handleAction = (action: string, param?: any) => {
    console.log(`Action triggered: ${action}`, param);
    // Placeholder logic for actions
    if (action === 'rest') {
       // Logic to advance time...
    }
  };

  const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    const char = CHARACTERS[characterId];
    if (!char) return;

    // 判定衣着状态
    let nextClothingState: ClothingState = 'default';
    if (
        (actionType === 'peep' || actionType === 'bath_together') || // scen_7
        (actionType === 'massage_give' || actionType === 'massage_receive') // scen_8
    ) {
        nextClothingState = 'nude';
    }
    
    setClothingState(nextClothingState);
    setActiveCharacter(char);
    
    // 初始立绘
    const sprite = getCharacterSprite(char, nextClothingState, 'normal');
    setCurrentSprite(sprite);
    
    // 重置对话内容，防止显示上一次对话或默认文本
    setCurrentDialogue({ speaker: char.name, text: "..." });
    
    setIsDialogueMode(true);
    setIsDialogueEnding(false);
    
    // Get stats
    const stats = CHARACTER_STATS[characterId] || { level: 1, affinity: 0 };
    
    // Switch LLM Context & Generate Context-Aware Opening
    if (connectionStatus === 'connected') {
        setIsLoading(true);
        try {
            await initLLM(char);
            
            // 构建隐式上下文提示词，要求 AI 生成开场白
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
            
            // 只将 AI 的回复添加到显示历史中
            setHistory(prev => [...prev, { 
                speaker: char.name, 
                text: displayText, 
                timestamp: Date.now(), 
                type: 'npc', 
                avatarUrl: char.avatarUrl,
                tokens: response.usage?.completion_tokens // 记录开场白消耗 (回复 Token)
            }]);

            if (response.emotion) {
                const emotionSprite = getCharacterSprite(char, nextClothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
            
            setIsTyping(true);
        } catch(e) {
            console.error(e);
            setErrorMessage("角色初始化失败");
            // Fallback greeting if AI fails
            setCurrentDialogue({ speaker: char.name, text: `*(${char.name}看着你)* ...有什么事吗？` });
        } finally {
            setIsLoading(false);
        }
    } else {
        // Offline fallback
        setCurrentDialogue({ speaker: char.name, text: `*(${char.name}似乎正在发呆)* ...` });
    }
  };

  // 生成告别语并进入结束状态
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
        setIsDialogueEnding(true); // 标记为正在结束，UI将锁定并等待点击退出

    } catch(e) {
        console.error(e);
        // Fallback
        setCurrentDialogue({ speaker: activeCharacter.name, text: `*(${activeCharacter.name}点了点头)* 回见。` });
        setIsTyping(true);
        setIsDialogueEnding(true);
    } finally {
        setIsLoading(false);
    }
  };

  // 最终退出对话模式
  const handleFinalClose = () => {
      setIsDialogueMode(false);
      setIsDialogueEnding(false);
      setActiveCharacter(null);
      setClothingState('default');
      // Exit calls ambient effect to re-evaluate, handled by useEffect dependency on isDialogueMode
  };

  // 处理道具获得
  const handleItemsGained = (items: { id: string; count: number }[]) => {
      if (!items || items.length === 0) return;

      const newNotifications: typeof itemNotifications = [];
      const newInventory = { ...inventory };

      items.forEach(item => {
          if (item.id && item.count > 0) {
              // Update Inventory
              newInventory[item.id] = (newInventory[item.id] || 0) + item.count;
              
              // Add Notification
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
    // 先添加用户消息到历史记录
    setHistory(prev => [...prev, { speaker: settings.userName, text: userMessage, timestamp: Date.now(), type: 'user', avatarUrl: 'img/face/1.png' }]);

    try {
      const contextBlock = `\n[当前环境]\n场景: ${worldState.sceneName}\n时间: ${worldState.timeStr}\n衣着: ${clothingState}\n`;
      const enrichedMessage = `${contextBlock}\n用户发言: "${userMessage}"`;
      
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
      
      setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
      
      // Handle Item Gain
      if (response.items && response.items.length > 0) {
          handleItemsGained(response.items);
      }

      // NSFW Mode: Check for clothing state changes from AI
      if (settings.enableNSFW && response.clothing) {
          // Normalize and check valid states
          const newClothing = response.clothing.toLowerCase();
          if (['default', 'nude', 'bondage'].includes(newClothing) && newClothing !== clothingState) {
              setClothingState(newClothing as ClothingState);
          }
      }

      setHistory(prev => {
        const newHistory = [...prev];
        
        // 更新最近的一条用户消息的 Token 数 (prompt_tokens)
        // 从后往前找最近的一条用户消息
        for (let i = newHistory.length - 1; i >= 0; i--) {
            if (newHistory[i].type === 'user' && !newHistory[i].tokens) {
                 if (response.usage) {
                     newHistory[i] = { ...newHistory[i], tokens: response.usage.prompt_tokens };
                 }
                 break; // 只更新最近的一条
            }
        }

        // 添加 AI 回复 (completion_tokens)
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

      // Update sprite based on potentially new clothing state and emotion
      // Note: We use the *new* clothing state if it changed above, but React state update is async.
      // So we calculate the effective state for this render cycle.
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
            
            // Handle Item Gain on Regenerate
            if (response.items && response.items.length > 0) {
                handleItemsGained(response.items);
            }

            // NSFW Mode: Check for clothing state changes from AI on regenerate
            if (settings.enableNSFW && response.clothing) {
                const newClothing = response.clothing.toLowerCase();
                if (['default', 'nude', 'bondage'].includes(newClothing) && newClothing !== clothingState) {
                    setClothingState(newClothing as ClothingState);
                }
            }

            // 更新历史记录中的最后一条 AI 回复
            setHistory(prev => {
                const newHistory = [...prev];
                // 移除旧的 AI 回复 (如果存在)
                if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'npc') {
                     newHistory.pop();
                }
                
                // 同时更新用户消息的 tokens (因为重发了一次)
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

  // Debug Handlers
  const handleOpenDebug = () => {
      setIsDebugMenuOpen(!isDebugMenuOpen);
      setIsScheduleViewerOpen(false); // Reset viewer when toggling menu
  };

  // --- Render Scene Component ---
  const renderScene = () => {
    const commonProps = {
        onNavigate: handleNavigate,
        onAction: handleAction,
        onEnterDialogue: handleEnterDialogue,
        isMenuVisible: !isDialogueMode,
        worldState,
        targetCharacterId: sceneParams.target,
        settings, // Pass settings to all scenes
        presentCharacters, // Pass dynamic presence data
        inventory // Pass inventory data
    };

    switch(currentSceneId) {
        case 'scen_1': return <Scen1 {...commonProps} />;
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

  const currentStats = activeCharacter ? (CHARACTER_STATS[activeCharacter.id] || { level: 1, affinity: 0 }) : { level: 1, affinity: 0 };
  const ambientStats = ambientCharacter ? (CHARACTER_STATS[ambientCharacter.id] || { level: 1, affinity: 0 }) : { level: 1, affinity: 0 };

  return (
    <div 
        className="relative w-full h-full bg-black overflow-hidden" 
        onClick={() => { if (isUIHidden) setIsUIHidden(false); }}
    >
      {/* Background Music */}
      <audio ref={audioRef} loop className="hidden" />

      {/* Visual Transition Overlay */}
      <div 
        className="absolute inset-0 bg-black z-[80] pointer-events-none transition-opacity ease-in-out duration-500"
        style={{ opacity: transitionOpacity }}
      />

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img src={resolveImgPath(currentBgUrl)} alt="BG" className="w-full h-full object-cover transition-all duration-700" />
        
        {/* Cinematic Overlay - Corner Vignette Style */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10" />
      </div>

      {/* --- Sprite Layers --- */}

      {/* 1. Active Dialogue Sprite (Center) */}
      <div className={`absolute inset-0 z-10 flex items-end justify-center pointer-events-none transition-all duration-500 ${isDialogueMode ? '-translate-y-[2%] opacity-100' : 'translate-y-10 opacity-0'}`}>
         {isDialogueMode && currentSprite && (
            <img 
                src={resolveImgPath(currentSprite)} 
                alt="Sprite" 
                className="h-[100%] md:h-[95%] object-contain drop-shadow-2xl" 
            />
         )}
      </div>

      {/* 2. Ambient Sprite (Left Side) - Only if NOT in dialogue mode and awake */}
      {/* Moved from 25% to 30% as requested */}
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

      {/* Global UI Wrapper */}
      <div className={`absolute inset-0 z-50 transition-opacity duration-500 pointer-events-none ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>
          
          <GameEnvironmentWidget worldState={worldState} />

          {/* Item Notification Area */}
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

          {/* Debug Menu Dropdown */}
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

          {/* Schedule Viewer Modal */}
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
                              // Filter dynamically calculated locations
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

          {/* Render Current Scene Menu Actions */}
          {/* Note: renderScene returns components with pointer-events-auto internally where needed */}
          <div className="pointer-events-auto">
             {renderScene()}
          </div>

          {/* --- Ambient Dialogue Box (Bottom) --- */}
          {/* Renders when in ambient mode (character present, not in active chat) */}
          {!isDialogueMode && ambientCharacter && ambientText && showAmbientDialogue && (
              <div className="absolute bottom-4 w-full flex flex-col items-center pointer-events-auto z-40 animate-fadeIn">
                  <div className="relative w-full px-0 md:px-4 mb-2">
                      <DialogueBox 
                          speaker={ambientCharacter.name}
                          text={ambientText}
                          isTyping={true} // Re-animate on text change
                          typingEnabled={settings.enableTypewriter}
                          transparency={settings.dialogueTransparency}
                          // Hide interactive controls except HideUI
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

          {/* --- Active Chat Interface --- */}
          {isDialogueMode && activeCharacter && (
              <ChatInterface 
                 currentDialogue={currentDialogue}
                 isTyping={isTyping}
                 setIsTyping={setIsTyping}
                 settings={settings}
                 onHideUI={() => setIsUIHidden(true)}
                 onShowHistory={() => setShowHistory(true)}
                 onShowDebugLog={() => setShowDebugLog(true)} // 新增
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
      
      {/* 新增：调试日志模态框 */}
      <DebugLogModal isOpen={showDebugLog} onClose={() => setShowDebugLog(false)} logs={debugLogs} />
    </>
  );
};

export default GameScene;
