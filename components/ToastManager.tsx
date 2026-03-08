import React, { useEffect, useState } from 'react';
import { ITEMS, ITEM_TAGS } from '../data/items';
import { resolveImgPath } from '../utils/imagePath';

// ==================== Toast 类型定义 ====================
export interface ItemToastData {
  id: string;
  type: 'item';
  itemId: string;
  count: number;
}

export interface GoldToastData {
  id: string;
  type: 'gold';
  amount: number;
}

export interface InspirationToastData {
  id: string;
  type: 'inspiration';
  amount: number;
}

export interface AffinityToastData {
  id: string;
  type: 'affinity';
  charId: string;
  characterName: string;
  change: number;
}

export interface CheckInToastData {
  id: string;
  type: 'checkin';
  charId: string;
  characterName: string;
  avatarUrl?: string;
}

export interface UnlockToastData {
  id: string;
  type: 'unlock';
  charId: string;
  characterName: string;
  unlockName: string;
  avatarUrl?: string;
}

export interface SkillToastData {
  id: string;
  type: 'skill';
  skillId: number;
  skillName: string;
  characterName: string;
}

export type ToastData = ItemToastData | GoldToastData | InspirationToastData | AffinityToastData | CheckInToastData | UnlockToastData | SkillToastData;

// ==================== 单个 Toast 组件 ====================

