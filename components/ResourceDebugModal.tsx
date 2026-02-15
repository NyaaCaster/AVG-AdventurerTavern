
import React from 'react';
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

const MAX_GOLD = 999999;

const ResourceDebugModal: React.FC<ResourceDebugModalProps> = ({
  isOpen, onClose, gold, inventory, onUpdateGold, onUpdateInventory
}) => {
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-slate-900 border border-yellow-500/50 rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-950/50 rounded-t-lg shrink-0">
                <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
                    <i className="fa-solid fa-screwdriver-wrench"></i>
                    资源调整 (Debug)
                </h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="overflow-y-auto p-4 custom-scrollbar space-y-3">
                {/* Gold Row */}
                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded border border-yellow-500/20">
                    <div className="flex flex-col">
                        <span className="text-yellow-400 font-bold text-base"><i className="fa-solid fa-coins mr-2"></i>资金 (Gold)</span>
                        <span className="text-xs text-slate-500 font-mono">Limit: {MAX_GOLD.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="font-mono text-white text-lg font-bold w-32 text-right">{gold.toLocaleString()}</span>
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

                <div className="h-px bg-slate-700 my-2"></div>

                {/* Items List */}
                <div className="grid grid-cols-1 gap-2">
                    {Object.values(ITEMS).map(item => {
                        const count = inventory[item.id] || 0;
                        return (
                            <div key={item.id} className="flex items-center justify-between bg-slate-800/30 p-2 px-3 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                                <div className="flex flex-col min-w-0 flex-1 mr-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-200 font-medium truncate">{item.name}</span>
                                        <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 rounded">{item.category}</span>
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-slate-500 font-mono mt-0.5">
                                        <span>ID: {item.id}</span>
                                        <span>Max: {item.maxStack}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono w-16 text-right font-bold ${count >= item.maxStack ? 'text-yellow-500' : 'text-slate-300'}`}>
                                        {count}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleItemChange(item, -0.1)}
                                            className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-slate-300 transition-colors"
                                        >-</button>
                                        <button
                                            onClick={() => handleItemChange(item, 0.1)}
                                            className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-slate-300 transition-colors"
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
