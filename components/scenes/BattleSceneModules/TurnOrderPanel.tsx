import React, { useEffect, useState, useRef, useMemo } from 'react';
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
}

const TurnOrderPanel: React.FC<TurnOrderPanelProps> = ({
  turnOrder,
  currentTurnUnitId,
  isMobile,
  isTablet
}) => {
  const [exitingUnit, setExitingUnit] = useState<UnitDisplay | null>(null);
  const [enteringUnit, setEnteringUnit] = useState<UnitDisplay | null>(null);
  const prevTurnUnitIdRef = useRef<string | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convertToDisplayUnit = (unit: BattleUnit): UnitDisplay => {
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
      isAlive: unit.isAlive
    };
  };

  const visibleUnits = useMemo(() => {
    return turnOrder.slice(0, isMobile ? 5 : (isTablet ? 6 : 8)).map(convertToDisplayUnit);
  }, [turnOrder, isMobile, isTablet]);

  useEffect(() => {
    const prevId = prevTurnUnitIdRef.current;
    
    if (prevId && prevId !== currentTurnUnitId && turnOrder.length > 0) {
      const prevUnit = turnOrder.find(u => u.id === prevId);
      
      if (prevUnit) {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        
        setExitingUnit(convertToDisplayUnit(prevUnit));
        
        const nextUnit = turnOrder[turnOrder.length - 1];
        if (nextUnit && nextUnit.id !== prevUnit.id) {
          setEnteringUnit(convertToDisplayUnit(nextUnit));
        }
        
        animationTimeoutRef.current = setTimeout(() => {
          setExitingUnit(null);
          setEnteringUnit(null);
          animationTimeoutRef.current = null;
        }, 400);
      }
    }
    
    prevTurnUnitIdRef.current = currentTurnUnitId;
  }, [currentTurnUnitId, turnOrder]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const getAvatarContent = (unit: UnitDisplay, size: string, isCurrent: boolean = false) => {
    const sizeClasses: Record<string, string> = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    };

    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${
        isCurrent 
          ? 'border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
          : 'border-white/30'
      } ${!unit.isAlive ? 'opacity-40 grayscale' : ''} bg-[#2c241b]/80 flex-shrink-0`}>
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

  const avatarSize = isMobile ? 'sm' : 'md';
  const timelineHeight = isMobile ? '2px' : '3px';

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
          
          <div className="relative flex items-center gap-1.5 sm:gap-2">
            {exitingUnit && (
              <div 
                className="flex-shrink-0 animate-slideOutLeft"
                key={`exit-${exitingUnit.id}`}
              >
                {getAvatarContent(exitingUnit, avatarSize, false)}
              </div>
            )}
            
            {visibleUnits.map((unit, index) => (
              <div
                key={unit.id}
                className="flex-shrink-0"
              >
                {getAvatarContent(unit, avatarSize, index === 0)}
              </div>
            ))}
            
            {enteringUnit && (
              <div 
                className="flex-shrink-0 animate-slideInFromRight"
                key={`enter-${enteringUnit.id}`}
              >
                {getAvatarContent(enteringUnit, avatarSize, false)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnOrderPanel;
