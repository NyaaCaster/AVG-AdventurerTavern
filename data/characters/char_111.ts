
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_111';

export const char_111: Character = {
  id: 'char_111',
  name: "吉娜",
  role: "人族技师 / 工匠",
  description: "大大咧咧的机械工匠，技术高超但生活粗糙。经常被误认为是男性，实则拥有丰满的身材。在旅店旁搭建了工坊，喜欢对同性进行性骚扰。",
  avatarUrl: "img/face/111.png",
  spriteUrl: "img/char/char_111/111_1_1.png",
  emotions: {
    normal: "img/char/char_111/111_1_1.png",
    happy: "img/char/char_111/111_1_2.png",
    angry: "img/char/char_111/111_1_3.png",
    sad: "img/char/char_111/111_1_5.png",
    shy: "img/char/char_111/111_1_6.png"
  },
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 1 },
    { sceneId: 'scen_8', minLevel: 2 }
  ],
  schedule: {
    day: ['scen_5', 'scen_6', 'scen_9', 'scen_10'],
    evening: ['scen_3'],
    night: ['scen_2', 'scen_7', 'scen_8']
  }
};
