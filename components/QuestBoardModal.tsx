import React, { useState, useEffect } from 'react';
import { QuestList, QuestStateMap, QuestStatus, QuestState } from '../types';
import { QUESTS } from '../data/quest-list';
import { ITEMS } from '../data/items';
import { ITEM_TAGS } from '../data/item-type';
import { resolveImgPath } from '../utils/imagePath';
import { goldToInspiration } from '../data/currency-value-table';

interface QuestBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  questStates: QuestStateMap;
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onDeliverQuest: (questId: string) => void;
  currentGold: number;
  inspirationBalance: number;
  onAddGold: (amount: number) => void;
  onConsumeInspiration: (amount: number) => void;
  onAddItems: (items: { id: string; count: number }[]) => void;
  onAddCharacterExp: (exp: number) => void;
  onShowRewardToasts: (gold: number, items: { id: string; count: number }[]) => void;
}
// 统一倒计时（秒）: 1星=1分钟, 10星=10分钟
const QUEST_DURATION_SECONDS: Record<number, number> = {
  1: 1*60, 2: 2*60, 3: 3*60, 4: 4*60, 5: 5*60,
  6: 6*60, 7: 7*60, 8: 8*60, 9: 9*60, 10: 10*60,
};

const QUEST_LIST_DURATION_SECONDS = QUEST_DURATION_SECONDS;

const RANK_COLORS: Record<string, string> = {
  E: 'text-slate-400 border-slate-400/50 bg-slate-400/10',
  D: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10',
  C: 'text-blue-400 border-blue-400/50 bg-blue-400/10',
  B: 'text-violet-400 border-violet-400/50 bg-violet-400/10',
  A: 'text-red-400 border-red-400/50 bg-red-400/10',
  S: 'text-amber-400 border-amber-400/50 bg-amber-400/10',
};

const RANK_SEAL_COLORS: Record<string, string> = {
  E: 'border-slate-500 text-slate-400',
  D: 'border-emerald-600 text-emerald-400',
  C: 'border-blue-600 text-blue-400',
  B: 'border-violet-600 text-violet-400',
  A: 'border-red-600 text-red-400',
  S: 'border-amber-500 text-amber-400',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getItemName(itemId: string): string {
  return ITEMS[itemId]?.name || itemId;
}

function getItemImagePath(itemId: string): string | undefined {
  return ITEMS[itemId]?.imagePath;
}

function getItemTagIcon(itemId: string): string {
  const item = ITEMS[itemId];
  if (!item) return '📦';
  if (item.tag) {
    const tagInfo = ITEM_TAGS.find(t => t.id === item.tag);
    if (tagInfo?.icon) return tagInfo.icon;
  }
  return '📦';
}

function renderStars(count: number, large = false): React.ReactNode {
  return (
    <span className={`font-bold ${large ? 'text-base' : 'text-xs'} text-amber-400`}>
      {'★'.repeat(count)}{'☆'.repeat(10 - count)}
    </span>
  );
}
// 倒计时 hook
function useCountdown(acceptedAt: number | undefined, durationSeconds: number): number {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!acceptedAt) return durationSeconds;
    const elapsed = Math.floor((Date.now() - acceptedAt) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  });

  useEffect(() => {
    if (!acceptedAt) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - acceptedAt) / 1000);
      setRemaining(Math.max(0, durationSeconds - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [acceptedAt, durationSeconds]);

  return remaining;
}

// 一级列表条目
interface QuestListItemProps {
  quest: QuestList;
  status: QuestStatus;
  acceptedAt?: number;
  onClick: () => void;
}

