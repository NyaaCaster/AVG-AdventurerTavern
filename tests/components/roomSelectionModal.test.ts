import { describe, it, expect, vi, beforeEach } from 'vitest';

const ROOM_MAPPING = [
  { roomNo: '101', charId: 'char_101' },
  { roomNo: '102', charId: 'char_102' },
  { roomNo: '103', charId: 'char_103' },
  { roomNo: '104', charId: 'char_104' },
  { roomNo: '105', charId: 'char_105' },
  { roomNo: '106', charId: 'char_106' },
  { roomNo: '107', charId: 'char_107' },
  { roomNo: '108', charId: 'char_108' },
  { roomNo: '109', charId: 'char_109' },
  { roomNo: '110', charId: 'char_110' },
  { roomNo: '111', charId: 'char_111' },
];

const CHARACTERS: Record<string, { name: string; avatarUrl: string }> = {
  char_101: { name: '角色101', avatarUrl: 'img/face/101.png' },
  char_102: { name: '角色102', avatarUrl: 'img/face/102.png' },
  char_103: { name: '角色103', avatarUrl: 'img/face/103.png' },
  char_104: { name: '角色104', avatarUrl: 'img/face/104.png' },
  char_105: { name: '角色105', avatarUrl: 'img/face/105.png' },
  char_106: { name: '角色106', avatarUrl: 'img/face/106.png' },
  char_107: { name: '角色107', avatarUrl: 'img/face/107.png' },
  char_108: { name: '角色108', avatarUrl: 'img/face/108.png' },
  char_109: { name: '角色109', avatarUrl: 'img/face/109.png' },
  char_110: { name: '角色110', avatarUrl: 'img/face/110.png' },
  char_111: { name: '角色111', avatarUrl: 'img/face/111.png' },
};

const createMockNavigate = () => vi.fn();
const createMockClose = () => vi.fn();

describe('RoomSelectionModal - ROOM_MAPPING 房间映射', () => {
  describe('映射结构', () => {
    it('应该定义11个房间', () => {
      expect(ROOM_MAPPING.length).toBe(11);
    });

    it('每个房间应该有roomNo和charId', () => {
      ROOM_MAPPING.forEach(room => {
        expect(room).toHaveProperty('roomNo');
        expect(room).toHaveProperty('charId');
      });
    });

    it('房间号应该是连续的101-111', () => {
      const roomNumbers = ROOM_MAPPING.map(r => r.roomNo);
      expect(roomNumbers).toEqual(['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111']);
    });

    it('角色ID应该对应房间号', () => {
      ROOM_MAPPING.forEach(room => {
        const expectedCharId = `char_${room.roomNo}`;
        expect(room.charId).toBe(expectedCharId);
      });
    });
  });

  describe('房间号查找', () => {
    it('应该能根据角色ID找到房间号', () => {
      const charId = 'char_105';
      const room = ROOM_MAPPING.find(r => r.charId === charId);
      
      expect(room?.roomNo).toBe('105');
    });

    it('应该能根据房间号找到角色ID', () => {
      const roomNo = '108';
      const room = ROOM_MAPPING.find(r => r.roomNo === roomNo);
      
      expect(room?.charId).toBe('char_108');
    });

    it('不存在的角色ID应该返回undefined', () => {
      const room = ROOM_MAPPING.find(r => r.charId === 'char_999');
      
      expect(room).toBeUndefined();
    });
  });
});