// 道具获得 Toast
const ItemToast: React.FC<{ data: ItemToastData; onComplete: () => void }> = ({ data, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const item = ITEMS[data.itemId];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!item) return null;

  const getIcon = () => {
    if (item.imagePath) return null;
    if (item.tag) {
      const tagInfo = ITEM_TAGS.find(t => t.id === item.tag);
      if (tagInfo?.icon) return tagInfo.icon;
    }
    return '📦';
  };

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#2c1a0c]/95 to-[#1a1005]/95 border-l-4 border-amber-500 rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#3a2311] rounded border border-[#5c3a1a] text-xl shadow-inner overflow-hidden shrink-0">
        {item.imagePath ? (
          <img src={resolveImgPath(item.imagePath)} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          getIcon()
        )}
      </div>
      <div className="relative z-10 flex flex-col">
        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">获得道具</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">{item.name}</span>
          <span className="text-amber-400 font-mono font-bold text-sm">×{data.count}</span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

// 金币 Toast
const GoldToast: React.FC<{ data: GoldToastData; onComplete: () => void }> = ({ data, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const isNegative = data.amount < 0;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const bgGradient = isNegative ? 'from-[#2c0c0c]/95 to-[#1a0505]/95' : 'from-[#2c200c]/95 to-[#1a1305]/95';
  const iconBg = isNegative ? 'bg-[#3a1111]' : 'bg-[#3a2a11]';
  const iconBorder = isNegative ? 'border-[#5c1a1a]' : 'border-[#5c431a]';

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r ${bgGradient} border-l-4 ${isNegative ? 'border-red-500' : 'border-yellow-500'} rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${visible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className={`relative z-10 w-10 h-10 flex items-center justify-center ${iconBg} rounded border ${iconBorder} shadow-inner shrink-0`}>
        <i className={`fa-solid fa-coins text-lg ${isNegative ? 'text-red-400' : 'text-yellow-400'}`}></i>
      </div>
      <div className="relative z-10 flex flex-col">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isNegative ? 'text-red-500' : 'text-yellow-500'}`}>
          {isNegative ? '消耗金币' : '获得金币'}
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`font-bold font-mono text-sm ${isNegative ? 'text-red-300' : 'text-yellow-300'}`}>
            {isNegative ? '' : '+'}{data.amount.toLocaleString()} G
          </span>
        </div>
      </div>
      {!isNegative && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
        </div>
      )}
    </div>
  );
};

// 灵感消耗 Toast
const InspirationToast: React.FC<{ data: InspirationToastData; onComplete: () => void }> = ({ data, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#0c202c]/95 to-[#05131a]/95 border-l-4 border-cyan-500 rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${visible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#112a3a] rounded border border-[#1a435c] shadow-inner shrink-0">
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
        </svg>
      </div>
      <div className="relative z-10 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">消耗灵感</span>
        <div className="flex items-baseline gap-2">
          <span className="font-bold font-mono text-sm text-cyan-300">-{data.amount.toFixed(2)} I</span>
        </div>
      </div>
      {/* 消耗也给一点扫光动画，颜色暗一点 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

// 好感度变化 Toast
const AffinityToast: React.FC<{ data: AffinityToastData; onComplete: () => void }> = ({ data, onComplete }) => {
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

  const isPositive = data.change > 0;
  const displayChange = isPositive ? `+${data.change}` : data.change.toString();
  const borderColor = isPositive ? 'border-pink-500' : 'border-gray-500';
  const bgGradient = isPositive ? 'from-[#2c0c16]/95 to-[#1a050d]/95' : 'from-[#1c1c1c]/95 to-[#111111]/95';
  const iconBg = isPositive ? 'bg-[#3a111d]' : 'bg-[#2a2a2a]';
  const iconBorder = isPositive ? 'border-[#5c1a2e]' : 'border-[#3a3a3a]';
  const textColor = isPositive ? 'text-pink-400' : 'text-gray-400';
  const iconColor = isPositive ? 'text-pink-400' : 'text-gray-500';

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r ${bgGradient} border-l-4 ${borderColor} rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className={`relative z-10 w-10 h-10 flex items-center justify-center ${iconBg} rounded border ${iconBorder} shadow-inner shrink-0 transition-all duration-300 ${isHeartAnimating ? 'scale-125' : 'scale-100'}`}>
        <i className={`fa-solid fa-heart text-xl ${iconColor} ${isHeartAnimating ? 'animate-pulse' : ''}`}></i>
      </div>
      <div className="relative z-10 flex flex-col">
        <span className={`text-[10px] ${textColor} font-bold uppercase tracking-wider`}>好感度变化</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">{data.characterName}</span>
          <span className={`font-mono font-bold text-sm ${isPositive ? 'text-pink-300' : 'text-gray-400'}`}>{displayChange}</span>
        </div>
      </div>
      {isPositive && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-pink-500/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
        </div>
      )}
    </div>
  );
};

// 角色交互解锁 Toast
const UnlockToast: React.FC<{ data: UnlockToastData; onComplete: () => void }> = ({ data, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);
    return () => clearTimeout(hideTimer);
  }, []);

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#2c0c2c]/95 to-[#1a051a]/95 border-l-4 border-purple-500 rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#3a113a] rounded-full border border-[#5c1a5c] overflow-hidden shadow-inner shrink-0">
        {data.avatarUrl ? (
          <img src={resolveImgPath(data.avatarUrl)} alt={data.characterName} className="w-full h-full object-cover" />
        ) : (
          <i className="fa-solid fa-unlock text-purple-400 text-lg"></i>
        )}
      </div>
      <div className="relative z-10 flex flex-col">
        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">关系解锁</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">{data.characterName}</span>
          <span className="text-purple-300 font-normal text-xs">{data.unlockName}</span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

// 角色入住 Toast
const CheckInToast: React.FC<{ data: CheckInToastData; onComplete: () => void }> = ({ data, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);
    return () => clearTimeout(hideTimer);
  }, []);

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#0c2c1a]/95 to-[#051a0f]/95 border-l-4 border-emerald-500 rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#113a23] rounded-full border border-[#1a5c37] overflow-hidden shadow-inner shrink-0">
        {data.avatarUrl ? (
          <img src={resolveImgPath(data.avatarUrl)} alt={data.characterName} className="w-full h-full object-cover" />
        ) : (
          <i className="fa-solid fa-user text-emerald-400 text-lg"></i>
        )}
      </div>
      <div className="relative z-10 flex flex-col">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">新住客入住</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">{data.characterName}</span>
          <span className="text-emerald-300 font-normal text-xs">已入住</span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

// 技能习得 Toast
const SkillToast: React.FC<{ data: SkillToastData; onComplete: () => void }> = ({ data, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);
    return () => clearTimeout(hideTimer);
  }, []);

  return (
    <div className={`relative mb-2 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#0c1a2c]/95 to-[#050d1a]/95 border-l-4 border-indigo-500 rounded-r shadow-2xl backdrop-blur-sm transform transition-all duration-500 ease-out overflow-hidden ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
      <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#11203a] rounded border border-[#1a345c] shadow-inner shrink-0">
        <span className="text-xl">🔯</span>
      </div>
      <div className="relative z-10 flex flex-col">
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">灵魂共鸣习得</span>
        <span className="text-[#f0e6d2] font-bold text-sm shadow-black text-shadow-sm">{data.skillName}</span>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

// ==================== Toast 管理器组件 ====================
interface ToastManagerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemoveToast }) => {
  const renderToast = (toast: ToastData) => {
    const handleComplete = () => onRemoveToast(toast.id);

    switch (toast.type) {
      case 'item':
        return <ItemToast key={toast.id} data={toast} onComplete={handleComplete} />;
      case 'gold':
        return <GoldToast key={toast.id} data={toast} onComplete={handleComplete} />;
      case 'inspiration':
        return <InspirationToast key={toast.id} data={toast} onComplete={handleComplete} />;
      case 'affinity':
        return <AffinityToast key={toast.id} data={toast} onComplete={handleComplete} />;
      case 'checkin':
        return <CheckInToast key={toast.id} data={toast} onComplete={handleComplete} />;
      case 'unlock':
        return <UnlockToast key={toast.id} data={toast} onComplete={handleComplete} />;
      case 'skill':
        return <SkillToast key={toast.id} data={toast} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-[200px] left-4 flex flex-col gap-2">
      {toasts.map(renderToast)}
    </div>
  );
};

export default ToastManager;
