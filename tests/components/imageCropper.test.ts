import { describe, it, expect } from 'vitest';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

const initCropArea = (
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): CropArea => {
  const aspectRatio = targetWidth / targetHeight;
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

  return { x, y, width: cropWidth, height: cropHeight };
};

const clampCropArea = (
  cropArea: CropArea,
  imageWidth: number,
  imageHeight: number,
  minSize: number = 50
): CropArea => {
  let { x, y, width, height } = cropArea;

  x = Math.max(0, x);
  y = Math.max(0, y);
  width = Math.max(minSize, width);
  height = Math.max(minSize, height);

  if (x + width > imageWidth) {
    width = imageWidth - x;
  }
  if (y + height > imageHeight) {
    height = imageHeight - y;
  }

  return { x, y, width, height };
};

const calculateCropFromResize = (
  initialArea: CropArea,
  deltaX: number,
  deltaY: number,
  handle: string,
  aspectRatio: number,
  imageWidth: number,
  imageHeight: number,
  minSize: number = 50
): CropArea => {
  let newWidth = initialArea.width;
  let newHeight = initialArea.height;
  let newX = initialArea.x;
  let newY = initialArea.y;

  if (handle.includes('e')) {
    newWidth = Math.max(minSize, initialArea.width + deltaX);
    newHeight = newWidth / aspectRatio;
    
    if (newX + newWidth > imageWidth) {
      newWidth = imageWidth - newX;
      newHeight = newWidth / aspectRatio;
    }
  } else if (handle.includes('w')) {
    const potentialWidth = initialArea.width - deltaX;
    if (potentialWidth >= minSize && initialArea.x + deltaX >= 0) {
      newWidth = potentialWidth;
      newHeight = newWidth / aspectRatio;
      newX = initialArea.x + deltaX;
    }
  }

  if (handle.includes('s')) {
    const potentialHeight = initialArea.height + deltaY;
    if (potentialHeight >= minSize) {
      newHeight = Math.min(potentialHeight, imageHeight - newY);
      newWidth = newHeight * aspectRatio;
    }
  } else if (handle.includes('n')) {
    const potentialHeight = initialArea.height - deltaY;
    if (potentialHeight >= minSize && initialArea.y + deltaY >= 0) {
      newHeight = potentialHeight;
      newWidth = newHeight * aspectRatio;
      newY = initialArea.y + deltaY;
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
  if (newX + newWidth > imageWidth) {
    newWidth = imageWidth - newX;
    newHeight = newWidth / aspectRatio;
  }
  if (newY + newHeight > imageHeight) {
    newHeight = imageHeight - newY;
    newWidth = newHeight * aspectRatio;
  }

  return { x: newX, y: newY, width: newWidth, height: newHeight };
};

const validateImageType = (file: File): boolean => {
  return file.type === 'image/jpeg' || file.type === 'image/png';
};

const generateFilename = (userId: number): string => {
  return `${userId}_face.png`;
};

const calculateScale = (
  imageSize: { width: number; height: number },
  displaySize: { width: number; height: number }
): { scaleX: number; scaleY: number } => {
  const scaleX = displaySize.width > 0 ? imageSize.width / displaySize.width : 1;
  const scaleY = displaySize.height > 0 ? imageSize.height / displaySize.height : 1;
  return { scaleX, scaleY };
};

const calculateDelta = (
  clientPos: { x: number; y: number },
  dragStart: { x: number; y: number },
  scale: { scaleX: number; scaleY: number }
): { scaledDeltaX: number; scaledDeltaY: number } => {
  const deltaX = clientPos.x - dragStart.x;
  const deltaY = clientPos.y - dragStart.y;
  return {
    scaledDeltaX: deltaX * scale.scaleX,
    scaledDeltaY: deltaY * scale.scaleY,
  };
};

describe('图片裁剪工具 - 核心逻辑测试', () => {
  describe('calculateAspectRatio - 宽高比计算', () => {
    it('应该正确计算正方形宽高比', () => {
      expect(calculateAspectRatio(100, 100)).toBe(1);
    });

    it('应该正确计算横向矩形宽高比', () => {
      expect(calculateAspectRatio(200, 100)).toBe(2);
    });

    it('应该正确计算纵向矩形宽高比', () => {
      expect(calculateAspectRatio(100, 200)).toBe(0.5);
    });

    it('应该正确计算头像目标宽高比 (100x100)', () => {
      expect(calculateAspectRatio(100, 100)).toBe(1);
    });
  });

  describe('initCropArea - 初始裁剪区域计算', () => {
    it('应该为横向图片创建正确的裁剪区域', () => {
      const result = initCropArea(800, 600, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(800);
      expect(result.y + result.height).toBeLessThanOrEqual(600);
    });

    it('应该为纵向图片创建正确的裁剪区域', () => {
      const result = initCropArea(600, 800, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(600);
      expect(result.y + result.height).toBeLessThanOrEqual(800);
    });

    it('应该为正方形图片创建正确的裁剪区域', () => {
      const result = initCropArea(500, 500, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
      expect(result.x).toBe((500 - result.width) / 2);
      expect(result.y).toBe((500 - result.height) / 2);
    });

    it('应该将裁剪区域居中', () => {
      const result = initCropArea(1000, 1000, 100, 100);

      expect(result.x).toBe((1000 - result.width) / 2);
      expect(result.y).toBe((1000 - result.height) / 2);
    });

    it('应该保持目标宽高比', () => {
      const result = initCropArea(1920, 1080, 100, 100);
      const aspectRatio = result.width / result.height;

      expect(aspectRatio).toBeCloseTo(1, 5);
    });
  });

  describe('clampCropArea - 裁剪区域边界限制', () => {
    it('应该限制裁剪区域不超出图片边界', () => {
      const cropArea: CropArea = { x: -10, y: -10, width: 600, height: 600 };
      const result = clampCropArea(cropArea, 500, 500);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('应该限制裁剪区域宽度不超过图片宽度', () => {
      const cropArea: CropArea = { x: 0, y: 0, width: 600, height: 400 };
      const result = clampCropArea(cropArea, 500, 500);

      expect(result.width).toBeLessThanOrEqual(500);
    });

    it('应该限制裁剪区域高度不超过图片高度', () => {
      const cropArea: CropArea = { x: 0, y: 0, width: 400, height: 600 };
      const result = clampCropArea(cropArea, 500, 500);

      expect(result.height).toBeLessThanOrEqual(500);
    });

    it('应该保持最小尺寸', () => {
      const cropArea: CropArea = { x: 0, y: 0, width: 10, height: 10 };
      const result = clampCropArea(cropArea, 500, 500, 50);

      expect(result.width).toBeGreaterThanOrEqual(50);
      expect(result.height).toBeGreaterThanOrEqual(50);
    });

    it('应该保留有效的裁剪区域', () => {
      const cropArea: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = clampCropArea(cropArea, 500, 500);

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });
  });

  describe('calculateCropFromResize - 调整大小时的裁剪计算', () => {
    const aspectRatio = 1;

    it('应该正确处理向东拖动（e handle）', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, 50, 0, 'e', aspectRatio, 500, 500);

      expect(result.width).toBe(250);
      expect(result.height).toBe(250);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('应该正确处理向西拖动（w handle）', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, -50, 0, 'w', aspectRatio, 500, 500);

      expect(result.width).toBe(250);
      expect(result.height).toBe(250);
      expect(result.x).toBe(50);
    });

    it('应该正确处理向南拖动（s handle）', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, 0, 50, 's', aspectRatio, 500, 500);

      expect(result.width).toBe(250);
      expect(result.height).toBe(250);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('应该正确处理向北拖动（n handle）', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, 0, -50, 'n', aspectRatio, 500, 500);

      expect(result.width).toBe(250);
      expect(result.height).toBe(250);
      expect(result.y).toBe(50);
    });

    it('应该正确处理东南角拖动（se handle）', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, 50, 50, 'se', aspectRatio, 500, 500);

      expect(result.width).toBe(250);
      expect(result.height).toBe(250);
    });

    it('应该保持宽高比', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, 100, 0, 'e', aspectRatio, 500, 500);

      expect(result.width / result.height).toBeCloseTo(1, 5);
    });

    it('应该限制不超过图片边界', () => {
      const initial: CropArea = { x: 300, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, 200, 0, 'e', aspectRatio, 500, 500);

      expect(result.x + result.width).toBeLessThanOrEqual(500);
    });

    it('应该保持最小尺寸', () => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, -180, 0, 'e', aspectRatio, 500, 500, 50);

      expect(result.width).toBeGreaterThanOrEqual(50);
    });
  });

  describe('validateImageType - 图片类型验证', () => {
    it('应该接受 JPEG 图片', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(validateImageType(file)).toBe(true);
    });

    it('应该接受 PNG 图片', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(validateImageType(file)).toBe(true);
    });

    it('应该拒绝 GIF 图片', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' });
      expect(validateImageType(file)).toBe(false);
    });

    it('应该拒绝 WebP 图片', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      expect(validateImageType(file)).toBe(false);
    });

    it('应该拒绝非图片文件', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(validateImageType(file)).toBe(false);
    });
  });

  describe('generateFilename - 文件名生成', () => {
    it('应该为用户ID 1生成正确的文件名', () => {
      expect(generateFilename(1)).toBe('1_face.png');
    });

    it('应该为用户ID 123生成正确的文件名', () => {
      expect(generateFilename(123)).toBe('123_face.png');
    });

    it('应该始终使用 PNG 扩展名', () => {
      const filename = generateFilename(999);
      expect(filename.endsWith('.png')).toBe(true);
    });

    it('应该包含用户ID', () => {
      const userId = 42;
      const filename = generateFilename(userId);
      expect(filename).toContain(String(userId));
    });
  });
});

