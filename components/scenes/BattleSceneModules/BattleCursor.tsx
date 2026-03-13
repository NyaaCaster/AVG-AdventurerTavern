import React from 'react';

interface BattleCursorProps {
  x: number;
  y: number;
  visible: boolean;
  isAllyTarget?: boolean;
  isMobile?: boolean;
}

const BattleCursor: React.FC<BattleCursorProps> = ({ x, y, visible, isAllyTarget = false, isMobile = false }) => {
  if (!visible) return null;
  
  const cursorColor = isAllyTarget ? '#22c55e' : '#fbbf24';
  const glowColor = isAllyTarget ? 'rgba(34, 197, 94, 0.8)' : 'rgba(251, 191, 36, 0.8)';
  const yOffset = isMobile && !isAllyTarget ? -10 : 0;
  
  return (
    <div
      className="fixed z-35 pointer-events-none animate-cursorFloat"
      style={{
        left: x,
        top: y + yOffset,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div 
        className="w-0 h-0"
        style={{
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: `16px solid ${cursorColor}`,
          filter: `drop-shadow(0 0 8px ${glowColor})`
        }}
      />
    </div>
  );
};

export default BattleCursor;
