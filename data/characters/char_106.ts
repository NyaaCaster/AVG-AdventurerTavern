
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_106';

export const char_106: Character = {
  id: 'char_106',
  name: "艾琳",
  role: "皇女侍卫 / S级冒险者",
  description: "皇女欧若拉的贴身侍卫，高傲的贵族骑士，被称为「战场冰姬」。对皇女赖在乡下感到苦恼。拥有卓越的战斗技术，不擅长处理感情，对萌生的情感容易感到困惑。",
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
