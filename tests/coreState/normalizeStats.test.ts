import { describe, it, expect } from 'vitest';
import { CharacterStat, CharacterEquipment, CharacterSkills, BattlePartySlots } from '../../types';

const INITIAL_CHARACTER_LEVEL: Record<string, number> = {
  'char_1': 1,
  'char_101': 1,
  'char_102': 99,
  'char_103': 2,
  'char_104': 4,
  'char_105': 9,
  'char_106': 7,
  'char_107': 7,
  'char_108': 7,
  'char_109': 5,
  'char_110': 9,
  'char_111': 9
};

const INITIAL_CHARACTER_AFFINITY: Record<string, number> = {
  'char_1': 0,
  'char_101': 10,
  'char_102': 5,
  'char_103': 5,
  'char_104': 1,
  'char_105': 1,
  'char_106': 1,
  'char_107': 1,
  'char_108': 1,
  'char_109': 3,
  'char_110': 1,
  'char_111': 1
};

const INITIAL_CHARACTER_EQUIPMENT: Record<string, CharacterEquipment> = {
  'char_1': { weaponId: 'wpn-101', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_101': { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null },
  'char_102': { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null },
  'char_103': { weaponId: 'wpn-201', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_104': { weaponId: 'wpn-301', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_105': { weaponId: 'wpn-401', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_106': { weaponId: 'wpn-501', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_107': { weaponId: 'wpn-201', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_108': { weaponId: 'wpn-101', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_109': { weaponId: 'wpn-601', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_110': { weaponId: 'wpn-701', armorId: null, accessory1Id: null, accessory2Id: null },
  'char_111': { weaponId: 'wpn-301', armorId: null, accessory1Id: null, accessory2Id: null }
};

const INITIAL_CHARACTER_SKILLS: Record<string, CharacterSkills> = {
  'char_103': { slot1: 551, slot2: 552, slot3: 553, slot4: 542, slot5: 545, slot6: 727, slot7: 728, slot8: 802 },
  'char_104': { slot1: 529, slot2: 526, slot3: 521, slot4: 531, slot5: 534, slot6: 537, slot7: 771, slot8: 781 }
};

const INITIAL_BATTLE_PARTY: BattlePartySlots = ['char_1', null, null, null];

const mockCharacters: Record<string, { battleData?: { maxLevel: number } }> = {
  'char_1': { battleData: { maxLevel: 100 } },
  'char_101': { battleData: { maxLevel: 99 } },
  'char_102': { battleData: { maxLevel: 99 } },
  'char_103': { battleData: { maxLevel: 99 } },
  'char_104': { battleData: { maxLevel: 99 } },
  'char_105': { battleData: { maxLevel: 99 } },
  'char_106': { battleData: { maxLevel: 99 } },
  'char_107': { battleData: { maxLevel: 99 } },
  'char_108': { battleData: { maxLevel: 99 } },
  'char_109': { battleData: { maxLevel: 99 } },
  'char_110': { battleData: { maxLevel: 99 } },
  'char_111': { battleData: { maxLevel: 99 } }
};

const mockItemsEquip: Record<string, { id: string; category: 'wpn' | 'arm' | 'acs' }> = {
  'wpn-101': { id: 'wpn-101', category: 'wpn' },
  'wpn-102': { id: 'wpn-102', category: 'wpn' },
  'wpn-201': { id: 'wpn-201', category: 'wpn' },
  'wpn-301': { id: 'wpn-301', category: 'wpn' },
  'wpn-401': { id: 'wpn-401', category: 'wpn' },
  'wpn-501': { id: 'wpn-501', category: 'wpn' },
  'wpn-601': { id: 'wpn-601', category: 'wpn' },
  'wpn-701': { id: 'wpn-701', category: 'wpn' },
  'arm-101': { id: 'arm-101', category: 'arm' },
  'arm-201': { id: 'arm-201', category: 'arm' },
  'arm-301': { id: 'arm-301', category: 'arm' },
  'acs-001': { id: 'acs-001', category: 'acs' },
  'acs-002': { id: 'acs-002', category: 'acs' },
  'acs-003': { id: 'acs-003', category: 'acs' }
};

const getMaxLevelByCharacter = (charId: string): number => {
  return mockCharacters[charId]?.battleData?.maxLevel ?? 99;
};

const normalizeCharacterStats = (rawStats?: Record<string, any>): Record<string, CharacterStat> => {
  const normalized: Record<string, CharacterStat> = {};

  Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
    const raw = rawStats?.[charId] || {};
    const maxLevel = getMaxLevelByCharacter(charId);
    const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
    const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] ?? 0;
    
    const rawLevel = raw.level !== undefined ? Number(raw.level) : NaN;
    const rawAffinity = raw.affinity !== undefined ? Number(raw.affinity) : NaN;
    const rawExp = raw.exp !== undefined ? Number(raw.exp) : NaN;
    
    const safeLevel = Math.max(1, Math.min(maxLevel, isNaN(rawLevel) ? initialLevel : rawLevel));
    const safeAffinity = Math.max(0, Math.min(100, isNaN(rawAffinity) ? initialAffinity : rawAffinity));
    const safeExp = safeLevel >= maxLevel ? 0 : Math.max(0, isNaN(rawExp) ? 0 : rawExp);

    normalized[charId] = {
      level: safeLevel,
      affinity: safeAffinity,
      exp: safeExp
    };
  });

  return normalized;
};

const normalizeCharacterEquipments = (rawEquipments?: Record<string, any>): Record<string, CharacterEquipment> => {
  const normalized: Record<string, CharacterEquipment> = {};

  const toValidId = (value: any, category: 'wpn' | 'arm' | 'acs', fallback: string | null): string | null => {
    if (typeof value !== 'string' || !value.trim()) {
      if (fallback && mockItemsEquip[fallback]?.category === category) return fallback;
      return null;
    }
    const id = value.trim();
    const item = mockItemsEquip[id];
    if (!item || item.category !== category) {
      if (fallback && mockItemsEquip[fallback]?.category === category) return fallback;
      return null;
    }
    return id;
  };

  Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
    const base = INITIAL_CHARACTER_EQUIPMENT[charId] || { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null };
    const raw = rawEquipments?.[charId] || {};

    normalized[charId] = {
      weaponId: toValidId(raw.weaponId, 'wpn', base.weaponId),
      armorId: toValidId(raw.armorId, 'arm', base.armorId),
      accessory1Id: toValidId(raw.accessory1Id, 'acs', base.accessory1Id),
      accessory2Id: toValidId(raw.accessory2Id, 'acs', base.accessory2Id)
    };
  });

  return normalized;
};

