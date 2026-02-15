
import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen4: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction, presentCharacters, settings, worldState, sceneLevels }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="店内移动" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            <SceneActionBtn label="锻炼" icon="fa-person-running" onClick={() => onAction('exercise')} />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>

            {presentCharacters.map(char => (
                <React.Fragment key={char.id}>
                    <SceneActionBtn label={`与${char.name}共同训练`} icon="fa-swords" onClick={() => onEnterDialogue(char.id, 'train_together')} />
                    <SceneActionBtn 
                        label={`与${char.name}对话`} 
                        icon="fa-comments" 
                        variant="primary"
                        onClick={() => onEnterDialogue(char.id, 'training_chat')} 
                    />
                </React.Fragment>
            ))}
        </>
      ) : (
        <>
           <SceneActionBtn label="返回上级" icon="fa-arrow-turn-up" onClick={() => setShowMoveMenu(false)} variant="special" />
           <div className="h-2"></div>
           <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
           <SceneActionBtn label="酒场" icon="fa-beer-mug-empty" onClick={() => onNavigate('scen_3')} />
           {/* Current Scene: Training (scen_4) - Omitted */}
           {(sceneLevels['scen_5'] || 0) > 0 && <SceneActionBtn label="武器店" icon="fa-hammer" onClick={() => onNavigate('scen_5')} />}
           {(sceneLevels['scen_6'] || 0) > 0 && <SceneActionBtn label="防具店" icon="fa-shield-halved" onClick={() => onNavigate('scen_6')} />}
           {(sceneLevels['scen_7'] || 0) > 0 && <SceneActionBtn label="温泉" icon="fa-hot-tub-person" onClick={() => onNavigate('scen_7')} />}
           {(sceneLevels['scen_8'] || 0) > 0 && <SceneActionBtn label="按摩室" icon="fa-spa" onClick={() => onNavigate('scen_8')} />}
           <SceneActionBtn label="库房" icon="fa-boxes-stacked" onClick={() => onNavigate('scen_9')} />
           {showPropShop && (
             <SceneActionBtn label="道具店" icon="fa-sack-dollar" onClick={() => onNavigate('scen_10')} />
           )}
        </>
      )}
    </div>
  );
};

export default Scen4;
