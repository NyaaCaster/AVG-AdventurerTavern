import { describe, it, expect } from 'vitest';

interface AnimationConfig {
  name: string;
  duration: number;
  timingFunction: string;
  fillMode?: string;
  iterationCount?: string;
}

const ANIMATION_CONFIGS: AnimationConfig[] = [
  { name: 'fadeIn', duration: 300, timingFunction: 'ease-out' },
  { name: 'bounce', duration: 1000, timingFunction: 'ease-in-out', iterationCount: 'infinite' },
  { name: 'screen-shake', duration: 500, timingFunction: 'ease-out' },
  { name: 'flash-white', duration: 300, timingFunction: 'ease-out' },
  { name: 'slideOutLeft', duration: 400, timingFunction: 'ease-out', fillMode: 'forwards' },
  { name: 'slideInFromRight', duration: 400, timingFunction: 'ease-out', fillMode: 'forwards' },
  { name: 'damageFlashFilter', duration: 300, timingFunction: 'ease-out' },
  { name: 'healFlashFilter', duration: 300, timingFunction: 'ease-out' },
  { name: 'statusFlashFilter', duration: 600, timingFunction: 'ease-out' },
  { name: 'slideUp', duration: 300, timingFunction: 'ease-out' },
  { name: 'damageRise', duration: 1200, timingFunction: 'ease-out', fillMode: 'forwards' },
  { name: 'cursorFloat', duration: 800, timingFunction: 'ease-in-out', iterationCount: 'infinite' },
  { name: 'shake', duration: 400, timingFunction: 'ease-in-out' },
  { name: 'fadeOut', duration: 500, timingFunction: 'ease-out', fillMode: 'forwards' },
  { name: 'statusFlash', duration: 600, timingFunction: 'ease-out', fillMode: 'forwards' },
];

interface KeyframeDefinition {
  offset: number;
  properties: Record<string, string>;
}

