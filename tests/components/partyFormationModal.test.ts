import { describe, it, expect, vi, beforeEach } from 'vitest';

type BattlePartySlots = [string | null, string | null, string | null, string | null];

interface CharacterUnlocks {
  accept_battle_party?: number;
}

interface CharacterStat {
  level: number;
  affinity: number;
  exp: number;
}

interface CharacterEquipment {
  weaponId: string | null;
  armorId: string | null;
  accessory1Id: string | null;
  accessory2Id: string | null;
}

const CHARACTERS: Record<string, { 
  name: string; 
  avatarUrl: string; 
  battleData?: { 
    canFight?: boolean; 
    equipableTags?: string[];
    skills?: { level: number; skillId: number }[];
  } 
}> = {
  char_1: { name: '玩家', avatarUrl: 'img/face/1.png', battleData: { canFight: true } },
  char_101: { name: '角色A', avatarUrl: 'img/face/101.png', battleData: { canFight: true } },
  char_102: { name: '角色B', avatarUrl: 'img/face/102.png', battleData: { canFight: true } },
  char_103: { name: '角色C', avatarUrl: 'img/face/103.png', battleData: { canFight: false } },
  char_104: { name: '角色D', avatarUrl: 'img/face/104.png', battleData: { canFight: true } },
};

const CHARACTER_IMAGES: Record<string, { avatarUrl: string }> = {
  char_1: { avatarUrl: 'img/face/1.png' },
  char_101: { avatarUrl: 'img/face/101.png' },
  char_102: { avatarUrl: 'img/face/102.png' },
  char_103: { avatarUrl: 'img/face/103.png' },
  char_104: { avatarUrl: 'img/face/104.png' },
};

const EXP_TABLE: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
};

const ITEMS_EQUIP: Record<string, { id: string; name: string; tag?: string; category: string }> = {
  weapon_1: { id: 'weapon_1', name: '铁剑', tag: 'sword', category: 'wpn' },
  weapon_2: { id: 'weapon_2', name: '铁杖', tag: 'staff', category: 'wpn' },
};

const ITEM_TAGS = [
  { id: 'sword', name: '剑', icon: '⚔️' },
  { id: 'staff', name: '杖', icon: '🪄' },
];

const resolveCharacterDisplayName = (name: string, userName: string): string => {
  if (name === '玩家') return userName || '玩家';
  return name;
};

const calculateSelectableCharacters = (
  battleParty: BattlePartySlots,
  characterUnlocks: Record<string, CharacterUnlocks>,
  characterStats: Record<string, CharacterStat>,
  characterEquipments: Record<string, CharacterEquipment>,
  userName: string
) => {
  const partySet = new Set(battleParty.filter(Boolean));
  
  return Object.keys(CHARACTERS)
    .filter((charId) => charId !== 'char_1')
    .filter((charId) => CHARACTERS[charId]?.battleData?.canFight !== false)
    .filter((charId) => (characterUnlocks[charId]?.accept_battle_party || 0) === 1)
    .filter((charId) => !partySet.has(charId))
    .map((charId) => {
      const stat = characterStats[charId] || { level: 1, affinity: 0, exp: 0 };
      const equip = characterEquipments[charId] || {
        weaponId: null,
        armorId: null,
        accessory1Id: null,
        accessory2Id: null
      };
      const weaponItem = equip.weaponId ? ITEMS_EQUIP[equip.weaponId] : null;
      const weaponTag = weaponItem?.tag ? ITEM_TAGS.find((t) => t.id === weaponItem.tag) : null;
      const level = stat.level || 1;
      const currentTotalExp = EXP_TABLE[level] || 0;
      const nextTotalExp = EXP_TABLE[level + 1] || currentTotalExp;
      const needExp = Math.max(0, nextTotalExp - currentTotalExp);
      const currentExp = Math.max(0, stat.exp || 0);
      const expPercent = needExp <= 0 ? 100 : Math.min(100, Math.floor((currentExp / needExp) * 100));

      return {
        id: charId,
        name: resolveCharacterDisplayName(CHARACTERS[charId].name, userName),
        level,
        avatarUrl: CHARACTER_IMAGES[charId]?.avatarUrl || CHARACTERS[charId].avatarUrl || '',
        weaponName: weaponItem?.name || '未装备',
        weaponIcon: weaponTag?.icon || '',
        currentExp,
        needExp,
        expPercent
      };
    });
};

