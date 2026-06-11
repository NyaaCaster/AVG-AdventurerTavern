import { describe, expect, it } from 'vitest';
import { validateAIResponse } from '../../utils/aiResponseValidation';
import { CharacterUnlocks } from '../../types';
import { getDefaultUnlocks } from '../../data/unlockConditions';

const makeUnlocks = (overrides: Partial<CharacterUnlocks> = {}): CharacterUnlocks => ({
  ...getDefaultUnlocks(),
  ...overrides
});

const baseContext = {
  characterId: 'char_103',
  currentAffinity: 60,
  characterUnlocks: makeUnlocks(),
  sessionLearnedSkill: false,
  nsfwEnabled: true
};

describe('validateAIResponse', () => {
  it('keeps valid item gains and drops invalid item gains', () => {
    const result = validateAIResponse({
      text: '拿去吧。',
      emotion: 'happy',
      items: [
        { id: 'res-0001', count: 2 },
        { id: 'missing-item', count: 1 },
        { id: 'res-0002', count: -3 }
      ]
    }, baseContext);

    expect(result.response.items).toEqual([{ id: 'res-0001', count: 2 }]);
    expect(result.warnings.some(w => w.includes('unknown item'))).toBe(true);
    expect(result.warnings.some(w => w.includes('invalid item count'))).toBe(true);
  });

  it('clamps affinity_change to the allowed per-response range', () => {
    const result = validateAIResponse({
      text: '谢谢你。',
      emotion: 'happy',
      affinity_change: 99
    }, baseContext);

    expect(result.response.affinity_change).toBe(5);
    expect(result.warnings.some(w => w.includes('Clamped affinity_change'))).toBe(true);
  });

  it('drops invalid move_to scene ids', () => {
    const result = validateAIResponse({
      text: '我们走吧。',
      emotion: 'normal',
      move_to: 'invalid_scene'
    } as any, baseContext);

    expect(result.response.move_to).toBeUndefined();
    expect(result.warnings.some(w => w.includes('invalid move_to'))).toBe(true);
  });

  it('allows unlock_request only when affinity and character restrictions pass', () => {
    const allowed = validateAIResponse({
      text: '好吧。',
      emotion: 'shy',
      unlock_request: 'accept_direct_sexual'
    }, baseContext);

    const blocked = validateAIResponse({
      text: '我不适合战斗。',
      emotion: 'sad',
      unlock_request: 'accept_battle_party'
    }, {
      ...baseContext,
      characterId: 'char_101',
      currentAffinity: 100
    });

    expect(allowed.response.unlock_request).toBe('accept_direct_sexual');
    expect(blocked.response.unlock_request).toBeUndefined();
    expect(blocked.warnings.some(w => w.includes('blocked unlock_request'))).toBe(true);
  });

  it('drops learned_skill unless direct sexual interaction is unlocked and session is not locked', () => {
    const blocked = validateAIResponse({
      text: '啊...',
      emotion: 'pleasure',
      learned_skill: true
    }, baseContext);

    const allowed = validateAIResponse({
      text: '啊...',
      emotion: 'pleasure',
      learned_skill: true
    }, {
      ...baseContext,
      characterUnlocks: makeUnlocks({ accept_direct_sexual: 1 })
    });

    const locked = validateAIResponse({
      text: '啊...',
      emotion: 'pleasure',
      learned_skill: true
    }, {
      ...baseContext,
      characterUnlocks: makeUnlocks({ accept_direct_sexual: 1 }),
      sessionLearnedSkill: true
    });

    expect(blocked.response.learned_skill).toBeUndefined();
    expect(allowed.response.learned_skill).toBe(true);
    expect(locked.response.learned_skill).toBeUndefined();
  });

  it('normalizes clothing and blocks clothing changes when NSFW is disabled', () => {
    const allowed = validateAIResponse({
      text: '好。',
      emotion: 'normal',
      clothing: 'NUDE'
    }, baseContext);

    const blocked = validateAIResponse({
      text: '好。',
      emotion: 'normal',
      clothing: 'nude'
    }, {
      ...baseContext,
      nsfwEnabled: false
    });

    expect(allowed.response.clothing).toBe('nude');
    expect(blocked.response.clothing).toBeUndefined();
  });

  it('limits update_memory entry count and length', () => {
    const longMemory = '一'.repeat(250);
    const result = validateAIResponse({
      text: '我会记住的。',
      emotion: 'normal',
      update_memory: [longMemory, '  有效记忆  ', '', '二', '三', '四', '五']
    }, baseContext);

    expect(result.response.update_memory).toHaveLength(5);
    expect(result.response.update_memory?.[0]).toHaveLength(200);
    expect(result.response.update_memory?.[1]).toBe('有效记忆');
    expect(result.warnings.some(w => w.includes('Truncated memory'))).toBe(true);
  });
});
