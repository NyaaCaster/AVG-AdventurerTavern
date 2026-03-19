import { describe, it, expect } from 'vitest';

const AIStyle = {
  CLASSIC: 'classic',
  GAMBIT: 'gambit',
  CASUAL: 'casual',
  RANDOM: 'random'
};

const AITargetStrategy = {
  RANDOM: 'random',
  FIRST: 'first',
  LAST: 'last',
  LOWEST_HP: 'lowest_hp',
  HIGHEST_HP: 'highest_hp',
  LOWEST_HP_PERCENT: 'lowest_hp_percent',
  HIGHEST_HP_PERCENT: 'highest_hp_percent',
  LOWEST_MP: 'lowest_mp',
  HIGHEST_MP: 'highest_mp',
  HIGHEST_ATK: 'highest_atk',
  LOWEST_ATK: 'lowest_atk',
  HIGHEST_DEF: 'highest_def',
  LOWEST_DEF: 'lowest_def',
  HIGHEST_MATK: 'highest_matk',
  LOWEST_MATK: 'lowest_matk',
  HIGHEST_MDEF: 'highest_mdef',
  LOWEST_MDEF: 'lowest_mdef',
  HIGHEST_AGI: 'highest_agi',
  LOWEST_AGI: 'lowest_agi',
  HIGHEST_LUK: 'highest_luk',
  LOWEST_LUK: 'lowest_luk',
  HIGHEST_LEVEL: 'highest_level',
  LOWEST_LEVEL: 'lowest_level'
};

const createMockUnit = (overrides: Partial<any> = {}): any => ({
  id: `unit_${Math.random().toString(36).substr(2, 9)}`,
  name: '测试单位',
  faction: 'enemy',
  position: 0,
  level: 10,
  stats: {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    atk: 50,
    def: 25,
    matk: 40,
    mdef: 20,
    agi: 30,
    luk: 20
  },
  isAlive: true,
  statusEffects: [],
  cooldowns: new Map(),
  ...overrides
});

const createMockSkill = (overrides: Partial<any> = {}): any => ({
  id: 1,
  name: '测试技能',
  scope: 1,
  mpCost: 10,
  damage: { type: 1 },
  ...overrides
});

const createMockAction = (overrides: Partial<any> = {}): any => ({
  skillId: 1,
  rating: 50,
  conditionType: 0,
  ...overrides
});

class CooldownManager {
  private cooldowns: Map<number, { useTurn: number; cooldown: number }> = new Map();
  
  getRemainingCooldown(skillId: number, currentTurn: number): number {
    const record = this.cooldowns.get(skillId);
    if (!record) return 0;
    
    const remaining = record.useTurn + record.cooldown - currentTurn;
    return Math.max(0, remaining);
  }
  
  isSkillAvailable(skillId: number, currentTurn: number): boolean {
    return this.getRemainingCooldown(skillId, currentTurn) === 0;
  }
  
  recordSkillUse(skillId: number, currentTurn: number, cooldown: number): void {
    this.cooldowns.set(skillId, { useTurn: currentTurn, cooldown });
  }
  
  getActiveCooldowns(currentTurn: number): Array<{ skillId: number; remainingTurns: number }> {
    const result: Array<{ skillId: number; remainingTurns: number }> = [];
    
    for (const [skillId, record] of this.cooldowns) {
      const remaining = this.getRemainingCooldown(skillId, currentTurn);
      if (remaining > 0) {
        result.push({ skillId, remainingTurns: remaining });
      }
    }
    
    return result;
  }
  
  cleanupExpiredCooldowns(currentTurn: number): void {
    for (const [skillId, record] of this.cooldowns) {
      if (this.getRemainingCooldown(skillId, currentTurn) === 0) {
        this.cooldowns.delete(skillId);
      }
    }
  }
  
  clearCooldowns(): void {
    this.cooldowns.clear();
  }
}

class TargetSelector {
  private static validStrategies = Object.values(AITargetStrategy);
  
  static isValidStrategy(strategy: string): boolean {
    return this.validStrategies.includes(strategy);
  }
  
  static getValidStrategies(): string[] {
    return [...this.validStrategies];
  }
  
