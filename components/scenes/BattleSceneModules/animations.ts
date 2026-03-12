export const battleAnimations = {
  shake: {
    animation: 'shake 0.4s ease-in-out',
  },
  fadeOut: {
    animation: 'fadeOut 0.5s ease-out forwards',
  },
  damagePopup: {
    animation: 'damageRise 1.2s ease-out forwards',
  },
  cursorFloat: {
    animation: 'cursorFloat 0.8s ease-in-out infinite',
  },
};

export const shakeElement = (element: HTMLElement) => {
  element.style.animation = 'shake 0.4s ease-in-out';
  setTimeout(() => {
    element.style.animation = '';
  }, 400);
};

export const fadeOutElement = (element: HTMLElement) => {
  element.style.animation = 'fadeOut 0.5s ease-out forwards';
};

export const getDamagePopupPosition = (targetElement: HTMLElement): { x: number; y: number } => {
  const rect = targetElement.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 3,
  };
};
