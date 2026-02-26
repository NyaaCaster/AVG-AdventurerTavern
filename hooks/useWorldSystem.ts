
import { useState, useRef, useEffect, useMemo } from 'react';
import { WorldState, SceneId } from '../types';
import { calculateWorldState, calculateCharacterLocations, getSceneDisplayName } from '../utils/gameLogic';
import { fetchWeatherData } from '../services/weatherService';
import { CHARACTERS } from '../data/scenarioData';

export const useWorldSystem = (sceneLevels: Record<string, number>, initialData?: any, checkedInCharacters?: string[]) => {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>(() => {
    if (initialData?.currentSceneId) {
        return initialData.currentSceneId as SceneId;
    }
    return 'scen_1';
  });
  const [sceneParams, setSceneParams] = useState<any>({});
  
  const [worldState, setWorldState] = useState<WorldState>(() => {
    if (initialData?.worldState) {
        return initialData.worldState;
    }
    return calculateWorldState(getSceneDisplayName('scen_1'));
  });
  const [characterLocations, setCharacterLocations] = useState<Record<string, string>>(() => {
    if (initialData?.worldState) {
        // 使用存档的时间计算位置
        return calculateCharacterLocations(initialData.worldState.period, initialData.worldState.dateStr, initialData.worldState.timeStr, sceneLevels);
    }
    const initialState = calculateWorldState(getSceneDisplayName('scen_1'));
    return calculateCharacterLocations(initialState.period, initialState.dateStr, initialState.timeStr, sceneLevels);
  });
  const [forcedLocations, setForcedLocations] = useState<Record<string, string>>({});
  
  const [transitionOpacity, setTransitionOpacity] = useState(0); 
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  
  const realWeatherDataRef = useRef<{text: string, code: string, temp: string} | null>(null);

  // Weather Sync
  const updateRealWeather = async () => {
      const data = await fetchWeatherData();
      if (data) {
          realWeatherDataRef.current = data;
          setWorldState(prev => ({
              ...prev,
              weather: data.text,
              weatherCode: data.code,
              temp: data.temp
          }));
      }
  };

  useEffect(() => {
      updateRealWeather();
      const checkInterval = setInterval(() => {
          if (new Date().getMinutes() === 0) updateRealWeather();
      }, 60000); 
      return () => clearInterval(checkInterval);
  }, []);

  // Main Time Loop
  useEffect(() => {
    // Initial Calc
    const update = () => {
        const newState = calculateWorldState(getSceneDisplayName(currentSceneId, sceneParams));
        if (realWeatherDataRef.current) {
            newState.weather = realWeatherDataRef.current.text;
            newState.weatherCode = realWeatherDataRef.current.code;
            newState.temp = realWeatherDataRef.current.temp;
        }
        setWorldState(newState);
        const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr, sceneLevels);
        setCharacterLocations({ ...locs, ...forcedLocations });
    };
    update();

    const timer = setInterval(() => {
        setWorldState(prev => {
             const newState = calculateWorldState(prev.sceneName);
             if (realWeatherDataRef.current) {
                 newState.weather = realWeatherDataRef.current.text;
                 newState.weatherCode = realWeatherDataRef.current.code;
                 newState.temp = realWeatherDataRef.current.temp;
             }

             // Location Update on Time Change
             if (newState.timeStr !== prev.timeStr || newState.period !== prev.period) {
                 const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr, sceneLevels);
                 setCharacterLocations({ ...locs, ...forcedLocations });
             }
             return newState;
        });
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, [currentSceneId, sceneParams, forcedLocations, sceneLevels]);

  const handleNavigate = (sceneId: SceneId, params?: any) => {
    if (isSceneTransitioning) return;
    if (sceneId === currentSceneId && JSON.stringify(params) === JSON.stringify(sceneParams)) return;

    setIsSceneTransitioning(true);
    setTransitionOpacity(1); 

    setTimeout(() => {
        setCurrentSceneId(sceneId);
        setSceneParams(params || {});
        // [角色移动系统] 保持强制定位，不在场景切换时清除
        // setForcedLocations({}) 已移除，让角色移动持续生效
        
        // Immediate State Update during blind spot
        const newSceneName = getSceneDisplayName(sceneId, params);
        const newState = calculateWorldState(newSceneName);
        if (realWeatherDataRef.current) {
            newState.weather = realWeatherDataRef.current.text;
            newState.weatherCode = realWeatherDataRef.current.code;
            newState.temp = realWeatherDataRef.current.temp;
        }
        setWorldState(newState);
        
        const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr, sceneLevels);
        setCharacterLocations({ ...locs, ...forcedLocations });

        setTimeout(() => {
            setTransitionOpacity(0); 
            setTimeout(() => {
                setIsSceneTransitioning(false);
            }, 500);
        }, 100);
    }, 500);
  };

  const presentCharacters = useMemo(() => Object.values(CHARACTERS).filter(char => {
      // 未入住的角色不出现在任何场景
      if (checkedInCharacters && !checkedInCharacters.includes(char.id)) return false;
      if (currentSceneId === 'scen_2') {
          if (sceneParams?.target === 'user') return false; 
          if (sceneParams?.target) return char.id === sceneParams.target && characterLocations[char.id] === 'scen_2';
          return false; 
      }
      return characterLocations[char.id] === currentSceneId;
  }), [currentSceneId, sceneParams, characterLocations, checkedInCharacters]);

  return {
      currentSceneId, setCurrentSceneId,
      sceneParams, setSceneParams,
      worldState, setWorldState,
      characterLocations, setCharacterLocations,
      forcedLocations, setForcedLocations,
      presentCharacters,
      handleNavigate,
      isSceneTransitioning,
      transitionOpacity
  };
};