describe('PartyFormationModal - selectableCharacters 可选角色计算', () => {
  let battleParty: BattlePartySlots;
  let characterUnlocks: Record<string, CharacterUnlocks>;
  let characterStats: Record<string, CharacterStat>;
  let characterEquipments: Record<string, CharacterEquipment>;

  beforeEach(() => {
    battleParty = ['char_1', null, null, null];
    characterUnlocks = {
      char_101: { accept_battle_party: 1 },
      char_102: { accept_battle_party: 1 },
      char_103: { accept_battle_party: 1 },
      char_104: { accept_battle_party: 0 },
    };
    characterStats = {
      char_101: { level: 5, affinity: 50, exp: 200 },
      char_102: { level: 3, affinity: 30, exp: 100 },
      char_103: { level: 1, affinity: 0, exp: 0 },
    };
    characterEquipments = {
      char_101: { weaponId: 'weapon_1', armorId: null, accessory1Id: null, accessory2Id: null },
      char_102: { weaponId: null, armorId: null, accessory1Id: null, accessory2Id: null },
    };
  });

  describe('过滤逻辑', () => {
    it('应该排除玩家角色(char_1)', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      expect(result.find(c => c.id === 'char_1')).toBeUndefined();
    });

    it('应该排除canFight为false的角色', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      expect(result.find(c => c.id === 'char_103')).toBeUndefined();
    });

    it('应该排除未解锁的角色', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      expect(result.find(c => c.id === 'char_104')).toBeUndefined();
    });

    it('应该排除已在队伍中的角色', () => {
      battleParty = ['char_1', 'char_101', null, null];
      
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      expect(result.find(c => c.id === 'char_101')).toBeUndefined();
    });
  });

  describe('角色信息计算', () => {
    it('应该正确计算角色等级', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      const char101 = result.find(c => c.id === 'char_101');
      expect(char101?.level).toBe(5);
    });

    it('应该正确计算经验值百分比', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      const char101 = result.find(c => c.id === 'char_101');
      expect(char101?.expPercent).toBeGreaterThanOrEqual(0);
      expect(char101?.expPercent).toBeLessThanOrEqual(100);
    });

    it('应该正确显示武器信息', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      const char101 = result.find(c => c.id === 'char_101');
      expect(char101?.weaponName).toBe('铁剑');
      expect(char101?.weaponIcon).toBe('⚔️');
    });

    it('未装备武器应该显示"未装备"', () => {
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      const char102 = result.find(c => c.id === 'char_102');
      expect(char102?.weaponName).toBe('未装备');
    });
  });

  describe('边界情况', () => {
    it('没有可选角色时应该返回空数组', () => {
      characterUnlocks = {};
      
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      expect(result).toEqual([]);
    });

    it('缺少角色数据时应该使用默认值', () => {
      characterStats = {};
      characterEquipments = {};
      
      const result = calculateSelectableCharacters(
        battleParty, characterUnlocks, characterStats, characterEquipments, '测试玩家'
      );
      
      const char101 = result.find(c => c.id === 'char_101');
      expect(char101?.level).toBe(1);
    });
  });
});

describe('PartyFormationModal - handleSlotClick 槽位点击处理', () => {
  let battleParty: BattlePartySlots;
  let selectedCharacterId: string;
  let pendingSlotIndex: number | null;

  const handleSlotClick = (slotIndex: number) => {
    const memberId = battleParty[slotIndex];
    if (memberId) {
      selectedCharacterId = memberId;
      pendingSlotIndex = null;
      return;
    }
    if (slotIndex === 0) return;
    pendingSlotIndex = slotIndex;
  };

  beforeEach(() => {
    battleParty = ['char_1', 'char_101', null, null];
    selectedCharacterId = 'char_1';
    pendingSlotIndex = null;
  });

  describe('点击已有成员的槽位', () => {
    it('应该选中该成员', () => {
      handleSlotClick(1);
      
      expect(selectedCharacterId).toBe('char_101');
    });

    it('应该清除待选槽位状态', () => {
      pendingSlotIndex = 2;
      handleSlotClick(1);
      
      expect(pendingSlotIndex).toBeNull();
    });
  });

  describe('点击空槽位', () => {
    it('点击0号位（玩家位置）不应该设置待选状态', () => {
      battleParty = [null, null, null, null];
      handleSlotClick(0);
      
      expect(pendingSlotIndex).toBeNull();
    });

    it('点击其他空槽位应该设置待选状态', () => {
      handleSlotClick(2);
      
      expect(pendingSlotIndex).toBe(2);
    });

    it('不应该改变选中的角色', () => {
      const prevSelected = selectedCharacterId;
      handleSlotClick(2);
      
      expect(selectedCharacterId).toBe(prevSelected);
    });
  });
});

