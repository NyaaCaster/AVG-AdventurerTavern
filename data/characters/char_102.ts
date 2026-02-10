
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_102';

export const char_102: Character = {
  id: 'char_102',
  name: "米娜",
  role: "旅店侍应 / 原魔王",
  description: "原魔王，被推选为背锅代表，在与勇者决战中直接认输，缠着勇者来到人类社会。现伪装成人类在旅店酒场担任侍应。性格敷衍怕麻烦，喜欢喝酒。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  schedule: {
    day: ['scen_3', 'scen_7', 'scen_8', 'scen_2'],
    evening: ['scen_3'],
    night: ['scen_3']
  }
};
