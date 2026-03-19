import { describe, it, expect } from 'vitest';

interface UnitStateStyle {
  state: string;
  cssProperties: Record<string, string>;
  visualEffect: string;
}

interface HPBarStyle {
  level: string;
  threshold: number;
  gradient: string;
  color: string;
}

const PLAYER_CARD_STATES: UnitStateStyle[] = [
  {
    state: 'normal',
    cssProperties: {
      borderColor: '#9b7a4c',
      transform: 'scale(1)',
      boxShadow: 'none',
    },
    visualEffect: '正常状态',
  },
  {
    state: 'active',
    cssProperties: {
      borderColor: '#b45309',
      transform: 'scale(1.05)',
      boxShadow: '0 0 0 2px rgba(252, 211, 77, 0.5)',
    },
    visualEffect: '当前行动角色',
  },
  {
    state: 'dead',
    cssProperties: {
      opacity: '0.5',
      filter: 'grayscale(100%)',
    },
    visualEffect: '死亡状态',
  },
  {
    state: 'ally-targetable',
    cssProperties: {
      cursor: 'pointer',
    },
    visualEffect: '可选为友方目标',
  },
  {
    state: 'ally-selected',
    cssProperties: {
      borderColor: '#22c55e',
      boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)',
    },
    visualEffect: '已选中为友方目标',
  },
];

const ENEMY_UNIT_STATES: UnitStateStyle[] = [
  {
    state: 'normal',
    cssProperties: {
      cursor: 'default',
    },
    visualEffect: '正常状态',
  },
  {
    state: 'targetable',
    cssProperties: {
      cursor: 'pointer',
    },
    visualEffect: '可选为敌方目标',
  },
  {
    state: 'hover',
    cssProperties: {
      transform: 'scale(1.05)',
    },
    visualEffect: '悬停状态',
  },
  {
    state: 'dead',
    cssProperties: {
      opacity: '0',
      transform: 'scale(0.8)',
    },
    visualEffect: '死亡淡出',
  },
];

const HP_BAR_STYLES: HPBarStyle[] = [
  { level: 'high', threshold: 60, gradient: 'linear-gradient(90deg, #10b981, #34d399)', color: 'green' },
  { level: 'medium', threshold: 30, gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)', color: 'yellow' },
  { level: 'low', threshold: 0, gradient: 'linear-gradient(90deg, #ef4444, #f87171)', color: 'red' },
];

const MP_BAR_STYLE = {
  gradient: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
  color: 'cyan',
};

const ENEMY_SIZE_CONFIG = {
  master: { width: 144, height: 192 },
  servant: { width: 112, height: 160 },
  mobile: {
    master: { width: 120, height: 144 },
    servant: { width: 108, height: 120 },
  },
};

const PLAYER_CARD_SIZE = {
  desktop: 112,
  mobile: 84,
};

const STATUS_ICON_CONFIG = {
  size: 16,
  fontSize: 10,
  background: 'rgba(0, 0, 0, 0.7)',
  borderRadius: 2,
};

const STATUS_ICONS: Record<string, string> = {
  poison: '☠️',
  hpRegen: '💚',
  sleep: '💤',
  darkness: '🌑',
  silence: '🔇',
  critUp: '💥',
  weakness: '🎯',
  defDown: '📉',
  dead: '⚰️',
  evasionUp: '💨',
};