const QuestListItem: React.FC<QuestListItemProps> = ({ quest, status, acceptedAt, onClick }) => {
  const listDuration = QUEST_LIST_DURATION_SECONDS[quest.star] || 60;
  const remaining = useCountdown(status === 'active' ? acceptedAt : undefined, listDuration);

  const statusBadge = () => {
    if (status === 'completed') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600 whitespace-nowrap">
          <i className="fa-solid fa-circle-check text-[9px]"></i>已完成
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-600 whitespace-nowrap font-mono">
          <i className="fa-solid fa-hourglass-half text-[9px] animate-pulse"></i>
          {formatTime(remaining)}
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer
        transition-all duration-200 group shadow-sm
        ${
          status === 'completed'
            ? 'bg-gradient-to-r from-[#1a3a2a] to-[#0f241a] border-emerald-700 hover:border-emerald-500 hover:shadow-emerald-900/50 hover:shadow-lg'
            : status === 'active'
            ? 'bg-gradient-to-r from-[#3a2a0a] to-[#2a1a05] border-amber-600 hover:border-amber-400 hover:shadow-amber-900/50 hover:shadow-lg'
            : 'bg-[#fcfaf7] border-[#d6cbb8] hover:border-[#9b7a4c] hover:shadow-md hover:bg-[#fffef8]'
        }
      `}
    >
      {/* 左侧星级 */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#382b26] to-[#1a1512] border border-[#9b7a4c]/80 shadow-inner flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none"></div>
        <i className="fa-solid fa-star text-amber-400 text-[10px] drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]"></i>
        <span className="text-amber-400 font-bold text-sm font-mono leading-none drop-shadow-md">{quest.star}</span>
      </div>

      {/* 中间内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`font-bold text-sm leading-tight ${
            status === 'completed' ? 'text-emerald-300 line-through' :
            status === 'active' ? 'text-amber-300' : 'text-[#2c241b]'
          }`}>{quest.quest_name}</span>
          {statusBadge()}
        </div>
        <p className={`text-[11px] mt-0.5 line-clamp-2 leading-snug ${
          status === 'completed' ? 'text-emerald-400' :
          status === 'active' ? 'text-amber-200' : 'text-[#5c4d45]'
        }`}>{quest.description}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
            RANK_COLORS[quest.rank] || RANK_COLORS['E']
          }`}>{quest.rank}</span>
          <span className={`text-[10px] font-bold font-mono ${
            status === 'completed' ? 'text-emerald-400' :
            status === 'active' ? 'text-amber-300' : 'text-amber-500'
          }`}>
            <i className="fa-solid fa-coins text-[9px] mr-0.5"></i>{quest.rewards.gold.toLocaleString()}G
          </span>
          {quest.rewards.items.slice(0, 2).map((item, i) => (
            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
              status === 'completed' ? 'text-emerald-300 bg-emerald-900/40 border-emerald-700' :
              status === 'active' ? 'text-amber-200 bg-amber-900/40 border-amber-700' :
              'text-[#5c4d45] bg-[#e0d6c5] border-[#c7bca8]'
            }`}>
<span>{getItemTagIcon(item.item_id)}</span>
              {getItemName(item.item_id)}x{item.item_num}
            </span>
          ))}
        </div>
      </div>

      {/* 右侧箭头 */}
      <div className="flex-shrink-0 text-[#9b7a4c] opacity-40 group-hover:opacity-100 transition-opacity mt-1">
        <i className="fa-solid fa-chevron-right text-xs"></i>
      </div>
    </div>
  );
};
// 任务详情弹窗
interface QuestDetailModalProps {
  quest: QuestList;
  status: QuestStatus;
  acceptedAt?: number;
  hasActiveQuest: boolean;
  currentGold: number;
  inspirationBalance: number;
  onAccept: () => void;
  onComplete: () => void;
  onInstantComplete: () => void;
  onClose: () => void;
}

const QuestDetailModal: React.FC<QuestDetailModalProps> = ({
  quest, status, acceptedAt, hasActiveQuest, currentGold, inspirationBalance, onAccept, onComplete, onInstantComplete, onClose
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const duration = QUEST_DURATION_SECONDS[quest.star] || 300;
  const remaining = useCountdown(status === 'active' ? acceptedAt : undefined, duration);

  const statusSeal = () => {
    if (status === 'completed') {
      return (
        <div className="absolute top-4 right-4 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center rotate-[-15deg] opacity-90 shadow-lg shadow-emerald-900/50">
          <span className="text-emerald-400 font-bold text-xs md:text-sm tracking-widest text-center leading-tight">完成</span>
        </div>
      );
    }
    if (status === 'active') {
      return (
        <div className="absolute top-4 right-4 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-500 flex items-center justify-center rotate-[10deg] opacity-90 shadow-lg shadow-amber-900/50">
          <span className="text-amber-400 font-bold text-xs md:text-sm tracking-widest text-center leading-tight">进行中</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#f5f0e6] border-2 border-[#9b7a4c] rounded-xl shadow-2xl w-full max-w-sm md:max-w-md relative overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
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

        {/* 状态印章 */}
        {statusSeal()}

        {/* 顶部标题区 */}
        <div className="bg-[#2c241b] px-6 pt-5 pb-4 border-b-2 border-[#9b7a4c]">
          <div className="text-center mt-2">
            <div className="text-[10px] text-[#9b7a4c] tracking-[0.3em] uppercase mb-1 font-bold">— 冒险者公会 悬赏令 —</div>
            <h2 className="text-lg md:text-xl font-bold text-[#f0e6d2] tracking-wider leading-tight px-8 drop-shadow-md">{quest.quest_name}</h2>
          </div>
          {/* 星级 - 只显示对应数量实心星星，居中 */}
          <div className="flex justify-center mt-2 flex-wrap items-center gap-0.5 px-4 max-w-[80%] mx-auto">
            {Array.from({ length: quest.star }).map((_, i) => (
              <i key={i} className="fa-solid fa-star text-amber-400 text-xs md:text-sm drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"></i>
            ))}
          </div>
        </div>

        {/* 怪物图片 */}
        <div className="relative bg-gradient-to-br from-[#382b26] via-[#1a1512] to-[#2c241b] flex items-center justify-center overflow-hidden border-b-2 border-[#382b26]" style={{ minHeight: '160px', maxHeight: '220px' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512] via-transparent to-transparent opacity-80 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(155,122,76,0.1)_0%,transparent_70%)] z-0" />
          <img
            src={resolveImgPath(`img/quest/${quest.target_image}`)}
            alt={quest.target}
            className="w-full h-full object-contain relative z-0 drop-shadow-2xl"
            style={{ maxHeight: '220px' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute bottom-2 left-0 right-0 text-center z-20">
            <span className="text-[10px] text-[#d6cbb8] tracking-widest uppercase bg-[#1a1512]/60 px-3 py-1 rounded-full border border-[#9b7a4c]/30 backdrop-blur-sm">TARGET: {quest.target}</span>
          </div>
        </div>

        {/* 详情内容 */}
        <div className="p-4 md:p-5 space-y-3">
          {/* 描述 */}
          <div className="bg-[#fffef8] border border-[#d6cbb8] rounded-lg p-3 shadow-inner">
            <p className="text-sm text-[#4a3b32] leading-relaxed">{quest.description}</p>
          </div>

          {/* 限定评级 + 花费时间 */}
          <div className="flex gap-3">
            <div className="flex-1 bg-[#fffef8] border border-[#d6cbb8] rounded-lg p-3">
              <div className="text-[10px] text-[#8c7b70] uppercase tracking-wider mb-1 font-bold">限定评级</div>
              <span className={`text-lg font-bold font-mono px-2 py-0.5 rounded border ${
                RANK_COLORS[quest.rank] || RANK_COLORS['E']
              }`}>{quest.rank}</span>
            </div>
            <div className="flex-1 bg-[#fffef8] border border-[#d6cbb8] rounded-lg p-3">
              <div className="text-[10px] text-[#8c7b70] uppercase tracking-wider mb-1 font-bold">任务时限</div>
              <span className="text-lg font-bold font-mono text-[#382b26]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* 奖励 */}
          <div className="bg-[#fffef8] border border-[#d6cbb8] rounded-lg p-3">
            <div className="text-[10px] text-[#8c7b70] uppercase tracking-wider mb-2 font-bold">委托报酬</div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-coins text-amber-500"></i>
              <span className="font-bold text-[#b45309] text-base font-mono">{quest.rewards.gold.toLocaleString()} G</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {quest.rewards.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                    {getItemImagePath(item.item_id) ? (
                      <img src={resolveImgPath(getItemImagePath(item.item_id)!)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base">{getItemTagIcon(item.item_id)}</span>
                    )}
                  </div>
                  <span className="text-sm text-[#382b26] font-medium">{getItemName(item.item_id)}</span>
<span className="text-sm text-[#9b7a4c] font-bold font-mono ml-auto">x{item.item_num}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 操作区 */}
          <div className="pt-1">
            {status === 'available' && (
              <div>
                <button
                  onClick={onAccept}
                  disabled={hasActiveQuest}
                  className={`w-full py-3 rounded-lg font-bold tracking-widest text-sm border-2 transition-all ${
                    hasActiveQuest
                      ? 'bg-[#d6cbb8] text-[#8c7b70] border-[#c7bca8] cursor-not-allowed opacity-60'
                      : 'bg-[#382b26] text-[#f0e6d2] border-[#9b7a4c] hover:bg-[#4a3b32] hover:scale-[1.01] active:scale-[0.98]'
                  }`}
                >
                  <i className="fa-solid fa-scroll mr-2"></i>接受委托
                </button>
                {hasActiveQuest && (
                  <p className="text-center text-[11px] text-[#8c7b70] mt-1.5">等待其他委托完成</p>
                )}
              </div>
            )}
            {status === 'active' && (
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-amber-500 tracking-widest">{formatTime(remaining)}</div>
                <p className="text-[11px] text-[#8c7b70] mt-1">倒计时结束后任务自动完成</p>
                {(() => {
                  // 计算灵感消耗：金币奖励的50%换算为灵感
                  const inspirationCost = goldToInspiration(Math.floor(quest.rewards.gold * 0.5));
                  const canAfford = inspirationBalance >= inspirationCost;
                  return (
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={!canAfford}
                      className={`mt-3 w-full py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                        canAfford
                          ? 'bg-[#2c241b] text-cyan-300 border-cyan-700 hover:bg-cyan-900/40 hover:border-cyan-500 active:scale-[0.98]'
                          : 'bg-[#1a1512] text-slate-500 border-slate-700 cursor-not-allowed opacity-70'
                      }`}
                    >
                      <svg className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                      </svg>
                      立刻完成
                      <span className={`ml-2 text-xs font-mono ${
                        canAfford ? 'text-cyan-400/80' : 'text-red-400'
                      }`}>(-{inspirationCost.toFixed(2)}I)</span>
                    </button>
                  );
                })()}
              </div>
            )}
{status === 'completed' && (
              <button
                onClick={onComplete}
                className="w-full py-3 rounded-lg font-bold tracking-widest text-sm border-2 bg-emerald-800 text-emerald-100 border-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <i className="fa-solid fa-circle-check mr-2"></i>交付委托
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 立刻完成确认弹窗 */}
      {showConfirm && (() => {
        const inspirationCost = goldToInspiration(Math.floor(quest.rewards.gold * 0.5));
        const remaining = inspirationBalance - inspirationCost;
        return (
          <div
            className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-auto animate-fadeIn"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="relative w-full max-w-xs rounded-2xl p-6 flex flex-col"
              style={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(34,211,238,0.3)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(34,211,238,0.1)',
                backdropFilter: 'blur(16px)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* 顶部青色装饰线 */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: '40px',
                  height: '2px',
                  marginTop: '-1px',
                  background: 'linear-gradient(to right, transparent, rgba(34,211,238,0.8), transparent)',
                }}
              />

              <div className="text-center mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: 'rgba(34,211,238,0.1)',
                    border: '1px solid rgba(34,211,238,0.25)',
                    boxShadow: '0 0 15px rgba(34,211,238,0.15)',
                  }}
                >
                  <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-200 tracking-wider">确认立刻完成？</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div 
                  className="flex justify-between items-center rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}
                >
                  <span className="text-sm text-slate-400">消耗灵感</span>
                  <span className="font-medium text-cyan-400 font-mono">-{inspirationCost.toFixed(2)} I</span>
                </div>
                <div 
                  className="flex justify-between items-center rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.1)' }}
                >
                  <span className="text-sm text-slate-400">当前持有</span>
                  <span className="font-medium text-slate-300 font-mono">{inspirationBalance.toFixed(2)} I</span>
                </div>
                <div 
                  className="flex justify-between items-center rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}
                >
                  <span className="text-sm text-slate-400">结余</span>
                  <span className="font-medium text-emerald-400 font-mono">{remaining.toFixed(2)} I</span>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all border border-transparent hover:border-slate-700 tracking-widest"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onInstantComplete();
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all tracking-widest"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
// 交付确认弹窗
interface RewardConfirmModalProps {
  quest: QuestList;
  onConfirm: () => void;
  onClose: () => void;
}

const RewardConfirmModal: React.FC<RewardConfirmModalProps> = ({ quest, onConfirm, onClose }) => (
  <div
    className="absolute inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
    onClick={onClose}
  >
    <div
      className="bg-[#fffef8] border-2 border-[#d6cbb8] rounded-xl shadow-2xl w-full max-w-xs md:max-w-sm p-5 relative"
      style={{ transform: 'rotate(-1deg)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* 胶带装饰 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-[rgba(243,240,224,0.9)] border-x border-white/50 shadow-sm" style={{ transform: 'translateX(-50%) rotate(1deg)' }} />

      <div className="text-center mb-4">
        <i className="fa-solid fa-circle-check text-3xl text-emerald-500 mb-2"></i>
        <h3 className="text-lg font-bold text-[#2c241b] tracking-wider">委托完成！</h3>
        <p className="text-xs text-[#8c7b70] mt-1">获得以下报酬</p>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <i className="fa-solid fa-coins text-amber-500 text-lg"></i>
          <span className="font-bold text-[#b45309] text-lg font-mono">{quest.rewards.gold.toLocaleString()} G</span>
        </div>
        {quest.rewards.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#f5f0e6] border border-[#d6cbb8] rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              {getItemImagePath(item.item_id) ? (
                <img src={resolveImgPath(getItemImagePath(item.item_id)!)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base">{getItemTagIcon(item.item_id)}</span>
              )}
            </div>
            <span className="text-sm font-medium text-[#382b26]">{getItemName(item.item_id)}</span>
<span className="ml-auto font-bold text-[#9b7a4c] font-mono">x{item.item_num}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onConfirm}
        className="w-full py-3 rounded-lg font-bold tracking-widest text-sm bg-[#382b26] text-[#f0e6d2] border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all"
      >
        <i className="fa-solid fa-check mr-2"></i>确认领取
      </button>
    </div>
  </div>
);
// 主组件
const QuestBoardModal: React.FC<QuestBoardModalProps> = ({
  isOpen, onClose, questStates, onAcceptQuest, onCompleteQuest, onDeliverQuest,
  currentGold, inspirationBalance, onAddGold, onConsumeInspiration, onAddItems, onAddCharacterExp, onShowRewardToasts
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [rewardQuestId, setRewardQuestId] = useState<string | null>(null);
  const [starFilter, setStarFilter] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const allQuests = Object.values(QUESTS);

  // 有进行中任务
  const hasActiveQuest = Object.values(questStates as QuestStateMap).some(s => s.status === 'active');

  // 检查进行中任务是否已完成（倒计时归零）
  useEffect(() => {
    const interval = setInterval(() => {
      Object.values(questStates as QuestStateMap).forEach((state: QuestState) => {
        if (state.status === 'active' && state.acceptedAt) {
          const quest = QUESTS[state.questId];
          if (!quest) return;
          const duration = QUEST_DURATION_SECONDS[quest.star] || 300;
          const elapsed = Math.floor((Date.now() - state.acceptedAt) / 1000);
          if (elapsed >= duration) {
            onCompleteQuest(state.questId);
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [questStates, onCompleteQuest]);



  const filteredQuests = starFilter.length === 0
    ? allQuests
    : allQuests.filter(q => starFilter.includes(q.star));

  // 排序：进行中 > 已完成 > 未接受，同状态按星级升序
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    const order = { active: 0, completed: 1, available: 2 };
    const sa = questStates[a.quest_id]?.status || 'available';
    const sb = questStates[b.quest_id]?.status || 'available';
    if (order[sa] !== order[sb]) return order[sa] - order[sb];
    return a.star - b.star;
  });

  const toggleStar = (star: number) => {
    setStarFilter(prev =>
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const handleAccept = (questId: string) => {
    onAcceptQuest(questId);
    setSelectedQuestId(null);
  };

  const handleDeliverClick = (questId: string) => {
    setRewardQuestId(questId);
    setSelectedQuestId(null);
  };

  const handleInstantComplete = (questId: string) => {
    const quest = QUESTS[questId];
    if (!quest) return;
    // 计算灵感消耗：金币奖励的50%换算为灵感
    const inspirationCost = goldToInspiration(Math.floor(quest.rewards.gold * 0.5));
    onConsumeInspiration(inspirationCost);
    onCompleteQuest(questId);
    setSelectedQuestId(null);
  };

  const handleConfirmReward = () => {
    if (!rewardQuestId) return;
    const quest = QUESTS[rewardQuestId];
    if (!quest) return;
    onAddGold(quest.rewards.gold);
    onAddItems(quest.rewards.items.map(i => ({ id: i.item_id, count: i.item_num })));
    onAddCharacterExp(quest.rewards.experience || 0);
    onShowRewardToasts(
      quest.rewards.gold,
      quest.rewards.items.map(i => ({ id: i.item_id, count: i.item_num }))
    );
    onDeliverQuest(rewardQuestId);
    setRewardQuestId(null);
    onClose();
  };

  if (!isOpen) return null;

  const selectedQuest = selectedQuestId ? QUESTS[selectedQuestId] : null;
  const selectedState = selectedQuestId ? (questStates[selectedQuestId] || { questId: selectedQuestId, status: 'available' as QuestStatus }) : null;
  const rewardQuest = rewardQuestId ? QUESTS[rewardQuestId] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 md:p-4 animate-fadeIn">
      <div className="w-full max-w-lg md:max-w-xl h-[90vh] md:h-[85vh] flex flex-col bg-[#2c241b] border-2 border-[#9b7a4c] rounded-xl shadow-2xl overflow-hidden relative">

        {/* 纸张纹理背景 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />

        {/* 顶部标题栏 + 筛选器 */}
        <div className="flex-shrink-0 bg-[#382b26] px-4 py-3 border-b-2 border-[#9b7a4c] relative z-10 flex items-center gap-3 shadow-md">
          <i className="fa-solid fa-scroll text-[#9b7a4c] text-2xl drop-shadow-sm"></i>
          <div>
            <h2 className="text-[#f0e6d2] font-bold text-base md:text-lg tracking-widest drop-shadow-sm">委托告示板</h2>
            <p className="text-[#9b7a4c] text-[9px] md:text-[10px] tracking-wider uppercase">ADVENTURERS GUILD — QUEST BOARD</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* 星级筛选按钮 */}
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-bold transition-colors ${
                starFilter.length > 0
                  ? 'bg-amber-900/60 border-amber-600 text-amber-300'
                  : 'bg-[#2c241b] border-[#9b7a4c]/50 text-[#9b7a4c] hover:border-[#9b7a4c]'
              }`}
            >
              <i className="fa-solid fa-star text-[10px]"></i>
              {starFilter.length > 0 ? `${[...starFilter].sort((a,b)=>a-b).join(',')}★` : '筛选'}
              <i className={`fa-solid fa-chevron-${filterOpen ? 'up' : 'down'} text-[9px]`}></i>
            </button>
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-[#2c241b] border border-[#9b7a4c]/50 rounded text-[#9b7a4c] hover:bg-[#4a3b32] hover:text-[#f0e6d2] transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* 星级筛选展开面板 - 内联渲染，不用弹出定位 */}
        {filterOpen && (
          <div className="flex-shrink-0 bg-[#2c241b] border-b border-[#9b7a4c]/50 px-4 py-3">
            <div className="text-[10px] text-[#9b7a4c] mb-2 tracking-wider">选择星级（可多选）</div>
            <div className="flex flex-wrap gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10].map(star => (
                <button
                  key={star}
                  onClick={() => toggleStar(star)}
                  className={`w-9 h-9 rounded text-xs font-bold font-mono border transition-colors ${
                    starFilter.includes(star)
                      ? 'bg-amber-600 border-amber-400 text-white'
                      : 'bg-[#382b26] border-[#9b7a4c]/30 text-[#9b7a4c] hover:border-amber-500 hover:text-amber-400'
                  }`}
                >
                  <i className="fa-solid fa-star text-[8px] mr-0.5"></i>{star}
                </button>
              ))}
              {starFilter.length > 0 && (
                <button
                  onClick={() => setStarFilter([])}
                  className="px-3 h-9 rounded text-[10px] text-[#9b7a4c] border border-[#9b7a4c]/30 hover:text-[#f0e6d2] hover:border-[#9b7a4c] transition-colors"
                >清除</button>
              )}
            </div>
          </div>
        )}

        {/* 任务列表 */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 custom-scrollbar bg-[#e8dfd1] relative z-10">
          {/* 横线装饰 */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#9b7a4c 1px, transparent 1px)', backgroundSize: '100% 2.5rem', marginTop: '0' }}
          />
          {sortedQuests.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5c4d45] opacity-60 gap-3">
              <i className="fa-solid fa-scroll text-5xl"></i>
              <span className="font-bold tracking-widest">暂无符合条件的委托</span>
            </div>
          ) : (
            sortedQuests.map(quest => {
              const state = questStates[quest.quest_id];
              const status: QuestStatus = state?.status || 'available';
              return (
                <QuestListItem
                  key={quest.quest_id}
                  quest={quest}
                  status={status}
                  acceptedAt={state?.acceptedAt}
                  onClick={() => setSelectedQuestId(quest.quest_id)}
                />
              );
            })
          )}
        </div>

        {/* 底部状态栏 */}
        <div className="flex-shrink-0 bg-[#382b26] border-t border-[#9b7a4c]/50 px-4 py-2 flex justify-between items-center text-[10px] text-[#9b7a4c] font-mono relative z-10">
          <span>QUESTS: {sortedQuests.length} / {allQuests.length}</span>
          <span>
            {hasActiveQuest ? (
              <span className="text-amber-400 flex items-center gap-1">
                <i className="fa-solid fa-hourglass-half animate-pulse"></i>委托进行中
              </span>
            ) : '无进行中委托'}
          </span>
        </div>

        {/* 任务详情弹窗 */}
        {selectedQuest && selectedState && (
          <QuestDetailModal
            quest={selectedQuest}
            status={selectedState.status}
            acceptedAt={selectedState.acceptedAt}
            hasActiveQuest={hasActiveQuest && selectedState.status !== 'active'}
            currentGold={currentGold}
            inspirationBalance={inspirationBalance}
            onAccept={() => handleAccept(selectedQuest.quest_id)}
            onComplete={() => handleDeliverClick(selectedQuest.quest_id)}
            onInstantComplete={() => handleInstantComplete(selectedQuest.quest_id)}
            onClose={() => setSelectedQuestId(null)}
          />
        )}

        {/* 交付确认弹窗 */}
        {rewardQuest && (
          <RewardConfirmModal
            quest={rewardQuest}
            onConfirm={handleConfirmReward}
            onClose={() => setRewardQuestId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default QuestBoardModal;
