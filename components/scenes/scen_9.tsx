import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';
import InventoryModal from '../InventoryModal';

const Scen9: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, settings, worldState, inventory, sceneLevels }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  if (!isMenuVisible) return null;

  // Prop shop visibility logic
  const showPropShop = settings.enableNSFW || (worldState?.period !== 'night');

  return (
    <>
        <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
        
        {!showMoveMenu ? (
            <>
                <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
                <SceneActionBtn label="鐩樻煡搴撳瓨" icon="fa-clipboard-list" onClick={() => setShowInventory(true)} subLabel="Inventory" />
                {/* 鍙互鍦ㄨ繖閲屾坊鍔犻殣绉樺璇濋€夐」 */}
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
            {/* Current Scene: Storage (scen_9) - Omitted */}
            {showPropShop && (
                <SceneActionBtn label="閬撳叿搴? icon="fa-sack-dollar" onClick={() => onNavigate('scen_10')} />
            )}
            </>
        )}
        </div>

        {/* Inventory Modal */}
        <InventoryModal 
            isOpen={showInventory} 
            onClose={() => setShowInventory(false)} 
            inventory={inventory}
            userName={settings.userName}
        />
    </>
  );
};

export default Scen9;

