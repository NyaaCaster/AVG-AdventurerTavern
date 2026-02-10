
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_105';

export const char_105: Character = {
  id: 'char_105',
  name: "莲华",
  role: "拳术修行者 / A级冒险者",
  description: "自我肯定感极低的拳术修行者，虽然拥有A级冒险者的强大实力，但总认为自己很弱小。不善沟通，逃避与人接触，但一旦敞开心扉就会深度依赖。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_4', minLevel: 2 },
    { sceneId: 'scen_2', minLevel: 2 }
  ],
  schedule: {
    day: ['scen_4'],
    night: ['scen_4', 'scen_7', 'scen_2']
  }
};
