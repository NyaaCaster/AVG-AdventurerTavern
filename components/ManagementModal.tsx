
import React, { useState, useEffect } from 'react';
import { ManagementStats, RevenueLog } from '../types';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ManagementStats;
  logs: RevenueLog[];
  onAction?: (cost: number, changes: Partial<ManagementStats>) => void;
  currentGold?: number;
}

type ActionType = 'sweep' | 'solicit' | 'chat';

// 模块级变量，用于在组件卸载后保持小时内的随机值状态
// 只有刷新页面或小时变更时才会重置
const globalRandomState = {
    hour: -1,
    offsets: {
        sweep: 0,
        solicit: 0,
        chat: 0
    }
};

const getRandomFloat = () => Math.floor(Math.random() * 7) - 3; // -3 to 3

const getHourlyOffsets = () => {
    const currentHour = new Date().getHours();
    if (currentHour !== globalRandomState.hour) {
        globalRandomState.hour = currentHour;
        globalRandomState.offsets = {
            sweep: getRandomFloat(),
            solicit: getRandomFloat(),
            chat: getRandomFloat()
        };
    }
    return globalRandomState.offsets;
};

const ManagementModal: React.FC<ManagementModalProps> = ({ 
    isOpen, 
    onClose, 
    stats, 
    logs,
    onAction,
    currentGold = 0
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'records'>('status');
  const [confirmAction, setConfirmAction] = useState<{
      type: ActionType;
      cost: number;
      preview: Partial<ManagementStats>;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // 辅助函数：根据类型和随机偏移量计算数值变化
  const calculateChanges = (type: ActionType, randomVal: number): Partial<ManagementStats> => {
      let changes: Partial<ManagementStats> = {};
      switch (type) {
          case 'sweep':
              // 扫除：满足度+3%、集客力-1%、好评度-1% (基数)
              changes = {
                  satisfaction: 3 + randomVal,
                  attraction: -1 + randomVal,
                  reputation: -1 + randomVal
              };
              break;
          case 'solicit':
              // 揽客：满足度-1%、集客力+3%、好评度-1% (基数)
              changes = {
                  satisfaction: -1 + randomVal,
                  attraction: 3 + randomVal,
                  reputation: -1 + randomVal
              };
              break;
          case 'chat':
              // 客谈：满足度-1%、集客力-1%、好评度+3% (基数)
              changes = {
                  satisfaction: -1 + randomVal,
                  attraction: -1 + randomVal,
                  reputation: 3 + randomVal
              };
              break;
      }
      return changes;
  };

  const handleActionClick = (type: ActionType) => {
      const offsets = getHourlyOffsets();
      const randomVal = offsets[type];
      const changes = calculateChanges(type, randomVal);

      setConfirmAction({
          type,
          cost: 100,
          preview: changes
      });
  };

  const handleReroll = () => {
      if (!confirmAction || currentGold < 10) return;

      // 1. 扣除 10G (传入空对象表示不修改旅店属性，只走扣费逻辑)
      if (onAction) {
          onAction(10, {});
      }

      // 2. 重新生成该类型的随机数并更新全局状态
      const newRandomVal = getRandomFloat();
      globalRandomState.offsets[confirmAction.type] = newRandomVal;

      // 3. 重新计算预览
      const newChanges = calculateChanges(confirmAction.type, newRandomVal);
      
      setConfirmAction({
          ...confirmAction,
          preview: newChanges
      });
  };

  const executeAction = () => {
      if (confirmAction && onAction && currentGold >= confirmAction.cost) {
          setIsProcessing(true);
          
          // 3秒动画演示
          setTimeout(() => {
              onAction(confirmAction.cost, confirmAction.preview);
              setIsProcessing(false);
              setConfirmAction(null);
          }, 3000);
      }
  };

  const getActionName = (type: ActionType) => {
      switch(type) {
          case 'sweep': return '大扫除';
          case 'solicit': return '出门揽客';
          case 'chat': return '招待客谈';
      }
  };

  const formatChange = (val: number | undefined) => {
      if (val === undefined) return '0%';
      return val > 0 ? `+${val}%` : `${val}%`;
  };

  // Render Status Bar (Progress Bar style) - Compact Version
  const StatBar = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: string }) => (
    <div className="mb-1.5 last:mb-0">
      <div className="flex justify-between items-end mb-0.5">
        <span className="text-[#5c4d45] font-bold text-[10px] md:text-xs flex items-center gap-1.5 whitespace-nowrap">
            <i className={`fa-solid ${icon} w-3 text-center text-[#9b7a4c]`}></i>
            {label}
        </span>
        <span className="text-[#382b26] font-bold text-xs md:text-sm">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#d6cbb8] rounded-full overflow-hidden shadow-inner border border-[#c7bca8]">
        <div 
            className={`h-full ${color} transition-all duration-1000 ease-out`} 
            style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn font-sans">
        
        {/* Ledger Book Frame - PC: 400px height, max-w-2xl width. Mobile: 70vh */}
        <div className="w-full max-w-2xl h-[70vh] md:h-[400px] flex bg-[#e8dfd1] rounded-r-xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden transition-all duration-300">
            
            {/* Book Spine (Left visual) */}
            <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-[#2c241b] via-[#3d3226] to-[#2c241b] z-20 shadow-xl border-r border-[#1a1512]">
                <div className="h-full w-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]"></div>
            </div>

            {/* Book Cover Edge */}
            <div className="absolute inset-0 border-[8px] md:border-[8px] border-[#382b26] rounded-r-xl pointer-events-none z-10 border-l-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]"></div>

            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-1.5 right-3 md:top-2 md:right-3 z-30 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[#5c4d45] hover:text-[#b45309] transition-colors rounded-full hover:bg-[#d6cbb8]/50"
                title="关闭"
            >
                <i className="fa-solid fa-xmark text-base md:text-lg"></i>
            </button>

            {/* Main Content Area - Heavily optimized spacing for 400px height */}
            <div className="flex-1 flex flex-col pl-6 md:pl-8 pr-3 md:pr-4 py-3 relative w-full">
                {/* Paper Lines Background */}
                <div className="absolute inset-0 pointer-events-none opacity-10" 
                    style={{ 
                        backgroundImage: `linear-gradient(#9b7a4c 1px, transparent 1px)`,
                        backgroundSize: '100% 2.5rem',
                        marginTop: '3rem'
                    }}>
                </div>

                {/* Header - Very Compact */}
                <div className="flex items-center justify-center pb-1 border-b border-[#9b7a4c]/30 mb-1.5 relative z-10 shrink-0">
                    <div className="text-center">
                        <h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em]">旅店账本</h2>
                    </div>
                </div>

                {/* Tabs - Very Compact */}
                <div className="flex justify-center gap-6 md:gap-8 mb-2 relative z-10 text-xs md:text-sm font-bold text-[#5c4d45] shrink-0">
                    <button 
                        onClick={() => setActiveTab('status')}
                        className={`pb-0.5 border-b-2 transition-all px-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === 'status' 
                            ? 'border-[#b45309] text-[#b45309] scale-105' 
                            : 'border-transparent hover:text-[#8c7b70]'
                        }`}
                    >
                        <i className="fa-solid fa-chart-pie"></i>
                        旅店状况
                    </button>
                    <button 
                        onClick={() => setActiveTab('records')}
                        className={`pb-0.5 border-b-2 transition-all px-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === 'records' 
                            ? 'border-[#b45309] text-[#b45309] scale-105' 
                            : 'border-transparent hover:text-[#8c7b70]'
                        }`}
                    >
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                        营收记录
                    </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
                    
                    {/* Status Tab */}
                    {activeTab === 'status' && (
                        <div className="h-full flex flex-col px-1 pb-1">
                            {/* Top Stats - Compact Grid */}
                            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 shrink-0">
                                <div className="bg-[#f5f0e6] p-1.5 md:p-2 rounded border border-[#d6cbb8] shadow-sm flex flex-col items-center justify-center">
                                    <span className="text-[#8c7b70] text-[9px] md:text-[10px] font-bold uppercase mb-0.5 whitespace-nowrap">住宿人数</span>
                                    <div className="flex items-baseline gap-1 text-[#382b26]">
                                        <span className="text-lg md:text-2xl font-black">{stats.occupancy}</span>
                                        <span className="text-[9px] md:text-xs text-[#8c7b70] font-medium">/ {stats.maxOccupancy}</span>
                                    </div>
                                    <div className="mt-0.5 w-full md:w-3/4 h-1 bg-[#d6cbb8] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#b45309]" style={{ width: `${(stats.occupancy / stats.maxOccupancy) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="bg-[#f5f0e6] p-1.5 md:p-2 rounded border border-[#d6cbb8] shadow-sm flex flex-col items-center justify-center">
                                    <span className="text-[#8c7b70] text-[9px] md:text-[10px] font-bold uppercase mb-0.5 whitespace-nowrap">客房价格</span>
                                    <div className="flex items-baseline gap-1 text-[#382b26]">
                                        <span className="text-lg md:text-2xl font-black">{stats.roomPrice}</span>
                                        <span className="text-[10px] md:text-xs text-[#b45309] font-bold">G</span>
                                    </div>
                                    <span className="text-[8px] md:text-[9px] text-[#8c7b70] mt-0.5 whitespace-nowrap">每人 / 每晚</span>
                                </div>
                            </div>

                            {/* Middle Bars - Compact */}
                            <div className="bg-[#fcfaf7]/60 p-2 rounded-lg border border-[#d6cbb8]/50 mb-auto shrink-0 flex flex-col justify-center">
                                <StatBar label="满足度" value={stats.satisfaction} color="bg-emerald-500" icon="fa-face-smile" />
                                <StatBar label="集客力" value={stats.attraction} color="bg-cyan-500" icon="fa-magnet" />
                                <StatBar label="好评度" value={stats.reputation} color="bg-rose-500" icon="fa-star" />
                            </div>

                            {/* Bottom Action Cards - Horizontal layout */}
                            <div className="flex flex-col md:grid md:grid-cols-3 gap-2 mt-2 pt-1 border-t border-[#d6cbb8]/30 shrink-0">
                                <InternalActionCard 
                                    icon="fa-broom" 
                                    label="扫除" 
                                    colorClass="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                    iconColor="text-emerald-600"
                                    onClick={() => handleActionClick('sweep')}
                                />
                                <InternalActionCard 
                                    icon="fa-bullhorn" 
                                    label="揽客" 
                                    colorClass="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                                    iconColor="text-amber-600"
                                    onClick={() => handleActionClick('solicit')}
                                />
                                <InternalActionCard 
                                    icon="fa-comments" 
                                    label="客谈" 
                                    colorClass="bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200"
                                    iconColor="text-cyan-600"
                                    onClick={() => handleActionClick('chat')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Records Tab */}
                    {activeTab === 'records' && (
                        <div className="animate-fadeIn px-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[9px] md:text-[10px] text-[#8c7b70] uppercase font-bold tracking-wider border-b border-[#9b7a4c]">
                                    <tr>
                                        <th className="pb-1 pl-1 whitespace-nowrap">日期</th>
                                        <th className="pb-1 whitespace-nowrap">时间</th>
                                        <th className="pb-1 whitespace-nowrap">类型</th>
                                        <th className="pb-1 text-right pr-2 whitespace-nowrap">金额</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] md:text-xs text-[#382b26]">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-[#8c7b70] italic">
                                                暂无营收记录
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="border-b border-[#d6cbb8]/30 hover:bg-[#9b7a4c]/10 transition-colors group">
                                                <td className="py-1 md:py-1.5 pl-1 whitespace-nowrap">{log.dateStr}</td>
                                                <td className="py-1 md:py-1.5 whitespace-nowrap">{log.timeStr}</td>
                                                <td className="py-1 md:py-1.5 whitespace-nowrap">
                                                    {log.type === 'accommodation' ? (
                                                        <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[8px] md:text-[9px] font-bold border border-indigo-200">
                                                            <i className="fa-solid fa-bed"></i> <span className="hidden md:inline">住宿</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded bg-amber-100 text-amber-800 text-[8px] md:text-[9px] font-bold border border-amber-200">
                                                            <i className="fa-solid fa-beer-mug-empty"></i> <span className="hidden md:inline">酒场</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-1 md:py-1.5 text-right pr-2 font-bold group-hover:text-[#b45309] whitespace-nowrap">
                                                    +{log.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            
                            {logs.length >= 100 && (
                                <div className="text-center text-[8px] md:text-[9px] text-[#8c7b70] mt-1.5 italic">
                                    * 仅显示最近 100 条记录
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal Overlay */}
            {confirmAction && !isProcessing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-[#fffef8] border-2 border-[#d6cbb8] shadow-2xl p-3 md:p-5 w-full max-w-sm transform rotate-[-1deg] relative rounded-lg">
                        {/* Tape Effect */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 md:w-24 h-5 md:h-8 bg-[#f3f0e0]/90 shadow-sm border-l border-r border-white/50 transform rotate-[1deg]"></div>
                        
                        {/* Header with Reroll Button */}
                        <div className="flex justify-center items-center mb-2 md:mb-3 pb-1 border-b-2 border-dashed border-[#d6cbb8] relative">
                            <h3 className="text-center font-bold text-[#382b26] text-base md:text-lg">
                                {getActionName(confirmAction.type)}
                            </h3>
                            
                            {/* Reroll Button (Top Right of Note) */}
                            <button
                                onClick={handleReroll}
                                disabled={currentGold < 10}
                                className={`
                                    absolute right-0 top-0 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm transition-all
                                    ${currentGold >= 10 ? 'bg-[#382b26] text-amber-400 hover:bg-[#2c241b]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                                `}
                                title={currentGold < 10 ? "资金不足" : "重置随机数值 (-10G)"}
                            >
                                <i className="fa-solid fa-dice"></i>
                                <span>10 G</span>
                            </button>
                        </div>
                        
                        <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 text-xs md:text-sm">
                            <div className="flex justify-between items-center text-[#5c4d45]">
                                <span>满足度预测:</span>
                                <span className={confirmAction.preview.satisfaction! > 0 ? 'text-emerald-600 font-bold' : confirmAction.preview.satisfaction! < 0 ? 'text-red-600 font-bold' : ''}>
                                    {formatChange(confirmAction.preview.satisfaction)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[#5c4d45]">
                                <span>集客力预测:</span>
                                <span className={confirmAction.preview.attraction! > 0 ? 'text-emerald-600 font-bold' : confirmAction.preview.attraction! < 0 ? 'text-red-600 font-bold' : ''}>
                                    {formatChange(confirmAction.preview.attraction)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[#5c4d45]">
                                <span>好评度预测:</span>
                                <span className={confirmAction.preview.reputation! > 0 ? 'text-emerald-600 font-bold' : confirmAction.preview.reputation! < 0 ? 'text-red-600 font-bold' : ''}>
                                    {formatChange(confirmAction.preview.reputation)}
                                </span>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-[#d6cbb8] flex justify-between items-center font-bold text-sm md:text-base">
                                <span className="text-[#382b26]">所需经费:</span>
                                <span className={currentGold < confirmAction.cost ? "text-red-600" : "text-amber-600"}>
                                    {confirmAction.cost} G
                                </span>
                            </div>
                            {currentGold < confirmAction.cost && (
                                <div className="text-center text-[10px] text-red-500 font-bold">资金不足</div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-1 md:py-1.5 bg-[#e8dfd1] hover:bg-[#d6cbb8] text-[#5c4d45] font-bold rounded transition-colors text-xs md:text-sm"
                            >
                                取消
                            </button>
                            <button 
                                onClick={executeAction}
                                disabled={currentGold < confirmAction.cost}
                                className={`flex-1 py-1 md:py-1.5 font-bold rounded transition-colors shadow-md text-xs md:text-sm ${
                                    currentGold < confirmAction.cost 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-[#382b26] hover:bg-[#2c241b] text-[#f0e6d2]'
                                }`}
                            >
                                执行
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#f5f0e6]/90 backdrop-blur-sm">
                    <div className="w-10 h-10 md:w-14 md:h-14 border-4 border-[#382b26] border-t-transparent rounded-full animate-spin mb-2 md:mb-3"></div>
                    <div className="text-base md:text-lg font-bold text-[#382b26] animate-pulse tracking-widest">
                        正在执行...
                    </div>
                    <div className="mt-1 text-[10px] md:text-xs text-[#8c7b70] font-bold">
                        更新旅店数据中
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

// Simplified Internal Action Card Component
// Layout changed to horizontal (row) to save vertical space
const InternalActionCard: React.FC<{ 
    icon: string; 
    label: string; 
    colorClass: string;
    iconColor: string;
    onClick: () => void;
}> = ({ icon, label, colorClass, iconColor, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center justify-center gap-1.5 md:gap-2
            p-1.5 rounded border transition-all duration-300
            ${colorClass} shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer w-full
        `}
    >
        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/50 flex items-center justify-center ${iconColor} text-xs md:text-sm`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <span className="font-bold text-xs md:text-sm">{label}</span>
    </button>
);

export default ManagementModal;
