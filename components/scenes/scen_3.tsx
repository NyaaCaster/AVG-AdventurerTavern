
import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen3: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction }) => {
  const [showCharList, setShowCharList] = useState(false);

  if (!isMenuVisible) return null;

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showCharList ? (
        <>
            <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
            <SceneActionBtn label="用餐" icon="fa-utensils" onClick={() => onAction('eat')} />
            <SceneActionBtn label="烹饪" icon="fa-fire-burner" onClick={() => onAction('cook')} />
            <SceneActionBtn label="寻找女性角色" icon="fa-magnifying-glass" onClick={() => setShowCharList(true)} />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>
            
            <SceneActionBtn 
                label="与米娜对话" 
                icon="fa-martini-glass" 
                variant="primary"
                onClick={() => onEnterDialogue('char_102', 'tavern_chat')} 
            />
        </>
      ) : (
        <>
            <SceneActionBtn label="返回上级" icon="fa-arrow-turn-up" onClick={() => setShowCharList(false)} variant="special" />
            <div className="h-2"></div>
            {Object.values(CHARACTERS).map(char => (
                <SceneActionBtn 
                    key={char.id}
                    label={`与${char.name}对话`}
                    icon="fa-comment"
                    onClick={() => onEnterDialogue(char.id, 'tavern_chat')}
                />
            ))}
        </>
      )}

    </div>
  );
};

export default Scen3;
