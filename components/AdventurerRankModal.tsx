import React, { useState, useEffect } from 'react';
import { AdventurerRank, CompletedQuests, ADVENTURER_RANKS } from '../types';
import { QUESTS } from '../data/quest-list';
import { RANK_PROMOTION_REQUIREMENTS } from '../utils/gameConstants';

interface AdventurerRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRank: AdventurerRank;
  completedQuests: CompletedQuests;
  userName: string;
  onPromoteRank: () => void;
}

const RANK_COLORS: Record<AdventurerRank, string> = {
  E: 'text-slate-400',
  D: 'text-emerald-400',
  C: 'text-blue-400',
  B: 'text-violet-400',
  A: 'text-red-400',
  S: 'text-amber-400',
};

const RANK_BG_COLORS: Record<AdventurerRank, string> = {
  E: 'bg-slate-400/20',
  D: 'bg-emerald-400/20',
  C: 'bg-blue-400/20',
  B: 'bg-violet-400/20',
  A: 'bg-red-400/20',
  S: 'bg-amber-400/20',
};

const RANK_BORDER_COLORS: Record<AdventurerRank, string> = {
  E: 'border-slate-500',
  D: 'border-emerald-500',
  C: 'border-blue-500',
  B: 'border-violet-500',
  A: 'border-red-500',
  S: 'border-amber-500',
};

