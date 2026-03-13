import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BattleState,
  BattleUnit,
  Faction,
  SkillData,
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
import { PlayerCommand, BattleEndReason, getSelectableTargets } from '../battle-system/player-commands';
import { SKILLS } from '../data/battle-data/skills';
import { QuestList, BattlePartySlots, CharacterStat, CharacterEquipment } from '../types';

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
          }
        }
      }
    }
  }, [battleState]);
  
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
    
    const result = manager.processNextAction(basicAttack, [randomTarget.id]);
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
          result = manager.processNextAction(attackSkill, targetIds);
        }
        break;
      }
      
      case PlayerCommand.SKILL: {
        if (skillId !== undefined) {
          const skill = SKILLS.find(s => s.id === skillId);
          if (skill) {
            result = manager.processNextAction(skill, targetIds);
          }
        }
        break;
      }
      
      case PlayerCommand.GUARD: {
        result = manager.processGuardAction();
        break;
      }
      
      case PlayerCommand.ESCAPE: {
        const escapeResult = manager.executeEscapeCommand 
          ? null 
          : (() => {
              const { executeEscapeCommand } = require('../battle-system/player-commands');
              const escapeResult = executeEscapeCommand(currentTurnUnit, battleState);
              if (escapeResult.success) {
                setEndReason(BattleEndReason.ESCAPED);
                setBattleState({ ...manager.getState()!, isEnded: true });
              }
              return null;
            })();
        
        if (!escapeResult) {
          const { executeEscapeCommand } = require('../battle-system/player-commands');
          const escapeResult = executeEscapeCommand(currentTurnUnit, battleState);
          if (escapeResult.success) {
            setEndReason(BattleEndReason.ESCAPED);
            setBattleState(prev => prev ? { ...prev, isEnded: true } : null);
            return;
          }
        }
        manager.skipCurrentAction();
        break;
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
    } else if (command !== PlayerCommand.ESCAPE) {
      processNextTurn();
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
