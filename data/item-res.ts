import { ItemData } from '../types';

export const ITEMS_RES: Record<string, ItemData> = {
  // --- 绱犳潗绫?(res) ---
  'res-0001': { id: 'res-0001', name: '鐏垫湪', category: 'res', tag: 'non', star: '3', maxStack: 999, description: "钑村惈榄斿姏鐨勭绉樻湪鏉愩€傚彲鐢ㄤ簬璁炬柦鎵╁缓銆? },
  'res-0002': { id: 'res-0002', name: '骞荤毊', category: 'res', tag: 'non', star: '3', maxStack: 999, description: "鏌旈煣缁撳疄鐨勯瓟娉曠毊闈┿€傚彲鐢ㄤ簬璁炬柦鎵╁缓銆? },
  'res-0003': { id: 'res-0003', name: '榄旀櫠鐭?, category: 'res', tag: 'non', star: '3', maxStack: 999, description: "閲婃斁涓嶅彲鎬濊鍔涢噺鐨勭熆鐭炽€傚彲鐢ㄤ簬璁炬柦鎵╁缓銆? },
  'res-0101': { id: 'res-0101', name: '鐙傛毚鍏旇倝', category: 'res', tag: 'meat', star: '1', maxStack: 99, description: "榄旂墿`鐙傛毚缁掓瘺鎬猔鐨勮倝銆傚彲浜庣児楗€? },
  'res-0201': { id: 'res-0201', name: '闈掕彍', category: 'res', tag: 'vegetable', star: '1', maxStack: 99, description: "涓栭潰甯歌鐨勮敩鑿溿€傚彲浜庣児楗€? },
  'res-0301': { id: 'res-0301', name: '鍙戝厜鑿屼紴', category: 'res', tag: 'mushroom', star: '1', maxStack: 99, description: "榄旂墿`鍏夊鎬猔鐨勮弻浼炪€傚彲浜庣児楗€? },
  'res-0401': { id: 'res-0401', name: '闈㈢矇', category: 'res', tag: 'flour', star: '1', maxStack: 99, description: "涓栭潰甯歌鐨勯潰绮夈€傚彲浜庣児楗€? },
  'res-0501': { id: 'res-0501', name: '娓￠甫铔?, category: 'res', tag: 'egg', star: '1', maxStack: 99, description: "榄旂墿`姝荤伒娓￠甫`鐨勮泲銆傚彲浜庣児楗€? },
  'res-0601': { id: 'res-0601', name: '鐗涘ザ', category: 'res', tag: 'milk', star: '1', maxStack: 99, description: "涓栭潰甯歌鐨勭墰濂躲€傚彲浜庣児楗€? },
  'res-0701': { id: 'res-0701', name: '鍟ら厭', category: 'res', tag: 'drinks', star: '1', maxStack: 99, description: "涓栭潰甯歌鐨勫暏閰掋€傚彲鍦ㄩ厭鍦洪攢鍞€? },
  'res-0801': { id: 'res-0801', name: '鍙茶幈濮嗗嚌鑳?, category: 'res', tag: 'jelly', star: '1', maxStack: 99, description: "榄旂墿`鍙茶幈濮哷鐨勯粡娑层€傚彲浜庣児楗€? },
  'res-0901': { id: 'res-0901', name: '鏈ㄧ伒鐨勮儭妞?, category: 'res', tag: 'spice', star: '2', maxStack: 99, description: "榄旂墿`濮嗗皵濮嗗皵鐏屾湪`鐨勮儭妞掋€傚彲浜庣児楗€? },
  // 瑙掕壊涓撳睘绱犳潗 (Star 8)
  'res-1011': { id: 'res-1011', name: '鑾夎帀濞呯殑涔宠倝', category: 'res', tag: 'meat', star: '8', maxStack: 99, description: "鍓插彇鑷猔鑾夎帀濞卄涔虫埧鐨勮倝锛屾煍杞粦鑵伙紝濂堕澶氭眮銆傚彲浜庣児楗€? },
  'res-1025': { id: 'res-1025', name: '绫冲鐨勮泲', category: 'res', tag: 'egg', star: '8', maxStack: 99, description: "`绫冲`姣忎釜鏈堢敓涓嬬殑铔嬶紝鏈夎姃鏋滃ぇ灏忥紝娴撻鍥涙孩銆傚彲浜庣児楗€? },
  'res-1032': { id: 'res-1032', name: '娆ц嫢鎷夌殑鑳¤悵鍗?, category: 'res', tag: 'carrot', star: '8', maxStack: 99, description: "琚玚娆ц嫢鎷塦鐢ㄤ綔鑲涘鐨勮儭钀濆崪锛屻€岀殗瀹ら鍛炽€嶃€傚彲浜庣児楗€? },
  'res-1047': { id: 'res-1047', name: '鏈辫开鏂殑銆屽湥姘淬€?, category: 'res', tag: 'drinks', star: '8', maxStack: 99, description: "`鏈辫开鏂痐鐨勫翱娑诧紝閰掔簿鍚噺寰堥珮锛岀浉褰撲簬閰块€犵殑缇庨厭銆傚彲鍦ㄩ厭鍦洪攢鍞€? },
  'res-1055': { id: 'res-1055', name: '鑾插崕鐨勮吙鑲?, category: 'res', tag: 'meat', star: '8', maxStack: 99, description: "鍓插彇鑷猔鑾插崕`澶ц吙鐨勮倢鑲夛紝闊у姴鍗佽冻锛屽彛鎰熷脊婊戙€傚彲浜庣児楗€? },
  'res-1065': { id: 'res-1065', name: '鑹剧惓鐨勫崵铔?, category: 'res', tag: 'egg', star: '8', maxStack: 99, description: "濉厖鍦╜鑹剧惓`闃撮亾鍐呯殑姘寸叜铔嬶紝鑵屽埗寰楀捀棣欏彲鍙ｏ紝鏅惰幑鍓旈€忋€傚彲浜庣児楗€? },
  'res-1079': { id: 'res-1079', name: '鑿叉礇鐨勮湝姹?, category: 'res', tag: 'spice', star: '8', maxStack: 99, description: "`鑿叉礇`鐨勭埍娑诧紝鏈夌潃绁炵鐨勫菇棣欙紝鍙渶灏戣灏辫兘鎻愬崌鑿滃搧鐨勯鍛炽€傚彲浜庣児楗€? },
  'res-1086': { id: 'res-1086', name: '鍗＄壒鐞冲鐨勪钩姹?, category: 'res', tag: 'milk', star: '8', maxStack: 99, description: "姒ㄥ彇鑷猔鍗＄壒鐞冲`鐨勪钩姹侊紝棣欑敎鍙彛锛屽彛鎰熶笣婊戯紝鍔犵儹鍚庝細鏁ｅ彂`鍗＄壒鐞冲`鐨勪綋棣欍€傚彲浜庣児楗€? },
  'res-1095': { id: 'res-1095', name: '鑾辨媺鐨勮吙鑲?, category: 'res', tag: 'meat', star: '8', maxStack: 99, description: "鍓插彇鑷猔鑾辨媺`澶ц吙鐨勮倢鑲夛紝闊у姴鍗佽冻锛屽彛鎰熷脊婊戙€傚彲浜庣児楗€? },
  'res-1108': { id: 'res-1108', name: '鐞夊崱鐨勩€岄奔瀛愰叡銆?, category: 'res', tag: 'jelly', star: '8', maxStack: 99, description: "绉樺瘑鎵嬫硶鍚稿嚭鐨刞鐞夊崱`鐨勫嵉瀛愶紝缁忚惀閫忎寒鐨勭矇鑹诧紝甯︾潃绮樼鐨勫棰堟恫锛岃壊娉藉彛鎰熼兘璁╀汉娆茬舰涓嶈兘銆傚彲浜庣児楗€? },
  'res-1113': { id: 'res-1113', name: '鍚夊鐢ㄨ繃鐨勮槕鑿?, category: 'res', tag: 'mushroom', star: '8', maxStack: 99, description: "琚玚鍚夊`褰撲綔鑷叞鍣ㄦ鐨勮弻鏉嗭紝楗卞惈`鍚夊`鐨勭埍娑诧紝鍙ｆ劅鐙壒銆傚彲浜庣児楗€? },
};

