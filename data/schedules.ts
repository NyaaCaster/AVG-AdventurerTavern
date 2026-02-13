
import { CharacterSchedule } from '../types';

export const CHARACTER_SCHEDULES: Record<string, CharacterSchedule> = {
  'char_101': { // 莉莉娅
    day: ['scen_1'],
    evening: ['scen_3'],
    night: ['scen_7', 'scen_8', 'scen_2']
  },
  'char_102': { // 米娜
    day: ['scen_3', 'scen_7', 'scen_8', 'scen_2'],
    evening: ['scen_3'],
    night: ['scen_3']
  },
  'char_103': { // 欧若拉
    day: ['scen_2', 'scen_4', 'scen_5','scen_6'],
    evening: ['scen_2','scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    night: ['scen_2']
  },
  'char_104': { // 朱迪斯
    day: ['scen_2','scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    evening: ['scen_3', 'scen_7', 'scen_8'],
    night: ['scen_3', 'scen_2']
  },
  'char_105': { // 莲华
    day: ['scen_4'],
    evening: ['scen_2','scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    night: ['scen_4', 'scen_7', 'scen_2']
  },
  'char_106': { // 艾琳
    day: ['scen_2','scen_4', 'scen_5','scen_6'],
    evening: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    night: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8']
  },
  'char_107': { // 菲洛
    day: ['scen_2','scen_4', 'scen_5','scen_6'],
    evening: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    night: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8']
  },
  'char_108': { // 卡特琳娜
    day: ['scen_4', 'scen_5', 'scen_6'],
    evening: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    night: ['scen_3', 'scen_7', 'scen_8', 'scen_2']
  },
  'char_109': { // 莱拉
    day: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    evening: ['scen_2','scen_3', 'scen_4', ],
    night: ['scen_2','scen_3', 'scen_4', ]
  },
  'char_110': { // 琉卡
    day: ['scen_2','scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    evening: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8'],
    night: ['scen_2','scen_3', 'scen_4', 'scen_5','scen_6','scen_7','scen_8']
  },
  'char_111': { // 吉娜
    day: ['scen_2','scen_7','scen_8'],
    evening: ['scen_3'],
    night: ['scen_2','scen_3', 'scen_7','scen_8']
  }
};
