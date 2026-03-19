import React, { useState } from 'react';
import { SceneProps } from '../../types';
import SceneActionBtn from '../SceneActionBtn';

const ScenGuild: React.FC<SceneProps> = ({ onNavigate, onAction, onEnterDialogue, isMenuVisible, presentCharacters, onOpenPartyFormation, onOpenPartyEquipment, onOpenPartySkillSet, onOpenRankAssessment }) => {
  const [menuLayer, setMenuLayer] = useState<'main' | 'party'>('main');
  
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

      {menuLayer === 'main' && (
        <SceneActionBtn 
          label="队伍管理" 
          icon="fa-users" 
          onClick={() => setMenuLayer('party')} 
          subLabel="Party" 
        />
      )}

      {menuLayer === 'party' && (
        <>
          <SceneActionBtn label="返回上级" icon="fa-arrow-turn-up" onClick={() => setMenuLayer('main')} variant="special" />
          <div className="h-2"></div>
          <SceneActionBtn 
            label="队伍编成" 
            icon="fa-users-gear" 
            onClick={() => onOpenPartyFormation && onOpenPartyFormation()} 
            subLabel="Formation" 
          />
          <SceneActionBtn 
            label="装备变更" 
            icon="fa-shield" 
            onClick={() => onOpenPartyEquipment && onOpenPartyEquipment()} 
            subLabel="Equipment" 
          />
          <SceneActionBtn 
            label="技能配置" 
            icon="fa-book" 
            onClick={() => onOpenPartySkillSet && onOpenPartySkillSet()} 
            subLabel="Skills" 
          />
        </>
      )}

      {/* 评级鉴定 */}
      <SceneActionBtn
        label="评级鉴定"
        icon="fa-star-half-stroke"
        onClick={() => onOpenRankAssessment && onOpenRankAssessment()}
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