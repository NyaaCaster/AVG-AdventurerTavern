
import { GameSettings, ApiProvider } from '../types';

const STORAGE_KEY = 'adventurer_tavern_settings';

export const defaultSettings: GameSettings = {
  userName: '罗安',
  innName: '夜莺亭',
  enableTypewriter: true,
  dialogueTransparency: 40,
  apiConfig: {
    provider: 'openai_compatible',
    baseUrl: 'https://love.qinyan.icu/v1',
    apiKey: '',
    model: 'grok-3',
    autoConnect: false
  },
  masterVolume: 15,
  isMuted: false,
  enableNSFW: false, // 默认关闭 NSFW
  enableDebug: false, // 默认关闭 Debug
  enableHD: false // 默认关闭 HD 模式
};

export const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored);
    
    // Ensure all fields are present by merging with defaultSettings
    const mergedSettings = { ...defaultSettings, ...parsed };
    
    // Deep merge apiConfig to prevent missing fields there as well
    mergedSettings.apiConfig = { ...defaultSettings.apiConfig, ...parsed.apiConfig };
    
    // Explicitly ensure boolean type for safety (handles cases where storage might be corrupted or undefined)
    if (typeof parsed.enableNSFW !== 'boolean') {
        mergedSettings.enableNSFW = defaultSettings.enableNSFW;
    }
    if (typeof parsed.enableDebug !== 'boolean') {
        mergedSettings.enableDebug = defaultSettings.enableDebug;
    }
    if (typeof parsed.enableHD !== 'boolean') {
        mergedSettings.enableHD = defaultSettings.enableHD;
    }
    
    return mergedSettings;
  } catch (e) {
    console.error("Failed to load settings", e);
    return defaultSettings;
  }
};

export const saveSettings = (settings: GameSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};
