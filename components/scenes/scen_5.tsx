
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen5: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction }) => {
  if (!isMenuVisible) return null;

  // 假设卡特琳娜(char_108)可能在这里
  const shopkeeperId = 'char_108'; 

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
      <SceneActionBtn label="武器购入" icon="fa-cart-shopping" onClick={() => onAction('buy_weapon')} />
      <SceneActionBtn label="武器出售" icon="fa-coins" onClick={() => onAction('sell_weapon')} />
      
      <div className="h-px w-32 bg-white/10 my-2"></div>
      
      <SceneActionBtn 
         label="与角色对话" 
         icon="fa-comments" 
         variant="primary"
         onClick={() => onEnterDialogue(shopkeeperId, 'shop_chat')} 
      />
    </div>
  );
};

export default Scen5;
