import React from 'react';
import { SkillScope } from '../../../battle-system/types';
import { SkillWithAvailability } from './types';

interface SkillListProps {
  skills: SkillWithAvailability[];
  currentMp: number;
  onSkillSelect: (skillId: number) => void;
  onClose: () => void;
}

const SkillList: React.FC<SkillListProps> = ({
  skills,
  currentMp,
  onSkillSelect,
  onClose
}) => {
  const getScopeText = (scope?: SkillScope | number) => {
    const scopeValue = typeof scope === 'number' ? scope : scope;
    switch (scopeValue) {
      case SkillScope.ENEMY_SINGLE:
      case 1:
        return '敌方单体';
      case SkillScope.ENEMY_ALL:
      case 2:
        return '敌方全体';
      case SkillScope.ENEMY_ALL_CONTINUOUS:
      case 3:
        return '敌方全体(连续)';
      case SkillScope.ENEMY_RANDOM_SINGLE:
      case 4:
        return '敌方随机1体';
      case SkillScope.ENEMY_RANDOM_X2:
      case 5:
        return '敌方随机2体';
      case SkillScope.ALLY_SINGLE:
      case 6:
        return '我方单体';
      case SkillScope.ALLY_ALL:
      case 7:
        return '我方全体';
      case SkillScope.ALLY_ALL_CONTINUOUS:
      case 8:
        return '我方全体(连续)';
      case SkillScope.SELF:
      case 9:
        return '自身';
      case SkillScope.SELF_AFFECT_ALLY_ALL:
      case 10:
        return '自身影响我方全体';
      case SkillScope.ENEMY_SINGLE_CONTINUOUS:
      case 11:
        return '敌方单体(连续)';
      default:
        return '';
    }
  };
  
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-[#e8dfd1] rounded-xl border-2 border-[#9b7a4c] p-3 sm:p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d6cbb8]">
          <span className="text-sm sm:text-base font-bold text-[#382b26]">选择技能</span>
          <button
            onClick={onClose}
            className="text-[#9b7a4c] hover:text-[#382b26] text-lg transition-colors"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {skills.map((skill) => {
            const isDisabled = !skill.isAvailable;
            const mpNotEnough = currentMp < skill.mpCost;
            
            return (
              <button
                key={skill.id}
                onClick={() => !isDisabled && onSkillSelect(skill.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all ${
                  isDisabled
                    ? 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed opacity-60'
                    : 'bg-[#fcfaf7] text-[#382b26] hover:bg-[#f5f0e6] border border-[#d6cbb8] hover:border-[#9b7a4c]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base truncate">{skill.name}</div>
                  {skill.description && (
                    <div className="text-[10px] sm:text-xs text-[#5c4d45] mt-0.5 line-clamp-2">{skill.description}</div>
                  )}
                  {skill.scope && (
                    <div className="text-[10px] sm:text-xs text-[#9b7a4c] mt-0.5">
                      <i className="fa-solid fa-crosshairs mr-1" />
                      {getScopeText(skill.scope)}
                    </div>
                  )}
                </div>
                <div className={`ml-3 flex-shrink-0 text-sm font-bold ${mpNotEnough ? 'text-red-500' : 'text-cyan-600'}`}>
                  MP {skill.mpCost}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-3 pt-2 border-t border-[#d6cbb8] text-center text-xs text-[#5c4d45]">
          当前MP: <span className="font-bold text-cyan-600">{currentMp}</span>
        </div>
      </div>
    </div>
  );
};

export default SkillList;
