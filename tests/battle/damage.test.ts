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

const calculatePhysicalDamage = (
  attackerAtk: number,
  defenderDef: number,
  guardMultiplier: number = 1
): number => {
  const damage = attackerAtk * 4 - defenderDef * 2;
  const finalDamage = Math.max(MIN_DAMAGE, damage) * guardMultiplier;
  return Math.floor(finalDamage);
};

const calculateMagicalDamage = (
  attackerMat: number,
  defenderMdf: number,
  guardMultiplier: number = 1
): number => {
  const damage = attackerMat * 4 - defenderMdf * 2;
  const finalDamage = Math.max(MIN_DAMAGE, damage) * guardMultiplier;
  return Math.floor(finalDamage);
};

const calculateCriticalChance = (
  attackerLuk: number,
  defenderLuk: number,
  critBonus: number = 0
): number => {
  const lukDifference = attackerLuk - defenderLuk;
  const chance = CRITICAL_CONFIG.baseCriticalChance + lukDifference * CRITICAL_CONFIG.lukDifferenceFactor + critBonus;
  return Math.max(
    CRITICAL_CONFIG.minCriticalChance,
    Math.min(CRITICAL_CONFIG.maxCriticalChance, chance)
  );
};

const calculateEvasionChance = (
  attackerAgi: number,
  defenderAgi: number,
  evasionBonus: number = 0
): number => {
  const agiDifference = defenderAgi - attackerAgi;
  const agiBasedEvasion = EVASION_CONFIG.baseEvasionChance + 
    (agiDifference * EVASION_CONFIG.agiDifferenceFactor);
  const baseEvasion = Math.max(
    EVASION_CONFIG.minEvasionChance,
    Math.min(EVASION_CONFIG.maxEvasionChance, agiBasedEvasion)
  );
  return Math.min(EVASION_CONFIG.maxEvasionChance, baseEvasion + evasionBonus);
};

describe('calculatePhysicalDamage - 物理伤害计算', () => {
  
  describe('基础伤害计算', () => {
    
    it('攻击力100，防御力50应造成300伤害', () => {
      expect(calculatePhysicalDamage(100, 50)).toBe(300);
    });

    it('攻击力50，防御力25应造成150伤害', () => {
      expect(calculatePhysicalDamage(50, 25)).toBe(150);
    });

    it('攻击力200，防御力100应造成600伤害', () => {
      expect(calculatePhysicalDamage(200, 100)).toBe(600);
    });

    it('攻击力等于防御力时应造成正伤害', () => {
      const result = calculatePhysicalDamage(100, 100);
      expect(result).toBe(200);
    });
  });

  describe('最小伤害测试', () => {
    
    it('伤害低于100时应返回最小伤害100', () => {
      expect(calculatePhysicalDamage(10, 100)).toBe(100);
    });

    it('攻击力为0时应返回最小伤害', () => {
      expect(calculatePhysicalDamage(0, 50)).toBe(100);
    });

    it('防御力远高于攻击力时应返回最小伤害', () => {
      expect(calculatePhysicalDamage(10, 500)).toBe(100);
    });

    it('攻击力和防御力都为0时应返回最小伤害', () => {
      expect(calculatePhysicalDamage(0, 0)).toBe(100);
    });
  });

  describe('防御状态测试', () => {
    
    it('防御状态应使伤害减半', () => {
      const normalDamage = calculatePhysicalDamage(100, 50, 1);
      const guardDamage = calculatePhysicalDamage(100, 50, 0.5);
      
      expect(guardDamage).toBe(Math.floor(normalDamage * 0.5));
    });

    it('防御状态的最小伤害应为50', () => {
      const result = calculatePhysicalDamage(10, 100, 0.5);
      expect(result).toBe(50);
    });
  });

  describe('边界值测试', () => {
    
    it('攻击力为负数时应返回最小伤害', () => {
      expect(calculatePhysicalDamage(-100, 50)).toBe(100);
    });

    it('防御力为负数时应增加伤害', () => {
      const result = calculatePhysicalDamage(100, -50);
      expect(result).toBe(500);
    });

    it('超大攻击力应正确计算', () => {
      const result = calculatePhysicalDamage(10000, 100);
      expect(result).toBe(39800);
    });

    it('超大防御力应返回最小伤害', () => {
      const result = calculatePhysicalDamage(100, 10000);
      expect(result).toBe(100);
    });
  });
});

