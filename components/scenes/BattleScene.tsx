import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { BattleUnit, BattleState, Faction, SkillScope, SkillData as BattleSkillData } from '../battle-system/types';
import { PlayerCommand, getSelectableTargets, checkSkillAvailability, BattleEndReason } from '../battle-system/player-commands';
import { ENEMIES } from '../data/battle-data/enemies';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { resolveImgPath } from '../utils/imagePath';
import { resolveCharacterDisplayName } from '../utils/playerText';
import { QuestConfig, BattlePartySlots, CharacterStat, CharacterEquipment } from '../types';
import { SKILLS, SkillData } from '../data/battle-data/skills';
import { EXP_TABLE } from '../data/battle-data/exp_table';

interface ExpGainInfo {
  characterId: string;
  name: string;
  avatarUrl: string;
  currentLevel: number;
  currentExp: number;
  gainedExp: number;
  finalExp: number;
  finalLevel: number;
  leveledUp: boolean;
  expToNextLevel: number;
  expPercentBefore: number;
  expPercentAfter: number;
}

interface BattleSceneProps {
  isOpen: boolean;
  onClose: () => void;
  quest: QuestConfig;
  battleState: BattleState;
  battleParty: BattlePartySlots;
  characterStats: Record<string, CharacterStat>;
  characterEquipments: Record<string, CharacterEquipment>;
  userName: string;
  currentTurnUnit: BattleUnit | null;
  turnOrder: BattleUnit[];
  endReason: BattleEndReason | null;
  onExecuteCommand: (command: PlayerCommand, targetIds?: string[], skillId?: number, itemId?: string) => void;
  onAutoSave: () => void;
}

