
import React, { useState } from 'react';
import { ConfigTab } from '../types';

interface SystemMenuProps {
  onLoadGame?: () => void;
  onSaveGame?: () => void; // New prop
  onOpenSettings: (tab?: ConfigTab) => void;
  onBackToMenu: () => void;
  onDebug?: () => void;
  showDebug?: boolean;
}

const SystemMenu: React.FC<SystemMenuProps> = ({ onLoadGame, onSaveGame, onOpenSettings, onBackToMenu, onDebug, showDebug }) => {
  const [isOpen, setIsOpen] = useState(false);

  const btnClass = (isDebug = false) => `
    w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg
    ${isDebug 
      ? 'bg-black/50 text-yellow-500/70 hover:text-yellow-400 hover:bg-black/70 border border-yellow-500/20' 
      : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70 border border-white/20'
    }
  `;

  if (!isOpen) {
    return (
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button 
          onClick={() => setIsOpen(true)} 
          className={btnClass()} 
          title="菜单"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto animate-fadeIn">
      {/* Matrix Container: 2-column Grid */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md shadow-2xl">
         
         {/* Row 1 Col 1: Settings */}
         <button 
            onClick={() => onOpenSettings()} 
            className={btnClass()}
            title="系统设置"
          >
            <i className="fa-solid fa-gear"></i>
          </button>

         {/* Row 1 Col 2: Collapse (Top Right) */}
         <button 
            onClick={() => setIsOpen(false)} 
            className={btnClass()} 
            title="收起"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

         {/* Row 2 Col 1: Save */}
         <button 
            onClick={() => { setIsOpen(false); onSaveGame?.(); }} 
            className={btnClass()}
            title="保存进度"
          >
            <i className="fa-solid fa-floppy-disk"></i>
          </button>

         {/* Row 2 Col 2: Load */}
         <button 
            onClick={() => { setIsOpen(false); onLoadGame?.(); }} 
            className={btnClass()}
            title="载入进度"
          >
            <i className="fa-solid fa-folder-open"></i>
          </button>

         {/* Row 3 Col 1: Home */}
         <button 
            onClick={onBackToMenu} 
            className={btnClass()} 
            title="返回标题画面"
          >
            <i className="fa-solid fa-house"></i>
          </button>

         {/* Row 3: Debug (Conditional) - If debug is shown, it takes next slot or spans */}
         {showDebug && (
            <button 
                onClick={onDebug}
                className={btnClass(true)}
                title="Debug Menu"
            >
                <i className="fa-solid fa-bug"></i>
            </button>
         )}
      </div>
    </div>
  );
};

export default SystemMenu;
