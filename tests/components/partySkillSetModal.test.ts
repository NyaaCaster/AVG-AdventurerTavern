import { describe, it, expect, vi, beforeEach } from 'vitest';

interface SkillData {
  id: number;
  name: string;
  description?: string;
  mpCost?: number;
}

interface CharacterSkills {
  slot1: number | null;
  slot2: number | null;
  slot3: number | null;
  slot4: number | null;
  slot5: number | null;
  slot6: number | null;
  slot7: number | null;
  slot8: number | null;
}

interface CharacterStat {
  level: number;
  affinity: number;
  exp: number;
}

const SKILLS: SkillData[] = [
  { id: 1, name: '火球术', description: '发射火球攻击敌人', mpCost: 10 },
  { id: 2, name: '冰冻术', description: '冻结敌人', mpCost: 15 },
  { id: 3, name: '治愈术', description: '恢复HP', mpCost: 8 },
  { id: 4, name: '闪电术', description: '召唤闪电', mpCost: 20 },
  { id: 5, name: '防御提升', description: '提升防御力', mpCost: 5 },
  { id: 6, name: '攻击提升', description: '提升攻击力', mpCost: 5 },
  { id: 7, name: '复活术', description: '复活队友', mpCost: 50 },
  { id: 8, name: '终极技能', description: '终极必杀技', mpCost: 100 },
  { id: 999, name: '锁定技能', description: '需要等级100解锁', mpCost: 0 },
];

const PLAYER_LOCKED_SKILL_ID = 999;
const PLAYER_UNLOCK_LEVEL = 100;

const SKILL_SLOT_CONFIG: { key: keyof CharacterSkills; label: string }[] = [
  { key: 'slot1', label: '技能 1' },
  { key: 'slot2', label: '技能 2' },
  { key: 'slot3', label: '技能 3' },
  { key: 'slot4', label: '技能 4' },
  { key: 'slot5', label: '技能 5' },
  { key: 'slot6', label: '技能 6' },
  { key: 'slot7', label: '技能 7' },
  { key: 'slot8', label: '技能 8' },
];

const getSkillById = (skillId: number | null): SkillData | null => {
  if (skillId === null) return null;
  return SKILLS.find(s => s.id === skillId) || null;
};

const calculateUnlockedSkillIds = (
  character: { battleData?: { skills?: { level: number; skillId: number }[] } } | undefined,
  characterLevel: number,
  isPlayerCharacter: boolean,
  playerLearnedSkills: number[]
): number[] => {
  const ids: number[] = [];
  
  if (character?.battleData?.skills) {
    character.battleData.skills
      .filter(skillLearning => characterLevel >= skillLearning.level)
      .forEach(skillLearning => ids.push(skillLearning.skillId));
  }
  
  if (isPlayerCharacter && playerLearnedSkills.length > 0) {
    playerLearnedSkills.forEach(skillId => {
      if (!ids.includes(skillId)) {
        ids.push(skillId);
      }
    });
  }
  
  return ids;
};

const calculateEffectiveSkills = (
  characterSkills: CharacterSkills,
  isSlot8Locked: boolean
): CharacterSkills => {
  if (!isSlot8Locked) return characterSkills;
  
  return {
    ...characterSkills,
    slot8: PLAYER_LOCKED_SKILL_ID
  };
};

const calculateEquippedSkillIds = (effectiveSkills: CharacterSkills): number[] => {
  const ids: number[] = [];
  SKILL_SLOT_CONFIG.forEach(config => {
    const skillId = effectiveSkills[config.key];
    if (skillId !== null) {
      ids.push(skillId);
    }
  });
  return ids;
};

describe('PartySkillSetModal - getSkillById 技能查询', () => {
  describe('有效技能ID', () => {
    it('应该返回对应的技能数据', () => {
      const result = getSkillById(1);
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('火球术');
    });

    it('应该返回完整的技能信息', () => {
      const result = getSkillById(3);
      
      expect(result).toEqual({
        id: 3,
        name: '治愈术',
        description: '恢复HP',
        mpCost: 8
      });
    });
  });

  describe('无效技能ID', () => {
    it('不存在的技能ID应该返回null', () => {
      const result = getSkillById(9999);
      
      expect(result).toBeNull();
    });

    it('null应该返回null', () => {
      const result = getSkillById(null);
      
      expect(result).toBeNull();
    });
  });
});

