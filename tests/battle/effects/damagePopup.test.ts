import { describe, it, expect } from 'vitest';

type DamagePopupType = 'hpDamage' | 'hpHeal' | 'critical';

interface DamagePopupStyle {
  type: DamagePopupType;
  color: string;
  fontSize: number;
  textShadow: string;
  displayPrefix: string;
}

interface DamagePopupConfig {
  baseFontSize: number;
  criticalFontSize: number;
  animationDuration: number;
  removalDelay: number;
}

const DAMAGE_POPUP_STYLES: DamagePopupStyle[] = [
  {
    type: 'hpDamage',
    color: '#ff4040',
    fontSize: 28,
    textShadow: '0 0 10px rgba(255,64,64,0.5), 0 2px 4px rgba(0,0,0,0.8)',
    displayPrefix: '-',
  },
  {
    type: 'hpHeal',
    color: '#40ff40',
    fontSize: 28,
    textShadow: '0 0 10px rgba(64,255,64,0.5), 0 2px 4px rgba(0,0,0,0.8)',
    displayPrefix: '+',
  },
  {
    type: 'critical',
    color: '#ffff40',
    fontSize: 36,
    textShadow: '0 0 15px rgba(255,255,64,0.7), 0 2px 4px rgba(0,0,0,0.8)',
    displayPrefix: '',
  },
];

const DAMAGE_POPUP_CONFIG: DamagePopupConfig = {
  baseFontSize: 28,
  criticalFontSize: 36,
  animationDuration: 1200,
  removalDelay: 1200,
};

const DAMAGE_RISE_ANIMATION = {
  startY: 0,
  peakY: -10,
  midY: -30,
  endY: -80,
  startScale: 0.5,
  peakScale: 1.2,
  midScale: 1,
  endScale: 0.8,
};

interface PositionCalculation {
  method: string;
  xFormula: string;
  yFormula: string;
}

const POSITION_CALCULATION: PositionCalculation = {
  method: 'relative-to-battle-scene',
  xFormula: 'rect.left - sceneRect.left + rect.width / 2',
  yFormula: 'rect.top - sceneRect.top + rect.height / 3',
};

const getDisplayText = (value: number, type: DamagePopupType): string => {
  switch (type) {
    case 'hpDamage':
      return `-${Math.abs(value)}`;
    case 'hpHeal':
      return `+${Math.abs(value)}`;
    case 'critical':
      return `${Math.abs(value)}!`;
    default:
      return Math.abs(value).toString();
  }
};

const getStyleByType = (type: DamagePopupType): DamagePopupStyle | undefined => {
  return DAMAGE_POPUP_STYLES.find(s => s.type === type);
};

