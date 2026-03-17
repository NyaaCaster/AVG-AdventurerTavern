import { describe, it, expect } from 'vitest';
import { INITIAL_CHARACTER_LEVEL, INITIAL_CHARACTER_EQUIPMENT } from '../../utils/gameConstants';

const mockCharacters: Record<string, { battleData?: { maxLevel: number; statMultipliers?: Record<string, number> } }> = {
  'char_1': { battleData: { maxLevel: 100, statMultipliers: { hp: 100, mp: 100, atk: 100, def: 100, matk: 100, mdef: 100, agi: 100, luk: 100 } } },
  'char_101': { battleData: { maxLevel: 99 } },
  'char_102': { battleData: { maxLevel: 99 } },
  'char_103': { battleData: { maxLevel: 99, statMultipliers: { hp: 90, mp: 120, atk: 80, def: 85, matk: 130, mdef: 110, agi: 95, luk: 100 } } },
  'char_104': { battleData: { maxLevel: 99, statMultipliers: { hp: 100, mp: 90, atk: 120, def: 95, matk: 85, mdef: 90, agi: 110, luk: 105 } } },
  'char_105': { battleData: { maxLevel: 99 } },
  'char_106': { battleData: { maxLevel: 99 } },
  'char_107': { battleData: { maxLevel: 99 } },
  'char_108': { battleData: { maxLevel: 99 } },
  'char_109': { battleData: { maxLevel: 99 } },
  'char_110': { battleData: { maxLevel: 99 } },
  'char_111': { battleData: { maxLevel: 99 } }
};

const mockItemsEquip: Record<string, { id: string; category: 'wpn' | 'arm' | 'acs'; stats?: Record<string, number> }> = {
  'wpn-101': { id: 'wpn-101', category: 'wpn', stats: { atk: 10, agi: 2 } },
  'wpn-102': { id: 'wpn-102', category: 'wpn', stats: { atk: 25, agi: 5 } },
  'wpn-201': { id: 'wpn-201', category: 'wpn', stats: { matk: 20, mp: 10 } },
  'wpn-301': { id: 'wpn-301', category: 'wpn', stats: { atk: 15, luk: 10 } },
  'wpn-401': { id: 'wpn-401', category: 'wpn', stats: { atk: 30 } },
  'wpn-501': { id: 'wpn-501', category: 'wpn', stats: { atk: 22, agi: 8 } },
  'wpn-601': { id: 'wpn-601', category: 'wpn', stats: { atk: 35, def: -5 } },
  'wpn-701': { id: 'wpn-701', category: 'wpn', stats: { atk: 18, agi: 15 } },
  'arm-101': { id: 'arm-101', category: 'arm', stats: { def: 5, hp: 20 } },
  'arm-201': { id: 'arm-201', category: 'arm', stats: { def: 15, hp: 50, mdef: 5 } },
  'arm-301': { id: 'arm-301', category: 'arm', stats: { def: 25, hp: 100 } },
  'acs-001': { id: 'acs-001', category: 'acs', stats: { luk: 20 } },
  'acs-002': { id: 'acs-002', category: 'acs', stats: { agi: 15 } },
  'acs-003': { id: 'acs-003', category: 'acs', stats: { hp: 50, mp: 30 } }
};

const getSafeLevel = (characterId: string, rawLevel: unknown): number => {
  const maxLevel = mockCharacters[characterId]?.battleData?.maxLevel ?? 100;
  const initialLevel = INITIAL_CHARACTER_LEVEL[characterId] || 1;
  const level = Number(rawLevel) || initialLevel;
  return Math.max(1, Math.min(maxLevel, Math.floor(level)));
};

const toValidEquipId = (value: string | null | undefined, expectedCategory: 'wpn' | 'arm' | 'acs', fallback: string | null): string | null => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    if (fallback && mockItemsEquip[fallback]?.category === expectedCategory) return fallback;
    return null;
  }
  const item = mockItemsEquip[value];
  if (!item || item.category !== expectedCategory) {
    if (fallback && mockItemsEquip[fallback]?.category === expectedCategory) return fallback;
    return null;
  }
  return value;
};

const normalizeEquipment = (characterId: string, equipment?: Partial<{ weaponId: string | null; armorId: string | null; accessory1Id: string | null; accessory2Id: string | null }> | null): { weaponId: string | null; armorId: string | null; accessory1Id: string | null; accessory2Id: string | null } => {
  const fallback = INITIAL_CHARACTER_EQUIPMENT[characterId] || {
    weaponId: null,
    armorId: null,
    accessory1Id: null,
    accessory2Id: null
  };

  return {
    weaponId: toValidEquipId(equipment?.weaponId, 'wpn', fallback.weaponId),
    armorId: toValidEquipId(equipment?.armorId, 'arm', fallback.armorId),
    accessory1Id: toValidEquipId(equipment?.accessory1Id, 'acs', fallback.accessory1Id),
    accessory2Id: toValidEquipId(equipment?.accessory2Id, 'acs', fallback.accessory2Id)
  };
};