const BattleScene: React.FC<BattleSceneProps> = ({
  isOpen,
  onClose,
  quest,
  battleState,
  battleParty,
  characterStats,
  characterEquipments,
  userName,
  currentTurnUnit,
  turnOrder,
  endReason,
  onExecuteCommand,
  onAutoSave
}) => {
  const [selectedCommand, setSelectedCommand] = useState<PlayerCommand | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [showSkillList, setShowSkillList] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [expGains, setExpGains] = useState<ExpGainInfo[]>([]);
  const [animatingExpIndex, setAnimatingExpIndex] = useState(0);
  const [currentExpPercent, setCurrentExpPercent] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpCharName, setLevelUpCharName] = useState('');
  const animationRef = useRef<number | null>(null);

  const isPlayerTurn = currentTurnUnit?.faction === Faction.PLAYER;

  const backgroundImage = useMemo(() => {
    return resolveImgPath(`img/bg/dungeon/${quest.background_image}`);
  }, [quest.background_image]);

  const enemyUnitsWithImages = useMemo(() => {
    return battleState.enemyUnits.map(enemy => {
      const enemyData = ENEMIES.find(e => e.id === parseInt(enemy.id.split('_')[1]));
      const battlerName = enemyData?.battlerName || 'monster_unknown';
      return {
        ...enemy,
        imageUrl: resolveImgPath(`img/quest/${battlerName}.png`),
        role: quest.battle_config.enemies.find(e => e.position === enemy.position)?.role || 'servant'
      };
    });
  }, [battleState.enemyUnits, quest.battle_config.enemies]);

  const playerUnitsWithImages = useMemo(() => {
    return battleState.playerUnits.map(player => {
      const charId = player.id;
      const avatarUrl = CHARACTER_IMAGES[charId]?.avatarUrl || CHARACTERS[charId]?.avatarUrl || '';
      const rawName = CHARACTERS[charId]?.name || '未知';
      const name = resolveCharacterDisplayName(rawName, userName);
      return {
        ...player,
        avatarUrl,
        name
      };
    });
  }, [battleState.playerUnits, userName]);

  const sortedEnemiesByPosition = useMemo(() => {
    return [...enemyUnitsWithImages].sort((a, b) => {
      const order: Record<string, number> = { servant: 0, master: 1 };
      const roleOrder = order[a.role] - order[b.role];
      if (roleOrder !== 0) return roleOrder;
      return a.position - b.position;
    });
  }, [enemyUnitsWithImages]);

  const getEnemyLayout = useCallback(() => {
    const enemies = sortedEnemiesByPosition.filter(e => e.isAlive);
    const masters = enemies.filter(e => e.role === 'master');
    const servants = enemies.filter(e => e.role === 'servant');
    
    if (masters.length > 0 && servants.length > 0) {
      return [
        servants[0] || null,
        masters[0] || null,
        servants[1] || null
      ];
    }
    
    return [
      enemies[0] || null,
      enemies[1] || null,
      enemies[2] || null
    ];
  }, [sortedEnemiesByPosition]);

  const currentCharacterSkills = useMemo(() => {
    if (!currentTurnUnit || currentTurnUnit.faction !== Faction.PLAYER) return [];
    const charId = currentTurnUnit.id;
    const character = CHARACTERS[charId];
    if (!character?.battleData?.skills) return [];
    
    return character.battleData.skills
      .filter(skillLearning => characterStats[charId]?.level >= skillLearning.level)
      .map(skillLearning => {
        const skill = SKILLS.find(s => s.id === skillLearning.skillId);
        return skill ? { ...skill, ratio: skillLearning.ratio } : null;
      })
      .filter(Boolean);
  }, [currentTurnUnit, characterStats]);

  const calculateExpGains = useCallback(() => {
    const questExp = quest.rewards?.experience || 0;
    const gains: ExpGainInfo[] = [];
    
    battleParty.forEach((characterId) => {
      if (!characterId) return;
      
      const stat = characterStats[characterId];
      if (!stat) return;
      
      const currentLevel = stat.level || 1;
      const currentExp = stat.exp || 0;
      const currentTotalExp = EXP_TABLE[currentLevel] || 0;
      const nextTotalExp = EXP_TABLE[currentLevel + 1] || currentTotalExp;
      const needExp = Math.max(0, nextTotalExp - currentTotalExp);
      
      const expPercentBefore = needExp > 0 ? Math.min(100, (currentExp / needExp) * 100) : 100;
      
      const finalTotalExp = currentTotalExp + currentExp + questExp;
      let finalLevel = currentLevel;
      for (let lv = currentLevel; lv <= 99; lv++) {
        if (finalTotalExp >= EXP_TABLE[lv + 1]) {
          finalLevel = lv + 1;
        } else {
          break;
        }
      }
      
      const finalNextTotalExp = EXP_TABLE[finalLevel + 1] || EXP_TABLE[finalLevel];
      const finalCurrentTotalExp = EXP_TABLE[finalLevel] || 0;
      const finalNeedExp = Math.max(0, finalNextTotalExp - finalCurrentTotalExp);
      const finalCurrentExp = finalTotalExp - finalCurrentTotalExp;
      
      const expPercentAfter = finalNeedExp > 0 ? Math.min(100, (finalCurrentExp / finalNeedExp) * 100) : 100;
      
      const rawName = CHARACTERS[characterId]?.name || '未知';
      const name = resolveCharacterDisplayName(rawName, userName);
      const avatarUrl = CHARACTER_IMAGES[characterId]?.avatarUrl || CHARACTERS[characterId]?.avatarUrl || '';
      
      gains.push({
        characterId,
        name,
        avatarUrl,
        currentLevel,
        currentExp,
        gainedExp: questExp,
        finalExp: finalTotalExp,
        finalLevel,
        leveledUp: finalLevel > currentLevel,
        expToNextLevel: finalNeedExp,
        expPercentBefore,
        expPercentAfter
      });
    });
    
    return gains;
  }, [quest.rewards?.experience, battleParty, characterStats, userName]);

  useEffect(() => {
    if (endReason === BattleEndReason.VICTORY && battleState.isEnded) {
      const gains = calculateExpGains();
      setExpGains(gains);
      setShowVictoryScreen(true);
      setAnimatingExpIndex(0);
      setCurrentExpPercent(0);
    }
  }, [endReason, battleState.isEnded, calculateExpGains]);

  useEffect(() => {
    if (!showVictoryScreen || expGains.length === 0) return;
    if (animatingExpIndex >= expGains.length) return;
    
    const currentGain = expGains[animatingExpIndex];
    if (!currentGain) return;
    
    const startPercent = currentGain.expPercentBefore;
    const targetPercent = currentGain.expPercentAfter;
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentPercent = startPercent + (targetPercent - startPercent) * easeProgress;
      setCurrentExpPercent(currentPercent);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (currentGain.leveledUp) {
          setShowLevelUp(true);
          setLevelUpCharName(currentGain.name);
          setTimeout(() => {
            setShowLevelUp(false);
            setTimeout(() => {
              if (animatingExpIndex < expGains.length - 1) {
                setAnimatingExpIndex(prev => prev + 1);
                setCurrentExpPercent(0);
              }
            }, 300);
          }, 2000);
        } else {
          setTimeout(() => {
            if (animatingExpIndex < expGains.length - 1) {
              setAnimatingExpIndex(prev => prev + 1);
              setCurrentExpPercent(0);
            }
          }, 500);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showVictoryScreen, expGains, animatingExpIndex]);

  const handleCommandSelect = useCallback((command: PlayerCommand) => {
    setSelectedCommand(command);
    setSelectedTarget(null);
    setSelectedSkill(null);
    
    if (command === PlayerCommand.SKILL) {
      setShowSkillList(true);
    } else if (command === PlayerCommand.ATTACK) {
      const targets = getSelectableTargets(currentTurnUnit!, battleState, SkillScope.ENEMY_SINGLE);
      if (targets.length === 1) {
        onExecuteCommand(command, [targets[0].id]);
        resetCommandState();
      }
    } else if (command === PlayerCommand.GUARD) {
      onExecuteCommand(command);
      resetCommandState();
    } else if (command === PlayerCommand.ESCAPE) {
      onExecuteCommand(command);
      resetCommandState();
    }
  }, [currentTurnUnit, battleState, onExecuteCommand]);

  const handleSkillSelect = useCallback((skillId: number) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill || !currentTurnUnit) return;
    
    const skillForCheck = {
      id: skill.id,
      mpCost: skill.mpCost
    };
    const availability = checkSkillAvailability(currentTurnUnit, skillForCheck as BattleSkillData);
    if (!availability.isAvailable) return;
    
    setSelectedSkill(skillId);
    setShowSkillList(false);
    
    const targets = getSelectableTargets(currentTurnUnit, battleState, skill.scope as SkillScope);
    if (targets.length <= 1) {
      const targetIds = targets.length === 1 ? [targets[0].id] : [];
      onExecuteCommand(PlayerCommand.SKILL, targetIds, skillId);
      resetCommandState();
    }
  }, [currentTurnUnit, battleState, onExecuteCommand]);

  const handleTargetSelect = useCallback((targetId: string) => {
    if (!selectedCommand) return;
    
    if (selectedCommand === PlayerCommand.ATTACK) {
      onExecuteCommand(selectedCommand, [targetId]);
    } else if (selectedCommand === PlayerCommand.SKILL && selectedSkill) {
      onExecuteCommand(selectedCommand, [targetId], selectedSkill);
    }
    resetCommandState();
  }, [selectedCommand, selectedSkill, onExecuteCommand]);

  const resetCommandState = useCallback(() => {
    setSelectedCommand(null);
    setSelectedTarget(null);
    setSelectedSkill(null);
    setShowSkillList(false);
  }, []);

  const handleClose = useCallback(() => {
    onAutoSave();
    onClose();
  }, [onAutoSave, onClose]);

  const renderHpBar = (current: number, max: number) => {
    const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    const colorClass = percent > 50 ? 'bg-emerald-500' : percent > 25 ? 'bg-amber-500' : 'bg-red-500';
    
    return (
      <div className="w-full h-2 md:h-2.5 bg-[#d6cbb8] rounded-full overflow-hidden border border-[#c7bca8] shadow-inner">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  const renderMpBar = (current: number, max: number) => {
    const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    
    return (
      <div className="w-full h-1.5 md:h-2 bg-[#d6cbb8] rounded-full overflow-hidden border border-[#c7bca8] shadow-inner">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  if (!isOpen) return null;

  const enemyLayout = getEnemyLayout();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const isTablet = typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn font-sans">
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />

        <button
          onClick={handleClose}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#382b26]/90 text-[#f0e6d2] hover:bg-[#4a3b32] border border-[#9b7a4c] transition-all flex items-center justify-center shadow-lg"
          title="退出战斗"
        >
          <i className="fa-solid fa-xmark text-sm sm:text-lg" />
        </button>

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-40 bg-[#2c241b]/90 rounded px-2 sm:px-4 py-1.5 sm:py-2 border border-[#9b7a4c] shadow-lg">
          <div className="text-[#f0e6d2] text-xs sm:text-sm font-bold tracking-wide">
            第 {battleState.turnNumber} 回合
          </div>
          <div className="text-[#9b7a4c] text-[10px] sm:text-xs mt-0.5 truncate max-w-[120px] sm:max-w-none">
            {quest.quest_name}
          </div>
        </div>

        {!isMobile && (
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-16 sm:w-20 md:w-28">
            <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
              <div className="bg-[#382b26] px-2 py-1.5 border-b border-[#9b7a4c]">
                <div className="text-[#f0e6d2] text-xs font-bold text-center tracking-wide">
                  顺序
                </div>
              </div>
              
              <div className="max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                {turnOrder.slice(0, isTablet ? 5 : 8).map((unit, index) => {
                  const isCurrentUnit = currentTurnUnit?.id === unit.id;
                  const isPlayer = unit.faction === Faction.PLAYER;
                  const avatarUrl = isPlayer
                    ? CHARACTER_IMAGES[unit.id]?.avatarUrl || CHARACTERS[unit.id]?.avatarUrl || ''
                    : null;
                  const enemyData = !isPlayer ? ENEMIES.find(e => e.id === parseInt(unit.id.split('_')[1])) : null;
                  
                  return (
                    <div
                      key={`${unit.id}-${index}`}
                      className={`flex items-center gap-1 p-1 rounded transition-all ${
                        isCurrentUnit
                          ? 'bg-[#b45309]/30 ring-1 ring-[#fcd34d]'
                          : 'bg-[#e8dfd1]/10'
                      } ${!unit.isAlive ? 'opacity-40' : ''}`}
                    >
                      <div className="text-[8px] text-[#9b7a4c] font-bold w-3 sm:w-4 text-center">
                        {index + 1}
                      </div>
                      
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded overflow-hidden border border-[#9b7a4c]/50 bg-[#e8dfd1]/20 flex-shrink-0">
                        {isPlayer && avatarUrl ? (
                          <img src={resolveImgPath(avatarUrl)} alt="" className="w-full h-full object-cover" />
                        ) : !isPlayer && enemyData ? (
                          <img
                            src={resolveImgPath(`img/quest/${enemyData.battlerName}.png`)}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#9b7a4c] text-[8px] sm:text-xs">
                            <i className={`fa-solid ${isPlayer ? 'fa-user' : 'fa-skull'}`} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-[8px] sm:text-[9px] font-bold truncate ${
                          isPlayer ? 'text-[#f0e6d2]' : 'text-red-300'
                        }`}>
                          {unit.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className={`absolute ${isMobile ? 'top-[15%]' : 'top-1/4'} left-0 right-0 flex justify-center items-end gap-4 sm:gap-8 md:gap-16 px-2 sm:px-4 z-30`}>
          {enemyLayout.map((enemy, index) => {
            if (!enemy) return (
              <div key={`empty-${index}`} className="w-16 sm:w-24 md:w-32 h-20 sm:h-32 md:h-40" />
            );
            
            const isTargetable = selectedCommand && enemy.isAlive;
            const isTargeted = selectedTarget === enemy.id;
            
            return (
              <div
                key={enemy.id}
                className={`relative flex flex-col items-center transition-all duration-300 ${
                  isTargetable ? 'cursor-pointer hover:scale-105' : ''
                } ${isTargeted ? 'ring-2 sm:ring-4 ring-amber-400 rounded-lg' : ''}`}
                onClick={() => isTargetable && handleTargetSelect(enemy.id)}
              >
                {enemy.role === 'master' && (
                  <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-[#b45309] text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold border border-[#fcd34d]/50 shadow-md whitespace-nowrap">
                    <i className="fa-solid fa-crown mr-0.5 sm:mr-1" />BOSS
                  </div>
                )}
                
                <div className={`relative ${enemy.role === 'master' 
                  ? 'w-20 sm:w-28 md:w-36 h-24 sm:h-36 md:h-48' 
                  : 'w-16 sm:w-20 md:w-28 h-20 sm:h-28 md:h-40'}`}>
                  {enemy.isAlive ? (
                    <>
                      <img
                        src={enemy.imageUrl}
                        alt={enemy.name}
                        className={`w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-all ${
                          !enemy.isAlive ? 'opacity-30 grayscale' : ''
                        }`}
                      />
                      <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 w-14 sm:w-20 md:w-28">
                        {renderHpBar(enemy.stats.hp, enemy.stats.maxHp)}
                        <div className="text-center text-[8px] sm:text-[10px] text-white font-bold mt-0.5 drop-shadow-md">
                          {enemy.stats.hp}/{enemy.stats.maxHp}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-2xl sm:text-4xl text-red-500/50 font-bold">✕</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 sm:mt-4 text-center">
                  <div className="text-white text-[10px] sm:text-xs md:text-sm font-bold drop-shadow-md bg-black/40 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[60px] sm:max-w-none">
                    {enemy.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="bg-gradient-to-t from-[#2c241b] via-[#2c241b]/95 to-transparent pt-4 sm:pt-8 pb-2 sm:pb-4 px-2 sm:px-4">
            <div className="flex justify-center gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-4">
              {playerUnitsWithImages.map((player) => {
                const isCurrentTurn = currentTurnUnit?.id === player.id;
                const isDead = !player.isAlive;
                
                return (
                  <div
                    key={player.id}
                    className={`relative w-16 sm:w-20 md:w-28 bg-[#e8dfd1] rounded-lg border-2 shadow-lg transition-all duration-300 ${
                      isCurrentTurn ? 'border-[#b45309] scale-105 ring-2 ring-[#fcd34d]/50' : 'border-[#9b7a4c]'
                    } ${isDead ? 'opacity-50 grayscale' : ''}`}
                  >
                    {isCurrentTurn && (
                      <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 bg-[#b45309] text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-bold shadow-md whitespace-nowrap">
                        行动中
                      </div>
                    )}
                    
                    <div className="p-1 sm:p-1.5 md:p-2">
                      <div className="relative w-full aspect-square rounded overflow-hidden border border-[#c7bca8] mb-1 sm:mb-1.5">
                        <img
                          src={resolveImgPath(player.avatarUrl)}
                          alt={player.name}
                          className={`w-full h-full object-cover ${isDead ? 'opacity-50' : ''}`}
                        />
                        {isDead && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-red-400 text-sm sm:text-xl font-bold">✕</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center text-[10px] sm:text-xs font-bold text-[#382b26] truncate mb-0.5 sm:mb-1">
                        {player.name}
                      </div>
                      
                      <div className="space-y-0.5 sm:space-y-1">
                        <div>
                          <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5c4d45] mb-0.5">
                            <span>HP</span>
                            <span>{player.stats.hp}/{player.stats.maxHp}</span>
                          </div>
                          {renderHpBar(player.stats.hp, player.stats.maxHp)}
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5c4d45] mb-0.5">
                            <span>MP</span>
                            <span>{player.stats.mp}/{player.stats.maxMp}</span>
                          </div>
                          {renderMpBar(player.stats.mp, player.stats.maxMp)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {isPlayerTurn && currentTurnUnit && (
              <div className="flex justify-center">
                <div className="bg-[#e8dfd1] rounded-lg border-2 border-[#9b7a4c] p-1.5 sm:p-2 md:p-3 shadow-lg">
                  {showSkillList ? (
                    <div className="flex flex-col gap-1 sm:gap-1.5 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#d6cbb8]">
                        <span className="text-[10px] sm:text-xs font-bold text-[#382b26]">选择技能</span>
                        <button
                          onClick={() => setShowSkillList(false)}
                          className="text-[#9b7a4c] hover:text-[#382b26] text-xs"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                      {currentCharacterSkills.map((skill) => {
                        if (!skill) return null;
                        const skillForCheck = { id: skill.id, mpCost: skill.mpCost };
                        const availability = checkSkillAvailability(currentTurnUnit, skillForCheck as BattleSkillData);
                        const isDisabled = !availability.isAvailable;
                        
                        return (
                          <button
                            key={skill.id}
                            onClick={() => !isDisabled && handleSkillSelect(skill.id)}
                            disabled={isDisabled}
                            className={`flex items-center justify-between px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs transition-all ${
                              isDisabled
                                ? 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                : 'bg-[#fcfaf7] text-[#382b26] hover:bg-[#f5f0e6] border border-[#d6cbb8] hover:border-[#9b7a4c]'
                            }`}
                          >
                            <span className="font-bold truncate">{skill.name}</span>
                            <span className={`ml-2 flex-shrink-0 ${currentTurnUnit.stats.mp < skill.mpCost ? 'text-red-500' : 'text-cyan-600'}`}>
                              MP {skill.mpCost}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleCommandSelect(PlayerCommand.ATTACK)}
                        className="flex flex-col items-center justify-center w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-14 bg-[#382b26] text-[#f0e6d2] rounded-lg border border-2 sm:border-2 border-[#9b7a4c] hover:bg-[#4a3b32] hover:scale-105 transition-all shadow-md"
                      >
                        <i className="fa-solid fa-sword text-xs sm:text-sm md:text-base mb-0.5" />
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold">攻击</span>
                      </button>
                      
                      <button
                        onClick={() => handleCommandSelect(PlayerCommand.SKILL)}
                        className="flex flex-col items-center justify-center w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-14 bg-[#382b26] text-[#f0e6d2] rounded-lg border border-2 sm:border-2 border-[#9b7a4c] hover:bg-[#4a3b32] hover:scale-105 transition-all shadow-md"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles text-xs sm:text-sm md:text-base mb-0.5" />
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold">技能</span>
                      </button>
                      
                      <button
                        onClick={() => handleCommandSelect(PlayerCommand.ITEM)}
                        disabled
                        className="flex flex-col items-center justify-center w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-14 bg-[#d6cbb8] text-[#8c7b70] rounded-lg border border-2 sm:border-2 border-[#c7bca8] cursor-not-allowed opacity-60 shadow-md"
                      >
                        <i className="fa-solid fa-bag-shopping text-xs sm:text-sm md:text-base mb-0.5" />
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold">道具</span>
                      </button>
                      
                      <button
                        onClick={() => handleCommandSelect(PlayerCommand.GUARD)}
                        className="flex flex-col items-center justify-center w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-14 bg-[#382b26] text-[#f0e6d2] rounded-lg border border-2 sm:border-2 border-[#9b7a4c] hover:bg-[#4a3b32] hover:scale-105 transition-all shadow-md"
                      >
                        <i className="fa-solid fa-shield-halved text-xs sm:text-sm md:text-base mb-0.5" />
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold">防御</span>
                      </button>
                      
                      <button
                        onClick={() => handleCommandSelect(PlayerCommand.ESCAPE)}
                        className="flex flex-col items-center justify-center w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-14 bg-[#382b26] text-[#f0e6d2] rounded-lg border border-2 sm:border-2 border-[#9b7a4c] hover:bg-[#4a3b32] hover:scale-105 transition-all shadow-md"
                      >
                        <i className="fa-solid fa-person-running text-xs sm:text-sm md:text-base mb-0.5" />
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold">逃跑</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-20 md:w-28">
          <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
            <div className="bg-[#382b26] px-2 py-1.5 border-b border-[#9b7a4c]">
              <div className="text-[#f0e6d2] text-xs font-bold text-center tracking-wide">
                行动顺序
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
              {turnOrder.slice(0, 8).map((unit, index) => {
                const isCurrentUnit = currentTurnUnit?.id === unit.id;
                const isPlayer = unit.faction === Faction.PLAYER;
                const avatarUrl = isPlayer
                  ? CHARACTER_IMAGES[unit.id]?.avatarUrl || CHARACTERS[unit.id]?.avatarUrl || ''
                  : null;
                const enemyData = !isPlayer ? ENEMIES.find(e => e.id === parseInt(unit.id.split('_')[1])) : null;
                
                return (
                  <div
                    key={`${unit.id}-${index}`}
                    className={`flex items-center gap-1.5 p-1 rounded transition-all ${
                      isCurrentUnit
                        ? 'bg-[#b45309]/30 ring-1 ring-[#fcd34d]'
                        : 'bg-[#e8dfd1]/10'
                    } ${!unit.isAlive ? 'opacity-40' : ''}`}
                  >
                    <div className="text-[8px] text-[#9b7a4c] font-bold w-4 text-center">
                      {index + 1}
                    </div>
                    
                    <div className="w-6 h-6 rounded overflow-hidden border border-[#9b7a4c]/50 bg-[#e8dfd1]/20 flex-shrink-0">
                      {isPlayer && avatarUrl ? (
                        <img src={resolveImgPath(avatarUrl)} alt="" className="w-full h-full object-cover" />
                      ) : !isPlayer && enemyData ? (
                        <img
                          src={resolveImgPath(`img/quest/${enemyData.battlerName}.png`)}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9b7a4c] text-xs">
                          <i className={`fa-solid ${isPlayer ? 'fa-user' : 'fa-skull'}`} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-[9px] font-bold truncate ${
                        isPlayer ? 'text-[#f0e6d2]' : 'text-red-300'
                      }`}>
                        {unit.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {!isMobile && battleState.battleLog.length > 0 && (
          <div className="absolute left-2 sm:left-4 bottom-28 sm:bottom-32 z-40 w-48 sm:w-64 md:w-80">
            <div className="bg-[#2c241b]/90 rounded-lg border border-[#9b7a4c] shadow-lg overflow-hidden">
              <div className="bg-[#382b26] px-2 sm:px-3 py-1 sm:py-1.5 border-b border-[#9b7a4c]">
                <div className="text-[#f0e6d2] text-[10px] sm:text-xs font-bold tracking-wide">
                  战斗日志
                </div>
              </div>
              
              <div className="max-h-24 sm:max-h-32 overflow-y-auto custom-scrollbar p-1.5 sm:p-2 space-y-1">
                {battleState.battleLog.slice(-5).reverse().map((log, index) => (
                  <div
                    key={`log-${index}`}
                    className="text-[9px] sm:text-[10px] text-[#f0e6d2]/80 leading-relaxed"
                  >
                    <span className="text-[#9b7a4c]">[{log.turn}]</span> {log.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {battleState.isEnded && endReason && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-2 sm:p-4">
            {endReason === BattleEndReason.VICTORY && showVictoryScreen ? (
              <div className="bg-[#e8dfd1] rounded-xl border-2 sm:border-4 border-[#9b7a4c] p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600 mb-1 sm:mb-2">
                    <i className="fa-solid fa-trophy text-amber-500 mr-1 sm:mr-2" />
                    战斗胜利！
                  </div>
                  <div className="text-[#382b26] text-xs sm:text-sm">
                    成功击败了所有敌人
                  </div>
                </div>
                
                <div className="bg-[#2c241b] rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="text-[#f0e6d2] text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                    <i className="fa-solid fa-star text-amber-400" />
                    经验值结算
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {expGains.map((gain, index) => {
                      const isCurrentAnimating = index === animatingExpIndex;
                      const isCompleted = index < animatingExpIndex;
                      const displayPercent = isCurrentAnimating ? currentExpPercent : (isCompleted ? gain.expPercentAfter : gain.expPercentBefore);
                      const displayLevel = isCompleted ? gain.finalLevel : gain.currentLevel;
                      
                      return (
                        <div
                          key={gain.characterId}
                          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg transition-all ${
                            isCurrentAnimating ? 'bg-[#382b26]/50 ring-1 ring-[#9b7a4c]' : ''
                          }`}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded overflow-hidden border border-[#9b7a4c] flex-shrink-0">
                            <img src={resolveImgPath(gain.avatarUrl)} alt={gain.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                              <span className="text-[#f0e6d2] text-xs sm:text-sm font-bold truncate">{gain.name}</span>
                              <span className="text-amber-400 text-[10px] sm:text-xs font-bold ml-1">
                                Lv.{displayLevel}
                              </span>
                            </div>
                            
                            <div className="relative h-1.5 sm:h-2 bg-[#1a1512] rounded-full overflow-hidden">
                              <div
                                className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-100"
                                style={{ width: `${displayPercent}%` }}
                              />
                            </div>
                            
                            <div className="flex justify-between mt-0.5">
                              <span className="text-[#9b7a4c] text-[8px] sm:text-[10px]">
                                +{gain.gainedExp} EXP
                              </span>
                              <span className="text-[#8c7b70] text-[8px] sm:text-[10px]">
                                {displayPercent.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleClose}
                    className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#382b26] text-[#f0e6d2] rounded-lg border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all font-bold text-sm sm:text-base"
                  >
                    确认
                  </button>
                </div>
              </div>
            ) : endReason === BattleEndReason.ESCAPED ? (
              <div className="bg-[#e8dfd1] rounded-xl border-2 sm:border-4 border-[#9b7a4c] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center mx-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600 mb-3 sm:mb-4">
                  <i className="fa-solid fa-person-running mr-1 sm:mr-2" />
                  成功逃脱！
                </div>
                
                <div className="text-[#382b26] mb-4 sm:mb-6 text-sm sm:text-base">
                  成功脱离了战斗
                </div>
                
                <button
                  onClick={handleClose}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#382b26] text-[#f0e6d2] rounded-lg border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all font-bold text-sm sm:text-base"
                >
                  确认
                </button>
              </div>
            ) : (
              <div className="bg-[#e8dfd1] rounded-xl border-2 sm:border-4 border-[#9b7a4c] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center mx-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-3 sm:mb-4">
                  <i className="fa-solid fa-skull mr-1 sm:mr-2" />
                  战败...
                </div>
                
                <div className="text-[#382b26] mb-4 sm:mb-6 text-sm sm:text-base">
                  队伍全灭，战斗失败...
                </div>
                
                <button
                  onClick={handleClose}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#382b26] text-[#f0e6d2] rounded-lg border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all font-bold text-sm sm:text-base"
                >
                  确认
                </button>
              </div>
            )}
          </div>
        )}

        {showLevelUp && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-b from-amber-500/90 to-amber-600/90 rounded-xl px-4 sm:px-8 py-4 sm:py-6 shadow-[0_0_40px_sm:60px_rgba(251,191,36,0.6)] animate-bounce">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                  <i className="fa-solid fa-arrow-up mr-1 sm:mr-2" />
                  LEVEL UP!
                </div>
                <div className="text-white text-sm sm:text-lg font-bold">
                  {levelUpCharName}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleScene;