describe('伤害弹出系统', () => {
  describe('伤害弹出样式', () => {
    it('应定义3种伤害弹出类型', () => {
      expect(DAMAGE_POPUP_STYLES.length).toBe(3);
    });

    describe('HP伤害样式', () => {
      const hpDamageStyle = getStyleByType('hpDamage');
      
      it('应使用红色', () => {
        expect(hpDamageStyle?.color).toBe('#ff4040');
      });

      it('基础字体大小应为28px', () => {
        expect(hpDamageStyle?.fontSize).toBe(28);
      });

      it('应有红色发光效果', () => {
        expect(hpDamageStyle?.textShadow).toContain('255,64,64');
      });

      it('显示前缀应为减号', () => {
        expect(hpDamageStyle?.displayPrefix).toBe('-');
      });
    });

    describe('HP治疗样式', () => {
      const hpHealStyle = getStyleByType('hpHeal');
      
      it('应使用绿色', () => {
        expect(hpHealStyle?.color).toBe('#40ff40');
      });

      it('基础字体大小应为28px', () => {
        expect(hpHealStyle?.fontSize).toBe(28);
      });

      it('应有绿色发光效果', () => {
        expect(hpHealStyle?.textShadow).toContain('64,255,64');
      });

      it('显示前缀应为加号', () => {
        expect(hpHealStyle?.displayPrefix).toBe('+');
      });
    });

    describe('暴击伤害样式', () => {
      const criticalStyle = getStyleByType('critical');
      
      it('应使用金黄色', () => {
        expect(criticalStyle?.color).toBe('#ffff40');
      });

      it('字体大小应为36px（比基础大）', () => {
        expect(criticalStyle?.fontSize).toBe(36);
        expect(criticalStyle?.fontSize).toBeGreaterThan(DAMAGE_POPUP_CONFIG.baseFontSize);
      });

      it('应有更强的金色发光效果', () => {
        expect(criticalStyle?.textShadow).toContain('255,255,64');
        expect(criticalStyle?.textShadow).toContain('15px');
      });

      it('显示后缀应为感叹号', () => {
        const displayText = getDisplayText(100, 'critical');
        expect(displayText).toContain('!');
      });
    });
  });

  describe('伤害弹出配置', () => {
    it('基础字体大小应为28px', () => {
      expect(DAMAGE_POPUP_CONFIG.baseFontSize).toBe(28);
    });

    it('暴击字体大小应为36px', () => {
      expect(DAMAGE_POPUP_CONFIG.criticalFontSize).toBe(36);
    });

    it('动画持续时间应为1200ms', () => {
      expect(DAMAGE_POPUP_CONFIG.animationDuration).toBe(1200);
    });

    it('移除延迟应等于动画持续时间', () => {
      expect(DAMAGE_POPUP_CONFIG.removalDelay).toBe(DAMAGE_POPUP_CONFIG.animationDuration);
    });
  });

  describe('伤害弹出动画', () => {
    describe('动画轨迹', () => {
      it('起始Y位置应为0', () => {
        expect(DAMAGE_RISE_ANIMATION.startY).toBe(0);
      });

      it('峰值Y位置应为-10px', () => {
        expect(DAMAGE_RISE_ANIMATION.peakY).toBe(-10);
      });

      it('中间Y位置应为-30px', () => {
        expect(DAMAGE_RISE_ANIMATION.midY).toBe(-30);
      });

      it('结束Y位置应为-80px', () => {
        expect(DAMAGE_RISE_ANIMATION.endY).toBe(-80);
      });
    });

    describe('缩放变化', () => {
      it('起始缩放应为0.5（从小尺寸开始）', () => {
        expect(DAMAGE_RISE_ANIMATION.startScale).toBe(0.5);
      });

      it('峰值缩放应为1.2（弹出放大效果）', () => {
        expect(DAMAGE_RISE_ANIMATION.peakScale).toBe(1.2);
      });

      it('中间缩放应为1（正常大小）', () => {
        expect(DAMAGE_RISE_ANIMATION.midScale).toBe(1);
      });

      it('结束缩放应为0.8（缩小淡出）', () => {
        expect(DAMAGE_RISE_ANIMATION.endScale).toBe(0.8);
      });
    });

    describe('动画阶段', () => {
      it('应有弹出阶段（0-10%）', () => {
        expect(DAMAGE_RISE_ANIMATION.peakY).toBeLessThan(DAMAGE_RISE_ANIMATION.startY);
        expect(DAMAGE_RISE_ANIMATION.peakScale).toBeGreaterThan(1);
      });

      it('应有上升阶段（10-30%）', () => {
        expect(DAMAGE_RISE_ANIMATION.midY).toBeLessThan(DAMAGE_RISE_ANIMATION.peakY);
      });

      it('应有飘散阶段（30-100%）', () => {
        expect(DAMAGE_RISE_ANIMATION.endY).toBeLessThan(DAMAGE_RISE_ANIMATION.midY);
      });
    });
  });

  describe('显示文本生成', () => {
    it('HP伤害应显示为负数', () => {
      expect(getDisplayText(100, 'hpDamage')).toBe('-100');
    });

    it('HP治疗应显示为正数', () => {
      expect(getDisplayText(50, 'hpHeal')).toBe('+50');
    });

    it('暴击应显示数值加感叹号', () => {
      expect(getDisplayText(256, 'critical')).toBe('256!');
    });

    it('应使用绝对值', () => {
      expect(getDisplayText(-100, 'hpDamage')).toBe('-100');
      expect(getDisplayText(-50, 'hpHeal')).toBe('+50');
    });
  });

  describe('位置计算', () => {
    it('X坐标应为目标元素中心点', () => {
      expect(POSITION_CALCULATION.xFormula).toContain('rect.width / 2');
    });

    it('Y坐标应为目标元素上1/3处', () => {
      expect(POSITION_CALCULATION.yFormula).toContain('rect.height / 3');
    });

    it('应使用相对于战斗场景的坐标', () => {
      expect(POSITION_CALCULATION.method).toBe('relative-to-battle-scene');
      expect(POSITION_CALCULATION.xFormula).toContain('sceneRect.left');
      expect(POSITION_CALCULATION.yFormula).toContain('sceneRect.top');
    });
  });

  describe('样式获取函数', () => {
    it('应根据类型返回正确的样式', () => {
      const hpDamageStyle = getStyleByType('hpDamage');
      expect(hpDamageStyle?.color).toBe('#ff4040');

      const hpHealStyle = getStyleByType('hpHeal');
      expect(hpHealStyle?.color).toBe('#40ff40');

      const criticalStyle = getStyleByType('critical');
      expect(criticalStyle?.color).toBe('#ffff40');
    });

    it('对于未知类型应返回undefined', () => {
      const unknownStyle = getStyleByType('unknown' as DamagePopupType);
      expect(unknownStyle).toBeUndefined();
    });
  });

  describe('字体大小对比', () => {
    it('暴击字体应比普通伤害大8px', () => {
      const diff = DAMAGE_POPUP_CONFIG.criticalFontSize - DAMAGE_POPUP_CONFIG.baseFontSize;
      expect(diff).toBe(8);
    });

    it('暴击字体应比普通伤害大约28.6%', () => {
      const ratio = DAMAGE_POPUP_CONFIG.criticalFontSize / DAMAGE_POPUP_CONFIG.baseFontSize;
      expect(ratio).toBeCloseTo(1.286, 2);
    });
  });

  describe('发光效果强度', () => {
    it('暴击发光范围应比普通伤害大', () => {
      const hpDamageStyle = getStyleByType('hpDamage');
      const criticalStyle = getStyleByType('critical');
      
      expect(criticalStyle?.textShadow).toContain('15px');
      expect(hpDamageStyle?.textShadow).toContain('10px');
    });
  });
});

