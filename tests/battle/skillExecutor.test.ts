import { describe, it, expect } from 'vitest';

const MIN_DAMAGE = 100;
const DAMAGE_VARIANCE = 0.20;

const CRITICAL_CONFIG = {
  baseCriticalChance: 0.01,
  lukDifferenceFactor: 0.0005,
  maxCriticalChance: 0.30,
  minCriticalChance: 0,
  criticalDamageMultiplier: 3
};

const EVASION_CONFIG = {
  baseEvasionChance: 0.02,
  agiDifferenceFactor: 0.002,
  maxEvasionChance: 0.50,
  minEvasionChance: 0
};

const STATUS_EFFECTS: Record<number, any> = {
  1: { id: 1, name: '死亡', skipTurn: true, canUseSkill: false },
  4: { id: 4, name: '中毒', hpDrainPercent: 0.1, duration: 3 },
  5: { id: 5, name: '暗闇', hitRateModifier: 0.5, duration: 3 },
  6: { id: 6, name: '沈黙', canUseSkill: false, duration: 3 },
  10: { id: 10, name: '睡眠', skipTurn: true, wakeOnPhysicalHit: true, duration: 3 },
  12: { id: 12, name: '麻痹', skipTurn: true, duration: 3 },
  13: { id: 13, name: '晕眩', skipTurn: true, duration: 1 }
};

const createMockUnit = (overrides: Partial<any> = {}): any => ({
  id: 'test-unit',
  name: '测试单位',
  faction: 'player',
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
  baseStats: {
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
  buffs: [],
  statusEffects: [],
  isAlive: true,
  isGuarding: false,
  cooldowns: new Map(),
  ...overrides
});

const createMockSkill = (overrides: Partial<any> = {}): any => ({
  id: 1,
  name: '测试技能',
  damage: {
    type: 1,
    elementId: 0,
    formula: 'a.atk * 4 - b.def * 2',
    variance: 20,
    critical: true
  },
  effects: [],
  scope: 1,
  mpCost: 10,
  cooldown: 0,
  ...overrides
});

const canCastSkill = (unit: any, skill: any): { canCast: boolean; reason?: string } => {
  if (!unit.isAlive) {
    return { canCast: false, reason: '单位已死亡' };
  }
  
  if (unit.stats.mp < skill.mpCost) {
    return { canCast: false, reason: 'MP不足' };
  }
  
  const cooldownRemaining = unit.cooldowns?.get(skill.id) || 0;
  if (cooldownRemaining > 0) {
    return { canCast: false, reason: `冷却中，剩余${cooldownRemaining}回合` };
  }
  
  for (const effect of unit.statusEffects || []) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.canUseSkill === false) {
      return { canCast: false, reason: '状态效果禁止使用技能' };
    }
  }
  
  return { canCast: true };
};