describe('PartyFormationModal - handleAddCharacter 添加角色', () => {
  let battleParty: BattlePartySlots;
  let pendingSlotIndex: number | null;
  let selectedCharacterId: string;

  const mockOnAddMember = vi.fn();

  const handleAddCharacter = (characterId: string) => {
    mockOnAddMember(characterId, pendingSlotIndex === null ? undefined : pendingSlotIndex);
    pendingSlotIndex = null;
    selectedCharacterId = characterId;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    battleParty = ['char_1', null, null, null];
    pendingSlotIndex = null;
    selectedCharacterId = 'char_1';
  });

  describe('添加到指定槽位', () => {
    it('有待选槽位时应该添加到该槽位', () => {
      pendingSlotIndex = 2;
      handleAddCharacter('char_102');
      
      expect(mockOnAddMember).toHaveBeenCalledWith('char_102', 2);
    });

    it('添加后应该清除待选槽位状态', () => {
      pendingSlotIndex = 2;
      handleAddCharacter('char_102');
      
      expect(pendingSlotIndex).toBeNull();
    });
  });

  describe('添加到自动槽位', () => {
    it('无待选槽位时应该让系统自动选择', () => {
      pendingSlotIndex = null;
      handleAddCharacter('char_102');
      
      expect(mockOnAddMember).toHaveBeenCalledWith('char_102', undefined);
    });
  });

  describe('选中状态更新', () => {
    it('添加后应该选中该角色', () => {
      handleAddCharacter('char_102');
      
      expect(selectedCharacterId).toBe('char_102');
    });
  });
});

describe('PartyFormationModal - handleClose 关闭处理', () => {
  const mockOnAutoSave = vi.fn();
  const mockOnClose = vi.fn();

  const handleClose = () => {
    mockOnAutoSave();
    mockOnClose();
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('关闭时应该触发自动保存', () => {
    handleClose();
    
    expect(mockOnAutoSave).toHaveBeenCalled();
  });

  it('关闭时应该触发onClose回调', () => {
    handleClose();
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('自动保存应该在关闭前执行', () => {
    handleClose();
    
    expect(mockOnAutoSave).toHaveBeenCalledBefore(mockOnClose);
  });
});

describe('PartyFormationModal - 玩家头像处理', () => {
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

  const getPlayerAvatarUrl = (
    avatarInfo: PlayerAvatarInfo | null | undefined
  ): string => {
    if (avatarInfo?.has_custom_avatar && avatarInfo.custom_avatar_url) {
      return mockFileUploadService.getFileUrl(avatarInfo.custom_avatar_url);
    }
    return resolveImgPath(PLAYER_AVATAR_URL);
  };

  const calculatePartySlotAvatar = (
    memberId: string | null,
    playerAvatarInfo?: PlayerAvatarInfo
  ): string => {
    if (!memberId) return '';
    
    const isPlayer = memberId === 'char_1';
    
    if (isPlayer) {
      return getPlayerAvatarUrl(playerAvatarInfo);
    }
    
    return CHARACTER_IMAGES[memberId]?.avatarUrl || '';
  };

  describe('玩家槽位头像', () => {
    it('玩家有自定义头像时应该显示自定义头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = calculatePartySlotAvatar('char_1', playerAvatarInfo);
      
      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('玩家无自定义头像时应该显示默认头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = calculatePartySlotAvatar('char_1', playerAvatarInfo);
      
      expect(result).toContain('img/face/1.png');
    });
  });

  describe('非玩家槽位头像', () => {
    it('非玩家角色应该使用角色默认头像', () => {
      const result = calculatePartySlotAvatar('char_101', undefined);
      
      expect(result).toBe('img/face/101.png');
    });

    it('非玩家角色不受playerAvatarInfo影响', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = calculatePartySlotAvatar('char_101', playerAvatarInfo);
      
      expect(result).toBe('img/face/101.png');
    });
  });

  describe('空槽位处理', () => {
    it('空槽位应该返回空字符串', () => {
      const result = calculatePartySlotAvatar(null, undefined);
      
      expect(result).toBe('');
    });
  });
});

describe('PartyFormationModal - 移除成员', () => {
  const mockOnRemoveMember = vi.fn();

  const handleRemoveMember = (slotIndex: number, selectedCharacterId: string, memberId: string) => {
    mockOnRemoveMember(slotIndex);
    if (selectedCharacterId === memberId) {
      return 'char_1';
    }
    return selectedCharacterId;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该调用onRemoveMember', () => {
    handleRemoveMember(1, 'char_101', 'char_101');
    
    expect(mockOnRemoveMember).toHaveBeenCalledWith(1);
  });

  it('移除选中的角色时应该重置选中状态为玩家', () => {
    const newSelected = handleRemoveMember(1, 'char_101', 'char_101');
    
    expect(newSelected).toBe('char_1');
  });

  it('移除未选中的角色时不应改变选中状态', () => {
    const newSelected = handleRemoveMember(2, 'char_101', 'char_102');
    
    expect(newSelected).toBe('char_101');
  });

  it('不应该能移除0号位的玩家', () => {
    const canRemove = (slotIndex: number) => slotIndex > 0;
    
    expect(canRemove(0)).toBe(false);
    expect(canRemove(1)).toBe(true);
  });
});
