mport React from 'react';
import { CHARACTERS } from '../data/scenarioData';
import { SCENE_NAMES } from '../utils/gameConstants';
import { SceneId } from '../types';

interface DebugSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  characterLocations: Record<string, SceneId>;
}

const DebugSchedulesModal: React.FC<DebugSchedulesModalProps> = ({ isOpen, onClose, periodLabel, characterLocations }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm pointer-events-auto animate-fadeIn" onClick={onClose}>
        <div className="bg-[#0c0c0c] border border-slate-400/50 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-[0_25px_50px_rgba(0,0,0,0.5)] font-mono" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1a1a1a] rounded-t-lg">
                <h3 className="text-base md:text-lg font-bold text-yellow-500 flex items-center gap-2"><i className="fa-solid fa-clock"></i> Current Location Distribution ({periodLabel})</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar bg-[#0c0c0c] rounded-b-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(SCENE_NAMES).map(key => {
                    const sid = key as SceneId;
                    const chars = Object.values(CHARACTERS).filter(c => c.id !== 'char_1' && characterLocations[c.id] === sid);
                    return (
                        <div key={sid} className="bg-slate-800/50 border border-slate-700 p-3 rounded">
                            <div className="font-bold text-slate-300 text-sm mb-2 flex justify-between items-center">
                                <span>{SCENE_NAMES[sid]}</span><span className="text-slate-500 text-xs">{sid}</span>
                            </div>
                            <div className="min-h-[20px] flex flex-wrap gap-1">
                                {chars.length > 0 ? chars.map(c => <span key={c.id} className="px-1.5 py-0.5 bg-indigo-900/50 text-indigo-200 text-xs rounded border border-indigo-500/20">{c.name}</span>) : <span className="text-slate-600 text-xs italic">Empty</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
};

export default DebugSchedulesModal;

