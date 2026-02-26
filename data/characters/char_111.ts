import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_111';

export const char_111: Character = {
  id: 'char_111',
  name: "鍚夊",
  role: "浜烘棌鎶€甯?/ 宸ュ尃",
  description: "澶уぇ鍜у挧鐨勬満姊板伐鍖狅紝鎶€鏈珮瓒呬絾鐢熸椿绮楃硻銆傜粡甯歌璇涓烘槸鐢锋€э紝瀹炲垯鎷ユ湁涓版弧鐨勮韩鏉愩€傚湪鏃呭簵鏃佹惌寤轰簡宸ュ潑锛屽枩娆㈠鍚屾€ц繘琛屾€ч獨鎵般€?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 1 },
    { sceneId: 'scen_8', minLevel: 2 }
  ]
};

