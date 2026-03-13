import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  BattleUnit, BattleState, Faction, SkillScope, SkillData as BattleSkillData, SkillScope as BattleSkillScope
} from '../../battle-system/types';
import { PlayerCommand, getSelectableTargets, checkSkillAvailability, BattleEndReason } from '../../battle-system/player-commands';
import { ENEMIES } from '../../data/battle-data/enemies';
import { CHARACTERS } from '../../data/scenarioData';
import { CHARACTER_IMAGES } from '../../data/resources/characterImageResources';
import { resolveImgPath } from '../../utils/imagePath';
import { resolveCharacterDisplayName } from '../../utils/playerText';
import { QuestList, BattlePartySlots, CharacterStat, CharacterEquipment } from '../../types';
import { SKILLS, SkillData } from '../../data/battle-data/skills';
import { EXP_TABLE } from '../../data/battle-data/exp_table';

import {
  EnemyArea,
  PlayerCards,
  CommandMenu,
  SkillList,
  EscapeConfirmModal,
  DamagePopup,
  BattleCursor,
  TurnOrderPanel,
  BattleLog,
  VictoryScreen,
  ResultScreen,
  GaugeBar,
  ExpGainInfo,
  EnemyUnitWithImage,
  PlayerUnitWithImage,
  SkillWithAvailability,
  DamagePopupData,
  DamagePopupType,
} from './BattleSceneModules';

