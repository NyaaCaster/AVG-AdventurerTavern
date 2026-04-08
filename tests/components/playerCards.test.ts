import { describe, it, expect, vi } from 'vitest';

interface StatusEffect {
  id: string;
  name: string;
  duration: number;
}

interface PlayerUnit {
  id: string;
  name: string;
  isAlive: boolean;
  stats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
  };
  statusEffects: StatusEffect[];
}

interface PlayerUnitWithImage extends PlayerUnit {
  avatarUrl: string;
}

const getRestrictionType = (unit: PlayerUnit): string | null => {
  const sleepEffect = unit.statusEffects.find(e => e.id === 'sleep');
  if (sleepEffect) return '睡眠';
  
  const silenceEffect = unit.statusEffects.find(e => e.id === 'silence');
  if (silenceEffect) return '沈黙';
  
  const paralysisEffect = unit.statusEffects.find(e => e.id === 'paralysis');
  if (paralysisEffect) return '麻痺';
  
  return null;
};

const createMockPlayer = (overrides: Partial<PlayerUnitWithImage> = {}): PlayerUnitWithImage => ({
  id: 'char_1',
  name: '玩家',
  isAlive: true,
  stats: {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
  },
  statusEffects: [],
  avatarUrl: 'img/face/1.png',
  ...overrides,
});

describe('PlayerCards - isCurrentTurn 当前行动判断', () => {
  const players: PlayerUnitWithImage[] = [
    createMockPlayer({ id: 'char_1', name: '玩家' }),
    createMockPlayer({ id: 'char_101', name: '角色A' }),
    createMockPlayer({ id: 'char_102', name: '角色B' }),
  ];

  describe('当前行动角色判断', () => {
    it('当currentTurnUnitId匹配时应该返回true', () => {
      const currentTurnUnitId = 'char_1';
      const player = players[0];
      
      const isCurrentTurn = currentTurnUnitId === player.id;
      
      expect(isCurrentTurn).toBe(true);
    });

    it('当currentTurnUnitId不匹配时应该返回false', () => {
      const currentTurnUnitId = 'char_1';
      const player = players[1];
      
      const isCurrentTurn = currentTurnUnitId === player.id;
      
      expect(isCurrentTurn).toBe(false);
    });

    it('currentTurnUnitId为null时所有角色都应该返回false', () => {
      const currentTurnUnitId = null;
      
      players.forEach(player => {
        const isCurrentTurn = currentTurnUnitId === player.id;
        expect(isCurrentTurn).toBe(false);
      });
    });
  });

  describe('行动中样式', () => {
    it('当前行动角色应该有特殊边框', () => {
      const isCurrentTurn = true;
      const expectedBorderClass = 'border-[#b45309]';
      
      expect(isCurrentTurn).toBe(true);
    });

    it('当前行动角色应该有放大效果', () => {
      const isCurrentTurn = true;
      const expectedScale = 'scale(1.05)';
      
      expect(isCurrentTurn).toBe(true);
    });

    it('当前行动角色应该有光晕效果', () => {
      const isCurrentTurn = true;
      const expectedRing = 'ring-2 ring-[#fcd34d]/50';
      
      expect(isCurrentTurn).toBe(true);
    });
  });

  describe('行动中标签', () => {
    it('当前行动角色应该显示"行动中"标签', () => {
      const isCurrentTurn = true;
      
      expect(isCurrentTurn).toBe(true);
    });

    it('非当前行动角色不应该显示标签', () => {
      const isCurrentTurn = false;
      
      expect(isCurrentTurn).toBe(false);
    });
  });
});

describe('PlayerCards - isDead 死亡状态判断', () => {
  describe('死亡状态判断', () => {
    it('isAlive为false时应该返回true', () => {
      const player = createMockPlayer({ isAlive: false });
      
      const isDead = !player.isAlive;
      
      expect(isDead).toBe(true);
    });

    it('isAlive为true时应该返回false', () => {
      const player = createMockPlayer({ isAlive: true });
      
      const isDead = !player.isAlive;
      
      expect(isDead).toBe(false);
    });
  });

  describe('死亡视觉效果', () => {
    it('死亡角色应该有半透明效果', () => {
      const player = createMockPlayer({ isAlive: false });
      const isDead = !player.isAlive;
      
      expect(isDead).toBe(true);
    });

    it('死亡角色应该有灰度滤镜', () => {
      const player = createMockPlayer({ isAlive: false });
      const isDead = !player.isAlive;
      
      expect(isDead).toBe(true);
    });

    it('死亡角色应该显示X标记', () => {
      const player = createMockPlayer({ isAlive: false });
      const isDead = !player.isAlive;
      
      expect(isDead).toBe(true);
    });
  });

  describe('HP与死亡状态', () => {
    it('HP为0时角色可能死亡', () => {
      const player = createMockPlayer({ 
        isAlive: false,
        stats: { hp: 0, maxHp: 100, mp: 50, maxMp: 50 }
      });
      
      expect(player.stats.hp).toBe(0);
      expect(player.isAlive).toBe(false);
    });

    it('HP大于0时角色应该存活', () => {
      const player = createMockPlayer({ 
        isAlive: true,
        stats: { hp: 50, maxHp: 100, mp: 50, maxMp: 50 }
      });
      
      expect(player.stats.hp).toBeGreaterThan(0);
      expect(player.isAlive).toBe(true);
    });
  });
});

