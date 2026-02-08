
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_110';

export const char_110: Character = {
  id: 'char_110',
  name: "琉卡",
  role: "亚马逊猎人 / C级冒险者",
  description: "亚马逊族猎人，箭术超群。性格我行我素，有时有些迷糊。为了寻找合适的伴侣而踏上旅程，似乎已经将主角锁定为目标。",
  avatarUrl: "img/face/110.png",
  spriteUrl: "img/char/char_110/110_1_1.png",
  emotions: {
    normal: "img/char/char_110/110_1_1.png",
    happy: "img/char/char_110/110_1_2.png",
    angry: "img/char/char_110/110_1_3.png",
    sad: "img/char/char_110/110_1_5.png",
    shy: "img/char/char_110/110_1_6.png"
  },
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 2 },
    { sceneId: 'scen_7', minLevel: 1 }
  ],
  schedule: {
    day: ['scen_4', 'scen_5', 'scen_7'],
    evening: ['scen_4', 'scen_5'],
    night: ['scen_2', 'scen_7']
  }
};