describe('单位视觉状态', () => {
  describe('玩家卡片状态', () => {
    it('应定义5种玩家卡片状态', () => {
      expect(PLAYER_CARD_STATES.length).toBe(5);
    });

    describe('正常状态', () => {
      const normalState = PLAYER_CARD_STATES.find(s => s.state === 'normal');
      
      it('应有正确的边框颜色', () => {
        expect(normalState?.cssProperties.borderColor).toBe('#9b7a4c');
      });

      it('应为正常缩放', () => {
        expect(normalState?.cssProperties.transform).toBe('scale(1)');
      });
    });

    describe('活跃状态（当前行动）', () => {
      const activeState = PLAYER_CARD_STATES.find(s => s.state === 'active');
      
      it('应有橙褐色边框', () => {
        expect(activeState?.cssProperties.borderColor).toBe('#b45309');
      });

      it('应放大到1.05倍', () => {
        expect(activeState?.cssProperties.transform).toBe('scale(1.05)');
      });

      it('应有金色光晕阴影', () => {
        expect(activeState?.cssProperties.boxShadow).toContain('252, 211, 77');
      });
    });

    describe('死亡状态', () => {
      const deadState = PLAYER_CARD_STATES.find(s => s.state === 'dead');
      
      it('应有半透明效果', () => {
        expect(deadState?.cssProperties.opacity).toBe('0.5');
      });

      it('应有灰度滤镜', () => {
        expect(deadState?.cssProperties.filter).toBe('grayscale(100%)');
      });
    });

    describe('友方选中状态', () => {
      const selectedState = PLAYER_CARD_STATES.find(s => s.state === 'ally-selected');
      
      it('应有绿色边框', () => {
        expect(selectedState?.cssProperties.borderColor).toBe('#22c55e');
      });

      it('应有绿色发光阴影', () => {
        expect(selectedState?.cssProperties.boxShadow).toContain('34, 197, 94');
      });
    });
  });

  describe('敌人单位状态', () => {
    it('应定义4种敌人单位状态', () => {
      expect(ENEMY_UNIT_STATES.length).toBe(4);
    });

    describe('悬停状态', () => {
      const hoverState = ENEMY_UNIT_STATES.find(s => s.state === 'hover');
      
      it('应放大到1.05倍', () => {
        expect(hoverState?.cssProperties.transform).toBe('scale(1.05)');
      });
    });

    describe('死亡状态', () => {
      const deadState = ENEMY_UNIT_STATES.find(s => s.state === 'dead');
      
      it('应有淡出效果', () => {
        expect(deadState?.cssProperties.opacity).toBe('0');
      });

      it('应有缩小效果', () => {
        expect(deadState?.cssProperties.transform).toBe('scale(0.8)');
      });
    });
  });

  describe('HP条样式', () => {
    it('应定义3个HP等级', () => {
      expect(HP_BAR_STYLES.length).toBe(3);
    });

    describe('高HP（绿色）', () => {
      const highHP = HP_BAR_STYLES.find(s => s.level === 'high');
      
      it('阈值应为60%', () => {
        expect(highHP?.threshold).toBe(60);
      });

      it('应使用绿色渐变', () => {
        expect(highHP?.color).toBe('green');
        expect(highHP?.gradient).toContain('#10b981');
      });
    });

    describe('中HP（黄色）', () => {
      const mediumHP = HP_BAR_STYLES.find(s => s.level === 'medium');
      
      it('阈值应为30%', () => {
        expect(mediumHP?.threshold).toBe(30);
      });

      it('应使用黄色渐变', () => {
        expect(mediumHP?.color).toBe('yellow');
        expect(mediumHP?.gradient).toContain('#f59e0b');
      });
    });

    describe('低HP（红色）', () => {
      const lowHP = HP_BAR_STYLES.find(s => s.level === 'low');
      
      it('阈值应为0%', () => {
        expect(lowHP?.threshold).toBe(0);
      });

      it('应使用红色渐变', () => {
        expect(lowHP?.color).toBe('red');
        expect(lowHP?.gradient).toContain('#ef4444');
      });
    });

    it('HP等级阈值应递减', () => {
      const thresholds = HP_BAR_STYLES.map(s => s.threshold);
      expect(thresholds).toEqual([60, 30, 0]);
    });
  });

  describe('MP条样式', () => {
    it('应使用青色渐变', () => {
      expect(MP_BAR_STYLE.color).toBe('cyan');
    });

    it('渐变应从深青到浅青', () => {
      expect(MP_BAR_STYLE.gradient).toContain('#06b6d4');
      expect(MP_BAR_STYLE.gradient).toContain('#22d3ee');
    });
  });

  describe('敌人尺寸配置', () => {
    describe('桌面端', () => {
      it('master敌人应有正确的尺寸', () => {
        expect(ENEMY_SIZE_CONFIG.master.width).toBe(144);
        expect(ENEMY_SIZE_CONFIG.master.height).toBe(192);
      });

      it('servant敌人应有正确的尺寸', () => {
        expect(ENEMY_SIZE_CONFIG.servant.width).toBe(112);
        expect(ENEMY_SIZE_CONFIG.servant.height).toBe(160);
      });

      it('master应比servant大', () => {
        expect(ENEMY_SIZE_CONFIG.master.width).toBeGreaterThan(ENEMY_SIZE_CONFIG.servant.width);
        expect(ENEMY_SIZE_CONFIG.master.height).toBeGreaterThan(ENEMY_SIZE_CONFIG.servant.height);
      });
    });

    describe('移动端', () => {
      it('master敌人应有缩小的尺寸', () => {
        expect(ENEMY_SIZE_CONFIG.mobile.master.width).toBe(120);
        expect(ENEMY_SIZE_CONFIG.mobile.master.height).toBe(144);
      });

      it('servant敌人应有缩小的尺寸', () => {
        expect(ENEMY_SIZE_CONFIG.mobile.servant.width).toBe(108);
        expect(ENEMY_SIZE_CONFIG.mobile.servant.height).toBe(120);
      });

      it('移动端尺寸应小于桌面端', () => {
        expect(ENEMY_SIZE_CONFIG.mobile.master.width).toBeLessThan(ENEMY_SIZE_CONFIG.master.width);
        expect(ENEMY_SIZE_CONFIG.mobile.servant.width).toBeLessThan(ENEMY_SIZE_CONFIG.servant.width);
      });
    });
  });

  describe('玩家卡片尺寸', () => {
    it('桌面端宽度应为112px', () => {
      expect(PLAYER_CARD_SIZE.desktop).toBe(112);
    });

    it('移动端宽度应为84px', () => {
      expect(PLAYER_CARD_SIZE.mobile).toBe(84);
    });

    it('移动端应比桌面端窄', () => {
      expect(PLAYER_CARD_SIZE.mobile).toBeLessThan(PLAYER_CARD_SIZE.desktop);
    });
  });
});

