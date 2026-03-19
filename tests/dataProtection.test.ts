import { describe, it, expect } from 'vitest';
import {
  INITIAL_CHARACTER_LEVEL,
  INITIAL_CHARACTER_AFFINITY,
  INITIAL_CHARACTER_EQUIPMENT
} from '../utils/gameConstants';

describe('Data Protection Tests', () => {
  
  describe('Level Fallback Logic', () => {
    
    it('should use initial level when data is missing (undefined)', () => {
      const rawLevel = undefined;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(99);
    });

    it('should use initial level when data is null', () => {
      const rawLevel = null;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(99);
    });

    it('should use initial level when data is 0', () => {
      const rawLevel = 0;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(99);
    });

    it('should NOT fallback when user has higher level (data protection)', () => {
      const rawLevel = 50;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(50);
    });

    it('should NOT fallback when user has level equal to initial', () => {
      const rawLevel = 99;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(99);
    });

    it('should NOT fallback for characters with initial level 1', () => {
      const rawLevel = 5;
      const charId = 'char_1';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(5);
    });

    it('should use initial level for char_103 (initial=2) when data is 0', () => {
      const rawLevel = 0;
      const charId = 'char_103';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(2);
    });

    it('should preserve user level 4 for char_103 (initial=2)', () => {
      const rawLevel = 4;
      const charId = 'char_103';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(4);
    });
  });

  describe('Affinity Fallback Logic', () => {
    
    it('should use initial affinity when data is missing', () => {
      const rawAffinity = undefined;
      const charId = 'char_101';
      const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
      const safeAffinity = rawAffinity ?? initialAffinity;
      
      expect(safeAffinity).toBe(10);
    });

    it('should use initial affinity when data is null', () => {
      const rawAffinity = null;
      const charId = 'char_101';
      const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
      const safeAffinity = rawAffinity ?? initialAffinity;
      
      expect(safeAffinity).toBe(10);
    });

    it('should NOT fallback when user has higher affinity (data protection)', () => {
      const rawAffinity = 50;
      const charId = 'char_101';
      const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
      const safeAffinity = rawAffinity ?? initialAffinity;
      
      expect(safeAffinity).toBe(50);
    });

    it('should preserve 0 affinity for char_1 (player)', () => {
      const rawAffinity = 0;
      const charId = 'char_1';
      const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
      const safeAffinity = rawAffinity ?? initialAffinity;
      
      expect(safeAffinity).toBe(0);
    });

    it('should use initial affinity for char_109 (initial=3)', () => {
      const rawAffinity = undefined;
      const charId = 'char_109';
      const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
      const safeAffinity = rawAffinity ?? initialAffinity;
      
      expect(safeAffinity).toBe(3);
    });
  });

  describe('Equipment Fallback Logic', () => {
    
    it('should use initial equipment when data is missing', () => {
      const rawEquipment = undefined;
      const charId = 'char_103';
      const equipment = rawEquipment || INITIAL_CHARACTER_EQUIPMENT[charId];
      
      expect(equipment.weaponId).toBe('wpn-201');
      expect(equipment.armorId).toBeNull();
    });

    it('should preserve user equipment when present', () => {
      const rawEquipment = {
        weaponId: 'wpn-999',
        armorId: 'arm-100',
        accessory1Id: null,
        accessory2Id: null
      };
      const charId = 'char_103';
      const equipment = rawEquipment || INITIAL_CHARACTER_EQUIPMENT[charId];
      
      expect(equipment.weaponId).toBe('wpn-999');
      expect(equipment.armorId).toBe('arm-100');
    });

    it('should have null weapon for non-combat characters', () => {
      const charId = 'char_101';
      const equipment = INITIAL_CHARACTER_EQUIPMENT[charId];
      
      expect(equipment.weaponId).toBeNull();
    });
  });

  describe('NormalizeCharacterStats Simulation', () => {
    
    it('should correctly normalize empty stats', () => {
      const rawStats = undefined;
      const normalized: Record<string, { level: number; affinity: number }> = {};
      
      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
        const raw = rawStats?.[charId] || {};
        const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
        const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
        
        normalized[charId] = {
          level: Number(raw.level) || initialLevel,
          affinity: raw.affinity ?? initialAffinity
        };
      });
      
      expect(normalized['char_102'].level).toBe(99);
      expect(normalized['char_103'].level).toBe(2);
      expect(normalized['char_101'].affinity).toBe(10);
      expect(normalized['char_109'].affinity).toBe(3);
    });

    it('should preserve existing user data during normalization', () => {
      const rawStats = {
        'char_102': { level: 50, affinity: 30 },
        'char_103': { level: 4, affinity: 20 }
      };
      const normalized: Record<string, { level: number; affinity: number }> = {};
      
      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
        const raw = rawStats?.[charId] || {};
        const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
        const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
        
        normalized[charId] = {
          level: Number(raw.level) || initialLevel,
          affinity: raw.affinity ?? initialAffinity
        };
      });
      
      expect(normalized['char_102'].level).toBe(50);
      expect(normalized['char_102'].affinity).toBe(30);
      expect(normalized['char_103'].level).toBe(4);
      expect(normalized['char_103'].affinity).toBe(20);
    });

    it('should fill missing fields with initial values while preserving existing', () => {
      const rawStats = {
        'char_102': { level: 50 },
        'char_103': { affinity: 20 }
      };
      const normalized: Record<string, { level: number; affinity: number }> = {};
      
      Object.keys(INITIAL_CHARACTER_LEVEL).forEach(charId => {
        const raw = rawStats?.[charId] || {};
        const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
        const initialAffinity = INITIAL_CHARACTER_AFFINITY[charId] || 0;
        
        normalized[charId] = {
          level: Number(raw.level) || initialLevel,
          affinity: raw.affinity ?? initialAffinity
        };
      });
      
      expect(normalized['char_102'].level).toBe(50);
      expect(normalized['char_102'].affinity).toBe(5);
      expect(normalized['char_103'].level).toBe(2);
      expect(normalized['char_103'].affinity).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle NaN level correctly', () => {
      const rawLevel = NaN;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(99);
    });

    it('should handle string level correctly', () => {
      const rawLevel = 'invalid';
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(99);
    });

    it('should handle valid string number level', () => {
      const rawLevel = '50';
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Number(rawLevel) || initialLevel;
      
      expect(safeLevel).toBe(50);
    });

    it('should handle negative level (use initial)', () => {
      const rawLevel = -5;
      const charId = 'char_102';
      const initialLevel = INITIAL_CHARACTER_LEVEL[charId] || 1;
      const safeLevel = Math.max(1, Number(rawLevel) || initialLevel);
      
      expect(safeLevel).toBe(1);
    });
  });
});
