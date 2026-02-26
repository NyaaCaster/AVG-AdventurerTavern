mport React, { useState } from 'react';
import { UserRecipe, TavernMenuState } from '../types';
import { calculateTavernBonus } from '../data/facilityData';
import { ITEMS, ITEM_TAGS } from '../data/items';
import { resolveImgPath } from '../utils/imagePath';
import { getResValue } from '../data/item-value-table';

interface TavernMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Record<string, number>;
  userRecipes: UserRecipe[];
  foodStock: Record<string, number>;
  tavernLevel: number;
  tavernMenu: TavernMenuState;
  onUpdateMenu: (type: 'foods' | 'drinks', index: number, itemId: string | null) => void;
}

const MenuSlot: React.FC<{
    label: string;
    itemId: string | null;
    type: 'foods' | 'drinks';
    inventory: Record<string, number>;
    userRecipes: UserRecipe[];
    foodStock: Record<string, number>;
    onClick: () => void;
    onClear: (e: React.MouseEvent) => void;
}> = ({ label, itemId, type, inventory, userRecipes, foodStock, onClick, onClear }) => {
    let itemData: { name: string; icon: string; count: number; price: number; imagePath?: string } | null = null;

    if (itemId) {
        if (type === 'foods') {
            const recipe = userRecipes.find(r => r.id === itemId);
            if (recipe) {
                itemData = {
                    name: recipe.name,
                    icon: '馃崨', // Fallback icon
                    count: foodStock[itemId] || 0,
                    price: recipe.price,
                    imagePath: recipe.imagePath
                };
            }
        } else {
            const item = ITEMS[itemId];
            if (item) {
                itemData = {
                    name: item.name,
                    icon: ITEM_TAGS.find(t => t.id === item.tag)?.icon || '馃嵑',
                    count: inventory[itemId] || 0,
                    price: getResValue(item.star) * 2, // Standard markup for drinks? Or just base value? Let's use base value * 1.5 as default markup for now, or just base value. Using getResValue directly for now.
                    // Actually let's use a simple multiplier for drinks since they are res items
                    // res-0701 (Beer) is star 1 (10G). Selling for 10G is cheap. Maybe 20G? 
                    // Let's assume standard tavern markup is 2x base value.
                };
                // Adjust price logic if needed. For now using base value.
                itemData.price = getResValue(item.star); 
            }
        }
    }

    return (
        <div 
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all h-32 bg-[#f5f0e6]
                border-[#d6cbb8] hover:border-[#9b7a4c] group
            `}
        >
            <span className="absolute top-1 left-2 text-[10px] font-bold uppercase tracking-widest text-[#8c7b70]">
                {label}
            </span>
            
            {itemData ? (
                <>
                    {itemData.imagePath ? (
                         <div className="w-12 h-12 rounded overflow-hidden border border-[#c7bca8] mb-1">
                            <img src={resolveImgPath(itemData.imagePath)} className="w-full h-full object-cover" />
                         </div>
                    ) : (
                        <div className="text-3xl mb-1 mt-2 drop-shadow-sm">
                            {itemData.icon}
                        </div>
                    )}
                    
                    <div className="text-xs font-bold text-[#382b26] text-center leading-tight line-clamp-2 px-1 w-full">
                        {itemData.name}
                    </div>
                    
                    <div className="flex justify-between w-full px-2 mt-1 text-[10px] font-mono">
                        <span className="text-[#b45309] font-bold">{itemData.price}G</span>
                        <span className="text-[#5c4d45]">x{itemData.count}</span>
                    </div>

                    <button 
                        onClick={onClear}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                    >
                        <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                </>
            ) : (
                <div className="text-[#d6cbb8] text-2xl flex flex-col items-center gap-1">
                    <i className="fa-solid fa-plus"></i>
                    <span className="text-[10px] font-bold">绌洪棽鏍忎綅</span>
                </div>
            )}
        </div>
    );
};

const TavernMenuModal: React.FC<TavernMenuModalProps> = ({
  isOpen, onClose, inventory, userRecipes, foodStock, tavernLevel, tavernMenu, onUpdateMenu
}) => {
  // State for selection modal
  const [selectingSlot, setSelectingSlot] = useState<{ type: 'foods' | 'drinks', index: number } | null>(null);

  if (!isOpen) return null;

  const { slots: maxSlots } = calculateTavernBonus(tavernLevel);

  // Helper to get available items for selection
  const getAvailableItems = (type: 'foods' | 'drinks') => {
      // Get items already used in other slots of the same type
      const usedIds = (type === 'foods' ? tavernMenu.foods : tavernMenu.drinks).filter((id, idx) => {
          // Exclude current slot from the "used" list so we can re-select the same item if we want (though UI might not need it)
          // But mainly we want to block items used in OTHER slots
          return id !== null && (selectingSlot && idx !== selectingSlot.index);
      });

      if (type === 'foods') {
          return userRecipes.filter(r => 
              (foodStock[r.id] || 0) > 0 && !usedIds.includes(r.id)
          );
      } else {
          return Object.keys(inventory).filter(id => {
              const item = ITEMS[id];
              return item && item.tag === 'drinks' && inventory[id] > 0 && !usedIds.includes(id);
          }).map(id => ITEMS[id]);
      }
  };

  const handleSelectItem = (itemId: string) => {
      if (selectingSlot) {
          onUpdateMenu(selectingSlot.type, selectingSlot.index, itemId);
          setSelectingSlot(null);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-sans">
       <div 
            className="w-full max-w-5xl h-[85vh] bg-[#2c241b] border-[3px] border-[#9b7a4c] rounded-xl shadow-2xl flex flex-col overflow-hidden relative select-none"
            onClick={e => e.stopPropagation()}
            style={{ backgroundImage: 'linear-gradient(to bottom, #2c241b, #1a1512)' }}
        >
            {/* Header */}
            <div className="bg-[#382b26] border-b border-[#9b7a4c]/50 py-3 px-4 flex justify-between items-center shadow-md shrink-0 relative z-10">
                <h2 className="text-[#f0e6d2] font-bold text-xl tracking-[0.2em] flex items-center gap-3">
                    <i className="fa-solid fa-utensils text-[#9b7a4c]"></i>
                    椁愰ギ绠＄悊
                </h2>
                <div className="text-[#8c7b70] text-sm font-bold">
                    閰掑満绛夌骇: <span className="text-[#b45309]">Lv.{tavernLevel}</span>
                    <span className="mx-2">|</span>
                    鍙敤鏍忎綅: <span className="text-[#f0e6d2]">{maxSlots}</span>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9b7a4c] hover:text-[#f0e6d2] transition-colors">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#e8dfd1] relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Food Section */}
                    <div className="bg-[#fcfaf7] p-4 rounded-lg border border-[#d6cbb8] shadow-sm">
                        <h3 className="text-[#382b26] font-bold text-lg mb-4 flex items-center gap-2 border-b border-[#d6cbb8] pb-2">
                            <i className="fa-solid fa-bowl-food text-[#b45309]"></i>
                            椁愮偣鑿滃崟
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {Array.from({ length: maxSlots }).map((_, i) => (
                                <MenuSlot 
                                    key={`food-${i}`}
                                    label={`Food #${i + 1}`}
                                    itemId={tavernMenu.foods[i] || null}
                                    type="foods"
                                    inventory={inventory}
                                    userRecipes={userRecipes}
                                    foodStock={foodStock}
                                    onClick={() => setSelectingSlot({ type: 'foods', index: i })}
                                    onClear={(e) => { e.stopPropagation(); onUpdateMenu('foods', i, null); }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Drink Section */}
                    <div className="bg-[#fcfaf7] p-4 rounded-lg border border-[#d6cbb8] shadow-sm">
                        <h3 className="text-[#382b26] font-bold text-lg mb-4 flex items-center gap-2 border-b border-[#d6cbb8] pb-2">
                            <i className="fa-solid fa-wine-glass text-[#b45309]"></i>
                            閰掓按鑿滃崟
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {Array.from({ length: maxSlots }).map((_, i) => (
                                <MenuSlot 
                                    key={`drink-${i}`}
                                    label={`Drink #${i + 1}`}
                                    itemId={tavernMenu.drinks[i] || null}
                                    type="drinks"
                                    inventory={inventory}
                                    userRecipes={userRecipes}
                                    foodStock={foodStock}
                                    onClick={() => setSelectingSlot({ type: 'drinks', index: i })}
                                    onClear={(e) => { e.stopPropagation(); onUpdateMenu('drinks', i, null); }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Selection Overlay */}
            {selectingSlot && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col animate-fadeIn">
                    <div className="flex-1 mt-10 md:mt-20 mx-4 md:mx-auto max-w-4xl w-full bg-[#fbf9f4] rounded-t-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-x-2 border-t-2 border-[#9b7a4c]">
                        <div className="flex justify-between items-center p-4 border-b border-[#d6cbb8] bg-[#f5f0e6]">
                            <h3 className="font-bold text-[#382b26] flex items-center gap-2">
                                <i className="fa-solid fa-basket-shopping"></i> 
                                閫夋嫨涓婃灦{selectingSlot.type === 'foods' ? '椁愮偣' : '閰掓按'}
                            </h3>
                            <button 
                                onClick={() => setSelectingSlot(null)}
                                className="w-8 h-8 rounded-full bg-[#d6cbb8] text-white hover:bg-[#9b7a4c] transition-colors flex items-center justify-center"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 bg-[#e8dfd1]">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {selectingSlot.type === 'foods' ? (
                                    // Food List
                                    getAvailableItems('foods').map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectItem(item.id)}
                                            className="relative p-2 rounded border-2 flex flex-col items-center gap-1 transition-all bg-[#fcfaf7] border-[#d6cbb8] hover:border-[#9b7a4c] group"
                                        >
                                            <div className="w-16 h-16 rounded overflow-hidden border border-[#c7bca8] mb-1">
                                                <img src={resolveImgPath(item.imagePath)} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-xs font-bold text-[#382b26] line-clamp-1">{item.name}</div>
                                            <div className="flex items-center gap-1 w-full justify-between px-1">
                                                <span className="text-[10px] text-[#b45309] font-bold">{item.price}G</span>
                                                <span className="text-[10px] text-[#8c7b70]">x{foodStock[item.id]}</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    // Drink List
                                    getAvailableItems('drinks').map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectItem(item.id)}
                                            className="relative p-2 rounded border-2 flex flex-col items-center gap-1 transition-all bg-[#fcfaf7] border-[#d6cbb8] hover:border-[#9b7a4c] group"
                                        >
                                            <div className="text-3xl mb-1 mt-1">{ITEM_TAGS.find(t => t.id === item.tag)?.icon || '馃嵑'}</div>
                                            <div className="text-xs font-bold text-[#382b26] line-clamp-1">{item.name}</div>
                                            <div className="flex items-center gap-1 w-full justify-between px-1">
                                                <span className="text-[10px] text-[#b45309] font-bold">{getResValue(item.star)}G</span>
                                                <span className="text-[10px] text-[#8c7b70]">x{inventory[item.id]}</span>
                                            </div>
                                        </button>
                                    ))
                                )}

                                {(selectingSlot.type === 'foods' ? getAvailableItems('foods') : getAvailableItems('drinks')).length === 0 && (
                                    <div className="col-span-full text-center py-8 text-[#8c7b70] font-bold">
                                        娌℃湁鍙笂鏋剁殑{selectingSlot.type === 'foods' ? '椁愮偣' : '閰掓按'}搴撳瓨銆?                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};

export default TavernMenuModal;
