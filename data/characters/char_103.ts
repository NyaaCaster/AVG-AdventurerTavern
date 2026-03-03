
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_103';

export const char_103: Character = {
  battleData: {
  maxLevel: 99,
  className: "元素法师",
  optimizeType: "magic",
  canFight: true,
  statMultipliers: {
    hp: 80,
    mp: 120,
    atk: 50,
    def: 50,
    matk: 150,
    mdef: 120,
    agi: 80,
    luk: 150
  },
  skills: [
    {
      level: 1,
      skillId: 802,
      ratio: 80
    },
    {
      level: 1,
      skillId: 723,
      ratio: 80
    },
    {
      level: 1,
      skillId: 551,
      ratio: 80
    },
    {
      level: 1,
      skillId: 552,
      ratio: 80
    },
    {
      level: 1,
      skillId: 553,
      ratio: 80
    },
    {
      level: 1,
      skillId: 542,
      ratio: 80
    },
    {
      level: 1,
      skillId: 545,
      ratio: 80
    },
    {
      level: 1,
      skillId: 728,
      ratio: 80
    },
    {
      level: 1,
      skillId: 727,
      ratio: 80
    },
    {
      level: 10,
      skillId: 554,
      ratio: 80
    },
    {
      level: 10,
      skillId: 555,
      ratio: 80
    },
    {
      level: 10,
      skillId: 556,
      ratio: 80
    },
    {
      level: 20,
      skillId: 557,
      ratio: 80
    },
    {
      level: 20,
      skillId: 558,
      ratio: 120
    },
    {
      level: 20,
      skillId: 559,
      ratio: 100
    },
    {
      level: 20,
      skillId: 543,
      ratio: 100
    },
    {
      level: 20,
      skillId: 546,
      ratio: 100
    }
  ]
},
  id: 'char_103',
  name: "欧若拉",
  role: "皇女 / 冒险者",
  description: "第107代皇帝第三皇女。因被勇者悔婚而恼羞成怒追至乡下，隐瞒身份体验冒险者生活。天真烂漫，好奇心旺盛，拥有强大的魔法天赋但不谙世事。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE
};
