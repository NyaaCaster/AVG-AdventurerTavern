import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const ScenMarket: React.FC<SceneProps> = ({ onNavigate, onEnterDialogue, onAction, isMenuVisible, presentCharacters }) => {
  if (!isMenuVisible) return null;

  return (
      <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">

      <SceneActionBtn
        label="返回旅店"
        icon="fa-arrow-left"
        onClick={() => onNavigate('scen_1')}
      />

      <SceneActionBtn
        label="购买食材"
        icon="fa-basket-shopping"
        onClick={() => onAction('open_food_shop')}
      />

      <div className="h-px w-32 bg-white/10 my-2"></div>

      {/* 与角色对话（仅角色在场时出现） */}
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

      {/* 预留位置：让${char.name}公开露出 */}
      {/* TODO: 公开露出功能 - 需角色在场且对应解锁条件满足时出现 */}

    </div>
  );
};

export default ScenMarket;