import React from 'react';

interface PartyEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartyEquipmentModal: React.FC<PartyEquipmentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#111827] border border-slate-600 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">装备变更</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            title="关闭"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p className="text-sm text-slate-400">该功能暂未实现，敬请期待。</p>
      </div>
    </div>
  );
};

export default PartyEquipmentModal;
