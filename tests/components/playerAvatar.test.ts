import { describe, it, expect } from 'vitest';

const PLAYER_AVATAR_URL = 'img/face/1.png';

const CHARACTER_IMAGES: Record<string, { avatarUrl: string }> = {
  char_1: { avatarUrl: 'img/face/1.png' },
  char_101: { avatarUrl: 'img/face/101.png' },
  char_102: { avatarUrl: 'img/face/102.png' },
};

interface PlayerAvatarInfo {
  has_custom_avatar: boolean;
  custom_avatar_url?: string;
}

const mockFileUploadService = {
  getFileUrl: (path: string) => `https://test-server.com/files/${path}`,
};

const resolveImgPath = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://h.hony-wen.com:5102/files/${path}`;
};

const getPlayerAvatarUrl = (
  avatarInfo: PlayerAvatarInfo | null | undefined,
  timestamp?: number
): string => {
  if (avatarInfo?.has_custom_avatar && avatarInfo.custom_avatar_url) {
    const baseUrl = mockFileUploadService.getFileUrl(avatarInfo.custom_avatar_url);
    if (timestamp) {
      return `${baseUrl}?t=${timestamp}`;
    }
    return baseUrl;
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

const calculateCharacterDetailAvatar = (
  characterId: string,
  playerAvatarInfo?: PlayerAvatarInfo
): string => {
  const isPlayer = characterId === 'char_1';
  
  if (isPlayer) {
    return getPlayerAvatarUrl(playerAvatarInfo);
  }
  
  return CHARACTER_IMAGES[characterId]?.avatarUrl || '';
};

describe('PartyFormationModal - 头像逻辑测试', () => {
  describe('玩家角色头像', () => {
    it('应该为有自定义头像的玩家返回自定义头像URL', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = calculatePartySlotAvatar('char_1', playerAvatarInfo);
      
      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('应该为没有自定义头像的玩家返回默认头像URL', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = calculatePartySlotAvatar('char_1', playerAvatarInfo);
      
      expect(result).toContain('img/face/1.png');
    });

    it('应该在没有 playerAvatarInfo 时返回默认头像URL', () => {
      const result = calculatePartySlotAvatar('char_1', undefined);
      
      expect(result).toContain('img/face/1.png');
    });
  });

  describe('非玩家角色头像', () => {
    it('应该为 char_101 返回正确的头像URL', () => {
      const result = calculatePartySlotAvatar('char_101', undefined);
      
      expect(result).toBe('img/face/101.png');
    });

    it('应该为 char_102 返回正确的头像URL', () => {
      const result = calculatePartySlotAvatar('char_102', undefined);
      
      expect(result).toBe('img/face/102.png');
    });

    it('应该为未知角色返回空字符串', () => {
      const result = calculatePartySlotAvatar('char_999', undefined);
      
      expect(result).toBe('');
    });
  });

  describe('空位处理', () => {
    it('应该为空位返回空字符串', () => {
      const result = calculatePartySlotAvatar(null, undefined);
      
      expect(result).toBe('');
    });
  });

  describe('数据保护', () => {
    it('玩家自定义头像URL应该被正确保留', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/user_456_face.png',
      };
      
      const result = calculatePartySlotAvatar('char_1', playerAvatarInfo);
      
      expect(result).toContain('user_456_face.png');
    });

    it('非玩家角色头像不应受 playerAvatarInfo 影响', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = calculatePartySlotAvatar('char_101', playerAvatarInfo);
      
      expect(result).toBe('img/face/101.png');
    });
  });
});

describe('PartyEquipmentModal / PartySkillSetModal - 头像逻辑测试', () => {
  describe('玩家角色头像', () => {
    it('应该为有自定义头像的玩家返回自定义头像URL', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = calculateCharacterDetailAvatar('char_1', playerAvatarInfo);
      
      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('应该为没有自定义头像的玩家返回默认头像URL', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = calculateCharacterDetailAvatar('char_1', playerAvatarInfo);
      
      expect(result).toContain('img/face/1.png');
    });
  });

  describe('非玩家角色头像', () => {
    it('应该为 char_101 返回正确的头像URL', () => {
      const result = calculateCharacterDetailAvatar('char_101', undefined);
      
      expect(result).toBe('img/face/101.png');
    });

    it('应该为 char_102 返回正确的头像URL', () => {
      const result = calculateCharacterDetailAvatar('char_102', undefined);
      
      expect(result).toBe('img/face/102.png');
    });
  });
});

