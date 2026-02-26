import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen2: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, targetCharacterId, onAction, settings, presentCharacters, worldState, sceneLevels, characterUnlocks }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  const targetChar = targetCharacterId && CHARACTERS[targetCharacterId] ? CHARACTERS[targetCharacterId] : null;
  const isUserRoom = targetCharacterId === 'user';
  
  // Check if the target character is actually in the room (scheduled)
  const isTargetPresent = targetChar ? presentCharacters.some(c => c.id === targetChar.id) : false;

  // Check if character is sleeping
  const isSleeping = worldState?.period === 'night';

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            
            {isUserRoom && (
              <SceneActionBtn label="浼戞伅" icon="fa-bed" onClick={() => onAction('rest')} subLabel="Rest" />
            )}

            {!isUserRoom && targetChar && (
              <>
                  {isTargetPresent ? (
                      <>
                          <SceneActionBtn 
                              label={`涓?{targetChar.name}瀵硅瘽`} 
                              icon="fa-comments" 
                              variant="primary"
                              onClick={() => onEnterDialogue(targetChar.id, isSleeping ? 'room_visit_sleeping' : 'room_visit')} 
                          />
                          
                          <div className="h-px w-32 bg-white/10 my-2"></div>

                          {settings.enableNSFW ? (
                              <>
                                  <SceneActionBtn label="鐫＄湢濂? icon="fa-moon" onClick={() => onEnterDialogue(targetChar.id, 'sleep_sex')} disabled subLabel="(闇€瀹夌湢鑽?" />
                                  <SceneActionBtn label="濯氳嵂濂? icon="fa-flask" onClick={() => onEnterDialogue(targetChar.id, 'drug_sex')} disabled subLabel="(闇€濯氳嵂)" />
                                  <SceneActionBtn 
                                      label="璋冩儏" 
                                      icon="fa-heart" 
                                      onClick={() => onEnterDialogue(targetChar.id, 'flirt_romantic')} 
                                      disabled={!(characterUnlocks[targetChar.id]?.accept_nsfw_topic)} 
                                      subLabel={!(characterUnlocks[targetChar.id]?.accept_nsfw_topic) ? `鏈幏寰?{targetChar.name}璁稿彲` : "Flirt"} 
                                  />
                                  <SceneActionBtn label="鎿嶆帶" icon="fa-eye" onClick={() => onEnterDialogue(targetChar.id, 'hypnosis')} disabled subLabel="(闇€鍌湢鑽?" />
                              </>
                          ) : (
                              <SceneActionBtn 
                                  label="璋冩儏" 
                                  icon="fa-heart" 
                                  onClick={() => onEnterDialogue(targetChar.id, 'flirt_romantic')} 
                                  subLabel={!(characterUnlocks[targetChar.id]?.accept_nsfw_topic) ? `鏈幏寰?{targetChar.name}璁稿彲` : "Flirt"} 
                                  disabled={!(characterUnlocks[targetChar.id]?.accept_nsfw_topic)} 
                              />
                          )}
                      </>
                  ) : (
                      <div className="px-4 py-2 bg-black/60 rounded text-slate-400 text-sm mb-2">
                          {targetChar.name}鐜板湪涓嶅湪鎴块棿銆?                      </div>
                  )}
              </>
            )}
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

export default Scen2;

