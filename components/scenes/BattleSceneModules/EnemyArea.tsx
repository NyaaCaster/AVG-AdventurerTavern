import React from 'react';
import { EnemyUnitWithImage } from './types';
import StatusIcons from './StatusIcons';

interface EnemyAreaProps {
  enemies: (EnemyUnitWithImage | null)[];
  selectedCommand: string | null;
  selectedTarget: string | null;
  onTargetSelect: (targetId: string) => void;
  isMobile: boolean;
  isEnemyTargeting?: boolean;
  onCursorChange?: (x: number, y: number, visible: boolean, isAlly?: boolean) => void;
}

const EnemyArea: React.FC<EnemyAreaProps> = ({
  enemies,
  selectedCommand,
  selectedTarget,
  onTargetSelect,
  isMobile,
  isEnemyTargeting = false,
  onCursorChange
}) => {
  return (
    <div className={`absolute ${isMobile ? 'top-[20%]' : 'top-[15%]'} left-0 right-0 flex justify-center items-end gap-2 sm:gap-4 md:gap-8 lg:gap-16 px-2 sm:px-4 z-30`}>
      {enemies.map((enemy, index) => {
        if (!enemy) {
          return (
            <div key={`empty-${index}`} className={`${isMobile ? 'w-16' : 'w-16 sm:w-24 md:w-32'} ${isMobile ? 'h-20' : 'h-20 sm:h-32 md:h-40'}`} />
          );
        }
        
        const isTargetable = isEnemyTargeting && selectedCommand && enemy.isAlive;
        
        const handleMouseEnter = (e: React.MouseEvent) => {
          if (isTargetable && onCursorChange) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const sprite = (e.currentTarget as HTMLElement).querySelector('img');
            const spriteRect = sprite?.getBoundingClientRect() || rect;
            onCursorChange(
              rect.left + rect.width / 2,
              spriteRect.top,
              true,
              false
            );
          }
        };
        
        const handleMouseLeave = () => {
          if (onCursorChange) {
            onCursorChange(0, 0, false, false);
          }
        };
        
        return (
          <div
            key={enemy.id}
            className={`relative flex flex-col items-center transition-all duration-300 ${
              isTargetable ? 'cursor-pointer hover:scale-105 active:scale-105 [-webkit-tap-highlight-color:transparent]' : ''
            }`}
            onClick={() => isTargetable && onTargetSelect(enemy.id)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`relative ${
              isMobile 
                ? (enemy.role === 'master' ? 'w-[120px] h-[144px]' : 'w-[108px] h-[120px]')
                : (enemy.role === 'master' 
                  ? 'w-20 sm:w-28 md:w-36 h-24 sm:h-36 md:h-48' 
                  : 'w-16 sm:w-20 md:w-28 h-20 sm:h-28 md:h-40')
            }`}>
              {enemy.isAlive ? (
                <>
                  <img
                    src={enemy.imageUrl}
                    alt={enemy.name}
                    className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all"
                  />
                  {enemy.statusEffects && enemy.statusEffects.length > 0 && (
                    <StatusIcons 
                      statusEffects={enemy.statusEffects} 
                      maxIconsPerRow={isMobile ? 3 : 4}
                      iconSize="sm"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center animate-fadeOut">
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-4xl'} text-red-500/50 font-bold`}>✕</div>
                </div>
              )}
            </div>
            
            <div className={`text-center`}>
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