describe('RoomSelectionModal - 头像逻辑测试', () => {
  describe('玩家自室头像', () => {
    it('应该为有自定义头像的玩家返回自定义头像URL', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = getPlayerAvatarUrl(playerAvatarInfo);
      
      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('应该为没有自定义头像的玩家返回默认头像URL', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = getPlayerAvatarUrl(playerAvatarInfo);
      
      expect(result).toContain('img/face/1.png');
    });
  });
});

describe('BattleScene - playerUnitsWithImages 头像逻辑测试', () => {
  interface BattleUnit {
    id: string;
    name: string;
    isAlive: boolean;
  }

  interface PlayerUnitWithImage extends BattleUnit {
    avatarUrl: string;
  }

  const buildPlayerUnitsWithImages = (
    playerUnits: BattleUnit[],
    playerAvatarInfo?: PlayerAvatarInfo
  ): PlayerUnitWithImage[] => {
    return playerUnits.map(player => {
      const charId = player.id;
      const isPlayer = charId === 'char_1';
      const avatarUrl = isPlayer 
        ? getPlayerAvatarUrl(playerAvatarInfo)
        : (CHARACTER_IMAGES[charId]?.avatarUrl || '');
      
      return {
        ...player,
        avatarUrl
      };
    });
  };

  describe('玩家单位头像', () => {
    it('应该为玩家单位使用自定义头像', () => {
      const playerUnits: BattleUnit[] = [
        { id: 'char_1', name: '玩家', isAlive: true },
      ];
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = buildPlayerUnitsWithImages(playerUnits, playerAvatarInfo);
      
      expect(result[0].avatarUrl).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('应该为玩家单位使用默认头像当没有自定义头像时', () => {
      const playerUnits: BattleUnit[] = [
        { id: 'char_1', name: '玩家', isAlive: true },
      ];
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = buildPlayerUnitsWithImages(playerUnits, playerAvatarInfo);
      
      expect(result[0].avatarUrl).toContain('img/face/1.png');
    });
  });

  describe('非玩家单位头像', () => {
    it('应该为非玩家单位使用角色默认头像', () => {
      const playerUnits: BattleUnit[] = [
        { id: 'char_101', name: '角色101', isAlive: true },
        { id: 'char_102', name: '角色102', isAlive: true },
      ];
      
      const result = buildPlayerUnitsWithImages(playerUnits, undefined);
      
      expect(result[0].avatarUrl).toBe('img/face/101.png');
      expect(result[1].avatarUrl).toBe('img/face/102.png');
    });
  });

  describe('混合队伍头像', () => {
    it('应该正确处理包含玩家和非玩家的队伍', () => {
      const playerUnits: BattleUnit[] = [
        { id: 'char_1', name: '玩家', isAlive: true },
        { id: 'char_101', name: '角色101', isAlive: true },
        { id: 'char_102', name: '角色102', isAlive: true },
      ];
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = buildPlayerUnitsWithImages(playerUnits, playerAvatarInfo);
      
      expect(result[0].avatarUrl).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
      expect(result[1].avatarUrl).toBe('img/face/101.png');
      expect(result[2].avatarUrl).toBe('img/face/102.png');
    });
  });

  describe('数据保护', () => {
    it('玩家自定义头像不应影响其他角色', () => {
      const playerUnits: BattleUnit[] = [
        { id: 'char_1', name: '玩家', isAlive: true },
        { id: 'char_101', name: '角色101', isAlive: true },
      ];
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = buildPlayerUnitsWithImages(playerUnits, playerAvatarInfo);
      
      expect(result[0].avatarUrl).toContain('123_face.png');
      expect(result[1].avatarUrl).toBe('img/face/101.png');
    });
  });
});

describe('resolveImgPath - 统一处理测试', () => {
  describe('HTTP URL 处理', () => {
    it('应该直接返回 HTTP URL', () => {
      const httpUrl = 'https://test-server.com/files/img/face/userFace/123_face.png';
      expect(resolveImgPath(httpUrl)).toBe(httpUrl);
    });

    it('应该直接返回 HTTPS URL', () => {
      const httpsUrl = 'https://example.com/image.png';
      expect(resolveImgPath(httpsUrl)).toBe(httpsUrl);
    });
  });

  describe('相对路径处理', () => {
    it('应该为相对路径添加基础URL', () => {
      const result = resolveImgPath('img/face/1.png');
      expect(result).toBe('https://h.hony-wen.com:5102/files/img/face/1.png');
    });

    it('应该为角色头像路径添加基础URL', () => {
      const result = resolveImgPath('img/face/101.png');
      expect(result).toBe('https://h.hony-wen.com:5102/files/img/face/101.png');
    });
  });

  describe('边界情况', () => {
    it('应该为空字符串返回空字符串', () => {
      expect(resolveImgPath('')).toBe('');
    });
  });
});
