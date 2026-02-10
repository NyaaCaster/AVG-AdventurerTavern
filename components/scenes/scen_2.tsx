
import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen2: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, targetCharacterId, onAction, settings, presentCharacters, worldState }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  const targetChar = targetCharacterId && CHARACTERS[targetCharacterId] ? CHARACTERS[targetCharacterId] : null;
  const isUserRoom = targetCharacterId === 'user';
  
  // Check if the target character is actually in the room (scheduled)
  const isTargetPresent = targetChar ? presentCharacters.some(c => c.id === targetChar.id) : false;

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="店内移动" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            
            {isUserRoom && (
              <SceneActionBtn label="休息" icon="fa-bed" onClick={() => onAction('rest')} subLabel="Rest" />
            )}

            {!isUserRoom && targetChar && (
              <>
                  {isTargetPresent ? (
                      <>
                          <SceneActionBtn 
                              label={`与${targetChar.name}对话`} 
                              icon="fa-comments" 
                              variant="primary"
                              onClick={() => onEnterDialogue(targetChar.id, 'room_visit')} 
                          />
                          
                          <div className="h-px w-32 bg-white/10 my-2"></div>

                          {settings.enableNSFW ? (
                              <>
                                  <SceneActionBtn label="睡眠奸" icon="fa-moon" onClick={() => onEnterDialogue(targetChar.id, 'sleep_sex')} disabled subLabel="(需安眠药)" />
                                  <SceneActionBtn label="媚药奸" icon="fa-flask" onClick={() => onEnterDialogue(targetChar.id, 'drug_sex')} disabled subLabel="(需媚药)" />
                                  <SceneActionBtn label="调情" icon="fa-heart" onClick={() => onEnterDialogue(targetChar.id, 'flirt')} subLabel="Flirt" />
                                  <SceneActionBtn label="操控" icon="fa-eye" onClick={() => onEnterDialogue(targetChar.id, 'hypnosis')} disabled subLabel="(需催眠药)" />
                              </>
                          ) : (
                              <SceneActionBtn label="调情" icon="fa-heart" onClick={() => onEnterDialogue(targetChar.id, 'flirt')} subLabel="Flirt" />
                          )}
                      </>
                  ) : (
                      <div className="px-4 py-2 bg-black/60 rounded text-slate-400 text-sm mb-2">
                          {targetChar.name}现在不在房间。
                      </div>
                  )}
              </>
            )}
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
           <SceneActionBtn label="温泉" icon="fa-hot-tub-person" onClick={() => onNavigate('scen_7')} />
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

export default Scen2;
