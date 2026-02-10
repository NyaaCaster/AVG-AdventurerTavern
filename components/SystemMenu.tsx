
import React from 'react';
import { ConfigTab } from '../types';

interface SystemMenuProps {
  onLoadGame?: () => void;
  onOpenSettings: (tab?: ConfigTab) => void;
  onBackToMenu: () => void;
  onDebug?: () => void;
  showDebug?: boolean;
}

const SystemMenu: React.FC<SystemMenuProps> = ({ onLoadGame, onOpenSettings, onBackToMenu, onDebug, showDebug }) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-3 pointer-events-auto">
      <button 
        onClick={onBackToMenu} 
        className="w-10 h-10 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full border border-white/20 backdrop-blur-md transition-all" 
        title="返回标题画面"
      >
        <i className="fa-solid fa-house"></i>
      </button>
      
      {showDebug && (
        <button 
            onClick={onDebug}
            className="w-10 h-10 flex items-center justify-center bg-black/50 text-yellow-500/70 hover:text-yellow-400 hover:bg-black/70 rounded-full border border-yellow-500/20 backdrop-blur-md transition-all"
            title="Debug Menu"
        >
            <i className="fa-solid fa-bug"></i>
        </button>
      )}

      <button 
        onClick={() => onOpenSettings()} 
        className="w-10 h-10 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full border border-white/20 backdrop-blur-md transition-all"
        title="系统设置"
      >
        <i className="fa-solid fa-gear"></i>
      </button>
      <button 
        onClick={() => onLoadGame?.()} 
        className="w-10 h-10 flex items-center justify-center bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-full border border-white/20 backdrop-blur-md transition-all"
        title="载入进度"
      >
        <i className="fa-solid fa-folder-open"></i>
      </button>
    </div>
  );
};

export default SystemMenu;
