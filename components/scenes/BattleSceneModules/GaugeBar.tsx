import React from 'react';
import { GaugeType } from './types';

interface GaugeBarProps {
  current: number;
  max: number;
  type: GaugeType;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  percent?: number;
}

const GaugeBar: React.FC<GaugeBarProps> = ({
  current,
  max,
  type,
  showValue = true,
  size = 'md',
  percent
}) => {
  const calculatedPercent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const displayPercent = percent !== undefined ? percent : calculatedPercent;
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const getGradientClass = () => {
    switch (type) {
      case 'hp':
        if (displayPercent > 50) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
        if (displayPercent > 25) return 'bg-gradient-to-r from-amber-500 to-amber-400';
        return 'bg-gradient-to-r from-red-500 to-red-400';
      case 'mp':
        return 'bg-gradient-to-r from-cyan-500 to-cyan-400';
      case 'exp':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-400';
    }
  };
  
  return (
    <div className="w-full">
      <div className={`${sizeClasses[size]} bg-[#d6cbb8] rounded-full overflow-hidden border border-[#c7bca8] shadow-inner`}>
        <div
          className={`h-full ${getGradientClass()} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${displayPercent}%` }}
        />
      </div>
      {showValue && (
        <div className="text-center text-[8px] sm:text-[10px] text-white font-bold mt-0.5 drop-shadow-md">
          {current}/{max}
        </div>
      )}
    </div>
  );
};

export default GaugeBar;
