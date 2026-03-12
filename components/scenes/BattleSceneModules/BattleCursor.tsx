import React from 'react';

interface BattleCursorProps {
  x: number;
  y: number;
  visible: boolean;
}

const BattleCursor: React.FC<BattleCursorProps> = ({ x, y, visible }) => {
  if (!visible) return null;
  
  return (
    <div
      className="fixed z-[90] pointer-events-none animate-cursorFloat"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        <i className="fa-solid fa-hand-pointer text-2xl sm:text-3xl text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-amber-400" />
      </div>
    </div>
  );
};

export default BattleCursor;
