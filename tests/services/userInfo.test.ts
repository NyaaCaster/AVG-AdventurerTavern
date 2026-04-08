import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config', () => ({
  AppConfig: {
    database: {
      apiBaseUrl: 'https://h.hony-wen.com:3097/api',
    },
    fileServer: {
      baseUrl: 'http://localhost:5101',
      apiKey: 'test-api-key',
    },
  },
}));

const API_BASE_URL = 'https://h.hony-wen.com:3097/api';

const apiCall = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (e) {
    console.error(`API Call Failed [${endpoint}]:`, e);
    return { success: false, message: `无法连接到服务器` };
  }
};

interface UserInfo {
  id: number;
  username: string;
  discord_username?: string;
  discord_avatar?: string;
  is_discord_bound: boolean;
  custom_avatar_url?: string;
  has_custom_avatar: boolean;
  created_at: number;
}

const getUserInfo = async (userId: number): Promise<UserInfo | null> => {
  const res = await apiCall('/user/info', { userId });
  
  if (res.success && res.user) {
    return res.user;
  }
  
  console.error('Failed to get user info:', res.message);
  return null;
};

const updateUsername = async (userId: number, newUsername: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiCall('/user/update_username', { userId, newUsername });
  return res;
};

const updateUserAvatar = async (userId: number, avatarUrl: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiCall('/user/update_avatar', { userId, avatarUrl });
  return res;
};

describe('getUserInfo - 获取用户信息', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常情况测试', () => {
    it('应该成功获取用户信息', async () => {
      const mockUserInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        discord_username: null,
        discord_avatar: null,
        is_discord_bound: false,
        custom_avatar_url: null,
        has_custom_avatar: false,
        created_at: Date.now()
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: mockUserInfo })
      });

      const result = await getUserInfo(1);

      expect(result).toEqual(mockUserInfo);
      expect(result?.id).toBe(1);
      expect(result?.username).toBe('testuser');
    });

    it('应该正确返回自定义头像信息', async () => {
      const mockUserInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        is_discord_bound: false,
        custom_avatar_url: 'img/face/userFace/1_face.png',
        has_custom_avatar: true,
        created_at: Date.now()
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: mockUserInfo })
      });

      const result = await getUserInfo(1);

      expect(result?.has_custom_avatar).toBe(true);
      expect(result?.custom_avatar_url).toBe('img/face/userFace/1_face.png');
    });

    it('应该正确返回 Discord 绑定信息', async () => {
      const mockUserInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        discord_username: 'discord_user',
        discord_avatar: 'avatar_hash',
        is_discord_bound: true,
        has_custom_avatar: false,
        created_at: Date.now()
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: mockUserInfo })
      });

      const result = await getUserInfo(1);

      expect(result?.is_discord_bound).toBe(true);
      expect(result?.discord_username).toBe('discord_user');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理用户不存在的情况', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: '用户不存在' })
      });

      const result = await getUserInfo(999);

      expect(result).toBeNull();
    });

    it('应该处理网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await getUserInfo(1);

      expect(result).toBeNull();
    });

    it('应该处理服务器错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await getUserInfo(1);

      expect(result).toBeNull();
    });
  });

  describe('参数验证测试', () => {
    it('应该发送正确的请求参数', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: { id: 1 } })
      });

      await getUserInfo(123);

      expect(fetch).toHaveBeenCalledWith(
        'https://h.hony-wen.com:3097/api/user/info',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 123 })
        })
      );
    });
  });
});

describe('updateUsername - 更新用户名', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常情况测试', () => {
    it('应该成功更新用户名', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: '用户名更新成功' })
      });

      const result = await updateUsername(1, 'newusername');

      expect(result.success).toBe(true);
      expect(result.message).toBe('用户名更新成功');
    });

    it('应该发送正确的请求参数', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await updateUsername(1, 'newusername');

      expect(fetch).toHaveBeenCalledWith(
        'https://h.hony-wen.com:3097/api/user/update_username',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 1, newUsername: 'newusername' })
        })
      );
    });
  });

  describe('错误处理测试', () => {
    it('应该处理用户名已存在的情况', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: '用户名已存在' })
      });

      const result = await updateUsername(1, 'existinguser');

      expect(result.success).toBe(false);
      expect(result.message).toBe('用户名已存在');
    });

    it('应该处理用户名长度不足的情况', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: '用户名长度必须在 2-20 个字符之间' })
      });

      const result = await updateUsername(1, 'a');

      expect(result.success).toBe(false);
      expect(result.message).toContain('2-20');
    });

    it('应该处理用户名过长的情况', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: '用户名长度必须在 2-20 个字符之间' })
      });

      const result = await updateUsername(1, 'a'.repeat(21));

      expect(result.success).toBe(false);
    });

    it('应该处理用户不存在的情况', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: '用户不存在' })
      });

      const result = await updateUsername(999, 'newusername');

      expect(result.success).toBe(false);
      expect(result.message).toBe('用户不存在');
    });

    it('应该处理网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await updateUsername(1, 'newusername');

      expect(result.success).toBe(false);
    });
  });
});

describe('updateUserAvatar - 更新用户头像', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常情况测试', () => {
    it('应该成功更新用户头像', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: '头像更新成功' })
      });

      const result = await updateUserAvatar(1, 'img/face/userFace/1_face.png');

      expect(result.success).toBe(true);
      expect(result.message).toBe('头像更新成功');
    });

    it('应该发送正确的请求参数', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await updateUserAvatar(123, 'img/face/userFace/123_face.png');

      expect(fetch).toHaveBeenCalledWith(
        'https://h.hony-wen.com:3097/api/user/update_avatar',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            userId: 123, 
            avatarUrl: 'img/face/userFace/123_face.png' 
          })
        })
      );
    });
  });

  describe('错误处理测试', () => {
    it('应该处理用户不存在的情况', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: '用户不存在' })
      });

      const result = await updateUserAvatar(999, 'img/face/userFace/999_face.png');

      expect(result.success).toBe(false);
      expect(result.message).toBe('用户不存在');
    });

    it('应该处理网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await updateUserAvatar(1, 'img/face/userFace/1_face.png');

      expect(result.success).toBe(false);
    });
  });

  describe('头像路径格式测试', () => {
    it('应该接受标准头像路径格式', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await updateUserAvatar(1, 'img/face/userFace/1_face.png');

      expect(result.success).toBe(true);
    });

    it('应该接受不同用户ID的头像路径', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await updateUserAvatar(42, 'img/face/userFace/42_face.png');

      expect(result.success).toBe(true);
    });
  });
});

describe('用户信息数据保护测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该保留用户的自定义头像设置', async () => {
    const originalInfo: UserInfo = {
      id: 1,
      username: 'testuser',
      is_discord_bound: false,
      custom_avatar_url: 'img/face/userFace/1_face.png',
      has_custom_avatar: true,
      created_at: Date.now()
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, user: originalInfo })
    });

    const result = await getUserInfo(1);

    expect(result?.has_custom_avatar).toBe(true);
    expect(result?.custom_avatar_url).toBe('img/face/userFace/1_face.png');
  });

  it('应该正确处理没有自定义头像的用户', async () => {
    const mockUserInfo: UserInfo = {
      id: 1,
      username: 'testuser',
      is_discord_bound: false,
      custom_avatar_url: null,
      has_custom_avatar: false,
      created_at: Date.now()
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, user: mockUserInfo })
    });

    const result = await getUserInfo(1);

    expect(result?.has_custom_avatar).toBe(false);
    expect(result?.custom_avatar_url).toBeNull();
  });
});
