import { describe, it, expect, vi, beforeEach } from 'vitest';

type ItemTag = 'sword' | 'staff' | 'bow' | 'dagger' | 'shield' | 'light' | 'heavy';

interface ItemData {
  id: string;
  name: string;
  category: 'wpn' | 'arm' | 'acs';
  tag?: ItemTag;
  quality?: 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
  stats?: Record<string, number>;
  description: string;
  maxStack: number;
}

interface CharacterEquipment {
  weaponId: string | null;
  armorId: string | null;
  accessory1Id: string | null;
  accessory2Id: string | null;
}

interface BaseStats {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  mag: number;
  spd: number;
}

const STAT_NAMES_CN: Record<string, string> = {
  hp: '生命',
  mp: '魔力',
  atk: '攻击',
  def: '防御',
  mag: '魔攻',
  spd: '速度',
};

const QUALITY_COLORS: Record<string, string> = {
  S: 'text-amber-400',
  A: 'text-red-400',
  B: 'text-blue-400',
  C: 'text-emerald-400',
  D: 'text-slate-300',
  E: 'text-slate-500'
};

const QUALITY_BG_COLORS: Record<string, string> = {
  S: 'bg-amber-100 border-amber-300 text-amber-800',
  A: 'bg-red-100 border-red-300 text-red-800',
  B: 'bg-blue-100 border-blue-300 text-blue-800',
  C: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  D: 'bg-slate-100 border-slate-300 text-slate-700',
  E: 'bg-slate-50 border-slate-200 text-slate-600'
};

const getQualityColor = (quality?: string): string => QUALITY_COLORS[quality || 'E'] || QUALITY_COLORS.E;
const getQualityBgColor = (quality?: string): string => QUALITY_BG_COLORS[quality || 'E'] || QUALITY_BG_COLORS.E;

const ITEMS_EQUIP: Record<string, ItemData> = {
  weapon_1: { id: 'weapon_1', name: '铁剑', category: 'wpn', tag: 'sword', quality: 'C', stats: { atk: 10 }, description: '基础铁剑', maxStack: 1 },
  weapon_2: { id: 'weapon_2', name: '铁杖', category: 'wpn', tag: 'staff', quality: 'C', stats: { mag: 10 }, description: '基础铁杖', maxStack: 1 },
  weapon_3: { id: 'weapon_3', name: '圣剑', category: 'wpn', tag: 'sword', quality: 'S', stats: { atk: 50, spd: 10 }, description: '传说之剑', maxStack: 1 },
  armor_1: { id: 'armor_1', name: '皮甲', category: 'arm', tag: 'light', quality: 'D', stats: { def: 5, hp: 20 }, description: '基础皮甲', maxStack: 1 },
  armor_2: { id: 'armor_2', name: '板甲', category: 'arm', tag: 'heavy', quality: 'B', stats: { def: 20, spd: -5 }, description: '重型板甲', maxStack: 1 },
  acc_1: { id: 'acc_1', name: '力量戒指', category: 'acs', quality: 'A', stats: { atk: 15 }, description: '增加攻击力', maxStack: 1 },
  acc_2: { id: 'acc_2', name: '魔力耳环', category: 'acs', quality: 'A', stats: { mag: 15 }, description: '增加魔攻', maxStack: 1 },
};

const ITEM_TAGS: { id: ItemTag; name: string; icon: string }[] = [
  { id: 'sword', name: '剑', icon: '⚔️' },
  { id: 'staff', name: '杖', icon: '🪄' },
  { id: 'bow', name: '弓', icon: '🏹' },
  { id: 'dagger', name: '匕首', icon: '🗡️' },
  { id: 'shield', name: '盾', icon: '🛡️' },
  { id: 'light', name: '轻甲', icon: '🧥' },
  { id: 'heavy', name: '重甲', icon: '🛡️' },
];

const getAvailableEquipment = (
  inventory: Record<string, number>,
  category: 'wpn' | 'arm' | 'acs',
  equipableTags?: ItemTag[]
): ItemData[] => {
  const result: ItemData[] = [];

  Object.entries(inventory).forEach(([itemId, count]) => {
    if (count <= 0) return;
    const item = ITEMS_EQUIP[itemId];
    if (!item || item.category !== category) return;

    if (category === 'wpn' || category === 'arm') {
      if (!item.tag) return;
      if (!equipableTags || !equipableTags.includes(item.tag)) return;
    }

    result.push(item);
  });

  return result.sort((a, b) => a.id.localeCompare(b.id));
};

