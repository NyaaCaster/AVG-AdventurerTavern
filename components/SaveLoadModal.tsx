
import React, { useState, useEffect } from 'react';
import { getSaveSlots, GameSaveData } from '../services/db';
import { INITIAL_CHECKED_IN_CHARACTERS } from '../utils/gameConstants';
import { getEligibleCheckInCharacters } from './RoomCheckInSystem';
import { resolveImgPath } from '../utils/imagePath';

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-slate-900/90 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-500 tracking-wider flex items-center">
              <i className={`fa-solid ${activeTab === 'load' ? 'fa-folder-open' : 'fa-floppy-disk'} mr-2 md:mr-3`}></i>
              {activeTab === 'load' ? '读取存档' : '保存进度'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="关闭"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tab Switcher - Only show if allowed */}
        {allowSwitchMode && (
          <div className="px-4 md:px-6 pt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('load')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'load'
                  ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid fa-folder-open ${activeTab === 'load' ? 'text-cyan-400' : 'opacity-70'}`}></i>
              <span className="font-medium tracking-wide">读档</span>
            </button>
            <button
              onClick={() => setActiveTab('save')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'save'
                  ? 'bg-gradient-to-r from-amber-900/40 to-transparent border-l-4 border-amber-500 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid fa-floppy-disk ${activeTab === 'save' ? 'text-amber-400' : 'opacity-70'}`}></i>
              <span className="font-medium tracking-wide">存档</span>
            </button>
          </div>
        )}

        {/* Slots Grid */}
        <div className="overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="space-y-3">
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
                    relative p-4 border rounded-lg transition-all duration-200 group
                    ${isDisabled 
                      ? 'border-slate-700/30 bg-slate-800/20 opacity-50 cursor-not-allowed' 
                      : isEmpty
                        ? 'border-slate-700/30 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/50 cursor-pointer'
                        : 'border-slate-700/30 bg-slate-800/40 hover:border-cyan-500/50 hover:bg-slate-800/60 cursor-pointer hover:shadow-lg'
                    }
                    ${activeTab === 'load' && isEmpty ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    {/* Slot Label */}
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-6 rounded-full ${
                        isAuto ? 'bg-cyan-500' : 'bg-amber-500'
                      }`}></div>
                      <span className={`text-sm font-bold tracking-wide ${
                        isAuto ? 'text-cyan-400' : 'text-amber-500'
                      }`}>
                        {isAuto ? '自动存档' : `存档 ${slotId}`}
                      </span>
                    </div>

                    {/* Delete Button */}
                    {!isAuto && !isEmpty && activeTab === 'save' && (
                      <button
                        onClick={(e) => handleDeleteClick(e, slotId)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                        title="删除存档"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  {isEmpty ? (
                    <div className="flex items-center justify-center py-6 text-slate-600">
                      <i className="fa-solid fa-plus text-2xl mr-2 opacity-50"></i>
                      <span className="font-medium tracking-wide text-sm">空记录</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-100 tracking-wide truncate">
                        {data.label || '无标题'}
                      </h3>
                      
                      <div className="text-xs text-cyan-400 font-mono">
                        {formatTime(data.savedAt)}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-coins text-amber-400"></i>
                          {data.gold?.toLocaleString() || 0} G
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-venus text-purple-400"></i>
                          {getCharacterCount(data)} 位角色
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {confirmDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn p-4">
            <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl p-6 rounded-lg shadow-[0_25px_50px_rgba(0,0,0,0.5)] max-w-sm w-full text-center">
              <i className={`text-4xl mb-4 fa-solid ${
                confirmDialog.type === 'delete' ? 'fa-triangle-exclamation text-red-500' : 
                confirmDialog.type === 'overwrite' ? 'fa-floppy-disk text-amber-500' : 'fa-folder-open text-blue-500'
              }`}></i>
              
              <p className="text-slate-100 text-sm md:text-base mb-6 whitespace-pre-wrap leading-relaxed font-bold">
                {confirmDialog.message}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-bold text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.type === 'save' || confirmDialog.type === 'overwrite') doSave(confirmDialog.slotId);
                    else if (confirmDialog.type === 'load') doLoad(confirmDialog.slotId);
                    else if (confirmDialog.type === 'delete') doDelete(confirmDialog.slotId);
                  }}
                  className={`px-6 py-2 rounded-lg font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-colors text-sm ${
                    confirmDialog.type === 'delete' ? 'bg-red-700 hover:bg-red-600' : 'bg-amber-700 hover:bg-amber-600'
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
