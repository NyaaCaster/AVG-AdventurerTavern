
import React, { useState, useMemo, useCallback } from 'react';
import { ITEMS } from '../data/items';
import { ItemData } from '../types';

interface ResourceDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  inventory: Record<string, number>;
  onUpdateGold: (newGold: number) => void;
  onUpdateInventory: (itemId: string, newCount: number) => void;
}

import { MAX_GOLD } from '../utils/gameConstants';

const ResourceDebugModal: React.FC<ResourceDebugModalProps> = ({
  isOpen, onClose, gold, inventory, onUpdateGold, onUpdateInventory
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filteredItems = useMemo(() => {
    const all = Object.values(ITEMS);
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [search]);

  const pagedItems = useMemo(() => {
    return filteredItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredItems, page]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(0);
  }, []);

  if (!isOpen) return null;

  const handleGoldChange = (deltaPercent: number) => {
    // Determine the step size based on 10% of the max limit
    const step = Math.ceil(MAX_GOLD * 0.1);
    let newVal = gold;
    
    if (deltaPercent > 0) {
        newVal = Math.min(MAX_GOLD, gold + step);
    } else {
        newVal = Math.max(0, gold - step);
    }
    
    onUpdateGold(newVal);
  };

  const handleItemChange = (item: ItemData, deltaPercent: number) => {
    const current = inventory[item.id] || 0;
    const step = Math.ceil(item.maxStack * 0.1);
    let newVal = current;

    if (deltaPercent > 0) {
        newVal = Math.min(item.maxStack, current + step);
    } else {
        newVal = Math.max(0, current - step);
    }
    
    onUpdateInventory(item.id, newVal);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-mono text-sm pointer-events-auto" onClick={onClose}>
        <div className="bg-[#0c0c0c] border border-slate-700/50 rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_25px_50px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 px-4 border-b border-slate-800 bg-[#1a1a1a] rounded-t-lg shrink-0">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <i className="fa-solid fa-screwdriver-wrench"></i>
                    资源调整 (Debug)
                </h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="overflow-y-auto p-4 custom-scrollbar space-y-4 bg-[#0c0c0c] rounded-b-lg">
                {/* Gold Row */}
                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded border border-yellow-500/20">
                    <div className="flex flex-col">
                        <span className="text-yellow-500 font-bold text-base"><i className="fa-solid fa-coins mr-2"></i>资金 (Gold)</span>
                        <span className="text-[10px] text-slate-500">Limit: {MAX_GOLD.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-slate-200 text-lg font-bold w-32 text-right">{gold.toLocaleString()}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleGoldChange(-0.1)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded text-slate-300 hover:text-red-200 transition-all font-bold text-lg"
                                title="-10%"
                            >-</button>
                            <button
                                onClick={() => handleGoldChange(0.1)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-emerald-900/50 border border-slate-600 hover:border-emerald-500 rounded text-slate-300 hover:text-emerald-200 transition-all font-bold text-lg"
                                title="+10%"
                            >+</button>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-800/50 my-2"></div>

                {/* 搜索框 */}
                <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded px-3 py-2">
                    <i className="fa-solid fa-magnifying-glass text-slate-500 text-xs"></i>
                    <input
                        type="text"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="搜索道具名/ID/分类..."
                        className="flex-1 bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600"
                        autoComplete="off"
                    />
                    {search && (
                        <button onClick={() => handleSearch('')} className="text-slate-500 hover:text-slate-300 text-xs">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>

                {/* 分页信息 + 翻页 */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                    <span>第 {page + 1} / {totalPages} 页（共 {filteredItems.length} 项）</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-30 hover:bg-slate-700 transition-colors"
                        >←</button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-30 hover:bg-slate-700 transition-colors"
                        >→</button>
                    </div>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 gap-2">
                    {pagedItems.map(item => {
                        const count = inventory[item.id] || 0;
                        return (
                            <div key={item.id} className="flex items-center justify-between bg-slate-800/30 p-2 px-3 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                                <div className="flex flex-col min-w-0 flex-1 mr-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-300 font-medium truncate">{item.name}</span>
                                        <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">{item.category}</span>
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-slate-500 mt-1">
                                        <span>ID: {item.id}</span>
                                        <span>Max: {item.maxStack}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`w-16 text-right font-bold ${count >= item.maxStack ? 'text-yellow-500' : 'text-slate-300'}`}>
                                        {count}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleItemChange(item, -0.1)}
                                            className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 rounded text-slate-300 hover:text-red-200 transition-all"
                                        >-</button>
                                        <button
                                            onClick={() => handleItemChange(item, 0.1)}
                                            className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-emerald-900/50 border border-slate-600 hover:border-emerald-500 rounded text-slate-300 hover:text-emerald-200 transition-all"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResourceDebugModal;
