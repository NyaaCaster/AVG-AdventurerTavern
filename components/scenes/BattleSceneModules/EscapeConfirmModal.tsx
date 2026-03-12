import React from 'react';

interface EscapeConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const EscapeConfirmModal: React.FC<EscapeConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#e8dfd1] rounded-xl border-2 border-[#9b7a4c] p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] mx-4 max-w-sm w-full">
        <div className="text-center mb-4">
          <div className="text-lg sm:text-xl font-bold text-[#382b26] mb-2">
            <i className="fa-solid fa-person-running text-amber-600 mr-2" />
            确认逃跑？
          </div>
          <div className="text-sm text-[#5c4d45]">
            逃跑可能会失败，是否尝试逃跑？
          </div>
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 bg-[#d6cbb8] text-[#382b26] rounded-lg border-2 border-[#c7bca8] hover:bg-[#c7bca8] transition-all font-bold text-sm"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 sm:px-6 py-2 bg-[#382b26] text-[#f0e6d2] rounded-lg border-2 border-[#9b7a4c] hover:bg-[#4a3b32] transition-all font-bold text-sm"
          >
            确认逃跑
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscapeConfirmModal;
