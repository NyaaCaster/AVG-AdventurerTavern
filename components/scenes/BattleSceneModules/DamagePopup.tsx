import React, { useEffect, useState } from 'react';

export type DamagePopupType = 'hpDamage' | 'hpHeal' | 'critical';

export interface DamagePopupData {
  id: string;
  value: number;
  type: DamagePopupType;
  x: number;
  y: number;
}

interface DamagePopupProps {
  popup: DamagePopupData;
  onAnimationEnd: (id: string) => void;
}

const DamagePopup: React.FC<DamagePopupProps> = ({ popup, onAnimationEnd }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onAnimationEnd(popup.id), 300);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [popup.id, onAnimationEnd]);
  
  const getStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      left: popup.x,
      top: popup.y,
      zIndex: 100,
      pointerEvents: 'none',
      fontWeight: 'bold',
      fontSize: popup.type === 'critical' ? '2.25rem' : '1.75rem',
    };
    
    switch (popup.type) {
      case 'hpDamage':
        return {
          ...baseStyle,
          color: '#ff4040',
          textShadow: '0 0 10px rgba(255,64,64,0.5), 0 2px 4px rgba(0,0,0,0.8)',
        };
      case 'hpHeal':
        return {
          ...baseStyle,
          color: '#40ff40',
          textShadow: '0 0 10px rgba(64,255,64,0.5), 0 2px 4px rgba(0,0,0,0.8)',
        };
      case 'critical':
        return {
          ...baseStyle,
          color: '#ffff40',
          textShadow: '0 0 15px rgba(255,255,64,0.7), 0 2px 4px rgba(0,0,0,0.8)',
          fontSize: '2.25rem',
        };
      default:
        return baseStyle;
    }
  };
  
  const getDisplayText = () => {
    switch (popup.type) {
      case 'hpDamage':
        return `-${Math.abs(popup.value)}`;
      case 'hpHeal':
        return `+${Math.abs(popup.value)}`;
      case 'critical':
        return `${Math.abs(popup.value)}!`;
      default:
        return Math.abs(popup.value).toString();
    }
  };
  
  return (
    <div
      className={`damage-popup ${popup.type === 'hpDamage' ? 'hp-damage' : popup.type === 'hpHeal' ? 'hp-heal' : 'critical'} ${isVisible ? '' : 'opacity-0'}`}
      style={getStyle()}
    >
      {getDisplayText()}
    </div>
  );
};

export default DamagePopup;
