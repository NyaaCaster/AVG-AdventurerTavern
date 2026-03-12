import React from 'react';

interface BattleLogEntry {
  turn: number;
  description: string;
}

interface BattleLogProps {
  logs: BattleLogEntry[];
  isMobile: boolean;
}

const BattleLog: React.FC<BattleLogProps> = ({ logs, isMobile }) => {
  if (isMobile || logs.length === 0) return null;
  
  return (
    <div className="absolute left-2 sm:left-4 bottom-28 sm:bottom-32 z-40 w-48 sm:w-64 md:w-80">
      <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
        <div className="bg-[#382b26] px-2 sm:px-3 py-1 sm:py-1.5 border-b border-[#9b7a4c]">
          <div className="text-[#f0e6d2] text-[10px] sm:text-xs font-bold tracking-wide">
            战斗日志
          </div>
        </div>
        
        <div className="max-h-24 sm:max-h-32 overflow-y-auto custom-scrollbar p-1.5 sm:p-2 space-y-1">
          {logs.slice(-5).reverse().map((log, index) => (
            <div
              key={`log-${index}`}
              className="text-[9px] sm:text-[10px] text-[#f0e6d2]/80 leading-relaxed"
            >
              <span className="text-[#9b7a4c]">[{log.turn}]</span> {log.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleLog;