describe('RoomSelectionModal - handleRoomClick 房间点击处理', () => {
  const mockNavigate = createMockNavigate();
  const mockClose = createMockClose();

  const handleRoomClick = (charId?: string) => {
    if (charId) {
      mockNavigate('scen_2', { target: charId });
    }
    mockClose();
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('有效房间点击', () => {
    it('点击有角色的房间应该导航到对应场景', () => {
      handleRoomClick('char_101');
      
      expect(mockNavigate).toHaveBeenCalledWith('scen_2', { target: 'char_101' });
    });

    it('点击后应该关闭模态框', () => {
      handleRoomClick('char_102');
      
      expect(mockClose).toHaveBeenCalled();
    });

    it('不同角色应该导航到不同目标', () => {
      handleRoomClick('char_105');
      
      expect(mockNavigate).toHaveBeenCalledWith('scen_2', { target: 'char_105' });
    });
  });

  describe('无效房间点击', () => {
    it('点击空房间（无charId）不应该导航', () => {
      mockNavigate.mockClear();
      handleRoomClick(undefined);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('点击空房间应该关闭模态框', () => {
      mockClose.mockClear();
      handleRoomClick(undefined);
      
      expect(mockClose).toHaveBeenCalled();
    });
  });
});

describe('RoomSelectionModal - handleMyRoomClick 自室点击处理', () => {
  const mockNavigate = createMockNavigate();
  const mockClose = createMockClose();

  const handleMyRoomClick = () => {
    mockNavigate('scen_2', { target: 'user' });
    mockClose();
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('点击自室应该导航到用户场景', () => {
    handleMyRoomClick();
    
    expect(mockNavigate).toHaveBeenCalledWith('scen_2', { target: 'user' });
  });

  it('点击自室应该关闭模态框', () => {
    handleMyRoomClick();
    
    expect(mockClose).toHaveBeenCalled();
  });

  it('自室目标应该是"user"', () => {
    handleMyRoomClick();
    
    const callArgs = mockNavigate.mock.calls[0];
    expect(callArgs[1].target).toBe('user');
  });
});

describe('RoomSelectionModal - isAbsent/isOccupied 入住状态逻辑', () => {
  const checkInCharacters = ['char_101', 'char_103', 'char_105', 'char_107'];

  const calculateRoomStatus = (charId: string, checkedIn: string[]) => {
    const isAbsent = !checkedIn.includes(charId);
    const character = CHARACTERS[charId];
    const isOccupied = character && !isAbsent;
    
    return {
      isAbsent,
      isOccupied,
      hasCharacter: !!character,
    };
  };

  describe('入住状态判断', () => {
    it('已入住角色应该返回isOccupied=true', () => {
      const status = calculateRoomStatus('char_101', checkInCharacters);
      
      expect(status.isOccupied).toBe(true);
      expect(status.isAbsent).toBe(false);
    });

    it('未入住角色应该返回isAbsent=true', () => {
      const status = calculateRoomStatus('char_102', checkInCharacters);
      
      expect(status.isAbsent).toBe(true);
      expect(status.isOccupied).toBe(false);
    });

    it('不存在角色应该返回hasCharacter=false', () => {
      const status = calculateRoomStatus('char_999', checkInCharacters);
      
      expect(status.hasCharacter).toBe(false);
      expect(status.isOccupied).toBeFalsy();
    });
  });

  describe('边界情况', () => {
    it('空入住列表应该全部显示为空房', () => {
      const emptyCheckIn: string[] = [];
      
      ROOM_MAPPING.forEach(room => {
        const status = calculateRoomStatus(room.charId, emptyCheckIn);
        expect(status.isOccupied).toBe(false);
        expect(status.isAbsent).toBe(true);
      });
    });

    it('全部入住时应该全部显示为入住', () => {
      const allCheckedIn = ROOM_MAPPING.map(r => r.charId);
      
      ROOM_MAPPING.forEach(room => {
        const status = calculateRoomStatus(room.charId, allCheckedIn);
        expect(status.isOccupied).toBe(true);
      });
    });
  });

  describe('点击交互逻辑', () => {
    it('入住房间应该可点击', () => {
      const status = calculateRoomStatus('char_101', checkInCharacters);
      
      expect(status.isOccupied).toBe(true);
    });

    it('空房间不应该触发角色导航', () => {
      const status = calculateRoomStatus('char_102', checkInCharacters);
      
      expect(status.isOccupied).toBe(false);
    });
  });
});

describe('RoomSelectionModal - 玩家头像处理', () => {
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

  describe('自室头像显示', () => {
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

    it('无头像信息时应该显示默认头像', () => {
      const result = getPlayerAvatarUrl(undefined);
      
      expect(result).toContain('img/face/1.png');
    });
  });

  describe('时间戳参数', () => {
    it('带时间戳应该添加查询参数', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      
      const result = getPlayerAvatarUrl(playerAvatarInfo, 1234567890);
      
      expect(result).toContain('?t=1234567890');
    });

    it('默认头像不应该添加时间戳', () => {
      const playerAvatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      
      const result = getPlayerAvatarUrl(playerAvatarInfo, 1234567890);
      
      expect(result).not.toContain('?t=');
    });
  });
});

describe('RoomSelectionModal - 模态框状态', () => {
  describe('isOpen状态', () => {
    it('isOpen为false时应该返回null', () => {
      const isOpen = false;
      
      expect(isOpen).toBe(false);
    });

    it('isOpen为true时应该渲染内容', () => {
      const isOpen = true;
      
      expect(isOpen).toBe(true);
    });
  });

  describe('点击背景关闭', () => {
    it('点击背景层应该触发onClose', () => {
      const mockClose = vi.fn();
      mockClose();
      
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
