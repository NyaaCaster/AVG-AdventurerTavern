import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import RoomSelectionModal from '../RoomSelectionModal';

// Extend SceneProps to include the new callback (need to cast or extend interface in types, but for now just use props)
interface Scen1Props extends SceneProps {
    onOpenExpansion?: () => void;
}

const Scen1: React.FC<Scen1Props> = ({ onNavigate, onEnterDialogue, isMenuVisible, worldState, settings, presentCharacters, onOpenManagement, onOpenExpansion, sceneLevels }) => {
  const [menuLayer, setMenuLayer] = useState<'main' | 'move' | 'management'>('main');
  const [showRoomSelection, setShowRoomSelection] = useState(false);

  if (!isMenuVisible) return null;

  // Prop shop visibility logic:
  // Visible if: NSFW is ON OR it is NOT night
  // Hidden if: NSFW is OFF AND it IS night
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <>
      <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
        
        {menuLayer === 'main' && (
          <>
            <SceneActionBtn 
              label="鏃呭簵绠＄悊" 
              icon="fa-list-check" 
              onClick={() => setMenuLayer('management')} 
              subLabel="Management" 
            />
            <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setMenuLayer('move')} subLabel="Move" />
            <SceneActionBtn 
              label="鍓嶅線瀹㈡埧" 
              icon="fa-door-closed" 
              onClick={() => setShowRoomSelection(true)} 
              subLabel="Guest Rooms" 
            />
            <SceneActionBtn label="闃熶紞绠＄悊" icon="fa-users" onClick={() => {}} subLabel="Party" />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>
            
            {presentCharacters.map(char => (
                <SceneActionBtn 
                  key={char.id}
                  label={`涓?{char.name}瀵硅瘽`} 
                  icon="fa-comments" 
                  variant="primary"
                  onClick={() => onEnterDialogue(char.id, 'reception_chat')} 
                  subLabel={`Talk to ${char.name}`}
                />
            ))}
          </>
        )}

        {menuLayer === 'move' && (
          <>
             <SceneActionBtn label="杩斿洖涓婄骇" icon="fa-arrow-turn-up" onClick={() => setMenuLayer('main')} variant="special" />
             <div className="h-2"></div>
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

        {menuLayer === 'management' && (
          <>
             <SceneActionBtn label="杩斿洖涓婄骇" icon="fa-arrow-turn-up" onClick={() => setMenuLayer('main')} variant="special" />
             <div className="h-2"></div>
             <SceneActionBtn 
               label="鏃呭簵璐︽湰" 
               icon="fa-book-open" 
               onClick={() => onOpenManagement && onOpenManagement()} 
               subLabel="Ledger" 
             />
             <SceneActionBtn 
               label="鏃呭簵鎵╁缓" 
               icon="fa-hammer" 
               onClick={() => onOpenExpansion && onOpenExpansion()} 
               subLabel="Construction" 
             />
          </>
        )}

      </div>

      <RoomSelectionModal 
        isOpen={showRoomSelection} 
        onClose={() => setShowRoomSelection(false)} 
        onNavigate={onNavigate}
      />
    </>
  );
};

export default Scen1;

