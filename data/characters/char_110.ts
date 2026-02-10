
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_110';

export const char_110: Character = {
  id: 'char_110',
  name: "琉卡",
  role: "亚马逊猎人 / C级冒险者",
  description: "亚马逊族猎人，箭术超群。性格我行我素，有时有些迷糊。为了寻找合适的伴侣而踏上旅程，似乎已经将主角锁定为目标。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 2 },
    { sceneId: 'scen_7', minLevel: 1 }
  ]
};
