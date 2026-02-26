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
  onShowDebugLog?: () => void; // 鏂板
  
  inputText: string;
  setInputText: (text: string) => void;
  handleSend: () => void;
  handleRegenerate: () => void;
  
  // 鏂板锛氬鐞嗙粨鏉熷璇濋€昏緫
  handleEndDialogueGeneration: () => void;
  handleFinalClose: () => void;
  isEnding: boolean; // 鏄惁澶勪簬鍛婂埆鏂囨湰鏄剧ず瀹岀瓑寰呴€€鍑虹殑鐘舵€?
  isLoading: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onOpenSettings: (tab?: ConfigTab) => void;
  
  stats?: { level: number; affinity: number };
  affinityChange?: number; // 鏂板锛氬ソ鎰熷害鍙樺寲鍊?  sessionAffinityTotal?: number; // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 褰撳墠瀵硅瘽濂芥劅搴︾疮璁?  clothingState?: string; // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 褰撳墠琛ｇ潃鐘舵€?}

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
  stats = { level: 1, affinity: 0 },
  affinityChange,
  sessionAffinityTotal = 0,
  clothingState = 'default'
}) => {

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 濡傛灉澶勪簬缁撴潫鐘舵€侊紝鏄剧ず鍏ㄥ睆鐐瑰嚮灞傦紝鐐瑰嚮浠绘剰浣嶇疆閫€鍑?*/}
      {isEnding && !isTyping && (
          <div 
            onClick={handleFinalClose}
            className="fixed inset-0 z-[100] cursor-pointer pointer-events-auto"
            title="鐐瑰嚮灞忓箷浠绘剰浣嶇疆閫€鍑?
          >
             {/* 鎻愮ず鏂囨湰棰滆壊鍔犳繁浠ラ€傚簲娴呰壊鑳屾櫙锛屼綅缃笅璋冧互鍜岃彍鍗曟寜閽榻?*/}
             <div className="absolute bottom-11 left-1/2 transform -translate-x-1/2 text-amber-900/70 font-bold text-sm animate-pulse tracking-[0.2em] select-none drop-shadow-sm">
                - 鐐瑰嚮浠绘剰浣嶇疆绂诲紑 -
             </div>
          </div>
      )}

      {/* 
         Bottom Container:
         - fixed bottom-0: 纭繚瀹氫綅鍦ㄨ鍙ｅ簳閮?         - padding-bottom: 閫傞厤 iPhone 绛夎澶囩殑搴曢儴瀹夊叏鍖哄煙
      */}
      <div 
        className="absolute bottom-0 w-full z-40 flex flex-col items-center pointer-events-auto transition-all duration-300"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        
        {/* 瀵硅瘽妗嗕綅浜庝笂鏂?*/}
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
            onEndDialogue={!isEnding ? handleEndDialogueGeneration : undefined} // 姝ｅ湪缁撴潫鏃朵笉鍐嶅搷搴旀寜閽?            level={stats.level}
            affinity={stats.affinity}
            affinityChange={affinityChange}
          />
        </div>

        {/* 鐢ㄦ埛杈撳叆鏍忎綅浜庡璇濇涓嬫柟 - 缁撴潫鏃朵笉鏄剧ず */}
        {!isEnding && (
          <div className="w-full max-w-4xl px-4 z-50 animate-fadeIn">
            <div className="relative group flex items-center">
              {/* 杈撳叆妗嗚儗鍏夋晥鏋?*/}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative w-full flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  title="閲嶆柊鐢熸垚瀵硅瘽"
                  className="px-3 bg-indigo-600/20 hover:bg-indigo-500/40 text-indigo-200 hover:text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center border border-indigo-500/10"
                >
                  <i className={`fa-solid fa-rotate-right text-sm ${isLoading ? 'animate-spin' : ''}`}></i>
                </button>
                
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`璇寸偣浠€涔?..`}
                  disabled={isLoading}
                  className="w-full bg-slate-900/20 text-slate-100 border border-slate-700/30 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500/40 backdrop-blur-md shadow-xl placeholder-slate-500 disabled:opacity-50 transition-all font-medium text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputText.trim()}
                  className="px-5 bg-cyan-700/20 hover:bg-cyan-600/40 text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center border border-cyan-500/10"
                  title="鍙戦€佸璇?
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <i className="fa-solid fa-paper-plane text-xs"></i>}
                </button>
              </div>
              
              {/* API 鐘舵€佸井缂╂寚绀哄櫒 */}
              <div 
                onClick={() => onOpenSettings('api')} 
                className="ml-3 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all cursor-pointer group/status shrink-0 w-10"
                title={`渚涘簲鍟? ${settings.apiConfig.provider}\n妯″瀷: ${settings.apiConfig.model || '鏈缃?}\n鐐瑰嚮閰嶇疆`}
              >
                  <div className="relative w-6 h-6 mb-0.5 grayscale group-hover:grayscale-0 transition-all duration-300">
                    {ProviderIcons[settings.apiConfig.provider]}
                    {/* 鐘舵€佺孩鐐?*/}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-slate-900 rounded-full shadow-sm ${
                        connectionStatus === 'connected' ? 'bg-emerald-500' : 
                        connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                    }`} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-300 max-w-[80px] truncate leading-none text-center transform scale-90">
                    {settings.apiConfig.model || '鏈厤缃?}
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