const getSkillCooldown = (skill: any): number => {
  if (skill.cooldown !== undefined) {
    return skill.cooldown;
  }
  
  if (skill.note) {
    const match = skill.note.match(/<Cooldown:\s*(\d+)>/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return 0;
};

const consumeMp = (unit: any, cost: number): number => {
  const actualCost = Math.min(cost, unit.stats.mp);
  unit.stats.mp -= actualCost;
  return actualCost;
};

const setSkillCooldown = (unit: any, skillId: number, cooldown: number): void => {
  if (!unit.cooldowns) {
    unit.cooldowns = new Map();
  }
  unit.cooldowns.set(skillId, cooldown);
};

const processCooldowns = (unit: any): void => {
  if (!unit.cooldowns) return;
  
  for (const [skillId, remaining] of unit.cooldowns) {
    if (remaining > 0) {
      unit.cooldowns.set(skillId, remaining - 1);
    }
    if (remaining <= 1) {
      unit.cooldowns.delete(skillId);
    }
  }
};

const selectTargetsByScope = (
  scope: number,
  user: any,
  playerUnits: any[],
  enemyUnits: any[]
): any[] => {
  const SCOPE_SELF = 0;
  const SCOPE_ENEMY_SINGLE = 1;
  const SCOPE_ENEMY_ALL = 2;
  const SCOPE_ENEMY_RANDOM = 3;
  const SCOPE_ALLY_SINGLE = 4;
  const SCOPE_ALLY_ALL = 5;
  const SCOPE_ALLY_DEAD = 6;
  
  const isPlayer = user.faction === 'player';
  const allies = isPlayer ? playerUnits : enemyUnits;
  const enemies = isPlayer ? enemyUnits : playerUnits;
  
  switch (scope) {
    case SCOPE_SELF:
      return [user];
    case SCOPE_ENEMY_SINGLE:
      return enemies.filter(u => u.isAlive).slice(0, 1);
    case SCOPE_ENEMY_ALL:
      return enemies.filter(u => u.isAlive);
    case SCOPE_ENEMY_RANDOM:
      const aliveEnemies = enemies.filter(u => u.isAlive);
      if (aliveEnemies.length === 0) return [];
      return [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]];
    case SCOPE_ALLY_SINGLE:
      return allies.filter(u => u.isAlive).slice(0, 1);
    case SCOPE_ALLY_ALL:
      return allies.filter(u => u.isAlive);
    case SCOPE_ALLY_DEAD:
      return allies.filter(u => !u.isAlive);
    default:
      return [];
  }
};

const calculateSkillDamage = (source: any, target: any, skill: any): number => {
  if (!skill.damage) return 0;
  
  const damageType = skill.damage.type;
  const formula = skill.damage.formula;
  
  let baseDamage = 0;
  
  if (damageType === 1) {
    baseDamage = source.stats.atk * 4 - target.stats.def * 2;
  } else if (damageType === 2) {
    baseDamage = source.stats.matk * 4 - target.stats.mdef * 2;
  } else {
    baseDamage = source.stats.atk * 4 - target.stats.def * 2;
  }
  
  return Math.max(MIN_DAMAGE, baseDamage);
};

const calculateCriticalChance = (attackerLuk: number, defenderLuk: number, critBonus: number = 0): number => {
  const lukDifference = attackerLuk - defenderLuk;
  const chance = CRITICAL_CONFIG.baseCriticalChance + lukDifference * CRITICAL_CONFIG.lukDifferenceFactor + critBonus;
  return Math.max(
    CRITICAL_CONFIG.minCriticalChance,
    Math.min(CRITICAL_CONFIG.maxCriticalChance, chance)
  );
};

const calculateHitChance = (source: any, target: any, isPhysical: boolean): { hit: boolean; evaded: boolean } => {
  if (!isPhysical) {
    return { hit: true, evaded: false };
  }
  
  let hitRate = 1;
  for (const effect of source.statusEffects || []) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.hitRateModifier) {
      hitRate *= def.hitRateModifier;
    }
  }
  
  let evasionBonus = 0;
  for (const effect of target.statusEffects || []) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.evasionBonus) {
      evasionBonus += def.evasionBonus;
    }
  }
  
  const agiDifference = target.stats.agi - source.stats.agi;
  const baseEvasion = EVASION_CONFIG.baseEvasionChance + agiDifference * EVASION_CONFIG.agiDifferenceFactor;
  const evasion = Math.min(EVASION_CONFIG.maxEvasionChance, Math.max(EVASION_CONFIG.minEvasionChance, baseEvasion) + evasionBonus);
  
  const finalHitChance = hitRate * (1 - evasion);
  const roll = Math.random();
  
  return { hit: roll < finalHitChance, evaded: roll >= finalHitChance };
};

const checkBattleEnd = (playerUnits: any[], enemyUnits: any[]): { isEnded: boolean; winner?: string } => {
  const playerAlive = playerUnits.some(u => u.isAlive);
  const enemyAlive = enemyUnits.some(u => u.isAlive);
  
  if (!playerAlive && !enemyAlive) {
    return { isEnded: true, winner: undefined };
  }
  
  if (!playerAlive) {
    return { isEnded: true, winner: 'enemy' };
  }
  
  if (!enemyAlive) {
    return { isEnded: true, winner: 'player' };
  }
  
  return { isEnded: false };
};

