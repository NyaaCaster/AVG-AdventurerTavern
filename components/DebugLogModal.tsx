
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface DebugLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
}

const DebugLogModal: React.FC<DebugLogModalProps> = ({ isOpen, onClose, logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
        // 自动滚动到顶部显示最新日志（因为我们是倒序排列的）
        scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, logs]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10 animate-fadeIn">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0c0c0c] border border-slate-700/50 rounded-lg shadow-2xl flex flex-col font-mono text-xs md:text-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1a1a1a]">
          <div className="flex items-center gap-2 text-emerald-500">
            <i className="fa-solid fa-terminal"></i>
            <span className="font-bold tracking-wider">SYSTEM CONSOLE // API LOGS</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Logs Container */}
        <div className="flex-1 overflow-hidden relative bg-[#0c0c0c]">
             <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="text-slate-600 italic p-4 text-center">&gt; No logs available.</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="mb-6 border-b border-slate-800/50 pb-4 last:border-0 group">
                            <div className="flex items-center gap-3 mb-2 opacity-70 group-hover:opacity-100 transition-opacity flex-wrap">
                                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                    log.type === 'request' ? 'bg-blue-900/30 text-blue-400' :
                                    log.type === 'response' ? 'bg-emerald-900/30 text-emerald-400' :
                                    log.type === 'error' ? 'bg-red-900/30 text-red-400' :
                                    'bg-slate-800 text-slate-300'
                                }`}>
                                    {log.type}
                                </span>
                                <span className="text-slate-600 text-[10px] tracking-widest mr-auto">{log.id}</span>

                                {/* Token Usage Display for Responses */}
                                {log.content?.usage && (
                                    <div className="flex items-center gap-3 text-[10px] bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded select-none shadow-sm">
                                        <div className="flex items-center gap-1 text-slate-400" title="Prompt Tokens (Input)">
                                            <i className="fa-solid fa-arrow-up text-[8px]"></i>
                                            <span>{log.content.usage.prompt_tokens}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-400" title="Completion Tokens (Output)">
                                            <i className="fa-solid fa-arrow-down text-[8px]"></i>
                                            <span>{log.content.usage.completion_tokens}</span>
                                        </div>
                                        <div className="border-l border-slate-700 pl-2 ml-1 text-amber-500 font-bold" title="Total Tokens">
                                            {log.content.usage.total_tokens} T
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className={`pl-4 border-l-2 ${
                                log.type === 'request' ? 'border-blue-900/30' :
                                log.type === 'response' ? 'border-emerald-900/30' :
                                log.type === 'error' ? 'border-red-900/30' :
                                'border-slate-800'
                            }`}>
                                <pre className="whitespace-pre-wrap break-all text-slate-300 overflow-x-auto">
                                    {typeof log.content === 'object' 
                                        ? JSON.stringify(log.content, null, 2) 
                                        : String(log.content)
                                    }
                                </pre>
                            </div>
                        </div>
                    ))
                )}
             </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#1a1a1a] border-t border-slate-800 text-slate-500 text-[10px] flex justify-between">
           <span>&gt; _cursor_active</span>
           <span>LOGS RETAINED: {logs.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DebugLogModal;
