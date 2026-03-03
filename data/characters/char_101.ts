
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_101';

export const char_101: Character = {
  battleData: {
  maxLevel: 99,
  className: "经营辅助",
  optimizeType: "normal",
  canFight: false,
  statMultipliers: {
    hp: 60,
    mp: 5,
    atk: 50,
    def: 50,
    matk: 50,
    mdef: 50,
    agi: 100,
    luk: 100
  },
  skills: [
    {
      level: 1,
      skillId: 751,
      ratio: 100
    },
    {
      level: 1,
      skillId: 752,
      ratio: 100
    },
    {
      level: 1,
      skillId: 771,
      ratio: 100
    },
    {
      level: 1,
      skillId: 772,
      ratio: 100
    },
    {
      level: 1,
      skillId: 781,
      ratio: 100
    },
    {
      level: 1,
      skillId: 782,
      ratio: 100
    },
    {
      level: 1,
      skillId: 791,
      ratio: 100
    },
    {
      level: 1,
      skillId: 792,
      ratio: 100
    },
    {
      level: 1,
      skillId: 801,
      ratio: 100
    },
    {
      level: 1,
      skillId: 802,
      ratio: 100
    }
  ]
},
  id: 'char_101',
  name: "莉莉娅",
  role: "冒险者旅店老板娘",
  description: "冒险者旅店的老板娘，主角的姐姐。活泼好动又爱管闲事，经常被周围人所依赖。主要负责旅店运营，深受住宿客人欢迎。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE
};
