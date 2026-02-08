
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen10: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction }) => {
  if (!isMenuVisible) return null;

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
      <SceneActionBtn label="道具购入" icon="fa-bag-shopping" onClick={() => onAction('buy_item')} />
      <SceneActionBtn label="素材出售" icon="fa-coins" onClick={() => onAction('sell_item')} />
    </div>
  );
};

export default Scen10;
