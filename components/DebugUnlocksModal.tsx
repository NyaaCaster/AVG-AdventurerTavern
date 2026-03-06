import React from 'react';
import { CHARACTERS } from '../data/scenarioData';
import { UNLOCK_STATUS_NAMES } from '../data/unlockConditions';
import { CharacterUnlocks, CharacterStat } from '../types';

interface DebugUnlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterUnlocks: Record<string, CharacterUnlocks>;
  characterStats: Record<string, CharacterStat>;
  onUpdateCharacterAffinity: (charId: string, newAffinity: number) => void;
  onUpdateCharacterUnlock: (charId: string, unlockKey: keyof CharacterUnlocks, value: 0 | 1) => void;
  onSaveGame: () => void;
}

const DebugUnlocksModal: React.FC<DebugUnlocksModalProps> = ({ 
  isOpen, 
  onClose, 
  characterUnlocks, 
  characterStats, 
  onUpdateCharacterAffinity, 
  onUpdateCharacterUnlock, 
  onSaveGame 
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onSaveGame();
    onClose();
  };

  const handleAffinityChange = (charId: string, change: number) => {
    const currentStats = characterStats[charId] || { level: 1, affinity: 0, exp: 0 };
    let newAffinity = currentStats.affinity + change;
    if (change === -999) {
      newAffinity = 0;
    }
    newAffinity = Math.max(0, Math.min(100, newAffinity));
    onUpdateCharacterAffinity(charId, newAffinity);
  };

  const handleUnlockToggle = (charId: string, unlockKey: keyof CharacterUnlocks) => {
    const currentUnlocks = characterUnlocks[charId] || {} as CharacterUnlocks;
    const currentValue = currentUnlocks[unlockKey] || 0;
    const newValue = currentValue === 1 ? 0 : 1;
    onUpdateCharacterUnlock(charId, unlockKey, newValue);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm pointer-events-auto animate-fadeIn" onClick={handleClose}>
        <div className="bg-[#0c0c0c] border border-slate-400/50 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-[0_25px_50px_rgba(0,0,0,0.5)] font-mono" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1a1a1a] rounded-t-lg">
                <h3 className="text-base md:text-lg font-bold text-emerald-400 flex items-center gap-2"><i className="fa-solid fa-unlock"></i> 角色解锁状态 (Debug)</h3>
                <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 transition-colors"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar bg-[#0c0c0c] rounded-b-lg space-y-6">
                {Object.values(CHARACTERS).filter(character => character.id !== 'char_1').map(character => {
                    const unlocks = characterUnlocks[character.id] || {} as CharacterUnlocks;
                    const stats = characterStats[character.id] || { level: 1, affinity: 0, exp: 0 };
                    
                    return (
                        <div key={character.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded">
                            <div className="font-bold text-emerald-400 text-sm mb-3 flex justify-between items-center">
                                <span>{character.name}</span>
                                <span className="text-slate-500 text-xs">{character.id}</span>
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-slate-400 text-xs mb-2">好感度: <span className="text-yellow-400">{stats.affinity}/100</span></div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleAffinityChange(character.id, -999)}
                                        className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-500/20 hover:bg-red-900/50 transition-colors"
                                    >
                                        清零
                                    </button>
                                    <button 
                                        onClick={() => handleAffinityChange(character.id, -10)}
                                        className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded border border-orange-500/20 hover:bg-orange-900/50 transition-colors"
                                    >
                                        -10
                                    </button>
                                    <button 
                                        onClick={() => handleAffinityChange(character.id, 10)}
                                        className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-500/20 hover:bg-green-900/50 transition-colors"
                                    >
                                        +10
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="text-slate-400 text-xs mb-2">解锁功能:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(UNLOCK_STATUS_NAMES).map(([key, name]) => {
                                        const unlockKey = key as keyof CharacterUnlocks;
                                        const isUnlocked = unlocks[unlockKey] === 1;
                                        
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleUnlockToggle(character.id, unlockKey)}
                                                className={`px-3 py-2 text-left text-xs rounded border transition-colors ${isUnlocked 
                                                    ? 'bg-emerald-900/30 text-emerald-200 border-emerald-500/20' 
                                                    : 'bg-slate-700/30 text-slate-400 border-slate-600/20 hover:bg-slate-600/40'}
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{name}</span>
                                                    <span className={`text-xs font-bold ${isUnlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                        {isUnlocked ? '开启' : '关闭'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default DebugUnlocksModal;