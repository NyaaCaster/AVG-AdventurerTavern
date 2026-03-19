import { describe, it, expect } from 'vitest';

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const shuffleArray = <T>(array: T[], seed: number): T[] => {
  const result = [...array];
  let currentSeed = Math.abs(seed) + 1;
  
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor(currentSeed / 233280 * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};

describe('seededRandom', () => {
  
  describe('确定性测试', () => {
    
    it('相同种子应产生相同结果', () => {
      const seed = 12345;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed);
      
      expect(r1).toBe(r2);
    });

    it('不同种子应产生不同结果', () => {
      const r1 = seededRandom(1);
      const r2 = seededRandom(2);
      const r3 = seededRandom(3);
      
      const allDifferent = r1 !== r2 || r2 !== r3 || r1 !== r3;
      expect(allDifferent).toBe(true);
    });

    it('连续调用相同种子应产生相同结果', () => {
      const seed = 99999;
      const results1 = [seededRandom(seed), seededRandom(seed), seededRandom(seed)];
      const results2 = [seededRandom(seed), seededRandom(seed), seededRandom(seed)];
      
      expect(results1).toEqual(results2);
    });

    it('种子为0时应返回有效结果', () => {
      const result = seededRandom(0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });

    it('负数种子应返回有效结果', () => {
      const result = seededRandom(-12345);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('范围测试', () => {
    
    it('返回值应在 [0, 1) 范围内', () => {
      for (let seed = 0; seed < 100; seed++) {
        const r = seededRandom(seed);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(1);
      }
    });

    it('大种子值应返回有效结果', () => {
      const largeSeed = Number.MAX_SAFE_INTEGER;
      const result = seededRandom(largeSeed);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });

    it('小数种子应返回有效结果', () => {
      const result = seededRandom(3.14159);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('分布测试', () => {
    
    it('多次调用结果应均匀分布', () => {
      const buckets = [0, 0, 0, 0, 0];
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const r = seededRandom(i);
        const bucketIndex = Math.floor(r * 5);
        buckets[bucketIndex]++;
      }
      
      const expectedPerBucket = iterations / 5;
      const tolerance = expectedPerBucket * 0.5;
      
      buckets.forEach(count => {
        expect(count).toBeGreaterThan(expectedPerBucket - tolerance);
        expect(count).toBeLessThan(expectedPerBucket + tolerance);
      });
    });

    it('连续种子不应产生完全相同的结果序列', () => {
      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(seededRandom(i));
      }
      
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(50);
    });
  });
});

describe('shuffleArray', () => {
  
  describe('确定性测试', () => {
    
    it('相同种子应产生相同洗牌结果', () => {
      const array = [1, 2, 3, 4, 5];
      const seed = 42;
      
      const shuffled1 = shuffleArray(array, seed);
      const shuffled2 = shuffleArray(array, seed);
      
      expect(shuffled1).toEqual(shuffled2);
    });

    it('不同种子应产生不同洗牌结果', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const shuffled1 = shuffleArray(array, 1);
      const shuffled2 = shuffleArray(array, 2);
      
      expect(shuffled1).not.toEqual(shuffled2);
    });

    it('原始数组不应被修改', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      
      shuffleArray(original, 123);
      
      expect(original).toEqual(originalCopy);
    });
  });

  describe('元素保留测试', () => {
    
    it('洗牌后应包含所有原始元素', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(array, 42);
      
      expect(shuffled.sort()).toEqual(array.sort());
    });

    it('洗牌后元素数量应相同', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const shuffled = shuffleArray(array, 999);
      
      expect(shuffled.length).toBe(array.length);
    });

    it('对象数组洗牌后应保持引用', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 3 };
      const array = [obj1, obj2, obj3];
      
      const shuffled = shuffleArray(array, 100);
      
      expect(shuffled).toContain(obj1);
      expect(shuffled).toContain(obj2);
      expect(shuffled).toContain(obj3);
    });
  });

  describe('边缘情况测试', () => {
    
    it('空数组洗牌应返回空数组', () => {
      const result = shuffleArray([], 42);
      expect(result).toEqual([]);
    });

    it('单元素数组洗牌应返回相同数组', () => {
      const result = shuffleArray([1], 42);
      expect(result).toEqual([1]);
    });

    it('双元素数组洗牌应返回包含两个元素的数组', () => {
      const array = [1, 2];
      const result = shuffleArray(array, 42);
      
      expect(result.length).toBe(2);
      expect(result.sort()).toEqual([1, 2]);
    });

    it('种子为0时应正常工作', () => {
      const array = [1, 2, 3, 4, 5];
      const result = shuffleArray(array, 0);
      
      expect(result.length).toBe(5);
      expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('负数种子时应正常工作', () => {
      const array = [1, 2, 3, 4, 5];
      const result = shuffleArray(array, -100);
      
      expect(result.length).toBe(5);
      expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('分布测试', () => {
    
    it('多次洗牌应产生不同的排列', () => {
      const array = [1, 2, 3, 4, 5];
      const results: string[] = [];
      
      for (let seed = 0; seed < 100; seed++) {
        const shuffled = shuffleArray(array, seed);
        results.push(JSON.stringify(shuffled));
      }
      
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(10);
    });

    it('每个位置应均匀分布各元素', () => {
      const array = [1, 2, 3, 4, 5];
      const positionCounts: Record<number, Record<number, number>> = {};
      
      for (let i = 0; i < array.length; i++) {
        positionCounts[i] = {};
        array.forEach(elem => {
          positionCounts[i][elem] = 0;
        });
      }
      
      const iterations = 500;
      for (let seed = 0; seed < iterations; seed++) {
        const shuffled = shuffleArray(array, seed);
        shuffled.forEach((elem, position) => {
          positionCounts[position][elem]++;
        });
      }
      
      const expectedCount = iterations / array.length;
      const tolerance = expectedCount * 0.6;
      
      for (let pos = 0; pos < array.length; pos++) {
        array.forEach(elem => {
          const count = positionCounts[pos][elem];
          expect(count).toBeGreaterThan(expectedCount - tolerance);
          expect(count).toBeLessThan(expectedCount + tolerance);
        });
      }
    });
  });

  describe('类型安全测试', () => {
    
    it('字符串数组洗牌应正常工作', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const result = shuffleArray(array, 42);
      
      expect(result.length).toBe(5);
      expect(result.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('对象数组洗牌应正常工作', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];
      const result = shuffleArray(array, 42);
      
      expect(result.length).toBe(3);
      const ids = result.map(item => item.id).sort();
      expect(ids).toEqual([1, 2, 3]);
    });
  });
});

describe('集成测试', () => {
  
  it('seededRandom 和 shuffleArray 应协同工作', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const seed = 12345;
    
    const index = Math.floor(seededRandom(seed) * array.length);
    const shuffled = shuffleArray(array, seed);
    
    const index2 = Math.floor(seededRandom(seed) * array.length);
    const shuffled2 = shuffleArray(array, seed);
    
    expect(index).toBe(index2);
    expect(shuffled).toEqual(shuffled2);
  });

  it('模拟角色位置分配场景', () => {
    const characterIds = ['char_101', 'char_102', 'char_103', 'char_104', 'char_105'];
    const dateStr = '3月18日';
    const timeStr = '14:00';
    
    const seedString = dateStr + timeStr.split(':')[0];
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed += seedString.charCodeAt(i);
    }
    
    const result1 = shuffleArray(characterIds, seed);
    const result2 = shuffleArray(characterIds, seed);
    
    expect(result1.length).toBe(characterIds.length);
    expect([...result1].sort()).toEqual([...characterIds].sort());
    expect(result1).toEqual(result2);
  });
});
