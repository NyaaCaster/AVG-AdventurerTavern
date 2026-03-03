
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_106';

export const char_106: Character = {
  battleData: {
  maxLevel: 99,
  className: "枪术大师",
  optimizeType: "defense",
  canFight: true,
  statMultipliers: {
    hp: 100,
    mp: 10,
    atk: 150,
    def: 120,
    matk: 20,
    mdef: 20,
    agi: 70,
    luk: 100
  },
  skills: [
    {
      level: 1,
      skillId: 782,
      ratio: 100
    },
    {
      level: 1,
      skillId: 752,
      ratio: 100
    },
    {
      level: 1,
      skillId: 802,
      ratio: 100
    },
    {
      level: 1,
      skillId: 723,
      ratio: 100
    },
    {
      level: 1,
      skillId: 561,
      ratio: 100
    },
    {
      level: 1,
      skillId: 563,
      ratio: 100
    },
    {
      level: 1,
      skillId: 529,
      ratio: 100
    },
    {
      level: 1,
      skillId: 517,
      ratio: 100
    },
    {
      level: 1,
      skillId: 525,
      ratio: 100
    },
    {
      level: 1,
      skillId: 524,
      ratio: 100
    },
    {
      level: 1,
      skillId: 568,
      ratio: 100
    },
    {
      level: 1,
      skillId: 567,
      ratio: 120
    },
    {
      level: 1,
      skillId: 579,
      ratio: 100
    },
    {
      level: 1,
      skillId: 771,
      ratio: 100
    },
    {
      level: 1,
      skillId: 724,
      ratio: 100
    },
    {
      level: 1,
      skillId: 726,
      ratio: 100
    },
    {
      level: 1,
      skillId: 722,
      ratio: 100
    },
    {
      level: 1,
      skillId: 710,
      ratio: 100
    }
  ]
},
  id: 'char_106',
  name: "艾琳",
  role: "皇女侍卫 / S级冒险者",
  description: "皇女欧若拉的贴身侍卫，高傲的贵族骑士，被称为「战场冰姬」。对皇女赖在乡下感到苦恼。拥有卓越的战斗技术，不擅长处理感情，对萌生的情感容易感到困惑。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
