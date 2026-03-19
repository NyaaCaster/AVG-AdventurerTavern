
import React, { useState, useEffect } from 'react';
import { getSaveSlots, GameSaveData } from '../services/db';
import { INITIAL_CHECKED_IN_CHARACTERS } from '../utils/gameConstants';
import { getEligibleCheckInCharacters } from './RoomCheckInSystem';
import { resolveImgPath } from '../utils/imagePath';
import { AdventurerRank } from '../types';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load'; // 当前模式
  allowSwitchMode?: boolean; // 是否允许切换模式 (标题画面设为 false)
  userId?: number; // 当前用户ID，可选以兼容未登录状态(此时不显示任何存档)
  onSave?: (slotId: number) => Promise<void>;
  onLoad: (slotId: number) => Promise<void>;
  onDelete?: (slotId: number) => Promise<void>;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ 
  isOpen, 
  onClose, 
  mode: initialMode, 
  allowSwitchMode = true,
  userId,
  onSave,
  onLoad,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'load' | 'save'>(initialMode);
  const [slots, setSlots] = useState<GameSaveData[]>([]);
  const [visible, setVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'load' | 'overwrite' | 'delete' | 'save';
    slotId: number;
    message: string;
  } | null>(null);

  // 每次打开或切换标签时刷新列表
  useEffect(() => {
    if (isOpen && userId !== undefined) {
      refreshSlots();
      setActiveTab(initialMode);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen, initialMode, userId]);

  const refreshSlots = async () => {
    if (userId === undefined) return;
    const data = await getSaveSlots(userId);
    setSlots(data);
  };

  const getSlotData = (slotId: number) => slots.find(s => s.slotId === slotId);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  };

  // 计算已入住角色数量（不包括玩家自己 char_1）
  // 与 GameScene.tsx 读档逻辑保持一致：savedCheckedIn 优先，兼容旧存档（无此字段时用 INITIAL 兜底）
  const getCharacterCount = (data: GameSaveData) => {
    const savedCheckedIn: string[] = data.checkedInCharacters ?? INITIAL_CHECKED_IN_CHARACTERS;
    const eligibleFromLevels = getEligibleCheckInCharacters(data.sceneLevels ?? {});
    const merged = Array.from(new Set([...INITIAL_CHECKED_IN_CHARACTERS, ...savedCheckedIn, ...eligibleFromLevels]));
    return merged.filter(id => id !== 'char_1').length;
  };

  const handleSlotClick = (slotId: number) => {
    const existing = getSlotData(slotId);

    if (activeTab === 'save') {
      if (slotId === 0) return; // 自动存档不可手动覆盖
      
      if (existing) {
        setConfirmDialog({
          type: 'overwrite',
          slotId,
          message: `确定要覆盖 [存档 ${slotId}] 吗？\n旧的进度将无法找回。`
        });
      } else {
        // 新存档直接保存，无需确认（或者也可以加）
        doSave(slotId);
      }
    } else {
      // Load 模式
      if (!existing) return;
      setConfirmDialog({
        type: 'load',
        slotId,
        message: `确定要读取 [${slotId === 0 ? '自动存档' : `存档 ${slotId}`}] 吗？\n当前未保存的进度将丢失。`
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, slotId: number) => {
    e.stopPropagation();
    setConfirmDialog({
      type: 'delete',
      slotId,
      message: `确定要删除 [存档 ${slotId}] 吗？\n此操作无法撤销。`
    });
  };

  const doSave = async (slotId: number) => {
    if (onSave) {
      await onSave(slotId);
      await refreshSlots();
      setConfirmDialog(null);
    }
  };

  const doLoad = async (slotId: number) => {
    await onLoad(slotId);
    setConfirmDialog(null);
    onClose();
  };

  const doDelete = async (slotId: number) => {
    if (onDelete) {
      await onDelete(slotId);
      await refreshSlots();
      setConfirmDialog(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[110] flex items-center justify-center pointer-events-auto transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div 
        className={`relative w-[95vw] md:w-[85vw] max-w-2xl flex flex-col h-[85vh] md:h-[75vh] max-h-[800px] rounded-2xl transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        style={{
          background: 'rgba(15,23,42,0.93)',
          border: '1px solid rgba(148,163,184,0.35)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部装饰线 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '48px',
            height: '2px',
            marginTop: '-1px',
            background: `linear-gradient(to right, transparent, ${activeTab === 'load' ? 'rgba(34,211,238,0.8)' : 'rgba(245,158,11,0.8)'}, transparent)`,
          }}
        />

        {/* Header */}
        <div className="p-5 md:p-6 shrink-0 relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: activeTab === 'load' ? 'rgba(34,211,238,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${activeTab === 'load' ? 'rgba(34,211,238,0.25)' : 'rgba(245,158,11,0.25)'}`,
              }}
            >
              <i className={`fa-solid ${activeTab === 'load' ? 'fa-folder-open text-cyan-400' : 'fa-floppy-disk text-amber-400'} text-lg`}></i>
            </div>
            <h2 className="text-xl font-medium text-slate-200 tracking-widest">
              {activeTab === 'load' ? '读取存档' : '保存进度'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-all hover:bg-white/5"
            title="关闭"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div className="w-full h-[1px]" style={{ background: 'rgba(148,163,184,0.12)' }} />

        {/* Tab Switcher - Only show if allowed */}
        {allowSwitchMode && (
          <>
            <div className="flex px-4 shrink-0 relative z-10">
              <button
                onClick={() => setActiveTab('load')}
                className={`flex items-center justify-center gap-2 flex-1 py-4 font-medium tracking-widest text-sm relative transition-colors ${
                  activeTab === 'load' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <i className={`fa-solid fa-folder-open ${activeTab === 'load' ? 'opacity-100' : 'opacity-50'}`}></i>
                读档
                {activeTab === 'load' && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_-2px_8px_rgba(34,211,238,0.5)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('save')}
                className={`flex items-center justify-center gap-2 flex-1 py-4 font-medium tracking-widest text-sm relative transition-colors ${
                  activeTab === 'save' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <i className={`fa-solid fa-floppy-disk ${activeTab === 'save' ? 'opacity-100' : 'opacity-50'}`}></i>
                存档
                {activeTab === 'save' && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-400 shadow-[0_-2px_8px_rgba(245,158,11,0.5)]" />
                )}
              </button>
            </div>
            <div className="w-full h-[1px]" style={{ background: 'rgba(148,163,184,0.12)' }} />
          </>
        )}

        {/* Slots Grid */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar relative z-10 space-y-4">
          <div className="space-y-4">
            {[0, 1, 2, 3].map(slotId => {
              const data = getSlotData(slotId);
              const isAuto = slotId === 0;
              const isEmpty = !data;
              
              // 状态判断
              const isDisabled = activeTab === 'save' && isAuto; // 存档模式下，自动存档位不可选
              
              return (
                <div 
                  key={slotId}
                  onClick={() => !isDisabled && handleSlotClick(slotId)}
                  className={`
                    relative p-5 rounded-xl transition-all duration-300 group
                    ${isDisabled 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isEmpty
                        ? 'cursor-pointer hover:bg-white/5'
                        : 'cursor-pointer hover:bg-white/5 hover:shadow-lg'
                    }
                    ${activeTab === 'load' && isEmpty ? 'opacity-40 pointer-events-none' : ''}
                  `}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(148,163,184,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    {/* Slot Label */}
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-6 rounded-full ${
                        isAuto ? 'bg-cyan-500' : 'bg-amber-500'
                      }`} style={{ boxShadow: isAuto ? '0 0 10px rgba(6,182,212,0.5)' : '0 0 10px rgba(245,158,11,0.5)' }}></div>
                      <span className={`text-sm font-medium tracking-widest ${
                        isAuto ? 'text-cyan-400' : 'text-amber-500'
                      }`}>
                        {isAuto ? '自动存档' : `存档 ${slotId}`}
                      </span>
                    </div>

                    {/* Delete Button */}
                    {!isAuto && !isEmpty && activeTab === 'save' && (
                      <button
                        onClick={(e) => handleDeleteClick(e, slotId)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
                        title="删除存档"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  {isEmpty ? (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                      <i className="fa-solid fa-plus text-xl mr-3 opacity-50"></i>
                      <span className="font-light tracking-widest text-sm">空记录</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-slate-200 tracking-wide truncate">
                        {data.label || '无标题'}
                      </h3>
                      
                      <div className="text-sm text-cyan-400/80 font-light tracking-wider">
                        {formatTime(data.savedAt)}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 font-light mt-2">
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-coins text-amber-400/80"></i>
                          {data.gold?.toLocaleString() || 0} G
                        </span>
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-venus text-purple-400/80"></i>
                          {getCharacterCount(data)} 位角色
                        </span>
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-star-half-stroke text-amber-400/80"></i>
                          {data.adventurerRank || 'E'} 级
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部装饰线 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '48px',
            height: '2px',
            marginBottom: '-1px',
            background: `linear-gradient(to right, transparent, ${activeTab === 'load' ? 'rgba(34,211,238,0.4)' : 'rgba(245,158,11,0.4)'}, transparent)`,
          }}
        />

        {/* Confirmation Modal Overlay */}
        {confirmDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn p-4 rounded-2xl">
            <div 
              className="p-8 rounded-2xl max-w-sm w-full text-center flex flex-col items-center"
              style={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(148,163,184,0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: confirmDialog.type === 'delete' ? 'rgba(239,68,68,0.1)' : confirmDialog.type === 'overwrite' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                  border: `1px solid ${confirmDialog.type === 'delete' ? 'rgba(239,68,68,0.25)' : confirmDialog.type === 'overwrite' ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)'}`,
                }}
              >
                <i className={`text-2xl fa-solid ${
                  confirmDialog.type === 'delete' ? 'fa-triangle-exclamation text-red-500' : 
                  confirmDialog.type === 'overwrite' ? 'fa-floppy-disk text-amber-500' : 'fa-folder-open text-blue-500'
                }`}></i>
              </div>
              
              <p className="text-slate-200 text-base mb-8 whitespace-pre-wrap leading-relaxed font-light tracking-wide">
                {confirmDialog.message}
              </p>

              <div className="flex gap-4 justify-center w-full">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-700/50 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm tracking-widest"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.type === 'save' || confirmDialog.type === 'overwrite') doSave(confirmDialog.slotId);
                    else if (confirmDialog.type === 'load') doLoad(confirmDialog.slotId);
                    else if (confirmDialog.type === 'delete') doDelete(confirmDialog.slotId);
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors text-sm tracking-widest ${
                    confirmDialog.type === 'delete' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 
                    confirmDialog.type === 'overwrite' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SaveLoadModal;
