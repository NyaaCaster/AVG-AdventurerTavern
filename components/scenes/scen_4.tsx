
import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen4: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction }) => {
  if (!isMenuVisible) return null;

  // 示例：假设莲华(char_105)常驻训练场
  const trainerId = 'char_105'; 
  const trainer = CHARACTERS[trainerId];

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
      <SceneActionBtn label="锻炼" icon="fa-person-running" onClick={() => onAction('exercise')} />
      
      {trainer && (
        <>
            <SceneActionBtn label={`与${trainer.name}共同训练`} icon="fa-swords" onClick={() => onEnterDialogue(trainerId, 'train_together')} />
            <SceneActionBtn 
                label={`与${trainer.name}对话`} 
                icon="fa-comments" 
                variant="primary"
                onClick={() => onEnterDialogue(trainerId, 'training_chat')} 
            />
        </>
      )}
    </div>
  );
};

export default Scen4;
