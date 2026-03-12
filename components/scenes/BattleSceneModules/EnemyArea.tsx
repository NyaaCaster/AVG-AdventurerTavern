import React from 'react';
import { EnemyUnitWithImage } from './types';
import GaugeBar from './GaugeBar';

interface EnemyAreaProps {
  enemies: (EnemyUnitWithImage | null)[];
  selectedCommand: string | null;
  selectedTarget: string | null;
  onTargetSelect: (targetId: string) => void;
  isMobile: boolean;
}

const EnemyArea: React.FC<EnemyAreaProps> = ({
  enemies,
  selectedCommand,
  selectedTarget,
  onTargetSelect,
  isMobile
}) => {
  return (
    <div className={`absolute ${isMobile ? 'top-[20%]' : 'top-[15%]'} left-0 right-0 flex justify-center items-end gap-2 sm:gap-4 md:gap-8 lg:gap-16 px-2 sm:px-4 z-30`}>
      {enemies.map((enemy, index) => {
        if (!enemy) {
          return (
            <div key={`empty-${index}`} className={`${isMobile ? 'w-16' : 'w-16 sm:w-24 md:w-32'} ${isMobile ? 'h-20' : 'h-20 sm:h-32 md:h-40'}`} />
          );
        }
        
        const isTargetable = selectedCommand && enemy.isAlive;
        const isTargeted = selectedTarget === enemy.id;
        
        return (
          <div
            key={enemy.id}
            className={`relative flex flex-col items-center transition-all duration-300 ${
              isTargetable ? 'cursor-pointer hover:scale-105' : ''
            } ${isTargeted ? 'ring-2 sm:ring-4 ring-amber-400 rounded-lg' : ''}`}
            onClick={() => isTargetable && onTargetSelect(enemy.id)}
          >
            {enemy.role === 'master' && (
              <div className={`absolute ${isMobile ? '-top-4' : '-top-5 sm:-top-6'} left-1/2 -translate-x-1/2 bg-[#b45309] text-white ${isMobile ? 'text-[8px] px-1' : 'text-[10px] sm:text-xs px-1.5 sm:px-2'} py-0.5 rounded font-bold border border-[#fcd34d]/50 shadow-md whitespace-nowrap`}>
                <i className="fa-solid fa-crown mr-0.5 sm:mr-1" />BOSS
              </div>
            )}
            
            <div className={`relative ${
              isMobile 
                ? (enemy.role === 'master' ? 'w-20 h-24' : 'w-18 h-20')
                : (enemy.role === 'master' 
                  ? 'w-20 sm:w-28 md:w-36 h-24 sm:h-36 md:h-48' 
                  : 'w-16 sm:w-20 md:w-28 h-20 sm:h-28 md:h-40')
            }`}>
              {enemy.isAlive ? (
                <>
                  <img
                    src={enemy.imageUrl}
                    alt={enemy.name}
                    className={`w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all ${
                      !enemy.isAlive ? 'opacity-30 grayscale' : ''
                    }`}
                  />
                  <div className={`absolute ${isMobile ? '-bottom-1' : '-bottom-1 sm:-bottom-2'} left-1/2 -translate-x-1/2 ${isMobile ? 'w-14' : 'w-14 sm:w-20 md:w-28'}`}>
                    <GaugeBar
                      current={enemy.stats.hp}
                      max={enemy.stats.maxHp}
                      type="hp"
                      showValue={!isMobile}
                      size="sm"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-4xl'} text-red-500/50 font-bold`}>✕</div>
                </div>
              )}
            </div>
            
            <div className={`${isMobile ? 'mt-1' : 'mt-2 sm:mt-4'} text-center`}>
              <div className={`text-white ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs md:text-sm'} font-bold drop-shadow-md bg-black/40 ${isMobile ? 'px-1' : 'px-1.5 sm:px-2'} py-0.5 rounded truncate ${isMobile ? 'max-w-[56px]' : 'max-w-[60px] sm:max-w-none'}`}>
                {enemy.name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnemyArea;