const getAllEquipmentsInInventory = (inventory: Record<string, number>): ItemData[] => {
  const result: ItemData[] = [];

  Object.entries(inventory).forEach(([itemId, count]) => {
    if (count <= 0) return;
    const item = ITEMS_EQUIP[itemId];
    if (!item) return;
    result.push(item);
  });

  return result.sort((a, b) => a.id.localeCompare(b.id));
};

describe('PartyEquipmentModal - getAvailableEquipment 获取可用装备', () => {
  let inventory: Record<string, number>;

  beforeEach(() => {
    inventory = {
      weapon_1: 1,
      weapon_2: 1,
      weapon_3: 1,
      armor_1: 1,
      armor_2: 1,
      acc_1: 1,
      acc_2: 2,
    };
  });

  describe('武器过滤', () => {
    it('应该只返回武器类别的装备', () => {
      const result = getAvailableEquipment(inventory, 'wpn', ['sword', 'staff']);
      
      expect(result.every(item => item.category === 'wpn')).toBe(true);
    });

    it('应该根据可装备标签过滤', () => {
      const result = getAvailableEquipment(inventory, 'wpn', ['sword']);
      
      expect(result.every(item => item.tag === 'sword')).toBe(true);
    });

    it('没有可装备标签时应该返回空数组', () => {
      const result = getAvailableEquipment(inventory, 'wpn', []);
      
      expect(result).toEqual([]);
    });
  });

  describe('防具过滤', () => {
    it('应该只返回防具类别的装备', () => {
      const result = getAvailableEquipment(inventory, 'arm', ['light', 'heavy']);
      
      expect(result.every(item => item.category === 'arm')).toBe(true);
    });

    it('应该根据可装备标签过滤防具', () => {
      const result = getAvailableEquipment(inventory, 'arm', ['light']);
      
      expect(result.every(item => item.tag === 'light')).toBe(true);
    });
  });

  describe('饰品过滤', () => {
    it('应该返回所有饰品', () => {
      const result = getAvailableEquipment(inventory, 'acs');
      
      expect(result.every(item => item.category === 'acs')).toBe(true);
      expect(result.length).toBe(2);
    });

    it('饰品不需要标签过滤', () => {
      const result = getAvailableEquipment(inventory, 'acs', undefined);
      
      expect(result.length).toBe(2);
    });
  });

  describe('库存数量检查', () => {
    it('应该排除数量为0的装备', () => {
      inventory = { weapon_1: 0, weapon_2: 1 };
      
      const result = getAvailableEquipment(inventory, 'wpn', ['sword', 'staff']);
      
      expect(result.find(item => item.id === 'weapon_1')).toBeUndefined();
    });

    it('应该排除数量为负的装备', () => {
      inventory = { weapon_1: -1, weapon_2: 1 };
      
      const result = getAvailableEquipment(inventory, 'wpn', ['sword', 'staff']);
      
      expect(result.find(item => item.id === 'weapon_1')).toBeUndefined();
    });
  });

  describe('排序', () => {
    it('结果应该按ID排序', () => {
      const result = getAvailableEquipment(inventory, 'wpn', ['sword', 'staff']);
      
      const ids = result.map(item => item.id);
      expect(ids).toEqual([...ids].sort());
    });
  });
});

describe('PartyEquipmentModal - getAllEquipmentsInInventory 获取所有装备', () => {
  let inventory: Record<string, number>;

  beforeEach(() => {
    inventory = {
      weapon_1: 1,
      weapon_2: 2,
      armor_1: 1,
      acc_1: 3,
    };
  });

  it('应该返回所有库存中的装备', () => {
    const result = getAllEquipmentsInInventory(inventory);
    
    expect(result.length).toBe(4);
  });

  it('应该排除数量为0的装备', () => {
    inventory = { weapon_1: 0, weapon_2: 1 };
    
    const result = getAllEquipmentsInInventory(inventory);
    
    expect(result.length).toBe(1);
  });

  it('应该排除不在ITEMS_EQUIP中的物品', () => {
    inventory = { weapon_1: 1, unknown_item: 5 };
    
    const result = getAllEquipmentsInInventory(inventory);
    
    expect(result.find(item => item.id === 'unknown_item')).toBeUndefined();
  });

  it('结果应该按ID排序', () => {
    const result = getAllEquipmentsInInventory(inventory);
    
    const ids = result.map(item => item.id);
    expect(ids).toEqual([...ids].sort());
  });
});

