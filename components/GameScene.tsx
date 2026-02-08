import React, { useState, useEffect, useCallback } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { llmService } from '../services/llmService';
import DialogueBox from './DialogueBox';
import WeatherIcon from './WeatherIcon';
import DialogueLogModal from './DialogueLogModal';
import { CHAR_LILIA, generateSystemPrompt, USER_INFO_TEMPLATE } from '../data/scenarioData';
import { GameSettings, ApiProvider, ConfigTab, WorldState, DialogueEntry } from '../types';

interface GameSceneProps {
  onBackToMenu: () => void;
  onOpenSettings: (tab?: ConfigTab) => void;
  settings: GameSettings;
  onLoadGame?: () => void;
}

const ProviderIcons: Record<ApiProvider, React.ReactNode> = {
  openai_compatible: (
     <img src={resolveImgPath("img/svg/free-chat.svg")} alt="Ollama" className="w-full h-full object-contain opacity-90" />
  ),
  google: (
    <img src={resolveImgPath("img/svg/gemini-logo.svg")} alt="Gemini" className="w-full h-full object-contain opacity-90" />
  ),
  deepseek: (
    <img src={resolveImgPath("img/svg/deepseek-logo.svg")} alt="DeepSeek" className="w-full h-full object-contain opacity-90" />
  ),
  openai: (
    <img src={resolveImgPath("img/svg/chatgpt-logo_white.svg")} alt="OpenAI" className="w-full h-full object-contain opacity-90" />
  ),
  claude: (
    <img src={resolveImgPath("img/svg/claude-logo.svg")} alt="Claude" className="w-full h-full object-contain opacity-90" />
  )
};

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

const calculateWorldState = (): WorldState => {
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
      weather
  };
};

const getInitialDialogueText = (): string => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) {
      return "*(正在整理柜台上的入住登记簿，听到脚步声抬起头，露出了明媚的笑容)* 哟，早安啊，我的大英雄弟弟。今天起得可真早，昨晚睡得好吗？";
  } else if (h >= 11 && h < 14) {
      return "*(正在核对午餐的账单，看到你下来，随手递给你一杯水)* 哟，中午好啊。虽然有些忙碌，但看到你精神不错的样子我就放心了。";
  } else if (h >= 14 && h < 17) {
      return "*(慵懒地撑着下巴看着门外的街道，看到你走近便转过头来)* 哟，下午好啊。这种午后的阳光真让人想偷个懒呢，不是吗？";
  } else if (h >= 17 && h < 22) {
      return "*(正在擦拭柜台上的酒杯，看到你走过来，停下手中的动作笑了笑)* 哟，晚上好啊。酒馆那边已经开始热闹起来了，要去喝一杯吗？还是留下来陪姐姐看店？";
  } else {
      return "*(借着微弱的烛光在核对账目，听到动静有些惊讶地抬起头，压低声音说道)* 嘘... 这么晚了还不睡吗？难道是睡不着，想找姐姐说悄悄话？";
  }
};

