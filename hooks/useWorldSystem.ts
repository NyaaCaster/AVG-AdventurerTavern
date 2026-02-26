import { useState, useRef, useEffect, useMemo } from 'react';
import { WorldState, SceneId } from '../types';
import { calculateWorldState, calculateCharacterLocations, getSceneDisplayName } from '../utils/gameLogic';
import { fetchWeatherData } from '../services/weatherService';
import { CHARACTERS } from '../data/scenarioData';

export const useWorldSystem = (sceneLevels: Record<string, number>, initialData?: any) => {
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
        // 浣跨敤瀛樻。鐨勬椂闂磋绠椾綅缃?        return calculateCharacterLocations(initialData.worldState.period, initialData.worldState.dateStr, initialData.worldState.timeStr, sceneLevels);
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
        // [瑙掕壊绉诲姩绯荤粺] 淇濇寔寮哄埗瀹氫綅锛屼笉鍦ㄥ満鏅垏鎹㈡椂娓呴櫎
        // setForcedLocations({}) 宸茬Щ闄わ紝璁╄鑹茬Щ鍔ㄦ寔缁敓鏁?        
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
      if (currentSceneId === 'scen_2') {
          if (sceneParams?.target === 'user') return false; 
          if (sceneParams?.target) return char.id === sceneParams.target && characterLocations[char.id] === 'scen_2';
          return false; 
      }
      return characterLocations[char.id] === currentSceneId;
  }), [currentSceneId, sceneParams, characterLocations]);

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

