import { describe, it, expect } from 'vitest';

const STATUS_EFFECTS: Record<number, any> = {
  1: { id: 1, name: '死亡', skipTurn: true, canUseSkill: false, persistAfterBattle: false },
  4: { id: 4, name: '中毒', hpDrainPercent: 0.1, duration: 3 },
  5: { id: 5, name: '暗闇', hitRateModifier: 0.5, duration: 3 },
  6: { id: 6, name: '沈黙', canUseSkill: false, duration: 3 },
  7: { id: 7, name: '激昂', forceAttackEnemy: true, removeOnDamagePercent: 50, duration: 3 },
  8: { id: 8, name: '混乱', randomTarget: true, removeOnDamagePercent: 50, duration: 3 },
  9: { id: 9, name: '魅惑', attackAlly: true, removeOnDamagePercent: 50, duration: 3 },
  10: { id: 10, name: '睡眠', skipTurn: true, wakeOnPhysicalHit: true, removeOnDamagePercent: 50, duration: 3 },
  11: { id: 11, name: '挑衅', duration: 5 },
  12: { id: 12, name: '麻痹', skipTurn: true, duration: 3 },
  13: { id: 13, name: '晕眩', skipTurn: true, duration: 1 },
  15: { id: 15, name: 'HP再生', hpRegenPercent: 0.1, duration: 4 },
  1000: { id: 1000, name: '发情', persistAfterBattle: true },
  1001: { id: 1001, name: '弱点暴露', damageReceivedMultiplier: 1.2, duration: 3 },
  1103: { id: 1103, name: '回避率提升', evasionBonus: 0.1, duration: 3 },
  1105: { id: 1105, name: '暴击率提升', critRateBonus: 0.1, duration: 3 },
  1107: { id: 1107, name: '反击率提升', counterRateBonus: 0.1, duration: 3 }
};

const MUTEX_STATUS_GROUPS = [
  ['激昂', '睡眠', '混乱', '魅惑', '晕眩', '麻痹']
];

const MAX_STATUS_STACKS = 5;

const createStatusEffectInstance = (statusId: number, duration?: number): any => {
  const def = STATUS_EFFECTS[statusId];
  if (!def) return null;
  
  return {
    statusId,
    dataId: statusId,
    remainingTurns: duration ?? def.duration ?? -1,
    stacks: 1,
    appliedAt: Date.now()
  };
};

const getHitRateModifier = (unit: any): number => {
  if (!unit?.statusEffects) return 1;
  
  let modifier = 1;
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.hitRateModifier) {
      modifier *= def.hitRateModifier;
    }
  }
  return modifier;
};

const getEvasionBonus = (unit: any): number => {
  if (!unit?.statusEffects) return 0;
  
  let bonus = 0;
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.evasionBonus) {
      bonus += def.evasionBonus;
    }
  }
  return bonus;
};

const getCritBonus = (unit: any): number => {
  if (!unit?.statusEffects) return 0;
  
  let bonus = 0;
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.critRateBonus) {
      bonus += def.critRateBonus;
    }
  }
  return bonus;
};

const getDamageReceivedMultiplier = (unit: any): number => {
  if (!unit?.statusEffects) return 1;
  
  let multiplier = 1;
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.damageReceivedMultiplier) {
      multiplier *= def.damageReceivedMultiplier;
    }
  }
  return multiplier;
};

const getProvokeWeight = (unit: any): number => {
  if (!unit?.statusEffects) return 1;
  
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.name === '挑衅') {
      return 3;
    }
  }
  return 1;
};

const isSkillUseBlocked = (unit: any): boolean => {
  if (!unit?.statusEffects) return false;
  
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.canUseSkill === false) {
      return true;
    }
  }
  return false;
};

const isSkipTurn = (unit: any): boolean => {
  if (!unit?.statusEffects) return false;
  
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.skipTurn) {
      return true;
    }
  }
  return false;
};

const getMutexStatusIds = (statusId: number): number[] => {
  const def = STATUS_EFFECTS[statusId];
  if (!def?.name) return [];
  
  for (const group of MUTEX_STATUS_GROUPS) {
    if (group.includes(def.name)) {
      return group
        .map(name => Object.values(STATUS_EFFECTS).find(e => e.name === name)?.id)
        .filter((id): id is number => id !== undefined);
    }
  }
  return [];
};