interface BattleSceneProps {
  isOpen: boolean;
  onClose: () => void;
  quest: QuestList;
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
  const [showSkillOverlay, setShowSkillOverlay] = useState(false);
  const [showEscapeConfirm, setShowEscapeConfirm] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [expGains, setExpGains] = useState<ExpGainInfo[]>([]);
  const [animatingExpIndex, setAnimatingExpIndex] = useState(0);
  const [currentExpPercent, setCurrentExpPercent] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpCharId, setLevelUpCharId] = useState<string | null>(null);
  const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false });
  const animationRef = useRef<number | null>(null);
  
  const [isLeaderCriticalHit, setIsLeaderCriticalHit] = useState(false);
  const [isLeaderDead, setIsLeaderDead] = useState(false);
  const prevBattleLogLengthRef = useRef<number>(0);

  const isPlayerTurn = currentTurnUnit?.faction === Faction.PLAYER;
  
  const leaderUnitId = battleParty[0];
  const leaderUnit = useMemo(() => {
    return battleState.playerUnits.find(u => u.id === leaderUnitId) || null;
  }, [battleState.playerUnits, leaderUnitId]);

  const backgroundImage = useMemo(() => {
    return resolveImgPath(`img/bg/dungeon/${quest.background_image}`);
  }, [quest.background_image]);

  const enemyUnitsWithImages: EnemyUnitWithImage[] = useMemo(() => {
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

  const playerUnitsWithImages: PlayerUnitWithImage[] = useMemo(() => {
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

  const currentCharacterSkills: SkillWithAvailability[] = useMemo(() => {
    if (!currentTurnUnit || currentTurnUnit.faction !== Faction.PLAYER) return [];
    const charId = currentTurnUnit.id;
    const character = CHARACTERS[charId];
    if (!character?.battleData?.skills) return [];
    
    return character.battleData.skills
      .filter(skillLearning => characterStats[charId]?.level >= skillLearning.level)
      .map(skillLearning => {
        const skill = SKILLS.find(s => s.id === skillLearning.skillId);
        if (!skill) return null;
        
        const skillForCheck = { id: skill.id, mpCost: skill.mpCost };
        const availability = checkSkillAvailability(currentTurnUnit, skillForCheck as BattleSkillData);
        
        return {
          id: skill.id,
          name: skill.name,
          mpCost: skill.mpCost,
          description: skill.description,
          scope: skill.scope,
          isAvailable: availability.isAvailable,
          reason: availability.reason
        };
      })
      .filter(Boolean) as SkillWithAvailability[];
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
    if (!leaderUnit) return;
    const wasDead = isLeaderDead;
    const isNowDead = !leaderUnit.isAlive;
    
    if (!wasDead && isNowDead) {
      setIsLeaderDead(true);
    } else if (wasDead && !isNowDead) {
      setIsLeaderDead(false);
    }
  }, [leaderUnit?.isAlive]);

  useEffect(() => {
    if (!leaderUnitId) return;
    
    const currentLogLength = battleState.battleLog.length;
    if (currentLogLength > prevBattleLogLengthRef.current) {
      const newLogs = battleState.battleLog.slice(prevBattleLogLengthRef.current);
      
      for (const log of newLogs) {
        if (log.type === 'damage' && log.target) {
          const targetUnit = battleState.playerUnits.find(u => u.name === log.target);
          if (targetUnit && targetUnit.id === leaderUnitId) {
            const isCritical = log.description.includes('暴击') || (log.details && (log.details as any)?.isCritical);
            if (isCritical) {
              setIsLeaderCriticalHit(true);
              setTimeout(() => setIsLeaderCriticalHit(false), 500);
              break;
            }
          }
        }
      }
    }
    
    prevBattleLogLengthRef.current = currentLogLength;
  }, [battleState.battleLog, leaderUnitId, battleState.playerUnits]);

  useEffect(() => {
    if (!leaderUnit) return;
    const wasDead = isLeaderDead;
    const isNowDead = !leaderUnit.isAlive;
    
    if (!wasDead && isNowDead) {
      setIsLeaderDead(true);
    } else if (wasDead && !isNowDead) {
      setIsLeaderDead(false);
    }
  }, [leaderUnit?.isAlive]);

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
          setLevelUpCharId(currentGain.characterId);
          setTimeout(() => {
            setShowLevelUp(false);
            setLevelUpCharId(null);
            setTimeout(() => {
              if (animatingExpIndex < expGains.length - 1) {
                setAnimatingExpIndex(prev => prev + 1);
                setCurrentExpPercent(0);
              }
            }, 300);
          }, 1500);
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

  const showDamagePopup = useCallback((x: number, y: number, value: number, type: DamagePopupType) => {
    const id = `damage-${Date.now()}-${Math.random()}`;
    setDamagePopups(prev => [...prev, { id, value, type, x, y }]);
  }, []);

  const removeDamagePopup = useCallback((id: string) => {
    setDamagePopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleCommandSelect = useCallback((command: PlayerCommand) => {
    setSelectedCommand(command);
    setSelectedTarget(null);
    setSelectedSkill(null);
    
    if (command === PlayerCommand.ATTACK) {
      const targets = getSelectableTargets(currentTurnUnit!, battleState, SkillScope.ENEMY_SINGLE);
      if (targets.length === 1) {
        onExecuteCommand(command, [targets[0].id]);
        resetCommandState();
      }
    } else if (command === PlayerCommand.GUARD) {
      onExecuteCommand(command);
      resetCommandState();
    }
  }, [currentTurnUnit, battleState, onExecuteCommand]);

  const handleSkillSelect = useCallback((skillId: number) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill || !currentTurnUnit) return;
    
    const skillForCheck = { id: skill.id, mpCost: skill.mpCost };
    const availability = checkSkillAvailability(currentTurnUnit, skillForCheck as BattleSkillData);
    if (!availability.isAvailable) return;
    
    setSelectedSkill(skillId);
    setShowSkillOverlay(false);
    
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

  const handleEscapeConfirm = useCallback(() => {
    setShowEscapeConfirm(false);
    onExecuteCommand(PlayerCommand.ESCAPE);
    resetCommandState();
  }, [onExecuteCommand]);

  const resetCommandState = useCallback(() => {
    setSelectedCommand(null);
    setSelectedTarget(null);
    setSelectedSkill(null);
    setShowSkillOverlay(false);
    setShowEscapeConfirm(false);
  }, []);

  const handleClose = useCallback(() => {
    onAutoSave();
    onClose();
  }, [onAutoSave, onClose]);

  if (!isOpen) return null;

  const enemyLayout = getEnemyLayout();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const isTablet = typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false;
  
  const isAllyTargeting = useMemo(() => {
    if (!selectedCommand || selectedCommand !== PlayerCommand.SKILL || !selectedSkill) {
      return false;
    }
    const skill = SKILLS.find(s => s.id === selectedSkill);
    if (!skill) return false;
    const allyScopes = [
      SkillScope.ALLY_SINGLE,
      SkillScope.ALLY_ALL,
      SkillScope.ALLY_ALL_CONTINUOUS,
      SkillScope.SELF,
      SkillScope.SELF_AFFECT_ALLY_ALL
    ];
    return allyScopes.includes(skill.scope as SkillScope);
  }, [selectedCommand, selectedSkill]);
  
  const isReviveTargeting = useMemo(() => {
    if (!selectedCommand || selectedCommand !== PlayerCommand.SKILL || !selectedSkill) {
      return false;
    }
    const skill = SKILLS.find(s => s.id === selectedSkill);
    if (!skill) return false;
    return skill.scope === 9;
  }, [selectedCommand, selectedSkill]);
  
  const isEnemyTargeting = useMemo(() => {
    if (selectedCommand === PlayerCommand.ATTACK) return true;
    if (!selectedCommand || selectedCommand !== PlayerCommand.SKILL || !selectedSkill) {
      return false;
    }
    const skill = SKILLS.find(s => s.id === selectedSkill);
    if (!skill) return false;
    const enemyScopes = [
      SkillScope.ENEMY_SINGLE,
      SkillScope.ENEMY_ALL,
      SkillScope.ENEMY_ALL_CONTINUOUS
    ];
    return enemyScopes.includes(skill.scope as SkillScope);
  }, [selectedCommand, selectedSkill]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn font-sans">
      <div 
        className={`relative w-full h-full overflow-hidden ${isLeaderCriticalHit ? 'animate-screen-shake' : ''}`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {isLeaderDead && (
          <div className="absolute inset-0 bg-gray-500/50 z-[5]" style={{ mixBlendMode: 'saturation' }} />
        )}
        
        <div className={`absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10 ${isLeaderCriticalHit ? 'animate-flash-white' : ''}`} />
        <div className={`absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 mix-blend-multiply pointer-events-none z-10 ${isLeaderCriticalHit ? 'animate-flash-white' : ''}`} />

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-40 bg-[#2c241b]/90 rounded px-2 sm:px-4 py-1.5 sm:py-2 border border-[#9b7a4c] shadow-lg">
          <div className="text-[#f0e6d2] text-xs sm:text-sm font-bold tracking-wide">
            第 {battleState.turnNumber} 回合
          </div>
          <div className="text-[#9b7a4c] text-[10px] sm:text-xs mt-0.5 truncate max-w-[120px] sm:max-w-none">
            {quest.quest_name}
          </div>
        </div>

        <TurnOrderPanel
          turnOrder={turnOrder}
          currentTurnUnitId={currentTurnUnit?.id || null}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        <EnemyArea
          enemies={enemyLayout}
          selectedCommand={selectedCommand}
          selectedTarget={selectedTarget}
          onTargetSelect={handleTargetSelect}
          isMobile={isMobile}
          isEnemyTargeting={isEnemyTargeting}
        />

        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="bg-gradient-to-t from-[#2c241b] via-[#2c241b]/95 to-transparent pt-4 sm:pt-8 pb-2 sm:pb-4 px-2 sm:px-4">
            <PlayerCards
              players={playerUnitsWithImages}
              currentTurnUnitId={currentTurnUnit?.id || null}
              resolveImgPath={resolveImgPath}
              isMobile={isMobile}
              selectedCommand={selectedCommand}
              selectedTarget={selectedTarget}
              onTargetSelect={handleTargetSelect}
              isAllyTargeting={isAllyTargeting}
              isReviveTargeting={isReviveTargeting}
            />

            <CommandMenu
              isPlayerTurn={isPlayerTurn}
              currentTurnUnitFaction={currentTurnUnit?.faction || null}
              selectedCommand={selectedCommand}
              onCommandSelect={handleCommandSelect}
              onSkillClick={() => setShowSkillOverlay(true)}
              onEscapeClick={() => setShowEscapeConfirm(true)}
              isMobile={isMobile}
            />
          </div>
        </div>

        <BattleLog
          logs={battleState.battleLog.map(log => ({ turn: log.turn, description: log.description }))}
          isMobile={isMobile}
        />

        {showSkillOverlay && (
          <SkillList
            skills={currentCharacterSkills}
            currentMp={currentTurnUnit?.stats.mp || 0}
            onSkillSelect={handleSkillSelect}
            onClose={() => setShowSkillOverlay(false)}
          />
        )}

        {showEscapeConfirm && (
          <EscapeConfirmModal
            isOpen={showEscapeConfirm}
            onConfirm={handleEscapeConfirm}
            onCancel={() => setShowEscapeConfirm(false)}
          />
        )}

        {damagePopups.map(popup => (
          <DamagePopup
            key={popup.id}
            popup={popup}
            onAnimationEnd={removeDamagePopup}
          />
        ))}

        <BattleCursor
          x={cursorPosition.x}
          y={cursorPosition.y}
          visible={cursorPosition.visible}
        />

        {battleState.isEnded && endReason && (
          <>
            {endReason === BattleEndReason.VICTORY && showVictoryScreen && (
              <VictoryScreen
                expGains={expGains}
                onClose={handleClose}
              />
            )}
            {(endReason === BattleEndReason.ESCAPED || endReason === BattleEndReason.DEFEAT) && (
              <ResultScreen
                endReason={endReason}
                onClose={handleClose}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BattleScene;