const normalizeCharacterSkills = (rawSkills?: Record<string, any>): Record<string, CharacterSkills> => {
  const normalized: Record<string, CharacterSkills> = {};

  Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
    const raw = rawSkills?.[charId] || {};
    const defaultSkills = INITIAL_CHARACTER_SKILLS[charId] || {
      slot1: null, slot2: null, slot3: null, slot4: null,
      slot5: null, slot6: null, slot7: null, slot8: null
    };
    
    normalized[charId] = {
      slot1: typeof raw.slot1 === 'number' ? raw.slot1 : defaultSkills.slot1,
      slot2: typeof raw.slot2 === 'number' ? raw.slot2 : defaultSkills.slot2,
      slot3: typeof raw.slot3 === 'number' ? raw.slot3 : defaultSkills.slot3,
      slot4: typeof raw.slot4 === 'number' ? raw.slot4 : defaultSkills.slot4,
      slot5: typeof raw.slot5 === 'number' ? raw.slot5 : defaultSkills.slot5,
      slot6: typeof raw.slot6 === 'number' ? raw.slot6 : defaultSkills.slot6,
      slot7: typeof raw.slot7 === 'number' ? raw.slot7 : defaultSkills.slot7,
      slot8: typeof raw.slot8 === 'number' ? raw.slot8 : defaultSkills.slot8
    };
  });

  return normalized;
};

