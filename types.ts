export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  CONFIG = 'CONFIG'
}


export type ApiProvider = 'openai_compatible' | 'google' | 'deepseek' | 'openai' | 'claude';

export type ConfigTab = 'dialogue' | 'api' | 'sound';

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface ApiConfig {
  provider: ApiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  autoConnect: boolean;
}

export interface GameSettings {
  userName: string;
  innName: string;
  enableTypewriter: boolean;
  dialogueTransparency: number; // 0-100
  apiConfig: ApiConfig;
  masterVolume: number; // 0-100
  isMuted: boolean;
  enableNSFW: boolean;
  enableDebug: boolean; // 鏂板锛欴ebug妯″紡寮€鍏?  enableHD: boolean; // 鏂板锛氶珮娓呭浘鐗囨ā寮?  isBloodRelated: boolean; // 鏂板锛氫笌char_101鐨勮缂樺叧绯伙紙true=浜茬敓濮愬锛宖alse=涔夊锛?}

// 鏂板锛氬満鏅疘D瀹氫箟
export type SceneId = 
  | 'scen_1'  // 鏌滃彴
  | 'scen_2'  // 瀹㈡埧
  | 'scen_3'  // 閰掑満
  | 'scen_4'  // 璁粌鍦?  | 'scen_5'  // 姝﹀櫒搴?  | 'scen_6'  // 闃插叿搴?  | 'scen_7'  // 娓╂硥
  | 'scen_8'  // 鎸夋懇瀹?  | 'scen_9'  // 搴撴埧
  | 'scen_10'; // 閬撳叿搴?
// 鏂板锛氳鑹叉棩绋嬭〃瀹氫箟
export interface CharacterSchedule {
  day?: SceneId[];
  evening?: SceneId[];
  night?: SceneId[];
}

// 鏂板锛氳鑹插嚭鐜版潯浠跺畾涔?export interface AppearanceCondition {
  sceneId: SceneId;
  minLevel: number;
}

// 鏂板锛氳。鐫€鐘舵€佸畾涔?export type ClothingState = 'default' | 'nude' | 'bondage' | string;

// 鏂板锛氭儏缁浘鐗囬厤缃粨鏋?export interface EmotionImageConfig {
  spriteUrl: string; // 璇ョ姸鎬佷笅鐨勯粯璁ょ珛缁?  emotions: Record<string, string[]>; // 鎯呯华鍚?-> 鍥剧墖璺緞鍒楄〃
}

// 鏂板锛氳鑹插浘鐗囨€婚厤缃?export interface CharacterImageConfig {
  Character: string;
  avatarUrl: string; // 澶村儚璺緞 (闆嗕腑绠＄悊)
  default: EmotionImageConfig;
  nude?: EmotionImageConfig;
  bondage?: EmotionImageConfig;
  [key: string]: any;
}

export interface Character {
  id: string; // 瑙掕壊鍞竴鏍囪瘑 (濡?char_101)
  name: string;
  role: string;
  description: string; // UI鏄剧ず鐨勭畝鐭弿杩?  persona: string; // 浼犵粰 LLM 鐨勮缁嗕汉璁句笌瑙勫垯
  dialogueExamples: string; // 浼犵粰 LLM 鐨勫璇濈ず渚?  persona_nsfw?: string; // NSFW 妯″紡杩藉姞浜鸿
  dialogueExamples_nsfw?: string; // NSFW 妯″紡杩藉姞瀵硅瘽
  avatarUrl?: string; // 杩愯鏃舵敞鍏ワ紝婧愭枃浠跺彲閫?  spriteUrl?: string; // 榛樿绔嬬粯 (宸插簾寮冿紝鍏煎鏃ч€昏緫)
  emotions?: Record<string, string>; // 鎯呯华鏄犲皠 (宸插簾寮冿紝鍏煎鏃ч€昏緫)
  // imageConfig 宸茬Щ闄わ紝鏀圭敤 centralized config management
  // 绯荤粺瑙勫垯鏁版嵁
  schedule?: CharacterSchedule;
  appearanceConditions?: AppearanceCondition[];
}

