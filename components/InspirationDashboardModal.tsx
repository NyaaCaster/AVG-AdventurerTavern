import React, { useState, useEffect, useMemo } from 'react';
import { 
    getSanityBalance, 
    getSanityDashboard, 
    getSanityRecords, 
    SanityRecord, 
    SANITY_CONSUME_TYPES, 
    SANITY_RECHARGE_TYPES 
} from '../services/db';
import { sanityToInspiration } from '../data/currency-value-table';

type TabType = 'overview' | 'records' | 'quota';
type FilterCategory = 'all' | 'consume' | 'recharge';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

const SanityIcon: React.FC<{className?: string}> = ({className = "w-6 h-6 text-cyan-400"}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
);

const InspirationDashboardModal: React.FC<Props> = ({ isOpen, onClose, userId }) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setVisible(true), 10);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [isOpen]);

                // 总览数据
    const [overviewData, setOverviewData] = useState<{ todayRequests: number; chartData: { date: string; amount: number; aiAmount: number }[] }>({ todayRequests: 0, chartData: [] });

    // 记录数据
    const [records, setRecords] = useState<SanityRecord[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
    const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM-DD

    // 柱状图点击高亮状态
    const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchBalance();
            if (activeTab === 'overview') {
                fetchOverview();
            } else if (activeTab === 'records') {
                fetchRecords(1);
            }
        }
    }, [isOpen, activeTab, userId]);

    const fetchBalance = async () => {
        const res = await getSanityBalance(userId, 1);
        if (res) setBalance(res.balance);
    };

        const fetchOverview = async () => {
        setIsLoading(true);
        const data = await getSanityDashboard(userId);
        if (data) {
            console.log('[Dashboard] Received data:', data);
            setOverviewData(data);
        }
        setIsLoading(false);
    };

    const fetchRecords = async (page: number) => {
        setIsLoading(true);
        let startTimestamp: number | undefined = undefined;
        let endTimestamp: number | undefined = undefined;
        if (dateFilter) {
            const [y, m, d] = dateFilter.split('-');
            startTimestamp = new Date(parseInt(y), parseInt(m)-1, parseInt(d)).getTime();
            endTimestamp = startTimestamp + 24 * 60 * 60 * 1000 - 1; // 到当天的最后一毫秒
        }

        const res = await getSanityRecords(userId, page, 10, categoryFilter, startTimestamp, endTimestamp);
        if (res) {
            setRecords(res.records);
            setTotalRecords(res.total);
            setCurrentPage(page);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen && activeTab === 'records') {
            fetchRecords(1);
        }
    }, [categoryFilter, dateFilter]);

    if (!isOpen) return null;

    const totalPages = Math.ceil(totalRecords / 10);

            const renderOverview = () => {
        // 从图表数据中获取今日消耗（最后一项）
        const todayChartData = overviewData.chartData[overviewData.chartData.length - 1];
        const todayConsumed = todayChartData ? todayChartData.amount : 0;
        const todayAiConsumed = todayChartData ? todayChartData.aiAmount : 0;
        
        // 计算Y轴最大值，为了图表美观，向上取整到10的倍数
        const maxAmount = Math.max(...overviewData.chartData.map(d => d.amount), 10);
        let yAxisMax = Math.ceil(maxAmount / 10) * 10;
        if (yAxisMax > 100) {
            yAxisMax = Math.ceil(maxAmount / 100) * 100;
        }

        return (
            <div className="flex flex-col gap-6">
                {/* 介绍区块 */}
                <div 
                    className="rounded-xl p-6 flex flex-col items-center gap-5 relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(148,163,184,0.1)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="flex items-center justify-center w-12 h-12 rounded-full"
                            style={{
                                background: 'rgba(34,211,238,0.1)',
                                border: '1px solid rgba(34,211,238,0.25)',
                                boxShadow: '0 0 20px rgba(34,211,238,0.15)',
                            }}
                        >
                            <SanityIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-4xl font-light text-slate-100 tracking-wider">{sanityToInspiration(balance).toFixed(2)}</span>
                        <span className="text-xl text-cyan-400 font-medium ml-1">Ins</span>
                    </div>
                    
                    <div className="w-full h-[1px]" style={{ background: 'rgba(148,163,184,0.12)' }} />

                    <p className="text-sm text-slate-300 text-center leading-loose max-w-lg font-light">
                        <span className="text-cyan-400 font-medium">灵感</span> 是基于账号的特殊货币，不会随 <span className="text-amber-500 font-medium">存档/读档</span> 功能回滚。<br />
                        <span className="text-amber-500 font-medium">🐈︎</span> <span className="text-purple-400 font-medium">Multi-Head Memory System</span> 已用 <span className="text-cyan-400 font-medium">灵感</span> 为您节省了75%的Token开销，<br />
                        并维持角色的特定永久化记忆。<br />
                        <span className="text-cyan-400 font-medium">灵感</span> 也用于支付游戏中的各类 <span className="text-purple-400 font-medium">偷懒</span> 费用，请适度使用。
                    </p>
                </div>

                {/* 统计区块 */}
                <div 
                    className="rounded-xl p-6"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(148,163,184,0.1)',
                    }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-slate-200 border-l-2 border-cyan-500 pl-3">综合统计</h3>
                                                                                {todayAiConsumed > 0 && (
                            <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-800/50">
                                今日为您节省了约 ￥{((todayAiConsumed / 10000) * 20 * 0.08694).toFixed(2)} 的 API 账单
                            </span>
                        )}
                        </div>
                        <div className="flex gap-6 text-sm">
                                                        <div className="flex flex-col items-end">
                                <span className="text-slate-400">今日消耗</span>
                                <span className="text-cyan-400 font-medium text-lg">{sanityToInspiration(todayConsumed).toFixed(2)} I</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-slate-400">今日请求</span>
                                <span className="text-indigo-400 font-medium text-lg">{overviewData.todayRequests} 次</span>
                            </div>
                        </div>
                    </div>

                    {/* 柱状图 */}
                    <div className="h-48 flex items-end justify-between pt-6 pr-4 pl-8 relative mt-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', borderLeft: '1px solid rgba(148,163,184,0.1)' }}>
                        {/* Y轴刻度 */}
                        <div className="absolute left-1 bottom-0 h-full flex flex-col justify-between text-[10px] text-slate-500 pb-6 pt-6">
                            <span>{sanityToInspiration(yAxisMax).toFixed(2)}</span>
                            <span>{sanityToInspiration(yAxisMax / 2).toFixed(2)}</span>
                            <span>0.00</span>
                        </div>

                        {overviewData.chartData.map((d, i) => {
                            const heightPercent = (d.amount / yAxisMax) * 100;
                            const isActive = activeChartIndex === i;
                            return (
                                <div 
                                    key={i} 
                                    className="flex flex-col items-center justify-end h-full w-10 sm:w-12 group cursor-pointer"
                                    onClick={() => setActiveChartIndex(isActive ? null : i)}
                                >
                                    <div 
                                        className={`relative w-6 sm:w-8 transition-all rounded-t-sm flex items-end justify-center ${isActive ? 'bg-cyan-400/60' : 'bg-cyan-500/40 hover:bg-cyan-400/60'}`} 
                                        style={{ height: `${Math.max(1, heightPercent)}%` }}
                                    >
                                        <span className={`absolute -top-6 text-[10px] font-medium text-cyan-300 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {sanityToInspiration(d.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-6 text-[10px] text-slate-500">{d.date}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderRecords = () => {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div 
                    className="flex flex-wrap items-center justify-between gap-4 mb-4 p-3 rounded-xl"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(148,163,184,0.1)',
                    }}
                >
                    <div className="flex gap-2">
                        {['all', 'consume', 'recharge'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setCategoryFilter(t as FilterCategory)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${categoryFilter === t ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}
                            >
                                {t === 'all' ? '全部' : t === 'consume' ? '消耗' : '充值'}
                            </button>
                        ))}
                    </div>
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-black/20 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600/30 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="text-center py-10 text-cyan-500/50 animate-pulse flex flex-col items-center">
                            <SanityIcon className="w-12 h-12 mb-4" />
                            <span className="text-sm tracking-widest">正在加载记录...</span>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">暂无记录</div>
                    ) : (
                        records.map(r => {
                            const isConsume = r.amount < 0;
                            // 匹配类型名称
                            const typeObj = isConsume ? SANITY_CONSUME_TYPES : SANITY_RECHARGE_TYPES;
                            const displayName = typeObj[r.type as keyof typeof typeObj] || r.type;
                            
                            const date = new Date(r.created_at);
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            const h = String(date.getHours()).padStart(2, '0');
                            const min = String(date.getMinutes()).padStart(2, '0');
                            const s = String(date.getSeconds()).padStart(2, '0');
                            const dateStr = `${y}-${m}-${d} ${h}:${min}:${s}`;
                            
                            return (
                                <div 
                                    key={r.id} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 rounded-xl transition-colors"
                                    style={{
                                        background: 'rgba(255,255,255,0.015)',
                                        border: '1px solid rgba(148,163,184,0.08)',
                                    }}
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium tracking-wider ${isConsume ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
                                                {displayName}
                                            </span>
                                            <span className="text-xs text-slate-400">{dateStr}</span>
                                        </div>
                                        {r.description && <span className="text-xs text-slate-500 pl-1">{r.description}</span>}
                                    </div>
                                    <span className={`text-lg font-medium self-end sm:self-auto ${isConsume ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                        {isConsume ? '' : '+'}{sanityToInspiration(r.amount).toFixed(4)} I
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                    <button 
                        disabled={currentPage === 1 || isLoading}
                        onClick={() => fetchRecords(currentPage - 1)}
                        className="px-4 py-2 text-slate-300 text-sm font-medium rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                        <i className="fa-solid fa-chevron-left mr-2"></i>上一页
                    </button>
                    <span className="text-slate-400 text-sm font-light">{currentPage} / {totalPages || 1}</span>
                    <button 
                        disabled={currentPage >= totalPages || isLoading}
                        onClick={() => fetchRecords(currentPage + 1)}
                        className="px-4 py-2 text-slate-300 text-sm font-medium rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                        下一页<i className="fa-solid fa-chevron-right ml-2"></i>
                    </button>
                </div>
            </div>
        );
    };

    const renderQuota = () => {
        return (
            <div className="flex flex-col gap-6 items-center pt-8">
                <div className="flex flex-col items-center gap-2 mb-6">
                    <span className="text-slate-500 font-medium uppercase tracking-widest text-xs">当前余额</span>
                    <div className="flex items-center gap-3">
                        <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full"
                            style={{
                                background: 'rgba(34,211,238,0.1)',
                                border: '1px solid rgba(34,211,238,0.25)',
                                boxShadow: '0 0 20px rgba(34,211,238,0.15)',
                            }}
                        >
                            <SanityIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <span className="text-4xl md:text-5xl font-light text-slate-100 tracking-wider">
                            {sanityToInspiration(balance).toFixed(2)}
                        </span>
                        <span className="text-3xl text-cyan-400 font-medium ml-1">Ins</span>
                    </div>
                </div>

                <div 
                    className="w-full max-w-md rounded-xl p-8 flex flex-col gap-6"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(148,163,184,0.1)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-wallet text-cyan-400/70"></i>
                        <h3 className="text-slate-200 font-medium tracking-wide">兑换额度</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-light">
                        使用兑换码进行充值，兑换成功后额度将直接进入账户余额。
                    </p>
                    <input 
                        type="text" 
                        placeholder="请输入兑换码..." 
                        className="bg-black/20 border border-slate-600/30 text-cyan-100 px-4 py-3.5 rounded-lg focus:outline-none focus:border-cyan-500/50 tracking-[0.2em] text-center uppercase transition-colors"
                        disabled
                    />
                    <div className="flex gap-4 mt-2">
                        <button disabled className="flex-1 bg-white/5 text-slate-500 font-medium py-3 rounded-lg opacity-60 cursor-not-allowed uppercase tracking-widest text-sm border border-white/5">
                            获取兑换码
                        </button>
                        <button disabled className="flex-1 bg-cyan-500/10 text-cyan-500 font-medium py-3 rounded-lg opacity-60 cursor-not-allowed uppercase tracking-widest text-sm border border-cyan-500/20">
                            兑换
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
        >
            <div className="absolute inset-0" onClick={onClose} />
            <div 
                className={`relative w-[95vw] md:w-[85vw] max-w-3xl rounded-2xl flex flex-col h-[85vh] md:h-[75vh] max-h-[800px] transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                style={{
                    background: 'rgba(15,23,42,0.93)',
                    border: '1px solid rgba(148,163,184,0.35)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* 顶部装饰线 */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                        width: '48px',
                        height: '2px',
                        marginTop: '-1px',
                        background: 'linear-gradient(to right, transparent, rgba(34,211,238,0.8), transparent)',
                    }}
                />

                {/* Header */}
                <div className="flex items-center justify-between p-5 md:p-6 shrink-0 relative z-10">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(34,211,238,0.1)',
                                border: '1px solid rgba(34,211,238,0.25)',
                            }}
                        >
                            <SanityIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-medium text-slate-200 tracking-widest">灵感记录</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-all hover:bg-white/5"
                    >
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>

                <div className="w-full h-[1px]" style={{ background: 'rgba(148,163,184,0.12)' }} />

                {/* Tabs */}
                <div className="flex px-4 shrink-0 overflow-x-auto no-scrollbar relative z-10">
                    {[ 
                        { id: 'overview', label: '总览', icon: 'fa-chart-bar' }, 
                        { id: 'records', label: '记录', icon: 'fa-list-ul' }, 
                        { id: 'quota', label: '额度', icon: 'fa-wallet' } 
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium tracking-widest text-sm relative transition-colors whitespace-nowrap ${
                                activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'opacity-100' : 'opacity-50'}`}></i>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_-2px_8px_rgba(34,211,238,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="w-full h-[1px]" style={{ background: 'rgba(148,163,184,0.12)' }} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar relative z-10">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'records' && renderRecords()}
                    {activeTab === 'quota' && renderQuota()}
                </div>

                {/* 底部装饰线 */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                        width: '48px',
                        height: '2px',
                        marginBottom: '-1px',
                        background: 'linear-gradient(to right, transparent, rgba(34,211,238,0.4), transparent)',
                    }}
                />
            </div>
        </div>
    );
};

export default InspirationDashboardModal;
