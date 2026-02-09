
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

export interface Character {
  id: string; // 角色唯一标识 (如 char_101)
  name: string;
  role: string;
  description: string; // UI显示的简短描述
  persona: string; // 传给 LLM 的详细人设与规则
  dialogueExamples: string; // 传给 LLM 的对话示例
  persona_nsfw?: string; // NSFW 模式追加人设
  dialogueExamples_nsfw?: string; // NSFW 模式追加对话
  avatarUrl: string;
  spriteUrl: string; // 默认立绘
  emotions: Record<string, string>; // 情绪 -> 图片路径 映射
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
}
