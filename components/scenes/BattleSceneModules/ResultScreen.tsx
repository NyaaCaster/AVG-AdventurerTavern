import React from 'react';
import { BattleEndReason } from '../../../battle-system/player-commands';

interface ResultScreenProps {
  endReason: BattleEndReason | null;
  onClose: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ endReason, onClose }) => {
  if (!endReason) return null;
  
  if (endReason === 'victory') return null; // 胜利界面由 VictoryScreen 处理
  
  const getResultConfig = () => {
    switch (endReason) {
      case 'escaped':
        return {
          title: '成功逃脱！',
          icon: 'fa-person-running',
          iconColor: 'text-cyan-600',
          description: '成功脱离了战斗'
        };
      case 'defeat':
        return {
          title: '战败...',
          icon: 'fa-skull',
          iconColor: 'text-red-600',
          description: '队伍全灭，战斗失败...'
        };
      default:
        return {
          title: '战斗结束',
          icon: 'fa-flag',
          iconColor: 'text-gray-600',
          description: ''
        };
    }
  };
  
  const config = getResultConfig();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-[#e8dfd1] rounded-xl border-2 sm:border-4 border-[#9b7a4c] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center mx-4 max-w-sm w-full">
        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${config.iconColor} mb-3 sm:mb-4`}>
          <i className={`fa-solid ${config.icon} mr-1 sm:mr-2`} />
          {config.title}
        </div>
        
        <div className="text-[#382b26] mb-4 sm:mb-6 text-sm sm:text-base">
          {config.description}
        </div>
        
        <button
          onClick={onClose}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#382b26] text-[#f0e6d2] rounded-lg border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all font-bold text-sm sm:text-base"
        >
          确认
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
