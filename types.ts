
export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  CONFIG = 'CONFIG'
}

export type ApiProvider = 'openai_compatible' | 'google' | 'deepseek' | 'openai' | 'claude';

export type ConfigTab = 'dialogue' | 'api' | 'sound' | 'account';

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
  enableDebug: boolean; // 新增：Debug模式开关
  enableHD: boolean; // 新增：高清图片模式
  isBloodRelated: boolean; // 新增：与char_101的血缘关系（true=亲生姐姐，false=义姐）
}

// 新增：场景ID定义
export type SceneId = 
  | 'scen_1'  // 柜台
  | 'scen_2'  // 客房
  | 'scen_3'  // 酒场
  | 'scen_4'  // 训练场
  | 'scen_5'  // 武器店
  | 'scen_6'  // 防具店
  | 'scen_7'  // 温泉
  | 'scen_8'  // 按摩室
  | 'scen_9'  // 库房
  | 'scen_10' // 道具店
  // --- 额外场景组（非旅店设施，不可升级）---
  | 'scen_town'   // 小镇
  | 'scen_guild'  // 冒险者公会
  | 'scen_market'; // 市集

// 新增：角色日程表定义
export interface CharacterSchedule {
  day?: SceneId[];
  evening?: SceneId[];
  night?: SceneId[];
}

export interface CharacterSkillLearning {
  level: number;
  skillId: number;
  ratio: number; // 修正比例 (百分比数字，如 80 表示 80%)
}

export interface CharacterBattleData {
  maxLevel: number;
  className: string;
  optimizeType: string;
  canFight: boolean;
  statMultipliers: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    matk: number;
    mdef: number;
    agi: number;
    luk: number;
  };
  skills: CharacterSkillLearning[];
  /** 角色可穿戴的装备标签列表 (武器+防具类型) */
  equipableTags?: ItemTag[];
}

// 新增：衣着状态定义
export type ClothingState = 'default' | 'nude' | 'bondage' | string;

// 新增：情绪图片配置结构
export interface EmotionImageConfig {
  spriteUrl: string; // 该状态下的默认立绘
  emotions: Record<string, string[]>; // 情绪名 -> 图片路径列表
}

// 新增：角色图片总配置
export interface CharacterImageConfig {
  Character: string;
  avatarUrl: string; // 头像路径 (集中管理)
  default: EmotionImageConfig;
  nude?: EmotionImageConfig;
  bondage?: EmotionImageConfig;
  [key: string]: any;
}

export interface Character {
  id: string; // 角色唯一标识 (如 char_101)
  name: string;
  role: string;
  description: string; // UI显示的简短描述
  persona: string; // 传给 LLM 的详细人设与规则
  dialogueExamples: string; // 传给 LLM 的对话示例
  persona_nsfw?: string; // NSFW 模式追加人设
  dialogueExamples_nsfw?: string; // NSFW 模式追加对话
  avatarUrl?: string; // 运行时注入，源文件可选
  spriteUrl?: string; // 默认立绘 (已废弃，兼容旧逻辑)
  emotions?: Record<string, string>; // 情绪映射 (已废弃，兼容旧逻辑)
  // imageConfig 已移除，改用 centralized config management
  // 系统规则数据
  schedule?: CharacterSchedule;
  battleData?: CharacterBattleData;
}

export interface DialogueEntry {
  speaker: string;
  text: string;
  timestamp: number;
  type: 'npc' | 'user';
  avatarUrl?: string; // 用于历史记录显示
  tokens?: number; // 新增：记录该条消息消耗的 Token 数 (用户为 prompt_tokens, NPC 为 completion_tokens)
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

// 新增：世界环境状态，用于同步 UI 和 LLM 上下文
// 新增：酒场菜单状态
export interface TavernMenuState {
  foods: (string | null)[];
  drinks: (string | null)[];
}

export interface WorldState {
  dateStr: string;      // 例如 "10月24日"
  weekDay: string;      // 例如 "周日"
  timeStr: string;      // 例如 "22:30"
  period: 'day' | 'evening' | 'night'; // 时段代码
  periodLabel: string;  // 时段显示名，例如 "深夜"
  weather: string;      // 天气描述
  weatherCode: string;  // 天气图标代码
  temp?: string;        // 气温（摄氏度）
  sceneName: string;    // 新增：场景名称
}

// 用户自定义菜谱数据结构
export interface UserRecipe {
  id: string;           // 菜谱唯一ID (timestamp based)
  templateId: string;   // 关联的 FOOD_RECIPES ID
  name: string;         // 料理名称 (LLM生成或默认)
  description: string;  // 料理描述 (LLM生成或默认)
  imagePath: string;    // 图片路径
  star: number;         // 料理星级 (素材平均)
  price: number;        // 估算售价
  mainResId: string;    // 主素材ID
  otherResIds: string[];// 辅素材ID列表
  createdAt: number;
}

// --- 角色解锁系统类型定义 ---

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
  // 用于客房等需要特定角色的场景
  targetCharacterId?: string;
  settings: GameSettings;
  presentCharacters: Character[]; // 新增：当前场景存在的角色列表
  inventory: Record<string, number>; // 新增：当前持有的道具列表 {itemId: count}
  onOpenManagement?: () => void; // 新增：打开管理界面回调
  sceneLevels: Record<string, number>; // 新增：场景等级信息
    checkedInCharacters?: string[]; // 已入住角色列表
  characterUnlocks: Record<string, CharacterUnlocks>; // 新增：角色解锁状态
  // 烹饪系统相关
  onOpenCooking?: () => void;
  userRecipes?: UserRecipe[];
  foodStock?: Record<string, number>;
  // 酒场菜单系统
  onOpenTavernMenu?: () => void;
  tavernMenu?: TavernMenuState;
}

