import React, { useEffect, useState } from 'react';

interface AffinityToastProps {
  change: number;
  characterName: string;
  onComplete: () => void;
}

const AffinityToast: React.FC<AffinityToastProps> = ({ change, characterName, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
      setIsHeartAnimating(true);
    });

    const heartTimer = setTimeout(() => setIsHeartAnimating(false), 600);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearTimeout(heartTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const isPositive = change > 0;
  const displayChange = isPositive ? `+${change}` : change.toString();
  
  const borderColor = isPositive ? 'border-pink-500' : 'border-gray-500';
  const bgGradient = isPositive 
    ? 'from-pink-900/90 to-red-900/90' 
    : 'from-gray-800/90 to-gray-900/90';
  const textColor = isPositive ? 'text-pink-200' : 'text-gray-400';
  const iconColor = isPositive ? 'text-red-400' : 'text-gray-500';

  return (
    <div 
      className={`
        mb-2 flex items-center gap-3 px-4 py-2.5 
        bg-gradient-to-r ${bgGradient} border-l-4 ${borderColor} rounded-r shadow-2xl backdrop-blur-sm
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
      `}
    >
      {/* Heart Icon with Animation */}
      <div className={`
        w-10 h-10 flex items-center justify-center rounded
        transition-all duration-300
        ${isHeartAnimating ? 'scale-125' : 'scale-100'}
      `}>
        <i className={`fa-solid fa-heart text-2xl ${iconColor} ${isHeartAnimating ? 'animate-pulse' : ''}`}></i>
      </div>

      {/* Text Info */}
      <div className="flex flex-col">
        <span className={`text-[10px] ${textColor} font-bold uppercase tracking-wider`}>
          好感度变化
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">
            {characterName}
          </span>
          <span className={`
            font-mono font-bold text-base
            ${isPositive ? 'text-pink-300' : 'text-gray-400'}
          `}>
            {displayChange}
          </span>
        </div>
      </div>

      {/* Shine effect for positive changes */}
      {isPositive && (
        <div className="absolute inset-0 overflow-hidden rounded-r pointer-events-none">
          <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-pink-300/20 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
        </div>
      )}
    </div>
  );
};

export default AffinityToast;