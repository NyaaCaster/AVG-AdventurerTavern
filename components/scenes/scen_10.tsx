
import React, { useState } from 'react';
import { SceneProps, ShopTab } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

interface Scen10Props extends SceneProps {
  onOpenShop: (tab: ShopTab) => void;
}

const Scen10: React.FC<Scen10Props> = ({ onNavigate, onEnterDialogue, isMenuVisible, sceneLevels, onOpenShop, presentCharacters }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (!isMenuVisible) return null;

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">
      
      {!showMoveMenu ? (
        <>
            <SceneActionBtn label="店内移动" icon="fa-shoe-prints" onClick={() => setShowMoveMenu(true)} subLabel="Move" />
            <SceneActionBtn label="道具购入" icon="fa-bag-shopping" onClick={() => onOpenShop('buy')} />
            <SceneActionBtn label="素材出售" icon="fa-coins" onClick={() => onOpenShop('sell')} />

            <div className="h-px w-32 bg-white/10 my-2"></div>

            {presentCharacters.map(char => (
                <React.Fragment key={char.id}>
                    <SceneActionBtn
                        label={`与${char.name}对话`}
                        icon="fa-comments"
                        variant="primary"
                        onClick={() => onEnterDialogue(char.id, 'chat')}
                    />
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
           {(sceneLevels['scen_5'] || 0) > 0 && <SceneActionBtn label="武器店" icon="fa-hammer" onClick={() => onNavigate('scen_5')} />}
           {(sceneLevels['scen_6'] || 0) > 0 && <SceneActionBtn label="防具店" icon="fa-shield-halved" onClick={() => onNavigate('scen_6')} />}
           {(sceneLevels['scen_7'] || 0) > 0 && <SceneActionBtn label="温泉" icon="fa-hot-tub-person" onClick={() => onNavigate('scen_7')} />}
           {(sceneLevels['scen_8'] || 0) > 0 && <SceneActionBtn label="按摩室" icon="fa-spa" onClick={() => onNavigate('scen_8')} />}
           <SceneActionBtn label="库房" icon="fa-boxes-stacked" onClick={() => onNavigate('scen_9')} />
           {/* Current Scene: Item Shop (scen_10) - Omitted */}
        </>
      )}
    </div>
  );
};

export default Scen10;
