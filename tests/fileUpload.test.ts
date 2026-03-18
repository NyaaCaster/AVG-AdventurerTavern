import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileUploadService, type UploadResult, type UploadError, type FileListResult } from '../services/fileUpload';

vi.mock('../config', () => ({
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

describe('fileUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFileUrl', () => {
    it('应该返回正确的文件 URL', () => {
      const url = fileUploadService.getFileUrl('img/icon/test.png');
      expect(url).toBe('http://localhost:5101/files/img/icon/test.png');
    });

    it('应该处理带前导斜杠的路径', () => {
      const url = fileUploadService.getFileUrl('/img/bg/scene.png');
      expect(url).toContain('/files/');
    });
  });

  describe('uploadFile', () => {
    it('应该发送正确的上传请求', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      
      const mockResponse: UploadResult = {
        success: true,
        filename: 'test.png',
        originalName: 'test.png',
        size: 12,
        mimeType: 'image/png',
        path: 'img/icon/test.png',
        url: '/files/img/icon/test.png',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadFile(mockFile, 'img/icon');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5101/api/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'X-Upload-Category': 'img/icon',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('应该处理上传错误', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      const mockResponse: UploadError = {
        success: false,
        error: 'Invalid API key',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect((result as UploadError).error).toBe('Invalid API key');
    });
  });

  describe('deleteFile', () => {
    it('应该发送正确的删除请求', async () => {
      const mockResponse = { success: true };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.deleteFile('img/icon/test.png');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5101/api/delete',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('listFiles', () => {
    it('应该发送正确的列表请求', async () => {
      const mockResponse: FileListResult = {
        success: true,
        files: [
          { name: 'test.png', size: 1024, modified: '2024-01-01' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.listFiles('img/icon');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5101/api/list',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ category: 'img/icon' }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
