
import React, { useState, useEffect, useRef } from 'react';
import { resolveImgPath } from '../utils/imagePath';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  isTyping: boolean;
  onComplete?: () => void;
  typingEnabled?: boolean;
  transparency?: number;
  onHideUI?: () => void;
  onShowHistory?: () => void;
  onShowDebugLog?: () => void; // 新增
  onEndDialogue?: () => void; // 用于 Chat 模式：结束对话（触发告别）
  onClose?: () => void;       // 用于 Ambient 模式：单纯关闭对话框
  level?: number;
  affinity?: number;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ 
  speaker, 
  text, 
  isTyping, 
  onComplete,
  typingEnabled = true,
  transparency = 40,
  onHideUI,
  onShowHistory,
  onShowDebugLog,
  onEndDialogue,
  onClose,
  level = 1,
  affinity = 0
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const textContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTyping || !typingEnabled) {
      setDisplayedText(text);
      if (isTyping && onComplete) {
        onComplete();
      }
      return;
    }

    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 35);

    return () => clearInterval(interval);
  }, [text, isTyping, onComplete, typingEnabled]);

  // 文本更新时自动滚动到底部
  useEffect(() => {
    if (textContentRef.current) {
      textContentRef.current.scrollTop = textContentRef.current.scrollHeight;
    }
  }, [displayedText]);

  const alpha = transparency / 100;

  // 格式化文本：支持 Markdown 和特定样式
  const formatContent = (content: string) => {
      if (!content) return "";
      
      // 1. 转义 HTML 字符，防止 XSS
      let html = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // 2. 括号内容样式化
      // 匹配中文括号（）或英文括号()，使用非贪婪匹配
      // 以前是暗金色文字，现在改为：黑色字体 + 暗金色阴影 + 斜体
      html = html.replace(/(\([^\)]*?\)|（[^\）]*?）)/g, '<span class="italic text-black font-medium text-shadow-gold">$1</span>');

      // 3. Markdown 粗体 **text**
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // 4. Markdown 斜体 *text*
      // 注意：需在处理完粗体后进行，以免混淆
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // 5. 换行处理
      html = html.replace(/\n/g, '<br/>');

      return html;
  };

  // Ornate SVG End Cap Component
  const OrnateCap = ({ isRight = false }: { isRight?: boolean }) => (
    <svg 
      viewBox="0 0 24 44" 
      className={`h-full w-auto block ${isRight ? 'scale-x-[-1]' : ''}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {/* Background Shape - Dark Brown */}
      <path 
        d="M24,0 L24,44 L12,44 C4,44 -1,32 0,22 C-1,12 4,0 12,0 Z" 
        fill="#382b26" 
      />
      
      {/* Border Lines - Bronze/Gold */}
      <path 
        d="M24,1 L12,1 C5,1 1,11 2,22 C1,33 5,43 12,43 L24,43" 
        fill="none" 
        stroke="#9b7a4c" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Decorative Internal Details */}
      <path 
        d="M16,10 C12,14 12,30 16,34" 
        fill="none" 
        stroke="#9b7a4c" 
        strokeWidth="1.5" 
        opacity="0.6"
      />
      <circle cx="8" cy="22" r="2.5" fill="#9b7a4c" />
      <circle cx="8" cy="22" r="1" fill="#382b26" />
    </svg>
  );

  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 md:px-0 font-sans select-none">
      
      {/* Character Name Tag - Ornate Style with Stats */}
      {speaker && (
        <div className="absolute -top-6 left-6 md:left-12 z-30 flex items-stretch h-11 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
            
            {/* Left Ornament */}
            <div className="h-full">
                <OrnateCap />
            </div>
            
            {/* Center Banner Body */}
            <div className="bg-[#382b26] border-y-2 border-[#9b7a4c] px-3 md:px-5 flex items-center gap-3 md:gap-4 min-w-[10rem] justify-center">
                {/* Speaker Name */}
                <span className="text-[#f0e6d2] text-xl font-bold tracking-widest uppercase text-shadow-sm pb-0.5">
                    {speaker}
                </span>

                {/* Separator */}
                <div className="h-4 w-px bg-[#9b7a4c]/40"></div>

                {/* Stats Group */}
                <div className="flex items-center gap-3 text-sm font-bold pt-0.5">
                    {/* Level */}
                    <span className="text-[#d8b4fe] tracking-tight flex items-center gap-0.5 shadow-black text-shadow-sm">
                        <span className="text-xs opacity-80">Lv.</span>{level}
                    </span>
                    
                    {/* Affinity */}
                    <div className="flex items-center gap-1 text-[#fcd34d] shadow-black text-shadow-sm">
                        <i className="fa-solid fa-heart text-xs text-red-500 animate-pulse"></i>
                        <span>{affinity}</span>
                    </div>
                </div>
            </div>

            {/* Right Ornament */}
            <div className="h-full">
                <OrnateCap isRight />
            </div>
        </div>
      )}

      {/* Main Dialogue Box */}
      <div 
        className="relative w-full border-2 border-[#d6cbb8]/30 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.3)] overflow-hidden backdrop-blur-md transition-all duration-500"
        style={{
            background: `linear-gradient(to bottom, rgba(253, 251, 247, ${alpha}), rgba(244, 240, 230, ${alpha}))`
        }}
      >
         {/* Decorative inner border */}
         <div className="absolute inset-2 border border-[#e8dfd1]/20 rounded-[inherit] pointer-events-none"></div>
         
         {/* 注入滚动条和文字阴影样式 */}
         <style>{`
            .dialogue-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .dialogue-scrollbar::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.02);
            }
            .dialogue-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(155, 122, 76, 0.2);
                border-radius: 10px;
            }
            .dialogue-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(155, 122, 76, 0.5);
            }
            /* 暗色光晕/阴影效果，增强在浅色背景上的立体感 */
            .text-shadow-halo {
                text-shadow: 
                0 2px 4px rgba(0, 0, 0, 0.2),
                0 1px 2px rgba(0, 0, 0, 0.1);
            }
            /* 括号文本专用：暗金色阴影 */
            .text-shadow-gold {
                text-shadow: 0 0 5px rgba(180, 83, 9, 0.5), 0 0 1px rgba(146, 64, 14, 0.3);
            }
         `}</style>

         {/* Chat Mode: End Dialogue Button (Top Right) */}
         {onEndDialogue && (
             <button
                onClick={onEndDialogue}
                className="absolute top-1 right-4 z-50 text-[#9b7a4c] hover:text-red-500 transition-colors py-2 px-3 rounded-full hover:bg-red-500/10 group flex items-center gap-2 text-shadow-halo"
                title="结束对话"
             >
                 <span className="hidden md:inline text-xs font-bold tracking-widest">结束对话</span>
                 <i className="fa-solid fa-right-from-bracket text-lg group-hover:scale-110 transition-transform"></i>
             </button>
         )}

         {/* Ambient Mode: Simple Close Button (Top Right) */}
         {onClose && !onEndDialogue && (
             <button
                onClick={onClose}
                className="absolute top-1 right-4 z-50 text-slate-400 hover:text-slate-600 transition-colors py-2 px-3 rounded-full hover:bg-slate-500/10 group flex items-center gap-2 text-shadow-halo"
                title="关闭对话框"
             >
                 <i className="fa-solid fa-xmark text-lg group-hover:scale-110 transition-transform"></i>
             </button>
         )}

         {/* Text Content */}
         {/* Reduced vertical padding on mobile: pt-8 pb-10 (mobile) vs pt-10 pb-12 (desktop) */}
         <div className="relative pt-8 pb-10 md:pt-10 md:pb-12 px-6 md:px-16 flex flex-col justify-start z-10">

             <div 
                 ref={textContentRef}
                 /* Reduced max-height on mobile: max-h-[6rem] (mobile) vs max-h-[8.5rem] (desktop) */
                 className="text-base md:text-lg font-bold leading-relaxed text-[#1a1512] tracking-wide select-text cursor-default max-h-[6rem] md:max-h-[8.5rem] overflow-y-auto pr-2 dialogue-scrollbar text-shadow-halo scroll-smooth"
             >
                 {/* 使用 dangerouslySetInnerHTML 渲染格式化后的 HTML */}
                 <span dangerouslySetInnerHTML={{ __html: formatContent(displayedText) }} />
                 {isTyping && typingEnabled && (
                    <span className="inline-block w-2.5 h-6 bg-amber-800/40 ml-1 animate-pulse align-text-bottom" />
                 )}
             </div>
         </div>

         {/* Bottom Menu Bar */}
         <div className="absolute bottom-0 left-0 w-full h-10 md:h-11 z-20">
            {/* 调整布局为 justify-between 以便左右分布 */}
            <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10">
                {/* 左侧：运行日志 */}
                <div className="flex items-center">
                    {onShowDebugLog && (
                        <button 
                          onClick={onShowDebugLog}
                          className="group flex items-center gap-1.5 text-[10px] md:text-xs font-black text-[#9b7a4c] hover:text-[#b59666] transition-all uppercase tracking-widest drop-shadow-sm text-shadow-halo"
                        >
                            <i className={`fa-solid fa-terminal group-hover:scale-110 transition-transform text-[#9b7a4c] group-hover:text-[#b59666]`}></i>
                            <span className="hidden md:inline group-hover:underline decoration-[#9b7a4c]/50 underline-offset-4">运行日志</span>
                        </button>
                    )}
                </div>

                {/* 右侧：隐藏UI 和 对话记录 */}
                <div className="flex items-center gap-4 md:gap-6">
                    {onHideUI && (
                        <button 
                          onClick={onHideUI}
                          className="group flex items-center gap-1.5 text-[10px] md:text-xs font-black text-[#9b7a4c] hover:text-[#b59666] transition-all uppercase tracking-widest drop-shadow-sm text-shadow-halo"
                        >
                            <i className={`fa-solid fa-eye-slash group-hover:scale-110 transition-transform text-[#9b7a4c] group-hover:text-[#b59666]`}></i>
                            <span className="hidden md:inline group-hover:underline decoration-[#9b7a4c]/50 underline-offset-4">隐藏UI</span>
                        </button>
                    )}
                    
                    {onShowHistory && (
                        <button 
                          onClick={onShowHistory}
                          className="group flex items-center gap-1.5 text-[10px] md:text-xs font-black text-[#9b7a4c] hover:text-[#b59666] transition-all uppercase tracking-widest drop-shadow-sm text-shadow-halo"
                        >
                            <i className={`fa-solid fa-book group-hover:scale-110 transition-transform text-[#9b7a4c] group-hover:text-[#b59666]`}></i>
                            <span className="hidden md:inline group-hover:underline decoration-[#9b7a4c]/50 underline-offset-4">对话记录</span>
                        </button>
                    )}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DialogueBox;
