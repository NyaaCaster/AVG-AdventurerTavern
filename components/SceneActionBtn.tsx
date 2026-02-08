
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
  // 状态管理：检测是否为移动端，以及移动端的展开状态
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 监听屏幕尺寸变化
  useEffect(() => {
    const checkMobile = () => {
      // 使用 768px 作为移动端/桌面端分界线 (Tailwind md)
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始化检查
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    // 电脑/平板模式：直接触发
    if (!isMobile) {
      onClick();
      return;
    }

    // 手机模式：
    // 如果已经展开，则触发动作
    if (isExpanded) {
      onClick();
    } else {
      // 如果是收缩状态，点击视为"展开"
      setIsExpanded(true);
    }
  };

  // 手机模式下的鼠标悬停逻辑
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

  // 计算动态样式
  // Desktop: 始终 w-64
  // Mobile: 收缩时 w-14 (图标宽度), 展开时 w-64
  const widthClass = !isMobile 
    ? 'w-64' 
    : (isExpanded ? 'w-64' : 'w-14');

  // 内容显隐控制
  const isContentVisible = !isMobile || isExpanded;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
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
        
        {/* 左侧：图标与文字 */}
        <div className={`flex flex-col flex-1 overflow-hidden whitespace-nowrap ${isContentVisible ? '' : 'items-center'}`}>
           <span className={`text-sm md:text-base font-bold tracking-wide ${variant === 'primary' ? 'text-cyan-100' : 'text-[#f0e6d2]'} group-hover:text-white transition-colors flex items-center ${isContentVisible ? '' : 'justify-center w-full'}`}>
             {/* 图标：始终显示，但在收缩模式下居中 */}
             {icon && (
                <i className={`fa-solid ${icon} text-center opacity-80 w-5 transition-all duration-300 ${isContentVisible ? 'mr-2' : 'mr-0 text-lg'}`}></i>
             )}
             
             {/* 按钮文字：仅在展开时显示 */}
             <span className={`transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 w-0'}`}>
               {label}
             </span>
           </span>

           {/* 子标题：仅在展开时显示 */}
           {subLabel && (
             <span className={`text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 ml-7 group-hover:text-slate-300 transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 hidden'}`}>
               {subLabel}
             </span>
           )}
        </div>

        {/* 右侧箭头：仅在展开时显示 */}
        <i className={`fa-solid fa-caret-right text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0 w-0'}`}></i>
      </div>
    </button>
  );
};

export default SceneActionBtn;