// --- 道具系统类型定义 ---

export type ItemCategory = 'res' | 'itm' | 'spc' | 'wpn' | 'arm' | 'acs';

export type ItemTag =
  // 食材标签
  | 'non' | 'meat' | 'poultry' | 'fish' | 'shrimp' | 'mussel'
  | 'carrot' | 'potato' | 'vegetable' | 'melons' | 'fruit' | 'tomatoes'
  | 'mushroom' | 'flour' | 'bread' | 'rice' | 'bean'
  | 'egg' | 'milk' | 'dairy' | 'drinks' | 'jelly' | 'spice' | 'foods'
  // 装备类别标签
  | 'sword' | 'book' | 'gun' | 'glove' | 'lance' | 'axe' | 'bow'
  | 'L-Arm' | 'M-Arm' | 'H-Arm';

export type ItemQuality = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface ItemStats {
  hp?: number;
  mp?: number;
  atk?: number;
  def?: number;
  matk?: number;
  mdef?: number;
  agi?: number;
  luk?: number;
}

// 新增：消耗品使用效果定义
export interface ConsumableEffects {
  /** 恢复的 HP 百分比 (0.0 到 1.0) */
  recoverHpPercent?: number;
  /** 恢复的 MP 百分比 (0.0 到 1.0) */
  recoverMpPercent?: number;
  /** 是否复活 (true 时，只能对死亡角色使用并清除死亡状态) */
  revive?: boolean;
  /** 解除的异常状态 ID 列表 */
  removeStatus?: string[];
  /** 附加的异常状态 ID 列表 */
  applyStatus?: string[];
}

export interface ItemData {
  id: string;
  name: string;
  category: ItemCategory;
  tag?: ItemTag;
  quality?: ItemQuality; // 改为可选
  star?: string; // 新增：素材星级
  maxStack: number;
  description: string;
  stats?: ItemStats;
  consumableEffects?: ConsumableEffects; // 新增：消耗品特有效果逻辑
  price?: number; // 预留价格字段
  imagePath?: string; // 新增：特定图片路径（如料理图片）
}

export interface ItemCategoryInfo {
  id: ItemCategory;
  name: string;
}

export interface ItemTagInfo {
  id: ItemTag;
  name: string;
  icon?: string; // 标签图标 (emoji)
}

// --- 旅店管理系统 ---

export interface ManagementStats {
  occupancy: number; // 当前住宿人数
  maxOccupancy: number; // 上限数
  roomPrice: number; // 客房单价 (G)
  satisfaction: number; // 满足度 (0-100)
  attraction: number; // 集客力 (0-100)
  reputation: number; // 好评度 (0-100)
}

export type RevenueType = 'accommodation' | 'tavern';

export interface RevenueLog {
  id: string;
  timestamp: number; // 用于排序和生成显示时间
  dateStr: string;   // 显示日期 (如 10月24日)
  timeStr: string;   // 显示时间 (如 08:00)
  type: RevenueType;
  amount: number;
}

// --- 商店系统类型定义 ---
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

// --- 任务系统类型定义 ---

export interface EnemyConfig {
  enemy_id: number;
  position: number;
}

export interface BattleConfig {
  troop_id: number;
  enemies: EnemyConfig[];
}

export interface RewardItem {
  item_id: string;
  // item_name 可从 ITEMS 查找，此处仅作可读性参考
  item_num: number;
}

export interface QuestRewards {
  gold: number;
  experience: number;
  items: RewardItem[];
}

export interface QuestList {
  quest_id: string;
  quest_name: string;
  description: string;
  star: number;       // 难度星级 (1-10)
  rank: string;       // 难度等级 (E/D/C/B/A/S)
  target: string;
  background_image: string;
  target_image: string;
  battle_config: BattleConfig;
  rewards: QuestRewards;
}

export type QuestMap = Record<string, QuestList>;

export interface QuestTarget {
  quest_id: string;
  star: number;
  rank: string;
  target: string;
}

export type QuestTargetList = QuestTarget[];

export type QuestStatus = 'available' | 'active' | 'completed';

export interface QuestState {
  questId: string;
  status: QuestStatus;
  acceptedAt?: number; // 接受任务的时间戳
}

export type QuestStateMap = Record<string, QuestState>;