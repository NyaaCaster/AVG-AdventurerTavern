
import { Character, CharacterImageConfig } from '../types';
import { GLOBAL_AI_RULES } from './systemPrompts';
import { CHARACTER_IMAGES } from './resources/characterImageResources';

// Import individual characters
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

export const USER_INFO_TEMPLATE = `
## {{user}}-角色信息
- 角色名：{{user}}
- 人族男性，25岁。
- {{user}}过去是战胜魔王的勇者，被称为「疾风の剑圣」，持有圣剑「莫比乌斯」和短时间改变时间流逝的权能。
- 因为{{user}}为人低调，世人知道勇者「疾风の剑圣」讨伐了魔王，但除了国王与大臣几乎无人知道勇者都长相和名字。
- 讨伐魔王后，国王接见{{user}}，并许诺将皇女欧若拉嫁给{{user}}，不愿被皇室身份拘束的{{user}}吓得连夜逃回乡下，协助亲姐姐\`莉莉娅\`经营冒险者旅店，开始了第二段人生。
- 虽已隐退，但战斗技艺并未衰退，只是为了避免暴露身份藏起来圣剑，也不再轻易使用自己的权能。以本名重新登记为E级冒险者。
- 基本上是个认真稳重、性格温柔的人。
- 但同时也是个相当闷骚的人，经常用带有性意味的目光打量前来住宿的女冒险者。
- 由于容貌十分端正，在住宿的女性客人中评价很高。虽然因其性格带有受虐倾向属实，但实际上也兼具施虐的一面。
`;

// Helper to attach NSFW data and image resources
const enrich = (char: Character, prompts: any) => {
  // Attach Prompts
  if (prompts.PERSONA_NSFW) char.persona_nsfw = prompts.PERSONA_NSFW;
  if (prompts.DIALOGUE_NSFW) char.dialogueExamples_nsfw = prompts.DIALOGUE_NSFW;
  
  // Attach Image Resources (avatarUrl)
  // This ensures the rest of the app which expects character.avatarUrl continues to work
  if (CHARACTER_IMAGES[char.id] && CHARACTER_IMAGES[char.id].avatarUrl) {
      char.avatarUrl = CHARACTER_IMAGES[char.id].avatarUrl;
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

export const generateSystemPrompt = (character: Character, userInfo: string, innName: string, enableNSFW: boolean = false): string => {
  let persona = character.persona;
  let dialogue = character.dialogueExamples;

  if (enableNSFW) {
      if (character.persona_nsfw) persona += `\n${character.persona_nsfw}`;
      if (character.dialogueExamples_nsfw) dialogue += `\n${character.dialogueExamples_nsfw}`;
  }

  return `
${GLOBAL_AI_RULES}

${persona}

${dialogue}

[当前情境]
你正在"${innName}"旅店中。
你是"${character.name}"。
`;
};

export const CHARACTERS: Record<string, Character> = {
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
