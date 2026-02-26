import { GameSettings, ApiProvider } from '../types';

const STORAGE_KEY = 'adventurer_tavern_settings';
const SETTINGS_VERSION = 2; // 澧炲姞鐗堟湰鍙蜂互瑙﹀彂杩佺Щ

export const defaultSettings: GameSettings = {
  userName: '缃楀畨',
  innName: '澶滆幒浜?,
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
  enableNSFW: false, // 榛樿鍏抽棴 NSFW
  enableDebug: false, // 榛樿鍏抽棴 Debug
  enableHD: false, // 榛樿鍏抽棴 HD 妯″紡
  isBloodRelated: true // 榛樿涓轰翰鐢熷濮?};

interface StoredSettings extends GameSettings {
  _version?: number;
}

export const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed: StoredSettings = JSON.parse(stored);
    
    // 妫€鏌ョ増鏈紝濡傛灉鐗堟湰涓嶅尮閰嶆垨涓嶅瓨鍦紝浣跨敤榛樿璁剧疆锛堜繚鐣?API 閰嶇疆锛?    if (!parsed._version || parsed._version < SETTINGS_VERSION) {
      console.log(`[Settings] Migrating from version ${parsed._version || 0} to ${SETTINGS_VERSION}`);
      const migratedSettings = { ...defaultSettings };
      // 淇濈暀鐢ㄦ埛鐨?API 閰嶇疆鍜岀敤鎴峰悕绛夊叧閿俊鎭?      if (parsed.apiConfig) {
        migratedSettings.apiConfig = { ...defaultSettings.apiConfig, ...parsed.apiConfig };
      }
      if (parsed.userName) migratedSettings.userName = parsed.userName;
      if (parsed.innName) migratedSettings.innName = parsed.innName;
      // 淇濆瓨杩佺Щ鍚庣殑璁剧疆
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

