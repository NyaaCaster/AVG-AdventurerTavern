import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { BattlePartySlots, CharacterStat, CharacterUnlocks, CharacterSkills } from '../types';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { resolveImgPath } from '../utils/imagePath';
import { SKILLS, SkillData } from '../data/battle-data/skills';
import { resolveCharacterDisplayName } from '../utils/playerText';

interface PartySkillSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  battleParty: BattlePartySlots;
  characterUnlocks: Record<string, CharacterUnlocks>;
  characterStats: Record<string, CharacterStat>;
  characterSkills: Record<string, CharacterSkills>;
  userName: string;
  onUpdateCharacterSkills: (characterId: string, skills: CharacterSkills) => void;
  onAutoSave: () => void;
}

type SkillSlotKey = 'slot1' | 'slot2' | 'slot3' | 'slot4' | 'slot5' | 'slot6' | 'slot7' | 'slot8';

const SKILL_SLOT_CONFIG: { key: SkillSlotKey; label: string }[] = [
  { key: 'slot1', label: '技能 1' },
  { key: 'slot2', label: '技能 2' },
  { key: 'slot3', label: '技能 3' },
  { key: 'slot4', label: '技能 4' },
  { key: 'slot5', label: '技能 5' },
  { key: 'slot6', label: '技能 6' },
  { key: 'slot7', label: '技能 7' },
  { key: 'slot8', label: '技能 8' }
];

const getSkillById = (skillId: number | null): SkillData | null => {
  if (skillId === null) return null;
  return SKILLS.find(s => s.id === skillId) || null;
};

const SkillSelectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  availableSkills: SkillData[];
  currentSkillId: number | null;
  onSelect: (skillId: number | null) => void;
  slotLabel: string;
  equippedSkillIds: number[];
}> = ({ isOpen, onClose, availableSkills, currentSkillId, onSelect, slotLabel, equippedSkillIds }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-[#fffef8] border-2 border-[#9b7a4c] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="bg-[#382b26] text-[#f0e6d2] px-4 py-3 flex items-center justify-between border-b border-[#9b7a4c]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-book text-[#9b7a4c]"></i>
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
          {currentSkillId && (
            <button
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="w-full p-3 mb-2 rounded-lg border-2 border-dashed border-[#c7bca8] bg-[#e8dfd1]/50 hover:border-[#9b7a4c] hover:bg-[#f5f0e6] transition-all text-left"
            >
              <div className="flex items-center gap-2 text-[#8c7b70]">
                <i className="fa-solid fa-book-open"></i>
                <span className="text-sm font-bold">卸下当前技能</span>
              </div>
            </button>
          )}

          {availableSkills.length === 0 ? (
            <div className="text-center py-8 text-[#8c7b70]">
              <i className="fa-solid fa-book text-3xl mb-2 opacity-50"></i>
              <div className="text-sm">没有可用的技能</div>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSkills.map(skill => {
                const isEquipped = equippedSkillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => {
                      if (!isEquipped) {
                        onSelect(skill.id);
                        onClose();
                      }
                    }}
                    disabled={isEquipped}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      skill.id === currentSkillId
                        ? 'border-[#b45309] bg-[#f5f0e6] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                        : isEquipped
                          ? 'border-[#d6cbb8] bg-[#e8dfd1]/50 cursor-not-allowed opacity-60'
                          : 'border-[#d6cbb8] bg-[#fffef8] hover:border-[#9b7a4c] hover:bg-[#f5f0e6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#382b26]">{skill.name}</span>
                      {isEquipped && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9b7a4c]/20 text-[#9b7a4c] border border-[#9b7a4c]/30">
                          已装备
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8c7b70] mt-1 line-clamp-2">
                      {skill.description || '无描述'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PLAYER_LOCKED_SKILL_ID = 999;
const PLAYER_UNLOCK_LEVEL = 100;

const SkillSlot: React.FC<{
  label: string;
  skill: SkillData | null;
  onClick: () => void;
  isLocked?: boolean;
}> = ({ label, skill, onClick, isLocked }) => (
  <button
    onClick={isLocked ? undefined : onClick}
    className={`w-full p-2 rounded-lg border transition-all text-left relative ${
      isLocked
        ? 'border-[#5c4d45] bg-[#3d3226]/80 cursor-not-allowed'
        : 'border-[#d6cbb8] bg-[#fcfaf7] hover:border-[#9b7a4c] hover:bg-[#f5f0e6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
    }`}
  >
    <div className={`text-[10px] font-bold tracking-wide mb-1 ${isLocked ? 'text-[#9b7a4c]/70' : 'text-[#8c7b70]'}`}>{label}</div>
    {skill ? (
      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-xs font-bold ${isLocked ? 'text-[#9b7a4c]/90' : 'text-[#382b26]'}`}>{skill.name}</span>
        {isLocked && (
          <i className="fa-solid fa-lock text-[#9b7a4c]/70 text-[10px]" />
        )}
      </div>
    ) : (
      <div className={`text-xs italic ${isLocked ? 'text-[#9b7a4c]/50' : 'text-[#8c7b70]'}`}>未配置</div>
    )}
    {skill && skill.description && (
      <div className={`text-[9px] mt-1 line-clamp-1 ${isLocked ? 'text-[#9b7a4c]/60' : 'text-[#8c7b70]'}`}>{skill.description}</div>
    )}
  </button>
);

const CharacterSkillPanel: React.FC<{
  characterId: string;
  characterStats: CharacterStat;
  characterSkills: CharacterSkills;
  userName: string;
  onUpdateSkills: (skills: CharacterSkills) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}> = ({
  characterId,
  characterStats,
  characterSkills,
  userName,
  onUpdateSkills,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}) => {
  const [selectingSlot, setSelectingSlot] = useState<SkillSlotKey | null>(null);
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
  const characterLevel = characterStats?.level || 1;

  const isPlayerCharacter = characterId === 'char_1';
  const isSlot8Locked = isPlayerCharacter && characterLevel < PLAYER_UNLOCK_LEVEL;

  const unlockedSkillIds = useMemo(() => {
    if (!character?.battleData?.skills) return [];
    return character.battleData.skills
      .filter(skillLearning => characterLevel >= skillLearning.level)
      .map(skillLearning => skillLearning.skillId);
  }, [character, characterLevel]);

  const effectiveSkills = useMemo(() => {
    if (!isSlot8Locked) return characterSkills;
    
    return {
      ...characterSkills,
      slot8: PLAYER_LOCKED_SKILL_ID
    };
  }, [characterSkills, isSlot8Locked]);

  const equippedSkillIds = useMemo(() => {
    const ids: number[] = [];
    SKILL_SLOT_CONFIG.forEach(config => {
      const skillId = effectiveSkills[config.key];
      if (skillId !== null) {
        ids.push(skillId);
      }
    });
    return ids;
  }, [effectiveSkills]);

  const availableSkills = useMemo(() => {
    return unlockedSkillIds
      .map(id => getSkillById(id))
      .filter((s): s is SkillData => s !== null);
  }, [unlockedSkillIds]);

  const handleSelectSkill = useCallback((skillId: number | null) => {
    if (!selectingSlot) return;
    
    if (selectingSlot === 'slot8' && isSlot8Locked) {
      setSelectingSlot(null);
      return;
    }

    const newSkills: CharacterSkills = {
      ...characterSkills,
      [selectingSlot]: skillId
    };

    onUpdateSkills(newSkills);
    setSelectingSlot(null);
  }, [selectingSlot, characterSkills, onUpdateSkills, isSlot8Locked]);

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
              Lv.{characterLevel}
            </span>
            <span className="text-xs text-[#8c7b70]">{character?.battleData?.className || '未知职业'}</span>
          </div>
        </div>
        {(hasPrev || hasNext) && (
          <div className="flex items-center gap-1 shrink-0">
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

      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#382b26] mb-2 flex items-center gap-2">
          <i className="fa-solid fa-book text-[#9b7a4c]"></i>
          技能栏位
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {SKILL_SLOT_CONFIG.map(config => {
            const skillId = effectiveSkills[config.key];
            const skill = skillId ? getSkillById(skillId) : null;
            const isLocked = config.key === 'slot8' && isSlot8Locked;

            return (
              <SkillSlot
                key={config.key}
                label={config.label}
                skill={skill}
                onClick={() => setSelectingSlot(config.key)}
                isLocked={isLocked}
              />
            );
          })}
        </div>

        <div className="mt-3 p-2 bg-[#f5f0e6] border border-[#d6cbb8] rounded-lg">
          <div className="text-[10px] text-[#8c7b70] font-bold mb-1.5">已解锁技能 ({availableSkills.length})</div>
          <div className="text-[10px] text-[#5c4d45]">
            根据角色等级，当前已解锁 {availableSkills.length} 个技能可供配置
          </div>
        </div>
      </div>

      <SkillSelectModal
        isOpen={!!selectingSlot && !(selectingSlot === 'slot8' && isSlot8Locked)}
        onClose={() => setSelectingSlot(null)}
        availableSkills={availableSkills}
        currentSkillId={selectingSlot ? effectiveSkills[selectingSlot] : null}
        onSelect={handleSelectSkill}
        slotLabel={SKILL_SLOT_CONFIG.find(s => s.key === selectingSlot)?.label || '技能'}
        equippedSkillIds={equippedSkillIds}
      />
    </div>
  );
};

const PartySkillSetModal: React.FC<PartySkillSetModalProps> = ({
  isOpen,
  onClose,
  battleParty,
  characterUnlocks,
  characterStats,
  characterSkills,
  userName,
  onUpdateCharacterSkills,
  onAutoSave
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    onAutoSave();
    onClose();
    setSelectedCharacterId(null);
  }, [onAutoSave, onClose]);

  const partyMembers = useMemo(() => {
    return battleParty.map((memberId) => {
      if (!memberId) return null;
      const character = CHARACTERS[memberId];
      const stat = characterStats[memberId];
      const avatarUrl = CHARACTER_IMAGES[memberId]?.avatarUrl || character?.avatarUrl || '';
      const rawName = character?.name || '未知角色';
      const displayName = resolveCharacterDisplayName(rawName, userName);

      return {
        id: memberId,
        name: displayName,
        level: stat?.level || 1,
        avatarUrl,
        className: character?.battleData?.className || '未知职业'
      };
    });
  }, [battleParty, characterStats, userName]);

  const standbyCharacters = useMemo(() => {
    const partySet = new Set(battleParty.filter(Boolean));
    return Object.keys(CHARACTERS)
      .filter((charId) => charId !== 'char_1')
      .filter((charId) => CHARACTERS[charId]?.battleData?.canFight !== false)
      .filter((charId) => (characterUnlocks[charId]?.accept_battle_party || 0) === 1)
      .filter((charId) => !partySet.has(charId))
      .map((charId) => {
        const character = CHARACTERS[charId];
        const stat = characterStats[charId] || { level: 1, affinity: 0, exp: 0 };
        const avatarUrl = CHARACTER_IMAGES[charId]?.avatarUrl || character?.avatarUrl || '';
        const rawName = character?.name || '未知角色';
        const displayName = resolveCharacterDisplayName(rawName, userName);

        return {
          id: charId,
          name: displayName,
          level: stat.level || 1,
          avatarUrl,
          className: character?.battleData?.className || '未知职业'
        };
      });
  }, [battleParty, characterUnlocks, characterStats, userName]);

  const allSelectableCharacters = useMemo(() => {
    return [...partyMembers.filter(Boolean), ...standbyCharacters];
  }, [partyMembers, standbyCharacters]);

  const handlePrev = useCallback(() => {
    if (!selectedCharacterId) return;
    const currentIndex = allSelectableCharacters.findIndex(c => c?.id === selectedCharacterId);
    if (currentIndex > 0) {
      setSelectedCharacterId(allSelectableCharacters[currentIndex - 1]?.id || null);
    } else {
      setSelectedCharacterId(allSelectableCharacters[allSelectableCharacters.length - 1]?.id || null);
    }
  }, [selectedCharacterId, allSelectableCharacters]);

  const handleNext = useCallback(() => {
    if (!selectedCharacterId) return;
    const currentIndex = allSelectableCharacters.findIndex(c => c?.id === selectedCharacterId);
    if (currentIndex < allSelectableCharacters.length - 1) {
      setSelectedCharacterId(allSelectableCharacters[currentIndex + 1]?.id || null);
    } else {
      setSelectedCharacterId(allSelectableCharacters[0]?.id || null);
    }
  }, [selectedCharacterId, allSelectableCharacters]);

  const hasPrevCharacter = useMemo(() => {
    if (!selectedCharacterId) return false;
    const currentIndex = allSelectableCharacters.findIndex(c => c?.id === selectedCharacterId);
    return currentIndex > 0;
  }, [selectedCharacterId, allSelectableCharacters]);

  const hasNextCharacter = useMemo(() => {
    if (!selectedCharacterId) return false;
    const currentIndex = allSelectableCharacters.findIndex(c => c?.id === selectedCharacterId);
    return currentIndex < allSelectableCharacters.length - 1;
  }, [selectedCharacterId, allSelectableCharacters]);

  const getCharacterSkillsData = (charId: string): CharacterSkills => {
    return characterSkills[charId] || {
      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
      slot5: null,
      slot6: null,
      slot7: null,
      slot8: null
    };
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
                <i className="fa-solid fa-book" />
              </div>
              <div className="h-8 flex items-center">
                <h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em] leading-none">技能配置</h2>
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
              {selectedCharacterId === null ? (
                <>
                  <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-users text-[#9b7a4c]"></i> 队伍成员
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-5">
                    {battleParty.map((memberId, idx) => {
                      const member = partyMembers[idx];
                      const isSelected = selectedCharacterId === memberId;

                      return (
                        <div
                          key={`party-slot-${idx}`}
                          onClick={() => memberId && setSelectedCharacterId(memberId)}
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

                  <h3 className="text-sm md:text-base font-bold text-[#382b26] mb-3 tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-bed text-[#9b7a4c]"></i> 待机角色
                  </h3>
                  <div className="space-y-2 pr-1">
                    {standbyCharacters.length === 0 ? (
                      <div className="text-sm text-[#8c7b70] bg-[#fcfaf7] border border-[#d6cbb8] rounded-lg px-4 py-6 text-center shadow-inner">
                        <i className="fa-solid fa-user-slash text-2xl mb-2 opacity-50"></i>
                        <div>当前没有待机角色</div>
                      </div>
                    ) : (
                      standbyCharacters.map((char) => (
                        <button
                          key={char.id}
                          onClick={() => setSelectedCharacterId(char.id)}
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
                                <span className="text-[#5c4d45]">{char.className}</span>
                              </div>
                            </div>
                            <div className="w-6 h-6 rounded-full border border-[#d6cbb8] text-[#d6cbb8] flex items-center justify-center group-hover:border-[#9b7a4c] group-hover:text-[#9b7a4c] group-hover:bg-white transition-colors">
                              <i className="fa-solid fa-arrow-right text-[10px]"></i>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <CharacterSkillPanel
                  characterId={selectedCharacterId}
                  characterStats={characterStats[selectedCharacterId] || { level: 1, affinity: 0, exp: 0 }}
                  characterSkills={getCharacterSkillsData(selectedCharacterId)}
                  userName={userName}
                  onUpdateSkills={(skills) => onUpdateCharacterSkills(selectedCharacterId, skills)}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  hasPrev={hasPrevCharacter}
                  hasNext={hasNextCharacter}
                />
              )}
            </div>
          </div>

          {selectedCharacterId !== null && (
            <div className="relative z-10 pt-2 border-t border-[#d6cbb8]/50">
              <button
                onClick={() => setSelectedCharacterId(null)}
                className="w-full py-2 px-4 rounded-lg bg-[#382b26] text-[#f0e6d2] border-2 border-[#9b7a4c] font-bold tracking-wide hover:bg-[#4a3b32] hover:scale-[1.01] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                返回角色列表
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartySkillSetModal;