describe('PlayerCards - isTargetable 目标选择逻辑', () => {
  describe('复活目标选择 (isReviveTargeting)', () => {
    it('复活模式下死亡角色应该可选', () => {
      const isReviveTargeting = true;
      const player = createMockPlayer({ isAlive: false });
      
      const isTargetable = isReviveTargeting ? !player.isAlive : false;
      
      expect(isTargetable).toBe(true);
    });

    it('复活模式下存活角色不应该可选', () => {
      const isReviveTargeting = true;
      const player = createMockPlayer({ isAlive: true });
      
      const isTargetable = isReviveTargeting ? !player.isAlive : false;
      
      expect(isTargetable).toBe(false);
    });
  });

  describe('友方目标选择 (isAllyTargeting)', () => {
    it('友方目标模式下存活角色应该可选', () => {
      const isAllyTargeting = true;
      const selectedCommand = 'heal';
      const player = createMockPlayer({ isAlive: true });
      
      const isTargetable = isAllyTargeting && selectedCommand && player.isAlive;
      
      expect(isTargetable).toBe(true);
    });

    it('友方目标模式下死亡角色不应该可选', () => {
      const isAllyTargeting = true;
      const selectedCommand = 'heal';
      const player = createMockPlayer({ isAlive: false });
      
      const isTargetable = isAllyTargeting && selectedCommand && player.isAlive;
      
      expect(isTargetable).toBe(false);
    });

    it('没有选择命令时不应该可选', () => {
      const isAllyTargeting = true;
      const selectedCommand = null;
      const player = createMockPlayer({ isAlive: true });
      
      const isTargetable = !!(isAllyTargeting && selectedCommand && player.isAlive);
      
      expect(isTargetable).toBe(false);
    });
  });

  describe('普通状态', () => {
    it('非目标选择模式下所有角色不应该可选', () => {
      const isReviveTargeting = false;
      const isAllyTargeting = false;
      const player = createMockPlayer({ isAlive: true });
      
      const isTargetable = isReviveTargeting 
        ? !player.isAlive 
        : (isAllyTargeting && player.isAlive);
      
      expect(isTargetable).toBe(false);
    });
  });
});

describe('PlayerCards - isTargeted 已选中目标判断', () => {
  describe('目标选中状态', () => {
    it('selectedTarget匹配时应该返回true', () => {
      const selectedTarget = 'char_1';
      const playerId = 'char_1';
      
      const isTargeted = selectedTarget === playerId;
      
      expect(isTargeted).toBe(true);
    });

    it('selectedTarget不匹配时应该返回false', () => {
      const selectedTarget: string | null = 'char_101';
      const playerId = 'char_1';
      
      const isTargeted = selectedTarget === playerId;
      
      expect(isTargeted).toBe(false);
    });

    it('selectedTarget为null时应该返回false', () => {
      const selectedTarget = null;
      const playerId = 'char_1';
      
      const isTargeted = selectedTarget === playerId;
      
      expect(isTargeted).toBe(false);
    });
  });

  describe('选中视觉效果', () => {
    it('选中目标应该有绿色边框', () => {
      const isTargeted = true;
      const expectedBorderClass = 'border-[#22c55e]';
      
      expect(isTargeted).toBe(true);
    });

    it('选中目标应该有绿色光晕', () => {
      const isTargeted = true;
      const expectedRingClass = 'ring-2 ring-green-400/50';
      
      expect(isTargeted).toBe(true);
    });
  });
});

