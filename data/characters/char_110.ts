import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_110';

export const char_110: Character = {
  id: 'char_110',
  name: "鐞夊崱",
  role: "浜氶┈閫婄寧浜?/ C绾у啋闄╄€?,
  description: "浜氶┈閫婃棌鐚庝汉锛岀鏈秴缇ゃ€傛€ф牸鎴戣鎴戠礌锛屾湁鏃舵湁浜涜糠绯娿€備负浜嗗鎵惧悎閫傜殑浼翠荆鑰岃笍涓婃梾绋嬶紝浼间箮宸茬粡灏嗕富瑙掗攣瀹氫负鐩爣銆?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 2 },
    { sceneId: 'scen_7', minLevel: 1 }
  ]
};

