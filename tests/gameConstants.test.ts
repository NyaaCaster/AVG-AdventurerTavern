import { describe, it, expect } from 'vitest';
import {
  INITIAL_CHARACTER_LEVEL,
  INITIAL_CHARACTER_AFFINITY,
  INITIAL_CHARACTER_EQUIPMENT,
  INITIAL_CHARACTER_WEAPON,
  INITIAL_GOLD,
  INITIAL_INSPIRATION
} from '../utils/gameConstants';

describe('gameConstants', () => {
  describe('INITIAL_CHARACTER_LEVEL', () => {
    it('should have correct initial level for char_102 (米娜)', () => {
      expect(INITIAL_CHARACTER_LEVEL['char_102']).toBe(99);
    });

    it('should have correct initial level for char_103 (欧若拉)', () => {
      expect(INITIAL_CHARACTER_LEVEL['char_103']).toBe(2);
    });

    it('should have correct initial level for char_104 (朱迪斯)', () => {
      expect(INITIAL_CHARACTER_LEVEL['char_104']).toBe(4);
    });

    it('should have level 1 for char_1 (player)', () => {
      expect(INITIAL_CHARACTER_LEVEL['char_1']).toBe(1);
    });

    it('should have all expected characters defined', () => {
      const expectedChars = [
        'char_1', 'char_101', 'char_102', 'char_103', 'char_104',
        'char_105', 'char_106', 'char_107', 'char_108', 'char_109',
        'char_110', 'char_111'
      ];
      expectedChars.forEach(charId => {
        expect(INITIAL_CHARACTER_LEVEL[charId]).toBeDefined();
        expect(INITIAL_CHARACTER_LEVEL[charId]).toBeGreaterThan(0);
      });
    });
  });

  describe('INITIAL_CHARACTER_AFFINITY', () => {
    it('should have correct initial affinity for char_101 (莉莉娅)', () => {
      expect(INITIAL_CHARACTER_AFFINITY['char_101']).toBe(10);
    });

    it('should have correct initial affinity for char_102 (米娜)', () => {
      expect(INITIAL_CHARACTER_AFFINITY['char_102']).toBe(5);
    });

    it('should have correct initial affinity for char_109 (莱拉)', () => {
      expect(INITIAL_CHARACTER_AFFINITY['char_109']).toBe(3);
    });

    it('should have 0 affinity for char_1 (player)', () => {
      expect(INITIAL_CHARACTER_AFFINITY['char_1']).toBe(0);
    });

    it('should have affinity values in valid range (0-100)', () => {
      Object.entries(INITIAL_CHARACTER_AFFINITY).forEach(([charId, affinity]) => {
        expect(affinity).toBeGreaterThanOrEqual(0);
        expect(affinity).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('INITIAL_CHARACTER_EQUIPMENT', () => {
    it('should have correct weapon for char_103 (欧若拉)', () => {
      expect(INITIAL_CHARACTER_EQUIPMENT['char_103'].weaponId).toBe('wpn-201');
    });

    it('should have correct weapon for char_104 (朱迪斯)', () => {
      expect(INITIAL_CHARACTER_EQUIPMENT['char_104'].weaponId).toBe('wpn-301');
    });

    it('should have null weapon for non-combat characters', () => {
      expect(INITIAL_CHARACTER_EQUIPMENT['char_101'].weaponId).toBeNull();
      expect(INITIAL_CHARACTER_EQUIPMENT['char_102'].weaponId).toBeNull();
    });

    it('should have null armor and accessories for all characters initially', () => {
      Object.entries(INITIAL_CHARACTER_EQUIPMENT).forEach(([charId, equipment]) => {
        expect(equipment.armorId).toBeNull();
        expect(equipment.accessory1Id).toBeNull();
        expect(equipment.accessory2Id).toBeNull();
      });
    });
  });

  describe('INITIAL_CHARACTER_WEAPON', () => {
    it('should have correct weapon mapping', () => {
      expect(INITIAL_CHARACTER_WEAPON['char_1']).toBe('wpn-101');
      expect(INITIAL_CHARACTER_WEAPON['char_103']).toBe('wpn-201');
      expect(INITIAL_CHARACTER_WEAPON['char_104']).toBe('wpn-301');
      expect(INITIAL_CHARACTER_WEAPON['char_105']).toBe('wpn-401');
    });
  });

  describe('INITIAL_GOLD', () => {
    it('should be 100000', () => {
      expect(INITIAL_GOLD).toBe(100000);
    });
  });

  describe('INITIAL_INSPIRATION', () => {
    it('should be 10', () => {
      expect(INITIAL_INSPIRATION).toBe(10);
    });
  });
});