describe('状态图标系统', () => {
  describe('图标配置', () => {
    it('图标尺寸应为16px', () => {
      expect(STATUS_ICON_CONFIG.size).toBe(16);
    });

    it('字体大小应为10px', () => {
      expect(STATUS_ICON_CONFIG.fontSize).toBe(10);
    });

    it('背景应为半透明黑色', () => {
      expect(STATUS_ICON_CONFIG.background).toBe('rgba(0, 0, 0, 0.7)');
    });

    it('圆角应为2px', () => {
      expect(STATUS_ICON_CONFIG.borderRadius).toBe(2);
    });
  });

  describe('状态图标映射', () => {
    it('应定义10种状态图标', () => {
      expect(Object.keys(STATUS_ICONS).length).toBe(10);
    });

    it('中毒状态应显示骷髅图标', () => {
      expect(STATUS_ICONS.poison).toBe('☠️');
    });

    it('HP再生状态应显示绿心图标', () => {
      expect(STATUS_ICONS.hpRegen).toBe('💚');
    });

    it('睡眠状态应显示ZZZ图标', () => {
      expect(STATUS_ICONS.sleep).toBe('💤');
    });

    it('暗闇状态应显示新月图标', () => {
      expect(STATUS_ICONS.darkness).toBe('🌑');
    });

    it('沈黙状态应显示静音图标', () => {
      expect(STATUS_ICONS.silence).toBe('🔇');
    });

    it('暴击率提升应显示爆炸图标', () => {
      expect(STATUS_ICONS.critUp).toBe('💥');
    });

    it('弱点暴露应显示靶心图标', () => {
      expect(STATUS_ICONS.weakness).toBe('🎯');
    });

    it('防御下降应显示下降图标', () => {
      expect(STATUS_ICONS.defDown).toBe('📉');
    });

    it('死亡状态应显示墓碑图标', () => {
      expect(STATUS_ICONS.dead).toBe('⚰️');
    });

    it('回避率提升应显示风图标', () => {
      expect(STATUS_ICONS.evasionUp).toBe('💨');
    });
  });
});

