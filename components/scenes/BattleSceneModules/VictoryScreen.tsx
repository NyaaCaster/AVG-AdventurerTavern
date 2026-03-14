import React, { useState, useEffect, useRef } from 'react';
import { ExpGainInfo } from './types';
import { resolveImgPath } from '../../../utils/imagePath';

interface VictoryScreenProps {
  expGains: ExpGainInfo[];
  onClose: () => void;
}

interface AnimationState {
  currentPercent: number;
  displayLevel: number;
  isLevelingUp: boolean;
  animationComplete: boolean;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ expGains, onClose }) => {
  const [animationStates, setAnimationStates] = useState<Record<string, AnimationState>>({});
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const ANIMATION_DURATION = 1500;
  const LEVEL_UP_DISPLAY_DURATION = 1500;
  
  useEffect(() => {
    if (expGains.length === 0) return;
    
    const initialStates: Record<string, AnimationState> = {};
    expGains.forEach(gain => {
      initialStates[gain.characterId] = {
        currentPercent: gain.expPercentBefore,
        displayLevel: gain.currentLevel,
        isLevelingUp: false,
        animationComplete: false
      };
    });
    setAnimationStates(initialStates);
    
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current!;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setAnimationStates(prev => {
        const next = { ...prev };
        
        expGains.forEach(gain => {
          const currentState = prev[gain.characterId];
          if (!currentState || currentState.animationComplete) return;
          
          const currentPercent = gain.expPercentBefore + (gain.expPercentAfter - gain.expPercentBefore) * easeProgress;
          
          next[gain.characterId] = {
            ...currentState,
            currentPercent,
            displayLevel: progress >= 1 ? gain.finalLevel : gain.currentLevel,
            isLevelingUp: progress >= 1 && gain.leveledUp,
            animationComplete: progress >= 1
          };
        });
        
        return next;
      });
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setAnimationStates(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(id => {
              next[id] = { ...next[id], isLevelingUp: false };
            });
            return next;
          });
        }, LEVEL_UP_DISPLAY_DURATION);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [expGains]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-2 sm:p-4">
      <div className="bg-[#e8dfd1] rounded-xl border-2 sm:border-4 border-[#9b7a4c] p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600 mb-1 sm:mb-2">
            <i className="fa-solid fa-trophy text-amber-500 mr-1 sm:mr-2" />
            战斗胜利！
          </div>
          <div className="text-[#382b26] text-xs sm:text-sm">
            成功击败了所有敌人
          </div>
        </div>
        
        <div className="bg-[#2c241b] rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="text-[#f0e6d2] text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
            <i className="fa-solid fa-star text-amber-400" />
            经验值结算
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {expGains.map((gain) => {
              const state = animationStates[gain.characterId];
              if (!state) return null;
              
              const displayPercent = state.currentPercent;
              const displayLevel = state.displayLevel;
              const isLevelingUp = state.isLevelingUp;
              
              return (
                <div
                  key={gain.characterId}
                  className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg transition-all ${
                    isLevelingUp ? 'ring-2 ring-amber-400 bg-amber-500/20' : ''
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded overflow-hidden border flex-shrink-0 transition-all ${
                    isLevelingUp ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110' : 'border-[#9b7a4c]'
                  }`}>
                    <img src={resolveImgPath(gain.avatarUrl)} alt={gain.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className={`text-xs sm:text-sm font-bold truncate transition-all ${
                        isLevelingUp ? 'text-amber-300' : 'text-[#f0e6d2]'
                      }`}>{gain.name}</span>
                      <span className={`text-[10px] sm:text-xs font-bold ml-1 transition-all ${
                        isLevelingUp 
                          ? 'text-amber-300 scale-125 animate-pulse' 
                          : 'text-amber-400'
                      }`}>
                        {isLevelingUp && (
                          <span className="mr-0.5">
                            <i className="fa-solid fa-arrow-up" />
                          </span>
                        )}
                        Lv.{displayLevel}
                      </span>
                    </div>
                    
                    <div className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all ${
                      isLevelingUp ? 'bg-amber-900/50 ring-1 ring-amber-400' : 'bg-[#1a1512]'
                    }`}>
                      <div
                        className={`absolute h-full rounded-full transition-all duration-100 ${
                          isLevelingUp 
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                        style={{ width: `${displayPercent}%` }}
                      />
                      {isLevelingUp && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex justify-between mt-0.5">
                      <span className={`text-[8px] sm:text-[10px] transition-all ${
                        isLevelingUp ? 'text-amber-400' : 'text-[#9b7a4c]'
                      }`}>
                        +{gain.gainedExp} EXP
                      </span>
                      <span className={`text-[8px] sm:text-[10px] transition-all ${
                        isLevelingUp ? 'text-amber-300' : 'text-[#8c7b70]'
                      }`}>
                        {displayPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#382b26] text-[#f0e6d2] rounded-lg border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all font-bold text-sm sm:text-base"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
