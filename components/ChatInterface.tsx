
import React from 'react';
import DialogueBox from './DialogueBox';
import { GameSettings, ApiProvider, ConfigTab } from '../types';
import { resolveImgPath } from '../utils/imagePath';

interface ChatInterfaceProps {
  currentDialogue: { speaker: string; text: string };
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  settings: GameSettings;
  onHideUI: () => void;
  onShowHistory: () => void;
  onShowDebugLog?: () => void; // 新增
  
  inputText: string;
  setInputText: (text: string) => void;
  handleSend: () => void;
  handleRegenerate: () => void;
  
  // 新增：处理结束对话逻辑
  handleEndDialogueGeneration: () => void;
  handleFinalClose: () => void;
  isEnding: boolean; // 是否处于告别文本显示完等待退出的状态

  isLoading: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onOpenSettings: (tab?: ConfigTab) => void;
  
  stats?: { level: number; affinity: number };
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

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentDialogue,
  isTyping,
  setIsTyping,
  settings,
  onHideUI,
  onShowHistory,
  onShowDebugLog,
  inputText,
  setInputText,
  handleSend,
  handleRegenerate,
  handleEndDialogueGeneration,
  handleFinalClose,
  isEnding,
  isLoading,
  connectionStatus,
  onOpenSettings,
  stats = { level: 1, affinity: 0 }
}) => {

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 如果处于结束状态，显示全屏点击层，点击任意位置退出 */}
      {isEnding && !isTyping && (
          <div 
            onClick={handleFinalClose}
            className="fixed inset-0 z-[100] cursor-pointer pointer-events-auto"
            title="点击屏幕任意位置退出"
          >
             {/* 提示文本颜色加深以适应浅色背景，位置下调以和菜单按钮对齐 */}
             <div className="absolute bottom-11 left-1/2 transform -translate-x-1/2 text-amber-900/70 font-bold text-sm animate-pulse tracking-[0.2em] select-none drop-shadow-sm">
                - 点击任意位置离开 -
             </div>
          </div>
      )}

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
            onHideUI={onHideUI}
            onShowHistory={onShowHistory}
            onShowDebugLog={onShowDebugLog}
            onEndDialogue={!isEnding ? handleEndDialogueGeneration : undefined} // 正在结束时不再响应按钮
            level={stats.level}
            affinity={stats.affinity}
          />
        </div>

        {/* 用户输入栏位于对话框下方 - 结束时不显示 */}
        {!isEnding && (
          <div className="w-full max-w-4xl px-4 z-50 animate-fadeIn">
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
                  placeholder={`说点什么...`}
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
        )}

      </div>
    </>
  );
};

export default ChatInterface;
