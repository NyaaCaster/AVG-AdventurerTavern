
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_105';

export const char_105: Character = {
  battleData: {
  maxLevel: 99,
  className: "武术家",
  optimizeType: "attack",
  canFight: true,
  statMultipliers: {
    hp: 100,
    mp: 15,
    atk: 120,
    def: 80,
    matk: 50,
    mdef: 50,
    agi: 150,
    luk: 150
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
      skillId: 511,
      ratio: 100
    },
    {
      level: 1,
      skillId: 521,
      ratio: 100
    },
    {
      level: 1,
      skillId: 527,
      ratio: 100
    },
    {
      level: 1,
      skillId: 568,
      ratio: 100
    },
    {
      level: 1,
      skillId: 528,
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
      ratio: 120
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
    }
  ]
},
  id: 'char_105',
  name: "莲华",
  role: "拳术修行者 / A级冒险者",
  description: "自我肯定感极低的拳术修行者，虽然拥有A级冒险者的强大实力，但总认为自己很弱小。不善沟通，逃避与人接触，但一旦敞开心扉就会深度依赖。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
};