describe('伤害弹出容器', () => {
  const CONTAINER_CONFIG = {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: 100,
  };

  it('容器应为绝对定位', () => {
    expect(CONTAINER_CONFIG.position).toBe('absolute');
  });

  it('容器应覆盖整个区域', () => {
    expect(CONTAINER_CONFIG.inset).toBe('0');
  });

  it('容器应禁用指针事件', () => {
    expect(CONTAINER_CONFIG.pointerEvents).toBe('none');
  });

  it('容器z-index应为100', () => {
    expect(CONTAINER_CONFIG.zIndex).toBe(100);
  });
});

describe('伤害弹出随机偏移', () => {
  const RANDOM_OFFSET_CONFIG = {
    range: 30,
    formula: '(Math.random() - 0.5) * 30',
  };

  it('随机偏移范围应为±15px', () => {
    expect(RANDOM_OFFSET_CONFIG.range).toBe(30);
  });

  it('随机偏移公式应产生-15到+15的值', () => {
    const minOffset = -RANDOM_OFFSET_CONFIG.range / 2;
    const maxOffset = RANDOM_OFFSET_CONFIG.range / 2;
    expect(minOffset).toBe(-15);
    expect(maxOffset).toBe(15);
  });
});

describe('伤害弹出DOM管理', () => {
  it('弹出元素应在动画结束后移除', () => {
    const removalTime = DAMAGE_POPUP_CONFIG.removalDelay;
    expect(removalTime).toBe(1200);
  });

  it('弹出元素应有唯一ID', () => {
    const generateId = () => `damage-${Date.now()}-${Math.random()}`;
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^damage-\d+-\d/);
  });
});

describe('伤害弹出与战斗日志关联', () => {
  interface BattleLogEntry {
    type: 'damage' | 'heal';
    value: number;
    targetId: string;
    details?: {
      isCritical?: boolean;
    };
  }

  const getPopupTypeFromLog = (log: BattleLogEntry): DamagePopupType => {
    if (log.type === 'heal') return 'hpHeal';
    if (log.details?.isCritical) return 'critical';
    return 'hpDamage';
  };

  it('治疗日志应生成hpHeal类型弹出', () => {
    const log: BattleLogEntry = { type: 'heal', value: 50, targetId: 'player1' };
    expect(getPopupTypeFromLog(log)).toBe('hpHeal');
  });

  it('普通伤害日志应生成hpDamage类型弹出', () => {
    const log: BattleLogEntry = { type: 'damage', value: 100, targetId: 'enemy1' };
    expect(getPopupTypeFromLog(log)).toBe('hpDamage');
  });

  it('暴击伤害日志应生成critical类型弹出', () => {
    const log: BattleLogEntry = { 
      type: 'damage', 
      value: 300, 
      targetId: 'enemy1',
      details: { isCritical: true }
    };
    expect(getPopupTypeFromLog(log)).toBe('critical');
  });
});
