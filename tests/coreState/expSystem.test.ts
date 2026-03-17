import { describe, it, expect } from 'vitest';
import { EXP_TABLE } from '../../data/battle-data/exp_table';

const getMaxLevelByCharacter = (charId: string): number => {
  const maxLevels: Record<string, number> = {
    'char_1': 100,
    'char_101': 99,
    'char_102': 99,
    'char_103': 99,
    'char_104': 99,
    'char_105': 99,
    'char_106': 99,
    'char_107': 99,
    'char_108': 99,
    'char_109': 99,
    'char_110': 99,
    'char_111': 99
  };
  return maxLevels[charId] ?? 99;
};

const getLevelUpNeedExp = (currentLevel: number): number => {
  const nextLevel = currentLevel + 1;
  if (nextLevel >= EXP_TABLE.length) return Number.MAX_SAFE_INTEGER;
  const currentTotal = EXP_TABLE[currentLevel] ?? 0;
  const nextTotal = EXP_TABLE[nextLevel] ?? currentTotal;
  return Math.max(0, nextTotal - currentTotal);
};

const applyExpGainToStat = (charId: string, stat: { level: number; exp: number }, gainedExp: number): { level: number; exp: number } => {
  if (gainedExp <= 0) return stat;

  const maxLevel = getMaxLevelByCharacter(charId);
  let level = Math.max(1, Math.min(maxLevel, stat.level || 1));
  let exp = Math.max(0, stat.exp || 0) + gainedExp;

  while (level < maxLevel) {
    const needExp = getLevelUpNeedExp(level);
    if (needExp <= 0 || exp < needExp) break;
    exp -= needExp;
    level += 1;
  }

  if (level >= maxLevel) {
    level = maxLevel;
    exp = 0;
  }

  return { level, exp };
};

describe('EXP_TABLE - 经验值表', () => {
  
  describe('基础验证', () => {
    
    it('经验表长度应大于100', () => {
      expect(EXP_TABLE.length).toBeGreaterThan(100);
    });

    it('等级0和等级1的经验值应为0', () => {
      expect(EXP_TABLE[0]).toBe(0);
      expect(EXP_TABLE[1]).toBe(0);
    });

    it('经验值应随等级递增', () => {
      for (let i = 2; i < EXP_TABLE.length - 1; i++) {
        expect(EXP_TABLE[i + 1]).toBeGreaterThan(EXP_TABLE[i]);
      }
    });

    it('升到2级需要50经验', () => {
      expect(EXP_TABLE[2]).toBe(50);
    });

    it('升到10级需要5296经验', () => {
      expect(EXP_TABLE[10]).toBe(5296);
    });
  });
});

