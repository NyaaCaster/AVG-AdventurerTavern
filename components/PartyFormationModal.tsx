import React, { useMemo, useState } from 'react';
import { BattlePartySlots, CharacterEquipment, CharacterStat, CharacterUnlocks } from '../types';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { resolveImgPath } from '../utils/imagePath';
import { buildCharacterBattleStats } from '../services/characterBattleStats';
import { ITEMS_EQUIP } from '../data/item-equip';
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
  { key: 'hp', label: 'HP' },
  { key: 'mp', label: 'MP' },
  { key: 'atk', label: 'ATK' },
  { key: 'def', label: 'DEF' },
  { key: 'matk', label: 'MATK' },
  { key: 'mdef', label: 'MDEF' },
  { key: 'agi', label: 'AGI' },
  { key: 'luk', label: 'LUK' }
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

  const selectedWeaponName = selectedEquip.weaponId ? (ITEMS_EQUIP[selectedEquip.weaponId]?.name || '未知武器') : '未装备';

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

          <div className="relative z-10 flex items-center justify-between pb-2 mb-2 border-b border-[#9b7a4c]/40">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em]">队伍编成</h2>
              <p className="text-[11px] md:text-xs text-[#5c4d45]">点击空栏位选择角色，点击已加入角色查看战斗详情</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full text-[#5c4d45] hover:text-[#b45309] hover:bg-[#d6cbb8]/60 transition-colors"
              title="关闭"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] min-h-0">
            <div className="p-3 md:p-4 border-r border-[#c7bca8] overflow-y-auto custom-scrollbar">
              <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide">队伍成员</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {battleParty.map((memberId, idx) => {
                  const avatar = memberId ? (CHARACTER_IMAGES[memberId]?.avatarUrl || CHARACTERS[memberId]?.avatarUrl || '') : '';
                  const rawName = memberId ? CHARACTERS[memberId]?.name : '空位';
                  const name = memberId ? resolveCharacterDisplayName(rawName || '未知角色', userName) : rawName;
                  const isSelected = memberId && selectedCharacterId === memberId;
                  return (
                    <div
                      key={`party-slot-${idx}`}
                      onClick={() => handleSlotClick(idx)}
                      className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#b45309] bg-[#f5f0e6] shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                          : 'border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c] hover:bg-[#f5f0e6]'
                      } ${pendingSlotIndex === idx ? 'ring-2 ring-amber-400' : ''}`}
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
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 border border-red-200 text-red-800 text-xs z-10 flex items-center justify-center transition-colors"
                          title="退队"
                        >
                          <i className="fa-solid fa-user-minus" />
                        </button>
                      )}
                      <div className="w-full aspect-square rounded-md overflow-hidden bg-[#e8dfd1] border border-[#c7bca8] mb-2">
                        {avatar ? (
                          <img src={resolveImgPath(avatar)} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8c7b70] text-3xl">
                            <i className="fa-solid fa-user-plus" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#382b26]">{idx + 1}号位</div>
                      <div className="text-[11px] text-[#5c4d45] truncate">{name}</div>
                      {idx === 0 && <div className="text-[10px] text-amber-700 mt-1 font-bold">固定</div>}
                    </div>
                  );
                })}
              </div>

              <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide">可编入角色</h3>
              {pendingSlotIndex !== null && <div className="mb-3 text-xs text-amber-700 font-bold">当前选择：{pendingSlotIndex + 1}号位</div>}
              <div className="space-y-2">
                {selectableCharacters.length === 0 ? (
                  <div className="text-sm text-[#8c7b70] bg-[#fcfaf7] border border-[#d6cbb8] rounded-lg px-3 py-4">当前没有可加入队伍的角色</div>
                ) : (
                  selectableCharacters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => handleAddCharacter(char.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg border border-[#d6cbb8] bg-[#fffef8] hover:border-[#9b7a4c] hover:bg-[#f5f0e6] transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-[#c7bca8] bg-[#e8dfd1]">
                        <img src={resolveImgPath(char.avatarUrl)} alt={char.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#382b26]">{char.name}</div>
                        <div className="text-xs text-[#5c4d45]">Lv.{char.level}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 md:p-4 overflow-y-auto custom-scrollbar bg-[#f5f0e6]/70">
              <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide">角色信息</h3>
              <div className="rounded-lg border border-[#d6cbb8] bg-[#fffef8] p-3 mb-3 shadow-sm">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#c7bca8] bg-[#e8dfd1]">
                    <img
                      src={resolveImgPath(CHARACTER_IMAGES[selectedCharacter.id]?.avatarUrl || selectedCharacter.avatarUrl || '')}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-[#382b26]">{resolveCharacterDisplayName(selectedCharacter.name, userName)}</div>
                    <div className="text-xs text-[#5c4d45] mb-1">Lv.{level}</div>
                    <div className="text-xs text-[#5c4d45]">当前武器：{selectedWeaponName}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[#5c4d45] mb-1 font-bold">
                    <span>经验值</span>
                    <span className="font-mono">
                      {currentExp} / {needExp <= 0 ? 0 : needExp}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#d6cbb8] border border-[#c7bca8] overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${expPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {STAT_LABELS.map((stat) => (
                  <div key={stat.key} className="rounded-md border border-[#d6cbb8] bg-[#fffef8] px-3 py-2 hover:border-[#9b7a4c] transition-colors shadow-sm hover:shadow-md">
                    <div className="text-[11px] text-[#8c7b70] font-bold tracking-wide">{stat.label}</div>
                    <div className="text-sm font-bold text-[#382b26] font-mono">{battleStats.finalStats[stat.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyFormationModal;