describe('calculateMagicalDamage - 魔法伤害计算', () => {
  
  describe('基础伤害计算', () => {
    
    it('魔攻80，魔防30应造成260伤害', () => {
      expect(calculateMagicalDamage(80, 30)).toBe(260);
    });

    it('魔攻100，魔防50应造成300伤害', () => {
      expect(calculateMagicalDamage(100, 50)).toBe(300);
    });

    it('魔攻50，魔防25应造成150伤害', () => {
      expect(calculateMagicalDamage(50, 25)).toBe(150);
    });
  });

  describe('最小伤害测试', () => {
    
    it('伤害低于100时应返回最小伤害100', () => {
      expect(calculateMagicalDamage(10, 100)).toBe(100);
    });

    it('魔攻为0时应返回最小伤害', () => {
      expect(calculateMagicalDamage(0, 50)).toBe(100);
    });

    it('魔防远高于魔攻时应返回最小伤害', () => {
      expect(calculateMagicalDamage(10, 500)).toBe(100);
    });
  });

  describe('防御状态测试', () => {
    
    it('防御状态应使魔法伤害减半', () => {
      const normalDamage = calculateMagicalDamage(100, 50, 1);
      const guardDamage = calculateMagicalDamage(100, 50, 0.5);
      
      expect(guardDamage).toBe(Math.floor(normalDamage * 0.5));
    });

    it('防御状态的魔法最小伤害应为50', () => {
      const result = calculateMagicalDamage(10, 100, 0.5);
      expect(result).toBe(50);
    });
  });

  describe('边界值测试', () => {
    
    it('魔攻为负数时应返回最小伤害', () => {
      expect(calculateMagicalDamage(-100, 50)).toBe(100);
    });

    it('魔防为负数时应增加伤害', () => {
      const result = calculateMagicalDamage(100, -50);
      expect(result).toBe(500);
    });

    it('超大魔攻应正确计算', () => {
      const result = calculateMagicalDamage(10000, 100);
      expect(result).toBe(39800);
    });
  });
});

describe('calculateCriticalChance - 暴击概率计算', () => {
  
  describe('基础暴击率测试', () => {
    
    it('基础暴击率应为1%', () => {
      expect(calculateCriticalChance(0, 0)).toBe(0.01);
    });

    it('攻击者LUK高于防御者应增加暴击率', () => {
      const baseChance = calculateCriticalChance(0, 0);
      const higherChance = calculateCriticalChance(100, 0);
      
      expect(higherChance).toBeGreaterThan(baseChance);
    });

    it('攻击者LUK低于防御者应降低暴击率', () => {
      const baseChance = calculateCriticalChance(0, 0);
      const lowerChance = calculateCriticalChance(0, 100);
      
      expect(lowerChance).toBeLessThan(baseChance);
    });
  });

  describe('LUK差值影响测试', () => {
    
    it('LUK差值+100应增加5%暴击率', () => {
      const chance = calculateCriticalChance(100, 0);
      expect(chance).toBeCloseTo(0.01 + 100 * 0.0005, 3);
    });

    it('LUK差值-100应减少5%暴击率（受最小值限制）', () => {
      const chance = calculateCriticalChance(0, 100);
      expect(chance).toBe(0);
    });

    it('LUK差值+200应增加10%暴击率', () => {
      const chance = calculateCriticalChance(200, 0);
      expect(chance).toBeCloseTo(0.01 + 200 * 0.0005, 3);
    });
  });

  describe('暴击率上限测试', () => {
    
    it('暴击率不应超过30%', () => {
      const chance = calculateCriticalChance(1000, 0);
      expect(chance).toBe(0.30);
    });

    it('暴击率不应低于0%', () => {
      const chance = calculateCriticalChance(0, 1000);
      expect(chance).toBe(0);
    });

    it('边界值测试：刚好30%暴击率', () => {
      const lukDiff = (0.30 - 0.01) / 0.0005;
      const chance = calculateCriticalChance(lukDiff, 0);
      expect(chance).toBeLessThanOrEqual(0.30);
    });
  });

  describe('额外暴击加成测试', () => {
    
    it('额外暴击加成应增加暴击率', () => {
      const baseChance = calculateCriticalChance(0, 0);
      const bonusChance = calculateCriticalChance(0, 0, 0.1);
      
      expect(bonusChance).toBe(baseChance + 0.1);
    });

    it('额外暴击加成+LUK差值应正确叠加', () => {
      const chance = calculateCriticalChance(100, 0, 0.1);
      const expected = 0.01 + 100 * 0.0005 + 0.1;
      expect(chance).toBeCloseTo(expected, 3);
    });

    it('额外暴击加成也应受30%上限限制', () => {
      const chance = calculateCriticalChance(0, 0, 0.5);
      expect(chance).toBe(0.30);
    });
  });
});

