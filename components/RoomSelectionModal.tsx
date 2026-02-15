
import React from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { CHARACTERS } from '../data/scenarioData';

interface RoomSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sceneId: string, params?: any) => void;
}

const ROOM_MAPPING = [
  { roomNo: '101', charId: 'char_101' },
  { roomNo: '102', charId: 'char_102' },
  { roomNo: '103', charId: 'char_103' },
  { roomNo: '104', charId: 'char_104' },
  { roomNo: '105', charId: 'char_105' },
  { roomNo: '106', charId: 'char_106' },
  { roomNo: '107', charId: 'char_107' },
  { roomNo: '108', charId: 'char_108' },
  { roomNo: '109', charId: 'char_109' },
  { roomNo: '110', charId: 'char_110' },
  { roomNo: '111', charId: 'char_111' },
];

// Temporarily absent characters as per requirement
const ABSENT_CHARACTERS = ['char_108', 'char_110', 'char_111'];

const RoomSelectionModal: React.FC<RoomSelectionModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleRoomClick = (charId?: string) => {
    if (charId) {
      onNavigate('scen_2', { target: charId });
    }
    onClose();
  };

  const handleMyRoomClick = () => {
    onNavigate('scen_2', { target: 'user' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-[#2c241b] border-[3px] border-[#5c4d45] rounded-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
        style={{
            backgroundImage: `url(${resolveImgPath('img/bg/AdventurerTavern/wood_texture_dark.png')}), linear-gradient(to bottom, #2c241b, #1a1512)`,
            backgroundBlendMode: 'overlay'
        }}
      >
        {/* Header */}
        <div className="bg-[#382b26] border-b border-[#9b7a4c]/50 py-4 px-6 flex justify-between items-center shadow-md relative z-10 shrink-0">
            <h2 className="text-[#f0e6d2] font-bold text-xl tracking-[0.2em] flex items-center gap-3">
                <i className="fa-solid fa-key text-[#9b7a4c]"></i>
                客房钥匙架
            </h2>
            <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9b7a4c] hover:text-[#f0e6d2] transition-colors"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        {/* Room Grid */}
        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                
                {/* My Room Card */}
                <div 
                    onClick={handleMyRoomClick}
                    className="aspect-[4/3] bg-[#3d3226] border-2 border-[#9b7a4c] rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform group relative flex flex-col items-center justify-center overflow-hidden"
                >
                    <div className="absolute top-2 left-2 text-[#9b7a4c] opacity-50 group-hover:opacity-100 transition-opacity">
                        <i className="fa-solid fa-house-user"></i>
                    </div>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#9b7a4c]/50 overflow-hidden mb-2 shadow-lg group-hover:border-[#f0e6d2] transition-colors bg-black/30">
                         {/* Placeholder for User Avatar if available, or just icon */}
                         <img src={resolveImgPath('img/face/1.png')} alt="User" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[#f0e6d2] font-bold text-sm md:text-base tracking-widest group-hover:text-amber-400 transition-colors bg-black/40 px-3 py-0.5 rounded-full border border-[#9b7a4c]/30">
                        自室
                    </span>
                </div>

                {/* Guest Rooms */}
                {ROOM_MAPPING.map(room => {
                    const char = CHARACTERS[room.charId];
                    const isAbsent = ABSENT_CHARACTERS.includes(room.charId);
                    const isOccupied = char && !isAbsent;

                    return (
                        <div 
                            key={room.roomNo}
                            onClick={() => isOccupied ? handleRoomClick(room.charId) : null}
                            className={`
                                aspect-[4/3] rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] relative flex flex-col items-center justify-center transition-all duration-300
                                ${isOccupied 
                                    ? 'bg-[#2a2320] border-2 border-[#8c7b70] cursor-pointer hover:border-[#9b7a4c] hover:bg-[#382b26] hover:-translate-y-1' 
                                    : 'bg-[#1a1512] border border-[#3d3226] opacity-80 cursor-default'}
                            `}
                        >
                            {/* Hook visuals */}
                            <div className="absolute -top-1.5 w-3 h-3 rounded-full bg-[#1a1512] border border-[#5c4d45] shadow-sm z-10"></div>

                            {isOccupied ? (
                                <>
                                    {/* Avatar Display */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#5c4d45] overflow-hidden shadow-lg group-hover:border-[#9b7a4c] transition-colors relative bg-black/30">
                                        <img 
                                            src={resolveImgPath(char.avatarUrl || '')} 
                                            alt={char.name} 
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Status Indicator (Optional) */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-black shadow-sm" title="入住中"></div>
                                    </div>
                                    <div className="mt-2 text-[#9b7a4c] text-xs font-bold bg-black/60 px-2 py-0.5 rounded tracking-wider truncate max-w-[90%] text-center">
                                        {char.name}
                                    </div>
                                    {/* Room Number Watermark */}
                                    <div className="absolute top-1 right-2 text-[#5c4d45] text-[10px] font-mono opacity-50">
                                        {room.roomNo}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Empty Room Number Display */}
                                    <div className="text-[#3d3226] font-mono text-3xl md:text-4xl font-bold tracking-widest drop-shadow-[0_1px_1px_rgba(255,255,255,0.05)] select-none">
                                        {room.roomNo}
                                    </div>
                                    <div className="text-[#3d3226] text-[10px] mt-1 font-bold uppercase tracking-widest opacity-60">
                                        空室
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionModal;
