
import React, { useEffect, useState } from 'react';
import { ITEMS } from '../data/items';

interface ItemToastProps {
  itemId: string;
  count: number;
  onComplete: () => void;
}

const ItemToast: React.FC<ItemToastProps> = ({ itemId, count, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const item = ITEMS[itemId];

  useEffect(() => {
    // Start animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto hide after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation to finish before calling complete
      setTimeout(onComplete, 500); 
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!item) return null;

  return (
    <div 
        className={`
            mb-2 flex items-center gap-3 px-4 py-2.5 
            bg-[#1a1512]/90 border-l-4 border-amber-500 rounded-r shadow-2xl backdrop-blur-sm
            transform transition-all duration-500 ease-out
            ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
        `}
    >
      {/* Icon Box */}
      <div className="w-10 h-10 flex items-center justify-center bg-[#2c241b] rounded border border-[#4a3b32] text-xl shadow-inner">
          {item.tag === 'meat' ? '🥩' : 
           item.tag === 'vegetable' ? '🥬' : 
           item.tag === 'wine' ? '🍺' : 
           item.category === 'wpn' ? '⚔️' :
           item.category === 'arm' ? '🛡️' :
           '🎁'}
      </div>

      {/* Text Info */}
      <div className="flex flex-col">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">获得道具</span>
          <div className="flex items-baseline gap-2">
              <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">{item.name}</span>
              <span className="text-amber-400 font-mono font-bold text-sm">×{count}</span>
          </div>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden rounded-r pointer-events-none">
          <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

export default ItemToast;