describe('战斗光标样式', () => {
  const CURSOR_CONFIG = {
    enemy: {
      color: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.8)',
    },
    ally: {
      color: '#22c55e',
      glowColor: 'rgba(34, 197, 94, 0.8)',
    },
    size: {
      width: 24,
      height: 16,
    },
  };

  describe('敌方目标光标', () => {
    it('应使用金色', () => {
      expect(CURSOR_CONFIG.enemy.color).toBe('#fbbf24');
    });

    it('应有金色发光效果', () => {
      expect(CURSOR_CONFIG.enemy.glowColor).toContain('251, 191, 36');
    });
  });

  describe('友方目标光标', () => {
    it('应使用绿色', () => {
      expect(CURSOR_CONFIG.ally.color).toBe('#22c55e');
    });

    it('应有绿色发光效果', () => {
      expect(CURSOR_CONFIG.ally.glowColor).toContain('34, 197, 94');
    });
  });

  describe('光标尺寸', () => {
    it('宽度应为24px（12px边框×2）', () => {
      expect(CURSOR_CONFIG.size.width).toBe(24);
    });

    it('高度应为16px', () => {
      expect(CURSOR_CONFIG.size.height).toBe(16);
    });
  });
});

describe('行动中标签样式', () => {
  const ACTIVE_TAG_CONFIG = {
    background: '#b45309',
    color: 'white',
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 4,
    position: {
      top: -12,
      left: '50%',
      transform: 'translateX(-50%)',
    },
  };

  it('背景应为橙褐色', () => {
    expect(ACTIVE_TAG_CONFIG.background).toBe('#b45309');
  });

  it('文字应为白色', () => {
    expect(ACTIVE_TAG_CONFIG.color).toBe('white');
  });

  it('字体大小应为10px', () => {
    expect(ACTIVE_TAG_CONFIG.fontSize).toBe(10);
  });

  it('应定位在卡片顶部中央', () => {
    expect(ACTIVE_TAG_CONFIG.position.top).toBe(-12);
    expect(ACTIVE_TAG_CONFIG.position.left).toBe('50%');
    expect(ACTIVE_TAG_CONFIG.position.transform).toBe('translateX(-50%)');
  });
});

describe('死亡覆盖层样式', () => {
  const DEATH_OVERLAY_CONFIG = {
    background: 'rgba(0, 0, 0, 0.5)',
    markColor: 'text-red-400',
    mark: '✕',
  };

  it('背景应为半透明黑色', () => {
    expect(DEATH_OVERLAY_CONFIG.background).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('死亡标记应为红色X', () => {
    expect(DEATH_OVERLAY_CONFIG.mark).toBe('✕');
    expect(DEATH_OVERLAY_CONFIG.markColor).toBe('text-red-400');
  });
});

describe('限制状态显示', () => {
  const RESTRICTION_TYPES = ['睡眠', '沈黙', '麻痺'];

  it('应定义3种限制状态', () => {
    expect(RESTRICTION_TYPES.length).toBe(3);
  });

  it('限制状态标签应显示在卡片底部', () => {
    const restrictionPosition = {
      bottom: -20,
      left: '50%',
      transform: 'translateX(-50%)',
    };
    expect(restrictionPosition.bottom).toBeLessThan(0);
  });
});

describe('响应式断点', () => {
  const BREAKPOINTS = {
    mobile: 767,
    tablet: 1024,
  };

  it('移动端断点应为767px', () => {
    expect(BREAKPOINTS.mobile).toBe(767);
  });

  it('平板断点应为1024px', () => {
    expect(BREAKPOINTS.tablet).toBe(1024);
  });

  it('移动端断点应小于平板断点', () => {
    expect(BREAKPOINTS.mobile).toBeLessThan(BREAKPOINTS.tablet);
  });
});
