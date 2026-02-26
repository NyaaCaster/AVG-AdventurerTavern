import { WorldState, SceneId, Character, ClothingState } from '../types';
import { CHARACTERS } from '../data/scenarioData';
import { CHARACTER_IMAGES } from '../data/resources/characterImageResources';
import { SCENE_NAMES } from './gameConstants';

export const calculateWorldState = (currentSceneName: string): WorldState => {
  const now = new Date();
  const days = ['鍛ㄦ棩', '鍛ㄤ竴', '鍛ㄤ簩', '鍛ㄤ笁', '鍛ㄥ洓', '鍛ㄤ簲', '鍛ㄥ叚'];
  const h = now.getHours();
  
  let period: 'day' | 'evening' | 'night' = 'night';
  let periodLabel = "澶滄櫄";
  // 妯℃嫙澶╂皵浠ｇ爜锛堥檷绾ф柟妗堬級- 瀹為檯澶╂皵鐢?weatherService 閫氳繃 QWeather API 鑾峰彇骞惰鐩?  let weatherCode = "150"; // 鏅达紙澶滈棿锛?  let weather = "鏅存湕鐨勫鏅?;

  if (h >= 6 && h < 17) {
      period = 'day';
      periodLabel = "鏃ラ棿";
      weatherCode = "100"; // 鏅达紙鐧藉ぉ锛?      weather = "鏅存湕鐨勭櫧澶?;
  } else if (h >= 17 && h < 20) {
      period = 'evening';
      periodLabel = "鍌嶆櫄";
      weatherCode = "150"; // 鏅达紙澶滈棿锛?      weather = "鏃ヨ惤鏃跺垎鐨勫倣鏅?;
  }

  return {
      dateStr: `${now.getMonth() + 1}鏈?{now.getDate()}鏃,
      weekDay: days[now.getDay()],
      timeStr: `${h.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      period,
      periodLabel,
      weatherCode,
      weather,
      temp: undefined, // 姘旀俯鐢?weatherService 鎻愪緵
      sceneName: currentSceneName
  };
};

export const getSceneDisplayName = (sceneId: SceneId, params?: any): string => {
    if (sceneId === 'scen_2') {
        if (params?.target === 'user') return '鎴戠殑鎴块棿';
        if (params?.target && CHARACTERS[params.target]) return `${CHARACTERS[params.target].name}鐨勬埧闂碻;
        return '瀹㈡埧';
    }
    return SCENE_NAMES[sceneId] || '鏈煡鍖哄煙';
};

export const getCharacterSprite = (character: Character, state: ClothingState, emotion: string): string => {
    const imageConfig = CHARACTER_IMAGES[character.id];
    
    if (!imageConfig) {
        return character.emotions?.[emotion] || character.spriteUrl || '';
    }

    const config = imageConfig[state] || imageConfig['default'];
    
    if (!config) return character.spriteUrl || '';

    let imgList = config.emotions[emotion];
    
    if (!imgList) {
        if (state !== 'default' && imageConfig['default']) {
             imgList = imageConfig['default'].emotions[emotion];
        }
        if (!imgList) {
            imgList = config.emotions['normal'];
        }
    }

    if (imgList && imgList.length > 0) {
        const randIndex = Math.floor(Math.random() * imgList.length);
        return imgList[randIndex];
    }

    return config.spriteUrl || character.spriteUrl || '';
};

export const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const m = array.length;
    const shuffled = [...array];
    for (let i = 0; i < m; i++) {
        const r = Math.floor(seededRandom(seed + i) * (m - i)) + i;
        [shuffled[i], shuffled[r]] = [shuffled[r], shuffled[i]];
    }
    return shuffled;
};

export const calculateCharacterLocations = (period: 'day'|'evening'|'night', dateStr: string, timeStr: string, sceneLevels: Record<string, number>): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const sceneOccupancy: Record<string, number> = {};
    
    const seedString = dateStr + timeStr.split(':')[0]; 
    let seed = 0;
    for(let i=0; i<seedString.length; i++) seed += seedString.charCodeAt(i);

    const allCharIds = Object.keys(CHARACTERS);
    const shuffledIds = shuffleArray(allCharIds, seed);

    const sortedIds = [
        'char_102', 
        ...shuffledIds.filter(id => id !== 'char_102')
    ];

    sortedIds.forEach(charId => {
        const char = CHARACTERS[charId];
        const schedule = char.schedule;
        const possibleScenes = schedule?.[period] || [];

        let selectedScene = 'scen_2';

        if (possibleScenes.length > 0) {
            const validScenes = possibleScenes.filter(sid => {
                if (sid === 'scen_2') return true;
                
                // 妫€鏌ュ満鏅瓑绾э紝鍙厑璁哥瓑绾р墺1鐨勫満鏅?                const sceneLevel = sceneLevels[sid] || 0;
                if (sceneLevel < 1) return false;
                
                if (sid === 'scen_3') {
                    if (charId === 'char_102') return true; 
                    return (sceneOccupancy['scen_3'] || 0) < 5;
                }
                
                return (sceneOccupancy[sid] || 0) === 0;
            });

            const qualifiedScenes = validScenes.filter(sid => {
                if (char.appearanceConditions) {
                    for (const cond of char.appearanceConditions) {
                        if (cond.sceneId === sid) {
                            const sceneLevel = sceneLevels[sid] || 0; 
                            if (sceneLevel < cond.minLevel) return false;
                        }
                    }
                }
                return true;
            });

            if (qualifiedScenes.length > 0) {
                const index = Math.floor(seededRandom(seed + charId.charCodeAt(0)) * qualifiedScenes.length);
                selectedScene = qualifiedScenes[index];
            }
        }

        mapping[charId] = selectedScene;
        
        if (selectedScene === 'scen_3' && charId === 'char_102') {
        } else {
             sceneOccupancy[selectedScene] = (sceneOccupancy[selectedScene] || 0) + 1;
        }
    });

    return mapping;
};

