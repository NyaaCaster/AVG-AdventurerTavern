mport { SceneId, ManagementStats, CharacterUnlocks } from '../types';

export const SCENE_NAMES: Record<SceneId, string> = {
  'scen_1': '鏌滃彴',
  'scen_2': '瀹㈡埧',
  'scen_3': '閰掑満',
  'scen_4': '璁粌鍦?,
  'scen_5': '姝﹀櫒搴?,
  'scen_6': '闃插叿搴?,
  'scen_7': '娓╂硥',
  'scen_8': '鎸夋懇瀹?,
  'scen_9': '搴撴埧',
  'scen_10': '閬撳叿搴?
};

export const INITIAL_SCENE_LEVELS: Record<string, number> = {
  'scen_1': 1, // 鏌滃彴
  'scen_2': 1, // 瀹㈡埧
  'scen_3': 1, // 閰掑満
  'scen_4': 1, // 璁粌鍦?  'scen_5': 0,  // 姝﹀櫒搴?  'scen_6': 0,  // 闃插叿搴?  'scen_7': 0,  // 娓╂硥
  'scen_8': 0,  // 鎸夋懇瀹?  'scen_9': 1, // 搴撴埧
  'scen_10': 1, // 閬撳叿搴?};

export const INITIAL_CHARACTER_LEVEL: Record<string, number> = {
  'char_1': 1, // {{user}}
  'char_101': 1, // 鑾夎帀濞?  'char_102': 99, // 绫冲
  'char_103': 2, // 娆ц嫢鎷?  'char_104': 4, // 鏈辫开鏂?  'char_105': 9, // 鑾插崕
  'char_106': 7, // 鑹剧惓
  'char_107': 7, // 鑿叉礇
  'char_108': 7, // 鍗＄壒鐞冲
  'char_109': 5, // 鑾辨媺
  'char_110': 9, // 鐞夊崱
  'char_111': 9, // 鍚夊
};

export const INITIAL_CHARACTER_AFFINITY: Record<string, number> = {
  'char_1': 0, // {{user}}
  'char_101': 10, // 鑾夎帀濞?  'char_102': 5, // 绫冲
  'char_103': 5, // 娆ц嫢鎷?  'char_104': 1, // 鏈辫开鏂?  'char_105': 1, // 鑾插崕
  'char_106': 1, // 鑹剧惓
  'char_107': 1, // 鑿叉礇
  'char_108': 1, // 鍗＄壒鐞冲
  'char_109': 3, // 鑾辨媺
  'char_110': 1, // 鐞夊崱
  'char_111': 1, // 鍚夊
};

export const INITIAL_GOLD = 100000;
export const MAX_GOLD = 999999; // 閲戝竵涓婇檺

export const INITIAL_INVENTORY: Record<string, number> = {
    'res-0001': 1500, // 鐏垫湪
    'res-0002': 1500, // 骞荤毊
    'res-0003': 1500, // 榄旀櫠鐭?    'res-0101': 99, // 鐙傛毚鍏旇倝
    'res-0201': 99, // 闈掕彍
    'res-0301': 99, // 鍙戝厜鑿屼紴
    'res-0401': 99, // 闈㈢矇
    'res-0501': 99, // 娓￠甫铔?    'res-0601': 99, // 鐗涘ザ
    'res-0701': 99, // 鍟ら厭
    'res-0801': 99, // 鍙茶幈濮嗗嚌鑳?    'res-0901': 99, // 鏈ㄧ伒鐨勮儭妞?    'itm-01': 5, // 娌荤枟鑽峰皬
    'itm-07': 1, // 绮剧伒绮夊皹
    'wpn-102': 1, // 閾佸墤
    'arm-201': 1, // 鐨敳Lv1
    'spc-00': 1, // 銆岃帿姣斾箤鏂€?    'spc-05': 2, // 妫夌怀
};

// 鏃呭簵绠＄悊鍒濆鏁版嵁锛堜笉鍖呭惈鐢辫鏂界瓑绾ц绠楃殑鍊硷級
export const INITIAL_MANAGEMENT_STATS = {
    occupancy: 12, // 褰撳墠鍏ヤ綇浜烘暟
    satisfaction: 85, // 婊℃剰搴?    attraction: 78, // 鍚稿紩鍔?    reputation: 92 // 澹版湜
};

// --- 瑙掕壊瑙ｉ攣绯荤粺甯搁噺 ---

/**
 * 鐗瑰畾瑙掕壊鐨勫垵濮嬭В閿佺姸鎬? * 鍙垪鍑洪渶瑕佺壒娈婂垵濮嬪寲鐨勮鑹插拰鐘舵€侊紝鏈垪鍑虹殑榛樿涓?0锛堟湭瑙ｉ攣锛? */
export const INITIAL_CHARACTER_UNLOCKS: Record<string, Partial<CharacterUnlocks>> = {
    // 鑾夎帀濞?- 鏃呭簵鑰佹澘濞橈紝涓昏鐨勫濮?    'char_101': {
        accept_flirt_topic: 1,          // 鏆ф槯璇濋
        accept_physical_contact: 1      // 韬綋鎺ヨЕ
    },
    // 绫冲 - 閰掑満鏈嶅姟鍛?    'char_102': {
        accept_flirt_topic: 1,         // 鏆ф槯璇濋
        accept_physical_contact: 1,    // 韬綋鎺ヨЕ
        accept_indirect_sexual: 1      // 闂存帴鎬ц涓?    },
    // 娆ц嫢鎷?    'char_103': {
        accept_battle_party: 1,         // 鎴樻枟缁勯槦
        accept_flirt_topic: 1,          // 鏆ф槯璇濋
        accept_physical_contact: 1,     // 韬綋鎺ヨЕ
        accept_indirect_sexual: 1      // 闂存帴鎬ц涓?    },
    // 鏈辫开鏂?    'char_104': {
        accept_physical_contact: 1,     // 韬綋鎺ヨЕ
        accept_direct_sexual: 1         // 鐩存帴鎬ц涓?    },
    // 鍚夊
    'char_111': {
        accept_nsfw_topic: 1            // 鑹叉儏璇濋
    }
};
