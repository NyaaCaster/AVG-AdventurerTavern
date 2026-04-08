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

  return { x: newX, y: newY, width: newWidth, height: newHeight };
};

const validateImageType = (file: File): boolean => {
  return file.type === 'image/jpeg' || file.type === 'image/png';
};

const generateFilename = (userId: number): string => {
  return `${userId}_face.png`;
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
