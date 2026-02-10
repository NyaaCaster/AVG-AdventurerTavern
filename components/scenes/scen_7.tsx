
import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen7: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction, settings, presentCharacters, worldState }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="店内移动" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            
            {presentCharacters.length === 0 && (
                <SceneActionBtn label="入浴" icon="fa-bath" onClick={() => onAction('bath')} />
            )}

            {presentCharacters.map(char => (
                <React.Fragment key={char.id}>
                    {settings.enableNSFW && (
                        <SceneActionBtn label={`偷窥${char.name}`} icon="fa-eye" onClick={() => onEnterDialogue(char.id, 'peep')} variant="special" />
                    )}
                    
                    <SceneActionBtn 
                        label={`与${char.name}对话`} 
                        icon="fa-comments" 
                        variant="primary"
                        onClick={() => onEnterDialogue(char.id, 'bath_chat')} 
                    />
                    
                    {settings.enableNSFW && (
                        <SceneActionBtn label="共浴" icon="fa-heart" onClick={() => onEnterDialogue(char.id, 'bath_together')} disabled subLabel="(好感度不足)" />
                    )}
                    <div className="h-2"></div>
                </React.Fragment>
            ))}
        </>
      ) : (
        <>
           <SceneActionBtn label="返回上级" icon="fa-arrow-turn-up" onClick={() => setShowMoveMenu(false)} variant="special" />
           <div className="h-2"></div>
           <SceneActionBtn label="返回柜台" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
           <SceneActionBtn label="酒场" icon="fa-beer-mug-empty" onClick={() => onNavigate('scen_3')} />
           <SceneActionBtn label="训练场" icon="fa-dumbbell" onClick={() => onNavigate('scen_4')} />
           <SceneActionBtn label="武器店" icon="fa-hammer" onClick={() => onNavigate('scen_5')} />
           <SceneActionBtn label="防具店" icon="fa-shield-halved" onClick={() => onNavigate('scen_6')} />
           {/* Current Scene: Hot Spring (scen_7) - Omitted */}
           <SceneActionBtn label="按摩室" icon="fa-spa" onClick={() => onNavigate('scen_8')} />
           <SceneActionBtn label="库房" icon="fa-boxes-stacked" onClick={() => onNavigate('scen_9')} />
           {showPropShop && (
             <SceneActionBtn label="道具店" icon="fa-sack-dollar" onClick={() => onNavigate('scen_10')} />
           )}
        </>
      )}
    </div>
  );
};

export default Scen7;