const AdventurerRankModal: React.FC<AdventurerRankModalProps> = ({
  isOpen,
  onClose,
  currentRank,
  completedQuests,
  userName,
  onPromoteRank
}) => {
  const [showPromotionEffect, setShowPromotionEffect] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // 计算当前评级已完成的任务数量
  const getCompletedCountByRank = (rank: AdventurerRank): number => {
    return Object.values(QUESTS).filter(q => q.rank === rank && completedQuests.includes(q.quest_id)).length;
  };

  // 获取下一个评级
  const getNextRank = (): AdventurerRank | null => {
    const currentIndex = ADVENTURER_RANKS.indexOf(currentRank);
    if (currentIndex < 0 || currentIndex >= ADVENTURER_RANKS.length - 1) return null;
    return ADVENTURER_RANKS[currentIndex + 1];
  };

  // 检查是否可以晋升
  const canPromote = (): boolean => {
    if (currentRank === 'S') return false;
    const completed = getCompletedCountByRank(currentRank);
    const required = RANK_PROMOTION_REQUIREMENTS[currentRank];
    return completed >= required;
  };

  // 是否是最高评级
  const isMaxRank = currentRank === 'S';

  // 当前已完成数量
  const completedCount = getCompletedCountByRank(currentRank);
  const requiredCount = RANK_PROMOTION_REQUIREMENTS[currentRank];
  const nextRank = getNextRank();

  // 处理晋升
  const handlePromote = () => {
    if (!canPromote()) return;
    
    setIsPromoting(true);
    setShowPromotionEffect(true);
    
    // 播放特效后执行晋升
    setTimeout(() => {
      onPromoteRank();
      setIsPromoting(false);
      setTimeout(() => {
        setShowPromotionEffect(false);
      }, 1000);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 md:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#f5f0e6] border-2 border-[#9b7a4c] rounded-xl shadow-2xl w-full max-w-sm md:max-w-md relative overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 纸张纹理 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center bg-[#382b26] rounded-full text-[#9b7a4c] hover:bg-[#4a3b32] hover:text-[#f0e6d2] transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* 顶部标题区 */}
        <div className="bg-[#2c241b] px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 border-b-2 border-[#9b7a4c] relative z-10">
          <div className="text-center mt-1 md:mt-2">
            <div className="text-[9px] md:text-[10px] text-[#9b7a4c] tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 font-bold">— 冒险者公会 —</div>
            <h2 className="text-base md:text-xl font-bold text-[#f0e6d2] tracking-wider leading-tight px-2 md:px-4 drop-shadow-md">
              冒险者评级鉴定
            </h2>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 relative z-10">
          
          {/* 小标题：玩家名称 */}
          <div className="text-center pt-2">
            <p className="text-xs md:text-sm text-[#8c7b70] uppercase tracking-wider mb-1">冒险者</p>
            <p className="text-lg md:text-xl font-bold text-[#2c241b] tracking-widest">{userName}</p>
          </div>

          {/* 评级数值 - 大字母显示 */}
          <div className="relative flex justify-center items-center py-2">
            {/* 流光特效背景 */}
            {showPromotionEffect && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className={`w-28 h-28 md:w-40 md:h-40 rounded-full opacity-30 blur-xl ${RANK_BG_COLORS[currentRank]}`}></div>
              </div>
            )}
            
            {/* 评级徽章 */}
            <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all duration-500 ${RANK_BORDER_COLORS[currentRank]} ${showPromotionEffect ? 'scale-110' : 'scale-100'}`}>
              {/* 内部装饰 */}
              <div className={`absolute inset-2 rounded-full border-2 opacity-30 ${RANK_BORDER_COLORS[currentRank]}`}></div>
              
              {/* 评级字母 */}
              <span className={`text-5xl md:text-7xl font-black ${RANK_COLORS[currentRank]} drop-shadow-lg transition-all duration-500 ${showPromotionEffect ? 'animate-pulse' : ''}`}>
                {currentRank}
              </span>
              
              {/* 流光特效 */}
              {showPromotionEffect && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              )}
            </div>
          </div>

          {/* 晋升条件描述 */}
          {!isMaxRank ? (
            <div className={`text-center transition-all duration-500 ${showPromotionEffect ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
              <div className="bg-[#fffef8] border border-[#d6cbb8] rounded-lg p-3 md:p-4 shadow-inner">
                <p className="text-xs md:text-sm text-[#8c7b70] mb-1 md:mb-2">晋升条件</p>
                <p className="text-sm md:text-base">
                  <span className="font-bold text-[#2c241b]">{completedCount}</span>
                  <span className="text-[#5c4d45]"> / </span>
                  <span className="font-bold text-[#b45309]">{requiredCount}</span>
                  <span className="text-[#5c4d45]"> 个任务完成</span>
                </p>
                <p className="text-[10px] md:text-xs text-[#8c7b70] mt-1 md:mt-2">
                  完成后可晋升至{' '}
                  <span className={`font-bold ${RANK_COLORS[nextRank!]}`}>{nextRank}</span>
                  {' '}级
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-400 rounded-lg p-3 md:p-4 shadow-lg">
                <p className="text-sm md:text-base font-bold text-amber-800">
                  <i className="fa-solid fa-crown text-amber-500 mr-1 md:mr-2"></i>
                  您已成为万众瞩目的最强冒险者！
                </p>
              </div>
            </div>
          )}

          {/* 晋升按钮 */}
          {!isMaxRank && (
            <div className="pt-1 md:pt-2">
              <button
                onClick={handlePromote}
                disabled={!canPromote()}
                className={`w-full py-2.5 md:py-3 rounded-lg font-bold tracking-widest text-xs md:text-sm border-2 transition-all relative overflow-hidden
                  ${canPromote()
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                    : 'bg-[#d6cbb8] text-[#8c7b70] border-[#c7bca8] cursor-not-allowed opacity-60'
                  }`}
              >
                {/* 流光特效 */}
                {canPromote() && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent animate-pulse"></div>
                  </>
                )}
                
                <span className="relative z-10">
                  {canPromote() ? (
                    <>
                      <i className="fa-solid fa-arrow-up mr-1 md:mr-2"></i>
                      晋升至 {nextRank} 级
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-lock mr-1 md:mr-2"></i>
                      晋升条件未满足
                    </>
                  )}
                </span>
              </button>
              
              {!canPromote() && (
                <p className="text-center text-[9px] md:text-[11px] text-[#8c7b70] mt-1 md:mt-2">
                  还需完成 <span className="font-bold text-amber-600">{requiredCount - completedCount}</span> 个任务
                </p>
              )}
            </div>
          )}

          {/* 已到达最高评级提示 */}
          {isMaxRank && (
            <div className="pt-1 md:pt-2">
              <div className="w-full py-2 md:py-3 rounded-lg bg-[#2c241b] text-[#f0e6d2] border-2 border-[#9b7a4c] text-center font-bold tracking-widest text-xs md:text-sm">
                <i className="fa-solid fa-trophy text-amber-400 mr-1 md:mr-2"></i>
                已到达最高评级
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AdventurerRankModal;