export interface DialogueEntry {
  speaker: string;
  text: string;
  timestamp: number;
  type: 'npc' | 'user';
  avatarUrl?: string; // 鐢ㄤ簬鍘嗗彶璁板綍鏄剧ず
  tokens?: number; // 鏂板锛氳褰曡鏉℃秷鎭秷鑰楃殑 Token 鏁?(鐢ㄦ埛涓?prompt_tokens, NPC 涓?completion_tokens)
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'info';
  content: any;
}

export interface SceneConfig {
  backgroundUrl: string;
  character: Character;
  history: DialogueEntry[];
}

// 鏂板锛氫笘鐣岀幆澧冪姸鎬侊紝鐢ㄤ簬鍚屾 UI 鍜?LLM 涓婁笅鏂?// 鏂板锛氶厭鍦鸿彍鍗曠姸鎬?export interface TavernMenuState {
  foods: (string | null)[];
  drinks: (string | null)[];
}

export interface WorldState {
  dateStr: string;      // 渚嬪 "10鏈?4鏃?
  weekDay: string;      // 渚嬪 "鍛ㄦ棩"
  timeStr: string;      // 渚嬪 "22:30"
  period: 'day' | 'evening' | 'night'; // 鏃舵浠ｇ爜
  periodLabel: string;  // 鏃舵鏄剧ず鍚嶏紝渚嬪 "娣卞"
  weather: string;      // 澶╂皵鎻忚堪
  weatherCode: string;  // 澶╂皵鍥炬爣浠ｇ爜
  temp?: string;        // 姘旀俯锛堟憚姘忓害锛?  sceneName: string;    // 鏂板锛氬満鏅悕绉?}

// 鐢ㄦ埛鑷畾涔夎彍璋辨暟鎹粨鏋?export interface UserRecipe {
  id: string;           // 鑿滆氨鍞竴ID (timestamp based)
  templateId: string;   // 鍏宠仈鐨?FOOD_RECIPES ID
  name: string;         // 鏂欑悊鍚嶇О (LLM鐢熸垚鎴栭粯璁?
  description: string;  // 鏂欑悊鎻忚堪 (LLM鐢熸垚鎴栭粯璁?
  imagePath: string;    // 鍥剧墖璺緞
  star: number;         // 鏂欑悊鏄熺骇 (绱犳潗骞冲潎)
  price: number;        // 浼扮畻鍞环
  mainResId: string;    // 涓荤礌鏉怚D
  otherResIds: string[];// 杈呯礌鏉怚D鍒楄〃
  createdAt: number;
}

// --- 瑙掕壊瑙ｉ攣绯荤粺绫诲瀷瀹氫箟 ---

export interface CharacterUnlocks {
    accept_battle_party: 0 | 1;
    accept_flirt_topic: 0 | 1;
    accept_nsfw_topic: 0 | 1;
    accept_physical_contact: 0 | 1;
    accept_indirect_sexual: 0 | 1;
    accept_become_lover: 0 | 1;
    accept_direct_sexual: 0 | 1;
    accept_sexual_partner: 0 | 1;
    accept_public_exposure: 0 | 1;
    accept_public_sexual: 0 | 1;
    accept_group_sexual: 0 | 1;
    accept_prostitution: 0 | 1;
    accept_sexual_slavery: 0 | 1;
    accept_bathing_together: 0 | 1;
    accept_player_massage: 0 | 1;
    accept_character_massage: 0 | 1;
}

