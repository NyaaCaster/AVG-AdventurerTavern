
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_104';

export const char_104: Character = {
  battleData: {
  maxLevel: 99,
  className: "枪手",
  optimizeType: "attack",
  canFight: true,
  statMultipliers: {
    hp: 100,
    mp: 50,
    atk: 100,
    def: 100,
    matk: 80,
    mdef: 80,
    agi: 120,
    luk: 120
  },
  skills: [
    {
      level: 1,
      skillId: 771,
      ratio: 100
    },
    {
      level: 1,
      skillId: 791,
      ratio: 100
    },
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
      skillId: 537,
      ratio: 100
    },
    {
      level: 1,
      skillId: 529,
      ratio: 100
    },
    {
      level: 1,
      skillId: 526,
      ratio: 100
    },
    {
      level: 1,
      skillId: 521,
      ratio: 120
    },
    {
      level: 1,
      skillId: 781,
      ratio: 100
    },
    {
      level: 1,
      skillId: 801,
      ratio: 100
    },
    {
      level: 10,
      skillId: 532,
      ratio: 100
    },
    {
      level: 10,
      skillId: 535,
      ratio: 100
    },
    {
      level: 10,
      skillId: 538,
      ratio: 100
    },
    {
      level: 10,
      skillId: 541,
      ratio: 100
    },
    {
      level: 20,
      skillId: 533,
      ratio: 100
    },
    {
      level: 20,
      skillId: 536,
      ratio: 100
    },
    {
      level: 20,
      skillId: 539,
      ratio: 100
    }
  ]
},
  id: 'char_104',
  name: "朱迪斯",
  role: "暴力修女 / B级冒险者",
  description: "性格火爆的修女，精通火器枪械，喜欢以猛烈射击清扫敌人。酗酒嗜赌，言行粗暴，穿着被自行改造得非常暴露的修女服。虽然品行不端，但精通神圣系魔法。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