const normalizeBattleParty = (rawParty?: any): BattlePartySlots => {
  const fallback: BattlePartySlots = [...INITIAL_BATTLE_PARTY];
  if (!Array.isArray(rawParty) || rawParty.length !== 4) return fallback;

  const usedIds = new Set<string>();
  const result: BattlePartySlots = ['char_1', null, null, null];

  for (let i = 1; i < 4; i++) {
    const candidate = rawParty[i];
    if (typeof candidate !== 'string') continue;
    const id = candidate.trim();
    if (!id || id === 'char_1') continue;
    if (!mockCharacters[id]) continue;
    if (usedIds.has(id)) continue;
    usedIds.add(id);
    result[i] = id;
  }

  return result;
};

describe('normalizeCharacterStats - 角色属性归一化', () => {
  
  describe('数据保护测试 - 确保用户数据不被fallback覆盖', () => {
    
    it('应该保留用户的高等级数据，不使用初始值覆盖', () => {
      const rawStats = {
        'char_102': { level: 50, affinity: 30, exp: 100 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_102'].level).toBe(50);
      expect(result['char_102'].affinity).toBe(30);
      expect(result['char_102'].exp).toBe(100);
    });

    it('应该保留用户等级等于初始等级的情况', () => {
      const rawStats = {
        'char_102': { level: 99, affinity: 5, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_102'].level).toBe(99);
    });

    it('应该保留用户的高好感度数据', () => {
      const rawStats = {
        'char_103': { level: 10, affinity: 80, exp: 500 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_103'].affinity).toBe(80);
    });

    it('应该保留用户的经验值数据', () => {
      const rawStats = {
        'char_1': { level: 10, affinity: 0, exp: 5000 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].exp).toBe(5000);
    });

    it('应该保留多个角色的用户数据', () => {
      const rawStats = {
        'char_103': { level: 20, affinity: 50, exp: 1000 },
        'char_104': { level: 15, affinity: 30, exp: 800 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_103'].level).toBe(20);
      expect(result['char_103'].affinity).toBe(50);
      expect(result['char_104'].level).toBe(15);
      expect(result['char_104'].affinity).toBe(30);
    });
  });

  describe('边界值测试 - 最小值、最大值、边界-1、边界+1', () => {
    
    it('应该将等级限制在最小值 1', () => {
      const rawStats = {
        'char_1': { level: 0, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该将等级限制在最大值 (char_1 maxLevel=100)', () => {
      const rawStats = {
        'char_1': { level: 150, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(100);
    });

    it('应该正确处理等级边界值 99 (char_102 maxLevel=99)', () => {
      const rawStats = {
        'char_102': { level: 99, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_102'].level).toBe(99);
    });

    it('应该将好感度限制在最小值 0', () => {
      const rawStats = {
        'char_1': { level: 1, affinity: -10, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].affinity).toBe(0);
    });

    it('应该将好感度限制在最大值 100', () => {
      const rawStats = {
        'char_1': { level: 1, affinity: 150, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].affinity).toBe(100);
    });

    it('应该正确处理好感度边界值 0', () => {
      const rawStats = {
        'char_1': { level: 1, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].affinity).toBe(0);
    });

    it('应该正确处理好感度边界值 100', () => {
      const rawStats = {
        'char_1': { level: 1, affinity: 100, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].affinity).toBe(100);
    });

    it('应该将经验值限制在最小值 0', () => {
      const rawStats = {
        'char_1': { level: 1, affinity: 0, exp: -100 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].exp).toBe(0);
    });

    it('应该在达到最大等级时将经验值设为 0', () => {
      const rawStats = {
        'char_102': { level: 99, affinity: 0, exp: 9999 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_102'].exp).toBe(0);
    });
  });

  describe('边缘情况测试 - null, undefined, NaN, 0, 负数, 字符串数字', () => {
    
    it('应该正确处理 undefined 输入', () => {
      const result = normalizeCharacterStats(undefined);
      
      expect(result['char_102'].level).toBe(99);
      expect(result['char_103'].level).toBe(2);
      expect(typeof result['char_101'].affinity).toBe('number');
      expect(result['char_101'].affinity).toBeGreaterThanOrEqual(0);
    });

    it('应该正确处理 null 输入', () => {
      const result = normalizeCharacterStats(null as any);
      
      expect(result['char_102'].level).toBe(99);
    });

    it('应该正确处理空对象输入', () => {
      const result = normalizeCharacterStats({});
      
      expect(result['char_102'].level).toBe(99);
      expect(result['char_103'].level).toBe(2);
    });

    it('应该正确处理 NaN 等级', () => {
      const rawStats = {
        'char_1': { level: NaN, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该正确处理 null 等级', () => {
      const rawStats = {
        'char_1': { level: null, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该正确处理 undefined 等级', () => {
      const rawStats = {
        'char_1': { affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该正确处理字符串数字等级', () => {
      const rawStats = {
        'char_1': { level: '50', affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(50);
    });

    it('应该正确处理无效字符串等级', () => {
      const rawStats = {
        'char_1': { level: 'invalid', affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该正确处理负数等级', () => {
      const rawStats = {
        'char_1': { level: -5, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该正确处理 0 等级', () => {
      const rawStats = {
        'char_1': { level: 0, affinity: 0, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(1);
    });

    it('应该正确处理 null 好感度', () => {
      const rawStats = {
        'char_1': { level: 1, affinity: null, exp: 0 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].affinity).toBe(0);
    });

    it('应该正确处理 undefined 好感度', () => {
      const rawStats = {
        'char_101': { level: 1 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(typeof result['char_101'].affinity).toBe('number');
      expect(result['char_101'].affinity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('正常数据测试 - 完整数据、部分数据、空输入', () => {
    
    it('应该正确处理完整的角色数据', () => {
      const rawStats = {
        'char_1': { level: 50, affinity: 60, exp: 10000 },
        'char_103': { level: 30, affinity: 45, exp: 5000 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_1'].level).toBe(50);
      expect(result['char_1'].affinity).toBe(60);
      expect(result['char_1'].exp).toBe(10000);
      expect(result['char_103'].level).toBe(30);
      expect(result['char_103'].affinity).toBe(45);
    });

    it('应该正确处理部分角色数据', () => {
      const rawStats = {
        'char_103': { level: 10, affinity: 20, exp: 500 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['char_103'].level).toBe(10);
      expect(result['char_102'].level).toBe(99);
      expect(typeof result['char_102'].affinity).toBe('number');
      expect(result['char_102'].affinity).toBeGreaterThanOrEqual(0);
    });

    it('应该为所有已知角色生成数据', () => {
      const result = normalizeCharacterStats({});
      
      const expectedChars = Object.keys(INITIAL_CHARACTER_LEVEL);
      expect(Object.keys(result).length).toBe(expectedChars.length);
      expectedChars.forEach(charId => {
        expect(result[charId]).toBeDefined();
        expect(typeof result[charId].level).toBe('number');
        expect(typeof result[charId].affinity).toBe('number');
        expect(typeof result[charId].exp).toBe('number');
      });
    });

    it('应该忽略未知角色的数据', () => {
      const rawStats = {
        'unknown_char': { level: 50, affinity: 30, exp: 100 }
      };
      const result = normalizeCharacterStats(rawStats);
      
      expect(result['unknown_char']).toBeUndefined();
    });
  });
});

describe('normalizeCharacterEquipments - 角色装备归一化', () => {
  
  describe('数据保护测试', () => {
    
    it('应该保留用户的有效武器数据', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'wpn-102', armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-102');
    });

    it('应该保留用户的有效防具数据', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'wpn-101', armorId: 'arm-201', accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].armorId).toBe('arm-201');
    });

    it('应该保留用户的有效饰品数据', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'wpn-101', armorId: null, accessory1Id: 'acs-001', accessory2Id: 'acs-002' }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].accessory1Id).toBe('acs-001');
      expect(result['char_1'].accessory2Id).toBe('acs-002');
    });

    it('应该保留初始装备配置', () => {
      const result = normalizeCharacterEquipments(undefined);
      
      expect(result['char_103'].weaponId).toBe('wpn-201');
    });
  });

  describe('边界值测试', () => {
    
    it('应该正确处理空字符串武器ID', () => {
      const rawEquipments = {
        'char_1': { weaponId: '', armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-101');
    });

    it('应该正确处理空白字符串武器ID', () => {
      const rawEquipments = {
        'char_1': { weaponId: '   ', armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-101');
    });

    it('应该正确处理 null 武器ID', () => {
      const rawEquipments = {
        'char_101': { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_101'].weaponId).toBeNull();
    });
  });

  describe('边缘情况测试', () => {
    
    it('应该正确处理 undefined 输入', () => {
      const result = normalizeCharacterEquipments(undefined);
      
      expect(Object.keys(result).length).toBe(Object.keys(INITIAL_CHARACTER_LEVEL).length);
    });

    it('应该正确处理 null 输入', () => {
      const result = normalizeCharacterEquipments(null as any);
      
      expect(result['char_1']).toBeDefined();
    });

    it('应该正确处理空对象输入', () => {
      const result = normalizeCharacterEquipments({});
      
      expect(result['char_1']).toBeDefined();
    });

    it('应该拒绝无效的武器ID', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'invalid-weapon', armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-101');
    });

    it('应该拒绝类别不匹配的装备ID（武器ID放在防具槽）', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'wpn-101', armorId: 'wpn-102', accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].armorId).toBeNull();
    });

    it('应该拒绝类别不匹配的装备ID（防具ID放在武器槽）', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'arm-201', armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-101');
    });

    it('应该拒绝类别不匹配的装备ID（饰品ID放在武器槽）', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'acs-001', armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-101');
    });

    it('应该正确处理非字符串类型的装备ID', () => {
      const rawEquipments = {
        'char_1': { weaponId: 123, armorId: null, accessory1Id: null, accessory2Id: null }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-101');
    });

    it('应该正确处理部分缺失的装备数据', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'wpn-102' }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-102');
      expect(result['char_1'].armorId).toBeNull();
    });
  });

  describe('正常数据测试', () => {
    
    it('应该正确处理完整的装备数据', () => {
      const rawEquipments = {
        'char_1': { weaponId: 'wpn-102', armorId: 'arm-201', accessory1Id: 'acs-001', accessory2Id: 'acs-002' }
      };
      const result = normalizeCharacterEquipments(rawEquipments);
      
      expect(result['char_1'].weaponId).toBe('wpn-102');
      expect(result['char_1'].armorId).toBe('arm-201');
      expect(result['char_1'].accessory1Id).toBe('acs-001');
      expect(result['char_1'].accessory2Id).toBe('acs-002');
    });

    it('应该为非战斗角色保留 null 武器', () => {
      const result = normalizeCharacterEquipments(undefined);
      
      expect(result['char_101'].weaponId).toBeNull();
    });

    it('应该为所有角色生成装备数据', () => {
      const result = normalizeCharacterEquipments({});
      
      const expectedChars = Object.keys(INITIAL_CHARACTER_LEVEL);
      expect(Object.keys(result).length).toBe(expectedChars.length);
    });
  });
});

describe('normalizeCharacterSkills - 角色技能归一化', () => {
  
  describe('数据保护测试', () => {
    
    it('应该保留用户的有效技能数据', () => {
      const rawSkills = {
        'char_1': { slot1: 100, slot2: 200, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBe(100);
      expect(result['char_1'].slot2).toBe(200);
    });

    it('应该保留用户的 null 技能槽', () => {
      const rawSkills = {
        'char_1': { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBeNull();
    });

    it('应该保留初始技能配置', () => {
      const result = normalizeCharacterSkills(undefined);
      
      expect(result['char_103'].slot1).toBe(551);
      expect(result['char_103'].slot2).toBe(552);
    });
  });

  describe('边界值测试', () => {
    
    it('应该正确处理 0 作为技能ID', () => {
      const rawSkills = {
        'char_1': { slot1: 0, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBe(0);
    });

    it('应该正确处理大数值技能ID', () => {
      const rawSkills = {
        'char_1': { slot1: 999999, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBe(999999);
    });

    it('应该正确处理负数技能ID', () => {
      const rawSkills = {
        'char_1': { slot1: -1, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBe(-1);
    });
  });

  describe('边缘情况测试', () => {
    
    it('应该正确处理 undefined 输入', () => {
      const result = normalizeCharacterSkills(undefined);
      
      expect(result['char_1'].slot1).toBeNull();
      expect(result['char_1'].slot8).toBeNull();
    });

    it('应该正确处理 null 输入', () => {
      const result = normalizeCharacterSkills(null as any);
      
      expect(result['char_1']).toBeDefined();
    });

    it('应该正确处理空对象输入', () => {
      const result = normalizeCharacterSkills({});
      
      expect(result['char_1']).toBeDefined();
    });

    it('应该拒绝字符串类型的技能ID', () => {
      const rawSkills = {
        'char_1': { slot1: '100', slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBeNull();
    });

    it('应该拒绝 null 类型的技能ID', () => {
      const rawSkills = {
        'char_103': { slot1: null, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_103'].slot1).toBe(551);
    });

    it('应该拒绝 undefined 类型的技能ID', () => {
      const rawSkills = {
        'char_103': { slot1: undefined }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_103'].slot1).toBe(551);
    });

    it('应该拒绝对象类型的技能ID', () => {
      const rawSkills = {
        'char_1': { slot1: { id: 100 }, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBeNull();
    });

    it('应该正确处理部分缺失的技能数据', () => {
      const rawSkills = {
        'char_103': { slot1: 999 }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_103'].slot1).toBe(999);
      expect(result['char_103'].slot2).toBe(552);
    });

    it('应该正确处理 NaN 技能ID', () => {
      const rawSkills = {
        'char_1': { slot1: NaN, slot2: null, slot3: null, slot4: null, slot5: null, slot6: null, slot7: null, slot8: null }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBeNaN();
    });
  });

  describe('正常数据测试', () => {
    
    it('应该正确处理完整的技能数据', () => {
      const rawSkills = {
        'char_1': { slot1: 100, slot2: 200, slot3: 300, slot4: 400, slot5: 500, slot6: 600, slot7: 700, slot8: 800 }
      };
      const result = normalizeCharacterSkills(rawSkills);
      
      expect(result['char_1'].slot1).toBe(100);
      expect(result['char_1'].slot8).toBe(800);
    });

    it('应该为所有角色生成技能数据', () => {
      const result = normalizeCharacterSkills({});
      
      const expectedChars = Object.keys(INITIAL_CHARACTER_LEVEL);
      expect(Object.keys(result).length).toBe(expectedChars.length);
    });

    it('应该正确处理 char_1 的默认技能（全 null）', () => {
      const result = normalizeCharacterSkills(undefined);
      
      expect(result['char_1'].slot1).toBeNull();
      expect(result['char_1'].slot2).toBeNull();
      expect(result['char_1'].slot3).toBeNull();
      expect(result['char_1'].slot4).toBeNull();
      expect(result['char_1'].slot5).toBeNull();
      expect(result['char_1'].slot6).toBeNull();
      expect(result['char_1'].slot7).toBeNull();
      expect(result['char_1'].slot8).toBeNull();
    });
  });
});

describe('normalizeBattleParty - 战斗队伍归一化', () => {
  
  describe('数据保护测试', () => {
    
    it('应该保留用户的有效队伍配置', () => {
      const rawParty = ['char_1', 'char_103', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[0]).toBe('char_1');
      expect(result[1]).toBe('char_103');
      expect(result[2]).toBe('char_104');
      expect(result[3]).toBe('char_105');
    });

    it('应该保留用户的 null 槽位', () => {
      const rawParty = ['char_1', 'char_103', null, null];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[0]).toBe('char_1');
      expect(result[1]).toBe('char_103');
      expect(result[2]).toBeNull();
      expect(result[3]).toBeNull();
    });

    it('应该保留第一个槽位为 char_1', () => {
      const rawParty = ['char_1', 'char_103', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[0]).toBe('char_1');
    });
  });

  describe('边界值测试', () => {
    
    it('应该正确处理空字符串角色ID', () => {
      const rawParty = ['char_1', '', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBeNull();
    });

    it('应该正确处理空白字符串角色ID', () => {
      const rawParty = ['char_1', '   ', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBeNull();
    });

    it('应该正确处理只有 char_1 的队伍', () => {
      const rawParty = ['char_1', null, null, null];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[0]).toBe('char_1');
      expect(result[1]).toBeNull();
      expect(result[2]).toBeNull();
      expect(result[3]).toBeNull();
    });
  });

  describe('边缘情况测试', () => {
    
    it('应该正确处理 undefined 输入', () => {
      const result = normalizeBattleParty(undefined);
      
      expect(result).toEqual(INITIAL_BATTLE_PARTY);
    });

    it('应该正确处理 null 输入', () => {
      const result = normalizeBattleParty(null);
      
      expect(result).toEqual(INITIAL_BATTLE_PARTY);
    });

    it('应该正确处理非数组输入', () => {
      const result = normalizeBattleParty('not an array');
      
      expect(result).toEqual(INITIAL_BATTLE_PARTY);
    });

    it('应该正确处理长度不足的数组', () => {
      const result = normalizeBattleParty(['char_1', 'char_103']);
      
      expect(result).toEqual(INITIAL_BATTLE_PARTY);
    });

    it('应该正确处理长度过长的数组', () => {
      const result = normalizeBattleParty(['char_1', 'char_103', 'char_104', 'char_105', 'char_106']);
      
      expect(result).toEqual(INITIAL_BATTLE_PARTY);
    });

    it('应该拒绝未知角色ID', () => {
      const rawParty = ['char_1', 'unknown_char', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBeNull();
    });

    it('应该拒绝在非首位出现 char_1', () => {
      const rawParty = ['char_1', 'char_1', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBeNull();
    });

    it('应该拒绝重复的角色ID', () => {
      const rawParty = ['char_1', 'char_103', 'char_103', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBe('char_103');
      expect(result[2]).toBeNull();
    });

    it('应该拒绝非字符串类型的角色ID', () => {
      const rawParty = ['char_1', 123, 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBeNull();
    });

    it('应该正确处理对象类型的角色ID', () => {
      const rawParty = ['char_1', { id: 'char_103' }, 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBeNull();
    });

    it('应该正确处理空数组', () => {
      const result = normalizeBattleParty([]);
      
      expect(result).toEqual(INITIAL_BATTLE_PARTY);
    });
  });

  describe('正常数据测试', () => {
    
    it('应该正确处理完整的队伍数据', () => {
      const rawParty = ['char_1', 'char_103', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result).toEqual(['char_1', 'char_103', 'char_104', 'char_105']);
    });

    it('应该正确处理部分队伍数据', () => {
      const rawParty = ['char_1', 'char_103', null, 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[0]).toBe('char_1');
      expect(result[1]).toBe('char_103');
      expect(result[2]).toBeNull();
      expect(result[3]).toBe('char_105');
    });

    it('应该正确处理带空格的角色ID', () => {
      const rawParty = ['char_1', ' char_103 ', 'char_104', 'char_105'];
      const result = normalizeBattleParty(rawParty);
      
      expect(result[1]).toBe('char_103');
    });

    it('应该返回默认队伍当输入无效时', () => {
      const result = normalizeBattleParty(undefined);
      
      expect(result[0]).toBe('char_1');
      expect(result[1]).toBeNull();
      expect(result[2]).toBeNull();
      expect(result[3]).toBeNull();
    });

    it('应该保持队伍长度始终为 4', () => {
      const result1 = normalizeBattleParty(undefined);
      const result2 = normalizeBattleParty(['char_1', 'char_103']);
      const result3 = normalizeBattleParty(['char_1', 'char_103', 'char_104', 'char_105']);
      
      expect(result1.length).toBe(4);
      expect(result2.length).toBe(4);
      expect(result3.length).toBe(4);
    });
  });
});
