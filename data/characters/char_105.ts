import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_105';

export const char_105: Character = {
  id: 'char_105',
  name: "鑾插崕",
  role: "鎷虫湳淇鑰?/ A绾у啋闄╄€?,
  description: "鑷垜鑲畾鎰熸瀬浣庣殑鎷虫湳淇鑰咃紝铏界劧鎷ユ湁A绾у啋闄╄€呯殑寮哄ぇ瀹炲姏锛屼絾鎬昏涓鸿嚜宸卞緢寮卞皬銆備笉鍠勬矡閫氾紝閫冮伩涓庝汉鎺ヨЕ锛屼絾涓€鏃︽暈寮€蹇冩墘灏变細娣卞害渚濊禆銆?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_4', minLevel: 2 },
    { sceneId: 'scen_2', minLevel: 2 }
  ]
};

