import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BattleState,
  BattleUnit,
  Faction,
  SkillData as BattleSkillData,
  BattleLogEntry,
  SkillScope
} from '../battle-system/types';
import {
  BattleManager,
  createBattleManager,
  ActionExecutionResult
} from '../battle-system/BattleManager';
import { createPlayerBattleUnit } from '../battle-system/player-unit-factory';
import { createEnemyBattleUnit } from '../battle-system/enemy-unit-factory';
import { 
  PlayerCommand, 
  BattleEndReason, 
  getSelectableTargets, 
  executeEscapeCommand,
  executeItemUse,
  getItemSelectableTargets,
  ItemUseResult
} from '../battle-system/player-commands';
import { SKILLS, SkillData } from '../data/battle-data/skills';
import { QuestList, BattlePartySlots, CharacterStat, CharacterEquipment } from '../types';
import { makeAllyDecision, BattleAI, AIDecisionContext } from '../battle-system/ai';
import { CHARACTERS } from '../data/scenarioData';
import { ITEMS } from '../data/items';

function toBattleSkillData(skill: SkillData): BattleSkillData {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    scope: skill.scope as SkillScope,
    mpCost: skill.mpCost,
    damage: skill.damage,
    effects: skill.effects,
    speed: skill.speed,
    successRate: skill.successRate,
    repeats: skill.repeats ?? 1,
    hitType: skill.hitType,
    note: skill.note
  };
}

interface UseBattleSystemOptions {
  battleParty: BattlePartySlots;
  characterStats: Record<string, CharacterStat>;
  characterEquipments: Record<string, CharacterEquipment>;
  userName: string;
}

interface UseBattleSystemReturn {
  isOpen: boolean;
  battleState: BattleState | null;
  currentTurnUnit: BattleUnit | null;
  turnOrder: BattleUnit[];
  endReason: BattleEndReason | null;
  quest: QuestList | null;
  
  startBattle: (quest: QuestList) => void;
  closeBattle: () => void;
  onExecuteCommand: (command: PlayerCommand, targetIds?: string[], skillId?: number, itemId?: string) => void;
}

