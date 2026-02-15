
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
              label="旅店管理" 
              icon="fa-list-check" 
              onClick={() => setMenuLayer('management')} 
              subLabel="Management" 
            />
            <SceneActionBtn label="店内移动" icon="fa-shoe-prints" onClick={() => setMenuLayer('move')} subLabel="Move" />
            <SceneActionBtn 
              label="前往客房" 
              icon="fa-door-closed" 
              onClick={() => setShowRoomSelection(true)} 
              subLabel="Guest Rooms" 
            />
            <SceneActionBtn label="队伍管理" icon="fa-users" onClick={() => {}} subLabel="Party" />
            
            <div className="h-px w-32 bg-white/10 my-2"></div>
            
            {presentCharacters.map(char => (
                <SceneActionBtn 
                  key={char.id}
                  label={`与${char.name}对话`} 
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
             <SceneActionBtn label="返回上级" icon="fa-arrow-turn-up" onClick={() => setMenuLayer('main')} variant="special" />
             <div className="h-2"></div>
             <SceneActionBtn label="酒场" icon="fa-beer-mug-empty" onClick={() => onNavigate('scen_3')} />
             <SceneActionBtn label="训练场" icon="fa-dumbbell" onClick={() => onNavigate('scen_4')} />
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

        {menuLayer === 'management' && (
          <>
             <SceneActionBtn label="返回上级" icon="fa-arrow-turn-up" onClick={() => setMenuLayer('main')} variant="special" />
             <div className="h-2"></div>
             <SceneActionBtn 
               label="旅店账本" 
               icon="fa-book-open" 
               onClick={() => onOpenManagement && onOpenManagement()} 
               subLabel="Ledger" 
             />
             <SceneActionBtn 
               label="旅店扩建" 
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
