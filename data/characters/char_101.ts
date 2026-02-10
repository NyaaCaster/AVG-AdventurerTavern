
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_101';

export const char_101: Character = {
  id: 'char_101',
  name: "莉莉娅",
  role: "冒险者旅店老板娘",
  description: "冒险者旅店的老板娘，主角的亲生姐姐。活泼好动又爱管闲事，经常被周围人所依赖。主要负责旅店运营，深受住宿客人欢迎。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  schedule: {
    day: ['scen_1'],
    evening: ['scen_1', 'scen_3'],
    night: ['scen_7', 'scen_8', 'scen_2']
  }
};
