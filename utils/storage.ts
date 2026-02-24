
import { GameSettings, ApiProvider } from '../types';

const STORAGE_KEY = 'adventurer_tavern_settings';
const SETTINGS_VERSION = 2; // 增加版本号以触发迁移

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
  enableHD: false, // 默认关闭 HD 模式
  isBloodRelated: true // 默认为亲生姐姐
};

interface StoredSettings extends GameSettings {
  _version?: number;
}

export const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed: StoredSettings = JSON.parse(stored);
    
    // 检查版本，如果版本不匹配或不存在，使用默认设置（保留 API 配置）
    if (!parsed._version || parsed._version < SETTINGS_VERSION) {
      console.log(`[Settings] Migrating from version ${parsed._version || 0} to ${SETTINGS_VERSION}`);
      const migratedSettings = { ...defaultSettings };
      // 保留用户的 API 配置和用户名等关键信息
      if (parsed.apiConfig) {
        migratedSettings.apiConfig = { ...defaultSettings.apiConfig, ...parsed.apiConfig };
      }
      if (parsed.userName) migratedSettings.userName = parsed.userName;
      if (parsed.innName) migratedSettings.innName = parsed.innName;
      // 保存迁移后的设置
      saveSettings(migratedSettings);
      return migratedSettings;
    }
    
    // Start with default settings as base
    const mergedSettings: GameSettings = { ...defaultSettings };
    
    // Only copy over fields that exist and have valid values from parsed data
    if (parsed.userName !== undefined) mergedSettings.userName = parsed.userName;
    if (parsed.innName !== undefined) mergedSettings.innName = parsed.innName;
    if (typeof parsed.enableTypewriter === 'boolean') mergedSettings.enableTypewriter = parsed.enableTypewriter;
    if (typeof parsed.dialogueTransparency === 'number') mergedSettings.dialogueTransparency = parsed.dialogueTransparency;
    if (typeof parsed.masterVolume === 'number') mergedSettings.masterVolume = parsed.masterVolume;
    if (typeof parsed.isMuted === 'boolean') mergedSettings.isMuted = parsed.isMuted;
    if (typeof parsed.enableNSFW === 'boolean') mergedSettings.enableNSFW = parsed.enableNSFW;
    if (typeof parsed.enableDebug === 'boolean') mergedSettings.enableDebug = parsed.enableDebug;
    if (typeof parsed.enableHD === 'boolean') mergedSettings.enableHD = parsed.enableHD;
    if (typeof parsed.isBloodRelated === 'boolean') mergedSettings.isBloodRelated = parsed.isBloodRelated;
    
    // Deep merge apiConfig
    if (parsed.apiConfig) {
      mergedSettings.apiConfig = { ...defaultSettings.apiConfig, ...parsed.apiConfig };
    }
    
    return mergedSettings;
  } catch (e) {
    console.error("Failed to load settings", e);
    return defaultSettings;
  }
};

export const saveSettings = (settings: GameSettings) => {
  try {
    const settingsWithVersion: StoredSettings = {
      ...settings,
      _version: SETTINGS_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsWithVersion));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};
