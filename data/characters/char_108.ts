
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_108';

export const char_108: Character = {
  id: 'char_108',
  name: "卡特琳娜",
  role: "自卫团女战士 / S级冒险者",
  description: "S级冒险者，温柔善良、备受仰慕的大姐姐。多年来一直作为村庄自卫团的守护者。因忙于工作而认为自己错过了谈婚论嫁的年纪，内心渴望恋情。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_4', minLevel: 2 },
    { sceneId: 'scen_2', minLevel: 3 }
  ],
  schedule: {
    day: ['scen_4', 'scen_5', 'scen_6'],
    night: ['scen_3', 'scen_7', 'scen_8', 'scen_2']
  }
};
