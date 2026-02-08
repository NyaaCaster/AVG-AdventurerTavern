import React, { useEffect, useRef } from 'react';
import { DialogueEntry } from '../types';
import { resolveImgPath } from '../utils/imagePath';

interface DialogueLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DialogueEntry[];
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 简单的格式化函数，与 DialogueBox 保持一致
const formatLogContent = (content: string) => {
    if (!content) return "";
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 括号内容样式化 (暗金色 + 斜体)
    html = html.replace(/(\([^\)]*?\)|（[^\）]*?）)/g, '<span class="italic text-amber-500 font-medium">$1</span>');

    // Markdown 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Markdown 斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 换行
    html = html.replace(/\n/g, '<br/>');

    return html;
};

const DialogueLogModal: React.FC<DialogueLogModalProps> = ({ isOpen, onClose, history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when opened or history updates
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, history]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10 animate-fadeIn">
      <div className="w-full max-w-4xl h-full max-h-[85vh] bg-slate-900/95 border border-[#9b7a4c]/50 rounded-lg shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#9b7a4c]/30 bg-slate-950/50">
          <h2 className="text-xl font-bold text-[#f0e6d2] flex items-center gap-2">
            <i className="fa-solid fa-book-open text-[#9b7a4c]"></i>
            对话记录
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* List Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              暂无对话记录...
            </div>
          ) : (
            history.map((entry, index) => (
              <div key={index} className={`flex gap-4 ${entry.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg ${entry.type === 'user' ? 'border-cyan-700' : 'border-[#9b7a4c]'}`}>
                    <img 
                      src={resolveImgPath(entry.avatarUrl || 'img/face/1.png')} 
                      alt={entry.speaker} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content Bubble */}
                <div className={`flex flex-col max-w-[80%] ${entry.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`font-bold text-sm ${entry.type === 'user' ? 'text-cyan-400' : 'text-[#f0e6d2]'}`}>
                      {entry.speaker}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  
                  <div 
                    className={`px-4 py-3 rounded-lg text-sm md:text-base leading-relaxed shadow-md border ${
                    entry.type === 'user' 
                      ? 'bg-slate-800/80 border-cyan-900/50 text-slate-200 rounded-tr-none' 
                      : 'bg-[#382b26]/80 border-[#9b7a4c]/30 text-[#e8dfd1] rounded-tl-none'
                  }`}
                    dangerouslySetInnerHTML={{ __html: formatLogContent(entry.text) }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-6 py-2 bg-slate-950/80 border-t border-white/5 text-center">
           <span className="text-[10px] text-slate-500 uppercase tracking-widest">Dialogue History Log</span>
        </div>

      </div>
    </div>
  );
};

export default DialogueLogModal;