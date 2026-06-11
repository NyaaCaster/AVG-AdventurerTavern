import type { AIResponse } from '../services/llmService';
import { CharacterUnlocks, SceneId } from '../types';
import { ITEMS } from '../data/items';
import { canAttemptUnlock, getDefaultUnlocks, UNLOCK_STATUS_NAMES } from '../data/unlockConditions';
import { SCENE_NAMES } from './gameConstants';

const MAX_ITEM_COUNT = 999;
const MAX_MEMORY_ENTRIES = 5;
const MAX_MEMORY_LENGTH = 200;
const VALID_CLOTHING_STATES = new Set(['default', 'nude', 'bondage']);

export interface AIResponseValidationContext {
  characterId: string;
  currentAffinity: number;
  characterUnlocks?: CharacterUnlocks;
  sessionLearnedSkill: boolean;
  nsfwEnabled: boolean;
}

export interface AIResponseValidationResult {
  response: AIResponse;
  warnings: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return null;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const isUnlockKey = (value: unknown): value is keyof CharacterUnlocks => {
  return typeof value === 'string' && value in UNLOCK_STATUS_NAMES;
};

const isSceneId = (value: unknown): value is SceneId => {
  return typeof value === 'string' && value in SCENE_NAMES;
};

export function validateAIResponse(
  rawResponse: AIResponse,
  context: AIResponseValidationContext
): AIResponseValidationResult {
  const warnings: string[] = [];
  const response: AIResponse = {
    ...rawResponse,
    text: typeof rawResponse.text === 'string' ? rawResponse.text : String(rawResponse.text || ''),
    emotion: typeof rawResponse.emotion === 'string' && rawResponse.emotion.trim()
      ? rawResponse.emotion.trim()
      : 'normal'
  };

  const warn = (message: string) => warnings.push(message);

  if (rawResponse.clothing !== undefined) {
    const clothing = String(rawResponse.clothing).toLowerCase().trim();
    if (!context.nsfwEnabled) {
      delete response.clothing;
      warn(`Dropped clothing change because NSFW is disabled: ${rawResponse.clothing}`);
    } else if (VALID_CLOTHING_STATES.has(clothing)) {
      response.clothing = clothing;
    } else {
      delete response.clothing;
      warn(`Dropped invalid clothing state: ${rawResponse.clothing}`);
    }
  }

  if (rawResponse.affinity_change !== undefined) {
    const affinityChange = toInteger(rawResponse.affinity_change);
    if (affinityChange === null) {
      delete response.affinity_change;
      warn(`Dropped invalid affinity_change: ${rawResponse.affinity_change}`);
    } else {
      response.affinity_change = clamp(affinityChange, -5, 5);
      if (response.affinity_change !== affinityChange) {
        warn(`Clamped affinity_change from ${affinityChange} to ${response.affinity_change}`);
      }
    }
  }

  if (rawResponse.move_to !== undefined) {
    if (isSceneId(rawResponse.move_to)) {
      response.move_to = rawResponse.move_to;
    } else {
      delete response.move_to;
      warn(`Dropped invalid move_to: ${rawResponse.move_to}`);
    }
  }

  if (rawResponse.items !== undefined) {
    if (!Array.isArray(rawResponse.items)) {
      response.items = [];
      warn('Dropped invalid items field: not an array');
    } else {
      response.items = rawResponse.items.flatMap((item, index) => {
        if (!isRecord(item)) {
          warn(`Dropped invalid item at index ${index}: not an object`);
          return [];
        }

        const id = typeof item.id === 'string' ? item.id : '';
        const count = toInteger(item.count);

        if (!id || !ITEMS[id]) {
          warn(`Dropped unknown item id at index ${index}: ${id || String(item.id)}`);
          return [];
        }
        if (count === null || count <= 0) {
          warn(`Dropped invalid item count for ${id}: ${String(item.count)}`);
          return [];
        }

        const safeCount = clamp(count, 1, MAX_ITEM_COUNT);
        if (safeCount !== count) {
          warn(`Clamped item count for ${id} from ${count} to ${safeCount}`);
        }
        return [{ id, count: safeCount }];
      });
    }
  }

  if (rawResponse.unlock_request !== undefined) {
    const unlocks = context.characterUnlocks || getDefaultUnlocks();
    if (!isUnlockKey(rawResponse.unlock_request)) {
      delete response.unlock_request;
      warn(`Dropped invalid unlock_request key: ${String(rawResponse.unlock_request)}`);
    } else if (unlocks[rawResponse.unlock_request] === 1) {
      delete response.unlock_request;
      warn(`Dropped already-unlocked unlock_request: ${rawResponse.unlock_request}`);
    } else {
      const check = canAttemptUnlock(context.characterId, rawResponse.unlock_request, context.currentAffinity);
      if (check.canAttempt) {
        response.unlock_request = rawResponse.unlock_request;
      } else {
        delete response.unlock_request;
        warn(`Dropped blocked unlock_request ${rawResponse.unlock_request}: ${check.reason || 'business rule failed'}`);
      }
    }
  }

  if (rawResponse.learned_skill !== undefined) {
    const unlocks = context.characterUnlocks || getDefaultUnlocks();
    if (context.sessionLearnedSkill) {
      delete response.learned_skill;
      warn('Dropped learned_skill because this dialogue already learned a skill');
    } else if (unlocks.accept_direct_sexual !== 1) {
      delete response.learned_skill;
      warn('Dropped learned_skill because accept_direct_sexual is not unlocked');
    } else {
      response.learned_skill = true;
    }
  }

  if (rawResponse.update_memory !== undefined) {
    if (!Array.isArray(rawResponse.update_memory)) {
      delete response.update_memory;
      warn('Dropped invalid update_memory: not an array');
    } else {
      const memories = rawResponse.update_memory
        .filter((entry, index): entry is string => {
          const valid = typeof entry === 'string' && entry.trim().length > 0;
          if (!valid) warn(`Dropped invalid memory entry at index ${index}`);
          return valid;
        })
        .slice(0, MAX_MEMORY_ENTRIES)
        .map(entry => {
          const trimmed = entry.trim();
          if (trimmed.length > MAX_MEMORY_LENGTH) {
            warn(`Truncated memory entry from ${trimmed.length} to ${MAX_MEMORY_LENGTH} characters`);
          }
          return trimmed.slice(0, MAX_MEMORY_LENGTH);
        });

      if (rawResponse.update_memory.length > MAX_MEMORY_ENTRIES) {
        warn(`Dropped ${rawResponse.update_memory.length - MAX_MEMORY_ENTRIES} excess memory entries`);
      }

      if (memories.length > 0) {
        response.update_memory = memories;
      } else {
        delete response.update_memory;
      }
    }
  }

  return { response, warnings };
}
