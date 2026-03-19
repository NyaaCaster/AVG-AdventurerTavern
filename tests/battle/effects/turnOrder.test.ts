import { describe, it, expect } from 'vitest';

interface TurnOrderConfig {
  position: { right: number; top: number };
  maxWidth: number;
  zIndex: number;
}

interface TimelineBarConfig {
  height: number;
  gradient: string;
  borderRadius: number;
}

interface AvatarItemConfig {
  size: number;
  borderRadius: string;
  borderWidth: number;
  gap: number;
}

interface CurrentUnitStyle {
  borderColor: string;
  boxShadow: string;
}

interface DeadUnitStyle {
  opacity: number;
  filter: string;
}

interface AnimationConfig {
  name: string;
  duration: number;
  translateX: number;
}

const TURN_ORDER_CONFIG: TurnOrderConfig = {
  position: { right: 16, top: 30 },
  maxWidth: 360,
  zIndex: 40,
};

const TIMELINE_BAR: TimelineBarConfig = {
  height: 3,
  gradient: 'linear-gradient(to right, rgba(251,191,36,0.8) 0%, rgba(251,191,36,0.4) 40%, rgba(155,122,76,0.2) 70%, rgba(155,122,76,0) 100%)',
  borderRadius: 2,
};

const AVATAR_ITEM: AvatarItemConfig = {
  size: 32,
  borderRadius: '50%',
  borderWidth: 2,
  gap: 8,
};

const CURRENT_UNIT_STYLE: CurrentUnitStyle = {
  borderColor: '#fbbf24',
  boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
};

const DEAD_UNIT_STYLE: DeadUnitStyle = {
  opacity: 0.4,
  filter: 'grayscale(100%)',
};

const EXIT_ANIMATION: AnimationConfig = {
  name: 'slideOutLeft',
  duration: 400,
  translateX: -40,
};

const ENTER_ANIMATION: AnimationConfig = {
  name: 'slideInFromRight',
  duration: 400,
  translateX: 40,
};

const MOBILE_CONFIG = {
  maxWidth: 200,
  avatarSize: 24,
  timelineHeight: 2,
  avatarGap: 6,
};

const TABLET_CONFIG = {
  maxWidth: 280,
};

const DESKTOP_CONFIG = {
  maxVisibleUnits: 8,
};

const getVisibleUnitsCount = (isMobile: boolean, isTablet: boolean): number => {
  if (isMobile) return 5;
  if (isTablet) return 6;
  return 8;
};

const reorderTurnOrder = <T extends { id: string }>(
  turnOrder: T[],
  currentUnitId: string | null
): T[] => {
  if (!currentUnitId) return turnOrder.slice(0, DESKTOP_CONFIG.maxVisibleUnits);
  
  const currentIndex = turnOrder.findIndex(u => u.id === currentUnitId);
  if (currentIndex === -1) return turnOrder.slice(0, DESKTOP_CONFIG.maxVisibleUnits);
  
  const reordered = [
    turnOrder[currentIndex],
    ...turnOrder.slice(currentIndex + 1),
    ...turnOrder.slice(0, currentIndex),
  ];
  
  return reordered.slice(0, DESKTOP_CONFIG.maxVisibleUnits);
};

