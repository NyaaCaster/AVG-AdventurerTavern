import React, { useEffect, useState } from 'react';

interface RestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RestModal: React.FC<RestModalProps> = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 稍作延迟再淡入，给存档一点时间
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className={`relative w-full max-w-md mx-4 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        style={{
          background: 'rgba(15,23,42,0.93)',
          border: '1px solid rgba(148,163,184,0.35)',
          borderRadius: '14px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* 顶部装饰线 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '48px',
            height: '2px',
            marginTop: '-1px',
            background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.8), transparent)',
          }}
        />

        <div className="px-8 pt-8 pb-6">
          {/* 图标区 */}
          <div className="flex justify-center mb-5">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                boxShadow: '0 0 20px rgba(245,158,11,0.15)',
              }}
            >
              <i className="fa-solid fa-moon text-amber-400 text-2xl" />
            </div>
          </div>

          {/* 系统标签 */}
          <div className="flex justify-center mb-4">
            <span
              className="text-xs tracking-[0.25em] uppercase font-medium"
              style={{ color: 'rgba(148,163,184,0.6)' }}
            >
              System &nbsp;·&nbsp; Auto Saved
            </span>
          </div>

          {/* 分隔线 */}
          <div className="mb-6" style={{ height: '1px', background: 'rgba(148,163,184,0.12)' }} />

          {/* 主文字 */}
          <div className="text-center space-y-3 mb-7">
            <p className="text-slate-100 text-base leading-relaxed font-light">
              好了。
            </p>
            <p className="text-slate-200 text-base leading-relaxed font-light">
              现在请你关掉游戏，关上设备的屏幕，
              <br />
              闭上眼睛。
            </p>
            <p className="text-slate-300 text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.75)' }}>
              今天的故事已经保存好了。
              <br />
              剩下的，交给梦境吧。
            </p>
          </div>

          {/* 底部提示小字 */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <i className="fa-solid fa-floppy-disk text-xs" style={{ color: 'rgba(16,185,129,0.7)' }} />
            <span className="text-xs tracking-wider" style={{ color: 'rgba(16,185,129,0.65)' }}>
              进度已自动保存至存档槽 0
            </span>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-medium text-sm tracking-widest transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: 'rgba(251,191,36,0.9)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.25)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.6)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(245,158,11,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.15)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.35)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <i className="fa-solid fa-xmark mr-2 opacity-70" />
            我再玩一会儿
          </button>
        </div>

        {/* 底部装饰线 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '48px',
            height: '2px',
            marginBottom: '-1px',
            background: 'linear-gradient(to right, transparent, rgba(34,211,238,0.4), transparent)',
          }}
        />
      </div>
    </div>
  );
};

export default RestModal;