import React, { useState, useEffect } from 'react';
import { getSaveSlots, GameSaveData } from '../services/db';
import { resolveImgPath } from '../utils/imagePath';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load'; // 褰撳墠妯″紡
  allowSwitchMode?: boolean; // 鏄惁鍏佽鍒囨崲妯″紡 (鏍囬鐢婚潰璁句负 false)
  userId?: number; // 褰撳墠鐢ㄦ埛ID锛屽彲閫変互鍏煎鏈櫥褰曠姸鎬?姝ゆ椂涓嶆樉绀轰换浣曞瓨妗?
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

  // 姣忔鎵撳紑鎴栧垏鎹㈡爣绛炬椂鍒锋柊鍒楄〃
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

  // 璁＄畻宸插叆浣忚鑹叉暟閲忥紙涓嶅寘鎷帺瀹惰嚜宸憋級
  const getCharacterCount = (data: GameSaveData) => {
    if (!data.characterStats) return 0;
    // 鎺掗櫎鐜╁鑷繁锛屽彧缁熻 NPC 瑙掕壊
    return Object.keys(data.characterStats).length;
  };

  const handleSlotClick = (slotId: number) => {
    const existing = getSlotData(slotId);

    if (activeTab === 'save') {
      if (slotId === 0) return; // 鑷姩瀛樻。涓嶅彲鎵嬪姩瑕嗙洊
      
      if (existing) {
        setConfirmDialog({
          type: 'overwrite',
          slotId,
          message: `纭畾瑕佽鐩?[瀛樻。 ${slotId}] 鍚楋紵\n鏃х殑杩涘害灏嗘棤娉曟壘鍥炪€俙
        });
      } else {
        // 鏂板瓨妗ｇ洿鎺ヤ繚瀛橈紝鏃犻渶纭锛堟垨鑰呬篃鍙互鍔狅級
        doSave(slotId);
      }
    } else {
      // Load 妯″紡
      if (!existing) return;
      setConfirmDialog({
        type: 'load',
        slotId,
        message: `纭畾瑕佽鍙?[${slotId === 0 ? '鑷姩瀛樻。' : `瀛樻。 ${slotId}`}] 鍚楋紵\n褰撳墠鏈繚瀛樼殑杩涘害灏嗕涪澶便€俙
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, slotId: number) => {
    e.stopPropagation();
    setConfirmDialog({
      type: 'delete',
      slotId,
      message: `纭畾瑕佸垹闄?[瀛樻。 ${slotId}] 鍚楋紵\n姝ゆ搷浣滄棤娉曟挙閿€銆俙
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
              {activeTab === 'load' ? '璇诲彇瀛樻。' : '淇濆瓨杩涘害'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="鍏抽棴"
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
              <span className="font-medium tracking-wide">璇绘。</span>
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
              <span className="font-medium tracking-wide">瀛樻。</span>
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
              
              // 鐘舵€佸垽鏂?              const isDisabled = activeTab === 'save' && isAuto; // 瀛樻。妯″紡涓嬶紝鑷姩瀛樻。浣嶄笉鍙€?              
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
                        {isAuto ? '鑷姩瀛樻。' : `瀛樻。 ${slotId}`}
                      </span>
                    </div>

                    {/* Delete Button */}
                    {!isAuto && !isEmpty && activeTab === 'save' && (
                      <button
                        onClick={(e) => handleDeleteClick(e, slotId)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                        title="鍒犻櫎瀛樻。"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  {isEmpty ? (
                    <div className="flex items-center justify-center py-6 text-slate-600">
                      <i className="fa-solid fa-plus text-2xl mr-2 opacity-50"></i>
                      <span className="font-medium tracking-wide text-sm">绌鸿褰?/span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-100 tracking-wide truncate">
                        {data.label || '鏃犳爣棰?}
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
                          <i className="fa-solid fa-users text-purple-400"></i>
                          {getCharacterCount(data)} 浣嶈鑹?                        </span>
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
                  鍙栨秷
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
                  纭畾
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

