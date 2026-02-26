import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen7: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction, settings, presentCharacters, worldState, sceneLevels, characterUnlocks }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            
            {presentCharacters.length === 0 && (
                <SceneActionBtn label="鍏ユ荡" icon="fa-bath" onClick={() => onAction('bath')} />
            )}

            {presentCharacters.map(char => (
                <React.Fragment key={char.id}>
                    {settings.enableNSFW && (
                        <SceneActionBtn label={`鍋风${char.name}`} icon="fa-eye" onClick={() => onEnterDialogue(char.id, 'peep_embarrassed')} variant="special" />
                    )}
                    
                    <SceneActionBtn 
                        label={`涓?{char.name}瀵硅瘽`} 
                        icon="fa-comments" 
                        variant="primary"
                        onClick={() => onEnterDialogue(char.id, 'bath_chat')} 
                    />
                    
                    {settings.enableNSFW && (
                        <SceneActionBtn 
                            label={`涓?{char.name}鍏辨荡`} 
                            icon="fa-heart" 
                            onClick={() => onEnterDialogue(char.id, 'bath_together_passionate')} 
                            disabled={!(characterUnlocks[char.id]?.accept_bathing_together)} 
                            subLabel={!(characterUnlocks[char.id]?.accept_bathing_together) ? `鏈幏寰?{char.name}璁稿彲` : ""} 
                        />
                    )}
                    <div className="h-2"></div>
                </React.Fragment>
            ))}
        </>
      ) : (
        <>
           <SceneActionBtn label="杩斿洖涓婄骇" icon="fa-arrow-turn-up" onClick={() => setShowMoveMenu(false)} variant="special" />
           <div className="h-2"></div>
           <SceneActionBtn label="杩斿洖鏌滃彴" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
           <SceneActionBtn label="閰掑満" icon="fa-beer-mug-empty" onClick={() => onNavigate('scen_3')} />
           <SceneActionBtn label="璁粌鍦? icon="fa-dumbbell" onClick={() => onNavigate('scen_4')} />
           {(sceneLevels['scen_5'] || 0) > 0 && <SceneActionBtn label="姝﹀櫒搴? icon="fa-hammer" onClick={() => onNavigate('scen_5')} />}
           {(sceneLevels['scen_6'] || 0) > 0 && <SceneActionBtn label="闃插叿搴? icon="fa-shield-halved" onClick={() => onNavigate('scen_6')} />}
           {/* Current Scene: Hot Spring (scen_7) - Omitted */}
           {(sceneLevels['scen_8'] || 0) > 0 && <SceneActionBtn label="鎸夋懇瀹? icon="fa-spa" onClick={() => onNavigate('scen_8')} />}
           <SceneActionBtn label="搴撴埧" icon="fa-boxes-stacked" onClick={() => onNavigate('scen_9')} />
           {showPropShop && (
             <SceneActionBtn label="閬撳叿搴? icon="fa-sack-dollar" onClick={() => onNavigate('scen_10')} />
           )}
        </>
      )}
    </div>
  );
};

export default Scen7;