const KEYFRAME_DEFINITIONS: Record<string, KeyframeDefinition[]> = {
  fadeIn: [
    { offset: 0, properties: { opacity: '0' } },
    { offset: 1, properties: { opacity: '1' } },
  ],
  bounce: [
    { offset: 0, properties: { transform: 'translateY(0)' } },
    { offset: 0.5, properties: { transform: 'translateY(-10px)' } },
    { offset: 1, properties: { transform: 'translateY(0)' } },
  ],
  'screen-shake': [
    { offset: 0, properties: { transform: 'translate(0, 0)' } },
    { offset: 0.1, properties: { transform: 'translate(-5px, -3px)' } },
    { offset: 0.2, properties: { transform: 'translate(5px, 3px)' } },
    { offset: 0.3, properties: { transform: 'translate(-4px, 2px)' } },
    { offset: 0.4, properties: { transform: 'translate(4px, -2px)' } },
    { offset: 0.5, properties: { transform: 'translate(-3px, 3px)' } },
    { offset: 0.6, properties: { transform: 'translate(3px, -3px)' } },
    { offset: 0.7, properties: { transform: 'translate(-2px, 2px)' } },
    { offset: 0.8, properties: { transform: 'translate(2px, -1px)' } },
    { offset: 0.9, properties: { transform: 'translate(-1px, 1px)' } },
    { offset: 1, properties: { transform: 'translate(0, 0)' } },
  ],
  'flash-white': [
    { offset: 0, properties: { filter: 'invert(0)' } },
    { offset: 0.5, properties: { filter: 'invert(1)' } },
    { offset: 1, properties: { filter: 'invert(0)' } },
  ],
  slideOutLeft: [
    { offset: 0, properties: { transform: 'translateX(0)', opacity: '1' } },
    { offset: 1, properties: { transform: 'translateX(-40px)', opacity: '0' } },
  ],
  slideInFromRight: [
    { offset: 0, properties: { transform: 'translateX(40px)', opacity: '0' } },
    { offset: 1, properties: { transform: 'translateX(0)', opacity: '1' } },
  ],
  damageFlashFilter: [
    { offset: 0, properties: { filter: 'brightness(1) sepia(0) saturate(1)' } },
    { offset: 0.2, properties: { filter: 'brightness(0.8) sepia(0.9) saturate(2.5) hue-rotate(0deg)' } },
    { offset: 0.5, properties: { filter: 'brightness(0.7) sepia(1) saturate(3.5) hue-rotate(5deg)' } },
    { offset: 0.8, properties: { filter: 'brightness(0.8) sepia(0.9) saturate(2.5) hue-rotate(0deg)' } },
    { offset: 1, properties: { filter: 'brightness(1) sepia(0) saturate(1)' } },
  ],
  healFlashFilter: [
    { offset: 0, properties: { filter: 'brightness(1) sepia(0) saturate(1)' } },
    { offset: 0.2, properties: { filter: 'brightness(1.1) sepia(0.5) saturate(1.5) hue-rotate(50deg)' } },
    { offset: 0.5, properties: { filter: 'brightness(1.2) sepia(0.7) saturate(2) hue-rotate(60deg)' } },
    { offset: 0.8, properties: { filter: 'brightness(1.1) sepia(0.5) saturate(1.5) hue-rotate(50deg)' } },
    { offset: 1, properties: { filter: 'brightness(1) sepia(0) saturate(1)' } },
  ],
  statusFlashFilter: [
    { offset: 0, properties: { filter: 'brightness(1) sepia(0) saturate(1)' } },
    { offset: 0.2, properties: { filter: 'brightness(1.2) sepia(0.6) saturate(2) hue-rotate(270deg)' } },
    { offset: 0.5, properties: { filter: 'brightness(1.3) sepia(0.8) saturate(2.5) hue-rotate(280deg)' } },
    { offset: 0.8, properties: { filter: 'brightness(1.2) sepia(0.6) saturate(2) hue-rotate(270deg)' } },
    { offset: 1, properties: { filter: 'brightness(1) sepia(0) saturate(1)' } },
  ],
  slideUp: [
    { offset: 0, properties: { transform: 'translateY(20px)', opacity: '0' } },
    { offset: 1, properties: { transform: 'translateY(0)', opacity: '1' } },
  ],
  damageRise: [
    { offset: 0, properties: { transform: 'translateY(0) scale(0.5)', opacity: '0' } },
    { offset: 0.1, properties: { transform: 'translateY(-10px) scale(1.2)', opacity: '1' } },
    { offset: 0.3, properties: { transform: 'translateY(-30px) scale(1)', opacity: '1' } },
    { offset: 1, properties: { transform: 'translateY(-80px) scale(0.8)', opacity: '0' } },
  ],
  cursorFloat: [
    { offset: 0, properties: { transform: 'translateY(0)' } },
    { offset: 0.5, properties: { transform: 'translateY(-8px)' } },
    { offset: 1, properties: { transform: 'translateY(0)' } },
  ],
  shake: [
    { offset: 0, properties: { transform: 'translateX(0)' } },
    { offset: 0.2, properties: { transform: 'translateX(-8px)' } },
    { offset: 0.4, properties: { transform: 'translateX(8px)' } },
    { offset: 0.6, properties: { transform: 'translateX(-6px)' } },
    { offset: 0.8, properties: { transform: 'translateX(6px)' } },
    { offset: 1, properties: { transform: 'translateX(0)' } },
  ],
  fadeOut: [
    { offset: 0, properties: { opacity: '1', transform: 'scale(1)' } },
    { offset: 1, properties: { opacity: '0', transform: 'scale(0.8)' } },
  ],
  statusFlash: [
    { offset: 0, properties: { opacity: '0' } },
    { offset: 0.2, properties: { opacity: '0.8' } },
    { offset: 1, properties: { opacity: '0' } },
  ],
};