const applyStatusEffect = (unit: any, statusId: number, successRate: number = 100): { success: boolean; reason?: string } => {
  const def = STATUS_EFFECTS[statusId];
  if (!def) {
    return { success: false, reason: '未知状态' };
  }
  
  if (Math.random() * 100 > successRate) {
    return { success: false, reason: '成功率不足' };
  }
  
  if (!unit.statusEffects) {
    unit.statusEffects = [];
  }
  
  const mutexIds = getMutexStatusIds(statusId);
  if (mutexIds.length > 0) {
    unit.statusEffects = unit.statusEffects.filter(
      (e: any) => !mutexIds.includes(e.dataId)
    );
  }
  
  const existingIndex = unit.statusEffects.findIndex((e: any) => e.dataId === statusId);
  if (existingIndex >= 0) {
    unit.statusEffects[existingIndex].remainingTurns = def.duration ?? -1;
  } else {
    if (unit.statusEffects.length >= MAX_STATUS_STACKS) {
      return { success: false, reason: '状态已满' };
    }
    unit.statusEffects.push(createStatusEffectInstance(statusId));
  }
  
  return { success: true };
};

const processStatusEffectTurn = (unit: any): any[] => {
  if (!unit?.statusEffects || unit.statusEffects.length === 0) {
    return [];
  }
  
  const logEntries: any[] = [];
  const hpDrainEffects: any[] = [];
  const hpRegenEffects: any[] = [];
  
  for (const effect of unit.statusEffects) {
    const def = STATUS_EFFECTS[effect.dataId];
    if (def?.hpDrainPercent) {
      hpDrainEffects.push({ effect, percent: def.hpDrainPercent });
    }
    if (def?.hpRegenPercent) {
      hpRegenEffects.push({ effect, percent: def.hpRegenPercent });
    }
  }
  
  for (const regen of hpRegenEffects) {
    if (unit.stats.hp < unit.stats.maxHp) {
      const healAmount = Math.floor(unit.stats.maxHp * regen.percent);
      const actualHeal = Math.min(healAmount, unit.stats.maxHp - unit.stats.hp);
      unit.stats.hp += actualHeal;
      logEntries.push({ type: 'heal', targetId: unit.id, value: actualHeal });
    }
  }
  
  for (const drain of hpDrainEffects) {
    const drainAmount = Math.floor(unit.stats.maxHp * drain.percent);
    unit.stats.hp = Math.max(0, unit.stats.hp - drainAmount);
    logEntries.push({ type: 'damage', targetId: unit.id, value: drainAmount });
    
    if (unit.stats.hp <= 0) {
      unit.isAlive = false;
      logEntries.push({ type: 'death', targetId: unit.id });
      break;
    }
  }
  
  for (const effect of unit.statusEffects) {
    if (effect.remainingTurns > 0) {
      effect.remainingTurns--;
    }
  }
  
  unit.statusEffects = unit.statusEffects.filter((e: any) => e.remainingTurns !== 0);
  
  return logEntries;
};

describe('状态效果系统 - 施加逻辑', () => {
  
  describe('applyStatusEffect - 施加状态效果', () => {
    
    it('应该成功施加中毒状态', () => {
      const unit = { statusEffects: [] as any[], stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50 } };
      const result = applyStatusEffect(unit, 4, 100);
      
      expect(result.success).toBe(true);
      expect(unit.statusEffects.length).toBe(1);
      expect(unit.statusEffects[0].dataId).toBe(4);
    });

    it('应该成功施加多个不同类型状态', () => {
      const unit = { statusEffects: [] as any[], stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50 } };
      
      applyStatusEffect(unit, 4, 100);
      applyStatusEffect(unit, 15, 100);
      
      expect(unit.statusEffects.length).toBe(2);
    });

    it('成功率不足时应失败', () => {
      const unit = { statusEffects: [] as any[], stats: { hp: 100, maxHp: 100 } };
      const result = applyStatusEffect(unit, 4, 0);
      
      expect(result.success).toBe(false);
      expect(unit.statusEffects.length).toBe(0);
    });

    it('未知状态ID应失败', () => {
      const unit = { statusEffects: [] as any[], stats: { hp: 100, maxHp: 100 } };
      const result = applyStatusEffect(unit, 9999, 100);
      
      expect(result.success).toBe(false);
    });
  });

  describe('互斥状态处理', () => {
    
    it('施加激昂应移除睡眠', () => {
      const unit = { statusEffects: [createStatusEffectInstance(10)], stats: { hp: 100, maxHp: 100 } };
      
      applyStatusEffect(unit, 7, 100);
      
      expect(unit.statusEffects.find((e: any) => e.dataId === 10)).toBeUndefined();
      expect(unit.statusEffects.find((e: any) => e.dataId === 7)).toBeDefined();
    });

    it('施加睡眠应移除激昂', () => {
      const unit = { statusEffects: [createStatusEffectInstance(7)], stats: { hp: 100, maxHp: 100 } };
      
      applyStatusEffect(unit, 10, 100);
      
      expect(unit.statusEffects.find((e: any) => e.dataId === 7)).toBeUndefined();
      expect(unit.statusEffects.find((e: any) => e.dataId === 10)).toBeDefined();
    });

    it('施加混乱应移除魅惑', () => {
      const unit = { statusEffects: [createStatusEffectInstance(9)], stats: { hp: 100, maxHp: 100 } };
      
      applyStatusEffect(unit, 8, 100);
      
      expect(unit.statusEffects.find((e: any) => e.dataId === 9)).toBeUndefined();
      expect(unit.statusEffects.find((e: any) => e.dataId === 8)).toBeDefined();
    });

    it('施加晕眩应移除混乱和睡眠', () => {
      const unit = { statusEffects: [createStatusEffectInstance(8), createStatusEffectInstance(10)], stats: { hp: 100, maxHp: 100 } };
      
      applyStatusEffect(unit, 13, 100);
      
      expect(unit.statusEffects.find((e: any) => e.dataId === 8)).toBeUndefined();
      expect(unit.statusEffects.find((e: any) => e.dataId === 10)).toBeUndefined();
      expect(unit.statusEffects.find((e: any) => e.dataId === 13)).toBeDefined();
    });
  });

  describe('状态叠加处理', () => {
    
    it('重复施加同状态应刷新持续时间', () => {
      const unit = { statusEffects: [createStatusEffectInstance(4)], stats: { hp: 100, maxHp: 100 } };
      unit.statusEffects[0].remainingTurns = 1;
      
      applyStatusEffect(unit, 4, 100);
      
      expect(unit.statusEffects.length).toBe(1);
      expect(unit.statusEffects[0].remainingTurns).toBe(3);
    });
  });
});

