
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen8: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction, settings }) => {
  if (!isMenuVisible) return null;

  const currentGuest = CHARACTERS['char_101']; // 莉莉娅

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
      <SceneActionBtn label="休息" icon="fa-chair" onClick={() => onAction('rest')} />

      {currentGuest && (
        <>
            {settings.enableNSFW && (
                <>
                    <SceneActionBtn label={`为${currentGuest.name}按摩`} icon="fa-hands" onClick={() => onEnterDialogue(currentGuest.id, 'massage_give')} />
                    <SceneActionBtn label={`请${currentGuest.name}按摩`} icon="fa-hand-sparkles" onClick={() => onEnterDialogue(currentGuest.id, 'massage_receive')} disabled />
                </>
            )}
            <SceneActionBtn 
                label={`与${currentGuest.name}对话`} 
                icon="fa-comments" 
                variant="primary"
                onClick={() => onEnterDialogue(currentGuest.id, 'chat')} 
            />
        </>
      )}
    </div>
  );
};

export default Scen8;
