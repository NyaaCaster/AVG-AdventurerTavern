
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_111';

export const char_111: Character = {
  battleData: {
  maxLevel: 99,
  className: "机械师",
  optimizeType: "normal",
  canFight: true,
  statMultipliers: {
    hp: 90,
    mp: 20,
    atk: 110,
    def: 90,
    matk: 20,
    mdef: 20,
    agi: 140,
    luk: 160
  },
  skills: [
    {
      level: 1,
      skillId: 512,
      ratio: 100
    },
    {
      level: 1,
      skillId: 581,
      ratio: 100
    },
    {
      level: 1,
      skillId: 583,
      ratio: 100
    },
    {
      level: 1,
      skillId: 585,
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
      skillId: 579,
      ratio: 100
    },
    {
      level: 1,
      skillId: 531,
      ratio: 100
    },
    {
      level: 1,
      skillId: 586,
      ratio: 100
    },
    {
      level: 1,
      skillId: 587,
      ratio: 100
    },
    {
      level: 1,
      skillId: 588,
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
      skillId: 710,
      ratio: 100
    },
    {
      level: 10,
      skillId: 532,
      ratio: 100
    }
  ]
},
  id: 'char_111',
  name: "吉娜",
  role: "人族技师 / 工匠",
  description: "大大咧咧的机械工匠，技术高超但生活粗糙。经常被误认为是男性，实则拥有丰满的身材。在旅店旁搭建了工坊，喜欢对同性进行性骚扰。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