describe('getSafeLevel - 安全等级获取', () => {
  
  describe('数据保护测试', () => {
    
    it('应该保留用户的有效等级', () => {
      expect(getSafeLevel('char_1', 50)).toBe(50);
    });

    it('应该保留等级1', () => {
      expect(getSafeLevel('char_1', 1)).toBe(1);
    });

    it('应该保留最大等级', () => {
      expect(getSafeLevel('char_1', 100)).toBe(100);
    });

    it('应该保留char_102的初始等级99', () => {
      expect(getSafeLevel('char_102', 99)).toBe(99);
    });

    it('应该保留char_103的初始等级2', () => {
      expect(getSafeLevel('char_103', 2)).toBe(2);
    });
  });

  describe('边界值测试', () => {
    
    it('应该将等级0修正为初始等级', () => {
      const result = getSafeLevel('char_1', 0);
      expect(result).toBe(1);
    });

    it('应该将等级-1修正为初始等级', () => {
      const result = getSafeLevel('char_1', -1);
      expect(result).toBe(1);
    });

    it('应该将超过最大等级的值限制到最大等级', () => {
      const result = getSafeLevel('char_1', 999);
      expect(result).toBe(100);
    });

    it('char_102最大等级应为99', () => {
      const result = getSafeLevel('char_102', 999);
      expect(result).toBe(99);
    });

    it('应该正确处理边界值99', () => {
      expect(getSafeLevel('char_102', 99)).toBe(99);
    });

    it('应该正确处理边界值100', () => {
      expect(getSafeLevel('char_1', 100)).toBe(100);
    });
  });

  describe('边缘情况测试', () => {
    
    it('应该正确处理 undefined', () => {
      const result = getSafeLevel('char_1', undefined);
      expect(result).toBe(1);
    });

    it('应该正确处理 null', () => {
      const result = getSafeLevel('char_1', null);
      expect(result).toBe(1);
    });

    it('应该正确处理 NaN', () => {
      const result = getSafeLevel('char_1', NaN);
      expect(result).toBe(1);
    });

    it('应该正确处理字符串数字', () => {
      const result = getSafeLevel('char_1', '50');
      expect(result).toBe(50);
    });

    it('应该正确处理无效字符串', () => {
      const result = getSafeLevel('char_1', 'invalid');
      expect(result).toBe(1);
    });

    it('应该正确处理小数（向下取整）', () => {
      const result = getSafeLevel('char_1', 50.9);
      expect(result).toBe(50);
    });

    it('应该正确处理对象', () => {
      const result = getSafeLevel('char_1', { value: 50 } as any);
      expect(result).toBe(1);
    });
  });

  describe('不同角色初始等级测试', () => {
    
    it('char_1初始等级应为1', () => {
      expect(getSafeLevel('char_1', undefined)).toBe(1);
    });

    it('char_102初始等级应为99', () => {
      expect(getSafeLevel('char_102', undefined)).toBe(99);
    });

    it('char_103初始等级应为2', () => {
      expect(getSafeLevel('char_103', undefined)).toBe(2);
    });

    it('char_104初始等级应为4', () => {
      expect(getSafeLevel('char_104', undefined)).toBe(4);
    });

    it('char_105初始等级应为9', () => {
      expect(getSafeLevel('char_105', undefined)).toBe(9);
    });

    it('char_106初始等级应为7', () => {
      expect(getSafeLevel('char_106', undefined)).toBe(7);
    });
  });
});