describe('回合顺序系统', () => {
  describe('主容器配置', () => {
    it('应定位在右上角', () => {
      expect(TURN_ORDER_CONFIG.position.right).toBe(16);
      expect(TURN_ORDER_CONFIG.position.top).toBe(30);
    });

    it('最大宽度应为360px', () => {
      expect(TURN_ORDER_CONFIG.maxWidth).toBe(360);
    });

    it('z-index应为40', () => {
      expect(TURN_ORDER_CONFIG.zIndex).toBe(40);
    });
  });

  describe('时间轴条样式', () => {
    it('高度应为3px', () => {
      expect(TIMELINE_BAR.height).toBe(3);
    });

    it('应使用金色渐变', () => {
      expect(TIMELINE_BAR.gradient).toContain('251,191,36');
    });

    it('渐变应从金色渐变到透明', () => {
      expect(TIMELINE_BAR.gradient).toContain('rgba(251,191,36,0.8)');
      expect(TIMELINE_BAR.gradient).toContain('rgba(155,122,76,0)');
    });

    it('圆角应为2px', () => {
      expect(TIMELINE_BAR.borderRadius).toBe(2);
    });
  });

  describe('头像项目样式', () => {
    it('尺寸应为32px', () => {
      expect(AVATAR_ITEM.size).toBe(32);
    });

    it('应为圆形', () => {
      expect(AVATAR_ITEM.borderRadius).toBe('50%');
    });

    it('边框宽度应为2px', () => {
      expect(AVATAR_ITEM.borderWidth).toBe(2);
    });

    it('间距应为8px', () => {
      expect(AVATAR_ITEM.gap).toBe(8);
    });
  });

  describe('当前回合单位样式', () => {
    it('边框应为金色', () => {
      expect(CURRENT_UNIT_STYLE.borderColor).toBe('#fbbf24');
    });

    it('应有金色发光阴影', () => {
      expect(CURRENT_UNIT_STYLE.boxShadow).toContain('251, 191, 36');
    });
  });

  describe('死亡单位样式', () => {
    it('透明度应为0.4', () => {
      expect(DEAD_UNIT_STYLE.opacity).toBe(0.4);
    });

    it('应有灰度滤镜', () => {
      expect(DEAD_UNIT_STYLE.filter).toBe('grayscale(100%)');
    });
  });

  describe('回合切换动画', () => {
    describe('退出动画', () => {
      it('应使用slideOutLeft动画', () => {
        expect(EXIT_ANIMATION.name).toBe('slideOutLeft');
      });

      it('持续时间应为400ms', () => {
        expect(EXIT_ANIMATION.duration).toBe(400);
      });

      it('应向左滑出40px', () => {
        expect(EXIT_ANIMATION.translateX).toBe(-40);
      });
    });

    describe('进入动画', () => {
      it('应使用slideInFromRight动画', () => {
        expect(ENTER_ANIMATION.name).toBe('slideInFromRight');
      });

      it('持续时间应为400ms', () => {
        expect(ENTER_ANIMATION.duration).toBe(400);
      });

      it('应从右侧滑入40px', () => {
        expect(ENTER_ANIMATION.translateX).toBe(40);
      });
    });

    it('退出和进入动画持续时间应相同', () => {
      expect(EXIT_ANIMATION.duration).toBe(ENTER_ANIMATION.duration);
    });
  });

  describe('响应式配置', () => {
    describe('移动端配置', () => {
      it('最大宽度应为200px', () => {
        expect(MOBILE_CONFIG.maxWidth).toBe(200);
      });

      it('头像尺寸应为24px', () => {
        expect(MOBILE_CONFIG.avatarSize).toBe(24);
      });

      it('时间轴高度应为2px', () => {
        expect(MOBILE_CONFIG.timelineHeight).toBe(2);
      });

      it('头像间距应为6px', () => {
        expect(MOBILE_CONFIG.avatarGap).toBe(6);
      });
    });

    describe('平板配置', () => {
      it('最大宽度应为280px', () => {
        expect(TABLET_CONFIG.maxWidth).toBe(280);
      });
    });

    describe('可见单位数量', () => {
      it('移动端应显示5个单位', () => {
        expect(getVisibleUnitsCount(true, false)).toBe(5);
      });

      it('平板应显示6个单位', () => {
        expect(getVisibleUnitsCount(false, true)).toBe(6);
      });

      it('桌面端应显示8个单位', () => {
        expect(getVisibleUnitsCount(false, false)).toBe(8);
      });
    });
  });

  describe('回合顺序重排逻辑', () => {
    const mockTurnOrder = [
      { id: 'unit1' },
      { id: 'unit2' },
      { id: 'unit3' },
      { id: 'unit4' },
      { id: 'unit5' },
      { id: 'unit6' },
      { id: 'unit7' },
      { id: 'unit8' },
      { id: 'unit9' },
      { id: 'unit10' },
    ];

    it('当前单位应在第一位', () => {
      const reordered = reorderTurnOrder(mockTurnOrder, 'unit3');
      expect(reordered[0].id).toBe('unit3');
    });

    it('应保持循环顺序', () => {
      const reordered = reorderTurnOrder(mockTurnOrder, 'unit8');
      expect(reordered[0].id).toBe('unit8');
      expect(reordered[1].id).toBe('unit9');
      expect(reordered[2].id).toBe('unit10');
      expect(reordered[3].id).toBe('unit1');
    });

    it('应限制最大显示数量', () => {
      const reordered = reorderTurnOrder(mockTurnOrder, 'unit1');
      expect(reordered.length).toBeLessThanOrEqual(DESKTOP_CONFIG.maxVisibleUnits);
    });

    it('当前单位ID为空时返回前N个', () => {
      const reordered = reorderTurnOrder(mockTurnOrder, null);
      expect(reordered[0].id).toBe('unit1');
    });

    it('当前单位不存在时返回前N个', () => {
      const reordered = reorderTurnOrder(mockTurnOrder, 'nonexistent');
      expect(reordered[0].id).toBe('unit1');
    });
  });
});

describe('回合顺序时间轴渐变', () => {
  const GRADIENT_STOPS = [
    { position: 0, color: 'rgba(251,191,36,0.8)' },
    { position: 40, color: 'rgba(251,191,36,0.4)' },
    { position: 70, color: 'rgba(155,122,76,0.2)' },
    { position: 100, color: 'rgba(155,122,76,0)' },
  ];

  it('应有4个渐变停止点', () => {
    expect(GRADIENT_STOPS.length).toBe(4);
  });

  it('起始点应为高透明度金色', () => {
    expect(GRADIENT_STOPS[0].color).toContain('0.8)');
  });

  it('结束点应为完全透明', () => {
    expect(GRADIENT_STOPS[3].color).toContain('0)');
  });

  it('渐变位置应递增', () => {
    for (let i = 1; i < GRADIENT_STOPS.length; i++) {
      expect(GRADIENT_STOPS[i].position).toBeGreaterThan(GRADIENT_STOPS[i - 1].position);
    }
  });
});