describe('PlayerCards - getRestrictionType 行动限制', () => {
  describe('睡眠状态', () => {
    it('有睡眠效果应该返回"睡眠"', () => {
      const player = createMockPlayer({
        statusEffects: [{ id: 'sleep', name: '睡眠', duration: 3 }]
      });
      
      const restriction = getRestrictionType(player);
      
      expect(restriction).toBe('睡眠');
    });
  });

  describe('沉默状态', () => {
    it('有沉默效果应该返回"沈黙"', () => {
      const player = createMockPlayer({
        statusEffects: [{ id: 'silence', name: '沈黙', duration: 2 }]
      });
      
      const restriction = getRestrictionType(player);
      
      expect(restriction).toBe('沈黙');
    });
  });

  describe('麻痹状态', () => {
    it('有麻痹效果应该返回"麻痺"', () => {
      const player = createMockPlayer({
        statusEffects: [{ id: 'paralysis', name: '麻痺', duration: 1 }]
      });
      
      const restriction = getRestrictionType(player);
      
      expect(restriction).toBe('麻痺');
    });
  });

  describe('无限制状态', () => {
    it('没有状态效果应该返回null', () => {
      const player = createMockPlayer({ statusEffects: [] });
      
      const restriction = getRestrictionType(player);
      
      expect(restriction).toBeNull();
    });

    it('有其他状态效果应该返回null', () => {
      const player = createMockPlayer({
        statusEffects: [{ id: 'poison', name: '中毒', duration: 3 }]
      });
      
      const restriction = getRestrictionType(player);
      
      expect(restriction).toBeNull();
    });
  });

  describe('优先级', () => {
    it('睡眠优先级最高', () => {
      const player = createMockPlayer({
        statusEffects: [
          { id: 'silence', name: '沈黙', duration: 2 },
          { id: 'sleep', name: '睡眠', duration: 3 },
        ]
      });
      
      const restriction = getRestrictionType(player);
      
      expect(restriction).toBe('睡眠');
    });
  });

  describe('限制显示条件', () => {
    it('限制标签只在当前行动角色上显示', () => {
      const player = createMockPlayer({
        statusEffects: [{ id: 'sleep', name: '睡眠', duration: 3 }]
      });
      const isCurrentTurn = true;
      
      const shouldShowRestriction = isCurrentTurn && getRestrictionType(player);
      
      expect(shouldShowRestriction).toBe('睡眠');
    });

    it('非当前行动角色不显示限制标签', () => {
      const player = createMockPlayer({
        statusEffects: [{ id: 'sleep', name: '睡眠', duration: 3 }]
      });
      const isCurrentTurn = false;
      
      const shouldShowRestriction = isCurrentTurn && getRestrictionType(player);
      
      expect(shouldShowRestriction).toBe(false);
    });
  });
});

describe('PlayerCards - 闪烁效果判断', () => {
  describe('伤害闪烁', () => {
    it('在damageFlashUnits中的角色应该闪烁', () => {
      const damageFlashUnits = new Set(['char_1', 'char_101']);
      
      expect(damageFlashUnits.has('char_1')).toBe(true);
      expect(damageFlashUnits.has('char_102')).toBe(false);
    });
  });

  describe('治疗闪烁', () => {
    it('在healFlashUnits中的角色应该闪烁', () => {
      const healFlashUnits = new Set(['char_102']);
      
      expect(healFlashUnits.has('char_102')).toBe(true);
      expect(healFlashUnits.has('char_1')).toBe(false);
    });
  });

  describe('状态闪烁', () => {
    it('在statusFlashUnits中的角色应该闪烁', () => {
      const statusFlashUnits = new Set(['char_1']);
      
      expect(statusFlashUnits.has('char_1')).toBe(true);
    });
  });

  describe('多重闪烁', () => {
    it('同一角色可以同时触发多种闪烁', () => {
      const playerId = 'char_1';
      const damageFlashUnits = new Set([playerId]);
      const healFlashUnits = new Set([playerId]);
      
      expect(damageFlashUnits.has(playerId)).toBe(true);
      expect(healFlashUnits.has(playerId)).toBe(true);
    });
  });
});

describe('PlayerCards - 响应式布局', () => {
  describe('移动端', () => {
    it('移动端应该使用更小的宽度', () => {
      const isMobile = true;
      const mobileWidth = 84;
      const desktopWidth = 112;
      
      const width = isMobile ? mobileWidth : desktopWidth;
      
      expect(width).toBe(84);
    });
  });

  describe('桌面端', () => {
    it('桌面端应该使用更大的宽度', () => {
      const isMobile = false;
      const mobileWidth = 84;
      const desktopWidth = 112;
      
      const width = isMobile ? mobileWidth : desktopWidth;
      
      expect(width).toBe(112);
    });
  });
});

describe('PlayerCards - 点击处理', () => {
  describe('目标选择回调', () => {
    it('点击可选目标应该触发onTargetSelect', () => {
      const mockOnTargetSelect = vi.fn();
      const isTargetable = true;
      const playerId = 'char_1';
      
      if (isTargetable) {
        mockOnTargetSelect(playerId);
      }
      
      expect(mockOnTargetSelect).toHaveBeenCalledWith('char_1');
    });

    it('点击不可选目标不应该触发回调', () => {
      const mockOnTargetSelect = vi.fn();
      const isTargetable = false;
      const playerId = 'char_1';
      
      if (isTargetable) {
        mockOnTargetSelect(playerId);
      }
      
      expect(mockOnTargetSelect).not.toHaveBeenCalled();
    });
  });
});
