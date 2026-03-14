import React, { useEffect, useState, useRef, useCallback } from 'react';
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

interface UnitDisplay {
  id: string;
  name: string;
  avatarUrl: string | null;
  enemyBattlerName: string | null;
  isPlayer: boolean;
  isAlive: boolean;
  isCurrent: boolean;
}

const TurnOrderPanel: React.FC<TurnOrderPanelProps> = ({
  turnOrder,
  currentTurnUnitId,
  isMobile,
  isTablet
}) => {
  const [displayUnits, setDisplayUnits] = useState<UnitDisplay[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitUnit, setExitUnit] = useState<UnitDisplay | null>(null);
  const prevCurrentIdRef = useRef<string | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convertToDisplayUnits = useCallback((units: BattleUnit[], currentId: string | null): UnitDisplay[] => {
    return units.map(unit => {
      const isPlayer = unit.faction === Faction.PLAYER;
      const charId = (unit as any).characterId || unit.id;
      const avatarUrl = isPlayer
        ? CHARACTER_IMAGES[charId]?.avatarUrl || CHARACTERS[charId]?.avatarUrl || ''
        : null;
      const enemyData = !isPlayer ? ENEMIES.find(e => e.id === parseInt(unit.id.split('_')[1])) : null;
      
      return {
        id: unit.id,
        name: unit.name,
        avatarUrl,
        enemyBattlerName: enemyData?.battlerName || null,
        isPlayer,
        isAlive: unit.isAlive,
        isCurrent: currentId === unit.id
      };
    });
  }, []);

  useEffect(() => {
    const prevId = prevCurrentIdRef.current;
    
    if (prevId && prevId !== currentTurnUnitId && displayUnits.length > 0) {
      const prevUnit = displayUnits.find(u => u.id === prevId);
      
      if (prevUnit && !isAnimating) {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        
        setExitUnit(prevUnit);
        setIsAnimating(true);
        
        const updatedUnits = displayUnits.map(u => ({
          ...u,
          isCurrent: currentTurnUnitId === u.id
        }));
        
        const prevIndex = updatedUnits.findIndex(u => u.id === prevId);
        if (prevIndex > -1) {
          const movedUnit = { ...updatedUnits[prevIndex], isCurrent: false };
          const remainingUnits = updatedUnits.filter(u => u.id !== prevId);
          setDisplayUnits([...remainingUnits, movedUnit]);
        } else {
          setDisplayUnits(updatedUnits);
        }
        
        animationTimeoutRef.current = setTimeout(() => {
          const newUnits = convertToDisplayUnits(turnOrder, currentTurnUnitId);
          setDisplayUnits(newUnits);
          setExitUnit(null);
          setIsAnimating(false);
          animationTimeoutRef.current = null;
        }, 400);
        
        prevCurrentIdRef.current = currentTurnUnitId;
        return;
      }
    }
    
    const newUnits = convertToDisplayUnits(turnOrder, currentTurnUnitId);
    setDisplayUnits(newUnits);
    prevCurrentIdRef.current = currentTurnUnitId;
  }, [turnOrder, currentTurnUnitId, displayUnits, isAnimating, convertToDisplayUnits]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const getAvatarContent = (unit: UnitDisplay, size: string) => {
    const sizeClasses: Record<string, string> = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    };

    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${
        unit.isCurrent 
          ? 'border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
          : 'border-white/30'
      } ${!unit.isAlive ? 'opacity-40 grayscale' : ''} bg-[#2c241b]/80 flex-shrink-0 transition-all duration-300`}>
        {unit.isPlayer && unit.avatarUrl ? (
          <img src={resolveImgPath(unit.avatarUrl)} alt="" className="w-full h-full object-cover" />
        ) : !unit.isPlayer && unit.enemyBattlerName ? (
          <img
            src={resolveImgPath(`img/quest/${unit.enemyBattlerName}.png`)}
            alt=""
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/60 text-xs">
            <i className={`fa-solid ${unit.isPlayer ? 'fa-user' : 'fa-skull'}`} />
          </div>
        )}
      </div>
    );
  };

  const visibleCount = isMobile ? 5 : (isTablet ? 6 : 8);
  const avatarSize = isMobile ? 'sm' : 'md';
  const timelineHeight = isMobile ? '2px' : '3px';
  const unitWidth = isMobile ? 32 : 40;

  return (
    <div 
      className={`absolute right-2 sm:right-4 md:right-6 z-40 ${isMobile ? 'max-w-[200px]' : isTablet ? 'max-w-[280px]' : 'max-w-[360px]'}`}
      style={{ top: '30px' }}
    >
      <div className="relative flex items-center gap-2">
        <div className="relative flex items-center flex-1 overflow-hidden">
          <div 
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{
              height: timelineHeight,
              background: 'linear-gradient(to right, rgba(251,191,36,0.8) 0%, rgba(251,191,36,0.4) 40%, rgba(155,122,76,0.2) 70%, rgba(155,122,76,0) 100%)',
              borderRadius: '2px'
            }}
          />
          
          <div className="relative flex items-center gap-1.5 sm:gap-2 transition-transform duration-300 ease-out">
            {exitUnit && (
              <div 
                className="flex-shrink-0 animate-slideOutLeft"
              >
                {getAvatarContent(exitUnit, avatarSize)}
              </div>
            )}
            
            {displayUnits.slice(0, visibleCount).map((unit, index) => (
              <div
                key={`${unit.id}-${index}`}
                className={`flex-shrink-0 transition-all duration-300 ease-out ${
                  isAnimating && index === 0 ? 'animate-slideInFromRight' : ''
                }`}
                style={{
                  transform: isAnimating ? `translateX(-${unitWidth}px)` : 'translateX(0)',
                  transitionDelay: isAnimating ? `${index * 50}ms` : '0ms'
                }}
              >
                {getAvatarContent(unit, avatarSize)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnOrderPanel;
