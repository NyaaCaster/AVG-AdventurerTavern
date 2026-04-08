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

  describe('uploadBlob', () => {
    it('应该成功上传 Blob 对象', async () => {
      const mockBlob = new Blob(['test content'], { type: 'image/png' });
      
      const mockResponse: UploadResult = {
        success: true,
        filename: '1_face.png',
        originalName: '1_face.png',
        size: 12,
        mimeType: 'image/png',
        path: 'img/face/userFace/1_face.png',
        url: '/files/img/face/userFace/1_face.png',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadBlob(mockBlob, '1_face.png', 'img/face/userFace');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5101/api/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'X-Upload-Category': 'img/face/userFace',
          }),
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.path).toBe('img/face/userFace/1_face.png');
      }
    });

    it('应该正确处理 PNG Blob', async () => {
      const mockBlob = new Blob(['png data'], { type: 'image/png' });
      
      const mockResponse: UploadResult = {
        success: true,
        filename: 'avatar.png',
        originalName: 'avatar.png',
        size: 8,
        mimeType: 'image/png',
        path: 'img/face/userFace/avatar.png',
        url: '/files/img/face/userFace/avatar.png',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadBlob(mockBlob, 'avatar.png', 'img/face/userFace');

      expect(result.success).toBe(true);
    });

    it('应该正确处理无类型的 Blob（默认为 PNG）', async () => {
      const mockBlob = new Blob(['data']);
      
      const mockResponse: UploadResult = {
        success: true,
        filename: 'test.png',
        originalName: 'test.png',
        size: 4,
        mimeType: 'image/png',
        path: 'img/test.png',
        url: '/files/img/test.png',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadBlob(mockBlob, 'test.png', 'img');

      expect(result.success).toBe(true);
    });

    it('应该处理上传错误', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      
      const mockResponse: UploadError = {
        success: false,
        error: 'File too large',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadBlob(mockBlob, 'large.png', 'img');

      expect(result.success).toBe(false);
    });

    it('应该使用正确的文件名', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      
      const mockResponse: UploadResult = {
        success: true,
        filename: '123_face.png',
        originalName: '123_face.png',
        size: 4,
        mimeType: 'image/png',
        path: 'img/face/userFace/123_face.png',
        url: '/files/img/face/userFace/123_face.png',
      };

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fileUploadService.uploadBlob(mockBlob, '123_face.png', 'img/face/userFace');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.filename).toBe('123_face.png');
      }
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
