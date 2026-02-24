import React from 'react';
import { CHARACTERS } from '../data/scenarioData';
import { UNLOCK_STATUS_NAMES } from '../data/unlockConditions';
import { CharacterUnlocks } from '../types';

interface DebugUnlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterUnlocks: Record<string, CharacterUnlocks>;
}

const DebugUnlocksModal: React.FC<DebugUnlocksModalProps> = ({ isOpen, onClose, characterUnlocks }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm pointer-events-auto animate-fadeIn" onClick={onClose}>
        <div className="bg-[#0c0c0c] border border-slate-400/50 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-[0_25px_50px_rgba(0,0,0,0.5)] font-mono" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1a1a1a] rounded-t-lg">
                <h3 className="text-base md:text-lg font-bold text-emerald-400 flex items-center gap-2"><i className="fa-solid fa-unlock"></i> 角色解锁状态 (Debug)</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar bg-[#0c0c0c] rounded-b-lg space-y-4">
                {Object.values(CHARACTERS).map(character => {
                    const unlocks = characterUnlocks[character.id];
                    if (!unlocks) return null;
                    
                    const unlockedKeys = Object.entries(unlocks)
                        .filter(([_, value]) => value === 1)
                        .map(([key, _]) => key as keyof CharacterUnlocks);
                    
                    if (unlockedKeys.length === 0) return null;
                    
                    return (
                        <div key={character.id} className="bg-slate-800/50 border border-slate-700 p-3 rounded">
                            <div className="font-bold text-emerald-400 text-sm mb-2 flex justify-between items-center">
                                <span>{character.name}</span>
                                <span className="text-slate-500 text-xs">{character.id}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {unlockedKeys.map(key => (
                                    <span key={key} className="px-1.5 py-0.5 bg-emerald-900/30 text-emerald-200 text-xs rounded border border-emerald-500/20">
                                        {UNLOCK_STATUS_NAMES[key]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {Object.values(CHARACTERS).every(character => {
                    const unlocks = characterUnlocks[character.id];
                    if (!unlocks) return true;
                    return Object.values(unlocks).every(value => value === 0);
                }) && (
                    <div className="text-center text-slate-500 text-sm py-8">
                        <i className="fa-solid fa-lock text-2xl mb-2"></i>
                        <p>暂无已解锁的功能</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default DebugUnlocksModal;