describe('状态效果系统 - 持续与移除', () => {
  
  describe('processStatusEffectTurn - 回合处理', () => {
    
    it('中毒状态应每回合扣血', () => {
      const unit = {
        statusEffects: [createStatusEffectInstance(4)],
        stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50 },
        isAlive: true,
        id: 'test-unit'
      };
      
      processStatusEffectTurn(unit);
      
      expect(unit.stats.hp).toBe(90);
      expect(unit.statusEffects[0].remainingTurns).toBe(2);
    });

    it('HP再生状态应每回合回复', () => {
      const unit = {
        statusEffects: [createStatusEffectInstance(15)],
        stats: { hp: 50, maxHp: 100, mp: 50, maxMp: 50 },
        isAlive: true,
        id: 'test-unit'
      };
      
      processStatusEffectTurn(unit);
      
      expect(unit.stats.hp).toBe(60);
      expect(unit.statusEffects[0].remainingTurns).toBe(3);
    });

    it('满血时HP再生不应超出上限', () => {
      const unit = {
        statusEffects: [createStatusEffectInstance(15)],
        stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50 },
        isAlive: true,
        id: 'test-unit'
      };
      
      processStatusEffectTurn(unit);
      
      expect(unit.stats.hp).toBe(100);
    });

    it('状态效果持续时间归零时应移除', () => {
      const unit = {
        statusEffects: [createStatusEffectInstance(13)],
        stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50 },
        isAlive: true,
        id: 'test-unit'
      };
      unit.statusEffects[0].remainingTurns = 1;
      
      processStatusEffectTurn(unit);
      
      expect(unit.statusEffects.length).toBe(0);
    });

    it('HP扣至0时应死亡', () => {
      const unit = {
        statusEffects: [createStatusEffectInstance(4)],
        stats: { hp: 5, maxHp: 100, mp: 50, maxMp: 50 },
        isAlive: true,
        id: 'test-unit'
      };
      
      processStatusEffectTurn(unit);
      
      expect(unit.stats.hp).toBe(0);
      expect(unit.isAlive).toBe(false);
      expect(unit.statusEffects.length).toBe(1);
    });
  });
});

