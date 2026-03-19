import React from 'react';

interface BattleLogEntry {
  turn: number;
  description: string;
}

interface BattleLogProps {
  logs: BattleLogEntry[];
  isMobile: boolean;
  userName: string;
}

const BattleLog: React.FC<BattleLogProps> = ({ logs, isMobile, userName }) => {
  if (isMobile || logs.length === 0) return null;
  
  const formatDescription = (description: string): string => {
    return description.replace(/{{user}}/g, userName);
  };
  
  return (
    <div className="absolute right-4 bottom-4 z-40 w-64 md:w-80">
      <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
        <div className="bg-[#382b26] px-3 py-1.5 border-b border-[#9b7a4c]">
          <div className="text-[#f0e6d2] text-xs font-bold tracking-wide">
            战斗日志
          </div>
        </div>
        
        <div className="max-h-32 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {logs.slice(-5).reverse().map((log, index) => (
            <div
              key={`log-${index}`}
              className="text-[10px] text-[#f0e6d2]/80 leading-relaxed"
            >
              <span className="text-[#9b7a4c]">[{log.turn}]</span> {formatDescription(log.description)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleLog;
