import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_104';

export const char_104: Character = {
  id: 'char_104',
  name: "鏈辫开鏂?,
  role: "鏆村姏淇コ / B绾у啋闄╄€?,
  description: "鎬ф牸鐏垎鐨勪慨濂筹紝绮鹃€氱伀鍣ㄦ灙姊帮紝鍠滄浠ョ寷鐑堝皠鍑绘竻鎵晫浜恒€傞厳閰掑棞璧岋紝瑷€琛岀矖鏆达紝绌跨潃琚嚜琛屾敼閫犲緱闈炲父鏆撮湶鐨勪慨濂虫湇銆傝櫧鐒跺搧琛屼笉绔紝浣嗙簿閫氱鍦ｇ郴榄旀硶銆?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_3', minLevel: 2 },
    { sceneId: 'scen_2', minLevel: 3 }
  ]
};