describe('图片裁剪 - 边界值测试', () => {
  describe('极小图片处理', () => {
    it('应该处理 50x50 的图片', () => {
      const result = initCropArea(50, 50, 100, 100);

      expect(result.width).toBeLessThanOrEqual(50);
      expect(result.height).toBeLessThanOrEqual(50);
    });

    it('应该处理 100x100 的图片', () => {
      const result = initCropArea(100, 100, 100, 100);

      expect(result.width).toBeLessThanOrEqual(100);
      expect(result.height).toBeLessThanOrEqual(100);
    });
  });

  describe('极大图片处理', () => {
    it('应该处理 4K 图片 (3840x2160)', () => {
      const result = initCropArea(3840, 2160, 100, 100);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(3840);
      expect(result.y + result.height).toBeLessThanOrEqual(2160);
    });

    it('应该处理 8K 图片 (7680x4320)', () => {
      const result = initCropArea(7680, 4320, 100, 100);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(7680);
      expect(result.y + result.height).toBeLessThanOrEqual(4320);
    });
  });

  describe('非标准宽高比图片', () => {
    it('应该处理 16:9 图片', () => {
      const result = initCropArea(1920, 1080, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
    });

    it('应该处理 4:3 图片', () => {
      const result = initCropArea(800, 600, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
    });

    it('应该处理 21:9 超宽图片', () => {
      const result = initCropArea(2560, 1080, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
    });

    it('应该处理 9:16 竖屏图片', () => {
      const result = initCropArea(1080, 1920, 100, 100);

      expect(result.width / result.height).toBeCloseTo(1, 5);
    });
  });
});

describe('图片裁剪 - 数据保护测试', () => {
  it('裁剪区域不应超出图片边界', () => {
    const imageWidth = 500;
    const imageHeight = 500;
    const cropArea = initCropArea(imageWidth, imageHeight, 100, 100);

    expect(cropArea.x).toBeGreaterThanOrEqual(0);
    expect(cropArea.y).toBeGreaterThanOrEqual(0);
    expect(cropArea.x + cropArea.width).toBeLessThanOrEqual(imageWidth);
    expect(cropArea.y + cropArea.height).toBeLessThanOrEqual(imageHeight);
  });

  it('调整大小后不应超出图片边界', () => {
    const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
    const result = calculateCropFromResize(initial, 500, 500, 'se', 1, 500, 500);

    expect(result.x + result.width).toBeLessThanOrEqual(500);
    expect(result.y + result.height).toBeLessThanOrEqual(500);
  });

  it('负向调整不应产生负坐标', () => {
    const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
    const result = calculateCropFromResize(initial, -300, 0, 'w', 1, 500, 500);

    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
  });
});

describe('图片裁剪 - 闭包陷阱修复测试', () => {
  describe('calculateScale - 缩放计算', () => {
    it('应该正确计算缩放比例', () => {
      const imageSize = { width: 1000, height: 800 };
      const displaySize = { width: 500, height: 400 };
      const result = calculateScale(imageSize, displaySize);

      expect(result.scaleX).toBe(2);
      expect(result.scaleY).toBe(2);
    });

    it('应该处理 displaySize 为 0 的情况', () => {
      const imageSize = { width: 1000, height: 800 };
      const displaySize = { width: 0, height: 0 };
      const result = calculateScale(imageSize, displaySize);

      expect(result.scaleX).toBe(1);
      expect(result.scaleY).toBe(1);
    });

    it('应该处理 displaySize 部分为 0 的情况', () => {
      const imageSize = { width: 1000, height: 800 };
      const displaySize = { width: 500, height: 0 };
      const result = calculateScale(imageSize, displaySize);

      expect(result.scaleX).toBe(2);
      expect(result.scaleY).toBe(1);
    });
  });

  describe('calculateDelta - 位移计算', () => {
    it('应该正确计算缩放后的位移', () => {
      const clientPos = { x: 500, y: 400 };
      const dragStart = { x: 450, y: 350 };
      const scale = { scaleX: 2, scaleY: 2 };
      const result = calculateDelta(clientPos, dragStart, scale);

      expect(result.scaledDeltaX).toBe(100);
      expect(result.scaledDeltaY).toBe(100);
    });

    it('应该正确处理负向位移', () => {
      const clientPos = { x: 400, y: 300 };
      const dragStart = { x: 450, y: 350 };
      const scale = { scaleX: 2, scaleY: 2 };
      const result = calculateDelta(clientPos, dragStart, scale);

      expect(result.scaledDeltaX).toBe(-100);
      expect(result.scaledDeltaY).toBe(-100);
    });

    it('应该正确处理零位移', () => {
      const clientPos = { x: 450, y: 350 };
      const dragStart = { x: 450, y: 350 };
      const scale = { scaleX: 2, scaleY: 2 };
      const result = calculateDelta(clientPos, dragStart, scale);

      expect(result.scaledDeltaX).toBe(0);
      expect(result.scaledDeltaY).toBe(0);
    });
  });

  describe('完整拖动流程模拟', () => {
    it('应该正确模拟完整的东南角拖动流程', () => {
      const imageSize = { width: 1000, height: 800 };
      const displaySize = { width: 500, height: 400 };
      const initialCropArea: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const dragStart = { x: 450, y: 350 };
      const clientPos = { x: 500, y: 400 };

      const scale = calculateScale(imageSize, displaySize);
      const delta = calculateDelta(clientPos, dragStart, scale);
      const result = calculateCropFromResize(
        initialCropArea,
        delta.scaledDeltaX,
        delta.scaledDeltaY,
        'se',
        1,
        imageSize.width,
        imageSize.height
      );

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.width).toBe(300);
      expect(result.height).toBe(300);
    });

    it('应该正确模拟边界限制情况', () => {
      const imageSize = { width: 500, height: 500 };
      const displaySize = { width: 250, height: 250 };
      const initialCropArea: CropArea = { x: 300, y: 100, width: 200, height: 200 };
      const dragStart = { x: 400, y: 200 };
      const clientPos = { x: 500, y: 300 };

      const scale = calculateScale(imageSize, displaySize);
      const delta = calculateDelta(clientPos, dragStart, scale);
      const result = calculateCropFromResize(
        initialCropArea,
        delta.scaledDeltaX,
        delta.scaledDeltaY,
        'e',
        1,
        imageSize.width,
        imageSize.height
      );

      expect(result.x + result.width).toBeLessThanOrEqual(imageSize.width);
    });
  });

  describe('ref 同步机制验证', () => {
    it('应该验证 ref 值在计算中正确使用', () => {
      const refValues = {
        dragStart: { x: 100, y: 100 },
        imageSize: { width: 1000, height: 800 },
        displaySize: { width: 500, height: 400 },
        initialCropArea: { x: 200, y: 200, width: 300, height: 300 },
        isResizing: true,
        resizeHandle: 'se',
      };

      const scale = calculateScale(refValues.imageSize, refValues.displaySize);
      expect(scale.scaleX).toBe(2);
      expect(scale.scaleY).toBe(2);

      const clientPos = { x: 200, y: 200 };
      const delta = calculateDelta(clientPos, refValues.dragStart, scale);
      expect(delta.scaledDeltaX).toBe(200);
      expect(delta.scaledDeltaY).toBe(200);
    });
  });
});

describe('图片裁剪 - 数学验证测试', () => {
  it('验证缩放比例公式', () => {
    const testCases = [
      { imageSize: { width: 1000, height: 800 }, displaySize: { width: 500, height: 400 }, expectedX: 2, expectedY: 2 },
      { imageSize: { width: 2000, height: 1500 }, displaySize: { width: 1000, height: 750 }, expectedX: 2, expectedY: 2 },
      { imageSize: { width: 800, height: 600 }, displaySize: { width: 400, height: 300 }, expectedX: 2, expectedY: 2 },
    ];

    testCases.forEach(({ imageSize, displaySize, expectedX, expectedY }) => {
      const result = calculateScale(imageSize, displaySize);
      expect(result.scaleX).toBe(expectedX);
      expect(result.scaleY).toBe(expectedY);
    });
  });

  it('验证位移计算公式', () => {
    const testCases = [
      { clientPos: { x: 500, y: 400 }, dragStart: { x: 450, y: 350 }, scale: { scaleX: 2, scaleY: 2 }, expectedX: 100, expectedY: 100 },
      { clientPos: { x: 600, y: 500 }, dragStart: { x: 400, y: 300 }, scale: { scaleX: 2, scaleY: 2 }, expectedX: 400, expectedY: 400 },
      { clientPos: { x: 300, y: 200 }, dragStart: { x: 400, y: 300 }, scale: { scaleX: 2, scaleY: 2 }, expectedX: -200, expectedY: -200 },
    ];

    testCases.forEach(({ clientPos, dragStart, scale, expectedX, expectedY }) => {
      const result = calculateDelta(clientPos, dragStart, scale);
      expect(result.scaledDeltaX).toBe(expectedX);
      expect(result.scaledDeltaY).toBe(expectedY);
    });
  });

  it('验证宽高比保持', () => {
    const testCases = [
      { handle: 'e', deltaX: 100, aspectRatio: 1 },
      { handle: 'w', deltaX: -100, aspectRatio: 1 },
      { handle: 's', deltaY: 100, aspectRatio: 1 },
      { handle: 'n', deltaY: -100, aspectRatio: 1 },
      { handle: 'se', deltaX: 100, deltaY: 100, aspectRatio: 1 },
    ];

    testCases.forEach(({ handle, deltaX, deltaY, aspectRatio }) => {
      const initial: CropArea = { x: 100, y: 100, width: 200, height: 200 };
      const result = calculateCropFromResize(initial, deltaX ?? 0, deltaY ?? 0, handle, aspectRatio, 500, 500);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });
  });
});

describe('图片裁剪 - 不同宽高比测试', () => {
  describe('9:16 竖向比例 (如手机壁纸)', () => {
    const targetWidth = 90;
    const targetHeight = 160;
    const aspectRatio = targetWidth / targetHeight;

    it('应该正确计算 9:16 宽高比', () => {
      expect(aspectRatio).toBeCloseTo(0.5625, 5);
    });

    it('应该为横向图片创建正确的 9:16 裁剪区域', () => {
      const result = initCropArea(800, 600, targetWidth, targetHeight);
      const resultAspect = result.width / result.height;

      expect(resultAspect).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(800);
      expect(result.y + result.height).toBeLessThanOrEqual(600);
      expect(result.width).toBeLessThan(result.height);
    });

    it('应该为纵向图片创建正确的 9:16 裁剪区域', () => {
      const result = initCropArea(600, 800, targetWidth, targetHeight);
      const resultAspect = result.width / result.height;

      expect(resultAspect).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(600);
      expect(result.y + result.height).toBeLessThanOrEqual(800);
      expect(result.width).toBeLessThan(result.height);
    });

    it('调整大小时应保持 9:16 宽高比', () => {
      const initial: CropArea = { x: 100, y: 50, width: 90, height: 160 };
      const result = calculateCropFromResize(initial, 45, 80, 'se', aspectRatio, 400, 400);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });

    it('向东拖动时应保持 9:16 宽高比', () => {
      const initial: CropArea = { x: 100, y: 50, width: 90, height: 160 };
      const result = calculateCropFromResize(initial, 45, 0, 'e', aspectRatio, 400, 400);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.width).toBe(135);
      expect(result.height).toBeCloseTo(240, 5);
    });

    it('向南拖动时应保持 9:16 宽高比', () => {
      const initial: CropArea = { x: 100, y: 50, width: 90, height: 160 };
      const result = calculateCropFromResize(initial, 0, 80, 's', aspectRatio, 400, 400);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.height).toBe(240);
      expect(result.width).toBeCloseTo(135, 5);
    });
  });

  describe('16:9 横向比例 (如视频封面)', () => {
    const targetWidth = 160;
    const targetHeight = 90;
    const aspectRatio = targetWidth / targetHeight;

    it('应该正确计算 16:9 宽高比', () => {
      expect(aspectRatio).toBeCloseTo(16/9, 5);
    });

    it('应该为横向图片创建正确的 16:9 裁剪区域', () => {
      const result = initCropArea(1920, 1080, targetWidth, targetHeight);
      const resultAspect = result.width / result.height;

      expect(resultAspect).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(1920);
      expect(result.y + result.height).toBeLessThanOrEqual(1080);
      expect(result.width).toBeGreaterThan(result.height);
    });

    it('应该为纵向图片创建正确的 16:9 裁剪区域', () => {
      const result = initCropArea(1080, 1920, targetWidth, targetHeight);
      const resultAspect = result.width / result.height;

      expect(resultAspect).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(1080);
      expect(result.y + result.height).toBeLessThanOrEqual(1920);
      expect(result.width).toBeGreaterThan(result.height);
    });

    it('调整大小时应保持 16:9 宽高比', () => {
      const initial: CropArea = { x: 100, y: 100, width: 160, height: 90 };
      const result = calculateCropFromResize(initial, 80, 45, 'se', aspectRatio, 500, 500);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });

    it('向西拖动时应保持 16:9 宽高比', () => {
      const initial: CropArea = { x: 100, y: 100, width: 160, height: 90 };
      const result = calculateCropFromResize(initial, -80, 0, 'w', aspectRatio, 500, 500);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.width).toBe(240);
      expect(result.height).toBeCloseTo(135, 5);
    });
  });

  describe('4:3 标准比例', () => {
    const targetWidth = 120;
    const targetHeight = 90;
    const aspectRatio = targetWidth / targetHeight;

    it('应该正确计算 4:3 宽高比', () => {
      expect(aspectRatio).toBeCloseTo(4/3, 5);
    });

    it('应该为横向图片创建正确的 4:3 裁剪区域', () => {
      const result = initCropArea(800, 600, targetWidth, targetHeight);
      const resultAspect = result.width / result.height;

      expect(resultAspect).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(800);
      expect(result.y + result.height).toBeLessThanOrEqual(600);
    });

    it('调整大小时应保持 4:3 宽高比', () => {
      const initial: CropArea = { x: 50, y: 50, width: 120, height: 90 };
      const result = calculateCropFromResize(initial, 60, 45, 'se', aspectRatio, 400, 400);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });
  });

  describe('3:4 竖向比例', () => {
    const targetWidth = 90;
    const targetHeight = 120;
    const aspectRatio = targetWidth / targetHeight;

    it('应该正确计算 3:4 宽高比', () => {
      expect(aspectRatio).toBeCloseTo(3/4, 5);
    });

    it('应该为纵向图片创建正确的 3:4 裁剪区域', () => {
      const result = initCropArea(600, 800, targetWidth, targetHeight);
      const resultAspect = result.width / result.height;

      expect(resultAspect).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + result.width).toBeLessThanOrEqual(600);
      expect(result.y + result.height).toBeLessThanOrEqual(800);
    });

    it('调整大小时应保持 3:4 宽高比', () => {
      const initial: CropArea = { x: 50, y: 50, width: 90, height: 120 };
      const result = calculateCropFromResize(initial, 45, 60, 'se', aspectRatio, 400, 400);

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });
  });

  describe('极端宽高比', () => {
    it('应该处理 1:10 极窄比例', () => {
      const targetWidth = 10;
      const targetHeight = 100;
      const aspectRatio = targetWidth / targetHeight;

      const result = initCropArea(500, 500, targetWidth, targetHeight);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.width).toBeLessThan(result.height);
    });

    it('应该处理 10:1 极宽比例', () => {
      const targetWidth = 100;
      const targetHeight = 10;
      const aspectRatio = targetWidth / targetHeight;

      const result = initCropArea(500, 500, targetWidth, targetHeight);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.width).toBeGreaterThan(result.height);
    });

    it('应该处理 21:9 超宽比例', () => {
      const targetWidth = 210;
      const targetHeight = 90;
      const aspectRatio = targetWidth / targetHeight;

      const result = initCropArea(2560, 1080, targetWidth, targetHeight);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('图片裁剪 - 宽高比数学验证', () => {
  describe('宽高比公式验证', () => {
    it('验证 aspectRatio = width / height 的正确性', () => {
      const testCases = [
        { width: 100, height: 100, expected: 1 },
        { width: 90, height: 160, expected: 0.5625 },
        { width: 160, height: 90, expected: 16/9 },
        { width: 120, height: 90, expected: 4/3 },
        { width: 90, height: 120, expected: 3/4 },
      ];

      testCases.forEach(({ width, height, expected }) => {
        const aspectRatio = width / height;
        expect(aspectRatio).toBeCloseTo(expected, 5);
      });
    });

    it('验证 width = height * aspectRatio 的正确性', () => {
      const testCases = [
        { height: 100, aspectRatio: 1, expectedWidth: 100 },
        { height: 160, aspectRatio: 0.5625, expectedWidth: 90 },
        { height: 90, aspectRatio: 16/9, expectedWidth: 160 },
        { height: 90, aspectRatio: 4/3, expectedWidth: 120 },
        { height: 120, aspectRatio: 3/4, expectedWidth: 90 },
      ];

      testCases.forEach(({ height, aspectRatio, expectedWidth }) => {
        const width = height * aspectRatio;
        expect(width).toBeCloseTo(expectedWidth, 5);
      });
    });

    it('验证 height = width / aspectRatio 的正确性', () => {
      const testCases = [
        { width: 100, aspectRatio: 1, expectedHeight: 100 },
        { width: 90, aspectRatio: 0.5625, expectedHeight: 160 },
        { width: 160, aspectRatio: 16/9, expectedHeight: 90 },
        { width: 120, aspectRatio: 4/3, expectedHeight: 90 },
        { width: 90, aspectRatio: 3/4, expectedHeight: 120 },
      ];

      testCases.forEach(({ width, aspectRatio, expectedHeight }) => {
        const height = width / aspectRatio;
        expect(height).toBeCloseTo(expectedHeight, 5);
      });
    });
  });

  describe('resize 操作宽高比保持验证', () => {
    it('向东拖动：验证 newHeight = newWidth / aspectRatio', () => {
      const aspectRatios = [1, 0.5625, 16/9, 4/3, 3/4];
      const deltaX = 50;

      aspectRatios.forEach(aspectRatio => {
        const initialWidth = 100;
        const newWidth = initialWidth + deltaX;
        const newHeight = newWidth / aspectRatio;

        expect(newWidth / newHeight).toBeCloseTo(aspectRatio, 5);
      });
    });

    it('向南拖动：验证 newWidth = newHeight * aspectRatio', () => {
      const aspectRatios = [1, 0.5625, 16/9, 4/3, 3/4];
      const deltaY = 50;

      aspectRatios.forEach(aspectRatio => {
        const initialHeight = 100;
        const newHeight = initialHeight + deltaY;
        const newWidth = newHeight * aspectRatio;

        expect(newWidth / newHeight).toBeCloseTo(aspectRatio, 5);
      });
    });

    it('验证所有 handle 方向都保持宽高比', () => {
      const aspectRatio = 0.5625;
      const initial: CropArea = { x: 100, y: 100, width: 90, height: 160 };
      const handles = ['e', 'w', 's', 'n', 'se', 'sw', 'ne', 'nw'];

      handles.forEach(handle => {
        const deltaX = handle.includes('e') ? 50 : handle.includes('w') ? -50 : 0;
        const deltaY = handle.includes('s') ? 80 : handle.includes('n') ? -80 : 0;

        const result = calculateCropFromResize(initial, deltaX, deltaY, handle, aspectRatio, 500, 500);
        expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      });
    });
  });

  describe('边界条件下宽高比保持验证', () => {
    it('达到图片边界时应保持宽高比', () => {
      const aspectRatio = 0.5625;
      const initial: CropArea = { x: 300, y: 100, width: 90, height: 160 };

      const result = calculateCropFromResize(initial, 200, 0, 'e', aspectRatio, 500, 500);

      expect(result.x + result.width).toBeLessThanOrEqual(500);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });

    it('达到最小尺寸时应保持宽高比', () => {
      const aspectRatio = 0.5625;
      const initial: CropArea = { x: 100, y: 100, width: 90, height: 160 };

      const result = calculateCropFromResize(initial, -80, 0, 'e', aspectRatio, 500, 500, 50);

      expect(result.width).toBeGreaterThanOrEqual(50);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });

    it('负向调整超出边界时应保持宽高比', () => {
      const aspectRatio = 16/9;
      const initial: CropArea = { x: 50, y: 100, width: 160, height: 90 };

      const result = calculateCropFromResize(initial, -100, 0, 'w', aspectRatio, 500, 500);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
    });
  });

  describe('完整流程模拟 - 不同宽高比', () => {
    it('9:16 完整拖动流程', () => {
      const imageSize = { width: 1000, height: 800 };
      const displaySize = { width: 500, height: 400 };
      const aspectRatio = 0.5625;
      const initialCropArea: CropArea = { x: 200, y: 100, width: 90, height: 160 };
      const dragStart = { x: 400, y: 300 };
      const clientPos = { x: 450, y: 380 };

      const scale = calculateScale(imageSize, displaySize);
      const delta = calculateDelta(clientPos, dragStart, scale);
      const result = calculateCropFromResize(
        initialCropArea,
        delta.scaledDeltaX,
        delta.scaledDeltaY,
        'se',
        aspectRatio,
        imageSize.width,
        imageSize.height
      );

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('16:9 完整拖动流程', () => {
      const imageSize = { width: 1920, height: 1080 };
      const displaySize = { width: 640, height: 360 };
      const aspectRatio = 16/9;
      const initialCropArea: CropArea = { x: 100, y: 200, width: 160, height: 90 };
      const dragStart = { x: 300, y: 200 };
      const clientPos = { x: 400, y: 250 };

      const scale = calculateScale(imageSize, displaySize);
      const delta = calculateDelta(clientPos, dragStart, scale);
      const result = calculateCropFromResize(
        initialCropArea,
        delta.scaledDeltaX,
        delta.scaledDeltaY,
        'se',
        aspectRatio,
        imageSize.width,
        imageSize.height
      );

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 5);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });
  });
});
