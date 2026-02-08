
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_104';

export const char_104: Character = {
  id: 'char_104',
  name: "朱迪斯",
  role: "暴力修女 / B级冒险者",
  description: "性格火爆的修女，精通火器枪械，喜欢以猛烈射击清扫敌人。酗酒嗜赌，言行粗暴，穿着被自行改造得非常暴露的修女服。虽然品行不端，但精通神圣系魔法。",
  avatarUrl: "img/face/104.png",
  spriteUrl: "img/char/char_104/104_1_1.png",
  emotions: {
    normal: "img/char/char_104/104_1_1.png",
    happy: "img/char/char_104/104_1_2.png",
    angry: "img/char/char_104/104_1_3.png",
    sad: "img/char/char_104/104_1_5.png",
    shy: "img/char/char_104/104_1_6.png"
  },
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_3', minLevel: 2 },
    { sceneId: 'scen_2', minLevel: 3 }
  ],
  schedule: {
    evening: ['scen_3', 'scen_7', 'scen_8'],
    night: ['scen_3', 'scen_2']
  }
};
