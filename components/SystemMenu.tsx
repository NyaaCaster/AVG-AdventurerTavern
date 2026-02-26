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
  const [showConfirm, setShowConfirm] = useState(false);

  const btnClass = (isDebug = false) => `
    w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg
    ${isDebug 
      ? 'bg-black/50 text-yellow-500/70 hover:text-yellow-400 hover:bg-black/70 border border-yellow-500/20' 
      : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70 border border-white/20'
    }
  `;

  const handleBackToMenuClick = () => {
    setIsOpen(false);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onBackToMenu();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {!isOpen ? (
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button 
            onClick={() => setIsOpen(true)} 
            className={btnClass()} 
            title="鑿滃崟"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      ) : (
        <div className="absolute top-4 right-4 z-50 pointer-events-auto animate-fadeIn">
          {/* Matrix Container: 2-column Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md shadow-2xl">
             
             {/* Row 1 Col 1: Settings */}
             <button 
                onClick={() => onOpenSettings()} 
                className={btnClass()}
                title="绯荤粺璁剧疆"
              >
                <i className="fa-solid fa-gear"></i>
              </button>

             {/* Row 1 Col 2: Collapse (Top Right) */}
             <button 
                onClick={() => setIsOpen(false)} 
                className={btnClass()} 
                title="鏀惰捣"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

             {/* Row 2 Col 1: Save */}
             <button 
                onClick={() => { setIsOpen(false); onSaveGame?.(); }} 
                className={btnClass()}
                title="淇濆瓨杩涘害"
              >
                <i className="fa-solid fa-floppy-disk"></i>
              </button>

             {/* Row 2 Col 2: Load */}
             <button 
                onClick={() => { setIsOpen(false); onLoadGame?.(); }} 
                className={btnClass()}
                title="杞藉叆杩涘害"
              >
                <i className="fa-solid fa-folder-open"></i>
              </button>

             {/* Row 3 Col 1: Home */}
             <button 
                onClick={handleBackToMenuClick} 
                className={btnClass()} 
                title="杩斿洖鏍囬鐢婚潰"
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
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center animate-fadeIn pointer-events-auto">
          <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center">
            <div className="text-amber-500 text-3xl mb-4">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <p className="text-slate-200 text-base mb-8 text-center leading-relaxed">
              灏氭湭瀛樻。锛屾槸鍚︽斁寮冨綋鍓嶈繘搴﹁繑鍥炴爣棰樼敾闈紵
            </p>
            <div className="flex gap-4 w-full justify-center">
              <button 
                onClick={handleCancel}
                className="bg-slate-800 text-slate-300 border border-slate-700 px-6 py-2.5 text-sm rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex-1"
              >
                鍙栨秷
              </button>
              <button 
                onClick={handleConfirm}
                className="bg-amber-700 text-white px-6 py-2.5 font-bold rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-amber-600 transition-colors flex-1"
              >
                纭畾
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SystemMenu;

