import React from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const ScenGuild: React.FC<SceneProps> = ({ onNavigate, onAction, onEnterDialogue, isMenuVisible, presentCharacters }) => {
  if (!isMenuVisible) return null;

  return (
    <div className="absolute top-48 right-8 flex flex-col items-end animate-fadeIn z-30">

      <SceneActionBtn
        label="返回旅店"
        icon="fa-arrow-left"
        onClick={() => onNavigate('scen_1')}
      />

      <SceneActionBtn
        label="查看委托"
        icon="fa-scroll"
        onClick={() => onAction('open_quest_board')}
      />

      {/* 评级鉴定（预留，暂未实现） */}
      <SceneActionBtn
        label="评级鉴定"
        icon="fa-star-half-stroke"
        onClick={() => {}}
        disabled
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

    </div>
  );
};

export default ScenGuild;