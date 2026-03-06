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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-6xl h-[82vh] bg-[#111827] border border-slate-600/70 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-600/50 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wide">队伍编成</h2>
            <p className="text-xs text-slate-400">点击空栏位选择角色，点击已加入角色查看战斗详情</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700/70 hover:bg-slate-600 text-slate-200 transition-colors"
            title="关闭"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] min-h-0">
          <div className="p-4 border-r border-slate-700/50 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-300 mb-3">队伍成员</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {battleParty.map((memberId, idx) => {
                const avatar = memberId ? (CHARACTER_IMAGES[memberId]?.avatarUrl || CHARACTERS[memberId]?.avatarUrl || '') : '';
                const rawName = memberId ? CHARACTERS[memberId]?.name : '空位';
                const name = memberId ? resolveCharacterDisplayName(rawName || '未知角色', userName) : rawName;
                const isSelected = memberId && selectedCharacterId === memberId;
                return (
                  <div
                    key={`party-slot-${idx}`}
                    onClick={() => handleSlotClick(idx)}
                    className={`relative p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-600 bg-slate-800/70 hover:border-slate-400'} ${pendingSlotIndex === idx ? 'ring-2 ring-amber-400' : ''}`}
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
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs z-10"
                        title="退队"
                      >
                        <i className="fa-solid fa-user-minus"></i>
                      </button>
                    )}
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-slate-900 border border-slate-700 mb-2">
                      {avatar ? (
                        <img src={resolveImgPath(avatar)} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl">
                          <i className="fa-solid fa-user-plus"></i>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-200">{idx + 1}号位</div>
                    <div className="text-[11px] text-slate-400 truncate">{name}</div>
                    {idx === 0 && <div className="text-[10px] text-amber-300 mt-1">固定</div>}
                  </div>
                );
              })}
            </div>

            <h3 className="text-sm font-bold text-slate-300 mb-3">角色列表</h3>
            {pendingSlotIndex !== null && (
              <div className="mb-3 text-xs text-amber-300">
                当前选择：{pendingSlotIndex + 1}号位
              </div>
            )}
            <div className="space-y-2">
              {selectableCharacters.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-4">
                  当前没有可加入队伍的角色
                </div>
              ) : (
                selectableCharacters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleAddCharacter(char.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border border-slate-600 bg-slate-800/60 hover:border-cyan-400 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-500">
                      <img src={resolveImgPath(char.avatarUrl)} alt={char.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{char.name}</div>
                      <div className="text-xs text-slate-400">Lv.{char.level}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-4 overflow-y-auto custom-scrollbar bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-300 mb-3">角色信息</h3>
            <div className="rounded-lg border border-slate-600 bg-slate-800/70 p-3 mb-3">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-500 bg-slate-900">
                  <img
                    src={resolveImgPath(CHARACTER_IMAGES[selectedCharacter.id]?.avatarUrl || selectedCharacter.avatarUrl || '')}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-slate-100">{resolveCharacterDisplayName(selectedCharacter.name, userName)}</div>
                  <div className="text-xs text-slate-400 mb-1">Lv.{level}</div>
                  <div className="text-xs text-slate-300">当前武器：{selectedWeaponName}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>经验值</span>
                  <span>{currentExp} / {needExp <= 0 ? 0 : needExp}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all" style={{ width: `${expPercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STAT_LABELS.map((stat) => (
                <div key={stat.key} className="rounded-md border border-slate-600 bg-slate-800/60 px-3 py-2">
                  <div className="text-[11px] text-slate-400">{stat.label}</div>
                  <div className="text-sm font-bold text-slate-100">{battleStats.finalStats[stat.key]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyFormationModal;