  selectTargets(
    skill: any,
    user: any,
    playerUnits: any[],
    enemyUnits: any[],
    strategy?: string
  ): { targets: any[]; strategy: string } {
    const candidates = this.getCandidates(skill, user, playerUnits, enemyUnits);
    
    if (candidates.length === 0) {
      return { targets: [], strategy: strategy || AITargetStrategy.RANDOM };
    }
    
    if (candidates.length === 1) {
      return { targets: [candidates[0]], strategy: strategy || AITargetStrategy.FIRST };
    }
    
    const effectiveStrategy = strategy || AITargetStrategy.RANDOM;
    const selected = this.applyStrategy(candidates, effectiveStrategy);
    
    return { targets: selected, strategy: effectiveStrategy };
  }
  
  getCandidates(skill: any, user: any, playerUnits: any[], enemyUnits: any[]): any[] {
    const isPlayer = user.faction === 'player';
    const allies = isPlayer ? playerUnits : enemyUnits;
    const enemies = isPlayer ? enemyUnits : playerUnits;
    
    const SCOPE_SELF = 0;
    const SCOPE_ENEMY_SINGLE = 1;
    const SCOPE_ENEMY_ALL = 2;
    const SCOPE_ALLY_SINGLE = 4;
    const SCOPE_ALLY_ALL = 5;
    const SCOPE_ALLY_DEAD = 6;
    
    switch (skill.scope) {
      case SCOPE_SELF:
        return [user];
      case SCOPE_ENEMY_SINGLE:
      case SCOPE_ENEMY_ALL:
        return enemies.filter(u => u.isAlive);
      case SCOPE_ALLY_SINGLE:
      case SCOPE_ALLY_ALL:
        return allies.filter(u => u.isAlive);
      case SCOPE_ALLY_DEAD:
        return allies.filter(u => !u.isAlive);
      default:
        return enemies.filter(u => u.isAlive);
    }
  }
  
  applyStrategy(candidates: any[], strategy: string): any[] {
    if (candidates.length === 0) return [];
    if (candidates.length === 1) return [candidates[0]];
    
    const sorted = [...candidates];
    
    switch (strategy) {
      case AITargetStrategy.LOWEST_HP:
        sorted.sort((a, b) => a.stats.hp - b.stats.hp);
        return [sorted[0]];
      case AITargetStrategy.HIGHEST_HP:
        sorted.sort((a, b) => b.stats.hp - a.stats.hp);
        return [sorted[0]];
      case AITargetStrategy.LOWEST_HP_PERCENT:
        sorted.sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp));
        return [sorted[0]];
      case AITargetStrategy.HIGHEST_HP_PERCENT:
        sorted.sort((a, b) => (b.stats.hp / b.stats.maxHp) - (a.stats.hp / a.stats.maxHp));
        return [sorted[0]];
      case AITargetStrategy.HIGHEST_ATK:
        sorted.sort((a, b) => b.stats.atk - a.stats.atk);
        return [sorted[0]];
      case AITargetStrategy.LOWEST_ATK:
        sorted.sort((a, b) => a.stats.atk - b.stats.atk);
        return [sorted[0]];
      case AITargetStrategy.HIGHEST_DEF:
        sorted.sort((a, b) => b.stats.def - a.stats.def);
        return [sorted[0]];
      case AITargetStrategy.LOWEST_DEF:
        sorted.sort((a, b) => a.stats.def - b.stats.def);
        return [sorted[0]];
      case AITargetStrategy.HIGHEST_AGI:
        sorted.sort((a, b) => b.stats.agi - a.stats.agi);
        return [sorted[0]];
      case AITargetStrategy.LOWEST_AGI:
        sorted.sort((a, b) => a.stats.agi - b.stats.agi);
        return [sorted[0]];
      case AITargetStrategy.FIRST:
        return [sorted[0]];
      case AITargetStrategy.LAST:
        return [sorted[sorted.length - 1]];
      case AITargetStrategy.RANDOM:
      default:
        return [sorted[Math.floor(Math.random() * sorted.length)]];
    }
  }
  
  isReviveSkill(skill: any): boolean {
    if (!skill.effects) return false;
    
    return skill.effects.some((effect: any) => 
      effect.code === 22 && effect.dataId === 1
    );
  }
}

class ActionSelector {
  private style: string = AIStyle.CLASSIC;
  private level: number = 100;
  private ratingVariance: number = 5;
  
  setStyle(style: string): void {
    this.style = style;
  }
  
  setLevel(level: number): void {
    this.level = Math.max(0, Math.min(100, level));
  }
  
  setRatingVariance(variance: number): void {
    this.ratingVariance = Math.max(0, Math.min(9, variance));
  }
  