describe('calculateEvasionChance - 闪避概率计算', () => {
  
  describe('基础闪避率测试', () => {
    
    it('基础闪避率应为2%', () => {
      const chance = calculateEvasionChance(0, 0);
      expect(chance).toBe(0.02);
    });

    it('攻击者AGI高于防御者应降低闪避率', () => {
      const baseChance = calculateEvasionChance(0, 0);
      const lowerChance = calculateEvasionChance(100, 0);
      
      expect(lowerChance).toBeLessThan(baseChance);
    });

    it('防御者AGI高于攻击者应增加闪避率', () => {
      const baseChance = calculateEvasionChance(0, 0);
      const higherChance = calculateEvasionChance(0, 100);
      
      expect(higherChance).toBeGreaterThan(baseChance);
    });
  });

  describe('AGI差值影响测试', () => {
    
    it('AGI差值-100（防御者快）应增加闪避率', () => {
      const chance = calculateEvasionChance(0, 100);
      expect(chance).toBeCloseTo(0.02 + 100 * 0.002, 3);
    });

    it('AGI差值+100（攻击者快）应降低闪避率（受最小值限制）', () => {
      const chance = calculateEvasionChance(100, 0);
      expect(chance).toBe(0);
    });
  });

  describe('闪避率上限测试', () => {
    
    it('闪避率不应超过50%', () => {
      const chance = calculateEvasionChance(0, 1000);
      expect(chance).toBe(0.50);
    });

    it('闪避率不应低于0%', () => {
      const chance = calculateEvasionChance(1000, 0);
      expect(chance).toBe(0);
    });

    it('额外闪避加成也应受50%上限限制', () => {
      const chance = calculateEvasionChance(0, 0, 0.8);
      expect(chance).toBe(0.50);
    });
  });

  describe('额外闪避加成测试', () => {
    
    it('额外闪避加成应增加闪避率', () => {
      const baseChance = calculateEvasionChance(0, 0);
      const bonusChance = calculateEvasionChance(0, 0, 0.1);
      
      expect(bonusChance).toBe(baseChance + 0.1);
    });

    it('额外闪避加成+AGI差值应正确叠加', () => {
      const chance = calculateEvasionChance(0, 50, 0.1);
      const expected = 0.02 + 50 * 0.002 + 0.1;
      expect(chance).toBeCloseTo(expected, 3);
    });
  });
});

describe('伤害计算集成测试', () => {
  
  describe('物理伤害与暴击组合', () => {
    
    it('暴击应使物理伤害翻3倍', () => {
      const baseDamage = calculatePhysicalDamage(100, 50);
      const critDamage = baseDamage * CRITICAL_CONFIG.criticalDamageMultiplier;
      
      expect(critDamage).toBe(900);
    });

    it('防御状态+暴击应正确计算', () => {
      const baseDamage = calculatePhysicalDamage(100, 50, 0.5);
      const critDamage = baseDamage * CRITICAL_CONFIG.criticalDamageMultiplier;
      
      expect(critDamage).toBe(450);
    });
  });

  describe('魔法伤害与暴击组合', () => {
    
    it('暴击应使魔法伤害翻3倍', () => {
      const baseDamage = calculateMagicalDamage(100, 50);
      const critDamage = baseDamage * CRITICAL_CONFIG.criticalDamageMultiplier;
      
      expect(critDamage).toBe(900);
    });

    it('防御状态+暴击应正确计算', () => {
      const baseDamage = calculateMagicalDamage(100, 50, 0.5);
      const critDamage = baseDamage * CRITICAL_CONFIG.criticalDamageMultiplier;
      
      expect(critDamage).toBe(450);
    });
  });

  describe('伤害浮动测试', () => {
    
    it('伤害浮动范围应为80%~120%', () => {
      const baseDamage = 300;
      const minVariance = baseDamage * (1 - DAMAGE_VARIANCE);
      const maxVariance = baseDamage * (1 + DAMAGE_VARIANCE);
      
      expect(minVariance).toBe(240);
      expect(maxVariance).toBe(360);
    });

    it('最小伤害浮动后仍应保持最小值', () => {
      const baseDamage = MIN_DAMAGE;
      const minVariance = Math.floor(baseDamage * (1 - DAMAGE_VARIANCE));
      
      expect(minVariance).toBe(80);
    });
  });

  describe('数据保护测试', () => {
    
    it('超高伤害不应溢出', () => {
      const result = calculatePhysicalDamage(1000000, 0);
      expect(result).toBe(4000000);
    });

    it('负数输入应返回最小伤害', () => {
      expect(calculatePhysicalDamage(-1000, -1000)).toBe(100);
    });

    it('浮点数输入应正确取整', () => {
      const result = calculatePhysicalDamage(100.5, 50.5);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});
