import React from 'react';
import { StatusEffectInstance } from '../../../battle-system/types';

interface StatusIconsProps {
  statusEffects: StatusEffectInstance[];
  maxIconsPerRow?: number;
  iconSize?: 'sm' | 'md';
  className?: string;
}

const StatusIcons: React.FC<StatusIconsProps> = ({
  statusEffects,
  maxIconsPerRow = 4,
  iconSize = 'sm',
  className = ''
}) => {
  if (!statusEffects || statusEffects.length === 0) return null;

  const sizeClasses = iconSize === 'sm' 
    ? 'w-4 h-4 text-[10px]' 
    : 'w-5 h-5 text-xs';

  const rows: StatusEffectInstance[][] = [];
  for (let i = 0; i < statusEffects.length; i += maxIconsPerRow) {
    rows.push(statusEffects.slice(i, i + maxIconsPerRow));
  }

  return (
    <div className={`absolute bottom-0 left-0 right-0 flex flex-col-reverse items-center gap-0.5 pointer-events-none ${className}`}>
      {rows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex justify-center gap-0.5"
        >
          {row.map((effect, index) => (
            <div
              key={`${effect.effectId}-${index}`}
              className={`
                ${sizeClasses} 
                flex items-center justify-center 
                bg-black/70 rounded 
                shadow-sm
                backdrop-blur-[1px]
              `}
              title={`${effect.name}${effect.turnsRemaining > 0 ? ` (${effect.turnsRemaining}回合)` : ''}`}
            >
              <span className="leading-none">{effect.icon}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default StatusIcons;
