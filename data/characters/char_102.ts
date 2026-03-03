
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_102';

export const char_102: Character = {
  battleData: {
  maxLevel: 99,
  className: "服务员",
  optimizeType: "normal",
  canFight: false,
  statMultipliers: {
    hp: 200,
    mp: 200,
    atk: 150,
    def: 150,
    matk: 150,
    mdef: 150,
    agi: 140,
    luk: 60
  },
  skills: [
    {
      level: 1,
      skillId: 531,
      ratio: 100
    },
    {
      level: 1,
      skillId: 534,
      ratio: 100
    },
    {
      level: 1,
      skillId: 540,
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
    }
  ]
},
  id: 'char_102',
  name: "米娜",
  role: "旅店侍应 / 原魔王",
  description: "原魔王，被推选为背锅代表，在与勇者决战中直接认输，缠着勇者来到人类社会。现伪装成人类在旅店酒场担任侍应。性格敷衍怕麻烦，喜欢喝酒。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE
};