const TimeWidget: React.FC<{ worldState: WorldState }> = ({ worldState }) => {
  const { dateStr, weekDay, timeStr, period, periodLabel, weatherCode } = worldState;
  let colorClass = "text-indigo-600";
  let weatherColor = "text-slate-400";
  
  if (period === 'day') {
    colorClass = "text-amber-600";
    weatherColor = "text-amber-500";
  } else if (period === 'evening') {
    colorClass = "text-orange-600";
    weatherColor = "text-orange-400";
  }

  return (
    <div className="absolute top-8 left-8 z-40 flex items-center gap-3 select-none pointer-events-none">
        <div className="h-10 flex flex-col items-center justify-between py-1 filter drop-shadow-md">
            <div className="w-1.5 h-1.5 bg-[#fdfbf7] rounded-full"></div>
            <div className="w-0.5 flex-1 bg-white/90 my-1 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-[#fdfbf7] rounded-full"></div>
        </div>
        <div 
            className="h-14 flex items-center pl-6 pr-16 border-l-[6px] border-amber-500 rounded-sm backdrop-blur-[1px]"
            style={{
                background: 'linear-gradient(90deg, rgba(253, 251, 247, 0.95) 0%, rgba(253, 251, 247, 0.8) 65%, rgba(253, 251, 247, 0) 100%)'
            }}
        >
             <div className="flex flex-col justify-center">
                 <div className="flex items-baseline gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider leading-none mb-0.5">
                     <span>{dateStr}</span>
                     <span>{weekDay}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-800 leading-none">
                     <span className="text-3xl font-black font-mono tabular-nums tracking-tight italic" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>
                        {timeStr}
                     </span>
                     <div className="flex items-center gap-1.5">
                        <span className={`text-lg font-black ${colorClass}`}>
                            ({periodLabel})
                        </span>
                        <div className={`w-6 h-6 ${weatherColor} drop-shadow-sm ml-1`}>
                            <WeatherIcon code={weatherCode} />
                        </div>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};

const GameScene: React.FC<GameSceneProps> = ({ onBackToMenu, onOpenSettings, onLoadGame, settings }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');
  const [worldState, setWorldState] = useState<WorldState>(calculateWorldState());
  const [currentDialogue, setCurrentDialogue] = useState<{ speaker: string; text: string }>({
    speaker: CHAR_LILIA.name,
    text: getInitialDialogueText()
  });
  const [currentSprite, setCurrentSprite] = useState(CHAR_LILIA.emotions?.happy || CHAR_LILIA.spriteUrl);
  const [isTyping, setIsTyping] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // UI Visibility State
  const [isUIHidden, setIsUIHidden] = useState(false);

  // Dialogue History State
  const [history, setHistory] = useState<DialogueEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
        setWorldState(calculateWorldState());
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const bgPaths: Record<string, string> = {
    day: "img/bg/AdventurerTavern/scen_1_inn/bg_inn_lv1_day.png",
    evening: "img/bg/AdventurerTavern/scen_1_inn/bg_inn_lv1_evenfall.png",
    night: "img/bg/AdventurerTavern/scen_1_inn/bg_inn_lv1_night.png"
  };

  useEffect(() => {
    const initGame = async () => {
      if (!settings.apiConfig.apiKey) {
        setConnectionStatus('disconnected');
        return;
      }
      setConnectionStatus('connecting');
      setErrorMessage(null);
      setHistory([]); // 清空历史记录
      try {
        const dynamicUserInfo = USER_INFO_TEMPLATE.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
        
        // 使用新的 Prompt 生成器
        let systemPrompt = generateSystemPrompt(CHAR_LILIA, dynamicUserInfo, settings.innName);
        systemPrompt = systemPrompt.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);

        const fullPrompt = `${systemPrompt}\n\n${dynamicUserInfo}`;
        await llmService.initChat(CHAR_LILIA, fullPrompt, settings.apiConfig);
        
        // Add initial greeting to history
        const initialText = getInitialDialogueText();
        setHistory([{
            speaker: CHAR_LILIA.name,
            text: initialText,
            timestamp: Date.now(),
            type: 'npc',
            avatarUrl: CHAR_LILIA.avatarUrl
        }]);
        
        setConnectionStatus('connected');
      } catch (error) {
        console.error("Init failed", error);
        setErrorMessage(`初始化失败: ${error instanceof Error ? error.message : 'Unknown Error'}`);
        setConnectionStatus('disconnected');
      }
    };
    initGame();
  }, [settings.userName, settings.innName, settings.apiConfig]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    if (connectionStatus === 'disconnected' && !settings.apiConfig.apiKey) {
        setErrorMessage("请先在设置中配置 API Key (API 密钥)。");
        return;
    }
    const userMessage = inputText;
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);
    if (connectionStatus === 'disconnected') setConnectionStatus('connecting');

    // Add user message to history
    setHistory(prev => [...prev, {
        speaker: settings.userName,
        text: userMessage,
        timestamp: Date.now(),
        type: 'user',
        avatarUrl: 'img/face/1.png'
    }]);

    try {
      const contextBlock = `\n[当前环境信息]\n日期: ${worldState.dateStr} ${worldState.weekDay}\n时间: ${worldState.timeStr} (${worldState.periodLabel})\n天气: ${worldState.weather}\n`;
      const enrichedMessage = `${contextBlock}\n用户发言: "${userMessage}"`;
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
      
      setCurrentDialogue({ speaker: CHAR_LILIA.name, text: displayText });
      
      // Add NPC message to history
      setHistory(prev => [...prev, {
          speaker: CHAR_LILIA.name,
          text: displayText,
          timestamp: Date.now(),
          type: 'npc',
          avatarUrl: CHAR_LILIA.avatarUrl
      }]);

      if (response.emotion && CHAR_LILIA.emotions && CHAR_LILIA.emotions[response.emotion]) {
        setCurrentSprite(CHAR_LILIA.emotions[response.emotion]);
      } else {
        setCurrentSprite(CHAR_LILIA.spriteUrl);
      }
      setIsTyping(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error("Chat error", error);
      setErrorMessage(`通信故障: ${error instanceof Error ? error.message : 'Unknown Error'}`);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (isLoading) return;
    if (connectionStatus === 'disconnected' && !settings.apiConfig.apiKey) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    // Optimistically update history: remove last NPC message if it exists
    setHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1].type === 'npc') {
            return prev.slice(0, -1);
        }
        return prev;
    });

    try {
        const response = await llmService.redoLastMessage();
        if (response) {
            const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
            setCurrentDialogue({ speaker: CHAR_LILIA.name, text: displayText });
            
            // Add regenerated NPC message to history
            setHistory(prev => [...prev, {
                speaker: CHAR_LILIA.name,
                text: displayText,
                timestamp: Date.now(),
                type: 'npc',
                avatarUrl: CHAR_LILIA.avatarUrl
            }]);

            if (response.emotion && CHAR_LILIA.emotions && CHAR_LILIA.emotions[response.emotion]) {
                setCurrentSprite(CHAR_LILIA.emotions[response.emotion]);
            } else {
                setCurrentSprite(CHAR_LILIA.spriteUrl);
            }
            setIsTyping(true);
            setConnectionStatus('connected');
        }
    } catch (error) {
        console.error("Regenerate error", error);
        setErrorMessage(`重生成失败: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div 
        className="relative w-full h-full bg-black overflow-hidden" 
        onClick={() => {
            if (isUIHidden) setIsUIHidden(false);
        }}
    >
      <div className="absolute inset-0 z-0">
        <img src={resolveImgPath(bgPaths[worldState.period])} alt="BG" className="w-full h-full object-cover transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
        {/* Mobile: 180% height & shifted down to focus on upper body (zoom effect). Desktop: Standard fit. */}
        <img 
            src={resolveImgPath(currentSprite)} 
            alt="Sprite" 
            className="h-[100%] translate-y-[0%] md:h-[95%] md:translate-y-0 object-contain drop-shadow-2xl transition-all duration-500" 
        />
      </div>

      {/* History Modal */}
      <DialogueLogModal 
         isOpen={showHistory} 
         onClose={() => setShowHistory(false)} 
         history={history} 
      />

      {/* UI Elements Wrapper */}
      <div className={`absolute inset-0 z-50 transition-opacity duration-500 pointer-events-none ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>
          
          <TimeWidget worldState={worldState} />

          {/* Error Message Toast - Enable Pointer Events */}
          {errorMessage && (
            <div 
                onClick={() => setErrorMessage(null)}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[60] max-w-lg w-[90%] bg-red-900/90 border border-red-500/50 text-red-100 px-6 py-4 rounded-lg shadow-2xl backdrop-blur-md cursor-pointer animate-fadeIn hover:bg-red-900 transition-colors flex items-start gap-3 pointer-events-auto"
            >
                <i className="fa-solid fa-triangle-exclamation text-xl mt-0.5 text-red-400"></i>
                <div className="flex-1">
                    <h3 className="font-bold text-red-200 mb-1">系统提示</h3>
                    <p className="text-sm opacity-90 break-words">{errorMessage}</p>
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <i className="fa-regular fa-circle-xmark"></i> 点击此处关闭
                    </p>
                </div>
            </div>
          )}

          {/* Top Buttons - Enable Pointer Events */}
          <div className="absolute top-4 right-4 z-50 flex gap-3 pointer-events-auto">
            <button 
              onClick={() => onLoadGame?.()} 
              className="w-10 h-10 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full border border-white/20 backdrop-blur-md transition-all"
              title="载入进度"
            >
              <i className="fa-solid fa-folder-open"></i>
            </button>
            <button 
              onClick={() => onOpenSettings()} 
              className="w-10 h-10 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full border border-white/20 backdrop-blur-md transition-all"
              title="系统设置"
            >
              <i className="fa-solid fa-gear"></i>
            </button>
            <button 
              onClick={onBackToMenu} 
              className="w-10 h-10 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full border border-white/20 backdrop-blur-md transition-all" 
              title="返回标题画面"
            >
              <i className="fa-solid fa-house"></i>
            </button>
          </div>

          {/* Bottom UI - Enable Pointer Events */}
          <div className="absolute bottom-0 w-full z-40 pb-4 flex flex-col items-center pointer-events-auto">
            
            {/* 对话框位于上方 */}
            <div className="relative w-full px-0 md:px-4 mb-2">
               <DialogueBox 
                 speaker={currentDialogue.speaker}
                 text={currentDialogue.text}
                 isTyping={isTyping}
                 onComplete={() => setIsTyping(false)}
                 typingEnabled={settings.enableTypewriter}
                 transparency={settings.dialogueTransparency}
                 onHideUI={() => setIsUIHidden(true)}
                 onShowHistory={() => setShowHistory(true)}
               />
            </div>

            {/* 用户输入栏位于对话框下方 */}
            <div className="w-full max-w-4xl px-4 z-50">
              <div className="relative group flex items-center">
                {/* 输入框背光效果 */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                
                <div className="relative w-full flex gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    title="重新生成对话"
                    className="px-3 bg-indigo-600/20 hover:bg-indigo-500/40 text-indigo-200 hover:text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center border border-indigo-500/10"
                  >
                    <i className={`fa-solid fa-rotate-right text-sm ${isLoading ? 'animate-spin' : ''}`}></i>
                  </button>
                  
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`对${CHAR_LILIA.name}说点什么...`}
                    disabled={isLoading}
                    className="w-full bg-slate-900/20 text-slate-100 border border-slate-700/30 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500/40 backdrop-blur-md shadow-xl placeholder-slate-500 disabled:opacity-50 transition-all font-medium text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !inputText.trim()}
                    className="px-5 bg-cyan-700/20 hover:bg-cyan-600/40 text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center border border-cyan-500/10"
                    title="发送对话"
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <i className="fa-solid fa-paper-plane text-xs"></i>}
                  </button>
                </div>
                
                {/* API 状态微缩指示器 */}
                <div 
                   onClick={() => onOpenSettings('api')} 
                   className="ml-3 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all cursor-pointer group/status shrink-0 w-10"
                   title={`供应商: ${settings.apiConfig.provider}\n模型: ${settings.apiConfig.model || '未设置'}\n点击配置`}
                >
                    <div className="relative w-6 h-6 mb-0.5 grayscale group-hover:grayscale-0 transition-all duration-300">
                       {ProviderIcons[settings.apiConfig.provider]}
                       {/* 状态红点 */}
                       <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-slate-900 rounded-full shadow-sm ${
                           connectionStatus === 'connected' ? 'bg-emerald-500' : 
                           connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                       }`} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-300 max-w-[80px] truncate leading-none text-center transform scale-90">
                       {settings.apiConfig.model || '未配置'}
                    </span>
                </div>
              </div>
            </div>

          </div>
      </div>
    </div>
  );
};

export default GameScene;