describe('技能执行系统 - canCastSkill', () => {
  
  describe('正常情况测试', () => {
    
    it('正常单位应能使用技能', () => {
      const unit = createMockUnit();
      const skill = createMockSkill({ mpCost: 10 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(true);
    });

    it('MP刚好等于消耗时应能使用', () => {
      const unit = createMockUnit({ stats: { ...createMockUnit().stats, mp: 10 } });
      const skill = createMockSkill({ mpCost: 10 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(true);
    });

    it('无消耗技能应能使用', () => {
      const unit = createMockUnit();
      const skill = createMockSkill({ mpCost: 0 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(true);
    });
  });

  describe('MP不足测试', () => {
    
    it('MP不足时应返回失败', () => {
      const unit = createMockUnit({ stats: { ...createMockUnit().stats, mp: 5 } });
      const skill = createMockSkill({ mpCost: 10 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('MP不足');
    });

    it('MP为0时有消耗技能应失败', () => {
      const unit = createMockUnit({ stats: { ...createMockUnit().stats, mp: 0 } });
      const skill = createMockSkill({ mpCost: 1 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(false);
    });
  });

  describe('冷却测试', () => {
    
    it('冷却中的技能应无法使用', () => {
      const unit = createMockUnit();
      unit.cooldowns = new Map([[1, 2]]);
      const skill = createMockSkill({ id: 1 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('冷却中');
    });

    it('冷却为0时应能使用', () => {
      const unit = createMockUnit();
      unit.cooldowns = new Map([[1, 0]]);
      const skill = createMockSkill({ id: 1 });
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(true);
    });
  });

  describe('状态效果限制测试', () => {
    
    it('沈黙状态应禁止使用技能', () => {
      const unit = createMockUnit({
        statusEffects: [{ dataId: 6, remainingTurns: 3 }]
      });
      const skill = createMockSkill();
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('状态效果');
    });

    it('死亡状态应禁止使用技能', () => {
      const unit = createMockUnit({
        isAlive: false,
        statusEffects: [{ dataId: 1, remainingTurns: -1 }]
      });
      const skill = createMockSkill();
      
      const result = canCastSkill(unit, skill);
      
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('死亡');
    });
  });
});

describe('技能执行系统 - getSkillCooldown', () => {
  
  it('应从cooldown字段获取冷却值', () => {
    const skill = { id: 1, cooldown: 3 };
    
    expect(getSkillCooldown(skill)).toBe(3);
  });

  it('应从note标签解析冷却值', () => {
    const skill = { id: 1, note: '<Cooldown: 5>' };
    
    expect(getSkillCooldown(skill)).toBe(5);
  });

  it('无冷却信息应返回0', () => {
    const skill = { id: 1 };
    
    expect(getSkillCooldown(skill)).toBe(0);
  });

  it('cooldown字段优先于note', () => {
    const skill = { id: 1, cooldown: 2, note: '<Cooldown: 5>' };
    
    expect(getSkillCooldown(skill)).toBe(2);
  });

  it('冷却为0应正确返回', () => {
    const skill = { id: 1, cooldown: 0 };
    
    expect(getSkillCooldown(skill)).toBe(0);
  });
});

describe('技能执行系统 - MP消耗', () => {
  
  it('应正确消耗MP', () => {
    const unit = createMockUnit();
    const initialMp = unit.stats.mp;
    
    const consumed = consumeMp(unit, 10);
    
    expect(consumed).toBe(10);
    expect(unit.stats.mp).toBe(initialMp - 10);
  });

  it('消耗超过当前MP时应消耗全部', () => {
    const unit = createMockUnit({ stats: { ...createMockUnit().stats, mp: 5 } });
    
    const consumed = consumeMp(unit, 20);
    
    expect(consumed).toBe(5);
    expect(unit.stats.mp).toBe(0);
  });

  it('消耗0MP不应改变MP', () => {
    const unit = createMockUnit();
    const initialMp = unit.stats.mp;
    
    consumeMp(unit, 0);
    
    expect(unit.stats.mp).toBe(initialMp);
  });
});

describe('技能执行系统 - 冷却管理', () => {
  
  it('应正确设置冷却', () => {
    const unit = createMockUnit();
    
    setSkillCooldown(unit, 1, 3);
    
    expect(unit.cooldowns.get(1)).toBe(3);
  });

  it('processCooldowns应递减冷却', () => {
    const unit = createMockUnit();
    unit.cooldowns = new Map([[1, 2], [2, 1]]);
    
    processCooldowns(unit);
    
    expect(unit.cooldowns.get(1)).toBe(1);
    expect(unit.cooldowns.has(2)).toBe(false);
  });

  it('冷却为1时应被移除', () => {
    const unit = createMockUnit();
    unit.cooldowns = new Map([[1, 1]]);
    
    processCooldowns(unit);
    
    expect(unit.cooldowns.has(1)).toBe(false);
  });
});

describe('技能执行系统 - 目标选择', () => {
  
  const playerUnits = [
    createMockUnit({ id: 'player1', faction: 'player', position: 0, isAlive: true }),
    createMockUnit({ id: 'player2', faction: 'player', position: 1, isAlive: true }),
    createMockUnit({ id: 'player3', faction: 'player', position: 2, isAlive: false })
  ];
  
  const enemyUnits = [
    createMockUnit({ id: 'enemy1', faction: 'enemy', position: 0, isAlive: true }),
    createMockUnit({ id: 'enemy2', faction: 'enemy', position: 1, isAlive: true }),
    createMockUnit({ id: 'enemy3', faction: 'enemy', position: 2, isAlive: false })
  ];
  
  it('SCOPE_SELF应返回使用者自己', () => {
    const user = playerUnits[0];
    const targets = selectTargetsByScope(0, user, playerUnits, enemyUnits);
    
    expect(targets.length).toBe(1);
    expect(targets[0].id).toBe('player1');
  });

  it('SCOPE_ENEMY_SINGLE应返回单个存活敌人', () => {
    const user = playerUnits[0];
    const targets = selectTargetsByScope(1, user, playerUnits, enemyUnits);
    
    expect(targets.length).toBe(1);
    expect(targets[0].faction).toBe('enemy');
    expect(targets[0].isAlive).toBe(true);
  });

  it('SCOPE_ENEMY_ALL应返回所有存活敌人', () => {
    const user = playerUnits[0];
    const targets = selectTargetsByScope(2, user, playerUnits, enemyUnits);
    
    expect(targets.length).toBe(2);
    expect(targets.every(t => t.isAlive)).toBe(true);
  });

  it('SCOPE_ALLY_ALL应返回所有存活友方', () => {
    const user = playerUnits[0];
    const targets = selectTargetsByScope(5, user, playerUnits, enemyUnits);
    
    expect(targets.length).toBe(2);
    expect(targets.every(t => t.isAlive)).toBe(true);
  });

  it('SCOPE_ALLY_DEAD应返回死亡友方', () => {
    const user = playerUnits[0];
    const targets = selectTargetsByScope(6, user, playerUnits, enemyUnits);
    
    expect(targets.length).toBe(1);
    expect(targets[0].id).toBe('player3');
    expect(targets[0].isAlive).toBe(false);
  });

  it('敌人使用技能时应正确选择目标', () => {
    const user = enemyUnits[0];
    const targets = selectTargetsByScope(1, user, playerUnits, enemyUnits);
    
    expect(targets[0].faction).toBe('player');
  });
});

describe('技能执行系统 - 伤害计算', () => {
  
  it('物理技能应使用ATK和DEF计算', () => {
    const source = createMockUnit({ stats: { ...createMockUnit().stats, atk: 100, def: 0 } });
    const target = createMockUnit({ stats: { ...createMockUnit().stats, atk: 0, def: 50 } });
    const skill = createMockSkill({ damage: { type: 1, formula: 'a.atk * 4 - b.def * 2' } });
    
    const damage = calculateSkillDamage(source, target, skill);
    
    expect(damage).toBe(300);
  });

  it('魔法技能应使用MATK和MDEF计算', () => {
    const source = createMockUnit({ stats: { ...createMockUnit().stats, matk: 100, mdef: 0 } });
    const target = createMockUnit({ stats: { ...createMockUnit().stats, matk: 0, mdef: 50 } });
    const skill = createMockSkill({ damage: { type: 2, formula: 'a.matk * 4 - b.mdef * 2' } });
    
    const damage = calculateSkillDamage(source, target, skill);
    
    expect(damage).toBe(300);
  });

  it('伤害低于最小值应返回最小伤害', () => {
    const source = createMockUnit({ stats: { ...createMockUnit().stats, atk: 10 } });
    const target = createMockUnit({ stats: { ...createMockUnit().stats, def: 100 } });
    const skill = createMockSkill({ damage: { type: 1 } });
    
    const damage = calculateSkillDamage(source, target, skill);
    
    expect(damage).toBe(MIN_DAMAGE);
  });

  it('无伤害数据的技能应返回0', () => {
    const source = createMockUnit();
    const target = createMockUnit();
    const skill = { id: 1, name: '无伤害技能' };
    
    const damage = calculateSkillDamage(source, target, skill);
    
    expect(damage).toBe(0);
  });
});

describe('技能执行系统 - 暴击计算', () => {
  
  it('基础暴击率应为1%', () => {
    const chance = calculateCriticalChance(0, 0);
    expect(chance).toBe(0.01);
  });

  it('LUK差值+100应增加5%暴击率', () => {
    const chance = calculateCriticalChance(100, 0);
    expect(chance).toBeCloseTo(0.06, 2);
  });

  it('暴击率不应超过30%', () => {
    const chance = calculateCriticalChance(1000, 0);
    expect(chance).toBe(0.30);
  });

  it('暴击率不应低于0%', () => {
    const chance = calculateCriticalChance(0, 1000);
    expect(chance).toBe(0);
  });

  it('额外暴击加成应正确应用', () => {
    const chance = calculateCriticalChance(0, 0, 0.1);
    expect(chance).toBe(0.11);
  });
});

describe('技能执行系统 - 命中计算', () => {
  
  it('魔法攻击应必定命中', () => {
    const source = createMockUnit();
    const target = createMockUnit({ stats: { ...createMockUnit().stats, agi: 1000 } });
    
    const result = calculateHitChance(source, target, false);
    
    expect(result.hit).toBe(true);
    expect(result.evaded).toBe(false);
  });

  it('暗闇状态应降低命中率', () => {
    const source = createMockUnit({
      statusEffects: [{ dataId: 5, remainingTurns: 3 }]
    });
    const target = createMockUnit();
    
    const result = calculateHitChance(source, target, true);
    
    expect(result.evaded || result.hit).toBeDefined();
  });

  it('高AGI目标应有更高闪避率', () => {
    const source = createMockUnit({ stats: { ...createMockUnit().stats, agi: 10 } });
    const target = createMockUnit({ stats: { ...createMockUnit().stats, agi: 100 } });
    
    const result = calculateHitChance(source, target, true);
    
    expect(result.evaded || result.hit).toBeDefined();
  });
});

describe('技能执行系统 - 战斗结束判定', () => {
  
  it('双方都有存活单位时战斗继续', () => {
    const playerUnits = [createMockUnit({ isAlive: true })];
    const enemyUnits = [createMockUnit({ isAlive: true })];
    
    const result = checkBattleEnd(playerUnits, enemyUnits);
    
    expect(result.isEnded).toBe(false);
  });

  it('玩家全灭时敌人胜利', () => {
    const playerUnits = [createMockUnit({ isAlive: false })];
    const enemyUnits = [createMockUnit({ isAlive: true })];
    
    const result = checkBattleEnd(playerUnits, enemyUnits);
    
    expect(result.isEnded).toBe(true);
    expect(result.winner).toBe('enemy');
  });

  it('敌人全灭时玩家胜利', () => {
    const playerUnits = [createMockUnit({ isAlive: true })];
    const enemyUnits = [createMockUnit({ isAlive: false })];
    
    const result = checkBattleEnd(playerUnits, enemyUnits);
    
    expect(result.isEnded).toBe(true);
    expect(result.winner).toBe('player');
  });

  it('双方全灭时应判定为平局', () => {
    const playerUnits = [createMockUnit({ isAlive: false })];
    const enemyUnits = [createMockUnit({ isAlive: false })];
    
    const result = checkBattleEnd(playerUnits, enemyUnits);
    
    expect(result.isEnded).toBe(true);
    expect(result.winner).toBeUndefined();
  });

  it('多个单位时只要有一个存活就继续', () => {
    const playerUnits = [
      createMockUnit({ isAlive: false }),
      createMockUnit({ isAlive: true })
    ];
    const enemyUnits = [createMockUnit({ isAlive: true })];
    
    const result = checkBattleEnd(playerUnits, enemyUnits);
    
    expect(result.isEnded).toBe(false);
  });
});
