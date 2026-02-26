import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_108';

export const char_108: Character = {
  id: 'char_108',
  name: "鍗＄壒鐞冲",
  role: "鑷崼鍥㈠コ鎴樺＋ / S绾у啋闄╄€?,
  description: "S绾у啋闄╄€咃紝娓╂煍鍠勮壇銆佸鍙椾话鎱曠殑澶у濮愩€傚骞存潵涓€鐩翠綔涓烘潙搴勮嚜鍗洟鐨勫畧鎶よ€呫€傚洜蹇欎簬宸ヤ綔鑰岃涓鸿嚜宸遍敊杩囦簡璋堝璁哄珌鐨勫勾绾紝鍐呭績娓存湜鎭嬫儏銆?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_4', minLevel: 2 },
    { sceneId: 'scen_2', minLevel: 3 }
  ]
};