describe('PartySkillSetModal - unlockedSkillIds 已解锁技能计算', () => {
  describe('角色等级解锁', () => {
    it('应该返回等级满足条件的技能', () => {
      const character = {
        battleData: {
          skills: [
            { level: 1, skillId: 1 },
            { level: 5, skillId: 2 },
            { level: 10, skillId: 3 },
          ]
        }
      };
      
      const result = calculateUnlockedSkillIds(character, 5, false, []);
      
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).not.toContain(3);
    });

    it('等级刚好满足时应该解锁', () => {
      const character = {
        battleData: {
          skills: [
            { level: 10, skillId: 3 },
          ]
        }
      };
      
      const result = calculateUnlockedSkillIds(character, 10, false, []);
      
      expect(result).toContain(3);
    });

    it('等级不足时不应解锁', () => {
      const character = {
        battleData: {
          skills: [
            { level: 10, skillId: 3 },
          ]
        }
      };
      
      const result = calculateUnlockedSkillIds(character, 9, false, []);
      
      expect(result).not.toContain(3);
    });
  });

  describe('玩家习得技能', () => {
    it('玩家角色应该包含习得的技能', () => {
      const result = calculateUnlockedSkillIds(undefined, 1, true, [1, 2, 3]);
      
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('非玩家角色不应包含玩家习得技能', () => {
      const result = calculateUnlockedSkillIds(undefined, 1, false, [1, 2, 3]);
      
      expect(result).toEqual([]);
    });

    it('应该去重重复的技能ID', () => {
      const character = {
        battleData: {
          skills: [
            { level: 1, skillId: 1 },
          ]
        }
      };
      
      const result = calculateUnlockedSkillIds(character, 1, true, [1, 2]);
      
      expect(result.filter(id => id === 1).length).toBe(1);
    });
  });

  describe('组合解锁', () => {
    it('应该合并角色技能和玩家习得技能', () => {
      const character = {
        battleData: {
          skills: [
            { level: 1, skillId: 1 },
            { level: 5, skillId: 2 },
          ]
        }
      };
      
      const result = calculateUnlockedSkillIds(character, 10, true, [3, 4]);
      
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
    });
  });

  describe('边界情况', () => {
    it('没有技能数据时应该返回空数组或玩家习得技能', () => {
      const result = calculateUnlockedSkillIds(undefined, 1, false, []);
      
      expect(result).toEqual([]);
    });

    it('空技能列表时应该返回空数组', () => {
      const character = {
        battleData: {
          skills: []
        }
      };
      
      const result = calculateUnlockedSkillIds(character, 1, false, []);
      
      expect(result).toEqual([]);
    });
  });
});

describe('PartySkillSetModal - isSlot8Locked 第8技能槽锁定', () => {
  const calculateSlot8LockStatus = (isPlayerCharacter: boolean, characterLevel: number): boolean => {
    return isPlayerCharacter && characterLevel < PLAYER_UNLOCK_LEVEL;
  };

  describe('玩家角色', () => {
    it('等级低于100时第8槽应该锁定', () => {
      const result = calculateSlot8LockStatus(true, 99);
      
      expect(result).toBe(true);
    });

    it('等级等于100时第8槽应该解锁', () => {
      const result = calculateSlot8LockStatus(true, 100);
      
      expect(result).toBe(false);
    });

    it('等级高于100时第8槽应该解锁', () => {
      const result = calculateSlot8LockStatus(true, 150);
      
      expect(result).toBe(false);
    });

    it('等级为1时第8槽应该锁定', () => {
      const result = calculateSlot8LockStatus(true, 1);
      
      expect(result).toBe(true);
    });
  });

  describe('非玩家角色', () => {
    it('非玩家角色第8槽不应该锁定', () => {
      const result = calculateSlot8LockStatus(false, 1);
      
      expect(result).toBe(false);
    });

    it('非玩家角色无论等级如何第8槽都不锁定', () => {
      const result = calculateSlot8LockStatus(false, 50);
      
      expect(result).toBe(false);
    });
  });
});

describe('PartySkillSetModal - effectiveSkills 有效技能配置', () => {
  const characterSkills: CharacterSkills = {
    slot1: 1,
    slot2: 2,
    slot3: null,
    slot4: null,
    slot5: null,
    slot6: null,
    slot7: null,
    slot8: 8,
  };

  describe('未锁定状态', () => {
    it('未锁定时应该返回原始技能配置', () => {
      const result = calculateEffectiveSkills(characterSkills, false);
      
      expect(result).toEqual(characterSkills);
    });

    it('未锁定时第8槽应该保持原值', () => {
      const result = calculateEffectiveSkills(characterSkills, false);
      
      expect(result.slot8).toBe(8);
    });
  });

  describe('锁定状态', () => {
    it('锁定时第8槽应该被替换为锁定技能ID', () => {
      const result = calculateEffectiveSkills(characterSkills, true);
      
      expect(result.slot8).toBe(PLAYER_LOCKED_SKILL_ID);
    });

    it('锁定时其他槽位应该保持不变', () => {
      const result = calculateEffectiveSkills(characterSkills, true);
      
      expect(result.slot1).toBe(1);
      expect(result.slot2).toBe(2);
      expect(result.slot3).toBeNull();
    });
  });
});

describe('PartySkillSetModal - equippedSkillIds 已装备技能ID列表', () => {
  describe('技能收集', () => {
    it('应该收集所有非空的技能ID', () => {
      const effectiveSkills: CharacterSkills = {
        slot1: 1,
        slot2: 2,
        slot3: null,
        slot4: 3,
        slot5: null,
        slot6: null,
        slot7: null,
        slot8: null,
      };
      
      const result = calculateEquippedSkillIds(effectiveSkills);
      
      expect(result).toEqual([1, 2, 3]);
    });

    it('所有槽位为空时应该返回空数组', () => {
      const emptySkills: CharacterSkills = {
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
        slot5: null,
        slot6: null,
        slot7: null,
        slot8: null,
      };
      
      const result = calculateEquippedSkillIds(emptySkills);
      
      expect(result).toEqual([]);
    });

    it('所有槽位都有技能时应该返回8个ID', () => {
      const fullSkills: CharacterSkills = {
        slot1: 1,
        slot2: 2,
        slot3: 3,
        slot4: 4,
        slot5: 5,
        slot6: 6,
        slot7: 7,
        slot8: 8,
      };
      
      const result = calculateEquippedSkillIds(fullSkills);
      
      expect(result.length).toBe(8);
    });
  });

  describe('锁定技能处理', () => {
    it('锁定的第8槽应该包含锁定技能ID', () => {
      const effectiveSkills: CharacterSkills = {
        slot1: 1,
        slot2: null,
        slot3: null,
        slot4: null,
        slot5: null,
        slot6: null,
        slot7: null,
        slot8: PLAYER_LOCKED_SKILL_ID,
      };
      
      const result = calculateEquippedSkillIds(effectiveSkills);
      
      expect(result).toContain(PLAYER_LOCKED_SKILL_ID);
    });
  });
});

describe('PartySkillSetModal - handleSelectSkill 技能选择', () => {
  let characterSkills: CharacterSkills;
  let selectingSlot: keyof CharacterSkills | null;
  let isSlot8Locked: boolean;

  const handleSelectSkill = (skillId: number | null): CharacterSkills | null => {
    if (!selectingSlot) return null;
    
    if (selectingSlot === 'slot8' && isSlot8Locked) {
      return null;
    }

    return {
      ...characterSkills,
      [selectingSlot]: skillId
    };
  };

  beforeEach(() => {
    characterSkills = {
      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
      slot5: null,
      slot6: null,
      slot7: null,
      slot8: null,
    };
    selectingSlot = null;
    isSlot8Locked = false;
  });

  describe('正常选择', () => {
    it('选择技能应该更新对应槽位', () => {
      selectingSlot = 'slot1';
      
      const result = handleSelectSkill(1);
      
      expect(result?.slot1).toBe(1);
    });

    it('卸下技能应该清空槽位', () => {
      characterSkills.slot1 = 1;
      selectingSlot = 'slot1';
      
      const result = handleSelectSkill(null);
      
      expect(result?.slot1).toBeNull();
    });

    it('不应该影响其他槽位', () => {
      characterSkills.slot2 = 2;
      selectingSlot = 'slot1';
      
      const result = handleSelectSkill(1);
      
      expect(result?.slot2).toBe(2);
    });
  });

  describe('锁定槽位处理', () => {
    it('锁定的第8槽不应该能选择技能', () => {
      selectingSlot = 'slot8';
      isSlot8Locked = true;
      
      const result = handleSelectSkill(8);
      
      expect(result).toBeNull();
    });

    it('解锁的第8槽应该能选择技能', () => {
      selectingSlot = 'slot8';
      isSlot8Locked = false;
      
      const result = handleSelectSkill(8);
      
      expect(result?.slot8).toBe(8);
    });
  });

  describe('无效操作', () => {
    it('没有选择槽位时应该返回null', () => {
      selectingSlot = null;
      
      const result = handleSelectSkill(1);
      
      expect(result).toBeNull();
    });
  });
});

describe('PartySkillSetModal - 技能选择模态框逻辑', () => {
  const isSkillEquipped = (skillId: number, equippedSkillIds: number[]): boolean => {
    return equippedSkillIds.includes(skillId);
  };

  const canSelectSkill = (skillId: number, equippedSkillIds: number[], currentSkillId: number | null): boolean => {
    if (skillId === currentSkillId) return true;
    return !equippedSkillIds.includes(skillId);
  };

  describe('已装备判断', () => {
    it('在已装备列表中的技能应该返回true', () => {
      const equippedSkillIds = [1, 2, 3];
      
      expect(isSkillEquipped(1, equippedSkillIds)).toBe(true);
    });

    it('不在已装备列表中的技能应该返回false', () => {
      const equippedSkillIds = [1, 2, 3];
      
      expect(isSkillEquipped(4, equippedSkillIds)).toBe(false);
    });
  });

  describe('可选判断', () => {
    it('当前槽位的技能应该可选', () => {
      const equippedSkillIds = [1, 2, 3];
      
      expect(canSelectSkill(1, equippedSkillIds, 1)).toBe(true);
    });

    it('已装备在其他槽位的技能不应该可选', () => {
      const equippedSkillIds = [1, 2, 3];
      
      expect(canSelectSkill(2, equippedSkillIds, 1)).toBe(false);
    });

    it('未装备的技能应该可选', () => {
      const equippedSkillIds = [1, 2, 3];
      
      expect(canSelectSkill(4, equippedSkillIds, 1)).toBe(true);
    });
  });
});

describe('PartySkillSetModal - 角色导航', () => {
  const allSelectableCharacters = [
    { id: 'char_1', name: '玩家' },
    { id: 'char_101', name: '角色A' },
    { id: 'char_102', name: '角色B' },
  ];

  const handlePrev = (selectedCharacterId: string | null): string | null => {
    if (!selectedCharacterId) return null;
    const currentIndex = allSelectableCharacters.findIndex(c => c.id === selectedCharacterId);
    if (currentIndex > 0) {
      return allSelectableCharacters[currentIndex - 1].id;
    } else {
      return allSelectableCharacters[allSelectableCharacters.length - 1].id;
    }
  };

  const handleNext = (selectedCharacterId: string | null): string | null => {
    if (!selectedCharacterId) return null;
    const currentIndex = allSelectableCharacters.findIndex(c => c.id === selectedCharacterId);
    if (currentIndex < allSelectableCharacters.length - 1) {
      return allSelectableCharacters[currentIndex + 1].id;
    } else {
      return allSelectableCharacters[0].id;
    }
  };

  describe('向前导航', () => {
    it('应该返回上一个角色', () => {
      const result = handlePrev('char_101');
      
      expect(result).toBe('char_1');
    });

    it('在第一个位置时应该循环到最后', () => {
      const result = handlePrev('char_1');
      
      expect(result).toBe('char_102');
    });
  });

  describe('向后导航', () => {
    it('应该返回下一个角色', () => {
      const result = handleNext('char_101');
      
      expect(result).toBe('char_102');
    });

    it('在最后一个位置时应该循环到第一个', () => {
      const result = handleNext('char_102');
      
      expect(result).toBe('char_1');
    });
  });

  describe('边界情况', () => {
    it('没有选中角色时应该返回null', () => {
      expect(handlePrev(null)).toBeNull();
      expect(handleNext(null)).toBeNull();
    });
  });
});

describe('PartySkillSetModal - 玩家头像处理', () => {
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

describe('PartySkillSetModal - 技能槽配置', () => {
  describe('槽位数量', () => {
    it('应该定义8个技能槽', () => {
      expect(SKILL_SLOT_CONFIG.length).toBe(8);
    });

    it('每个槽位应该有key和label', () => {
      SKILL_SLOT_CONFIG.forEach(config => {
        expect(config).toHaveProperty('key');
        expect(config).toHaveProperty('label');
      });
    });

    it('槽位key应该从slot1到slot8', () => {
      const keys = SKILL_SLOT_CONFIG.map(c => c.key);
      expect(keys).toEqual(['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7', 'slot8']);
    });
  });
});

describe('PartySkillSetModal - partyMembers 玩家头像处理', () => {
  interface PlayerAvatarInfo {
    has_custom_avatar: boolean;
    custom_avatar_url?: string;
  }

  const PLAYER_AVATAR_URL = 'img/face/1.png';
  const CHARACTER_IMAGES: Record<string, { avatarUrl: string }> = {
    char_1: { avatarUrl: 'img/face/1.png' },
    char_101: { avatarUrl: 'img/face/101.png' },
    char_102: { avatarUrl: 'img/face/102.png' },
  };

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

  const calculatePartyMemberAvatar = (
    memberId: string,
    playerAvatarInfo?: PlayerAvatarInfo
  ): string => {
    const isPlayer = memberId === 'char_1';
    
    if (isPlayer) {
      return getPlayerAvatarUrl(playerAvatarInfo);
    }
    
    return CHARACTER_IMAGES[memberId]?.avatarUrl || '';
  };

  describe('partyMembers 头像计算', () => {
    it('玩家角色应该使用自定义头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/456_face.png',
      };
      
      const result = calculatePartyMemberAvatar('char_1', playerAvatarInfo);
      
      expect(result).toBe('https://test-server.com/files/img/face/userFace/456_face.png');
    });

    it('玩家角色无自定义头像时应该使用默认头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = calculatePartyMemberAvatar('char_1', playerAvatarInfo);
      
      expect(result).toContain('img/face/1.png');
    });

    it('非玩家角色应该使用角色默认头像', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = calculatePartyMemberAvatar('char_101', playerAvatarInfo);
      
      expect(result).toBe('img/face/101.png');
    });

    it('非玩家角色不受 playerAvatarInfo 影响', () => {
      const result1 = calculatePartyMemberAvatar('char_102', { has_custom_avatar: true, custom_avatar_url: 'custom.png' });
      const result2 = calculatePartyMemberAvatar('char_102', undefined);
      
      expect(result1).toBe('img/face/102.png');
      expect(result2).toBe('img/face/102.png');
    });

    it('玩家头像信息为undefined时应该使用默认头像', () => {
      const result = calculatePartyMemberAvatar('char_1', undefined);
      
      expect(result).toContain('img/face/1.png');
    });
  });
});