describe('normalizeEquipment - 装备归一化', () => {
  
  describe('数据保护测试', () => {
    
    it('应该保留用户的有效武器', () => {
      const result = normalizeEquipment('char_1', { weaponId: 'wpn-102' });
      expect(result.weaponId).toBe('wpn-102');
    });

    it('应该保留用户的有效防具', () => {
      const result = normalizeEquipment('char_1', { armorId: 'arm-201' });
      expect(result.armorId).toBe('arm-201');
    });

    it('应该保留用户的有效饰品', () => {
      const result = normalizeEquipment('char_1', { accessory1Id: 'acs-001', accessory2Id: 'acs-002' });
      expect(result.accessory1Id).toBe('acs-001');
      expect(result.accessory2Id).toBe('acs-002');
    });

    it('应该保留初始装备配置', () => {
      const result = normalizeEquipment('char_103', null);
      expect(result.weaponId).toBe('wpn-201');
    });
  });

  describe('边界值测试', () => {
    
    it('应该正确处理空字符串', () => {
      const result = normalizeEquipment('char_1', { weaponId: '' });
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该正确处理空白字符串', () => {
      const result = normalizeEquipment('char_1', { weaponId: '   ' });
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该正确处理null值', () => {
      const result = normalizeEquipment('char_101', { weaponId: null });
      expect(result.weaponId).toBeNull();
    });
  });

  describe('边缘情况测试', () => {
    
    it('应该拒绝无效的装备ID', () => {
      const result = normalizeEquipment('char_1', { weaponId: 'invalid-id' });
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该拒绝类别不匹配的装备（武器放在防具槽）', () => {
      const result = normalizeEquipment('char_1', { armorId: 'wpn-102' });
      expect(result.armorId).toBeNull();
    });

    it('应该拒绝类别不匹配的装备（防具放在武器槽）', () => {
      const result = normalizeEquipment('char_1', { weaponId: 'arm-201' });
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该拒绝类别不匹配的装备（饰品放在武器槽）', () => {
      const result = normalizeEquipment('char_1', { weaponId: 'acs-001' });
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该正确处理undefined输入', () => {
      const result = normalizeEquipment('char_1', undefined);
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该正确处理null输入', () => {
      const result = normalizeEquipment('char_1', null);
      expect(result.weaponId).toBe('wpn-101');
    });

    it('应该正确处理空对象输入', () => {
      const result = normalizeEquipment('char_1', {});
      expect(result.weaponId).toBe('wpn-101');
    });
  });

  describe('不同角色初始装备测试', () => {
    
    it('char_1初始武器应为wpn-101', () => {
      const result = normalizeEquipment('char_1', null);
      expect(result.weaponId).toBe('wpn-101');
    });

    it('char_101无初始武器', () => {
      const result = normalizeEquipment('char_101', null);
      expect(result.weaponId).toBeNull();
    });

    it('char_102无初始武器', () => {
      const result = normalizeEquipment('char_102', null);
      expect(result.weaponId).toBeNull();
    });

    it('char_103初始武器应为wpn-201', () => {
      const result = normalizeEquipment('char_103', null);
      expect(result.weaponId).toBe('wpn-201');
    });

    it('char_104初始武器应为wpn-301', () => {
      const result = normalizeEquipment('char_104', null);
      expect(result.weaponId).toBe('wpn-301');
    });
  });
});

describe('角色战斗属性计算集成测试', () => {
  
  describe('等级与装备组合测试', () => {
    
    it('应该正确处理等级1带初始装备的角色', () => {
      const level = getSafeLevel('char_1', 1);
      const equipment = normalizeEquipment('char_1', null);
      
      expect(level).toBe(1);
      expect(equipment.weaponId).toBe('wpn-101');
    });

    it('应该正确处理高等级带高级装备的角色', () => {
      const level = getSafeLevel('char_1', 50);
      const equipment = normalizeEquipment('char_1', {
        weaponId: 'wpn-102',
        armorId: 'arm-201',
        accessory1Id: 'acs-001'
      });
      
      expect(level).toBe(50);
      expect(equipment.weaponId).toBe('wpn-102');
      expect(equipment.armorId).toBe('arm-201');
      expect(equipment.accessory1Id).toBe('acs-001');
    });

    it('应该正确处理已达最大等级的角色', () => {
      const level = getSafeLevel('char_102', 999);
      const equipment = normalizeEquipment('char_102', null);
      
      expect(level).toBe(99);
      expect(equipment.weaponId).toBeNull();
    });
  });

  describe('数据保护集成测试', () => {
    
    it('不应因无效输入而丢失用户数据', () => {
      const level = getSafeLevel('char_1', 50);
      const equipment = normalizeEquipment('char_1', {
        weaponId: 'wpn-102',
        armorId: 'invalid-armor'
      });
      
      expect(level).toBe(50);
      expect(equipment.weaponId).toBe('wpn-102');
      expect(equipment.armorId).toBeNull();
    });

    it('应正确处理部分有效的装备数据', () => {
      const equipment = normalizeEquipment('char_1', {
        weaponId: 'wpn-102',
        armorId: 'wpn-101',
        accessory1Id: 'acs-001'
      });
      
      expect(equipment.weaponId).toBe('wpn-102');
      expect(equipment.armorId).toBeNull();
      expect(equipment.accessory1Id).toBe('acs-001');
    });
  });
});
