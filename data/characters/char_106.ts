import { Character } from '../../types';
import { PERSONA, DIALOGUE } from '../prompts/char_106';

export const char_106: Character = {
  id: 'char_106',
  name: "鑹剧惓",
  role: "鐨囧コ渚嶅崼 / S绾у啋闄╄€?,
  description: "鐨囧コ娆ц嫢鎷夌殑璐磋韩渚嶅崼锛岄珮鍌茬殑璐垫棌楠戝＋锛岃绉颁负銆屾垬鍦哄啺濮€嶃€傚鐨囧コ璧栧湪涔′笅鎰熷埌鑻︽伡銆傛嫢鏈夊崜瓒婄殑鎴樻枟鎶€鏈紝涓嶆搮闀垮鐞嗘劅鎯咃紝瀵硅悓鐢熺殑鎯呮劅瀹规槗鎰熷埌鍥版儜銆?,
  persona: PERSONA,
  dialogueExamples: DIALOGUE,
  appearanceConditions: [
    { sceneId: 'scen_5', minLevel: 3 }
  ]
};

