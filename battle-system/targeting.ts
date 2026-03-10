import {
  BattleUnit,
  BattleState,
  SkillScope,
  Faction
} from './types';

export interface TargetSelection {
  targets: BattleUnit[];
  isValid: boolean;
  requiresUserInput: boolean;
}

export function getAliveUnits(units: BattleUnit[]): BattleUnit[] {
  return units.filter(unit => unit.isAlive);
}

export function getDeadUnits(units: BattleUnit[]): BattleUnit[] {
  return units.filter(unit => !unit.isAlive);
}

export function getUnitById(state: BattleState, unitId: string): BattleUnit | undefined {
  const playerUnit = state.playerUnits.find(u => u.id === unitId);
  if (playerUnit) return playerUnit;
  
  const enemyUnit = state.enemyUnits.find(u => u.id === unitId);
  return enemyUnit;
}

export function getOpposingFaction(unit: BattleUnit, state: BattleState): BattleUnit[] {
  return unit.faction === Faction.PLAYER ? state.enemyUnits : state.playerUnits;
}

export function getAllyFaction(unit: BattleUnit, state: BattleState): BattleUnit[] {
  return unit.faction === Faction.PLAYER ? state.playerUnits : state.enemyUnits;
}

export function selectRandomTarget(units: BattleUnit[], excludeDead: boolean = true): BattleUnit | undefined {
  const validUnits = excludeDead ? getAliveUnits(units) : units;
  if (validUnits.length === 0) return undefined;
  
  const index = Math.floor(Math.random() * validUnits.length);
  return validUnits[index];
}

