
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_109';

export const char_109: Character = {
  battleData: {
  maxLevel: 99,
  className: "粉碎者",
  optimizeType: "attack",
  canFight: true,
  statMultipliers: {
    hp: 100,
    mp: 1,
    atk: 200,
    def: 100,
    matk: 1,
    mdef: 20,
    agi: 80,
    luk: 100
  },
  skills: [
    {
      level: 1,
      skillId: 772,
      ratio: 100
    },
    {
      level: 1,
      skillId: 751,
      ratio: 100
    },
    {
      level: 1,
      skillId: 781,
      ratio: 100
    },
    {
      level: 1,
      skillId: 525,
      ratio: 120
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
      ratio: 100
    },
    {
      level: 1,
      skillId: 724,
      ratio: 100
    },
    {
      level: 1,
      skillId: 579,
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
  id: 'char_109',
  name: "莱拉",
  role: "猫族狂战士 / E级冒险者",
  description: "流浪的猫族部落战士，性格像小猫一样呆萌坦率。被主角捡回旅店，把主角和莉莉娅视为家人。战斗中会化身狂战士，平时则是个缺乏常识的吃货。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
