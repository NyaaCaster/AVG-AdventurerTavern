
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_107';

export const char_107: Character = {
  battleData: {
  maxLevel: 99,
  className: "炼金术士",
  optimizeType: "magic",
  canFight: true,
  statMultipliers: {
    hp: 100,
    mp: 150,
    atk: 50,
    def: 50,
    matk: 120,
    mdef: 120,
    agi: 80,
    luk: 100
  },
  skills: [
    {
      level: 1,
      skillId: 791,
      ratio: 80
    },
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
      skillId: 534,
      ratio: 80
    },
    {
      level: 1,
      skillId: 540,
      ratio: 80
    },
    {
      level: 1,
      skillId: 552,
      ratio: 120
    },
    {
      level: 1,
      skillId: 553,
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
      level: 1,
      skillId: 710,
      ratio: 80
    },
    {
      level: 10,
      skillId: 535,
      ratio: 80
    },
    {
      level: 10,
      skillId: 541,
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
      ratio: 120
    }
  ],
  equipableTags: ['book', 'L-Arm'] // 魔导书、轻甲
},
  id: 'char_107',
  name: "菲洛",
  role: "精灵族学者 / 魔法师",
  description: "820岁的精灵族学者，外表年轻。对魔法与炼金术充满热情，好奇心旺盛。一眼看穿了主角的权能，目前对主角抱有强烈的研究兴趣。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE, 
};
