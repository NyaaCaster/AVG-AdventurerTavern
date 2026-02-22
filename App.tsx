
import React, { useState, useEffect } from 'react';
import { GameState, GameSettings, ConfigTab } from './types';
import GameScene, { GameSceneRef } from './components/GameScene';
import ConfigScreen from './components/ConfigScreen';
import TitleScreen from './components/TitleScreen';
import { loadSettings, saveSettings } from './utils/storage';
import { setHDMode } from './utils/imagePath';
import { loadGame } from './services/db'; // Import loadGame

const App: React.FC = () => {
  // 设置初始游戏状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  // 记录进入设置前的状态，用于"返回"功能
  const [previousGameState, setPreviousGameState] = useState<GameState>(GameState.MENU);
  // 记录设置界面初始化时应选中的标签页
  const [configInitialTab, setConfigInitialTab] = useState<ConfigTab>('dialogue');

  // 当前登录用户ID
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // 当前存档槽位ID（0=自动存档，1-3=手动存档）
  const [currentSlotId, setCurrentSlotId] = useState<number>(0);

  // 游戏设置状态，初始化时从本地存储加载，并立即应用 HD 模式设置
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
      const settings = loadSettings();
      setHDMode(settings.enableHD);
      return settings;
  });

  // State to hold data loaded from Title Screen
  const [initialSaveData, setInitialSaveData] = useState<any>(null);

  // --- 转场动画状态管理 ---
  const [overlayOpacity, setOverlayOpacity] = useState(0); // 0: 透明, 1: 全黑
  const [transitionDuration, setTransitionDuration] = useState(0); // 动画持续时间(ms)
  const [isTransitioning, setIsTransitioning] = useState(false); // 是否正在转场中(阻挡点击)

  // GameScene Ref for triggering auto-save
  const gameSceneRef = React.useRef<GameSceneRef>(null);

  // 场景切换处理函数 (核心逻辑)
  const handleSwitchScene = (targetState: GameState, fadeOutMs: number = 1000, fadeInMs: number = 2000) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // 1. 压黑 (Fade Out)
    setTransitionDuration(fadeOutMs);
    setOverlayOpacity(1);

    // 等待压黑动画完成
    setTimeout(() => {
        // 2. 切换底层状态 (此时屏幕全黑，用户看不到资源加载/替换过程)
        setGameState(targetState);

        // 3. 渐显 (Fade In)
        // 稍微延迟一帧，确保 React 完成了组件的卸载和挂载
        requestAnimationFrame(() => {
            // 设置新的过渡时间
            setTransitionDuration(fadeInMs);
            setOverlayOpacity(0);
            
            // 等待渐显动画完成，恢复交互
            setTimeout(() => {
                setIsTransitioning(false);
            }, fadeInMs);
        });
    }, fadeOutMs);
  };

  // 当设置变更时，保存到本地并应用副作用
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setGameSettings(newSettings);
    saveSettings(newSettings);
    setHDMode(newSettings.enableHD); // 更新图片解析模式
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
              setCurrentSlotId(slotId); // 记录当前槽位
              handleSwitchScene(GameState.PLAYING, 1000, 2000);
          }
      } catch (e) {
          console.error("Load failed", e);
      }
  };

  const handleStartNewGame = () => {
      setInitialSaveData(null); // Ensure fresh start
      setCurrentSlotId(0); // 新游戏使用自动存档槽位
      handleSwitchScene(GameState.PLAYING, 1000, 2000);
  };

  // 进入设置界面的处理函数
  const handleOpenConfig = (fromState: GameState, tab: ConfigTab = 'dialogue') => {
    setPreviousGameState(fromState);
    setConfigInitialTab(tab);
    // 直接切换状态，使用 ConfigScreen 组件自身的动画（类似 DialogueLogModal）
    setGameState(GameState.CONFIG);
  };
  
  // 从设置界面返回
  const handleBackFromConfig = () => {
     // 直接切换回原来的状态
     setGameState(previousGameState);

     // 如果是从游戏中进入设置并返回，则触发自动保存（保存设置和当前进度）
     if (previousGameState === GameState.PLAYING && gameSceneRef.current) {
         gameSceneRef.current.saveGame(0);
     }
  };

  // 判断各层是否应该显示
  // 菜单层：当前是菜单，或者当前是配置且前一个状态是菜单
  const showMenu = gameState === GameState.MENU || (gameState === GameState.CONFIG && previousGameState === GameState.MENU);
  // 游戏层：当前是游戏，或者当前是配置且前一个状态是游戏
  const showGame = gameState === GameState.PLAYING || (gameState === GameState.CONFIG && previousGameState === GameState.PLAYING);

  return (
    <div 
        className="relative w-full bg-slate-950 overflow-hidden font-sans selection:bg-cyan-500/30"
        style={{ height: '100dvh' }} // 使用 100dvh 适配移动端动态视口
    >
      
      {/* 全局转场遮罩层 */}
      <div 
        className="absolute inset-0 bg-black z-[9999] pointer-events-none transition-opacity ease-in-out"
        style={{ 
            opacity: overlayOpacity,
            transitionDuration: `${transitionDuration}ms`,
            pointerEvents: isTransitioning ? 'auto' : 'none' // 转场时阻挡点击
        }}
      />

      {/* 标题界面 */}
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

      {/* 游戏进行层 */}
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

      {/* 配置层 - 覆盖在顶层 */}
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