export function useBattleSystem(options: UseBattleSystemOptions): UseBattleSystemReturn {
  const { battleParty, characterStats, characterEquipments, userName } = options;
  
  const [isOpen, setIsOpen] = useState(false);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [currentTurnUnit, setCurrentTurnUnit] = useState<BattleUnit | null>(null);
  const [turnOrder, setTurnOrder] = useState<BattleUnit[]>([]);
  const [endReason, setEndReason] = useState<BattleEndReason | null>(null);
  const [quest, setQuest] = useState<QuestList | null>(null);
  
  const managerRef = useRef<BattleManager | null>(null);
  
  const startBattle = useCallback((questData: QuestList) => {
    const manager = createBattleManager();
    managerRef.current = manager;
    
    const playerUnits: BattleUnit[] = [];
    const partyMembers = battleParty.filter((id): id is string => id !== null);
    
    partyMembers.forEach((characterId, index) => {
      const stats = characterStats[characterId] || { level: 1, affinity: 0, exp: 0 };
      const equipment = characterEquipments[characterId] || {
        weaponId: null,
        armorId: null,
        accessory1Id: null,
        accessory2Id: null
      };
      
      const unit = createPlayerBattleUnit({
        characterId,
        level: stats.level,
        position: index,
        equipment
      });
      if (unit) {
        playerUnits.push(unit);
      }
    });
    
    if (playerUnits.length === 0) {
      console.error('No valid player units for battle');
      return;
    }
    
    const enemyUnits: BattleUnit[] = [];
    const battleConfig = questData.battle_config;
    
    battleConfig.enemies.forEach((enemyConfig) => {
      const unit = createEnemyBattleUnit({
        enemyConfig,
        enemyLevel: questData.enemy_level
      });
      if (unit) {
        enemyUnits.push(unit);
      }
    });
    
    if (enemyUnits.length === 0) {
      console.error('No valid enemy units for battle');
      return;
    }
    
    const initialState = manager.initializeBattle({
      playerUnits,
      enemyUnits
    });
    
    setBattleState(initialState);
    setQuest(questData);
    setEndReason(null);
    setIsOpen(true);
    
    const actionQueue = manager.startTurn();
    setTurnOrder(actionQueue);
    
    if (actionQueue.length > 0) {
      setCurrentTurnUnit(actionQueue[0]);
    }
  }, [battleParty, characterStats, characterEquipments]);
  
  const closeBattle = useCallback(() => {
    setIsOpen(false);
    setBattleState(null);
    setCurrentTurnUnit(null);
    setTurnOrder([]);
    setEndReason(null);
    setQuest(null);
    managerRef.current = null;
  }, []);
  
  const processNextTurn = useCallback(() => {
    const manager = managerRef.current;
    if (!manager || !battleState) return;
    
    if (manager.hasMoreActions()) {
      const nextUnit = manager.getCurrentUnit();
      setCurrentTurnUnit(nextUnit);
      
      if (nextUnit && nextUnit.faction === Faction.ENEMY) {
        setTimeout(() => {
          processEnemyTurn();
        }, 500);
      } else if (nextUnit && nextUnit.faction === Faction.PLAYER) {
        const leaderId = battleParty[0];
        const isPlayerControlled = nextUnit.id === leaderId || (nextUnit as any).characterId === leaderId;
        
        if (!isPlayerControlled) {
          setTimeout(() => {
            processAllyTurn();
          }, 500);
        }
      }
    } else {
      const turnResult = manager.endTurn();
      setBattleState({ ...manager.getState()! });
      
      if (turnResult.battleEnded) {
        const winner = turnResult.winner;
        if (winner === 'player') {
          setEndReason(BattleEndReason.VICTORY);
        } else {
          setEndReason(BattleEndReason.DEFEAT);
        }
      } else {
        const actionQueue = manager.startTurn();
        setTurnOrder(actionQueue);
        
        if (actionQueue.length > 0) {
          setCurrentTurnUnit(actionQueue[0]);
          
          if (actionQueue[0].faction === Faction.ENEMY) {
            setTimeout(() => {
              processEnemyTurn();
            }, 500);
          } else if (actionQueue[0].faction === Faction.PLAYER) {
            const leaderId = battleParty[0];
            const isPlayerControlled = actionQueue[0].id === leaderId || (actionQueue[0] as any).characterId === leaderId;
            
            if (!isPlayerControlled) {
              setTimeout(() => {
                processAllyTurn();
              }, 500);
            }
          }
        }
      }
    }
  }, [battleState, battleParty]);
  
  const processEnemyTurn = useCallback(() => {
    const manager = managerRef.current;
    if (!manager || !battleState) return;
    
    const currentUnit = manager.getCurrentUnit();
    if (!currentUnit || currentUnit.faction !== Faction.ENEMY) return;
    
    const basicAttack = SKILLS.find(s => s.id === 1);
    if (!basicAttack) {
      manager.skipCurrentAction();
      processNextTurn();
      return;
    }
    
    const aliveTargets = battleState.playerUnits.filter(u => u.isAlive);
    if (aliveTargets.length === 0) {
      manager.skipCurrentAction();
      processNextTurn();
      return;
    }
    
    const randomTarget = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
    
    const result = manager.processNextAction(toBattleSkillData(basicAttack), [randomTarget.id]);
    setBattleState({ ...manager.getState()! });
    
    if (result.battleEnded) {
      if (result.winner === Faction.PLAYER) {
        setEndReason(BattleEndReason.VICTORY);
      } else {
        setEndReason(BattleEndReason.DEFEAT);
      }
    } else {
      processNextTurn();
    }
  }, [battleState, processNextTurn]);
  
  const processAllyTurn = useCallback(() => {
    const manager = managerRef.current;
    if (!manager || !battleState) return;
    
    const currentUnit = manager.getCurrentUnit();
    if (!currentUnit || currentUnit.faction !== Faction.PLAYER) return;
    
    const leaderId = battleParty[0];
    const isPlayerControlled = currentUnit.id === leaderId || (currentUnit as any).characterId === leaderId;
    if (isPlayerControlled) return;
    
    const charId = (currentUnit as any).characterId || currentUnit.id;
    const character = CHARACTERS[charId];
    
    if (!character?.battleData?.skills) {
      const basicAttack = SKILLS.find(s => s.id === 1);
      if (basicAttack) {
        const aliveTargets = battleState.enemyUnits.filter(u => u.isAlive);
        if (aliveTargets.length > 0) {
          const randomTarget = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
          const result = manager.processNextAction(toBattleSkillData(basicAttack), [randomTarget.id]);
          setBattleState({ ...manager.getState()! });
          
          if (result.battleEnded) {
            if (result.winner === Faction.PLAYER) {
              setEndReason(BattleEndReason.VICTORY);
            } else {
              setEndReason(BattleEndReason.DEFEAT);
            }
            return;
          }
        }
      }
      processNextTurn();
      return;
    }
    
    const availableActions = character.battleData.skills
      .filter(skillLearning => currentUnit.level >= skillLearning.level)
      .map(skillLearning => {
        const skill = SKILLS.find(s => s.id === skillLearning.skillId);
        return skill ? { 
          skillId: skill.id, 
          rating: 5,
          conditionType: 0,
          conditionParam1: 0,
          conditionParam2: 0,
          source: 'player' as const
        } : null;
      })
      .filter(Boolean) as Array<{ 
        skillId: number; 
        rating: number;
        conditionType: number;
        conditionParam1: number;
        conditionParam2: number;
        source: 'player'
      }>;
    
    const skillMap = new Map<number, BattleSkillData>();
    SKILLS.forEach(skill => skillMap.set(skill.id, toBattleSkillData(skill)));
    
    const aiContext: AIDecisionContext = {
      unit: currentUnit,
      turnNumber: battleState.turnNumber,
      playerUnits: battleState.playerUnits,
      enemyUnits: battleState.enemyUnits,
      availableActions,
      skillMap,
      switches: new Map(),
      variables: new Map()
    };
    
    const decision = makeAllyDecision(aiContext);
    
    if (decision.isGuard) {
      manager.processGuardAction();
      setBattleState({ ...manager.getState()! });
      processNextTurn();
      return;
    }
    
    if (decision.skill && decision.targetIds.length > 0) {
      const result = manager.processNextAction(decision.skill, decision.targetIds);
      setBattleState({ ...manager.getState()! });
      
      if (result.battleEnded) {
        if (result.winner === Faction.PLAYER) {
          setEndReason(BattleEndReason.VICTORY);
        } else {
          setEndReason(BattleEndReason.DEFEAT);
        }
        return;
      }
    } else {
      manager.skipCurrentAction();
    }
    
    processNextTurn();
  }, [battleState, battleParty, processNextTurn]);
  
  const onExecuteCommand = useCallback((
    command: PlayerCommand,
    targetIds?: string[],
    skillId?: number,
    itemId?: string
  ) => {
    const manager = managerRef.current;
    if (!manager || !battleState || !currentTurnUnit) return;
    
    if (currentTurnUnit.faction !== Faction.PLAYER) return;
    
    let result: ActionExecutionResult | null = null;
    
    switch (command) {
      case PlayerCommand.ATTACK: {
        const attackSkill = SKILLS.find(s => s.id === 1);
        if (attackSkill && targetIds) {
          result = manager.processNextAction(toBattleSkillData(attackSkill), targetIds);
        }
        break;
      }
      
      case PlayerCommand.SKILL: {
        if (skillId !== undefined) {
          const skill = SKILLS.find(s => s.id === skillId);
          if (skill) {
            result = manager.processNextAction(toBattleSkillData(skill), targetIds);
          }
        }
        break;
      }
      
      case PlayerCommand.GUARD: {
        result = manager.processGuardAction();
        break;
      }
      
      case PlayerCommand.ESCAPE: {
        const escapeResult = executeEscapeCommand(currentTurnUnit, battleState);
        if (escapeResult.success) {
          setEndReason(BattleEndReason.ESCAPED);
          setBattleState(prev => prev ? { ...prev, isEnded: true } : null);
          return;
        }
        manager.skipCurrentAction();
        processNextTurn();
        return;
      }
      
      case PlayerCommand.ITEM: {
        if (itemId && targetIds && targetIds.length > 0) {
          const target = battleState.playerUnits.find(u => u.id === targetIds[0]);
          if (target) {
            const itemResult = executeItemUse(currentTurnUnit, target, itemId, battleState);
            
            for (const log of itemResult.logEntries) {
              battleState.battleLog.push(log);
            }
            
            setBattleState({ ...manager.getState()! });
            manager.skipCurrentAction();
            processNextTurn();
            return;
          }
        }
        manager.skipCurrentAction();
        processNextTurn();
        return;
      }
      
      default:
        manager.skipCurrentAction();
    }
    
    if (result) {
      setBattleState({ ...manager.getState()! });
      
      if (result.battleEnded) {
        if (result.winner === Faction.PLAYER) {
          setEndReason(BattleEndReason.VICTORY);
        } else {
          setEndReason(BattleEndReason.DEFEAT);
        }
      } else {
        processNextTurn();
      }
    }
  }, [battleState, currentTurnUnit, processNextTurn]);
  
  return {
    isOpen,
    battleState,
    currentTurnUnit,
    turnOrder,
    endReason,
    quest,
    startBattle,
    closeBattle,
    onExecuteCommand
  };
}
