import { ItemData } from '../types';

export const ITEMS_EQUIP: Record<string, ItemData> = {
  // --- 姝﹀櫒绫?(wpn) ---
  // 鍓?  'wpn-101': { id: 'wpn-101', name: '鏈ㄥ墤', category: 'wpn', tag: 'sword', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "璁粌鐢ㄧ殑姝﹀櫒锛屾湰璐ㄦ槸鍙戞尌浣跨敤鐫€鑷韩鐨勫姏閲忋€? },
  'wpn-102': { id: 'wpn-102', name: '閾佸墤', category: 'wpn', tag: 'sword', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "姝ｅ父浜洪兘鏄敤杩欎釜銆? },
  'wpn-103': { id: 'wpn-103', name: '閽㈠墤', category: 'wpn', tag: 'sword', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "寰堟矇锛屾病鏈変竴瀹氱殑璁粌鎸ヨ垶涓嶈捣鏉ャ€? },
  'wpn-104': { id: 'wpn-104', name: '绉橀摱鍓?, category: 'wpn', tag: 'sword', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "澶у笀绮惧搧锛岃交鐩堣€岄攱鍒╋紝灏辨槸浠锋牸鏄傝吹鈥︹€? },
  'wpn-105': { id: 'wpn-105', name: '绮鹃噾鍓?, category: 'wpn', tag: 'sword', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "绋€鏈夌殑鐝嶅搧锛屽厜鏄潗鏂欏氨璁╀汉鍨傚欢涓夊昂銆? },
  'wpn-106': { id: 'wpn-106', name: '姘存櫠鍓?, category: 'wpn', tag: 'sword', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "瀵勫鐫€涓栫晫榄斿姏鐨勫疂鍓戯紝濡傚悓鍦ㄤ娇鐢ㄩ瓟娉曟湰韬繘琛屾尌鐮嶃€? },
  // 榄斿涔?  'wpn-201': { id: 'wpn-201', name: '銆婂疄鐢ㄩ瓟娉曞ぇ鍏ㄣ€?, category: 'wpn', tag: 'book', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "姘戜織鐮旂┒绀惧嚭鐗堬紝鏀跺綍浜嗗叕璁ゆ湁鐢ㄧ殑姘戦棿鏅烘収銆? },
  'wpn-202': { id: 'wpn-202', name: '銆婂闄㈢簿淇櫨绉戙€?, category: 'wpn', tag: 'book', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "鍥界珛榄旀硶瀛﹂櫌鐨勭櫨骞翠紶鎵跨簿鍝侊紝璧板悜澶у笀宸呭嘲鐨勯樁姊€? },
  'wpn-203': { id: 'wpn-203', name: '銆婃槦鐣岀娉曘€?, category: 'wpn', tag: 'book', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "杩欐槸涓€鏈▉鍔涘法澶х殑绉樻硶鈥︹€︿絾浼间箮涓嶆槸浜虹被鐨勮瑷€鎾板啓鐨勨€︹€? },
  'wpn-204': { id: 'wpn-204', name: '銆婅绁炵殑浣庤銆?, category: 'wpn', tag: 'book', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "璁板綍浜嗕紬绁炴垬浜夋椂璇哥鏇剧粡鍜忓敱杩囩殑榄旀硶銆? },
  'wpn-205': { id: 'wpn-205', name: '銆婄涔β峰垱閫犱笌姣佺伃銆?, category: 'wpn', tag: 'book', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "榄旀硶瀛﹂櫌鏈€楂樼瓑绾х蹇屼箣涓€锛岃繖涓嶆槸浜虹被搴旇鎺屾彙鐨勭煡璇嗐€? },
  'wpn-206': { id: 'wpn-206', name: '銆婂叏鐭ュ叏鑳界殑缁堟瀬銆?, category: 'wpn', tag: 'book', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "涓€鍗充娇鍏紝鍏ㄥ嵆鏄竴" },
  // 鏋
  'wpn-301': { id: 'wpn-301', name: '銆屼笁宀佸噯鐢ㄣ€?, category: 'wpn', tag: 'gun', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "鈥滄湭婊′笁宀佺殑鍎跨璇峰湪瀹堕暱鐪嬫姢涓嬬帺鑰嶁€? },
  'wpn-302': { id: 'wpn-302', name: '銆屽鏃ラ噸鐜般€?, category: 'wpn', tag: 'gun', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "鈥滃鏃ョキ闄愬畾娑傝锛佹崲涓婄儹姘翠篃鏄湁鐐规敾鍑诲姏鐨勶紒锛佲€? },
  'wpn-303': { id: 'wpn-303', name: '銆岃繃鐑啿鍑汇€?, category: 'wpn', tag: 'gun', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "鈥滃皢鏋啗杩囩儹杞寲鎴愬啿鍑诲姏鐨勬瀬闄愭敼閫狅紒鈥? },
  'wpn-304': { id: 'wpn-304', name: '銆屽叏閲戝睘鐙傛疆銆?, category: 'wpn', tag: 'gun', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "鈥滃悏濞滃伐浣滃鍏ㄦ柊鍑哄搧锛侊紒锛佲€? },
  'wpn-305': { id: 'wpn-305', name: '銆屾祦鏄熴€?, category: 'wpn', tag: 'gun', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "鈥滈偅涓嶆槸鎴戠殑瀛愬脊锛岄偅鏄鎴戞墦涓嬫潵鐨勬槦鏄燂紙鍙夎叞锛夆€? },
  'wpn-306': { id: 'wpn-306', name: '銆屾敼鍐欑幇璞＄殑涓€鍑汇€?, category: 'wpn', tag: 'gun', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "鈥滃搸鍝熸垜鎿嶏紒鐪嬫棩钀界殑灏忓北娌′簡~鈥? },
  // 鎷冲
  'wpn-401': { id: 'wpn-401', name: '缁戝甫', category: 'wpn', tag: 'glove', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "缁戜綇鑷繁鐨勫弻鎵嬬殑锛屾槸淇″康" },
  'wpn-402': { id: 'wpn-402', name: '鎶ゆ墜', category: 'wpn', tag: 'glove', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "杩欐槸鐢ㄦ潵鎶戝埗鑷繁娉涙互鐨勫姏閲忕殑" },
  'wpn-403': { id: 'wpn-403', name: '鎷冲嚮鎵嬪', category: 'wpn', tag: 'glove', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "杩欎笉鏄湪淇濇姢鑷繁锛岃€屾槸鍦ㄤ繚鎶ゅ鎵? },
  'wpn-404': { id: 'wpn-404', name: '榫欑墮鎷冲', category: 'wpn', tag: 'glove', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "灏嗗弻鎷冲交搴曞寲涓哄嚩娈嬬殑鎭堕緳涔嬪彛" },
  'wpn-405': { id: 'wpn-405', name: '銆庤嚜鍦ㄦ瀬鎰忋€?, category: 'wpn', tag: 'glove', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "鎮燂紝灏辨槸绌? },
  'wpn-406': { id: 'wpn-406', name: '銆?銆?, category: 'wpn', tag: 'glove', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "鈥︹€︹€︹€︹€︹€? },
  // 闀跨煕
  'wpn-501': { id: 'wpn-501', name: '鏅捐。鏉?, category: 'wpn', tag: 'lance', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "鏈€澶х殑浼樼偣鏄殢鎵嬪彲寰楋紒" },
  'wpn-502': { id: 'wpn-502', name: '閾佺煕', category: 'wpn', tag: 'lance', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "姝ｅ父浜虹被鐨勬鍣紝杩炲摜甯冩灄閮戒細鐢? },
  'wpn-503': { id: 'wpn-503', name: '鍐涚敤闀挎灙', category: 'wpn', tag: 'lance', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "鏍囧噯鍒跺紡鐨勫啗闃熸鍣紝涓婁綅鍐涘畼鐨勪細鏇村崕涓戒竴浜? },
  'wpn-504': { id: 'wpn-504', name: '濂虫绁炰箣鏋?, category: 'wpn', tag: 'lance', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "璞″緛鐫€濂虫€ф鑰呮渶楂樻磥涓庣妧鍒╃殑閾舵灙" },
  'wpn-505': { id: 'wpn-505', name: '涓栫晫鏍戠殑鏈ㄦ灊', category: 'wpn', tag: 'lance', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "鍥炲綊鍒濆績锛屼笘鐣屼笂鏈€鍧氱‖鐨勨€︹€︽櫨琛ｆ潌" },
  'wpn-506': { id: 'wpn-506', name: '銆岀櫧铏广€?, category: 'wpn', tag: 'lance', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "鏈変汉璇达紝閭ｄ竴鍒癸紝闃冲厜琚柀鏂簡鈥︹€? },
  // 鏂?  'wpn-601': { id: 'wpn-601', name: '鎵嬫枾', category: 'wpn', tag: 'axe', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "涓嶇鏄妶鏌磋繕鏄閬撶悊锛岄兘闈炲父濂界敤" },
  'wpn-602': { id: 'wpn-602', name: '鎴樻枾', category: 'wpn', tag: 'axe', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "榛戦搧閾搁€犵殑绮楃硻鍙屽垉鏂э紝鎴樺満涓婁笉闇€瑕佹棤鐢ㄧ殑鍗庝附" },
  'wpn-603': { id: 'wpn-603', name: '铔箣鏂?, category: 'wpn', tag: 'axe', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "宸ㄥぇ鐨勫弻鍒冩枾锛岃儗鍦ㄨ儗涓婇兘鑳芥帺鐩栬韩褰? },
  'wpn-604': { id: 'wpn-604', name: '鐙備箣鏂?, category: 'wpn', tag: 'axe', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "杩欎笉鏄汉绫昏兘鎸ュ姩鐨勪笢瑗匡紝鎸ヨ垶瀹冪殑浜哄凡缁忓寲韬绁? },
  'wpn-605': { id: 'wpn-605', name: '銆屽櫖榫欒€呫€?, category: 'wpn', tag: 'axe', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "鈥滈緳鈻堚枅鈻堝ソ鈻堝悆鈻堚枅鍚椻枅鈻堝柕鈻堚枅鈻堬紵鈥? },
  'wpn-606': { id: 'wpn-606', name: '銆屽垱涓栬€呫€?, category: 'wpn', tag: 'axe', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "鈥滃搱锛侊紒锛佲€? },
  // 寮?  'wpn-701': { id: 'wpn-701', name: '缁冧範寮?, category: 'wpn', tag: 'bow', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "璁粌鐢ㄧ殑姝﹀櫒锛屾湰璐ㄦ槸鍙戞尌浣跨敤鐫€鑷韩鐨勫姏閲忊€︹€︿絾濡傛灉涓嶇敤绠煝涔熻兘閫犳垚浼ゅ鐨勮瘽鈥︹€? },
  'wpn-702': { id: 'wpn-702', name: '鐚庡紦', category: 'wpn', tag: 'bow', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "浜氶┈閫婂コ鐚庝汉鐨勭浜屾敮骞昏偄" },
  'wpn-703': { id: 'wpn-703', name: '蹇呬腑涔嬪紦', category: 'wpn', tag: 'bow', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "鈥滀腑锛佲€? },
  'wpn-704': { id: 'wpn-704', name: '銆岄緳寮︺€?, category: 'wpn', tag: 'bow', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "鑳藉皢榫欑瓔浣滀负寮撳鸡骞惰兘鎷夊紑鐨勪汉锛屽繀鐒舵嫢鏈夊尮鏁屽法榫欎綋鑳界殑鍔涢噺" },
  'wpn-705': { id: 'wpn-705', name: '銆岀柧椋庣偣鐮淬€?, category: 'wpn', tag: 'bow', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "杩欐槸鎵浆鍥犳灉鐨勪竴绠紝绠殑杞ㄨ抗锛屽彧鏄负浜嗗皢蹇呬腑杩欎釜缁撴灉琛ュ叏鍦ㄤ笘鐣岀殑鐜拌薄涓€? },
  'wpn-706': { id: 'wpn-706', name: '銆屽惉闆ㄣ€?, category: 'wpn', tag: 'bow', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "浣犫€︹€﹁兘韬插紑闆ㄦ淮鍚楋紵鍚紝閭ｅ氨鏄洦銆? },

  // --- 闃插叿绫?(arm) ---
  // 杞荤敳
  'arm-101': { id: 'arm-101', name: '闀胯Lv1', category: 'arm', tag: 'L-Arm', quality: 'E', stats: { DEF: 0, AGI: 1, INT: 10 }, maxStack: 9, description: "姣旇捣闃插尽鍔涳紝鏇撮噸瑕佺殑鏄椂灏氾紒" },
  'arm-102': { id: 'arm-102', name: '闀胯Lv2', category: 'arm', tag: 'L-Arm', quality: 'D', stats: { DEF: 0, AGI: 2, INT: 20 }, maxStack: 9, description: "鍦ㄥ懠鍚告椂灏辫兘浜х敓榄斿姏鐨勭氦缁? },
  'arm-103': { id: 'arm-103', name: '闀胯Lv3', category: 'arm', tag: 'L-Arm', quality: 'C', stats: { DEF: 0, AGI: 3, INT: 40 }, maxStack: 9, description: "杩欎笉鏄槻鍏凤紝鏄瓟娉曞笀鐨勬瑁咃紒" },
  'arm-104': { id: 'arm-104', name: '闀胯Lv4', category: 'arm', tag: 'L-Arm', quality: 'B', stats: { DEF: 0, AGI: 4, INT: 80 }, maxStack: 9, description: "榄旀硶浣胯€呯О鍏朵负銆岀ぜ瑁呫€? },
  'arm-105': { id: 'arm-105', name: '闀胯Lv5', category: 'arm', tag: 'L-Arm', quality: 'A', stats: { DEF: 0, AGI: 5, INT: 160 }, maxStack: 9, description: "鑳藉皢鍚告敹澶ф皵涓瓟鍔涚殑缁囩墿" },
  'arm-106': { id: 'arm-106', name: '闀胯Lv6', category: 'arm', tag: 'L-Arm', quality: 'S', stats: { DEF: 0, AGI: 6, INT: 320 }, maxStack: 9, description: "灏嗛瓟鍔涜繖涓蹇垫湰韬鐩栧湪鐨偆涓婄殑鐜拌薄" },
  // 涓敳
  'arm-201': { id: 'arm-201', name: '鐨敳Lv1', category: 'arm', tag: 'M-Arm', quality: 'E', stats: { DEF: 5, AGI: 5 }, maxStack: 9, description: "杩欎釜瑁呭鍏跺疄鍙槸涓轰簡鐢ㄦ潵閬緸鐨? },
  'arm-202': { id: 'arm-202', name: '鐨敳Lv2', category: 'arm', tag: 'M-Arm', quality: 'D', stats: { DEF: 10, AGI: 10 }, maxStack: 9, description: "绌夸簡杩欎釜锛岃鐨勫氨涓嶆槸闃插尽鍔涳紝鑰屾槸鐏靛阀锛? },
  'arm-203': { id: 'arm-203', name: '鐨敳Lv3', category: 'arm', tag: 'M-Arm', quality: 'C', stats: { DEF: 15, AGI: 15 }, maxStack: 9, description: "娲诲姩鑷锛岃韩鏉愪篃灞曠幇鑷" },
  'arm-204': { id: 'arm-204', name: '鐨敳Lv4', category: 'arm', tag: 'M-Arm', quality: 'B', stats: { DEF: 20, AGI: 20 }, maxStack: 9, description: "鍋ユ濡傞锛屽湪鎴樻枟涓棽搴俊姝? },
  'arm-205': { id: 'arm-205', name: '鐨敳Lv5', category: 'arm', tag: 'M-Arm', quality: 'A', stats: { DEF: 25, AGI: 25 }, maxStack: 9, description: "鐪熺殑椋炶捣鏉ヤ簡鈥︹€? },
  'arm-206': { id: 'arm-206', name: '鐨敳Lv6', category: 'arm', tag: 'M-Arm', quality: 'S', stats: { DEF: 30, AGI: 30 }, maxStack: 9, description: "鍏跺疄閭ｇ偣闃插尽宸茬粡娌″繀瑕佷簡锛屽彧鏄负浜嗗湪杩呮嵎鐨勬垬鏂椾腑鎵剧偣閬緸鐢ㄧ殑涓滆タ" },
  // 閲嶇敳
  'arm-301': { id: 'arm-301', name: '閾犵敳Lv1', category: 'arm', tag: 'H-Arm', quality: 'E', stats: { DEF: 20, AGI: -5 }, maxStack: 9, description: "鈥滃緢缁撳疄锛屼笉杩囧ソ鍍忔湁鐐规矇鈥? },
  'arm-302': { id: 'arm-302', name: '閾犵敳Lv2', category: 'arm', tag: 'H-Arm', quality: 'D', stats: { DEF: 40, AGI: -10 }, maxStack: 9, description: "鈥滃摜甯冩灄鎵撲笂鏉ヨ窡鎸犵棐涓€鏍凤紝浣嗚剼鏈夌偣涓嶅惉浣垮敜鈥? },
  'arm-303': { id: 'arm-303', name: '閾犵敳Lv3', category: 'arm', tag: 'H-Arm', quality: 'C', stats: { DEF: 80, AGI: -15 }, maxStack: 9, description: "鈥滈瓟鐙煎凡缁忚涓嶇┛鎴戠殑閾犵敳浜嗏€︹€︿絾鎴戜篃杩戒笉涓婁粬浠€? },
  'arm-304': { id: 'arm-304', name: '閾犵敳Lv4', category: 'arm', tag: 'H-Arm', quality: 'B', stats: { DEF: 160, AGI: -20 }, maxStack: 9, description: "鈥滄挒涓婂幓濂藉儚浜х敓鐨勪激瀹虫洿澶т竴鐐光€︹€﹀鏋滆兘鍐插緱鍔ㄧ殑璇濃€︹€︹€? },
  'arm-305': { id: 'arm-305', name: '閾犵敳Lv5', category: 'arm', tag: 'H-Arm', quality: 'A', stats: { DEF: 320, AGI: -25 }, maxStack: 9, description: "鈥滄垜瑙夊緱鑷繁鑳介《浣忛緳鐨勫悙鎭紒鈥? },
  'arm-306': { id: 'arm-306', name: '閾犵敳Lv6', category: 'arm', tag: 'H-Arm', quality: 'S', stats: { DEF: 640, AGI: -30 }, maxStack: 9, description: "銆屼笉鍔ㄥ灞便€? },

  // --- 楗板搧绫?(acs) ---
  'acs-001': { id: 'acs-001', name: '绮剧伒鑰冲潬', category: 'acs', quality: 'D', stats: { INT: 10 }, maxStack: 9, description: "绌垮湪鑰虫湹涓婏紝鍙互鎻愰珮鏅哄姏鈥︹€︾┛鍦ㄥ埆鐨勯儴浣嶄笂涔熶竴鏍枫€? },
  'acs-002': { id: 'acs-002', name: '绾㈠疂鐭虫垝鎸?, category: 'acs', quality: 'C', maxStack: 9, description: "鍐呴儴鍒绘湁鈥渰{user}}鐨勬儏浜鸿妭绀肩墿鈥? },
  'acs-003': { id: 'acs-003', name: '閾傞噾鑲涘', category: 'acs', quality: 'A', maxStack: 9, description: "锛燂紵锛? }
};

