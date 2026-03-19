import { AppConfig } from '../config';

export interface UploadResult {
  success: true;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
}

export interface UploadError {
  success: false;
  error: string;
}

export interface FileListResult {
  success: true;
  files: Array<{
    name: string;
    size: number;
    modified: string;
  }>;
}

export interface FileListError {
  success: false;
  error: string;
}

class FileUploadService {
  private getBaseUrl(): string {
    return AppConfig.fileServer.baseUrl;
  }

  private getApiKey(): string {
    return AppConfig.fileServer.apiKey;
  }

  async uploadFile(
    file: File,
    category: string = 'general'
  ): Promise<UploadResult | UploadError> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.getBaseUrl()}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getApiKey()}`,
        'X-Upload-Category': category,
      },
      body: formData,
    });

    return response.json();
  }

  async uploadMultipleFiles(
    files: File[],
    category: string = 'general'
  ): Promise<{ success: boolean; count: number; files: UploadResult[] } | UploadError> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${this.getBaseUrl()}/api/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getApiKey()}`,
        'X-Upload-Category': category,
      },
      body: formData,
    });

    return response.json();
  }

  async deleteFile(path: string): Promise<{ success: boolean } | UploadError> {
    const response = await fetch(`${this.getBaseUrl()}/api/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    return response.json();
  }

  async listFiles(category: string = ''): Promise<FileListResult | UploadError> {
    const response = await fetch(`${this.getBaseUrl()}/api/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category }),
    });

    return response.json();
  }

  getFileUrl(path: string): string {
    return `${this.getBaseUrl()}/files/${path}`;
  }
}

export const fileUploadService = new FileUploadService();
