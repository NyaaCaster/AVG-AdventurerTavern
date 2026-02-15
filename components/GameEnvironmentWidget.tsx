
import React from 'react';
import { WorldState } from '../types';
import WeatherIcon from './WeatherIcon';

interface GameEnvironmentWidgetProps {
  worldState: WorldState;
  gold: number;
}

const GameEnvironmentWidget: React.FC<GameEnvironmentWidgetProps> = ({ worldState, gold }) => {
  const { dateStr, weekDay, timeStr, period, periodLabel, weatherCode, sceneName } = worldState;
  let colorClass = "text-indigo-600";
  let weatherColor = "text-slate-400";
  
  if (period === 'day') {
    colorClass = "text-amber-600";
    weatherColor = "text-amber-500";
  } else if (period === 'evening') {
    colorClass = "text-orange-600";
    weatherColor = "text-orange-400";
  }

  // Format gold with max limit 999,999,999
  const displayGold = Math.min(gold, 999999999).toLocaleString();

  return (
    <div className="absolute top-8 left-8 z-40 flex flex-col gap-1 select-none pointer-events-none">
        
        {/* Top Section: Date/Time Widget */}
        <div className="flex items-stretch gap-3">
            {/* Decorative Vertical Bar */}
            <div className="flex flex-col items-center justify-between py-1 filter drop-shadow-md">
                <div className="w-1.5 h-1.5 bg-[#fdfbf7] rounded-full shadow-sm"></div>
                <div className="w-0.5 flex-1 bg-white/90 my-1 rounded-full shadow-sm"></div>
                <div className="w-1.5 h-1.5 bg-[#fdfbf7] rounded-full shadow-sm"></div>
            </div>

            {/* Main Info Widget */}
            <div 
                className="flex flex-col justify-center pl-5 pr-5 py-2 border-l-[6px] border-amber-500 rounded-sm backdrop-blur-[2px] shadow-sm min-w-[220px]"
                style={{
                    background: 'linear-gradient(90deg, rgba(253, 251, 247, 0.95) 0%, rgba(253, 251, 247, 0.85) 65%, rgba(253, 251, 247, 0.1) 100%)'
                }}
            >
                {/* Top Row: Date & Scene Name */}
                <div className="flex items-center justify-between mb-1 gap-6">
                    <div className="flex items-baseline gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider leading-none">
                        <span>{dateStr}</span>
                        <span>{weekDay}</span>
                    </div>
                    
                    {/* Scene Name (Top Right) */}
                    <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-location-dot text-amber-600/80 text-[10px] animate-pulse"></i>
                        <span className="text-xs font-bold tracking-wider text-slate-700 font-sans">
                            {sceneName}
                        </span>
                    </div>
                </div>

                {/* Bottom Row: Time & Weather */}
                <div className="flex items-end justify-between">
                    <span className="text-3xl font-black font-mono tabular-nums tracking-tight italic text-slate-800 leading-none -ml-0.5" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>
                        {timeStr}
                    </span>
                    
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-black ${colorClass}`}>
                            {periodLabel}
                        </span>
                        <div className={`w-6 h-6 ${weatherColor} drop-shadow-sm`}>
                            <WeatherIcon code={weatherCode} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Section: Gold Display */}
        <div className="pl-6 mt-0.5">
            <div className="bg-gradient-to-r from-black/60 to-transparent px-3 py-1 flex items-center gap-4 min-w-[160px]">
                 <div className="flex items-center gap-1.5 opacity-80">
                    <i className="fa-solid fa-coins text-amber-500 text-[10px]"></i>
                    <span className="text-[10px] text-amber-500/80 font-bold tracking-widest">资金</span>
                 </div>
                 <div className="flex items-baseline gap-1 text-[#f0e6d2] font-mono font-bold text-shadow-sm">
                    <span className="text-lg tracking-wide leading-none">{displayGold}</span>
                    <span className="text-xs text-amber-500">G</span>
                 </div>
            </div>
        </div>

    </div>
  );
};

export default GameEnvironmentWidget;
