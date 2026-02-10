
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_107';

export const char_107: Character = {
  id: 'char_107',
  name: "菲洛",
  role: "精灵族学者 / 魔法师",
  description: "820岁的精灵族学者，外表年轻。对魔法与炼金术充满热情，好奇心旺盛。一眼看穿了主角的权能，目前对主角抱有强烈的研究兴趣。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_4', minLevel: 3 }
  ],
  schedule: {
    day: ['scen_1', 'scen_2', 'scen_4', 'scen_10'],
    evening: ['scen_1', 'scen_3', 'scen_4'],
    night: ['scen_2', 'scen_7', 'scen_9']
  }
};
