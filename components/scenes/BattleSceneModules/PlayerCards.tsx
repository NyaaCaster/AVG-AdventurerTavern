import React from 'react';
import { PlayerUnitWithImage } from './types';
import GaugeBar from './GaugeBar';
import StatusIcons from './StatusIcons';

interface PlayerCardsProps {
  players: PlayerUnitWithImage[];
  currentTurnUnitId: string | null;
  resolveImgPath: (path: string) => string;
  isMobile?: boolean;
  selectedCommand: string | null;
  selectedTarget: string | null;
  onTargetSelect: (targetId: string) => void;
  isAllyTargeting?: boolean;
  isReviveTargeting?: boolean;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({
  players,
  currentTurnUnitId,
  resolveImgPath,
  isMobile = false,
  selectedCommand,
  selectedTarget,
  onTargetSelect,
  isAllyTargeting = false,
  isReviveTargeting = false
}) => {
  return (
    <div className={`flex justify-center ${isMobile ? 'gap-1 mb-3' : 'gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-4'}`}>
      {players.map((player) => {
        const isCurrentTurn = currentTurnUnitId === player.id;
        const isDead = !player.isAlive;
        
        const isTargetable = isReviveTargeting 
          ? isDead 
          : (isAllyTargeting && selectedCommand && player.isAlive);
        const isTargeted = selectedTarget === player.id;
        
        return (
          <div
            key={player.id}
            className={`relative ${isMobile ? 'w-[84px]' : 'w-16 sm:w-20 md:w-28'} bg-[#e8dfd1] rounded-lg border-2 shadow-lg transition-all duration-300 ${
              isCurrentTurn ? 'border-[#b45309] scale-105 ring-2 ring-[#fcd34d]/50' : 'border-[#9b7a4c]'
            } ${isDead ? 'opacity-50 grayscale' : ''} ${
              isTargetable ? 'cursor-pointer hover:scale-105 active:scale-105 [-webkit-tap-highlight-color:transparent]' : ''
            } ${isTargeted ? 'border-[#22c55e] ring-2 ring-green-400/50' : ''}`}
            onClick={() => isTargetable && onTargetSelect(player.id)}
          >
            {isCurrentTurn && (
              <div className={`absolute z-10 ${isMobile ? '-top-1.5' : '-top-2 sm:-top-3'} left-1/2 -translate-x-1/2 bg-[#b45309] text-white ${isMobile ? 'text-[7px] px-1' : 'text-[8px] sm:text-[10px] px-1.5 sm:px-2'} py-0.5 rounded font-bold shadow-md whitespace-nowrap`}>
                行动中
              </div>
            )}
            
            <div className={`${isMobile ? 'p-0.5' : 'p-1 sm:p-1.5 md:p-2'}`}>
              <div className={`relative w-full aspect-square rounded overflow-hidden border border-[#c7bca8] ${isMobile ? 'mb-0.5' : 'mb-1 sm:mb-1.5'}`}>
                <div className="relative w-full h-full">
                  <img
                    src={resolveImgPath(player.avatarUrl)}
                    alt={player.name}
                    className={`w-full h-full object-cover ${isDead ? 'opacity-50 grayscale' : ''}`}
                  />
                  {isDead && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                      <span className={`${isMobile ? 'text-xs' : 'text-sm sm:text-xl'} text-red-400 font-bold`}>✕</span>
                    </div>
                  )}
                  
                  <StatusIcons 
                    statusEffects={player.statusEffects} 
                    maxIconsPerRow={isMobile ? 3 : 4}
                    iconSize="sm"
                  />
                </div>
              </div>
              
              <div className={`text-center ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs'} font-bold text-[#382b26] truncate ${isMobile ? 'mb-0.5' : 'mb-0.5 sm:mb-1'}`}>
                {player.name}
              </div>
              
              <div className={`space-y-${isMobile ? '0.5' : '0.5 sm:space-y-1'}`}>
                <div>
                  <div className={`flex justify-between ${isMobile ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'} text-[#5c4d45] ${isMobile ? 'mb-0' : 'mb-0.5'}`}>
                    <span>HP</span>
                    <span>{player.stats.hp}/{player.stats.maxHp}</span>
                  </div>
                  <GaugeBar
                    current={player.stats.hp}
                    max={player.stats.maxHp}
                    type="hp"
                    showValue={false}
                    size="sm"
                  />
                </div>
                
                <div>
                  <div className={`flex justify-between ${isMobile ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'} text-[#5c4d45] ${isMobile ? 'mb-0' : 'mb-0.5'}`}>
                    <span>MP</span>
                    <span>{player.stats.mp}/{player.stats.maxMp}</span>
                  </div>
                  <GaugeBar
                    current={player.stats.mp}
                    max={player.stats.maxMp}
                    type="mp"
                    showValue={false}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerCards;