export interface SceneProps {
  onNavigate: (sceneId: SceneId, params?: any) => void;
  onAction: (action: string, param?: any) => void;
  onEnterDialogue: (characterId: string, actionType?: string) => void;
  isMenuVisible: boolean;
  worldState?: WorldState;
  // 鐢ㄤ簬瀹㈡埧绛夐渶瑕佺壒瀹氳鑹茬殑鍦烘櫙
  targetCharacterId?: string;
  settings: GameSettings;
  presentCharacters: Character[]; // 鏂板锛氬綋鍓嶅満鏅瓨鍦ㄧ殑瑙掕壊鍒楄〃
  inventory: Record<string, number>; // 鏂板锛氬綋鍓嶆寔鏈夌殑閬撳叿鍒楄〃 {itemId: count}
  onOpenManagement?: () => void; // 鏂板锛氭墦寮€绠＄悊鐣岄潰鍥炶皟
  sceneLevels: Record<string, number>; // 鏂板锛氬満鏅瓑绾т俊鎭?  characterUnlocks: Record<string, CharacterUnlocks>; // 鏂板锛氳鑹茶В閿佺姸鎬?  // 鐑归オ绯荤粺鐩稿叧
  onOpenCooking?: () => void;
  userRecipes?: UserRecipe[];
  foodStock?: Record<string, number>;
  // 閰掑満鑿滃崟绯荤粺
  onOpenTavernMenu?: () => void;
  tavernMenu?: TavernMenuState;
}

// --- 閬撳叿绯荤粺绫诲瀷瀹氫箟 ---

export type ItemCategory = 'res' | 'itm' | 'spc' | 'wpn' | 'arm' | 'acs';

export type ItemTag =
  // 椋熸潗鏍囩
  | 'non' | 'meat' | 'poultry' | 'fish' | 'shrimp' | 'mussel'
  | 'carrot' | 'potato' | 'vegetable' | 'melons' | 'fruit' | 'tomatoes'
  | 'mushroom' | 'flour' | 'bread' | 'rice' | 'bean'
  | 'egg' | 'milk' | 'dairy' | 'drinks' | 'jelly' | 'spice' | 'foods'
  // 瑁呭绫诲埆鏍囩
  | 'sword' | 'book' | 'gun' | 'glove' | 'lance' | 'axe' | 'bow'
  | 'L-Arm' | 'M-Arm' | 'H-Arm';

export type ItemQuality = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface ItemStats {
  ATK?: number;
  DEF?: number;
  AGI?: number;
  INT?: number;
}

export interface ItemData {
  id: string;
  name: string;
  category: ItemCategory;
  tag?: ItemTag;
  quality?: ItemQuality; // 鏀逛负鍙€?  star?: string; // 鏂板锛氱礌鏉愭槦绾?  maxStack: number;
  description: string;
  stats?: ItemStats;
  price?: number; // 棰勭暀浠锋牸瀛楁
  imagePath?: string; // 鏂板锛氱壒瀹氬浘鐗囪矾寰勶紙濡傛枡鐞嗗浘鐗囷級
}

export interface ItemCategoryInfo {
  id: ItemCategory;
  name: string;
}

export interface ItemTagInfo {
  id: ItemTag;
  name: string;
  icon?: string; // 鏍囩鍥炬爣 (emoji)
}

// --- 鏃呭簵绠＄悊绯荤粺 ---

export interface ManagementStats {
  occupancy: number; // 褰撳墠浣忓浜烘暟
  maxOccupancy: number; // 涓婇檺鏁?  roomPrice: number; // 瀹㈡埧鍗曚环 (G)
  satisfaction: number; // 婊¤冻搴?(0-100)
  attraction: number; // 闆嗗鍔?(0-100)
  reputation: number; // 濂借瘎搴?(0-100)
}

export type RevenueType = 'accommodation' | 'tavern';

export interface RevenueLog {
  id: string;
  timestamp: number; // 鐢ㄤ簬鎺掑簭鍜岀敓鎴愭樉绀烘椂闂?  dateStr: string;   // 鏄剧ず鏃ユ湡 (濡?10鏈?4鏃?
  timeStr: string;   // 鏄剧ず鏃堕棿 (濡?08:00)
  type: RevenueType;
  amount: number;
}

// --- 鍟嗗簵绯荤粺绫诲瀷瀹氫箟 ---
export type ShopTab = 'buy' | 'sell';

export interface CartItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface ShopItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ShopTab;
  inventory: Record<string, number>;
  currentGold: number;
  onTransaction?: (changes: {
    goldChange: number;
    inventoryChanges: Record<string, number>;
  }) => void;
}

