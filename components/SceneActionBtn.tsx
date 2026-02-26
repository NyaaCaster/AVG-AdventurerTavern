import React, { useState, useEffect } from 'react';

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
  // 鐘舵€佺鐞嗭細妫€娴嬫槸鍚︿负绉诲姩绔紝浠ュ強绉诲姩绔殑灞曞紑鐘舵€?  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 鐩戝惉灞忓箷灏哄鍙樺寲
  useEffect(() => {
    const checkMobile = () => {
      // 浣跨敤 768px 浣滀负绉诲姩绔?妗岄潰绔垎鐣岀嚎 (Tailwind md)
      setIsMobile(window.innerWidth < 768);
    };
    
    // 鍒濆鍖栨鏌?    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // 鐢佃剳/骞虫澘妯″紡锛氭鏌?disabled 鍚庣洿鎺ヨЕ鍙?    if (!isMobile) {
      if (disabled) return;
      onClick();
      return;
    }

    // 鎵嬫満妯″紡锛?    // 濡傛灉鏄敹缂╃姸鎬侊紝绗竴娆＄偣鍑绘€绘槸鍏佽灞曞紑锛堟棤璁烘槸鍚?disabled锛?    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    // 濡傛灉宸茬粡灞曞紑锛屽垯妫€鏌?disabled 鐘舵€佸悗瑙﹀彂鍔ㄤ綔
    if (disabled) return;
    onClick();
  };

  // 鎵嬫満妯″紡涓嬬殑榧犳爣鎮仠閫昏緫
  const handleMouseEnter = () => {
    if (isMobile) setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) setIsExpanded(false);
  };
  
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

  // 璁＄畻鍔ㄦ€佹牱寮?  // Desktop: 濮嬬粓 w-64
  // Mobile: 鏀剁缉鏃?w-14 (鍥炬爣瀹藉害), 灞曞紑鏃?w-64
  const widthClass = !isMobile 
    ? 'w-64' 
    : (isExpanded ? 'w-64' : 'w-14');

  // 鍐呭鏄鹃殣鎺у埗
  const isContentVisible = !isMobile || isExpanded;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={!isMobile && disabled}
      className={`
        ${widthClass}
        py-3 px-0 mb-2 relative group transition-all duration-300 ease-in-out
        border-l-4 backdrop-blur-sm text-left overflow-hidden
        ${getBorderColor()}
        ${getBgColor()}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
    >
      <div className={`flex items-center h-full ${isContentVisible ? 'justify-between px-5' : 'justify-center px-0'}`}>
        
        {/* 宸︿晶锛氬浘鏍囦笌鏂囧瓧 */}
        <div className={`flex flex-col flex-1 overflow-hidden whitespace-nowrap ${isContentVisible ? '' : 'items-center'}`}>
           <span className={`text-sm md:text-base font-bold tracking-wide ${variant === 'primary' ? 'text-cyan-100' : 'text-[#f0e6d2]'} group-hover:text-white transition-colors flex items-center ${isContentVisible ? '' : 'justify-center w-full'}`}>
             {/* 鍥炬爣锛氬缁堟樉绀猴紝浣嗗湪鏀剁缉妯″紡涓嬪眳涓?*/}
             {icon && (
                <i className={`fa-solid ${icon} text-center opacity-80 w-5 transition-all duration-300 ${isContentVisible ? 'mr-2' : 'mr-0 text-lg'}`}></i>
             )}
             
             {/* 鎸夐挳鏂囧瓧锛氫粎鍦ㄥ睍寮€鏃舵樉绀?*/}
             <span className={`transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 w-0'}`}>
               {label}
             </span>
           </span>

           {/* 瀛愭爣棰橈細浠呭湪灞曞紑鏃舵樉绀?*/}
           {subLabel && (
             <span className={`text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 ml-7 group-hover:text-slate-300 transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 hidden'}`}>
               {subLabel}
             </span>
           )}
        </div>

        {/* 鍙充晶绠ご锛氫粎鍦ㄥ睍寮€鏃舵樉绀?*/}
        <i className={`fa-solid fa-caret-right text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 w-0'}`}></i>
      </div>
    </button>
  );
};

export default SceneActionBtn;

