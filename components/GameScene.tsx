
import React, { useState, useEffect, useRef } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { getSceneBackground } from '../utils/sceneUtils';
import { llmService } from '../services/llmService';
import DialogueBox from './DialogueBox'; // Ensure explicit import
import DialogueLogModal from './DialogueLogModal';
import DebugLogModal from './DebugLogModal';
import GameEnvironmentWidget from './GameEnvironmentWidget';
import SystemMenu from './SystemMenu';
import ChatInterface from './ChatInterface';
import { generateSystemPrompt, USER_INFO_TEMPLATE, CHARACTERS } from '../data/scenarioData';
import { GameSettings, ConfigTab, WorldState, DialogueEntry, SceneId, Character, LogEntry } from '../types';

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

const SCENE_BGM: Record<SceneId, string> = {
  'scen_1': 'audio/bgm/bgm_scen_1.ogg',
  'scen_2': 'audio/bgm/bgm_scen_2.ogg',
  'scen_3': 'audio/bgm/bgm_scen_3.ogg',
  'scen_4': 'audio/bgm/bgm_scen_4.ogg',
  'scen_5': 'audio/bgm/bgm_scen_5.ogg',
  'scen_6': 'audio/bgm/bgm_scen_6.ogg',
  'scen_7': 'audio/bgm/bgm_scen_7.ogg',
  'scen_8': 'audio/bgm/bgm_scen_8.ogg',
  'scen_9': 'audio/bgm/bgm_scen_9.ogg',
  'scen_10': 'audio/bgm/bgm_scen_10.ogg'
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

const GameScene: React.FC<GameSceneProps> = ({ onBackToMenu, onOpenSettings, onLoadGame, settings }) => {
  // State
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>('scen_1');
  const [sceneParams, setSceneParams] = useState<any>({});
  
  const [worldState, setWorldState] = useState<WorldState>(() => calculateWorldState(getSceneDisplayName('scen_1')));
  
  const [isDialogueMode, setIsDialogueMode] = useState(false);
  const [isDialogueEnding, setIsDialogueEnding] = useState(false); // 新增：是否处于对话结束确认阶段
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  
  // Ambient Mode State
  const [ambientCharacter, setAmbientCharacter] = useState<Character | null>(null);
  const [ambientText, setAmbientText] = useState<string>('');
  const [isAmbientLoading, setIsAmbientLoading] = useState(false);
  const [isAmbientSleeping, setIsAmbientSleeping] = useState(false); // 是否处于睡眠状态

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

  // Time Loop
  useEffect(() => {
    const timer = setInterval(() => {
        setWorldState(prev => calculateWorldState(prev.sceneName));
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

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
    
    // 如果正在正式对话或转场中，不触发环境逻辑
    if (isDialogueMode || isSceneTransitioning) return;

    const findCharacterForScene = () => {
        // Special logic for Guest Rooms (scen_2)
        if (currentSceneId === 'scen_2' && sceneParams?.target && sceneParams.target !== 'user') {
            return CHARACTERS[sceneParams.target];
        }

        // Check schedules for other characters
        const chars = Object.values(CHARACTERS);
        const period = worldState.period; // day, evening, night
        
        // Find characters who are scheduled to be here
        const presentChars = chars.filter(char => {
            const schedule = char.schedule;
            return schedule && schedule[period]?.includes(currentSceneId);
        });

        // Simple logic: pick the first one found. 
        // Future: could implement randomness or priority if multiple chars present.
        return presentChars.length > 0 ? presentChars[0] : null;
    };

    const char = findCharacterForScene();
    
    if (char) {
        setAmbientCharacter(char);
        
        // 睡眠状态判定：客房 + 夜晚
        const isSleeping = currentSceneId === 'scen_2' && worldState.period === 'night';
        setIsAmbientSleeping(isSleeping);

        if (isSleeping) {
            setAmbientText("zzz……ZZZ……");
            setCurrentSprite(''); // 隐藏立绘
        } else {
            // 设置立绘
            setCurrentSprite(char.spriteUrl);
            // 生成环境台词
            generateAmbientLine(char);
        }
    }

  }, [currentSceneId, worldState.period, isDialogueMode, isSceneTransitioning, sceneParams]);

  const generateAmbientLine = async (char: Character) => {
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
          if (response.emotion && char.emotions && char.emotions[response.emotion]) {
              setCurrentSprite(char.emotions[response.emotion]);
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
        
        // Clear ambient state on manual navigation (will rely on effect to repopulate)
        setAmbientCharacter(null);
        setAmbientText('');
        setIsAmbientSleeping(false);
        
        // Update World State Scene Name
        const newSceneName = getSceneDisplayName(sceneId, params);
        setWorldState(prev => ({ ...prev, sceneName: newSceneName }));

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

    setActiveCharacter(char);
    setCurrentSprite(char.spriteUrl);
    
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

            if (response.emotion && char.emotions && char.emotions[response.emotion]) {
                setCurrentSprite(char.emotions[response.emotion]);
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
            
            if (response.emotion && activeCharacter.emotions && activeCharacter.emotions[response.emotion]) {
                setCurrentSprite(activeCharacter.emotions[response.emotion]);
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
      // Exit calls ambient effect to re-evaluate, handled by useEffect dependency on isDialogueMode
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
      const contextBlock = `\n[当前环境]\n场景: ${worldState.sceneName}\n时间: ${worldState.timeStr}\n`;
      const enrichedMessage = `${contextBlock}\n用户发言: "${userMessage}"`;
      
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
      
      setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
      
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

      if (response.emotion && activeCharacter.emotions && activeCharacter.emotions[response.emotion]) {
        setCurrentSprite(activeCharacter.emotions[response.emotion]);
      } else {
        setCurrentSprite(activeCharacter.spriteUrl);
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
            
            // 更新历史记录中的最后一条 AI 回复
            setHistory(prev => {
                const newHistory = [...prev];
                // 移除旧的 AI 回复 (如果存在)
                // 注意：llmService.redoLastMessage 已经在内部移除了历史，但前端 UI state 需要同步
                // 在简单的实现中，我们假设最后一条是 AI 的旧回复，我们替换它或者添加新的
                // 为了简化，我们直接追加新的回复，实际逻辑可能需要更严谨地清理旧 UI 节点
                
                // 但由于 redoLastMessage 的逻辑是基于后端历史栈的，
                // 前端显示可能已经有了一条 AI 消息。
                // 我们可以选择删除最后一条 NPC 消息然后添加新的。
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

             if (response.emotion && activeCharacter.emotions && activeCharacter.emotions[response.emotion]) {
                setCurrentSprite(activeCharacter.emotions[response.emotion]);
            }
         }
     } catch (e) {
         setErrorMessage("重生成失败");
     } finally {
         setIsLoading(false);
     }
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
        settings // Pass settings to all scenes
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
      <div className={`absolute inset-0 z-10 flex items-end pointer-events-none transition-all duration-700 ${(!isDialogueMode && ambientCharacter && !isAmbientSleeping) ? 'opacity-100' : 'opacity-0'}`}>
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
          />

          {/* Render Current Scene Menu Actions */}
          {/* Note: renderScene returns components with pointer-events-auto internally where needed */}
          <div className="pointer-events-auto">
             {renderScene()}
          </div>

          {/* --- Ambient Dialogue Box (Bottom) --- */}
          {/* Renders when in ambient mode (character present, not in active chat) */}
          {!isDialogueMode && ambientCharacter && ambientText && (
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
                          onEndDialogue={undefined} 
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
    </div>
  );
};

export default GameScene;
