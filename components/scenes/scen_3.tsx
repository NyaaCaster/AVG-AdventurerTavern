import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import { CHARACTERS } from '../../data/scenarioData';

const Scen3: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction, presentCharacters, settings, worldState, sceneLevels, onOpenTavernMenu }) => {
  const [menuState, setMenuState] = useState<'main' | 'move' | 'chars'>('main');

  if (!isMenuVisible) return null;

  // Mina is char_102. Check if she is present for the special button.
  const mina = presentCharacters.find(c => c.id === 'char_102');

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {menuState === 'main' && (
        <>
            <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setMenuState('move')} subLabel="Move" />
            <SceneActionBtn label="椁愰ギ绠＄悊" icon="fa-list-check" onClick={() => onOpenTavernMenu?.()} subLabel="Menu" />
            <SceneActionBtn label="鐑归オ" icon="fa-fire-burner" onClick={() => onAction('cook')} subLabel="Cooking" />
            <SceneActionBtn label="瀵绘壘濂虫€ц鑹? icon="fa-magnifying-glass" onClick={() => setMenuState('chars')} />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>
            
            {mina && (
                <SceneActionBtn 
                    label="涓庣背濞滃璇? 
                    icon="fa-martini-glass" 
                    variant="primary"
                    onClick={() => onEnterDialogue('char_102', 'tavern_chat')} 
                />
            )}
        </>
      )}

      {menuState === 'move' && (
        <>
           <SceneActionBtn label="杩斿洖涓婄骇" icon="fa-arrow-turn-up" onClick={() => setMenuState('main')} variant="special" />
           <div className="h-2"></div>
           <SceneActionBtn label="杩斿洖鏌滃彴" icon="fa-arrow-left" onClick={() => onNavigate('scen_1')} />
           {/* Current Scene: Tavern (scen_3) - Omitted */}
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

      {menuState === 'chars' && (
        <>
            <SceneActionBtn label="杩斿洖涓婄骇" icon="fa-arrow-turn-up" onClick={() => setMenuState('main')} variant="special" />
            <div className="h-2"></div>
            {presentCharacters.length > 0 ? (
                presentCharacters
                  .filter(char => char.id !== 'char_102') // Filter out Mina as she has a dedicated button
                  .map(char => (
                    <SceneActionBtn 
                        key={char.id}
                        label={`涓?{char.name}瀵硅瘽`}
                        icon="fa-comment"
                        onClick={() => onEnterDialogue(char.id, 'tavern_chat')}
                    />
                ))
            ) : (
                <div className="px-4 py-2 bg-black/60 rounded text-slate-400 text-sm mb-2">
                     鏆傛椂娌℃湁浜哄湪銆?                </div>
            )}
        </>
      )}

    </div>
  );
};

export default Scen3;

