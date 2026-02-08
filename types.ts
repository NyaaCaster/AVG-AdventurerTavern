
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
}

export interface Character {
  id: string; // 角色唯一标识 (如 char_101)
  name: string;
  role: string;
  description: string; // UI显示的简短描述
  persona: string; // 传给 LLM 的详细人设与规则
  dialogueExamples: string; // 传给 LLM 的对话示例
  avatarUrl: string;
  spriteUrl: string; // 默认立绘
  emotions: Record<string, string>; // 情绪 -> 图片路径 映射
}

export interface DialogueEntry {
  speaker: string;
  text: string;
  timestamp: number;
  type: 'npc' | 'user';
  avatarUrl?: string; // 用于历史记录显示
}

export interface SceneConfig {
  backgroundUrl: string;
  character: Character;
  history: DialogueEntry[];
}

// 新增：世界环境状态，用于同步 UI 和 LLM 上下文
export interface WorldState {
  dateStr: string;      // 例如 "10月24日"
  weekDay: string;      // 例如 "周五"
  timeStr: string;      // 例如 "22:30"
  period: 'day' | 'evening' | 'night'; // 时段代码
  periodLabel: string;  // 时段显示名，例如 "深夜"
  weather: string;      // 天气描述
  weatherCode: string;  // 天气图标代码
}
