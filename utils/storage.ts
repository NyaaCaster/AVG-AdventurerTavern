
import { GameSettings, ApiProvider } from '../types';

const STORAGE_KEY = 'adventurer_tavern_settings';

export const defaultSettings: GameSettings = {
  userName: '罗安',
  innName: '夜莺亭',
  enableTypewriter: true,
  dialogueTransparency: 20,
  apiConfig: {
    provider: 'openai_compatible',
    baseUrl: 'https://love.qinyan.icu/v1',
    apiKey: '',
    model: 'grok-3',
    autoConnect: false
  }
};

export const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored);
    return { ...defaultSettings, ...parsed, apiConfig: { ...defaultSettings.apiConfig, ...parsed.apiConfig } };
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