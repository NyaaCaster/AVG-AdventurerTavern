
import React, { useState, useEffect } from 'react';
import { db, getSaveSlots, GameSaveData } from '../services/db';
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-4xl h-[85vh] bg-[#2c241b] border-2 border-[#9b7a4c] rounded-lg shadow-2xl overflow-hidden flex flex-col relative"
        onClick={e => e.stopPropagation()}
        style={{
            backgroundImage: `url(${resolveImgPath('img/bg/AdventurerTavern/wood_texture_dark.png')}), linear-gradient(to bottom, #2c241b, #1a1512)`,
            backgroundBlendMode: 'overlay'
        }}
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#382b26] border-b border-[#9b7a4c]/50 shrink-0">
          <div className="flex gap-4">
             {/* 读档 Tab */}
             <button
               onClick={() => allowSwitchMode && setActiveTab('load')}
               className={`px-6 py-2 rounded-t-lg font-bold text-lg tracking-wider transition-all border-b-4 ${
                 activeTab === 'load' 
                 ? 'text-[#f0e6d2] border-[#9b7a4c] bg-[#4a3b32]' 
                 : 'text-[#8c7b70] border-transparent hover:text-[#d6cbb8]'
               }`}
             >
               <i className="fa-solid fa-folder-open mr-2"></i>
               读档
             </button>

             {/* 存档 Tab - 仅当允许切换时显示 */}
             {allowSwitchMode && (
               <button
                onClick={() => setActiveTab('save')}
                className={`px-6 py-2 rounded-t-lg font-bold text-lg tracking-wider transition-all border-b-4 ${
                  activeTab === 'save' 
                  ? 'text-[#f0e6d2] border-[#9b7a4c] bg-[#4a3b32]' 
                  : 'text-[#8c7b70] border-transparent hover:text-[#d6cbb8]'
                }`}
               >
                 <i className="fa-solid fa-floppy-disk mr-2"></i>
                 存档
               </button>
             )}
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9b7a4c] hover:text-[#f0e6d2] transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Slots Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1a1512]/50 custom-scrollbar">
          {/* Changed to grid-cols-2 on MD for 2x2 layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-start">
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
                    relative w-full h-28 md:h-40 border-2 rounded-lg flex flex-col transition-all duration-200 group overflow-hidden
                    ${isDisabled 
                      ? 'border-[#3d3226] bg-[#1a1512] opacity-50 cursor-not-allowed' 
                      : 'border-[#5c4d45] bg-[#2a2320] hover:border-[#9b7a4c] hover:bg-[#382b26] cursor-pointer hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    }
                    ${activeTab === 'load' && isEmpty ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {/* Slot Number Label */}
                  <div className={`
                    absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-lg z-10
                    ${isAuto ? 'bg-indigo-900/80 text-indigo-200' : 'bg-[#4a3b32] text-[#9b7a4c]'}
                  `}>
                    {isAuto ? '自动存档' : `存档 ${slotId}`}
                  </div>

                  {/* Delete Button (Only for manual slots in Save mode) */}
                  {!isAuto && !isEmpty && activeTab === 'save' && (
                    <button
                      onClick={(e) => handleDeleteClick(e, slotId)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white transition-colors z-20"
                      title="删除存档"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}

                  {/* Content */}
                  {isEmpty ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#5c4d45]">
                      <i className="fa-solid fa-plus text-3xl mb-2 opacity-50"></i>
                      <span className="font-bold tracking-widest text-sm">---- 空记录 ----</span>
                    </div>
                  ) : (
                    <div className="flex-1 p-4 flex flex-col justify-center relative">
                        {/* Removed Screenshot placeholder */}
                        
                        <div className="flex justify-between items-start mb-2 mt-4 md:mt-2">
                           <h3 className="text-base md:text-lg font-bold text-[#f0e6d2] tracking-wide truncate pr-8">
                             {data.label || '无标题'}
                           </h3>
                        </div>
                        
                        <div className="text-xs md:text-sm text-[#9b7a4c] font-mono mb-2">
                             {formatTime(data.savedAt)}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8c7b70]">
                           <span className="flex items-center gap-1">
                             <i className="fa-solid fa-coins text-amber-600"></i>
                             {data.gold.toLocaleString()} G
                           </span>
                           <span className="flex items-center gap-1">
                             <i className="fa-solid fa-calendar-days text-blue-600"></i>
                             {data.worldState.dateStr} {data.worldState.timeStr}
                           </span>
                           <span className="flex items-center gap-1">
                             <i className="fa-solid fa-location-dot text-red-600"></i>
                             {data.worldState.sceneName}
                           </span>
                        </div>
                        
                        {/* Subtle ID indicator */}
                        <div className="absolute bottom-2 right-2 text-[10px] text-[#5c4d45] font-mono opacity-50">
                            {data.currentSceneId}
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
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn p-4">
            <div className="bg-[#2a2320] border border-[#9b7a4c] p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
              <i className={`text-4xl mb-4 fa-solid ${
                confirmDialog.type === 'delete' ? 'fa-triangle-exclamation text-red-500' : 
                confirmDialog.type === 'overwrite' ? 'fa-floppy-disk text-amber-500' : 'fa-folder-open text-blue-500'
              }`}></i>
              
              <p className="text-[#f0e6d2] text-sm md:text-base mb-6 whitespace-pre-wrap leading-relaxed font-bold">
                {confirmDialog.message}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-5 py-2 rounded border border-[#5c4d45] text-[#8c7b70] hover:text-[#f0e6d2] hover:bg-[#382b26] transition-colors font-bold text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.type === 'save' || confirmDialog.type === 'overwrite') doSave(confirmDialog.slotId);
                    else if (confirmDialog.type === 'load') doLoad(confirmDialog.slotId);
                    else if (confirmDialog.type === 'delete') doDelete(confirmDialog.slotId);
                  }}
                  className={`px-6 py-2 rounded font-bold text-white shadow-lg transition-colors text-sm ${
                    confirmDialog.type === 'delete' ? 'bg-red-700 hover:bg-red-600' : 'bg-[#b45309] hover:bg-[#d97706]'
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
