
import { Character, CharacterImageConfig, CharacterUnlocks } from '../types';
import { GLOBAL_AI_RULES } from './systemPrompts';
import { formatUnlockStatusForAI, getDefaultUnlocks } from './unlockConditions';
import { CHARACTER_UNLOCK_RESTRICTIONS } from './unlockConditions';
import { CHARACTER_IMAGES } from './resources/characterImageResources';
import { CHARACTER_SCHEDULES } from './schedules';

// Import individual characters
import { char_1, USER_INFO_TEMPLATE } from './characters/char_1';
import { char_101 } from './characters/char_101';
import { char_102 } from './characters/char_102';
import { char_103 } from './characters/char_103';
import { char_104 } from './characters/char_104';
import { char_105 } from './characters/char_105';
import { char_106 } from './characters/char_106';
import { char_107 } from './characters/char_107';
import { char_108 } from './characters/char_108';
import { char_109 } from './characters/char_109';
import { char_110 } from './characters/char_110';
import { char_111 } from './characters/char_111';

// Import NSFW prompts to enrich characters dynamically
import * as p101 from './prompts/char_101';
import * as p102 from './prompts/char_102';
import * as p103 from './prompts/char_103';
import * as p104 from './prompts/char_104';
import * as p105 from './prompts/char_105';
import * as p106 from './prompts/char_106';
import * as p107 from './prompts/char_107';
import * as p108 from './prompts/char_108';
import * as p109 from './prompts/char_109';
import * as p110 from './prompts/char_110';
import * as p111 from './prompts/char_111';



// Helper to attach NSFW data, image resources, and schedules
const enrich = (char: Character, prompts: any) => {
  // Attach Prompts
  if (prompts.PERSONA_NSFW) char.persona_nsfw = prompts.PERSONA_NSFW;
  if (prompts.DIALOGUE_NSFW) char.dialogueExamples_nsfw = prompts.DIALOGUE_NSFW;
  
  // Attach Image Resources (avatarUrl)
  // This ensures the rest of the app which expects character.avatarUrl continues to work
  if (CHARACTER_IMAGES[char.id] && CHARACTER_IMAGES[char.id].avatarUrl) {
      char.avatarUrl = CHARACTER_IMAGES[char.id].avatarUrl;
  }

  // Attach Schedule from centralized config
  if (CHARACTER_SCHEDULES[char.id]) {
      char.schedule = CHARACTER_SCHEDULES[char.id];
  }
  
  return char;
};

// Enrich characters
enrich(char_101, p101);
enrich(char_102, p102);
enrich(char_103, p103);
enrich(char_104, p104);
enrich(char_105, p105);
enrich(char_106, p106);
enrich(char_107, p107);
enrich(char_108, p108);
enrich(char_109, p109);
enrich(char_110, p110);
enrich(char_111, p111);

export const generateSystemPrompt = (
  character: Character, 
  userInfo: string, 
  innName: string, 
  enableNSFW: boolean = false,
  characterUnlocks?: CharacterUnlocks,
  currentAffinity?: number,
  isBloodRelated: boolean = true
): string => {
  let persona = character.persona;
  let dialogue = character.dialogueExamples;
  let processedUserInfo = userInfo;

  // 处理 char_101 的血缘关系替换
  if (character.id === 'char_101') {
    const relationship = isBloodRelated ? '亲生姐姐' : '义姐';
    const hairDesc = isBloodRelated ? '和{{user}}一样' : '';
    const userRelationship = isBloodRelated ? '亲生姐姐' : '义姐';
    
    persona = persona
      .replace('{{relationship}}', relationship)
      .replace('{{hair_desc}}', hairDesc);
    
    processedUserInfo = processedUserInfo
      .replace('{{user_relationship}}', userRelationship);
  } else {
    // 对于其他角色，移除占位符
    processedUserInfo = processedUserInfo.replace('{{user_relationship}}', '亲生姐姐');
  }

  if (enableNSFW) {
      if (character.persona_nsfw) {
        let nsfwPersona = character.persona_nsfw;
        
        // 处理 char_101 的血缘关系 NSFW 内容
        if (character.id === 'char_101') {
          const bloodRelatedNsfw = isBloodRelated 
            ? p101.PERSONA_NSFW_BLOOD_RELATED 
            : p101.PERSONA_NSFW_NOT_BLOOD_RELATED;
          nsfwPersona = nsfwPersona.replace('{{blood_related_nsfw}}', bloodRelatedNsfw);
        } else {
          nsfwPersona = nsfwPersona.replace('{{blood_related_nsfw}}', '');
        }
        
        persona += `\n${nsfwPersona}`;
      }
      if (character.dialogueExamples_nsfw) dialogue += `\n${character.dialogueExamples_nsfw}`;
  }

  // Format unlock status for AI
  const unlocks = characterUnlocks || getDefaultUnlocks();
  const unlockStatusText = formatUnlockStatusForAI(unlocks);
  
  // Format current affinity
  const affinityText = currentAffinity !== undefined ? `${currentAffinity}` : '未知';
  
  // Format character restrictions
  const restrictions = CHARACTER_UNLOCK_RESTRICTIONS[character.id];
  let restrictionsText = '无特殊限制';
  if (restrictions && Object.keys(restrictions).length > 0) {
      restrictionsText = Object.entries(restrictions)
          .map(([key, reason]) => `- ${reason}`)
          .join('\n');
  }
  
  // Replace placeholders in GLOBAL_AI_RULES
  let rulesWithContext = GLOBAL_AI_RULES
      .replace('{{UNLOCK_STATUS}}', unlockStatusText)
      .replace('{{CURRENT_AFFINITY}}', affinityText)
      .replace('{{CHARACTER_RESTRICTIONS}}', restrictionsText);

  return `
${rulesWithContext}

${persona}

${dialogue}

${processedUserInfo}

[当前情境]
你正在"${innName}"旅店中。
你是"${character.name}"。
`;
};

export const CHARACTERS: Record<string, Character> = {
  'char_1': char_1,
  'char_101': char_101,
  'char_102': char_102,
  'char_103': char_103,
  'char_104': char_104,
  'char_105': char_105,
  'char_106': char_106,
  'char_107': char_107,
  'char_108': char_108,
  'char_109': char_109,
  'char_110': char_110,
  'char_111': char_111,
};