describe('状态效果系统 - 伤害计算关联', () => {
  
  describe('getHitRateModifier - 命中率修正', () => {
    
    it('无状态时应返回1', () => {
      const unit = { statusEffects: undefined };
      expect(getHitRateModifier(unit)).toBe(1);
    });

    it('暗闇状态应降低命中率50%', () => {
      const unit = { statusEffects: [createStatusEffectInstance(5)] };
      expect(getHitRateModifier(unit)).toBe(0.5);
    });

    it('多个暗闇效果应乘法叠加', () => {
      const unit = { statusEffects: [createStatusEffectInstance(5), createStatusEffectInstance(5)] };
      expect(getHitRateModifier(unit)).toBe(0.25);
    });
  });

  describe('getEvasionBonus - 闪避加成', () => {
    
    it('无状态时应返回0', () => {
      const unit = { statusEffects: undefined };
      expect(getEvasionBonus(unit)).toBe(0);
    });

    it('回避率提升状态应增加闪避', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1103)] };
      expect(getEvasionBonus(unit)).toBe(0.1);
    });

    it('多个回避提升应累加', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1103), createStatusEffectInstance(1103)] };
      expect(getEvasionBonus(unit)).toBe(0.2);
    });
  });

  describe('getCritBonus - 暴击加成', () => {
    
    it('无状态时应返回0', () => {
      const unit = { statusEffects: undefined };
      expect(getCritBonus(unit)).toBe(0);
    });

    it('暴击率提升状态应增加暴击率', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1105)] };
      expect(getCritBonus(unit)).toBe(0.1);
    });

    it('多个暴击提升应累加', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1105), createStatusEffectInstance(1105)] };
      expect(getCritBonus(unit)).toBe(0.2);
    });
  });

  describe('getDamageReceivedMultiplier - 受伤倍率', () => {
    
    it('无状态时应返回1', () => {
      const unit = { statusEffects: undefined };
      expect(getDamageReceivedMultiplier(unit)).toBe(1);
    });

    it('弱点暴露状态应增加受伤20%', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1001)] };
      expect(getDamageReceivedMultiplier(unit)).toBe(1.2);
    });

    it('多个弱点暴露应乘法叠加', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1001), createStatusEffectInstance(1001)] };
      expect(getDamageReceivedMultiplier(unit)).toBe(1.44);
    });
  });
});

describe('状态效果系统 - 状态检查', () => {
  
  describe('isSkillUseBlocked - 技能使用检查', () => {
    
    it('无状态时应允许使用技能', () => {
      const unit = { statusEffects: undefined };
      expect(isSkillUseBlocked(unit)).toBe(false);
    });

    it('沈黙状态应禁止使用技能', () => {
      const unit = { statusEffects: [createStatusEffectInstance(6)] };
      expect(isSkillUseBlocked(unit)).toBe(true);
    });

    it('死亡状态应禁止使用技能', () => {
      const unit = { statusEffects: [createStatusEffectInstance(1)] };
      expect(isSkillUseBlocked(unit)).toBe(true);
    });
  });

  describe('isSkipTurn - 跳过回合检查', () => {
    
    it('正常状态不应跳过回合', () => {
      const unit = { statusEffects: undefined };
      expect(isSkipTurn(unit)).toBe(false);
    });

    it('睡眠状态应跳过回合', () => {
      const unit = { statusEffects: [createStatusEffectInstance(10)] };
      expect(isSkipTurn(unit)).toBe(true);
    });

    it('麻痹状态应跳过回合', () => {
      const unit = { statusEffects: [createStatusEffectInstance(12)] };
      expect(isSkipTurn(unit)).toBe(true);
    });

    it('晕眩状态应跳过回合', () => {
      const unit = { statusEffects: [createStatusEffectInstance(13)] };
      expect(isSkipTurn(unit)).toBe(true);
    });
  });

  describe('getProvokeWeight - 挑衅权重', () => {
    
    it('无挑衅状态应返回权重1', () => {
      const unit = { statusEffects: undefined };
      expect(getProvokeWeight(unit)).toBe(1);
    });

    it('挑衅状态应返回权重3', () => {
      const unit = { statusEffects: [createStatusEffectInstance(11)] };
      expect(getProvokeWeight(unit)).toBe(3);
    });
  });
});

describe('状态效果系统 - 边界情况', () => {
  
  it('状态列表为空应正常处理', () => {
    const unit = { statusEffects: [], stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50 }, isAlive: true, id: 'test' };
    
    expect(getHitRateModifier(unit)).toBe(1);
    expect(getEvasionBonus(unit)).toBe(0);
    expect(getCritBonus(unit)).toBe(0);
    expect(getDamageReceivedMultiplier(unit)).toBe(1);
    expect(isSkillUseBlocked(unit)).toBe(false);
    expect(isSkipTurn(unit)).toBe(false);
  });

  it('单位为null时应安全处理', () => {
    expect(getHitRateModifier(null)).toBe(1);
    expect(getEvasionBonus(null)).toBe(0);
    expect(getCritBonus(null)).toBe(0);
    expect(getDamageReceivedMultiplier(null)).toBe(1);
    expect(isSkillUseBlocked(null)).toBe(false);
    expect(isSkipTurn(null)).toBe(false);
  });

  it('statusEffects为null时应安全处理', () => {
    const unit = { statusEffects: null as any };
    expect(getHitRateModifier(unit)).toBe(1);
    expect(getEvasionBonus(unit)).toBe(0);
  });
});
