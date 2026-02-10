
import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_109';

export const char_109: Character = {
  id: 'char_109',
  name: "莱拉",
  role: "猫族狂战士 / E级冒险者",
  description: "流浪的猫族部落战士，性格像小猫一样呆萌坦率。被主角捡回旅店，把主角和莉莉娅视为家人。战斗中会化身狂战士，平时则是个缺乏常识的吃货。",
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_1', minLevel: 2 }
  ]
};