describe('PartyEquipmentModal - statDiff 属性差异计算', () => {
  const calculateStatDiff = (
    initialStats: BaseStats,
    currentStats: BaseStats
  ): Partial<BaseStats> => {
    const diff: Partial<BaseStats> = {};
    (Object.keys(currentStats) as (keyof BaseStats)[]).forEach(key => {
      diff[key] = currentStats[key] - initialStats[key];
    });
    return diff;
  };

  describe('属性增加', () => {
    it('应该正确计算攻击力增加', () => {
      const initial: BaseStats = { hp: 100, mp: 50, atk: 10, def: 5, mag: 8, spd: 10 };
      const current: BaseStats = { hp: 100, mp: 50, atk: 25, def: 5, mag: 8, spd: 10 };
      
      const diff = calculateStatDiff(initial, current);
      
      expect(diff.atk).toBe(15);
    });

    it('应该正确计算多个属性增加', () => {
      const initial: BaseStats = { hp: 100, mp: 50, atk: 10, def: 5, mag: 8, spd: 10 };
      const current: BaseStats = { hp: 120, mp: 60, atk: 15, def: 10, mag: 13, spd: 15 };
      
      const diff = calculateStatDiff(initial, current);
      
      expect(diff.hp).toBe(20);
      expect(diff.mp).toBe(10);
      expect(diff.atk).toBe(5);
      expect(diff.def).toBe(5);
      expect(diff.mag).toBe(5);
      expect(diff.spd).toBe(5);
    });
  });

  describe('属性减少', () => {
    it('应该正确计算速度减少', () => {
      const initial: BaseStats = { hp: 100, mp: 50, atk: 10, def: 5, mag: 8, spd: 10 };
      const current: BaseStats = { hp: 100, mp: 50, atk: 10, def: 5, mag: 8, spd: 5 };
      
      const diff = calculateStatDiff(initial, current);
      
      expect(diff.spd).toBe(-5);
    });
  });

  describe('无变化', () => {
    it('属性相同时差异应为0', () => {
      const stats: BaseStats = { hp: 100, mp: 50, atk: 10, def: 5, mag: 8, spd: 10 };
      
      const diff = calculateStatDiff(stats, stats);
      
      Object.values(diff).forEach(value => {
        expect(value).toBe(0);
      });
    });
  });
});

describe('PartyEquipmentModal - handleSelectEquipment 装备选择', () => {
  let displayEquipment: CharacterEquipment;
  let inventory: Record<string, number>;

  const handleSelectEquipment = (
    selectingSlot: 'weaponId' | 'armorId' | 'accessory1Id' | 'accessory2Id',
    itemId: string | null
  ): { newEquipment: CharacterEquipment; inventoryChanges: Record<string, number> } => {
    const currentEquippedId = displayEquipment[selectingSlot];
    const inventoryChanges: Record<string, number> = {};

    if (currentEquippedId) {
      inventoryChanges[currentEquippedId] = (inventoryChanges[currentEquippedId] || 0) + 1;
    }

    if (itemId) {
      inventoryChanges[itemId] = (inventoryChanges[itemId] || 0) - 1;
    }

    const newEquipment: CharacterEquipment = {
      ...displayEquipment,
      [selectingSlot]: itemId
    };

    return { newEquipment, inventoryChanges };
  };

  beforeEach(() => {
    displayEquipment = {
      weaponId: 'weapon_1',
      armorId: null,
      accessory1Id: null,
      accessory2Id: null,
    };
    inventory = {
      weapon_1: 0,
      weapon_2: 1,
      weapon_3: 1,
    };
  });

  describe('装备新物品', () => {
    it('应该更新装备槽位', () => {
      const result = handleSelectEquipment('weaponId', 'weapon_2');
      
      expect(result.newEquipment.weaponId).toBe('weapon_2');
    });

    it('应该减少新物品的库存', () => {
      const result = handleSelectEquipment('weaponId', 'weapon_2');
      
      expect(result.inventoryChanges['weapon_2']).toBe(-1);
    });

    it('应该增加旧物品的库存', () => {
      const result = handleSelectEquipment('weaponId', 'weapon_2');
      
      expect(result.inventoryChanges['weapon_1']).toBe(1);
    });
  });

  describe('卸下装备', () => {
    it('应该清空装备槽位', () => {
      const result = handleSelectEquipment('weaponId', null);
      
      expect(result.newEquipment.weaponId).toBeNull();
    });

    it('应该增加卸下装备的库存', () => {
      const result = handleSelectEquipment('weaponId', null);
      
      expect(result.inventoryChanges['weapon_1']).toBe(1);
    });
  });

  describe('空槽位装备', () => {
    it('空槽位装备时不应增加任何库存', () => {
      displayEquipment.armorId = null;
      
      const result = handleSelectEquipment('armorId', 'armor_1');
      
      expect(result.inventoryChanges['armor_1']).toBe(-1);
      expect(Object.keys(result.inventoryChanges).length).toBe(1);
    });
  });
});

