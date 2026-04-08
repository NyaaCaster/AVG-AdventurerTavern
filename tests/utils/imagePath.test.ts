import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGetFileUrl = vi.fn((path: string) => `https://test-server.com/files/${path}`);

vi.mock('../../services/fileUpload', () => ({
  fileUploadService: {
    getFileUrl: (path: string) => mockGetFileUrl(path),
  },
}));

vi.mock('../../data/resources/characterImageResources', () => ({
  PLAYER_AVATAR_URL: 'img/face/1.png',
}));

import { getPlayerAvatarUrl, PlayerAvatarInfo, resolveImgPath } from '../../utils/imagePath';

describe('getPlayerAvatarUrl', () => {
  beforeEach(() => {
    mockGetFileUrl.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Normal Cases', () => {
    it('should return custom avatar URL when user has custom avatar', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(mockGetFileUrl).toHaveBeenCalledWith('img/face/userFace/123_face.png');
      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png');
    });

    it('should return default avatar URL when user has no custom avatar', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(mockGetFileUrl).not.toHaveBeenCalled();
      expect(result).toContain('img/face/1.png');
    });

    it('should return default avatar URL when has_custom_avatar is true but custom_avatar_url is missing', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
      };

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(mockGetFileUrl).not.toHaveBeenCalled();
      expect(result).toContain('img/face/1.png');
    });
  });

  describe('Timestamp Parameter', () => {
    it('should append timestamp parameter when provided', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };
      const timestamp = 1712345678901;

      const result = getPlayerAvatarUrl(avatarInfo, timestamp);

      expect(result).toBe('https://test-server.com/files/img/face/userFace/123_face.png?t=1712345678901');
    });

    it('should NOT append timestamp when using default avatar', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };
      const timestamp = 1712345678901;

      const result = getPlayerAvatarUrl(avatarInfo, timestamp);

      expect(result).not.toContain('?t=');
    });

    it('should handle timestamp as 0', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };

      const result = getPlayerAvatarUrl(avatarInfo, 0);

      expect(result).not.toContain('?t=');
    });
  });

  describe('Edge Cases', () => {
    it('should return default avatar when avatarInfo is null', () => {
      const result = getPlayerAvatarUrl(null);

      expect(mockGetFileUrl).not.toHaveBeenCalled();
      expect(result).toContain('img/face/1.png');
    });

    it('should return default avatar when avatarInfo is undefined', () => {
      const result = getPlayerAvatarUrl(undefined);

      expect(mockGetFileUrl).not.toHaveBeenCalled();
      expect(result).toContain('img/face/1.png');
    });

    it('should return default avatar when avatarInfo is empty object', () => {
      const result = getPlayerAvatarUrl({} as PlayerAvatarInfo);

      expect(mockGetFileUrl).not.toHaveBeenCalled();
      expect(result).toContain('img/face/1.png');
    });

    it('should handle empty string custom_avatar_url', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: '',
      };

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(result).toContain('img/face/1.png');
    });

    it('should handle has_custom_avatar as 0 (falsy)', () => {
      const avatarInfo = {
        has_custom_avatar: 0,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      } as unknown as PlayerAvatarInfo;

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(result).toContain('img/face/1.png');
    });

    it('should handle has_custom_avatar as 1 (truthy)', () => {
      const avatarInfo = {
        has_custom_avatar: 1,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      } as unknown as PlayerAvatarInfo;

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(mockGetFileUrl).toHaveBeenCalledWith('img/face/userFace/123_face.png');
    });
  });

  describe('Data Protection', () => {
    it('should preserve custom_avatar_url path exactly', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/user_456_face.png',
      };

      getPlayerAvatarUrl(avatarInfo);

      expect(mockGetFileUrl).toHaveBeenCalledWith('img/face/userFace/user_456_face.png');
    });

    it('should return complete URL for custom avatar', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: true,
        custom_avatar_url: 'img/face/userFace/123_face.png',
      };

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(result).toMatch(/^https:\/\//);
    });

    it('should return complete URL for default avatar', () => {
      const avatarInfo: PlayerAvatarInfo = {
        has_custom_avatar: false,
      };

      const result = getPlayerAvatarUrl(avatarInfo);

      expect(result).toMatch(/^https:\/\//);
    });
  });
});

describe('resolveImgPath', () => {
  it('should return empty string for empty path', () => {
    expect(resolveImgPath('')).toBe('');
  });

  it('should return HTTP URL as-is', () => {
    const httpUrl = 'https://example.com/image.png';
    expect(resolveImgPath(httpUrl)).toBe(httpUrl);
  });

  it('should prepend base URL for img paths', () => {
    const result = resolveImgPath('img/face/1.png');
    expect(result).toContain('img/face/1.png');
    expect(result).toMatch(/^https:\/\//);
  });
});