  selectAction(
    unit: any,
    actions: any[],
    skillMap: Map<number, any>,
    currentTurn: number,
    cooldownManager: CooldownManager
  ): any | null {
    const validActions = actions.filter(action => {
      const skill = skillMap.get(action.skillId);
      if (!skill) return false;
      
      if (unit.stats.mp < skill.mpCost) return false;
      if (!cooldownManager.isSkillAvailable(action.skillId, currentTurn)) return false;
      
      return true;
    });
    
    if (validActions.length === 0) return null;
    
    switch (this.style) {
      case AIStyle.GAMBIT:
        return this.selectGambit(validActions);
      case AIStyle.CASUAL:
        return this.selectCasual(validActions);
      case AIStyle.RANDOM:
        return this.selectRandom(validActions);
      case AIStyle.CLASSIC:
      default:
        return this.selectClassic(validActions);
    }
  }
  
  private selectClassic(actions: any[]): any | null {
    if (actions.length === 0) return null;
    
    const sorted = [...actions].sort((a, b) => b.rating - a.rating);
    const maxRating = sorted[0].rating;
    const threshold = maxRating - this.ratingVariance;
    
    const candidates = sorted.filter(a => a.rating >= threshold);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  private selectGambit(actions: any[]): any | null {
    return actions.length > 0 ? actions[0] : null;
  }
  
  private selectCasual(actions: any[]): any | null {
    if (actions.length === 0) return null;
    return actions[Math.floor(Math.random() * actions.length)];
  }
  
  private selectRandom(actions: any[]): any | null {
    if (actions.length === 0) return null;
    return actions[Math.floor(Math.random() * actions.length)];
  }
  
  shouldCheckConditionsByLevel(): boolean {
    if (this.level >= 100) return true;
    if (this.level <= 0) return false;
    return Math.random() * 100 < this.level;
  }
}

describe('AI系统 - CooldownManager', () => {
  
  describe('冷却追踪', () => {
    
    it('未记录的技能应返回0冷却', () => {
      const manager = new CooldownManager();
      
      expect(manager.getRemainingCooldown(1, 1)).toBe(0);
    });

    it('应正确记录技能使用', () => {
      const manager = new CooldownManager();
      
      manager.recordSkillUse(1, 1, 3);
      
      expect(manager.getRemainingCooldown(1, 1)).toBe(3);
    });

    it('应正确计算剩余冷却', () => {
      const manager = new CooldownManager();
      manager.recordSkillUse(1, 1, 3);
      
      expect(manager.getRemainingCooldown(1, 2)).toBe(2);
      expect(manager.getRemainingCooldown(1, 3)).toBe(1);
      expect(manager.getRemainingCooldown(1, 4)).toBe(0);
    });

    it('冷却结束后应可用', () => {
      const manager = new CooldownManager();
      manager.recordSkillUse(1, 1, 2);
      
      expect(manager.isSkillAvailable(1, 3)).toBe(true);
      expect(manager.isSkillAvailable(1, 2)).toBe(false);
    });
  });

  describe('冷却清理', () => {
    
    it('getActiveCooldowns应返回所有冷却中的技能', () => {
      const manager = new CooldownManager();
      manager.recordSkillUse(1, 1, 3);
      manager.recordSkillUse(2, 1, 1);
      
      const active = manager.getActiveCooldowns(1);
      
      expect(active.length).toBe(2);
    });

    it('cleanupExpiredCooldowns应清理过期记录', () => {
      const manager = new CooldownManager();
      manager.recordSkillUse(1, 1, 1);
      manager.recordSkillUse(2, 1, 3);
      
      manager.cleanupExpiredCooldowns(2);
      
      const active = manager.getActiveCooldowns(2);
      expect(active.length).toBe(1);
      expect(active[0].skillId).toBe(2);
    });

    it('clearCooldowns应清除所有记录', () => {
      const manager = new CooldownManager();
      manager.recordSkillUse(1, 1, 3);
      manager.recordSkillUse(2, 1, 5);
      
      manager.clearCooldowns();
      
      expect(manager.getActiveCooldowns(1).length).toBe(0);
    });
  });
});

describe('AI系统 - TargetSelector', () => {
  
  describe('策略验证', () => {
    
    it('isValidStrategy应正确验证策略', () => {
      expect(TargetSelector.isValidStrategy('lowest_hp')).toBe(true);
      expect(TargetSelector.isValidStrategy('invalid_strategy')).toBe(false);
    });

    it('getValidStrategies应返回所有有效策略', () => {
      const strategies = TargetSelector.getValidStrategies();
      
      expect(strategies.length).toBeGreaterThan(10);
      expect(strategies).toContain('lowest_hp');
      expect(strategies).toContain('highest_atk');
    });
  });

  describe('目标选择', () => {
    
    const playerUnits = [
      createMockUnit({ faction: 'player', stats: { hp: 100, maxHp: 100, atk: 30, def: 20, agi: 10 } }),
      createMockUnit({ faction: 'player', stats: { hp: 50, maxHp: 100, atk: 50, def: 30, agi: 20 } }),
      createMockUnit({ faction: 'player', stats: { hp: 80, maxHp: 100, atk: 40, def: 10, agi: 30 } })
    ];
    
    const enemyUnits = [
      createMockUnit({ faction: 'enemy' })
    ];
    
    const selector = new TargetSelector();
    
    it('LOWEST_HP应选择HP最低的目标', () => {
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, playerUnits, enemyUnits, AITargetStrategy.LOWEST_HP);
      
      expect(result.targets[0].stats.hp).toBe(50);
    });

    it('HIGHEST_HP应选择HP最高的目标', () => {
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, playerUnits, enemyUnits, AITargetStrategy.HIGHEST_HP);
      
      expect(result.targets[0].stats.hp).toBe(100);
    });

    it('HIGHEST_ATK应选择攻击力最高的目标', () => {
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, playerUnits, enemyUnits, AITargetStrategy.HIGHEST_ATK);
      
      expect(result.targets[0].stats.atk).toBe(50);
    });

    it('LOWEST_DEF应选择防御力最低的目标', () => {
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, playerUnits, enemyUnits, AITargetStrategy.LOWEST_DEF);
      
      expect(result.targets[0].stats.def).toBe(10);
    });

