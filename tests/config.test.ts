import { describe, it, expect } from 'vitest';
import { AppConfig, type AppConfigType } from '../config';

describe('AppConfig', () => {
  describe('配置结构', () => {
    it('应该包含 database 配置', () => {
      expect(AppConfig).toHaveProperty('database');
      expect(AppConfig.database).toHaveProperty('apiBaseUrl');
    });

    it('应该包含 fileServer 配置', () => {
      expect(AppConfig).toHaveProperty('fileServer');
      expect(AppConfig.fileServer).toHaveProperty('baseUrl');
      expect(AppConfig.fileServer).toHaveProperty('apiKey');
    });
  });

  describe('URL 格式验证', () => {
    it('database.apiBaseUrl 应该是有效的 HTTPS URL', () => {
      const url = AppConfig.database.apiBaseUrl;
      expect(url).toMatch(/^https:\/\//);
      expect(url).toContain('/api');
    });

    it('fileServer.baseUrl 应该是有效的 HTTPS URL', () => {
      const url = AppConfig.fileServer.baseUrl;
      expect(url).toMatch(/^https:\/\//);
    });
  });

  describe('端口配置', () => {
    it('database API 应该使用端口 3097', () => {
      expect(AppConfig.database.apiBaseUrl).toContain(':3097');
    });

    it('fileServer 应该使用端口 5102', () => {
      expect(AppConfig.fileServer.baseUrl).toContain(':5102');
    });
  });

  describe('类型导出', () => {
    it('应该导出 AppConfigType 类型', () => {
      const config: AppConfigType = AppConfig;
      expect(config).toBe(AppConfig);
    });
  });

  describe('配置值验证', () => {
    it('apiBaseUrl 应该是完整的 URL', () => {
      const url = new URL(AppConfig.database.apiBaseUrl);
      expect(url.protocol).toBe('https:');
      expect(url.pathname).toBe('/api');
    });

    it('fileServer.baseUrl 应该是完整的 URL', () => {
      const url = new URL(AppConfig.fileServer.baseUrl);
      expect(url.protocol).toBe('https:');
    });

    it('fileServer.apiKey 默认应该为空字符串', () => {
      expect(AppConfig.fileServer.apiKey).toBe('');
    });
  });
});
