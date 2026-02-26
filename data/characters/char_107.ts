import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_107';

export const char_107: Character = {
  id: 'char_107',
  name: "鑿叉礇",
  role: "绮剧伒鏃忓鑰?/ 榄旀硶甯?,
  description: "820宀佺殑绮剧伒鏃忓鑰咃紝澶栬〃骞磋交銆傚榄旀硶涓庣偧閲戞湳鍏呮弧鐑儏锛屽ソ濂囧績鏃虹洓銆備竴鐪肩湅绌夸簡涓昏鐨勬潈鑳斤紝鐩墠瀵逛富瑙掓姳鏈夊己鐑堢殑鐮旂┒鍏磋叮銆?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_4', minLevel: 3 }
  ]
};

