import React, { useState } from 'react';
import DebugSchedulesModal from './DebugSchedulesModal';
import DebugResourceModal from './DebugResourceModal';
import DebugUnlocksModal from './DebugUnlocksModal';
import { CharacterUnlocks, SceneId } from '../types';

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  characterLocations: Record<string, SceneId>;
  gold: number;
  inventory: Record<string, number>;
  onUpdateGold: (newGold: number) => void;
  onUpdateInventory: (itemId: string, newCount: number) => void;
  characterUnlocks: Record<string, CharacterUnlocks>;
}

const DebugMenu: React.FC<DebugMenuProps> = ({
  isOpen,
  onClose,
  periodLabel,
  characterLocations,
  gold,
  inventory,
  onUpdateGold,
  onUpdateInventory,
  characterUnlocks
}) => {
  const [isScheduleViewerOpen, setIsScheduleViewerOpen] = useState(false);
  const [isResourceDebugOpen, setIsResourceDebugOpen] = useState(false);
  const [isUnlocksDebugOpen, setIsUnlocksDebugOpen] = useState(false);

  if (!isOpen) return null;

  const handleButtonClick = (e: React.MouseEvent, openModal: () => void) => {
    e.stopPropagation();
    openModal();
  };

  return (
    <>
      <div className="absolute top-16 right-4 z-[60] flex flex-col gap-2 bg-black/80 backdrop-blur p-2 rounded border border-yellow-500/30 shadow-lg pointer-events-auto animate-fadeIn">
        <button
          onClick={(e) => handleButtonClick(e, () => setIsScheduleViewerOpen(true))}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
        >
          <i className="fa-solid fa-calendar-days"></i> Schedules
        </button>
        <button
          onClick={(e) => handleButtonClick(e, () => setIsResourceDebugOpen(true))}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
        >
          <i className="fa-solid fa-screwdriver-wrench"></i> 资源调整
        </button>
        <button
          onClick={(e) => handleButtonClick(e, () => setIsUnlocksDebugOpen(true))}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 text-sm font-mono border border-slate-600 rounded transition-colors text-left flex items-center gap-2"
        >
          <i className="fa-solid fa-unlock"></i> 角色解锁状态
        </button>
      </div>

      <DebugSchedulesModal
        isOpen={isScheduleViewerOpen}
        onClose={() => setIsScheduleViewerOpen(false)}
        periodLabel={periodLabel}
        characterLocations={characterLocations}
      />

      <DebugResourceModal
        isOpen={isResourceDebugOpen}
        onClose={() => setIsResourceDebugOpen(false)}
        gold={gold}
        inventory={inventory}
        onUpdateGold={onUpdateGold}
        onUpdateInventory={onUpdateInventory}
      />

      <DebugUnlocksModal
        isOpen={isUnlocksDebugOpen}
        onClose={() => setIsUnlocksDebugOpen(false)}
        characterUnlocks={characterUnlocks}
      />
    </>
  );
};

export default DebugMenu;
