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
  enableDebug?: boolean;
  damageFlashUnits?: Set<string>;
  statusFlashUnits?: Set<string>;
}

const EnemyArea: React.FC<EnemyAreaProps> = ({
  enemies,
  selectedCommand,
  selectedTarget,
  onTargetSelect,
  isMobile,
  isEnemyTargeting = false,
  onCursorChange,
  enableDebug = false,
  damageFlashUnits = new Set(),
  statusFlashUnits = new Set()
}) => {
  const getHpBarColor = (percent: number) => {
    if (percent > 60) return 'from-green-500 to-emerald-400';
    if (percent > 30) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-rose-400';
  };

  return (
    <div className={`absolute ${isMobile ? 'top-[20%]' : 'top-[15%]'} left-0 right-0 flex justify-center items-end gap-2 sm:gap-4 md:gap-8 lg:gap-16 px-2 sm:px-4 z-30`}>
      {enemies.map((enemy, index) => {
        if (!enemy) {
          return (
            <div key={`empty-${index}`} className={`${isMobile ? 'w-16' : 'w-16 sm:w-24 md:w-32'} ${isMobile ? 'h-20' : 'h-20 sm:h-32 md:h-40'}`} />
          );
        }
        
        const isTargetable = isEnemyTargeting && selectedCommand && enemy.isAlive;
        const isDamageFlashing = damageFlashUnits.has(enemy.id);
        const isStatusFlashing = statusFlashUnits.has(enemy.id);
        
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
        
        const hpPercent = enemy.stats.maxHp > 0 ? (enemy.stats.hp / enemy.stats.maxHp) * 100 : 0;
        const mpPercent = enemy.stats.maxMp > 0 ? (enemy.stats.mp / enemy.stats.maxMp) * 100 : 0;
        
        return (
          <div
            key={enemy.id}
            data-unit-id={enemy.id}
            data-unit-dead={!enemy.isAlive}
            className={`relative flex flex-col items-center transition-all duration-300 ${
              enemy.isAlive && isTargetable ? 'cursor-pointer hover:scale-105 active:scale-105 [-webkit-tap-highlight-color:transparent]' : ''
            } ${!enemy.isAlive ? 'pointer-events-none' : ''}`}
            onClick={() => isTargetable && enemy.isAlive && onTargetSelect(enemy.id)}
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
              <img
                src={enemy.imageUrl}
                alt={enemy.name}
                className={`w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all ${
                  isDamageFlashing ? 'animate-damageFlashFilter' : ''
                } ${
                  isStatusFlashing ? 'animate-statusFlashFilter' : ''
                } ${
                  !enemy.isAlive ? 'animate-enemyDeath' : ''
                }`}
              />
              {enemy.isAlive && enemy.statusEffects && enemy.statusEffects.length > 0 && (
                <StatusIcons 
                  statusEffects={enemy.statusEffects} 
                  maxIconsPerRow={isMobile ? 3 : 4}
                  iconSize="sm"
                />
              )}
            </div>
            
            <div className={`text-center ${!enemy.isAlive ? 'opacity-40' : ''}`}>
              <div className={`text-white ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs md:text-sm'} font-bold drop-shadow-md bg-black/40 ${isMobile ? 'px-1' : 'px-1.5 sm:px-2'} py-0.5 rounded truncate ${isMobile ? 'max-w-[56px]' : 'max-w-[60px] sm:max-w-none'}`}>
                {enemy.name}
              </div>
              
              {enableDebug && enemy.isAlive && (
                <div className={`mt-1 ${isMobile ? 'w-[72px]' : 'w-20 sm:w-28'} space-y-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-1`}>
                  <div className="flex items-center gap-1">
                    <span className={`${isMobile ? 'text-[6px]' : 'text-[8px]'} text-green-400 font-bold`}>HP</span>
                    <div className={`flex-1 h-1.5 bg-gray-800/80 rounded overflow-hidden`}>
                      <div 
                        className={`h-full bg-gradient-to-r ${getHpBarColor(hpPercent)} transition-all duration-300`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                    <span className={`${isMobile ? 'text-[6px]' : 'text-[8px]'} text-green-400 font-mono`}>
                      {enemy.stats.hp}/{enemy.stats.maxHp}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className={`${isMobile ? 'text-[6px]' : 'text-[8px]'} text-cyan-400 font-bold`}>MP</span>
                    <div className={`flex-1 h-1.5 bg-gray-800/80 rounded overflow-hidden`}>
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${mpPercent}%` }}
                      />
                    </div>
                    <span className={`${isMobile ? 'text-[6px]' : 'text-[8px]'} text-cyan-400 font-mono`}>
                      {enemy.stats.mp}/{enemy.stats.maxMp}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnemyArea;