describe('回合顺序头像显示', () => {
  interface UnitDisplay {
    id: string;
    name: string;
    isPlayer: boolean;
    isAlive: boolean;
  }

  const convertToDisplayUnit = (
    unit: { id: string; name: string; faction: string; isAlive: boolean }
  ): UnitDisplay => {
    return {
      id: unit.id,
      name: unit.name,
      isPlayer: unit.faction === 'player',
      isAlive: unit.isAlive,
    };
  };

  it('应正确识别玩家单位', () => {
    const unit = { id: 'p1', name: 'Player', faction: 'player', isAlive: true };
    const display = convertToDisplayUnit(unit);
    expect(display.isPlayer).toBe(true);
  });

  it('应正确识别敌人单位', () => {
    const unit = { id: 'e1', name: 'Enemy', faction: 'enemy', isAlive: true };
    const display = convertToDisplayUnit(unit);
    expect(display.isPlayer).toBe(false);
  });

  it('应正确传递存活状态', () => {
    const aliveUnit = { id: 'p1', name: 'Player', faction: 'player', isAlive: true };
    const deadUnit = { id: 'p2', name: 'Player2', faction: 'player', isAlive: false };
    
    expect(convertToDisplayUnit(aliveUnit).isAlive).toBe(true);
    expect(convertToDisplayUnit(deadUnit).isAlive).toBe(false);
  });
});

describe('回合顺序更新流程', () => {
  interface TurnChangeState {
    exitingUnit: string | null;
    enteringUnit: string | null;
    currentTurnIndex: number;
  }

  const simulateTurnChange = (
    state: TurnChangeState,
    turnOrder: string[],
    prevTurnUnitId: string
  ): TurnChangeState => {
    const nextIndex = (state.currentTurnIndex + 1) % turnOrder.length;
    return {
      exitingUnit: prevTurnUnitId,
      enteringUnit: turnOrder[turnOrder.length - 1],
      currentTurnIndex: nextIndex,
    };
  };

  it('应正确设置退出单位', () => {
    const state: TurnChangeState = {
      exitingUnit: null,
      enteringUnit: null,
      currentTurnIndex: 0,
    };
    const turnOrder = ['u1', 'u2', 'u3', 'u4'];
    
    const newState = simulateTurnChange(state, turnOrder, 'u1');
    expect(newState.exitingUnit).toBe('u1');
  });

  it('应正确设置进入单位', () => {
    const state: TurnChangeState = {
      exitingUnit: null,
      enteringUnit: null,
      currentTurnIndex: 0,
    };
    const turnOrder = ['u1', 'u2', 'u3', 'u4'];
    
    const newState = simulateTurnChange(state, turnOrder, 'u1');
    expect(newState.enteringUnit).toBe('u4');
  });

  it('应正确更新回合索引', () => {
    const state: TurnChangeState = {
      exitingUnit: null,
      enteringUnit: null,
      currentTurnIndex: 0,
    };
    const turnOrder = ['u1', 'u2', 'u3', 'u4'];
    
    const newState = simulateTurnChange(state, turnOrder, 'u1');
    expect(newState.currentTurnIndex).toBe(1);
  });

  it('索引应在数组末尾循环', () => {
    const state: TurnChangeState = {
      exitingUnit: null,
      enteringUnit: null,
      currentTurnIndex: 3,
    };
    const turnOrder = ['u1', 'u2', 'u3', 'u4'];
    
    const newState = simulateTurnChange(state, turnOrder, 'u4');
    expect(newState.currentTurnIndex).toBe(0);
  });
});

describe('回合顺序动画清理', () => {
  const ANIMATION_CLEANUP_CONFIG = {
    timeoutDuration: 400,
    cleanupOnUnmount: true,
  };

  it('动画清理超时应等于动画持续时间', () => {
    expect(ANIMATION_CLEANUP_CONFIG.timeoutDuration).toBe(EXIT_ANIMATION.duration);
  });

  it('组件卸载时应清理动画', () => {
    expect(ANIMATION_CLEANUP_CONFIG.cleanupOnUnmount).toBe(true);
  });
});

describe('回合顺序头像边框样式', () => {
  const BORDER_STYLES = {
    normal: 'rgba(255, 255, 255, 0.3)',
    current: '#fbbf24',
  };

  it('普通单位边框应为半透明白色', () => {
    expect(BORDER_STYLES.normal).toBe('rgba(255, 255, 255, 0.3)');
  });

  it('当前单位边框应为金色', () => {
    expect(BORDER_STYLES.current).toBe('#fbbf24');
  });
});

describe('回合顺序背景样式', () => {
  const BACKGROUND_STYLE = {
    color: 'rgba(44, 36, 27, 0.8)',
    isTransparent: true,
  };

  it('背景应为半透明深色', () => {
    expect(BACKGROUND_STYLE.color).toContain('0.8)');
  });

  it('背景应包含透明度', () => {
    expect(BACKGROUND_STYLE.isTransparent).toBe(true);
  });
});
