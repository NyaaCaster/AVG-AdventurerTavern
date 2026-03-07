import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { BattlePartySlots, CharacterEquipment, CharacterStat, ItemData, ItemTag } from '../types';
import { BaseStats, STAT_NAMES_CN } from '../data/battle-data/base_stats_table';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { resolveImgPath } from '../utils/imagePath';
import { ITEMS_EQUIP } from '../data/item-equip';
import { ITEM_TAGS, ITEM_CATEGORIES } from '../data/item-type';
import { buildCharacterBattleStats, CharacterBattleStatsResult } from '../services/characterBattleStats';
import { resolveCharacterDisplayName } from '../utils/playerText';

interface PartyEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleParty: BattlePartySlots;
  characterStats: Record<string, CharacterStat>;
  characterEquipments: Record<string, CharacterEquipment>;
  inventory: Record<string, number>;
  userName: string;
  onUpdateEquipment: (characterId: string, equipment: CharacterEquipment, inventoryChanges: Record<string, number>) => void;
  onAutoSave: () => void;
}

type EquipmentSlotKey = 'weaponId' | 'armorId' | 'accessory1Id' | 'accessory2Id';

const SLOT_CONFIG: { key: EquipmentSlotKey; label: string; category: 'wpn' | 'arm' | 'acs' }[] = [
  { key: 'weaponId', label: '武器', category: 'wpn' },
  { key: 'armorId', label: '防具', category: 'arm' },
  { key: 'accessory1Id', label: '饰品', category: 'acs' },
  { key: 'accessory2Id', label: '饰品', category: 'acs' }
];

const QUALITY_COLORS: Record<string, string> = {
  S: 'text-amber-400',
  A: 'text-red-400',
  B: 'text-blue-400',
  C: 'text-emerald-400',
  D: 'text-slate-300',
  E: 'text-slate-500'
};

const QUALITY_BG_COLORS: Record<string, string> = {
  S: 'bg-amber-100 border-amber-300 text-amber-800',
  A: 'bg-red-100 border-red-300 text-red-800',
  B: 'bg-blue-100 border-blue-300 text-blue-800',
  C: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  D: 'bg-slate-100 border-slate-300 text-slate-700',
  E: 'bg-slate-50 border-slate-200 text-slate-600'
};

const getQualityColor = (quality?: string): string => QUALITY_COLORS[quality || 'E'] || QUALITY_COLORS.E;
const getQualityBgColor = (quality?: string): string => QUALITY_BG_COLORS[quality || 'E'] || QUALITY_BG_COLORS.E;

const getAvailableEquipment = (
  inventory: Record<string, number>,
  category: 'wpn' | 'arm' | 'acs',
  equipableTags?: ItemTag[]
): ItemData[] => {
  const result: ItemData[] = [];

  Object.entries(inventory).forEach(([itemId, count]) => {
    if (count <= 0) return;
    const item = ITEMS_EQUIP[itemId];
    if (!item || item.category !== category) return;

    if (category === 'wpn' || category === 'arm') {
      if (!item.tag) return;
      if (!equipableTags || !equipableTags.includes(item.tag)) return;
    }

    result.push(item);
  });

  return result.sort((a, b) => a.id.localeCompare(b.id));
};

const getAllEquipmentsInInventory = (inventory: Record<string, number>): ItemData[] => {
  const result: ItemData[] = [];

  Object.entries(inventory).forEach(([itemId, count]) => {
    if (count <= 0) return;
    const item = ITEMS_EQUIP[itemId];
    if (!item) return;
    result.push(item);
  });

  return result.sort((a, b) => a.id.localeCompare(b.id));
};

