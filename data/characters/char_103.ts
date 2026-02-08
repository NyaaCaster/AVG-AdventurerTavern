
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_103';

export const char_103: Character = {
  id: 'char_103',
  name: "欧若拉",
  role: "皇女 / 冒险者",
  description: "第107代皇帝第三皇女。因被勇者悔婚而恼羞成怒追至乡下，隐瞒身份体验冒险者生活。天真烂漫，好奇心旺盛，拥有强大的魔法天赋但不谙世事。",
  avatarUrl: "img/face/103.png",
  spriteUrl: "img/char/char_103/103_1_1.png",
  emotions: {
    normal: "img/char/char_103/103_1_1.png",
    happy: "img/char/char_103/103_1_2.png",
    angry: "img/char/char_103/103_1_3.png",
    sad: "img/char/char_103/103_1_5.png",
    shy: "img/char/char_103/103_1_6.png"
  },
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  schedule: {
    day: ['scen_1', 'scen_3', 'scen_4', 'scen_7'],
    evening: ['scen_1', 'scen_3', 'scen_4'],
    night: ['scen_2']
  }
};