    it('HIGHEST_AGI应选择速度最高的目标', () => {
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, playerUnits, enemyUnits, AITargetStrategy.HIGHEST_AGI);
      
      expect(result.targets[0].stats.agi).toBe(30);
    });

    it('空候选列表应返回空数组', () => {
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, [], enemyUnits, AITargetStrategy.LOWEST_HP);
      
      expect(result.targets.length).toBe(0);
    });

    it('单一候选应直接返回', () => {
      const singlePlayer = [playerUnits[0]];
      const skill = createMockSkill({ scope: 1 });
      const user = enemyUnits[0];
      
      const result = selector.selectTargets(skill, user, singlePlayer, enemyUnits, AITargetStrategy.RANDOM);
      
      expect(result.targets.length).toBe(1);
      expect(result.targets[0]).toBe(singlePlayer[0]);
    });
  });

  describe('复活技能检测', () => {
    
    const selector = new TargetSelector();
    
    it('有复活效果的技能应被识别', () => {
      const skill = createMockSkill({
        effects: [{ code: 22, dataId: 1 }]
      });
      
      expect(selector.isReviveSkill(skill)).toBe(true);
    });

    it('无复活效果的技能不应被识别', () => {
      const skill = createMockSkill({
        effects: [{ code: 21, dataId: 4 }]
      });
      
      expect(selector.isReviveSkill(skill)).toBe(false);
    });

    it('无effects的技能应返回false', () => {
      const skill = createMockSkill();
      
      expect(selector.isReviveSkill(skill)).toBe(false);
    });
  });
});

