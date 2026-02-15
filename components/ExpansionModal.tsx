
import React, { useState } from 'react';
import { SceneId } from '../types';
import { FACILITY_DATA, UPGRADE_MATERIALS } from '../data/facilityData';
import { resolveImgPath } from '../utils/imagePath';

interface ExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevels: Record<string, number>;
  inventory: Record<string, number>;
  gold: number;
  onUpgrade: (facilityId: SceneId, costGold: number, costMatId: string[], costMatCount: number) => void;
}

const ExpansionModal: React.FC<ExpansionModalProps> = ({ 
    isOpen, 
    onClose, 
    currentLevels, 
    inventory, 
    gold, 
    onUpgrade 
}) => {
  const [selectedId, setSelectedId] = useState<SceneId>('scen_1');

  if (!isOpen) return null;

  const innLevel = currentLevels['scen_1'] || 1;
  const config = FACILITY_DATA[selectedId];
  const currentLevel = currentLevels[selectedId] || 0;

  // Filter facilities that should be visible
  const visibleFacilities = Object.values(FACILITY_DATA).filter(f => {
      // If unlockInnLevel is defined, current Inn Level must be >= it
      return innLevel >= f.unlockInnLevel;
  });

  // Calculate Costs & Limits
  const getUpgradeInfo = (fid: SceneId) => {
      const conf = FACILITY_DATA[fid];
      if (!conf) return null;
      
      const curLvl = currentLevels[fid] || 0;
      const nextLvl = curLvl + 1;
      
      // Calculate Max Level allowed by dependency
      let allowedMax = conf.maxLevel;
      if (fid !== 'scen_1' && conf.dependencyFactor) {
          if (conf.dependencyType === 'multiply') {
              allowedMax = Math.min(conf.maxLevel, innLevel * conf.dependencyFactor);
          } else {
              allowedMax = Math.min(conf.maxLevel, Math.floor(innLevel / conf.dependencyFactor));
          }
      }

      // Cost Calculation: Base * (CurrentLevel || 1)
      const multiplier = Math.max(curLvl, 1);
      const costGold = conf.baseCostGold * multiplier;
      const costMat = conf.baseCostMat * multiplier;

      return {
          currentLevel: curLvl,
          nextLevel: nextLvl,
          isMaxed: curLvl >= conf.maxLevel,
          isCapReached: curLvl >= allowedMax && curLvl < conf.maxLevel,
          allowedMax,
          costGold,
          costMat
      };
  };

  const upgradeInfo = getUpgradeInfo(selectedId);
  const canAffordGold = upgradeInfo ? gold >= upgradeInfo.costGold : false;
  const canAffordMats = upgradeInfo ? UPGRADE_MATERIALS.every(m => (inventory[m.id] || 0) >= upgradeInfo.costMat) : false;
  const canUpgrade = upgradeInfo && !upgradeInfo.isMaxed && !upgradeInfo.isCapReached && canAffordGold && canAffordMats;

  const handleUpgradeClick = () => {
      if (canUpgrade && upgradeInfo) {
          const matIds = UPGRADE_MATERIALS.map(m => m.id);
          onUpgrade(selectedId, upgradeInfo.costGold, matIds, upgradeInfo.costMat);
      }
  };

  const getRequiredInnLevel = (targetLevel: number, conf: any) => {
      if (conf.id === 'scen_1') return null;
      if (!conf.dependencyFactor) return null;

      if (conf.dependencyType === 'multiply') {
          return Math.ceil(targetLevel / conf.dependencyFactor);
      } else {
          return targetLevel * conf.dependencyFactor;
      }
  };

  const requiredInnLevel = (config && upgradeInfo) ? getRequiredInnLevel(upgradeInfo.nextLevel, config) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-[90vh] md:h-[85vh] bg-[#2c241b] border-[3px] border-[#5c4d45] rounded-lg shadow-2xl flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
        style={{
            backgroundImage: `url(${resolveImgPath('img/bg/AdventurerTavern/wood_texture_dark.png')}), linear-gradient(to bottom, #2c241b, #1a1512)`,
            backgroundBlendMode: 'overlay'
        }}
      >
        {/* Header */}
        <div className="bg-[#382b26] border-b border-[#9b7a4c]/50 py-3 md:py-4 px-4 md:px-6 flex justify-between items-center shadow-md relative z-10 shrink-0">
            <h2 className="text-[#f0e6d2] font-bold text-lg md:text-xl tracking-[0.2em] flex items-center gap-2 md:gap-3">
                <i className="fa-solid fa-hammer text-[#9b7a4c]"></i>
                旅店扩建
            </h2>
            
            {/* Resource Bar */}
            <div className="flex gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-[#9b7a4c]/30">
                    <span className="text-[#fcd34d] font-bold">{gold.toLocaleString()} G</span>
                </div>
                {UPGRADE_MATERIALS.map(m => (
                    <div key={m.id} className="hidden md:flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-[#9b7a4c]/30">
                        <span className="text-slate-400">{m.name}</span>
                        <span className="text-[#f0e6d2] font-bold">{inventory[m.id] || 0}</span>
                    </div>
                ))}
            </div>

            <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9b7a4c] hover:text-[#f0e6d2] transition-colors"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar: Facility List */}
            <div className="w-full md:w-1/3 md:min-w-[200px] h-[160px] md:h-full bg-[#221a15] border-b md:border-b-0 md:border-r border-[#5c4d45] overflow-y-auto custom-scrollbar p-2 flex-shrink-0">
                {visibleFacilities.map(f => {
                    const info = getUpgradeInfo(f.id);
                    const isSelected = selectedId === f.id;
                    const level = currentLevels[f.id] || 0;
                    
                    return (
                        <button
                            key={f.id}
                            onClick={() => setSelectedId(f.id)}
                            className={`
                                w-full text-left p-3 mb-2 rounded border transition-all relative overflow-hidden group
                                ${isSelected 
                                    ? 'bg-[#9b7a4c] border-[#f0e6d2] text-[#1a1512] shadow-lg' 
                                    : 'bg-[#2c241b] border-[#4a3b32] text-[#8c7b70] hover:bg-[#382b26] hover:text-[#d6cbb8]'}
                            `}
                        >
                            <div className="flex justify-between items-center mb-1 relative z-10">
                                <span className="font-bold tracking-wide text-sm md:text-base">{f.name}</span>
                                {info?.isMaxed ? (
                                    <span className="text-[10px] font-black bg-black/20 px-1.5 rounded">MAX</span>
                                ) : (
                                    <span className="text-[10px] font-mono">Lv.{level}</span>
                                )}
                            </div>
                            {level === 0 && (
                                <div className="text-[10px] italic opacity-70 relative z-10">未建设</div>
                            )}
                            {info?.isCapReached && !info.isMaxed && (
                                <div className="absolute right-1 bottom-1 text-[10px] text-red-900/50 font-bold uppercase rotate-[-5deg] border border-red-900/20 px-1">LOCKED</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Right Content: Upgrade Details */}
            <div className="flex-1 bg-[#e8dfd1] relative flex flex-col overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}></div>
                
                {config && upgradeInfo && (
                    <div className="flex-1 p-4 md:p-8 flex flex-col z-10 overflow-y-auto">
                        
                        {/* Facility Header */}
                        <div className="flex justify-between items-end border-b-2 border-[#9b7a4c] pb-2 mb-4 md:mb-6 shrink-0">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-[#2c241b] mb-1">{config.name}</h3>
                                <div className="text-[#5c4d45] font-bold text-xs md:text-sm">
                                    当前等级: <span className="text-[#b45309] text-lg md:text-xl font-mono mx-1">{upgradeInfo.currentLevel}</span> 
                                    <span className="text-[#8c7b70] text-xs">/ {config.maxLevel}</span>
                                </div>
                            </div>
                            {upgradeInfo.currentLevel > 0 && (
                                <div className="bg-[#f5f0e6] px-3 py-2 md:px-4 rounded border border-[#d6cbb8] shadow-sm max-w-[60%] flex flex-col items-end">
                                    <div className="text-[10px] text-[#8c7b70] font-black uppercase tracking-wider border-b border-[#d6cbb8] pb-0.5 mb-1">
                                        当前效果
                                    </div>
                                    <div className="text-xs md:text-sm text-[#4a3b32] font-bold text-right leading-tight">
                                        {config.getEffectDescription(upgradeInfo.currentLevel)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Upgrade Preview */}
                        {!upgradeInfo.isMaxed ? (
                            <div className="bg-[#f5f0e6] border border-[#d6cbb8] rounded-lg p-4 md:p-6 shadow-inner mb-4 md:mb-6 shrink-0">
                                <h4 className="text-[#8c7b70] font-bold uppercase tracking-widest text-xs mb-2 md:mb-4 flex items-center flex-wrap gap-2">
                                    <span className="w-2 h-2 bg-[#9b7a4c] rounded-full"></span>
                                    <span>下一等级预览 (Lv.{upgradeInfo.nextLevel})</span>
                                    {requiredInnLevel !== null && (
                                        <span className={`ml-auto md:ml-2 text-[10px] md:text-xs normal-case px-2 py-0.5 rounded border ${
                                            innLevel >= requiredInnLevel 
                                                ? 'text-emerald-700 bg-emerald-100 border-emerald-300' 
                                                : 'text-red-700 bg-red-100 border-red-300'
                                        }`}>
                                            需要柜台等级：Lv.{requiredInnLevel}
                                        </span>
                                    )}
                                </h4>
                                <div className="text-base md:text-lg text-[#2c241b] font-bold flex items-center gap-3">
                                    <i className="fa-solid fa-arrow-up text-emerald-600"></i>
                                    {config.getEffectDescription(upgradeInfo.nextLevel)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#9b7a4c]/50 font-black text-4xl md:text-5xl tracking-widest uppercase rotate-[-5deg]">
                                已达最大等级
                            </div>
                        )}

                        {/* Requirements & Action */}
                        {!upgradeInfo.isMaxed && (
                            <div className="mt-auto">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                                    {/* Gold Cost */}
                                    <div className={`p-2 md:p-3 rounded border ${canAffordGold ? 'bg-[#fffef8] border-[#d6cbb8]' : 'bg-red-50 border-red-200'}`}>
                                        <div className="text-[10px] uppercase font-bold text-[#8c7b70] mb-1">所需金币</div>
                                        <div className={`font-mono font-bold text-base md:text-lg ${canAffordGold ? 'text-[#b45309]' : 'text-red-600'}`}>
                                            {upgradeInfo.costGold.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {/* Material Costs */}
                                    {UPGRADE_MATERIALS.map(mat => {
                                        const count = inventory[mat.id] || 0;
                                        const req = upgradeInfo.costMat;
                                        const enough = count >= req;
                                        
                                        return (
                                            <div key={mat.id} className={`p-2 md:p-3 rounded border ${enough ? 'bg-[#fffef8] border-[#d6cbb8]' : 'bg-red-50 border-red-200'}`}>
                                                <div className="text-[10px] uppercase font-bold text-[#8c7b70] mb-1">{mat.name}</div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`font-mono font-bold text-base md:text-lg ${enough ? 'text-[#2c241b]' : 'text-red-600'}`}>{req}</span>
                                                    <span className="text-xs text-[#8c7b70]">/ {count}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Upgrade Button / Locked Message */}
                                {upgradeInfo.isCapReached ? (
                                    <div className="bg-slate-200 border-2 border-slate-300 rounded-lg p-3 md:p-4 text-center text-slate-500 font-bold flex items-center justify-center gap-2 text-sm md:text-base">
                                        <i className="fa-solid fa-lock"></i>
                                        <span>等级上限受限：需提升宿屋等级</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleUpgradeClick}
                                        disabled={!canUpgrade}
                                        className={`
                                            w-full py-3 md:py-4 rounded-lg font-black tracking-[0.1em] text-base md:text-lg shadow-lg transition-all
                                            flex items-center justify-center gap-3
                                            ${canUpgrade 
                                                ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#4a3b32] hover:scale-[1.01] border-2 border-[#9b7a4c]' 
                                                : 'bg-[#d6cbb8] text-[#f5f0e6] cursor-not-allowed border-2 border-[#c7bca8]'}
                                        `}
                                    >
                                        <i className="fa-solid fa-hammer"></i>
                                        {canUpgrade ? '立即扩建' : '资源不足'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExpansionModal;
