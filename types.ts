
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
  enableDebug: boolean; // 新增：Debug模式开关
}

// 新增：场景ID定义
export type SceneId = 
  | 'scen_1'  // 宿屋
  | 'scen_2'  // 客房
  | 'scen_3'  // 酒场
  | 'scen_4'  // 训练场
  | 'scen_5'  // 武器店
  | 'scen_6'  // 防具店
  | 'scen_7'  // 温泉
  | 'scen_8'  // 按摩室
  | 'scen_9'  // 库房
  | 'scen_10'; // 道具店

// 新增：角色日程表定义
export interface CharacterSchedule {
  day?: SceneId[];
  evening?: SceneId[];
  night?: SceneId[];
}

// 新增：角色出现条件定义
export interface AppearanceCondition {
  sceneId: SceneId;
  minLevel: number;
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
  appearanceConditions?: AppearanceCondition[];
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
export interface WorldState {
  dateStr: string;      // 例如 "10月24日"
  weekDay: string;      // 例如 "周日"
  timeStr: string;      // 例如 "22:30"
  period: 'day' | 'evening' | 'night'; // 时段代码
  periodLabel: string;  // 时段显示名，例如 "深夜"
  weather: string;      // 天气描述
  weatherCode: string;  // 天气图标代码
  sceneName: string;    // 新增：场景名称
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
}

// --- 道具系统类型定义 ---

export type ItemCategory = 'res' | 'itm' | 'spc' | 'wpn' | 'arm' | 'acs';

export type ItemTag =
  // 食材标签
  | 'non' | 'meat' | 'vegetable' | 'mushroom' | 'cereal' | 'egg' | 'milk' | 'wine' | 'jelly' | 'spice'
  // 装备类别标签
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
  quality: ItemQuality;
  maxStack: number;
  description: string;
  stats?: ItemStats;
  price?: number; // 预留价格字段
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