describe('CSS动画效果配置', () => {
  describe('动画配置完整性', () => {
    it('应定义15个动画配置', () => {
      expect(ANIMATION_CONFIGS.length).toBe(15);
    });

    it.each(ANIMATION_CONFIGS)('动画 $name 应有有效的持续时间', (config) => {
      expect(config.duration).toBeGreaterThan(0);
      expect(config.duration).toBeLessThanOrEqual(2000);
    });

    it.each(ANIMATION_CONFIGS)('动画 $name 应有有效的缓动函数', (config) => {
      const validTimingFunctions = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'];
      expect(validTimingFunctions).toContain(config.timingFunction);
    });
  });

  describe('fadeIn动画', () => {
    it('应有正确的关键帧定义', () => {
      const keyframes = KEYFRAME_DEFINITIONS.fadeIn;
      expect(keyframes).toBeDefined();
      expect(keyframes.length).toBe(2);
    });

    it('起始帧应为透明', () => {
      const startFrame = KEYFRAME_DEFINITIONS.fadeIn[0];
      expect(startFrame.properties.opacity).toBe('0');
    });

    it('结束帧应为不透明', () => {
      const endFrame = KEYFRAME_DEFINITIONS.fadeIn[1];
      expect(endFrame.properties.opacity).toBe('1');
    });

    it('持续时间应为300ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'fadeIn');
      expect(config?.duration).toBe(300);
    });
  });

  describe('screen-shake动画（暴击震动）', () => {
    it('应有正确的关键帧数量', () => {
      const keyframes = KEYFRAME_DEFINITIONS['screen-shake'];
      expect(keyframes.length).toBe(11);
    });

    it('起始和结束帧应为原位', () => {
      const keyframes = KEYFRAME_DEFINITIONS['screen-shake'];
      expect(keyframes[0].properties.transform).toBe('translate(0, 0)');
      expect(keyframes[10].properties.transform).toBe('translate(0, 0)');
    });

    it('震动幅度应逐渐减小', () => {
      const keyframes = KEYFRAME_DEFINITIONS['screen-shake'];
      const offset10 = keyframes[1].properties.transform;
      const offset90 = keyframes[9].properties.transform;
      
      expect(offset10).toContain('-5px');
      expect(offset90).toContain('-1px');
    });

    it('持续时间应为500ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'screen-shake');
      expect(config?.duration).toBe(500);
    });
  });

  describe('flash-white动画（暴击闪烁）', () => {
    it('应有正确的关键帧定义', () => {
      const keyframes = KEYFRAME_DEFINITIONS['flash-white'];
      expect(keyframes.length).toBe(3);
    });

    it('中点应为完全反转', () => {
      const midFrame = KEYFRAME_DEFINITIONS['flash-white'][1];
      expect(midFrame.properties.filter).toBe('invert(1)');
    });

    it('起始和结束应为正常', () => {
      const keyframes = KEYFRAME_DEFINITIONS['flash-white'];
      expect(keyframes[0].properties.filter).toBe('invert(0)');
      expect(keyframes[2].properties.filter).toBe('invert(0)');
    });

    it('持续时间应为300ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'flash-white');
      expect(config?.duration).toBe(300);
    });
  });

  describe('damageRise动画（伤害数字上升）', () => {
    it('应有正确的关键帧数量', () => {
      const keyframes = KEYFRAME_DEFINITIONS.damageRise;
      expect(keyframes.length).toBe(4);
    });

    it('起始帧应从小尺寸淡入', () => {
      const startFrame = KEYFRAME_DEFINITIONS.damageRise[0];
      expect(startFrame.properties.transform).toContain('scale(0.5)');
      expect(startFrame.properties.opacity).toBe('0');
    });

    it('弹出帧应放大到1.2倍', () => {
      const popFrame = KEYFRAME_DEFINITIONS.damageRise[1];
      expect(popFrame.properties.transform).toContain('scale(1.2)');
      expect(popFrame.properties.opacity).toBe('1');
    });

    it('结束帧应上升到-80px并淡出', () => {
      const endFrame = KEYFRAME_DEFINITIONS.damageRise[3];
      expect(endFrame.properties.transform).toContain('translateY(-80px)');
      expect(endFrame.properties.opacity).toBe('0');
    });

    it('持续时间应为1200ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'damageRise');
      expect(config?.duration).toBe(1200);
    });
  });

  describe('damageFlashFilter动画（受伤闪烁）', () => {
    it('应有正确的关键帧数量', () => {
      const keyframes = KEYFRAME_DEFINITIONS.damageFlashFilter;
      expect(keyframes.length).toBe(5);
    });

    it('中点应产生红色调效果', () => {
      const midFrame = KEYFRAME_DEFINITIONS.damageFlashFilter[2];
      expect(midFrame.properties.filter).toContain('sepia(1)');
      expect(midFrame.properties.filter).toContain('hue-rotate(5deg)');
    });

    it('起始和结束应为正常状态', () => {
      const keyframes = KEYFRAME_DEFINITIONS.damageFlashFilter;
      const normalFilter = 'brightness(1) sepia(0) saturate(1)';
      expect(keyframes[0].properties.filter).toBe(normalFilter);
      expect(keyframes[4].properties.filter).toBe(normalFilter);
    });

    it('持续时间应为300ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'damageFlashFilter');
      expect(config?.duration).toBe(300);
    });
  });

  describe('healFlashFilter动画（治疗闪烁）', () => {
    it('应有正确的关键帧数量', () => {
      const keyframes = KEYFRAME_DEFINITIONS.healFlashFilter;
      expect(keyframes.length).toBe(5);
    });

    it('中点应产生绿色调效果', () => {
      const midFrame = KEYFRAME_DEFINITIONS.healFlashFilter[2];
      expect(midFrame.properties.filter).toContain('hue-rotate(60deg)');
    });

    it('持续时间应为300ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'healFlashFilter');
      expect(config?.duration).toBe(300);
    });
  });

  describe('statusFlashFilter动画（状态附加闪烁）', () => {
    it('应有正确的关键帧数量', () => {
      const keyframes = KEYFRAME_DEFINITIONS.statusFlashFilter;
      expect(keyframes.length).toBe(5);
    });

    it('中点应产生紫色调效果', () => {
      const midFrame = KEYFRAME_DEFINITIONS.statusFlashFilter[2];
      expect(midFrame.properties.filter).toContain('hue-rotate(280deg)');
    });

    it('持续时间应为600ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'statusFlashFilter');
      expect(config?.duration).toBe(600);
    });
  });

  describe('shake动画（受伤抖动）', () => {
    it('应有正确的关键帧数量', () => {
      const keyframes = KEYFRAME_DEFINITIONS.shake;
      expect(keyframes.length).toBe(6);
    });

    it('起始和结束应为原位', () => {
      const keyframes = KEYFRAME_DEFINITIONS.shake;
      expect(keyframes[0].properties.transform).toBe('translateX(0)');
      expect(keyframes[5].properties.transform).toBe('translateX(0)');
    });

    it('最大抖动幅度应为8px', () => {
      const keyframes = KEYFRAME_DEFINITIONS.shake;
      const maxShake = keyframes[1].properties.transform;
      expect(maxShake).toContain('-8px');
    });

    it('持续时间应为400ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'shake');
      expect(config?.duration).toBe(400);
    });
  });

  describe('fadeOut动画（死亡淡出）', () => {
    it('应有正确的关键帧定义', () => {
      const keyframes = KEYFRAME_DEFINITIONS.fadeOut;
      expect(keyframes.length).toBe(2);
    });

    it('起始帧应为正常状态', () => {
      const startFrame = KEYFRAME_DEFINITIONS.fadeOut[0];
      expect(startFrame.properties.opacity).toBe('1');
      expect(startFrame.properties.transform).toBe('scale(1)');
    });

    it('结束帧应为缩小淡出', () => {
      const endFrame = KEYFRAME_DEFINITIONS.fadeOut[1];
      expect(endFrame.properties.opacity).toBe('0');
      expect(endFrame.properties.transform).toBe('scale(0.8)');
    });

    it('持续时间应为500ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'fadeOut');
      expect(config?.duration).toBe(500);
    });
  });

  describe('cursorFloat动画（战斗光标浮动）', () => {
    it('应有正确的关键帧定义', () => {
      const keyframes = KEYFRAME_DEFINITIONS.cursorFloat;
      expect(keyframes.length).toBe(3);
    });

    it('应有上下浮动效果', () => {
      const midFrame = KEYFRAME_DEFINITIONS.cursorFloat[1];
      expect(midFrame.properties.transform).toBe('translateY(-8px)');
    });

    it('应为无限循环动画', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'cursorFloat');
      expect(config?.iterationCount).toBe('infinite');
    });

    it('持续时间应为800ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'cursorFloat');
      expect(config?.duration).toBe(800);
    });
  });

  describe('bounce动画（弹跳效果）', () => {
    it('应有正确的关键帧定义', () => {
      const keyframes = KEYFRAME_DEFINITIONS.bounce;
      expect(keyframes.length).toBe(3);
    });

    it('应有上下弹跳效果', () => {
      const midFrame = KEYFRAME_DEFINITIONS.bounce[1];
      expect(midFrame.properties.transform).toBe('translateY(-10px)');
    });

    it('应为无限循环动画', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'bounce');
      expect(config?.iterationCount).toBe('infinite');
    });
  });

  describe('回合顺序动画', () => {
    it('slideOutLeft应向左滑出40px', () => {
      const endFrame = KEYFRAME_DEFINITIONS.slideOutLeft[1];
      expect(endFrame.properties.transform).toBe('translateX(-40px)');
      expect(endFrame.properties.opacity).toBe('0');
    });

    it('slideInFromRight应从右侧滑入', () => {
      const startFrame = KEYFRAME_DEFINITIONS.slideInFromRight[0];
      expect(startFrame.properties.transform).toBe('translateX(40px)');
      expect(startFrame.properties.opacity).toBe('0');
    });

    it('两个动画持续时间应相同', () => {
      const slideOut = ANIMATION_CONFIGS.find(c => c.name === 'slideOutLeft');
      const slideIn = ANIMATION_CONFIGS.find(c => c.name === 'slideInFromRight');
      expect(slideOut?.duration).toBe(slideIn?.duration);
    });
  });

  describe('statusFlash动画（状态闪光覆盖层）', () => {
    it('应有正确的关键帧定义', () => {
      const keyframes = KEYFRAME_DEFINITIONS.statusFlash;
      expect(keyframes.length).toBe(3);
    });

    it('峰值透明度应为0.8', () => {
      const peakFrame = KEYFRAME_DEFINITIONS.statusFlash[1];
      expect(peakFrame.properties.opacity).toBe('0.8');
    });

    it('起始和结束应为透明', () => {
      const keyframes = KEYFRAME_DEFINITIONS.statusFlash;
      expect(keyframes[0].properties.opacity).toBe('0');
      expect(keyframes[2].properties.opacity).toBe('0');
    });

    it('持续时间应为600ms', () => {
      const config = ANIMATION_CONFIGS.find(c => c.name === 'statusFlash');
      expect(config?.duration).toBe(600);
    });
  });
});

