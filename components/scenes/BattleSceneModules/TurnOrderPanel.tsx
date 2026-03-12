import React from 'react';
import { BattleUnit } from '../../../battle-system/types';
import { Faction } from '../../../battle-system/types';
import { CHARACTER_IMAGES } from '../../../data/resources/characterImageResources';
import { CHARACTERS } from '../../../data/scenarioData';
import { ENEMIES } from '../../../data/battle-data/enemies';
import { resolveImgPath } from '../../../utils/imagePath';

interface TurnOrderPanelProps {
  turnOrder: BattleUnit[];
  currentTurnUnitId: string | null;
  isMobile: boolean;
  isTablet: boolean;
}

const TurnOrderPanel: React.FC<TurnOrderPanelProps> = ({
  turnOrder,
  currentTurnUnitId,
  isMobile,
  isTablet
}) => {
  if (isMobile) {
    return (
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
          <div className="bg-[#382b26] px-1.5 py-1 border-b border-[#9b7a4c]">
            <div className="text-[#f0e6d2] text-[10px] font-bold text-center">顺序</div>
          </div>
          <div className="flex flex-col gap-0.5 p-1">
            {turnOrder.slice(0, 6).map((unit, index) => {
              const isCurrentUnit = currentTurnUnitId === unit.id;
              const isPlayer = unit.faction === Faction.PLAYER;
              const avatarUrl = isPlayer
                ? CHARACTER_IMAGES[unit.id]?.avatarUrl || CHARACTERS[unit.id]?.avatarUrl || ''
                : null;
              const enemyData = !isPlayer ? ENEMIES.find(e => e.id === parseInt(unit.id.split('_')[1])) : null;
              
              return (
                <div
                  key={`mobile-${unit.id}-${index}`}
                  className={`relative flex-shrink-0 transition-all ${
                    isCurrentUnit ? 'scale-110' : ''
                  } ${!unit.isAlive ? 'opacity-40' : ''}`}
                >
                  <div className={`w-6 h-6 rounded overflow-hidden border ${
                    isCurrentUnit 
                      ? 'border-amber-400 ring-1 ring-amber-400/50' 
                      : 'border-[#9b7a4c]/50'
                  } bg-[#e8dfd1]/20 flex-shrink-0`}>
                    {isPlayer && avatarUrl ? (
                      <img src={resolveImgPath(avatarUrl)} alt="" className="w-full h-full object-cover" />
                    ) : !isPlayer && enemyData ? (
                      <img
                        src={resolveImgPath(`img/quest/${enemyData.battlerName}.png`)}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#9b7a4c] text-[10px]">
                        <i className={`fa-solid ${isPlayer ? 'fa-user' : 'fa-skull'}`} />
                      </div>
                    )}
                  </div>
                  
                  {isCurrentUnit && (
                    <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-2 border-t-transparent border-b-transparent border-r-amber-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute ${isTablet ? 'right-2 sm:right-4' : 'right-2 sm:right-4 md:right-28'} top-1/2 -translate-y-1/2 z-40 w-16 sm:w-20 md:w-28`}>
      <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
        <div className="bg-[#382b26] px-2 py-1.5 border-b border-[#9b7a4c]">
          <div className="text-[#f0e6d2] text-xs font-bold text-center tracking-wide">
            顺序
          </div>
        </div>
        
        <div className="max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
          {turnOrder.slice(0, isTablet ? 5 : 8).map((unit, index) => {
            const isCurrentUnit = currentTurnUnitId === unit.id;
            const isPlayer = unit.faction === Faction.PLAYER;
            const avatarUrl = isPlayer
              ? CHARACTER_IMAGES[unit.id]?.avatarUrl || CHARACTERS[unit.id]?.avatarUrl || ''
              : null;
            const enemyData = !isPlayer ? ENEMIES.find(e => e.id === parseInt(unit.id.split('_')[1])) : null;
            
            return (
              <div
                key={`${unit.id}-${index}`}
                className={`flex items-center gap-1 p-1 rounded transition-all ${
                  isCurrentUnit
                    ? 'bg-[#b45309]/30 ring-1 ring-[#fcd34d]'
                    : 'bg-[#e8dfd1]/10'
                } ${!unit.isAlive ? 'opacity-40' : ''}`}
              >
                <div className="text-[8px] text-[#9b7a4c] font-bold w-3 sm:w-4 text-center">
                  {index + 1}
                </div>
                
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded overflow-hidden border border-[#9b7a4c]/50 bg-[#e8dfd1]/20 flex-shrink-0">
                  {isPlayer && avatarUrl ? (
                    <img src={resolveImgPath(avatarUrl)} alt="" className="w-full h-full object-cover" />
                  ) : !isPlayer && enemyData ? (
                    <img
                      src={resolveImgPath(`img/quest/${enemyData.battlerName}.png`)}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9b7a4c] text-[8px] sm:text-xs">
                      <i className={`fa-solid ${isPlayer ? 'fa-user' : 'fa-skull'}`} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-[8px] sm:text-[9px] font-bold truncate ${
                    isPlayer ? 'text-[#f0e6d2]' : 'text-red-300'
                  }`}>
                    {unit.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TurnOrderPanel;
