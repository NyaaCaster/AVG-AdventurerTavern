import React, { useState, useEffect } from 'react';
import { GameState, GameSettings, ConfigTab } from './types';
import GameScene, { GameSceneRef } from './components/GameScene';
import ConfigScreen from './components/ConfigScreen';
import TitleScreen from './components/TitleScreen';
import { loadSettings, saveSettings } from './utils/storage';
import { setHDMode } from './utils/imagePath';
import { loadGame } from './services/db'; // Import loadGame

const App: React.FC = () => {
  // 璁剧疆鍒濆娓告垙鐘舵€?  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  // 璁板綍杩涘叆璁剧疆鍓嶇殑鐘舵€侊紝鐢ㄤ簬"杩斿洖"鍔熻兘
  const [previousGameState, setPreviousGameState] = useState<GameState>(GameState.MENU);
  // 璁板綍璁剧疆鐣岄潰鍒濆鍖栨椂搴旈€変腑鐨勬爣绛鹃〉
  const [configInitialTab, setConfigInitialTab] = useState<ConfigTab>('dialogue');

  // 褰撳墠鐧诲綍鐢ㄦ埛ID
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // 褰撳墠瀛樻。妲戒綅ID锛?=鑷姩瀛樻。锛?-3=鎵嬪姩瀛樻。锛?  const [currentSlotId, setCurrentSlotId] = useState<number>(0);

  // 娓告垙璁剧疆鐘舵€侊紝鍒濆鍖栨椂浠庢湰鍦板瓨鍌ㄥ姞杞斤紝骞剁珛鍗冲簲鐢?HD 妯″紡璁剧疆
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
      const settings = loadSettings();
      setHDMode(settings.enableHD);
      return settings;
  });

  // State to hold data loaded from Title Screen
  const [initialSaveData, setInitialSaveData] = useState<any>(null);

  // --- 杞満鍔ㄧ敾鐘舵€佺鐞?---
  const [overlayOpacity, setOverlayOpacity] = useState(0); // 0: 閫忔槑, 1: 鍏ㄩ粦
  const [transitionDuration, setTransitionDuration] = useState(0); // 鍔ㄧ敾鎸佺画鏃堕棿(ms)
  const [isTransitioning, setIsTransitioning] = useState(false); // 鏄惁姝ｅ湪杞満涓?闃绘尅鐐瑰嚮)

  // GameScene Ref for triggering auto-save
  const gameSceneRef = React.useRef<GameSceneRef>(null);

  // 鍦烘櫙鍒囨崲澶勭悊鍑芥暟 (鏍稿績閫昏緫)
  const handleSwitchScene = (targetState: GameState, fadeOutMs: number = 1000, fadeInMs: number = 2000) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // 1. 鍘嬮粦 (Fade Out)
    setTransitionDuration(fadeOutMs);
    setOverlayOpacity(1);

    // 绛夊緟鍘嬮粦鍔ㄧ敾瀹屾垚
    setTimeout(() => {
        // 2. 鍒囨崲搴曞眰鐘舵€?(姝ゆ椂灞忓箷鍏ㄩ粦锛岀敤鎴风湅涓嶅埌璧勬簮鍔犺浇/鏇挎崲杩囩▼)
        setGameState(targetState);

        // 3. 娓愭樉 (Fade In)
        // 绋嶅井寤惰繜涓€甯э紝纭繚 React 瀹屾垚浜嗙粍浠剁殑鍗歌浇鍜屾寕杞?        requestAnimationFrame(() => {
            // 璁剧疆鏂扮殑杩囨浮鏃堕棿
            setTransitionDuration(fadeInMs);
            setOverlayOpacity(0);
            
            // 绛夊緟娓愭樉鍔ㄧ敾瀹屾垚锛屾仮澶嶄氦浜?            setTimeout(() => {
                setIsTransitioning(false);
            }, fadeInMs);
        });
    }, fadeOutMs);
  };

  // 褰撹缃彉鏇存椂锛屼繚瀛樺埌鏈湴骞跺簲鐢ㄥ壇浣滅敤
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setGameSettings(newSettings);
    saveSettings(newSettings);
    setHDMode(newSettings.enableHD); // 鏇存柊鍥剧墖瑙ｆ瀽妯″紡
  };

  const handleUserLogin = (uid: number) => {
      setCurrentUserId(uid);
  };

  const handleTitleLoadGame = async (slotId: number) => {
      if (currentUserId === null) return;
      try {
          const data = await loadGame(currentUserId, slotId);
          if (data) {
              // Restore settings from save if available
              if (data.settings) {
                  handleUpdateSettings(data.settings);
              }
              setInitialSaveData(data);
              setCurrentSlotId(slotId); // 璁板綍褰撳墠妲戒綅
              handleSwitchScene(GameState.PLAYING, 1000, 2000);
          }
      } catch (e) {
          console.error("Load failed", e);
      }
  };

  const handleStartNewGame = () => {
      setInitialSaveData(null); // Ensure fresh start
      setCurrentSlotId(0); // 鏂版父鎴忎娇鐢ㄨ嚜鍔ㄥ瓨妗ｆЫ浣?      handleSwitchScene(GameState.PLAYING, 1000, 2000);
  };

  // 杩涘叆璁剧疆鐣岄潰鐨勫鐞嗗嚱鏁?  const handleOpenConfig = (fromState: GameState, tab: ConfigTab = 'dialogue') => {
    setPreviousGameState(fromState);
    setConfigInitialTab(tab);
    // 鐩存帴鍒囨崲鐘舵€侊紝浣跨敤 ConfigScreen 缁勪欢鑷韩鐨勫姩鐢伙紙绫讳技 DialogueLogModal锛?    setGameState(GameState.CONFIG);
  };
  
  // 浠庤缃晫闈㈣繑鍥?  const handleBackFromConfig = () => {
     // 鐩存帴鍒囨崲鍥炲師鏉ョ殑鐘舵€?     setGameState(previousGameState);

     // 濡傛灉鏄粠娓告垙涓繘鍏ヨ缃苟杩斿洖锛屽垯瑙﹀彂鑷姩淇濆瓨锛堜繚瀛樿缃拰褰撳墠杩涘害锛?     if (previousGameState === GameState.PLAYING && gameSceneRef.current) {
         gameSceneRef.current.saveGame(0);
     }
  };

  // 鍒ゆ柇鍚勫眰鏄惁搴旇鏄剧ず
  // 鑿滃崟灞傦細褰撳墠鏄彍鍗曪紝鎴栬€呭綋鍓嶆槸閰嶇疆涓斿墠涓€涓姸鎬佹槸鑿滃崟
  const showMenu = gameState === GameState.MENU || (gameState === GameState.CONFIG && previousGameState === GameState.MENU);
  // 娓告垙灞傦細褰撳墠鏄父鎴忥紝鎴栬€呭綋鍓嶆槸閰嶇疆涓斿墠涓€涓姸鎬佹槸娓告垙
  const showGame = gameState === GameState.PLAYING || (gameState === GameState.CONFIG && previousGameState === GameState.PLAYING);

  return (
    <div 
        className="relative w-full bg-slate-950 overflow-hidden font-sans selection:bg-cyan-500/30"
        style={{ height: '100dvh' }} // 浣跨敤 100dvh 閫傞厤绉诲姩绔姩鎬佽鍙?    >
      
      {/* 鍏ㄥ眬杞満閬僵灞?*/}
      <div 
        className="absolute inset-0 bg-black z-[9999] pointer-events-none transition-opacity ease-in-out"
        style={{ 
            opacity: overlayOpacity,
            transitionDuration: `${transitionDuration}ms`,
            pointerEvents: isTransitioning ? 'auto' : 'none' // 杞満鏃堕樆鎸＄偣鍑?        }}
      />

      {/* 鏍囬鐣岄潰 */}
      {showMenu && (
        <TitleScreen 
            onLogin={handleUserLogin}
            onStartGame={handleStartNewGame}
            onLoadGame={handleTitleLoadGame} // Pass the specific load handler
            onOpenConfig={() => handleOpenConfig(GameState.MENU, 'api')}
            volume={gameSettings.masterVolume}
            isMuted={gameSettings.isMuted}
            currentUserId={currentUserId}
        />
      )}

      {/* 娓告垙杩涜灞?*/}
      {showGame && currentUserId !== null && (
        <div className="absolute inset-0 z-0 w-full h-full">
            <GameScene 
                ref={gameSceneRef}
                userId={currentUserId}
                currentSlotId={currentSlotId}
                onBackToMenu={() => handleSwitchScene(GameState.MENU, 1000, 2000)}
                onOpenSettings={(tab) => handleOpenConfig(GameState.PLAYING, tab)}
                onSettingsChange={handleUpdateSettings} // Pass handler for in-game loads
                settings={gameSettings}
                initialSaveData={initialSaveData} // Pass loaded data
            />
        </div>
      )}

      {/* 閰嶇疆灞?- 瑕嗙洊鍦ㄩ《灞?*/}
      {gameState === GameState.CONFIG && (
        <div className="absolute inset-0 z-[100]">
            <ConfigScreen 
                settings={gameSettings}
                onUpdateSettings={handleUpdateSettings}
                onBack={handleBackFromConfig}
                initialTab={configInitialTab}
                currentUserId={currentUserId}
            />
        </div>
      )}
    </div>
  );
};

export default App;