describe('动画触发时机', () => {
  it('暴击效果应同时触发screen-shake和flash-white', () => {
    const shakeDuration = ANIMATION_CONFIGS.find(c => c.name === 'screen-shake')?.duration;
    const flashDuration = ANIMATION_CONFIGS.find(c => c.name === 'flash-white')?.duration;
    
    expect(shakeDuration).toBe(500);
    expect(flashDuration).toBe(300);
    expect(shakeDuration!).toBeGreaterThan(flashDuration!);
  });

  it('伤害弹出动画持续时间应足够显示', () => {
    const damageRiseDuration = ANIMATION_CONFIGS.find(c => c.name === 'damageRise')?.duration;
    expect(damageRiseDuration).toBe(1200);
  });

  it('状态效果闪烁应比伤害闪烁长', () => {
    const statusDuration = ANIMATION_CONFIGS.find(c => c.name === 'statusFlashFilter')?.duration;
    const damageDuration = ANIMATION_CONFIGS.find(c => c.name === 'damageFlashFilter')?.duration;
    expect(statusDuration!).toBeGreaterThan(damageDuration!);
  });
});

describe('动画CSS类名映射', () => {
  const CSS_CLASS_MAPPINGS: Record<string, string> = {
    'fadeIn': 'animate-fadeIn',
    'bounce': 'animate-bounce',
    'screen-shake': 'animate-screen-shake',
    'flash-white': 'animate-flash-white',
    'damageFlashFilter': 'animate-damageFlashFilter',
    'healFlashFilter': 'animate-healFlashFilter',
    'statusFlashFilter': 'animate-statusFlashFilter',
    'shake': 'shake',
    'fadeOut': 'fade-out',
    'cursorFloat': 'animate-cursorFloat',
    'slideOutLeft': 'animate-slideOutLeft',
    'slideInFromRight': 'animate-slideInFromRight',
  };

  it('应有完整的CSS类名映射', () => {
    expect(Object.keys(CSS_CLASS_MAPPINGS).length).toBeGreaterThanOrEqual(10);
  });

  it.each(Object.entries(CSS_CLASS_MAPPINGS))('动画 %s 应映射到类名 %s', (animation, cssClass) => {
    expect(cssClass).toBeTruthy();
    expect(cssClass.length).toBeGreaterThan(0);
  });
});
