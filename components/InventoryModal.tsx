
import React, { useState, useMemo } from 'react';
import { ITEMS, ITEM_CATEGORIES, ITEM_TAGS } from '../data/items';
import { ItemCategory, ItemQuality, ItemData } from '../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Record<string, number>;
  userName: string;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, inventory, userName }) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('res');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Filter items based on category and ownership (count > 0)
  const categoryItems = useMemo(() => {
    return Object.values(ITEMS).filter(item => 
        item.category === activeCategory && 
        (inventory[item.id] || 0) > 0
    );
  }, [activeCategory, inventory]);

  const selectedItem = useMemo(() => selectedItemId ? ITEMS[selectedItemId] : null, [selectedItemId]);

  if (!isOpen) return null;

  // Helper to get quality color style
  const getQualityStyle = (quality: ItemQuality) => {
      switch(quality) {
          case 'S': return 'text-amber-400 font-bold drop-shadow-[0_0_2px_rgba(251,191,36,0.8)]'; // Gold/Legendary
          case 'A': return 'text-red-400 font-bold'; // Red/Epic
          case 'B': return 'text-blue-400 font-bold'; // Blue/Rare
          case 'C': return 'text-emerald-400 font-bold'; // Green/Uncommon
          case 'D': return 'text-slate-300'; // White/Common
          case 'E': return 'text-slate-500'; // Grey/Junk
          default: return 'text-slate-400';
      }
  };

  const getTagIcon = (tagId?: string) => {
      if (!tagId) return null;
      const tag = ITEM_TAGS.find(t => t.id === tagId);
      return tag ? tag.icon : null;
  };

  const formatText = (text: string) => {
      if (!text) return null;
      const replaced = text.replace(/{{user}}/g, userName);
      
      const parts = replaced.split(/`([^`]+)`/);
      
      return (
        <>
            {parts.map((part, index) => {
                if (index % 2 === 1) {
                    return (
                        <span key={index} className="font-bold text-[#b45309] mx-0.5">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
        {/* Main Frame - Dark Leather/Wood Style */}
        <div className="w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-[#2c241b] border-2 border-[#9b7a4c] rounded-lg shadow-2xl overflow-hidden relative">
            
            {/* Close Button - Now positioned absolutely but with padding considerations in children */}
            <button 
                onClick={onClose}
                className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 z-[60] flex items-center justify-center bg-[#382b26] border border-[#9b7a4c] rounded text-[#9b7a4c] hover:bg-[#4a3b32] hover:text-[#f0e6d2] transition-colors shadow-lg hover:shadow-amber-900/50"
                title="关闭"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Sidebar (Categories) */}
            <div className="w-full md:w-64 flex-shrink-0 bg-[#382b26] border-b md:border-b-0 md:border-r border-[#9b7a4c]/50 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar md:pr-0 pr-14">
                
                {/* Header Title (Sidebar top) */}
                <div className="hidden md:flex items-center justify-center p-6 border-b border-[#9b7a4c]/30">
                    <h2 className="text-[#f0e6d2] font-bold text-xl tracking-widest uppercase flex items-center gap-2 drop-shadow-sm">
                        <i className="fa-solid fa-boxes-stacked text-[#9b7a4c]"></i>
                        库存盘查
                    </h2>
                </div>

                {/* Mobile Header Title */}
                <div className="md:hidden absolute top-0 left-0 p-3 z-10 pointer-events-none">
                     <span className="text-[#f0e6d2] font-bold text-lg drop-shadow-md text-shadow-sm">库存盘查</span>
                </div>

                {/* Tabs - Added top margin on mobile to clear title */}
                <div className="flex-1 flex flex-row md:flex-col p-2 md:p-4 gap-2 md:mt-0 mt-10">
                    {ITEM_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex-shrink-0 md:w-full px-4 py-3 text-left rounded transition-all duration-200 border
                                flex items-center gap-3 font-bold tracking-wide text-sm md:text-base
                                ${activeCategory === cat.id 
                                    ? 'bg-[#9b7a4c] text-[#1a1512] border-[#f0e6d2]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transform scale-[1.02]' 
                                    : 'bg-[#2a2320] text-[#9b7a4c] border-transparent hover:bg-[#4a3b32] hover:text-[#c4a473]'}
                            `}
                        >
                            <span className="w-6 text-center">
                                {cat.id === 'res' && <i className="fa-solid fa-cube"></i>}
                                {cat.id === 'itm' && <i className="fa-solid fa-flask"></i>}
                                {cat.id === 'spc' && <i className="fa-solid fa-star"></i>}
                                {cat.id === 'wpn' && <i className="fa-solid fa-khanda"></i>}
                                {cat.id === 'arm' && <i className="fa-solid fa-shield-halved"></i>}
                                {cat.id === 'acs' && <i className="fa-solid fa-ring"></i>}
                            </span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area (Items) */}
            <div className="flex-1 bg-[#e8dfd1] relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
                </div>

                {/* Items Grid - Added top padding on desktop to clear close button */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-16 relative z-10 custom-scrollbar">
                    {categoryItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#5c4d45] opacity-60 gap-4">
                            <i className="fa-solid fa-box-open text-6xl"></i>
                            <span className="text-xl font-bold tracking-widest">该分类下暂无道具</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedItemId(item.id)}
                                    className="bg-[#f5f0e6] border border-[#d6cbb8] p-3 rounded shadow-sm hover:shadow-lg hover:border-[#9b7a4c] transition-all flex gap-3 group cursor-pointer"
                                >
                                    {/* Icon Box */}
                                    <div className="w-16 h-16 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center text-3xl shadow-inner flex-shrink-0 group-hover:bg-[#d6cbb8] transition-colors">
                                        {getTagIcon(item.tag) || (
                                            item.category === 'wpn' ? '⚔️' :
                                            item.category === 'arm' ? '🛡️' :
                                            item.category === 'itm' ? '🧪' :
                                            item.category === 'acs' ? '💍' : '📦'
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-[#2c241b] truncate pr-2 text-sm md:text-base group-hover:text-[#9b7a4c] transition-colors">{item.name}</h4>
                                            <span className={`text-xs ${getQualityStyle(item.quality)} bg-[#2c241b]/80 px-1.5 py-0.5 rounded ml-1 font-mono border border-black/20`}>
                                                {item.quality}
                                            </span>
                                        </div>
                                        
                                        <div className="text-[10px] md:text-xs text-[#6e5d52] line-clamp-2 leading-tight min-h-[2.5em]">
                                            {formatText(item.description)}
                                        </div>

                                        <div className="flex justify-between items-end mt-1">
                                            {/* Attributes/Tags Display - Mini */}
                                            <div className="flex gap-1 overflow-hidden h-4">
                                                {item.stats && Object.entries(item.stats).slice(0, 2).map(([stat, val]) => (
                                                    <span key={stat} className="text-[9px] px-1 bg-[#d6cbb8] text-[#4a3b32] rounded font-bold whitespace-nowrap">
                                                        {stat}{val > 0 ? `+${val}` : val}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            {/* Quantity */}
                                            <span className="font-bold text-[#1a1512] font-mono text-sm bg-[#d6cbb8]/50 px-2 py-0.5 rounded border border-[#c7bca8] group-hover:bg-[#9b7a4c] group-hover:text-white group-hover:border-transparent transition-colors">
                                                x{inventory[item.id]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Status Bar */}
                <div className="bg-[#382b26] text-[#9b7a4c] text-xs px-4 py-2 flex justify-between items-center border-t border-[#9b7a4c]/50 relative z-20 shadow-[0_-4px_6px_rgba(0,0,0,0.1)]">
                    <span>CATEGORY: {ITEM_CATEGORIES.find(c => c.id === activeCategory)?.name}</span>
                    <span>TOTAL ITEMS: {categoryItems.reduce((acc, item) => acc + (inventory[item.id] || 0), 0)}</span>
                </div>
            </div>
        </div>

        {/* Item Detail Modal */}
        {selectedItem && (
            <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn" onClick={() => setSelectedItemId(null)}>
                <div 
                    className="bg-[#2c241b] border-2 border-[#9b7a4c] rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden" 
                    onClick={e => e.stopPropagation()}
                >
                    {/* Detail Close Button */}
                    <button 
                        onClick={() => setSelectedItemId(null)}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#382b26] rounded-full text-[#9b7a4c] hover:bg-white/10 hover:text-white transition-colors z-10"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>

                    {/* Detail Header / Icon */}
                    <div className="bg-gradient-to-b from-[#3d3226] to-[#2c241b] p-6 flex flex-col items-center justify-center border-b border-[#9b7a4c]/30 relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('img/svg/unicorn.svg')] bg-center bg-no-repeat bg-contain"></div>
                        <div className="w-24 h-24 bg-[#e0d6c5] border-4 border-[#c7bca8] rounded-2xl flex items-center justify-center text-5xl shadow-xl z-10">
                            {getTagIcon(selectedItem.tag) || (
                                selectedItem.category === 'wpn' ? '⚔️' :
                                selectedItem.category === 'arm' ? '🛡️' :
                                selectedItem.category === 'itm' ? '🧪' :
                                selectedItem.category === 'acs' ? '💍' : '📦'
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-[#f0e6d2] mt-4 tracking-wider text-shadow-sm text-center">{selectedItem.name}</h2>
                        
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold bg-black/40 border border-white/10 ${getQualityStyle(selectedItem.quality)}`}>
                                RANK: {selectedItem.quality}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#9b7a4c]/20 text-[#9b7a4c] border border-[#9b7a4c]/30 uppercase tracking-widest">
                                {ITEM_CATEGORIES.find(c => c.id === selectedItem.category)?.name}
                            </span>
                            {selectedItem.tag && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600/30 uppercase tracking-widest">
                                    {ITEM_TAGS.find(t => t.id === selectedItem.tag)?.name || selectedItem.tag}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Detail Content */}
                    <div className="p-6 bg-[#e8dfd1] text-[#2c241b]">
                        
                        {/* Stats Section */}
                        {selectedItem.stats && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(selectedItem.stats).map(([stat, val]) => (
                                    <div key={stat} className="bg-[#d6cbb8] border border-[#c7bca8] px-3 py-1.5 rounded flex items-center gap-2 shadow-sm">
                                        <span className="text-[10px] font-bold text-[#6e5d52] uppercase">{stat}</span>
                                        <span className={`font-mono font-bold ${val > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {val > 0 ? `+${val}` : val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-[#f5f0e6] border border-[#d6cbb8] p-4 rounded-lg shadow-inner mb-4">
                            <div className="text-sm md:text-base leading-relaxed font-medium text-[#4a3b32] whitespace-pre-wrap">
                                {formatText(selectedItem.description)}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between items-center text-xs text-[#8c7b70] font-mono border-t border-[#d6cbb8] pt-3">
                            <span>ID: {selectedItem.id}</span>
                            <span>持有数量: <strong className="text-[#2c241b] text-base">{inventory[selectedItem.id]}</strong> / {selectedItem.maxStack}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default InventoryModal;
