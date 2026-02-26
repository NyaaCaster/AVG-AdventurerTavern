import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_109';

export const char_109: Character = {
  id: 'char_109',
  name: "鑾辨媺",
  role: "鐚棌鐙傛垬澹?/ E绾у啋闄╄€?,
  description: "娴佹氮鐨勭尗鏃忛儴钀芥垬澹紝鎬ф牸鍍忓皬鐚竴鏍峰憜钀屽潶鐜囥€傝涓昏鎹″洖鏃呭簵锛屾妸涓昏鍜岃帀鑾夊▍瑙嗕负瀹朵汉銆傛垬鏂椾腑浼氬寲韬媯鎴樺＋锛屽钩鏃跺垯鏄釜缂轰箯甯歌瘑鐨勫悆璐с€?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_1', minLevel: 2 }
  ]
};

