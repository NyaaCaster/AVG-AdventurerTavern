import React, { useRef, useState, useCallback } from 'react';

interface QuantityControlProps {
  value: number;
  min?: number;
  max?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange: (val: number) => void;
  btnClassName?: (enabled: boolean) => string;
  inputClassName?: string;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  value,
  min = 0,
  max,
  onIncrease,
  onDecrease,
  onChange,
  btnClassName,
  inputClassName,
}) => {
  const [inputVal, setInputVal] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeat = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startRepeat = useCallback((fn: () => void) => {
    fn();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(fn, 80);
    }, 400);
  }, []);

  const canDec = value > min;
  const canInc = max === undefined || value < max;

  const defaultBtnCls = (enabled: boolean) =>
    `w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center font-bold text-xs transition-all ${
      enabled ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#2c241b]' : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
    }`;

  const commitInput = (raw: string) => {
    setInputVal(null);
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    const clamped = Math.max(min, max !== undefined ? Math.min(max, n) : n);
    onChange(clamped);
  };

  return (
    <div className="flex items-center gap-0.5 md:gap-1">
      <button
        onMouseDown={() => canDec && startRepeat(onDecrease)}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchStart={e => { e.preventDefault(); canDec && startRepeat(onDecrease); }}
        onTouchEnd={stopRepeat}
        disabled={!canDec}
        className={(btnClassName ?? defaultBtnCls)(canDec)}
      >-</button>

      {inputVal !== null ? (
        <input
          type="number"
          inputMode="numeric"
          value={inputVal}
          autoFocus
          onChange={e => setInputVal(e.target.value)}
          onBlur={e => commitInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="w-10 md:w-12 text-center font-bold text-[#382b26] text-xs bg-white border border-[#9b7a4c] rounded outline-none px-0.5"
          style={{ MozAppearance: 'textfield' } as React.CSSProperties}
        />
      ) : (
        <span
          className={inputClassName ?? 'w-5 md:w-7 text-center font-bold text-[#382b26] text-xs cursor-text select-none'}
          onClick={() => setInputVal(String(value))}
          title="点击直接输入数量"
        >
          {value}
        </span>
      )}

      <button
        onMouseDown={() => canInc && startRepeat(onIncrease)}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchStart={e => { e.preventDefault(); canInc && startRepeat(onIncrease); }}
        onTouchEnd={stopRepeat}
        disabled={!canInc}
        className={(btnClassName ?? defaultBtnCls)(canInc)}
      >+</button>
    </div>
  );
};

export default QuantityControl;