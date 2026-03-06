import React, { useMemo, useState } from 'react';
import { BattlePartySlots, CharacterEquipment, CharacterStat, CharacterUnlocks } from '../types';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { resolveImgPath } from '../utils/imagePath';
import { buildCharacterBattleStats } from '../services/characterBattleStats';
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
}

const STAT_LABELS: Array<{ key: keyof ReturnType<typeof buildCharacterBattleStats>['finalStats']; label: string }> = [
  { key: 'hp', label: '生命' },
  { key: 'mp', label: '法力' },
  { key: 'atk', label: '物理攻击' },
  { key: 'def', label: '物理防御' },
  { key: 'matk', label: '魔法攻击' },
  { key: 'mdef', label: '魔法防御' },
  { key: 'agi', label: '敏捷' },
  { key: 'luk', label: '幸运' }
];

const PartyFormationModal: React.FC<PartyFormationModalProps> = ({
  isOpen,
  onClose,
  battleParty,
  characterUnlocks,
  characterStats,
  characterEquipments,
  onAddMember,
  onRemoveMember,
  userName
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('char_1');
  const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);

  const selectedCharacter = CHARACTERS[selectedCharacterId] || CHARACTERS['char_1'];
  const selectedStat = characterStats[selectedCharacter.id] || { level: 1, affinity: 0, exp: 0 };
  const selectedEquip = characterEquipments[selectedCharacter.id] || {
    weaponId: null,
    armorId: null,
    accessory1Id: null,
    accessory2Id: null
  };
  const battleStats = buildCharacterBattleStats(selectedCharacter.id, selectedStat.level, selectedEquip);

  const level = selectedStat.level || 1;
  const currentTotalExp = EXP_TABLE[level] || 0;
  const nextTotalExp = EXP_TABLE[level + 1] || currentTotalExp;
  const needExp = Math.max(0, nextTotalExp - currentTotalExp);
  const currentExp = Math.max(0, selectedStat.exp || 0);
  const expPercent = needExp <= 0 ? 100 : Math.min(100, Math.floor((currentExp / needExp) * 100));

  const weaponItem = selectedEquip.weaponId ? ITEMS_EQUIP[selectedEquip.weaponId] : null;
  const selectedWeaponName = weaponItem?.name || '未装备';
  const weaponTag = weaponItem?.tag ? ITEM_TAGS.find(t => t.id === weaponItem.tag) : null;
  const weaponIcon = weaponTag?.icon || '';

  const selectableCharacters = useMemo(() => {
    const partySet = new Set(battleParty.filter(Boolean));
    return Object.keys(CHARACTERS)
      .filter((charId) => charId !== 'char_1')
      .filter((charId) => (characterUnlocks[charId]?.accept_battle_party || 0) === 1)
      .filter((charId) => !partySet.has(charId))
      .map((charId) => ({
        id: charId,
        name: resolveCharacterDisplayName(CHARACTERS[charId].name, userName),
        level: characterStats[charId]?.level || 1,
        avatarUrl: CHARACTER_IMAGES[charId]?.avatarUrl || CHARACTERS[charId].avatarUrl || ''
      }));
  }, [battleParty, characterUnlocks, characterStats, userName]);

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
      <div className="relative w-full max-w-6xl h-[82vh] flex bg-[#e8dfd1] rounded-r-xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
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
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em]">队伍编成</h2>
                <p className="text-[11px] md:text-xs text-[#5c4d45]">点击空栏位选择角色，点击已加入角色查看战斗详情</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-transparent text-[#9b7a4c] hover:bg-white/10 hover:text-[#382b26] border border-transparent hover:border-[#9b7a4c] transition-all flex items-center justify-center"
              title="关闭"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] min-h-0">
            <div className="p-3 md:p-4 border-r border-[#c7bca8] overflow-y-auto custom-scrollbar">
              <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide flex items-center gap-2">
                <i className="fa-solid fa-chess-knight text-[#9b7a4c]"></i> 队伍成员
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {battleParty.map((memberId, idx) => {
                  const avatar = memberId ? (CHARACTER_IMAGES[memberId]?.avatarUrl || CHARACTERS[memberId]?.avatarUrl || '') : '';
                  const rawName = memberId ? CHARACTERS[memberId]?.name : '空位';
                  const name = memberId ? resolveCharacterDisplayName(rawName || '未知角色', userName) : rawName;
                  const isSelected = memberId && selectedCharacterId === memberId;
                  const isPending = pendingSlotIndex === idx;
                  
                  return (
                    <div
                      key={`party-slot-${idx}`}
                      onClick={() => handleSlotClick(idx)}
                      className={`group relative p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-[#b45309] bg-[#f5f0e6] shadow-[0_4px_16px_rgba(0,0,0,0.15)] scale-[1.02]'
                          : memberId 
                            ? 'border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
                            : 'border-dashed border-[#c7bca8] bg-[#e8dfd1]/50 hover:border-[#9b7a4c] hover:bg-[#e8dfd1]'
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
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white text-xs z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="退队"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      )}
                      <div className="w-full aspect-square rounded-md overflow-hidden bg-[#d6cbb8]/50 border border-[#c7bca8] mb-2 relative">
                        {avatar ? (
                          <>
                            <img src={resolveImgPath(avatar)} alt={name} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8c7b70] text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-plus" />
                          </div>
                        )}
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-black/60 text-[#fcd34d] text-[10px] px-1.5 py-0.5 rounded border border-[#fcd34d]/50 backdrop-blur-sm font-bold shadow-sm flex items-center gap-1">
                            <span>🚩</span> 队长
                          </div>
                        )}
                      </div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-bold text-[#8c7b70] uppercase tracking-wider">{idx + 1}号位</div>
                        <div className={`text-xs font-bold truncate ${memberId ? 'text-[#382b26]' : 'text-[#8c7b70]'}`}>{name}</div>
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
                      className="group w-full flex items-center gap-3 p-2 rounded-lg border border-[#d6cbb8] bg-[#fffef8] hover:border-[#9b7a4c] hover:bg-[#f5f0e6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:translate-x-1 transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-[#c7bca8] bg-[#e8dfd1] shadow-sm">
                        <img src={resolveImgPath(char.avatarUrl)} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[#382b26] group-hover:text-[#b45309] transition-colors">{char.name}</div>
                        <div className="text-xs text-[#8c7b70] font-mono font-bold">Lv.{char.level}</div>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-[#d6cbb8] text-[#d6cbb8] flex items-center justify-center group-hover:border-[#9b7a4c] group-hover:text-[#9b7a4c] group-hover:bg-white transition-colors mr-1">
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 md:p-5 overflow-y-auto custom-scrollbar bg-[#f5f0e6]/50 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTAgMTBoODB2ODBoLTgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWI3YTRjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWI3YTRjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] bg-no-repeat bg-right-top opacity-50 pointer-events-none"></div>
              
              <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-4 tracking-wide flex items-center gap-2">
                <i className="fa-solid fa-address-card text-[#9b7a4c]"></i> 详细属性
              </h3>
              
              <div className="rounded-xl border-2 border-[#9b7a4c] bg-[#fffef8] p-4 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9b7a4c] to-transparent opacity-30"></div>
                
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-[#d6cbb8] bg-[#e8dfd1] shadow-inner relative group">
                    <img
                      src={resolveImgPath(CHARACTER_IMAGES[selectedCharacter.id]?.avatarUrl || selectedCharacter.avatarUrl || '')}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 border border-white/20 rounded-lg pointer-events-none"></div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="text-xl font-black text-[#382b26] tracking-wide drop-shadow-sm">{resolveCharacterDisplayName(selectedCharacter.name, userName)}</div>
                    <div className="text-xs text-[#8c7b70] font-bold mb-2 uppercase tracking-widest">Level <span className="text-[#b45309] text-sm">{level}</span></div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#f5f0e6] border border-[#d6cbb8] rounded text-xs font-bold text-[#5c4d45] w-fit">
                      {weaponIcon && <span>{weaponIcon}</span>}
                      <span className="truncate max-w-[120px]">{selectedWeaponName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#d6cbb8]/50">
                  <div className="flex justify-between text-[10px] text-[#8c7b70] mb-1 font-bold uppercase tracking-wider">
                    <span>Experience</span>
                    <span className="font-mono text-[#b45309]">
                      {currentExp} / {needExp <= 0 ? 0 : needExp}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#e8dfd1] border border-[#c7bca8] overflow-hidden shadow-inner relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCA0TDRgMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] z-10"></div>
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out" style={{ width: `${expPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-[#fffef8] rounded-xl border border-[#d6cbb8] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <i className="fa-solid fa-chart-pie text-4xl text-[#9b7a4c]"></i>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 relative z-10">
                  {STAT_LABELS.map((stat) => (
                    <div key={stat.key} className="flex justify-between items-end border-b border-[#d6cbb8]/40 pb-1.5 group hover:border-[#9b7a4c]/50 transition-colors">
                      <div className="text-xs text-[#8c7b70] font-bold tracking-widest">{stat.label}</div>
                      <div className="text-sm font-black text-[#b45309] font-mono drop-shadow-sm">{battleStats.finalStats[stat.key]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyFormationModal;

