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
            <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            <SceneActionBtn label="閿荤偧" icon="fa-person-running" onClick={() => onAction('exercise')} />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>

            {presentCharacters.map(char => (
                <React.Fragment key={char.id}>
                    <SceneActionBtn label={`涓?{char.name}鍏卞悓璁粌`} icon="fa-swords" onClick={() => onEnterDialogue(char.id, 'train_together')} />
                    <SceneActionBtn 
                        label={`涓?{char.name}瀵硅瘽`} 
                        icon="fa-comments" 
                        variant="primary"
                        onClick={() => onEnterDialogue(char.id, 'training_chat')} 
                    />
                </React.Fragment>
            ))}
        </>
      ) : (
        <>
           <SceneActionBtn label="杩斿洖涓婄骇" icon="fa-arrow-turn-up" onClick={() => setShowMoveMenu(false)} variant="special" />
           <div className="h-2"></div>
           <SceneActionBtn label="杩斿洖鏌滃彴" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
           <SceneActionBtn label="閰掑満" icon="fa-beer-mug-empty" onClick={() => onNavigate('scen_3')} />
           {/* Current Scene: Training (scen_4) - Omitted */}
           {(sceneLevels['scen_5'] || 0) > 0 && <SceneActionBtn label="姝﹀櫒搴? icon="fa-hammer" onClick={() => onNavigate('scen_5')} />}
           {(sceneLevels['scen_6'] || 0) > 0 && <SceneActionBtn label="闃插叿搴? icon="fa-shield-halved" onClick={() => onNavigate('scen_6')} />}
           {(sceneLevels['scen_7'] || 0) > 0 && <SceneActionBtn label="娓╂硥" icon="fa-hot-tub-person" onClick={() => onNavigate('scen_7')} />}
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

export default Scen4;

