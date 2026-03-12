import React from 'react';
import { PlayerCommand } from '../../../battle-system/player-commands';
import { Faction } from '../../../battle-system/types';

interface CommandMenuProps {
  isPlayerTurn: boolean;
  currentTurnUnitFaction: Faction | null;
  selectedCommand: PlayerCommand | null;
  onCommandSelect: (command: PlayerCommand) => void;
  onSkillClick: () => void;
  onEscapeClick: () => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({
  isPlayerTurn,
  currentTurnUnitFaction,
  selectedCommand,
  onCommandSelect,
  onSkillClick,
  onEscapeClick
}) => {
  if (!isPlayerTurn || currentTurnUnitFaction !== Faction.PLAYER) {
    return null;
  }
  
  const commands = [
    { cmd: PlayerCommand.ATTACK, icon: 'fa-sword', label: '攻击', onClick: () => onCommandSelect(PlayerCommand.ATTACK) },
    { cmd: PlayerCommand.SKILL, icon: 'fa-wand-magic-sparkles', label: '技能', onClick: onSkillClick },
    { cmd: PlayerCommand.ITEM, icon: 'fa-bag-shopping', label: '道具', onClick: () => {}, disabled: true },
    { cmd: PlayerCommand.GUARD, icon: 'fa-shield-halved', label: '防御', onClick: () => onCommandSelect(PlayerCommand.GUARD) },
    { cmd: 'TALK', icon: 'fa-comments', label: '对话', onClick: () => {}, disabled: true },
    { cmd: PlayerCommand.ESCAPE, icon: 'fa-person-running', label: '逃跑', onClick: onEscapeClick }
  ];
  
  return (
    <div className="flex justify-center">
      <div className="bg-[#e8dfd1] rounded-lg border-2 border-[#9b7a4c] p-1.5 sm:p-2 md:p-3 shadow-lg">
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
          {commands.map(({ cmd, icon, label, onClick, disabled }) => (
            <button
              key={cmd}
              onClick={onClick}
              disabled={disabled}
              className={`flex flex-col items-center justify-center w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-14 rounded-lg border-2 transition-all shadow-md ${
                disabled
                  ? 'bg-[#d6cbb8] text-[#8c7b70] border-[#c7bca8] cursor-not-allowed opacity-60'
                  : 'bg-[#382b26] text-[#f0e6d2] border-[#9b7a4c] hover:bg-[#4a3b32] hover:scale-105'
              } ${selectedCommand === cmd ? 'ring-2 ring-[#fcd34d]' : ''}`}
            >
              <i className={`fa-solid ${icon} text-xs sm:text-sm md:text-base mb-0.5`} />
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;