const StatDisplay: React.FC<{
  label: string;
  value: number;
  diff?: number;
}> = ({ label, value, diff }) => (
  <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#f5f0e6]/50 transition-colors">
    <span className="text-xs text-[#5c4d45] font-medium">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold text-[#382b26] font-mono">{value}</span>
      {diff !== undefined && diff !== 0 && (
        <span className={`text-xs font-bold flex items-center gap-0.5 ${diff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {diff > 0 ? (
            <>
              <i className="fa-solid fa-arrow-up text-[8px]"></i>
              <span>+{diff}</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-arrow-down text-[8px]"></i>
              <span>{diff}</span>
            </>
          )}
        </span>
      )}
    </div>
  </div>
);

const EquipmentSlot: React.FC<{
  label: string;
  item: ItemData | null;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, item, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full p-2 rounded-lg border transition-all text-left ${
      disabled
        ? 'border-[#d6cbb8]/50 bg-[#e8dfd1]/30 cursor-not-allowed opacity-60'
        : 'border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c] hover:bg-[#f5f0e6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
    }`}
  >
    <div className="text-[10px] text-[#8c7b70] font-bold tracking-wide mb-1">{label}</div>
    {item ? (
      <div className="flex items-center gap-1.5">
        {item.tag && (
          <span className="text-sm">
            {ITEM_TAGS.find(t => t.id === item.tag)?.icon || ''}
          </span>
        )}
        <span className={`text-xs font-bold ${getQualityColor(item.quality)}`}>
          {item.name}
        </span>
        {item.quality && (
          <span className={`text-[9px] px-1 py-0.5 rounded border ${getQualityBgColor(item.quality)}`}>
            {item.quality}
          </span>
        )}
      </div>
    ) : (
      <div className="text-xs text-[#8c7b70] italic">未装备</div>
    )}
  </button>
);

const ItemDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: ItemData | null;
  count: number;
}> = ({ isOpen, onClose, item, count }) => {
  if (!isOpen || !item) return null;

  const getTagIcon = (tag?: ItemTag) => {
    const tagInfo = ITEM_TAGS.find(t => t.id === tag);
    return tagInfo?.icon || '📦';
  };

  const renderRankBadge = (itemData: ItemData, large?: boolean) => {
    if (itemData.star) {
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold bg-black/40 text-yellow-400 border border-yellow-400/30 ${large ? 'text-sm' : ''}`}>
          {'★'.repeat(parseInt(itemData.star) || 1)}
        </span>
      );
    }
    if (itemData.quality) {
      const qualityStyles: Record<string, string> = {
        S: 'bg-amber-500 text-white border-amber-400',
        A: 'bg-red-500 text-white border-red-400',
        B: 'bg-blue-500 text-white border-blue-400',
        C: 'bg-emerald-500 text-white border-emerald-400',
        D: 'bg-slate-400 text-white border-slate-300',
        E: 'bg-slate-300 text-slate-700 border-slate-200'
      };
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${qualityStyles[itemData.quality] || qualityStyles.E} ${large ? 'text-sm' : ''}`}>
          {itemData.quality}级
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-[#2c241b] border-2 border-[#9b7a4c] rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#382b26] rounded-full text-[#9b7a4c] hover:bg-white/10 hover:text-white transition-colors z-10"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="bg-gradient-to-b from-[#3d3226] to-[#2c241b] p-6 flex flex-col items-center justify-center border-b border-[#9b7a4c]/30 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('img/svg/unicorn.svg')] bg-center bg-no-repeat bg-contain"></div>
          <div className="w-24 h-24 bg-[#e0d6c5] border-4 border-[#c7bca8] rounded-2xl flex items-center justify-center text-5xl shadow-xl z-10 overflow-hidden">
            {getTagIcon(item.tag)}
          </div>
          <h2 className="text-2xl font-bold text-[#f0e6d2] mt-4 tracking-wider text-shadow-sm text-center">{item.name}</h2>
          
          <div className="flex items-center gap-3 mt-2">
            {renderRankBadge(item, true)}
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#9b7a4c]/20 text-[#9b7a4c] border border-[#9b7a4c]/30 uppercase tracking-widest">
              {ITEM_CATEGORIES.find(c => c.id === item.category)?.name}
            </span>
            {item.tag && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600/30 uppercase tracking-widest">
                {ITEM_TAGS.find(t => t.id === item.tag)?.name || item.tag}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 bg-[#e8dfd1] text-[#2c241b]">
          {item.stats && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(item.stats).map(([stat, val]) => (
                <div key={stat} className="bg-[#d6cbb8] border border-[#c7bca8] px-3 py-1.5 rounded flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-bold text-[#6e5d52] uppercase">{STAT_NAMES_CN[stat as keyof BaseStats] || stat}</span>
                  <span className={`font-mono font-bold ${(val as number) > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {(val as number) > 0 ? `+${val}` : val}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#f5f0e6] border border-[#d6cbb8] p-4 rounded-lg shadow-inner mb-4">
            <div className="text-sm md:text-base leading-relaxed font-medium text-[#4a3b32] whitespace-pre-wrap">
              {item.description}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-[#8c7b70] font-mono border-t border-[#d6cbb8] pt-3">
            <span>ID: {item.id}</span>
            <span>持有数量: <strong className="text-[#2c241b] text-base">{count}</strong> / {item.maxStack}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EquipmentSelectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: ItemData[];
  currentItemId: string | null;
  onSelect: (itemId: string | null) => void;
  slotLabel: string;
}> = ({ isOpen, onClose, items, currentItemId, onSelect, slotLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-[#fffef8] border-2 border-[#9b7a4c] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="bg-[#382b26] text-[#f0e6d2] px-4 py-3 flex items-center justify-between border-b border-[#9b7a4c]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-box-open text-[#9b7a4c]"></i>
            <span className="font-bold tracking-wide">选择{slotLabel}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-transparent text-[#9b7a4c] hover:bg-white/10 hover:text-[#f0e6d2] transition-colors flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
          {currentItemId && (
            <button
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="w-full p-3 mb-2 rounded-lg border-2 border-dashed border-[#c7bca8] bg-[#e8dfd1]/50 hover:border-[#9b7a4c] hover:bg-[#f5f0e6] transition-all text-left"
            >
              <div className="flex items-center gap-2 text-[#8c7b70]">
                <i className="fa-solid fa-box-open"></i>
                <span className="text-sm font-bold">卸下当前装备</span>
              </div>
            </button>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8 text-[#8c7b70]">
              <i className="fa-solid fa-box-open text-3xl mb-2 opacity-50"></i>
              <div className="text-sm">没有可用的装备</div>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    item.id === currentItemId
                      ? 'border-[#b45309] bg-[#f5f0e6] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'border-[#d6cbb8] bg-[#fffef8] hover:border-[#9b7a4c] hover:bg-[#f5f0e6]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {item.tag && (
                        <span className="text-base">
                          {ITEM_TAGS.find(t => t.id === item.tag)?.icon || ''}
                        </span>
                      )}
                      <span className={`text-sm font-bold ${getQualityColor(item.quality)}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.quality && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getQualityBgColor(item.quality)}`}>
                        {item.quality}
                      </span>
                    )}
                  </div>
                  {item.stats && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {Object.entries(item.stats).map(([stat, value]) => (
                        value !== 0 && (
                          <span
                            key={stat}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              (value as number) > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {STAT_NAMES_CN[stat as keyof BaseStats]} {(value as number) > 0 ? '+' : ''}{value}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-[#8c7b70] mt-1.5 line-clamp-2">{item.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CharacterDetailPanel: React.FC<{
  characterId: string;
  characterStats: CharacterStat;
  characterEquipment: CharacterEquipment;
  inventory: Record<string, number>;
  userName: string;
  onUpdateEquipment: (equipment: CharacterEquipment, inventoryChanges: Record<string, number>) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}> = ({
  characterId,
  characterStats,
  characterEquipment,
  inventory,
  userName,
  onUpdateEquipment,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}) => {
  const [selectingSlot, setSelectingSlot] = useState<EquipmentSlotKey | null>(null);
  const [pendingEquipment, setPendingEquipment] = useState<CharacterEquipment | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (touchStartX.current === null || touchEndX.current === null) return;
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (diff > threshold && hasNext && onNext) {
        onNext();
      } else if (diff < -threshold && hasPrev && onPrev) {
        onPrev();
      }

      touchStartX.current = null;
      touchEndX.current = null;
    };

    panel.addEventListener('touchstart', handleTouchStart, { passive: true });
    panel.addEventListener('touchmove', handleTouchMove, { passive: true });
    panel.addEventListener('touchend', handleTouchEnd);

    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      panel.removeEventListener('touchmove', handleTouchMove);
      panel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [hasPrev, hasNext, onPrev, onNext]);

  const character = CHARACTERS[characterId];
  const equipableTags = character?.battleData?.equipableTags;

  const currentBattleStats = useMemo(() => {
    return buildCharacterBattleStats(characterId, characterStats.level, characterEquipment);
  }, [characterId, characterStats.level, characterEquipment]);

  const previewBattleStats = useMemo(() => {
    if (!pendingEquipment) return null;
    return buildCharacterBattleStats(characterId, characterStats.level, pendingEquipment);
  }, [characterId, characterStats.level, pendingEquipment]);

  const statDiff = useMemo(() => {
    if (!previewBattleStats) return null;
    const diff: Partial<BaseStats> = {};
    (Object.keys(currentBattleStats.finalStats) as (keyof BaseStats)[]).forEach(key => {
      diff[key] = previewBattleStats.finalStats[key] - currentBattleStats.finalStats[key];
    });
    return diff;
  }, [currentBattleStats, previewBattleStats]);

  const availableItems = useMemo(() => {
    if (!selectingSlot) return [];
    const config = SLOT_CONFIG.find(s => s.key === selectingSlot);
    if (!config) return [];
    return getAvailableEquipment(inventory, config.category, equipableTags);
  }, [selectingSlot, inventory, equipableTags]);

  const handleSelectEquipment = useCallback((itemId: string | null) => {
    if (!selectingSlot) return;

    const currentEquippedId = characterEquipment[selectingSlot];
    const inventoryChanges: Record<string, number> = {};

    if (currentEquippedId) {
      inventoryChanges[currentEquippedId] = (inventoryChanges[currentEquippedId] || 0) + 1;
    }

    if (itemId) {
      inventoryChanges[itemId] = (inventoryChanges[itemId] || 0) - 1;
    }

    const newEquipment: CharacterEquipment = {
      ...characterEquipment,
      [selectingSlot]: itemId
    };

    setPendingEquipment(newEquipment);
    onUpdateEquipment(newEquipment, inventoryChanges);
    setSelectingSlot(null);
  }, [selectingSlot, characterEquipment, onUpdateEquipment, inventory]);

  const avatarUrl = CHARACTER_IMAGES[characterId]?.avatarUrl || character?.avatarUrl || '';
  const rawName = character?.name || '未知角色';
  const displayName = resolveCharacterDisplayName(rawName, userName);

  return (
    <div ref={panelRef} className="relative h-full flex flex-col">
      <div className="flex items-center gap-3 pb-3 mb-3 border-b-2 border-[#9b7a4c]/40 relative">
        <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-[#9b7a4c] shadow-md shrink-0">
          <img src={resolveImgPath(avatarUrl)} alt={displayName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-[#382b26] truncate">{displayName}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded border border-[#c7b08f] bg-[#efe4d4] text-xs font-mono font-black text-[#8a5a30]">
              Lv.{characterStats.level}
            </span>
            <span className="text-xs text-[#8c7b70]">{character?.battleData?.className || '未知职业'}</span>
          </div>
        </div>
        {(hasPrev || hasNext) && (
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all text-xs ${
                hasPrev
                  ? 'bg-[#382b26] border-[#9b7a4c] text-[#f0e6d2] hover:bg-[#4a3b32] hover:scale-105 shadow-md'
                  : 'bg-[#d6cbb8] border-[#c7bca8] text-[#8c7b70] cursor-not-allowed opacity-50'
              }`}
              title="上一个角色"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all text-xs ${
                hasNext
                  ? 'bg-[#382b26] border-[#9b7a4c] text-[#f0e6d2] hover:bg-[#4a3b32] hover:scale-105 shadow-md'
                  : 'bg-[#d6cbb8] border-[#c7bca8] text-[#8c7b70] cursor-not-allowed opacity-50'
              }`}
              title="下一个角色"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-[#382b26] mb-2 flex items-center gap-2">
          <i className="fa-solid fa-chart-simple text-[#9b7a4c]"></i>
          战斗属性
        </h4>
        <div className="bg-[#fcfaf7] border border-[#d6cbb8] rounded-lg p-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
          {(Object.keys(STAT_NAMES_CN) as (keyof BaseStats)[]).map((stat) => (
            <StatDisplay
              key={stat as string}
              label={STAT_NAMES_CN[stat]}
              value={currentBattleStats.finalStats[stat]}
              diff={statDiff?.[stat]}
            />
          ))}
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#382b26] mb-2 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-[#9b7a4c]"></i>
          装备栏位
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {SLOT_CONFIG.map(config => {
            const itemId = characterEquipment[config.key];
            const item = itemId ? ITEMS_EQUIP[itemId] : null;

            return (
              <EquipmentSlot
                key={config.key}
                label={config.label}
                item={item}
                onClick={() => setSelectingSlot(config.key)}
              />
            );
          })}
        </div>

        {equipableTags && equipableTags.length > 0 && (
          <div className="mt-3 p-2 bg-[#f5f0e6] border border-[#d6cbb8] rounded-lg">
            <div className="text-[10px] text-[#8c7b70] font-bold mb-1.5">可装备类型</div>
            <div className="flex flex-wrap gap-1">
              {equipableTags.map(tag => {
                const tagInfo = ITEM_TAGS.find(t => t.id === tag);
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#fffef8] border border-[#c7bca8] rounded text-[10px] text-[#5c4d45]"
                  >
                    {tagInfo?.icon && <span>{tagInfo.icon}</span>}
                    <span>{tagInfo?.name || tag}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <EquipmentSelectModal
        isOpen={!!selectingSlot}
        onClose={() => setSelectingSlot(null)}
        items={availableItems}
        currentItemId={selectingSlot ? characterEquipment[selectingSlot] : null}
        onSelect={handleSelectEquipment}
        slotLabel={SLOT_CONFIG.find(s => s.key === selectingSlot)?.label || '装备'}
      />
    </div>
  );
};

const PartyEquipmentModal: React.FC<PartyEquipmentModalProps> = ({
  isOpen,
  onClose,
  battleParty,
  characterStats,
  characterEquipments,
  inventory,
  userName,
  onUpdateEquipment,
  onAutoSave
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    onAutoSave();
    onClose();
  }, [onAutoSave, onClose]);

  const partyMembers = useMemo(() => {
    return battleParty.map((memberId, idx) => {
      if (!memberId) return null;
      const character = CHARACTERS[memberId];
      const stat = characterStats[memberId];
      const avatarUrl = CHARACTER_IMAGES[memberId]?.avatarUrl || character?.avatarUrl || '';
      const rawName = character?.name || '未知角色';
      const displayName = resolveCharacterDisplayName(rawName, userName);
      const equipment = characterEquipments[memberId];
      const weaponItem = equipment?.weaponId ? ITEMS_EQUIP[equipment.weaponId] : null;
      const weaponTag = weaponItem?.tag ? ITEM_TAGS.find(t => t.id === weaponItem.tag) : null;

      return {
        id: memberId,
        name: displayName,
        level: stat?.level || 1,
        avatarUrl,
        weaponIcon: weaponTag?.icon || '',
        weaponName: weaponItem?.name || '未装备'
      };
    });
  }, [battleParty, characterStats, characterEquipments, userName]);

  const equipmentList = useMemo(() => {
    return getAllEquipmentsInInventory(inventory);
  }, [inventory]);

  const handlePrev = useCallback(() => {
    if (selectedSlotIndex === null) return;
    for (let i = selectedSlotIndex - 1; i >= 0; i--) {
      if (partyMembers[i]) {
        setSelectedSlotIndex(i);
        return;
      }
    }
    for (let i = partyMembers.length - 1; i > selectedSlotIndex; i--) {
      if (partyMembers[i]) {
        setSelectedSlotIndex(i);
        return;
      }
    }
  }, [selectedSlotIndex, partyMembers]);

  const handleNext = useCallback(() => {
    if (selectedSlotIndex === null) return;
    for (let i = selectedSlotIndex + 1; i < partyMembers.length; i++) {
      if (partyMembers[i]) {
        setSelectedSlotIndex(i);
        return;
      }
    }
    for (let i = 0; i < selectedSlotIndex; i++) {
      if (partyMembers[i]) {
        setSelectedSlotIndex(i);
        return;
      }
    }
  }, [selectedSlotIndex, partyMembers]);

  const hasPrevMember = useMemo(() => {
    if (selectedSlotIndex === null) return false;
    for (let i = selectedSlotIndex - 1; i >= 0; i--) {
      if (partyMembers[i]) return true;
    }
    return false;
  }, [selectedSlotIndex, partyMembers]);

  const hasNextMember = useMemo(() => {
    if (selectedSlotIndex === null) return false;
    for (let i = selectedSlotIndex + 1; i < partyMembers.length; i++) {
      if (partyMembers[i]) return true;
    }
    return false;
  }, [selectedSlotIndex, partyMembers]);

  const handleSlotClick = (idx: number) => {
    const memberId = battleParty[idx];
    if (!memberId) return;
    setSelectedSlotIndex(idx);
  };

  const handleUpdateEquipment = useCallback((characterId: string, equipment: CharacterEquipment, inventoryChanges: Record<string, number>) => {
    onUpdateEquipment(characterId, equipment, inventoryChanges);
  }, [onUpdateEquipment]);

  const selectedItem = selectedItemId ? ITEMS_EQUIP[selectedItemId] : null;
  const selectedItemCount = selectedItemId ? (inventory[selectedItemId] || 0) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn font-sans">
      <div className="relative w-full max-w-6xl lg:max-w-3xl h-[82vh] flex bg-[#e8dfd1] rounded-r-xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-[#2c241b] via-[#3d3226] to-[#2c241b] z-20 shadow-xl border-r border-[#1a1512]">
          <div className="h-full w-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]" />
        </div>

        <div className="absolute inset-0 border-[8px] border-[#382b26] rounded-r-xl pointer-events-none z-10 border-l-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]" />

        <div className="relative z-20 flex-1 flex flex-col pl-6 md:pl-8 pr-3 md:pr-4 py-3 min-h-0">
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#9b7a4c 1px, transparent 1px)',
              backgroundSize: '100% 2.5rem',
              marginTop: '3rem'
            }}
          />

          <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b-2 border-[#9b7a4c]/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#382b26] text-[#f0e6d2] flex items-center justify-center shadow-inner">
                <i className="fa-solid fa-shield-halved" />
              </div>
              <div className="h-8 flex items-center">
                <h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em] leading-none">装备变更</h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-transparent text-[#9b7a4c] hover:bg-white/10 hover:text-[#382b26] border border-transparent hover:border-[#9b7a4c] transition-all flex items-center justify-center"
              title="关闭"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="relative z-10 flex-1 min-h-0">
            <div className="h-full p-2 md:p-4 overflow-y-auto custom-scrollbar">
              {selectedSlotIndex === null ? (
                <>
                  <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-users text-[#9b7a4c]"></i> 队伍成员
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                    {battleParty.map((memberId, idx) => {
                      const member = partyMembers[idx];
                      const isSelected = selectedSlotIndex === idx;

                      return (
                        <div
                          key={`party-slot-${idx}`}
                          onClick={() => handleSlotClick(idx)}
                          className={`group relative p-1 md:p-1.5 rounded-md border transition-all duration-300 cursor-pointer overflow-hidden min-w-0 ${
                            memberId
                              ? isSelected
                                ? 'border-[#b45309] bg-[#f5f0e6] shadow-[0_2px_8px_rgba(0,0,0,0.12)] scale-[1.01]'
                                : 'border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c]'
                              : 'border-dashed border-[#c7bca8] bg-[#e8dfd1]/50 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="w-full aspect-square rounded-md overflow-hidden bg-[#d6cbb8]/50 border border-[#c7bca8] mb-1 relative">
                            {member?.avatarUrl ? (
                              <img src={resolveImgPath(member.avatarUrl)} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8c7b70] text-base opacity-50">
                                <i className="fa-solid fa-user-slash" />
                              </div>
                            )}
                            {member?.weaponIcon && (
                              <div className="absolute right-0.5 bottom-0.5 min-w-4 h-4 px-0.5 rounded bg-black/60 border border-[#f5deb3]/40 text-[10px] flex items-center justify-center shadow-sm">
                                <span>{member.weaponIcon}</span>
                              </div>
                            )}
                            {idx === 0 && (
                              <div className="absolute top-0.5 left-0.5 bg-black/60 text-[#fcd34d] text-[8px] px-1 py-0.5 rounded border border-[#fcd34d]/50 backdrop-blur-sm font-bold">
                                🚩
                              </div>
                            )}
                          </div>
                          <div className="relative z-10 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-[9px] font-bold text-[#8c7b70] tracking-wide">{idx + 1}号位</div>
                              {member && (
                                <div className="px-1.5 py-0.5 rounded border border-[#c7b08f] bg-[#efe4d4] text-[9px] font-mono font-black text-[#8a5a30] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                                  Lv.{member.level}
                                </div>
                              )}
                            </div>
                            <div className={`text-[10px] md:text-xs font-bold truncate ${member ? 'text-[#382b26]' : 'text-[#8c7b70]'}`}>
                              {member?.name || '空位'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide flex items-center gap-2">
                      <i className="fa-solid fa-boxes-stacked text-[#9b7a4c]"></i> 装备库存
                    </h3>
                    {equipmentList.length === 0 ? (
                      <div className="text-center py-6 text-[#8c7b70] bg-[#fcfaf7] border border-[#d6cbb8] rounded-lg">
                        <i className="fa-solid fa-box-open text-2xl mb-2 opacity-50"></i>
                        <div className="text-sm">暂无装备</div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {equipmentList.map(item => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItemId(item.id)}
                            className="w-full p-2 rounded-lg border border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c] hover:bg-[#f5f0e6] transition-all text-left flex items-center gap-2"
                          >
                            <div className="w-8 h-8 rounded bg-[#e8dfd1] border border-[#c7bca8] flex items-center justify-center text-lg shrink-0">
                              {item.tag ? ITEM_TAGS.find(t => t.id === item.tag)?.icon || '📦' : '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${getQualityColor(item.quality)}`}>
                                  {item.name}
                                </span>
                                {item.quality && (
                                  <span className={`text-[9px] px-1 py-0.5 rounded border ${getQualityBgColor(item.quality)}`}>
                                    {item.quality}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#8c7b70] mt-0.5">
                                {ITEM_CATEGORIES.find(c => c.id === item.category)?.name}
                                {item.tag && ` · ${ITEM_TAGS.find(t => t.id === item.tag)?.name || item.tag}`}
                              </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-[#382b26] bg-[#efe4d4] px-2 py-1 rounded border border-[#c7b08f]">
                              x{inventory[item.id]}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <CharacterDetailPanel
                  characterId={battleParty[selectedSlotIndex]!}
                  characterStats={characterStats[battleParty[selectedSlotIndex]!] || { level: 1, affinity: 0, exp: 0 }}
                  characterEquipment={characterEquipments[battleParty[selectedSlotIndex]!] || { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null }}
                  inventory={inventory}
                  userName={userName}
                  onUpdateEquipment={(equipment, inventoryChanges) => handleUpdateEquipment(battleParty[selectedSlotIndex]!, equipment, inventoryChanges)}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  hasPrev={hasPrevMember}
                  hasNext={hasNextMember}
                />
              )}
            </div>
          </div>

          {selectedSlotIndex !== null && (
            <div className="relative z-10 pt-2 border-t border-[#d6cbb8]/50">
              <button
                onClick={() => setSelectedSlotIndex(null)}
                className="w-full py-2 px-4 rounded-lg bg-[#382b26] text-[#f0e6d2] border-2 border-[#9b7a4c] font-bold tracking-wide hover:bg-[#4a3b32] hover:scale-[1.01] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                返回队伍列表
              </button>
            </div>
          )}
        </div>
      </div>

      <ItemDetailModal
        isOpen={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
        item={selectedItem}
        count={selectedItemCount}
      />
    </div>
  );
};

export default PartyEquipmentModal;
