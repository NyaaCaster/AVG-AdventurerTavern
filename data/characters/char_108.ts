
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_108';

export const char_108: Character = {
  battleData: {
  maxLevel: 99,
  className: "守护者",
  optimizeType: "defense",
  canFight: true,
  statMultipliers: {
    hp: 150,
    mp: 10,
    atk: 80,
    def: 150,
    matk: 10,
    mdef: 120,
    agi: 50,
    luk: 70
  },
  skills: [
    {
      level: 1,
      skillId: 771,
      ratio: 100
    },
    {
      level: 1,
      skillId: 782,
      ratio: 120
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
      skillId: 726,
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
      skillId: 518,
      ratio: 100
    },
    {
      level: 1,
      skillId: 527,
      ratio: 100
    },
    {
      level: 1,
      skillId: 528,
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
      ratio: 100
    },
    {
      level: 1,
      skillId: 724,
      ratio: 100
    },
    {
      level: 1,
      skillId: 723,
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
    },
    {
      level: 1,
      skillId: 594,
      ratio: 100
    },
    {
      level: 1,
      skillId: 593,
      ratio: 100
    },
    {
      level: 1,
      skillId: 595,
      ratio: 100
    }
  ],
  equipableTags: ['sword', 'H-Arm'] // 剑、重甲
},
  id: 'char_108',
  name: "卡特琳娜",
  role: "自卫团女战士 / S级冒险者",
  description: "S级冒险者，温柔善良、备受仰慕的大姐姐。多年来一直作为村庄自卫团的守护者。因忙于工作而认为自己错过了谈婚论嫁的年纪，内心渴望恋情。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
