
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen7: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction }) => {
  if (!isMenuVisible) return null;

  // 假设随机出现一个角色
  const randomChar = CHARACTERS['char_102']; // 米娜

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
      
      {!randomChar && (
          <SceneActionBtn label="入浴" icon="fa-bath" onClick={() => onAction('bath')} />
      )}

      {randomChar && (
        <>
            <SceneActionBtn label={`偷窥${randomChar.name}`} icon="fa-eye" onClick={() => onEnterDialogue(randomChar.id, 'peep')} variant="special" />
            <SceneActionBtn 
                label={`与${randomChar.name}对话`} 
                icon="fa-comments" 
                variant="primary"
                onClick={() => onEnterDialogue(randomChar.id, 'bath_chat')} 
            />
            <SceneActionBtn label="共浴" icon="fa-heart" onClick={() => onEnterDialogue(randomChar.id, 'bath_together')} disabled subLabel="(好感度不足)" />
        </>
      )}
    </div>
  );
};

export default Scen7;
