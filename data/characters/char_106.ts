
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_106';

export const char_106: Character = {
  id: 'char_106',
  name: "艾琳",
  role: "皇女侍卫 / S级冒险者",
  description: "皇女欧若拉的贴身侍卫，高傲的贵族骑士，被称为「战场冰姬」。对皇女赖在乡下感到苦恼。拥有卓越的战斗技术，不擅长处理感情，对萌生的情感容易感到困惑。",
  avatarUrl: "img/face/106.png",
  spriteUrl: "img/char/char_106/106_1_1.png",
  emotions: {
    normal: "img/char/char_106/106_1_1.png",
    happy: "img/char/char_106/106_1_2.png",
    angry: "img/char/char_106/106_1_3.png",
    sad: "img/char/char_106/106_1_5.png",
    shy: "img/char/char_106/106_1_6.png"
  },
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 3 }
  ],
  schedule: {
    day: ['scen_1', 'scen_3', 'scen_4', 'scen_5', 'scen_6'],
    evening: ['scen_1', 'scen_3', 'scen_4'],
    night: ['scen_2']
  }
};
