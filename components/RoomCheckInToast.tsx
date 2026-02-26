import React, { useEffect, useState } from 'react';
import { resolveImgPath } from '../utils/imagePath';

interface RoomCheckInToastProps {
  characterName: string;
  avatarUrl?: string;
  onComplete: () => void;
}

const RoomCheckInToast: React.FC<RoomCheckInToastProps> = ({ characterName, avatarUrl, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 4000);

    return () => clearTimeout(hideTimer);
  }, []);

  return (
    <div
      className={`
        mb-2 flex items-center gap-3 px-4 py-2.5
        bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-l-4 border-emerald-500 rounded-r shadow-2xl backdrop-blur-sm
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
      `}
    >
      {/* Avatar */}
      <div className="w-10 h-10 flex items-center justify-center bg-[#2c241b] rounded-full border border-emerald-700 overflow-hidden shadow-inner shrink-0">
        {avatarUrl ? (
          <img src={resolveImgPath(avatarUrl)} alt={characterName} className="w-full h-full object-cover" />
        ) : (
          <i className="fa-solid fa-user text-emerald-400 text-lg"></i>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">新住客入住</span>
        <span className="text-[#f0e6d2] font-bold text-sm">
          {characterName} <span className="text-emerald-300 font-normal">已入住旅店</span>
        </span>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden rounded-r pointer-events-none">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-emerald-300/15 to-transparent skew-x-[-25deg] animate-[shine_2s_infinite]"></div>
      </div>
    </div>
  );
};

export default RoomCheckInToast;