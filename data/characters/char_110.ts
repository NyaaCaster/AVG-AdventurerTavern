
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_110';

export const char_110: Character = {
  battleData: {
  maxLevel: 99,
  className: "猎人",
  optimizeType: "attack",
  canFight: true,
  statMultipliers: {
    hp: 70,
    mp: 5,
    atk: 120,
    def: 70,
    matk: 10,
    mdef: 30,
    agi: 120,
    luk: 200
  },
  skills: [
    {
      level: 1,
      skillId: 512,
      ratio: 100
    },
    {
      level: 1,
      skillId: 529,
      ratio: 100
    },
    {
      level: 1,
      skillId: 575,
      ratio: 100
    },
    {
      level: 1,
      skillId: 581,
      ratio: 100
    },
    {
      level: 1,
      skillId: 587,
      ratio: 100
    },
    {
      level: 1,
      skillId: 576,
      ratio: 100
    },
    {
      level: 1,
      skillId: 514,
      ratio: 120
    },
    {
      level: 1,
      skillId: 526,
      ratio: 100
    },
    {
      level: 1,
      skillId: 583,
      ratio: 100
    },
    {
      level: 1,
      skillId: 771,
      ratio: 100
    },
    {
      level: 1,
      skillId: 781,
      ratio: 100
    },
    {
      level: 1,
      skillId: 751,
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
      skillId: 710,
      ratio: 100
    }
  ],
  equipableTags: ['bow', 'L-Arm'] // 弓、轻甲
},
  id: 'char_110',
  name: "琉卡",
  role: "亚马逊猎人 / C级冒险者",
  description: "亚马逊族猎人，箭术超群。性格我行我素，有时有些迷糊。为了寻找合适的伴侣而踏上旅程，似乎已经将主角锁定为目标。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
