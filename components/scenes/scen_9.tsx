
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen9: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible }) => {
  if (!isMenuVisible) return null;

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
      {/* 可以在这里添加隐秘对话选项 */}
    </div>
  );
};

export default Scen9;
