import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ImageCropperProps {
  image: string;
  targetWidth: number;
  targetHeight: number;
  onSave: (croppedImage: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  targetWidth,
  targetHeight,
  onSave,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // 所有在 handleMove 中使用的值都用 ref 存储，避免闭包陷阱
  const cropAreaRef = useRef<CropArea>(cropArea);
  const initialCropAreaRef = useRef<CropArea | null>(null);
  const imageSizeRef = useRef(imageSize);
  const displaySizeRef = useRef(displaySize);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeHandleRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  const aspectRatio = targetWidth / targetHeight;

  // 同步 ref
  useEffect(() => {
    cropAreaRef.current = cropArea;
  }, [cropArea]);

  useEffect(() => {
    imageSizeRef.current = imageSize;
  }, [imageSize]);

  useEffect(() => {
    displaySizeRef.current = displaySize;
  }, [displaySize]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    isResizingRef.current = isResizing;
  }, [isResizing]);

  useEffect(() => {
    resizeHandleRef.current = resizeHandle;
  }, [resizeHandle]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = image;
  }, [image]);

  useEffect(() => {
    if (imageLoaded && imageSize.width > 0 && imageSize.height > 0) {
      initCropArea(imageSize.width, imageSize.height);
    }
  }, [imageLoaded, imageSize]);

  const initCropArea = (imgWidth: number, imgHeight: number) => {
    const imgAspect = imgWidth / imgHeight;
    let cropWidth: number;
    let cropHeight: number;

    if (imgAspect > aspectRatio) {
      cropHeight = imgHeight * 0.8;
      cropWidth = cropHeight * aspectRatio;
    } else {
      cropWidth = imgWidth * 0.8;
      cropHeight = cropWidth / aspectRatio;
    }

    const x = (imgWidth - cropWidth) / 2;
    const y = (imgHeight - cropHeight) / 2;

    setCropArea({ x, y, width: cropWidth, height: cropHeight });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    setDisplaySize({ width: rect.width, height: rect.height });
  };

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getEventPosition(e);
    
    // 直接更新 ref，确保立即生效
    dragStartRef.current = { x: pos.x, y: pos.y };
    initialCropAreaRef.current = { ...cropAreaRef.current };

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      // 同时更新 ref，确保 handleMove 能立即获取
      isResizingRef.current = true;
      resizeHandleRef.current = handle;
    } else {
      setIsDragging(true);
      isDraggingRef.current = true;
    }
  };

  // handleMove 完全通过 ref 获取值，不依赖任何会频繁变化的 state
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      
      // 从 ref 获取最新值，避免闭包陷阱
      const currentIsDragging = isDraggingRef.current;
      const currentIsResizing = isResizingRef.current;
      const currentResizeHandle = resizeHandleRef.current;
      const currentDragStart = dragStartRef.current;
      const currentDisplaySize = displaySizeRef.current;
      const currentImageSize = imageSizeRef.current;
      const initial = initialCropAreaRef.current;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - currentDragStart.x;
      const deltaY = clientY - currentDragStart.y;

      const scaleX = currentDisplaySize.width > 0 ? currentImageSize.width / currentDisplaySize.width : 1;
      const scaleY = currentDisplaySize.height > 0 ? currentImageSize.height / currentDisplaySize.height : 1;

      if (currentIsDragging && initial) {
        const scaledDeltaX = deltaX * scaleX;
        const scaledDeltaY = deltaY * scaleY;

        let newX = initial.x + scaledDeltaX;
        let newY = initial.y + scaledDeltaY;

        newX = Math.max(0, Math.min(currentImageSize.width - initial.width, newX));
        newY = Math.max(0, Math.min(currentImageSize.height - initial.height, newY));

        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      } else if (currentIsResizing && currentResizeHandle && initial) {
        const scaledDeltaX = deltaX * scaleX;
        const scaledDeltaY = deltaY * scaleY;
        const minSize = 50;

        let newWidth = initial.width;
        let newHeight = initial.height;
        let newX = initial.x;
        let newY = initial.y;

        if (currentResizeHandle.includes('e')) {
          newWidth = Math.max(minSize, initial.width + scaledDeltaX);
          newHeight = newWidth / aspectRatio;
          
          if (newX + newWidth > currentImageSize.width) {
            newWidth = currentImageSize.width - newX;
            newHeight = newWidth / aspectRatio;
          }
        } else if (currentResizeHandle.includes('w')) {
          const potentialWidth = initial.width - scaledDeltaX;
          if (potentialWidth >= minSize && initial.x + scaledDeltaX >= 0) {
            newWidth = potentialWidth;
            newHeight = newWidth / aspectRatio;
            newX = initial.x + scaledDeltaX;
          }
        }

        if (currentResizeHandle.includes('s')) {
          const potentialHeight = initial.height + scaledDeltaY;
          if (potentialHeight >= minSize) {
            newHeight = Math.min(potentialHeight, currentImageSize.height - newY);
            newWidth = newHeight * aspectRatio;
          }
        } else if (currentResizeHandle.includes('n')) {
          const potentialHeight = initial.height - scaledDeltaY;
          if (potentialHeight >= minSize && initial.y + scaledDeltaY >= 0) {
            newHeight = potentialHeight;
            newWidth = newHeight * aspectRatio;
            newY = initial.y + scaledDeltaY;
          }
        }

        if (newX < 0) {
          newWidth += newX;
          newX = 0;
          newHeight = newWidth / aspectRatio;
        }
        if (newY < 0) {
          newHeight += newY;
          newY = 0;
          newWidth = newHeight * aspectRatio;
        }
        if (newX + newWidth > currentImageSize.width) {
          newWidth = currentImageSize.width - newX;
          newHeight = newWidth / aspectRatio;
        }
        if (newY + newHeight > currentImageSize.height) {
          newHeight = currentImageSize.height - newY;
          newWidth = newHeight * aspectRatio;
        }

        setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    },
    [aspectRatio] // 只依赖常量，不依赖会变化的 state
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeHandleRef.current = null;
    initialCropAreaRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, handleMove, handleEnd]);

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onSave(blob);
          }
        },
        'image/png',
        1.0
      );
    };
    img.src = image;
  };

  const renderResizeHandle = (position: string) => {
    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: '24px',
      height: '24px',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '3px solid #f59e0b',
      borderRadius: '4px',
      zIndex: 20,
      touchAction: 'none',
    };

    const positions: Record<string, React.CSSProperties> = {
      nw: { top: -12, left: -12, cursor: 'nwse-resize' },
      ne: { top: -12, right: -12, cursor: 'nesw-resize' },
      sw: { bottom: -12, left: -12, cursor: 'nesw-resize' },
      se: { bottom: -12, right: -12, cursor: 'nwse-resize' },
    };

    return (
      <div
        key={position}
        style={{ ...handleStyle, ...positions[position] }}
        onMouseDown={(e) => handleStart(e, position)}
        onTouchStart={(e) => handleStart(e, position)}
      />
    );
  };

  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80">
        <div className="text-white text-xl flex items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin"></i>
          加载中...
        </div>
      </div>
    );
  }

  const scaleRatio = displaySize.width > 0 ? cropArea.width / displaySize.width : 0;
  const displayCropArea = {
    x: displaySize.width > 0 ? cropArea.x / (imageSize.width / displaySize.width) : 0,
    y: displaySize.height > 0 ? cropArea.y / (imageSize.height / displaySize.height) : 0,
    width: scaleRatio > 0 ? cropArea.width / scaleRatio : 0,
    height: scaleRatio > 0 ? cropArea.height / scaleRatio : 0,
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-2xl flex flex-col overflow-hidden flex-1">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-950/50 shrink-0">
            <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
              <i className="fa-solid fa-crop"></i>
              裁剪图片
            </h3>
            <span className="text-xs text-slate-400">
              输出尺寸: {targetWidth} × {targetHeight} px
            </span>
          </div>

          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/80 min-h-0"
          >
            <div className="relative inline-block" style={{ maxWidth: '100%', maxHeight: '100%' }}>
              <img
                ref={imageRef}
                src={image}
                alt="裁剪预览"
                onLoad={handleImageLoad}
                className="max-w-full max-h-[50vh] object-contain select-none"
                draggable={false}
              />

              <div
                className="absolute border-2 border-amber-500 cursor-move"
                style={{
                  left: displayCropArea.x,
                  top: displayCropArea.y,
                  width: displayCropArea.width,
                  height: displayCropArea.height,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                }}
                onMouseDown={(e) => handleStart(e)}
                onTouchStart={(e) => handleStart(e)}
              >
                <div className="absolute inset-0 border border-amber-500/30 pointer-events-none">
                  <div className="absolute top-1/3 left-0 right-0 border-t border-amber-500/30"></div>
                  <div className="absolute top-2/3 left-0 right-0 border-t border-amber-500/30"></div>
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-amber-500/30"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-amber-500/30"></div>
                </div>

                {['nw', 'ne', 'sw', 'se'].map(renderResizeHandle)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-950/50 shrink-0">
            <p className="text-xs text-slate-400 hidden md:block">
              <i className="fa-solid fa-hand mr-1"></i>
              拖动裁剪框移动位置，拖动四角调整大小
            </p>
            <p className="text-xs text-slate-400 md:hidden">
              <i className="fa-solid fa-hand-pointer mr-1"></i>
              触摸拖动调整
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <i className="fa-solid fa-xmark"></i>
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <i className="fa-solid fa-check"></i>
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
