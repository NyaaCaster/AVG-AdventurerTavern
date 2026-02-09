
import React, { useState, useEffect } from 'react';
import { GameState, GameSettings, ConfigTab } from './types';
import GameScene from './components/GameScene';
import ConfigScreen from './components/ConfigScreen';
import TitleScreen from './components/TitleScreen';
import { loadSettings, saveSettings } from './utils/storage';

const App: React.FC = () => {
  // 设置初始游戏状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  // 记录进入设置前的状态，用于"返回"功能
  const [previousGameState, setPreviousGameState] = useState<GameState>(GameState.MENU);
  // 记录设置界面初始化时应选中的标签页
  const [configInitialTab, setConfigInitialTab] = useState<ConfigTab>('dialogue');

  // 游戏设置状态，初始化时从本地存储加载
  const [gameSettings, setGameSettings] = useState<GameSettings>(loadSettings);

  // --- 转场动画状态管理 ---
  const [overlayOpacity, setOverlayOpacity] = useState(0); // 0: 透明, 1: 全黑
  const [transitionDuration, setTransitionDuration] = useState(0); // 动画持续时间(ms)
  const [isTransitioning, setIsTransitioning] = useState(false); // 是否正在转场中(阻挡点击)

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

  // 当设置变更时，保存到本地
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setGameSettings(newSettings);
    saveSettings(newSettings);
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
            onStartGame={() => handleSwitchScene(GameState.PLAYING, 1000, 2000)}
            onLoadGame={() => {}}
            onOpenConfig={() => handleOpenConfig(GameState.MENU, 'api')}
            volume={gameSettings.masterVolume}
            isMuted={gameSettings.isMuted}
        />
      )}

      {/* 游戏进行层 */}
      {showGame && (
        <div className="absolute inset-0 z-0 w-full h-full">
            <GameScene 
                onBackToMenu={() => handleSwitchScene(GameState.MENU, 1000, 2000)}
                onOpenSettings={(tab) => handleOpenConfig(GameState.PLAYING, tab)}
                settings={gameSettings}
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
            />
        </div>
      )}
    </div>
  );
};

export default App;
