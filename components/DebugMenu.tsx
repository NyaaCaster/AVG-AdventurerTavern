import React from 'react';
import { CharacterUnlocks, SceneId } from '../types';

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSchedules: () => void;
  onOpenResources: () => void;
  onOpenUnlocks: () => void;
}

const DebugMenu: React.FC<DebugMenuProps> = ({
  isOpen,
  onClose,
  onOpenSchedules,
  onOpenResources,
  onOpenUnlocks
}) => {

  const handleButtonClick = (e: React.MouseEvent, openModal: () => void) => {
    e.stopPropagation();
    openModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 z-[60] flex flex-col gap-2 bg-black/80 backdrop-blur p-2 rounded border border-yellow-500/30 shadow-lg pointer-events-auto animate-fadeIn">
      <button
        onClick={(e) => handleButtonClick(e, onOpenSchedules)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
      >
        <i className="fa-solid fa-calendar-days"></i> 角色分布
      </button>
      <button
        onClick={(e) => handleButtonClick(e, onOpenResources)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
      >
        <i className="fa-solid fa-screwdriver-wrench"></i> 资源调整
      </button>
      <button
        onClick={(e) => handleButtonClick(e, onOpenUnlocks)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
      >
        <i className="fa-solid fa-unlock"></i> 角色解锁状态
      </button>
    </div>
  );
};

export default DebugMenu;
