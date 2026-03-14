import React from 'react';
import { ITEMS } from '../../../data/items';
import { ItemData } from '../../../types';
import { getItemSelectableTargets } from '../../../battle-system/player-commands';
import { BattleUnit, BattleState } from '../../../battle-system/types';

interface ItemWithAvailability {
  id: string;
  name: string;
  description: string;
  count: number;
  isAvailable: boolean;
  reason?: string;
  targetRequirement?: string;
}

interface ItemSelectProps {
  inventory: Record<string, number>;
  battleState: BattleState;
  currentUser: BattleUnit;
  onItemSelect: (itemId: string) => void;
  onClose: () => void;
}

const ItemSelect: React.FC<ItemSelectProps> = ({
  inventory,
  battleState,
  currentUser,
  onItemSelect,
  onClose
}) => {
  const getAvailableItems = (): ItemWithAvailability[] => {
    const items: ItemWithAvailability[] = [];
    
    for (const [itemId, count] of Object.entries(inventory)) {
      if (count <= 0) continue;
      
      const itemData = ITEMS[itemId];
      if (!itemData) continue;
      
      if (itemData.category !== 'itm') continue;
      
      if (!itemData.consumableEffects) continue;
      
      const targets = getItemSelectableTargets(itemData, battleState, currentUser);
      const isAvailable = targets.length > 0;
      
      let reason: string | undefined;
      let targetRequirement: string | undefined;
      
      if (!isAvailable) {
        const effects = itemData.consumableEffects;
        
        if (effects.revive) {
          reason = '没有死亡的队友';
          targetRequirement = '需要死亡的队友';
        } else if (effects.recoverHpPercent) {
          reason = '所有队友HP已满';
          targetRequirement = '需要HP不足的队友';
        } else if (effects.recoverMpPercent) {
          reason = '所有队友MP已满';
          targetRequirement = '需要MP不足的队友';
        } else if (effects.removeStatus && effects.removeStatus.length > 0) {
          reason = '没有需要解除的状态';
          targetRequirement = `需要处于${effects.removeStatus.join('、')}状态的队友`;
        } else {
          reason = '无法使用';
        }
      }
      
      items.push({
        id: itemId,
        name: itemData.name,
        description: itemData.description,
        count,
        isAvailable,
        reason,
        targetRequirement
      });
    }
    
    return items.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };
  
  const availableItems = getAvailableItems();
  
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-[#e8dfd1] rounded-xl border-2 border-[#9b7a4c] p-3 sm:p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d6cbb8]">
          <span className="text-sm sm:text-base font-bold text-[#382b26]">选择道具</span>
          <button
            onClick={onClose}
            className="text-[#9b7a4c] hover:text-[#382b26] text-lg transition-colors"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {availableItems.length === 0 ? (
            <div className="text-center text-[#5c4d45] py-8">
              <i className="fa-solid fa-box-open text-3xl mb-2 opacity-50" />
              <p className="text-sm">没有可使用的道具</p>
            </div>
          ) : (
            availableItems.map((item) => {
              const isDisabled = !item.isAvailable;
              
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && onItemSelect(item.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all ${
                    isDisabled
                      ? 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed opacity-60'
                      : 'bg-[#fcfaf7] text-[#382b26] hover:bg-[#f5f0e6] border border-[#d6cbb8] hover:border-[#9b7a4c]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base truncate">{item.name}</div>
                    <div className="text-[10px] sm:text-xs text-[#5c4d45] mt-0.5 line-clamp-2">{item.description}</div>
                    {isDisabled && item.targetRequirement && (
                      <div className="text-[10px] sm:text-xs text-red-500 mt-0.5">
                        <i className="fa-solid fa-info-circle mr-1" />
                        {item.targetRequirement}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0 text-sm font-bold text-[#9b7a4c]">
                    x{item.count}
                  </div>
                </button>
              );
            })
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t border-[#d6cbb8] text-center text-xs text-[#5c4d45]">
          可用道具: <span className="font-bold text-[#9b7a4c]">{availableItems.filter(i => i.isAvailable).length}</span> 种
        </div>
      </div>
    </div>
  );
};

export default ItemSelect;