describe('AI系统 - ActionSelector', () => {
  
  describe('AI风格选择', () => {
    
    const selector = new ActionSelector();
    const cooldownManager = new CooldownManager();
    
    const actions = [
      createMockAction({ skillId: 1, rating: 80 }),
      createMockAction({ skillId: 2, rating: 60 }),
      createMockAction({ skillId: 3, rating: 40 })
    ];
    
    const skillMap = new Map([
      [1, createMockSkill({ id: 1, mpCost: 5 })],
      [2, createMockSkill({ id: 2, mpCost: 5 })],
      [3, createMockSkill({ id: 3, mpCost: 5 })]
    ]);
    
    const unit = createMockUnit({ stats: { mp: 100, maxMp: 100 } });
    
    it('CLASSIC风格应在评分范围内选择', () => {
      selector.setStyle(AIStyle.CLASSIC);
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).not.toBeNull();
      expect(result.rating).toBeGreaterThanOrEqual(80 - 5);
    });

    it('GAMBIT风格应选择第一个有效行动', () => {
      selector.setStyle(AIStyle.GAMBIT);
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).not.toBeNull();
      expect(result.skillId).toBe(1);
    });

    it('CASUAL风格应随机选择', () => {
      selector.setStyle(AIStyle.CASUAL);
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).not.toBeNull();
    });

    it('RANDOM风格应随机选择', () => {
      selector.setStyle(AIStyle.RANDOM);
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).not.toBeNull();
    });
  });

  describe('行动有效性检查', () => {
    
    const selector = new ActionSelector();
    const cooldownManager = new CooldownManager();
    
    const skillMap = new Map([
      [1, createMockSkill({ id: 1, mpCost: 50 })]
    ]);
    
    it('MP不足时应返回null', () => {
      const unit = createMockUnit({ stats: { mp: 10, maxMp: 100 } });
      const actions = [createMockAction({ skillId: 1 })];
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).toBeNull();
    });

    it('冷却中时应返回null', () => {
      const unit = createMockUnit({ stats: { mp: 100, maxMp: 100 } });
      const actions = [createMockAction({ skillId: 1 })];
      cooldownManager.recordSkillUse(1, 1, 3);
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).toBeNull();
    });

    it('技能不存在时应返回null', () => {
      const unit = createMockUnit({ stats: { mp: 100, maxMp: 100 } });
      const actions = [createMockAction({ skillId: 999 })];
      
      const result = selector.selectAction(unit, actions, skillMap, 1, cooldownManager);
      
      expect(result).toBeNull();
    });
  });

  describe('AI等级影响', () => {
    
    const selector = new ActionSelector();
    
    it('level=100应必定检查条件', () => {
      selector.setLevel(100);
      
      expect(selector.shouldCheckConditionsByLevel()).toBe(true);
    });

    it('level=0应必定不检查条件', () => {
      selector.setLevel(0);
      
      expect(selector.shouldCheckConditionsByLevel()).toBe(false);
    });

    it('level=50应约50%概率检查', () => {
      selector.setLevel(50);
      
      let checkCount = 0;
      for (let i = 0; i < 100; i++) {
        if (selector.shouldCheckConditionsByLevel()) {
          checkCount++;
        }
      }
      
      expect(checkCount).toBeGreaterThan(30);
      expect(checkCount).toBeLessThan(70);
    });
  });

  describe('配置边界', () => {
    
    const selector = new ActionSelector();
    
    it('level应限制在0-100范围', () => {
      selector.setLevel(150);
      expect(selector['level']).toBe(100);
      
      selector.setLevel(-50);
      expect(selector['level']).toBe(0);
    });

    it('ratingVariance应限制在0-9范围', () => {
      selector.setRatingVariance(20);
      expect(selector['ratingVariance']).toBe(9);
      
      selector.setRatingVariance(-5);
      expect(selector['ratingVariance']).toBe(0);
    });
  });
});

describe('AI系统 - 集成测试', () => {
  
  it('完整决策流程应正常工作', () => {
    const cooldownManager = new CooldownManager();
    const targetSelector = new TargetSelector();
    const actionSelector = new ActionSelector();
    actionSelector.setStyle(AIStyle.CLASSIC);
    
    const enemy = createMockUnit({ faction: 'enemy', stats: { mp: 100, maxMp: 100 } });
    const players = [
      createMockUnit({ faction: 'player', stats: { hp: 50, maxHp: 100 } }),
      createMockUnit({ faction: 'player', stats: { hp: 80, maxHp: 100 } })
    ];
    
    const actions = [
      createMockAction({ skillId: 1, rating: 70 }),
      createMockAction({ skillId: 2, rating: 50 })
    ];
    
    const skillMap = new Map([
      [1, createMockSkill({ id: 1, scope: 1, mpCost: 10 })],
      [2, createMockSkill({ id: 2, scope: 1, mpCost: 10 })]
    ]);
    
    const selectedAction = actionSelector.selectAction(enemy, actions, skillMap, 1, cooldownManager);
    
    expect(selectedAction).not.toBeNull();
    
    if (selectedAction) {
      const skill = skillMap.get(selectedAction.skillId);
      const targetResult = targetSelector.selectTargets(skill, enemy, players, [enemy], AITargetStrategy.LOWEST_HP);
      
      expect(targetResult.targets.length).toBeGreaterThan(0);
      
      cooldownManager.recordSkillUse(selectedAction.skillId, 1, 3);
      expect(cooldownManager.getRemainingCooldown(selectedAction.skillId, 1)).toBe(3);
    }
  });
});
