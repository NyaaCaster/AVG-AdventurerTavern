import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const Scen10: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, isMenuVisible, onAction, sceneLevels }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="搴楀唴绉诲姩" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            <SceneActionBtn label="閬撳叿璐叆" icon="fa-bag-shopping" onClick={() => onAction('buy_item')} />
            <SceneActionBtn label="绱犳潗鍑哄敭" icon="fa-coins" onClick={() => onAction('sell_item')} />
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
           {/* Current Scene: Item Shop (scen_10) - Omitted */}
        </>
      )}
    </div>
  );
};

export default Scen10;

