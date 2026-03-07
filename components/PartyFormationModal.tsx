import React, { useMemo, useState, useCallback } from 'react';
import { BattlePartySlots, CharacterEquipment, CharacterStat, CharacterUnlocks } from '../types';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { resolveImgPath } from '../utils/imagePath';
import { ITEMS_EQUIP } from '../data/item-equip';
import { ITEM_TAGS } from '../data/item-type';
import { EXP_TABLE } from '../data/battle-data/exp_table';
import { resolveCharacterDisplayName } from '../utils/playerText';

interface PartyFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleParty: BattlePartySlots;
  characterUnlocks: Record<string, CharacterUnlocks>;
  characterStats: Record<string, CharacterStat>;
  characterEquipments: Record<string, CharacterEquipment>;
  onAddMember: (characterId: string, slotIndex?: number) => void;
  onRemoveMember: (slotIndex: number) => void;
  userName: string;
  onAutoSave: () => void;
}

const PartyFormationModal: React.FC<PartyFormationModalProps> = ({
  isOpen,
  onClose,
  battleParty,
  characterUnlocks,
  characterStats,
  characterEquipments,
  onAddMember,
  onRemoveMember,
  userName,
  onAutoSave
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('char_1');
  const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);

  const handleClose = useCallback(() => {
    onAutoSave();
    onClose();
  }, [onAutoSave, onClose]);

  const selectableCharacters = useMemo(() => {
    const partySet = new Set(battleParty.filter(Boolean));
    return Object.keys(CHARACTERS)
      .filter((charId) => charId !== 'char_1')
      .filter((charId) => (characterUnlocks[charId]?.accept_battle_party || 0) === 1)
      .filter((charId) => !partySet.has(charId))
      .map((charId) => {
        const stat = characterStats[charId] || { level: 1, affinity: 0, exp: 0 };
        const equip = characterEquipments[charId] || {
          weaponId: null,
          armorId: null,
          accessory1Id: null,
          accessory2Id: null
        };
        const weaponItem = equip.weaponId ? ITEMS_EQUIP[equip.weaponId] : null;
        const weaponTag = weaponItem?.tag ? ITEM_TAGS.find((t) => t.id === weaponItem.tag) : null;
        const level = stat.level || 1;
        const currentTotalExp = EXP_TABLE[level] || 0;
        const nextTotalExp = EXP_TABLE[level + 1] || currentTotalExp;
        const needExp = Math.max(0, nextTotalExp - currentTotalExp);
        const currentExp = Math.max(0, stat.exp || 0);
        const expPercent = needExp <= 0 ? 100 : Math.min(100, Math.floor((currentExp / needExp) * 100));

        return {
          id: charId,
          name: resolveCharacterDisplayName(CHARACTERS[charId].name, userName),
          level,
          avatarUrl: CHARACTER_IMAGES[charId]?.avatarUrl || CHARACTERS[charId].avatarUrl || '',
          weaponName: weaponItem?.name || '未装备',
          weaponIcon: weaponTag?.icon || '',
          currentExp,
          needExp,
          expPercent
        };
      });
  }, [battleParty, characterUnlocks, characterStats, characterEquipments, userName]);

  const handleSlotClick = (slotIndex: number) => {
    const memberId = battleParty[slotIndex];
    if (memberId) {
      setSelectedCharacterId(memberId);
      setPendingSlotIndex(null);
      return;
    }
    if (slotIndex === 0) return;
    setPendingSlotIndex(slotIndex);
  };

  const handleAddCharacter = (characterId: string) => {
    onAddMember(characterId, pendingSlotIndex === null ? undefined : pendingSlotIndex);
    setPendingSlotIndex(null);
    setSelectedCharacterId(characterId);
  };

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
                <i className="fa-solid fa-users" />
              </div>
              <div className="h-8 flex items-center">
                <h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em] leading-none">队伍编成</h2>
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
              <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide flex items-center gap-2">
                <i className="fa-solid fa-chess-knight text-[#9b7a4c]"></i> 队伍成员
              </h3>
              <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-5">
                {battleParty.map((memberId, idx) => {
                  const avatar = memberId ? (CHARACTER_IMAGES[memberId]?.avatarUrl || CHARACTERS[memberId]?.avatarUrl || '') : '';
                  const rawName = memberId ? CHARACTERS[memberId]?.name : '空位';
                  const name = memberId ? resolveCharacterDisplayName(rawName || '未知角色', userName) : rawName;
                  const memberLevel = memberId ? (characterStats[memberId]?.level || 1) : null;
                  const memberEquip = memberId ? characterEquipments[memberId] : null;
                  const memberWeaponItem = memberEquip?.weaponId ? ITEMS_EQUIP[memberEquip.weaponId] : null;
                  const memberWeaponTag = memberWeaponItem?.tag ? ITEM_TAGS.find((tag) => tag.id === memberWeaponItem.tag) : null;
                  const memberWeaponIcon = memberWeaponTag?.icon || '';
                  const isSelected = memberId && selectedCharacterId === memberId;
                  const isPending = pendingSlotIndex === idx;
                  
                  return (
                    <div
                      key={`party-slot-${idx}`}
                      onClick={() => handleSlotClick(idx)}
                      className={`group relative p-1 md:p-1.5 rounded-md border transition-all duration-300 cursor-pointer overflow-hidden min-w-0 ${
                        isSelected
                          ? 'border-[#b45309] bg-[#f5f0e6] shadow-[0_2px_8px_rgba(0,0,0,0.12)] scale-[1.01]'
                          : memberId
                            ? 'border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c]'
                            : 'border-dashed border-[#c7bca8] bg-[#e8dfd1]/50 hover:border-[#9b7a4c]'
                      } ${isPending ? 'border-amber-400 bg-amber-50 shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse' : ''}`}
                    >
                      {idx > 0 && memberId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMember(idx);
                            if (selectedCharacterId === memberId) {
                              setSelectedCharacterId('char_1');
                            }
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] z-20 flex items-center justify-center shadow-md border border-[#fcfaf7]"
                          title="下阵"
                        >
                          <i className="fa-solid fa-right-from-bracket" />
                        </button>
                      )}
                      <div className="w-full aspect-square rounded-md overflow-hidden bg-[#d6cbb8]/50 border border-[#c7bca8] mb-1 relative">
                        {avatar ? (
                          <img src={resolveImgPath(avatar)} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8c7b70] text-base opacity-50 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-plus" />
                          </div>
                        )}
                        {memberId && memberWeaponIcon && (
                          <div className="absolute right-0.5 bottom-0.5 min-w-4 h-4 px-0.5 rounded bg-black/60 border border-[#f5deb3]/40 text-[10px] flex items-center justify-center shadow-sm">
                            <span>{memberWeaponIcon}</span>
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
                          {memberId && (
                            <div className="px-1.5 py-0.5 rounded border border-[#c7b08f] bg-[#efe4d4] text-[9px] font-mono font-black text-[#8a5a30] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                              Lv.{memberLevel}
                            </div>
                          )}
                        </div>
                        <div className={`text-[10px] md:text-xs font-bold truncate ${memberId ? 'text-[#382b26]' : 'text-[#8c7b70]'}`}>{name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm md:text-base font-bold text-[#382b26] tracking-wide flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-list text-[#9b7a4c]"></i> 可编入角色
                </h3>
                {pendingSlotIndex !== null && (
                  <div className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded font-bold animate-pulse">
                    正在选择: {pendingSlotIndex + 1}号位
                  </div>
                )}
              </div>
              <div className="space-y-2 pr-1">
                {selectableCharacters.length === 0 ? (
                  <div className="text-sm text-[#8c7b70] bg-[#fcfaf7] border border-[#d6cbb8] rounded-lg px-4 py-6 text-center shadow-inner">
                    <i className="fa-solid fa-user-slash text-2xl mb-2 opacity-50"></i>
                    <div>当前没有可加入队伍的角色</div>
                  </div>
                ) : (
                  selectableCharacters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => handleAddCharacter(char.id)}
                      className="group w-full p-2 rounded-lg border border-[#d6cbb8] bg-[#fffef8] hover:border-[#9b7a4c] hover:bg-[#f5f0e6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-11 h-11 rounded-md overflow-hidden border border-[#c7bca8] bg-[#e8dfd1] shadow-sm shrink-0">
                          <img src={resolveImgPath(char.avatarUrl)} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-[#382b26] group-hover:text-[#b45309] transition-colors truncate">{char.name}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8c7b70] font-mono font-bold min-w-0">
                            <span className="w-[48px] shrink-0">Lv.{char.level}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f5f0e6] border border-[#d6cbb8] rounded text-[#5c4d45] font-bold min-w-0 max-w-full">
                              {char.weaponIcon && <span>{char.weaponIcon}</span>}
                              <span className="truncate">{char.weaponName}</span>
                            </span>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-[#d6cbb8] text-[#d6cbb8] flex items-center justify-center group-hover:border-[#9b7a4c] group-hover:text-[#9b7a4c] group-hover:bg-white transition-colors">
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px]">
                        <div className="text-[#8c7b70] font-bold tracking-wide">经验值</div>
                        <div className="font-mono font-bold text-[#b45309] shrink-0">
                          {char.currentExp} / {char.needExp <= 0 ? 0 : char.needExp}
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#e8dfd1] border border-[#c7bca8] overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out" style={{ width: `${char.expPercent}%` }} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyFormationModal;