export function selectRandomTargets(units: BattleUnit[], count: number, excludeDead: boolean = true): BattleUnit[] {
  const validUnits = excludeDead ? getAliveUnits(units) : units;
  if (validUnits.length === 0) return [];
  
  const shuffled = [...validUnits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function selectTargetsByScope(
  source: BattleUnit,
  state: BattleState,
  scope: SkillScope,
  specificTargetId?: string
): TargetSelection {
  const enemies = getOpposingFaction(source, state);
  const allies = getAllyFaction(source, state);
  
  switch (scope) {
    case SkillScope.NONE:
      return { targets: [], isValid: false, requiresUserInput: false };
    
    case SkillScope.ENEMY_SINGLE:
      if (specificTargetId) {
        const target = getAliveUnits(enemies).find(u => u.id === specificTargetId);
        return {
          targets: target ? [target] : [],
          isValid: !!target,
          requiresUserInput: false
        };
      }
      return {
        targets: getAliveUnits(enemies),
        isValid: getAliveUnits(enemies).length > 0,
        requiresUserInput: true
      };
    
    case SkillScope.ENEMY_ALL:
      return {
        targets: getAliveUnits(enemies),
        isValid: getAliveUnits(enemies).length > 0,
        requiresUserInput: false
      };
    
    case SkillScope.ENEMY_ALL_CONTINUOUS:
      return {
        targets: getAliveUnits(enemies),
        isValid: getAliveUnits(enemies).length > 0,
        requiresUserInput: false
      };
    
    case SkillScope.ENEMY_RANDOM_SINGLE:
      const randomEnemy = selectRandomTarget(enemies);
      return {
        targets: randomEnemy ? [randomEnemy] : [],
        isValid: !!randomEnemy,
        requiresUserInput: false
      };
    
    case SkillScope.ENEMY_RANDOM_X2:
      const randomEnemies = selectRandomTargets(enemies, 2);
      return {
        targets: randomEnemies,
        isValid: randomEnemies.length > 0,
        requiresUserInput: false
      };
    
    case SkillScope.ALLY_SINGLE:
      if (specificTargetId) {
        const target = getAliveUnits(allies).find(u => u.id === specificTargetId);
        return {
          targets: target ? [target] : [],
          isValid: !!target,
          requiresUserInput: false
        };
      }
      return {
        targets: getAliveUnits(allies),
        isValid: getAliveUnits(allies).length > 0,
        requiresUserInput: true
      };
    
    case SkillScope.ALLY_ALL:
      return {
        targets: getAliveUnits(allies),
        isValid: getAliveUnits(allies).length > 0,
        requiresUserInput: false
      };
    
    case SkillScope.ALLY_ALL_CONTINUOUS:
      return {
        targets: getAliveUnits(allies),
        isValid: getAliveUnits(allies).length > 0,
        requiresUserInput: false
      };
    
    case SkillScope.SELF:
      return {
        targets: [source],
        isValid: source.isAlive,
        requiresUserInput: false
      };
    
    case SkillScope.SELF_AFFECT_ALLY_ALL:
      return {
        targets: [source, ...getAliveUnits(allies).filter(u => u.id !== source.id)],
        isValid: true,
        requiresUserInput: false
      };
    
    case SkillScope.ENEMY_SINGLE_CONTINUOUS:
      if (specificTargetId) {
        const target = getAliveUnits(enemies).find(u => u.id === specificTargetId);
        return {
          targets: target ? [target] : [],
          isValid: !!target,
          requiresUserInput: false
        };
      }
      return {
        targets: getAliveUnits(enemies),
        isValid: getAliveUnits(enemies).length > 0,
        requiresUserInput: true
      };
    
    default:
      return { targets: [], isValid: false, requiresUserInput: false };
  }
}

export function selectDeadAllyTarget(
  source: BattleUnit,
  state: BattleState,
  specificTargetId?: string
): TargetSelection {
  const allies = getAllyFaction(source, state);
  const deadAllies = getDeadUnits(allies);
  
  if (specificTargetId) {
    const target = deadAllies.find(u => u.id === specificTargetId);
    return {
      targets: target ? [target] : [],
      isValid: !!target,
      requiresUserInput: false
    };
  }
  
  return {
    targets: deadAllies,
    isValid: deadAllies.length > 0,
    requiresUserInput: true
  };
}

export function selectLowestHpTarget(units: BattleUnit[]): BattleUnit | undefined {
  const aliveUnits = getAliveUnits(units);
  if (aliveUnits.length === 0) return undefined;
  
  return aliveUnits.reduce((lowest, current) => 
    current.stats.hp < lowest.stats.hp ? current : lowest
  );
}

export function selectHighestHpTarget(units: BattleUnit[]): BattleUnit | undefined {
  const aliveUnits = getAliveUnits(units);
  if (aliveUnits.length === 0) return undefined;
  
  return aliveUnits.reduce((highest, current) => 
    current.stats.hp > highest.stats.hp ? current : highest
  );
}

export function selectLowestHpPercentageTarget(units: BattleUnit[]): BattleUnit | undefined {
  const aliveUnits = getAliveUnits(units);
  if (aliveUnits.length === 0) return undefined;
  
  return aliveUnits.reduce((lowest, current) => {
    const currentPercent = current.stats.hp / current.stats.maxHp;
    const lowestPercent = lowest.stats.hp / lowest.stats.maxHp;
    return currentPercent < lowestPercent ? current : lowest;
  });
}

export function getTargetableEnemies(source: BattleUnit, state: BattleState): BattleUnit[] {
  return getAliveUnits(getOpposingFaction(source, state));
}

export function getTargetableAllies(source: BattleUnit, state: BattleState): BattleUnit[] {
  return getAliveUnits(getAllyFaction(source, state));
}

export function isValidTarget(
  source: BattleUnit,
  target: BattleUnit,
  scope: SkillScope,
  state: BattleState
): boolean {
  const selection = selectTargetsByScope(source, state, scope, target.id);
  return selection.targets.some(t => t.id === target.id);
}

export function canTargetDead(SkillScope: SkillScope): boolean {
  return false;
}

export function requiresTargetSelection(scope: SkillScope): boolean {
  return [
    SkillScope.ENEMY_SINGLE,
    SkillScope.ALLY_SINGLE,
    SkillScope.ENEMY_SINGLE_CONTINUOUS
  ].includes(scope);
}