describe('PartyEquipmentModal - 品质颜色', () => {
  describe('文字颜色', () => {
    it('S级应该使用金色', () => {
      expect(getQualityColor('S')).toBe('text-amber-400');
    });

    it('A级应该使用红色', () => {
      expect(getQualityColor('A')).toBe('text-red-400');
    });

    it('B级应该使用蓝色', () => {
      expect(getQualityColor('B')).toBe('text-blue-400');
    });

    it('C级应该使用绿色', () => {
      expect(getQualityColor('C')).toBe('text-emerald-400');
    });

    it('D级应该使用灰色', () => {
      expect(getQualityColor('D')).toBe('text-slate-300');
    });

    it('E级应该使用深灰色', () => {
      expect(getQualityColor('E')).toBe('text-slate-500');
    });

    it('未定义品质应该默认为E级', () => {
      expect(getQualityColor(undefined)).toBe('text-slate-500');
    });
  });

  describe('背景颜色', () => {
    it('S级背景应该使用金色系', () => {
      expect(getQualityBgColor('S')).toContain('amber');
    });

    it('A级背景应该使用红色系', () => {
      expect(getQualityBgColor('A')).toContain('red');
    });

    it('未定义品质应该默认为E级背景', () => {
      expect(getQualityBgColor(undefined)).toBe(QUALITY_BG_COLORS.E);
    });
  });
});

describe('PartyEquipmentModal - 角色导航', () => {
  const battleParty: (string | null)[] = ['char_1', 'char_101', null, 'char_102'];
  
  const handlePrev = (currentIndex: number) => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (battleParty[i]) return i;
    }
    for (let i = battleParty.length - 1; i > currentIndex; i--) {
      if (battleParty[i]) return i;
    }
    return currentIndex;
  };

  const handleNext = (currentIndex: number) => {
    for (let i = currentIndex + 1; i < battleParty.length; i++) {
      if (battleParty[i]) return i;
    }
    for (let i = 0; i < currentIndex; i++) {
      if (battleParty[i]) return i;
    }
    return currentIndex;
  };

  describe('向前导航', () => {
    it('应该跳过空槽位', () => {
      const result = handlePrev(3);
      
      expect(result).toBe(1);
    });

    it('在第一个位置时应该循环到最后', () => {
      const result = handlePrev(0);
      
      expect(result).toBe(3);
    });
  });

  describe('向后导航', () => {
    it('应该跳过空槽位', () => {
      const result = handleNext(1);
      
      expect(result).toBe(3);
    });

    it('在最后一个位置时应该循环到第一个', () => {
      const result = handleNext(3);
      
      expect(result).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('只有玩家时导航应该返回0', () => {
      const singleParty = ['char_1', null, null, null];
      
      const findPrev = (currentIndex: number) => {
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (singleParty[i]) return i;
        }
        for (let i = singleParty.length - 1; i > currentIndex; i--) {
          if (singleParty[i]) return i;
        }
        return currentIndex;
      };
      
      expect(findPrev(0)).toBe(0);
    });
  });
});

describe('PartyEquipmentModal - 玩家头像处理', () => {
  interface PlayerAvatarInfo {
    has_custom_avatar: boolean;
    custom_avatar_url?: string;
  }

  const PLAYER_AVATAR_URL = 'img/face/1.png';

  const mockFileUploadService = {
    getFileUrl: (path: string) => `https://test-server.com/files/${path}`,
  };

  const resolveImgPath = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://h.hony-wen.com:5102/files/${path}`;
  };

  const getPlayerAvatarUrl = (avatarInfo: PlayerAvatarInfo | null | undefined): string => {
    if (avatarInfo?.has_custom_avatar && avatarInfo.custom_avatar_url) {
      return mockFileUploadService.getFileUrl(avatarInfo.custom_avatar_url);
    }
    return resolveImgPath(PLAYER_AVATAR_URL);
  };

  describe('玩家角色头像', () => {
    it('有自定义头像时应该显示自定义头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = getPlayerAvatarUrl(playerAvatarInfo);
      
      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('无自定义头像时应该显示默认头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = getPlayerAvatarUrl(playerAvatarInfo);
      
      expect(result).toContain('img/face/1.png');
    });
  });
});