describe('getLevelUpNeedExp - 获取升级所需经验', () => {
  
  describe('正常情况', () => {
    
    it('等级1升到2级需要50经验', () => {
      expect(getLevelUpNeedExp(1)).toBe(50);
    });

    it('等级2升到3级需要112经验 (162-50)', () => {
      expect(getLevelUpNeedExp(2)).toBe(112);
    });

    it('等级9升到10级需要1417经验 (5296-3879)', () => {
      expect(getLevelUpNeedExp(9)).toBe(1417);
    });
  });

  describe('边界值测试', () => {
    
    it('等级0应返回有效值', () => {
      const result = getLevelUpNeedExp(0);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('接近最大等级时应返回有效值', () => {
      const result = getLevelUpNeedExp(100);
      expect(result).toBeGreaterThan(0);
    });

    it('超过经验表范围应返回MAX_SAFE_INTEGER', () => {
      const result = getLevelUpNeedExp(999);
      expect(result).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});

describe('applyExpGainToStat - 应用经验值增益', () => {
  
  describe('数据保护测试', () => {
    
    it('应该保留用户当前等级', () => {
      const stat = { level: 50, exp: 100 };
      const result = applyExpGainToStat('char_1', stat, 0);
      
      expect(result.level).toBe(50);
    });

    it('应该累积用户经验值', () => {
      const stat = { level: 10, exp: 500 };
      const result = applyExpGainToStat('char_1', stat, 200);
      
      expect(result.exp).toBe(700);
    });

    it('应该保留已达最大等级的角色状态', () => {
      const stat = { level: 99, exp: 0 };
      const result = applyExpGainToStat('char_102', stat, 1000);
      
      expect(result.level).toBe(99);
      expect(result.exp).toBe(0);
    });
  });

  describe('单级升级测试', () => {
    
    it('获得足够经验应升级1级', () => {
      const stat = { level: 1, exp: 0 };
      const needExp = getLevelUpNeedExp(1);
      const result = applyExpGainToStat('char_1', stat, needExp);
      
      expect(result.level).toBe(2);
    });

    it('升级后剩余经验应保留', () => {
      const stat = { level: 1, exp: 0 };
      const needExp = getLevelUpNeedExp(1);
      const result = applyExpGainToStat('char_1', stat, needExp + 100);
      
      expect(result.level).toBe(2);
      expect(result.exp).toBe(100);
    });

    it('刚好足够升级的经验应清零经验', () => {
      const stat = { level: 1, exp: 0 };
      const needExp = getLevelUpNeedExp(1);
      const result = applyExpGainToStat('char_1', stat, needExp);
      
      expect(result.level).toBe(2);
      expect(result.exp).toBe(0);
    });
  });

  describe('多级升级测试', () => {
    
    it('获得大量经验应连续升级', () => {
      const stat = { level: 1, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 10000);
      
      expect(result.level).toBeGreaterThan(1);
    });

    it('多级升级后经验应正确计算', () => {
      const stat = { level: 1, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 10000);
      
      const expectedTotal = EXP_TABLE[result.level] + result.exp;
      expect(expectedTotal).toBeLessThanOrEqual(10000);
    });

    it('从等级10获得大量经验应正确升级', () => {
      const stat = { level: 10, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 50000);
      
      expect(result.level).toBeGreaterThan(10);
    });
  });

  describe('最大等级限制测试', () => {
    
    it('char_1最大等级应为100', () => {
      const stat = { level: 99, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 1000000);
      
      expect(result.level).toBe(100);
      expect(result.exp).toBe(0);
    });

    it('char_102最大等级应为99', () => {
      const stat = { level: 98, exp: 0 };
      const result = applyExpGainToStat('char_102', stat, 1000000);
      
      expect(result.level).toBe(99);
      expect(result.exp).toBe(0);
    });

    it('达到最大等级后经验应清零', () => {
      const stat = { level: 99, exp: 500 };
      const result = applyExpGainToStat('char_102', stat, 1000);
      
      expect(result.level).toBe(99);
      expect(result.exp).toBe(0);
    });
  });

  describe('边界值测试', () => {
    
    it('0经验不应改变状态', () => {
      const stat = { level: 10, exp: 500 };
      const result = applyExpGainToStat('char_1', stat, 0);
      
      expect(result.level).toBe(10);
      expect(result.exp).toBe(500);
    });

    it('负经验不应改变状态', () => {
      const stat = { level: 10, exp: 500 };
      const result = applyExpGainToStat('char_1', stat, -100);
      
      expect(result.level).toBe(10);
      expect(result.exp).toBe(500);
    });

    it('等级1获得少量经验应保留', () => {
      const stat = { level: 1, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 10);
      
      expect(result.level).toBe(1);
      expect(result.exp).toBe(10);
    });

    it('已有经验的角色获得经验应累加', () => {
      const stat = { level: 1, exp: 30 };
      const result = applyExpGainToStat('char_1', stat, 10);
      
      expect(result.level).toBe(1);
      expect(result.exp).toBe(40);
    });
  });

  describe('边缘情况测试', () => {
    
    it('等级为0应修正为1', () => {
      const stat = { level: 0, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 100);
      
      expect(result.level).toBeGreaterThanOrEqual(1);
    });

    it('负等级应修正为1', () => {
      const stat = { level: -5, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, 100);
      
      expect(result.level).toBeGreaterThanOrEqual(1);
    });

    it('负经验应修正为0', () => {
      const stat = { level: 10, exp: -100 };
      const result = applyExpGainToStat('char_1', stat, 50);
      
      expect(result.exp).toBeGreaterThanOrEqual(0);
    });

    it('超大经验值应正确处理', () => {
      const stat = { level: 1, exp: 0 };
      const result = applyExpGainToStat('char_1', stat, Number.MAX_SAFE_INTEGER);
      
      expect(result.level).toBe(100);
      expect(result.exp).toBe(0);
    });
  });

  describe('不同角色测试', () => {
    
    it('char_103应能正常升级', () => {
      const stat = { level: 2, exp: 0 };
      const result = applyExpGainToStat('char_103', stat, 200);
      
      expect(result.level).toBeGreaterThan(2);
    });

    it('char_104应能正常升级', () => {
      const stat = { level: 4, exp: 0 };
      const result = applyExpGainToStat('char_104', stat, 500);
      
      expect(result.level).toBeGreaterThan(4);
    });

    it('char_105应能正常升级', () => {
      const stat = { level: 9, exp: 0 };
      const result = applyExpGainToStat('char_105', stat, 5000);
      
      expect(result.level).toBeGreaterThan(9);
    });
  });
});
