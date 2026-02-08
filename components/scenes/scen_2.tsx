
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen2: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, targetCharacterId, onAction }) => {
  if (!isMenuVisible) return null;

  const targetChar = targetCharacterId && CHARACTERS[targetCharacterId] ? CHARACTERS[targetCharacterId] : null;
  const isUserRoom = targetCharacterId === 'user';

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} variant="default" />
      
      {isUserRoom && (
        <SceneActionBtn label="休息" icon="fa-bed" onClick={() => onAction('rest')} subLabel="Rest" />
      )}

      {!isUserRoom && targetChar && (
        <>
            <SceneActionBtn 
                label={`与${targetChar.name}对话`} 
                icon="fa-comments" 
                variant="primary"
                onClick={() => onEnterDialogue(targetChar.id, 'room_visit')} 
            />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>

            {/* 功能性 H 选项 - 仅做UI展示，逻辑待实现 */}
            <SceneActionBtn label="睡眠奸" icon="fa-moon" onClick={() => onEnterDialogue(targetChar.id, 'sleep_sex')} disabled subLabel="(需安眠药)" />
            <SceneActionBtn label="媚药奸" icon="fa-flask" onClick={() => onEnterDialogue(targetChar.id, 'drug_sex')} disabled subLabel="(需媚药)" />
            <SceneActionBtn label="调情" icon="fa-heart" onClick={() => onEnterDialogue(targetChar.id, 'flirt')} subLabel="Flirt" />
            <SceneActionBtn label="操控" icon="fa-eye" onClick={() => onEnterDialogue(targetChar.id, 'hypnosis')} disabled subLabel="(需催眠药)" />
        </>
      )}

    </div>
  );
};

export default Scen2;
