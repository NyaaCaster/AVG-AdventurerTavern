
import React from 'react';
import { WorldState } from '../types';
import WeatherIcon from './WeatherIcon';
import { sanityToInspiration } from '../data/currency-value-table';

interface GameEnvironmentWidgetProps {
  worldState: WorldState;
  gold: number;
  sanity?: number; // 添加可选理智值
  onClickSanity?: () => void; // 点击理智栏回调
}

const GameEnvironmentWidget: React.FC<GameEnvironmentWidgetProps> = ({ worldState, gold, sanity = 10000, onClickSanity }) => {
  const { dateStr, weekDay, timeStr, period, periodLabel, weatherCode, temp, sceneName } = worldState;
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
  const displaySanity = sanityToInspiration(sanity).toFixed(2);

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
                    <div className="flex items-baseline gap-2 text-xs font-bold uppercase tracking-wider leading-none">
                        <span className="text-slate-500">{dateStr}</span>
                        <span className="text-slate-500">{weekDay}</span>
                        <span className={`${colorClass}`}>{periodLabel}</span>
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
                        {temp && (
                            <span className="text-base font-bold text-slate-700 tabular-nums">
                                {temp}℃
                            </span>
                        )}
                        <div className={`w-6 h-6 ${weatherColor} drop-shadow-sm`}>
                            <WeatherIcon code={weatherCode} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Section: Gold & Sanity Display */}
        <div className="pl-6 mt-0.5">
            <div className="bg-gradient-to-r from-black/60 to-transparent px-3 py-1 flex flex-col gap-1 min-w-[160px]">
                {/* Gold */}
                <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-1.5 opacity-80">
                        <i className="fa-solid fa-coins text-amber-500 text-[10px]"></i>
                        <span className="text-[10px] text-amber-500/80 font-bold tracking-widest">资金</span>
                     </div>
                     <div className="flex items-baseline justify-end gap-1 text-[#f0e6d2] font-mono font-bold text-shadow-sm flex-1">
                        <span className="text-lg tracking-wide leading-none">{displayGold}</span>
                        <span className="text-xs text-amber-500">G</span>
                     </div>
                </div>

                {/* Sanity */}
                <div 
                    className="group flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 rounded-sm px-1 -mx-1 transition-colors pointer-events-auto"
                    onClick={onClickSanity}
                >
                     <div className="flex items-center gap-1.5 opacity-80">
                        <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                        </svg>
                        <span className="text-[10px] text-cyan-400/80 font-bold tracking-widest group-hover:text-cyan-300">灵感</span>
                     </div>
                     <div className="flex items-baseline justify-end gap-1 text-[#f0e6d2] font-mono font-bold text-shadow-sm flex-1">
                        <span className="text-lg tracking-wide leading-none group-hover:text-white">{displaySanity}</span>
                        <span className="text-xs text-cyan-400">I</span>
                     </div>
                </div>
            </div>
        </div>

    </div>
  );
};

export default GameEnvironmentWidget;
