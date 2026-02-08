
import React from 'react';

interface SceneActionBtnProps {
  label: string;
  icon?: string;
  onClick: () => void;
  subLabel?: string;
  variant?: 'default' | 'primary' | 'danger' | 'special';
  disabled?: boolean;
}

const SceneActionBtn: React.FC<SceneActionBtnProps> = ({ 
  label, 
  icon, 
  onClick, 
  subLabel,
  variant = 'default',
  disabled = false
}) => {
  
  const getBorderColor = () => {
    switch (variant) {
      case 'primary': return 'border-cyan-500 hover:border-cyan-300';
      case 'danger': return 'border-red-500 hover:border-red-400';
      case 'special': return 'border-purple-500 hover:border-purple-300';
      default: return 'border-[#9b7a4c] hover:border-amber-400';
    }
  };

  const getBgColor = () => {
     switch(variant) {
        case 'primary': return 'bg-cyan-950/70 hover:bg-cyan-900/80';
        default: return 'bg-black/60 hover:bg-black/80';
     }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-64 py-3 px-5 mb-2 relative group transition-all duration-300
        border-l-4 backdrop-blur-sm text-left
        ${getBorderColor()}
        ${getBgColor()}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
           <span className={`text-sm md:text-base font-bold tracking-wide ${variant === 'primary' ? 'text-cyan-100' : 'text-[#f0e6d2]'} group-hover:text-white transition-colors`}>
             {icon && <i className={`fa-solid ${icon} mr-2 w-5 text-center opacity-80`}></i>}
             {label}
           </span>
           {subLabel && (
             <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 ml-7 group-hover:text-slate-300">
               {subLabel}
             </span>
           )}
        </div>
        <i className="fa-solid fa-caret-right text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"></i>
      </div>
    </button>
  );
};

export default SceneActionBtn;
