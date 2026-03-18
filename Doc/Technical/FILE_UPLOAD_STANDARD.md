# 文件上传服务技术标准

本文档定义了 AdventurerTavern 项目的文件上传服务技术标准，用于指导后续模块的继承性开发。

## 概述

AdventurerTavern 使用独立的文件服务器（[file-server](https://github.com/NyaaCaster/file-server)）处理文件上传、存储和访问。该服务作为 Git Submodule 集成在主项目中。

## 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   主项目前端     │────▶│   File Server   │────▶│    文件存储      │
│  (React App)    │     │  (Nginx+Node)   │     │   (Files/)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Database API  │     │   Upload API    │
│   (端口 3097)    │     │   (端口 5102)   │
└─────────────────┘     └─────────────────┘
```

## 服务端点

| 服务 | 端口 | 协议 | 用途 |
|------|------|------|------|
| 文件服务器 HTTP | 5101 | HTTP | 开发环境文件访问 |
| 文件服务器 HTTPS | 5102 | HTTPS | 生产环境文件访问 |
| 上传 API | 5103 | HTTP | 直接访问上传 API（可选） |

## API 接口

### 认证方式

所有 API 请求需要在 Header 中携带 API Key：

```
Authorization: Bearer YOUR_API_KEY
```

### 上传单文件

**请求：**
```http
POST /api/upload HTTP/1.1
Host: your-domain.com:5102
Authorization: Bearer YOUR_API_KEY
X-Upload-Category: img/icon
Content-Type: multipart/form-data

file=<binary>
```

**响应：**
```json
{
  "success": true,
  "filename": "avatar.png",
  "originalName": "avatar.png",
  "size": 10240,
  "mimeType": "image/png",
  "path": "img/icon/avatar.png",
  "url": "/files/img/icon/avatar.png"
}
```

### 批量上传

**请求：**
```http
POST /api/upload/multiple HTTP/1.1
Authorization: Bearer YOUR_API_KEY
X-Upload-Category: img/bg
Content-Type: multipart/form-data

files[]=<binary1>
files[]=<binary2>
```

### 删除文件

**请求：**
```http
POST /api/delete HTTP/1.1
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "path": "img/icon/old-file.png"
}
```

### 列出文件

**请求：**
```http
POST /api/list HTTP/1.1
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "category": "img/icon"
}
```

## 目录分类

文件上传支持任意路径，目录不存在时会自动创建。建议按业务逻辑组织目录结构，例如：

- `img/icon` - UI 图标、头像
- `img/bg` - 场景背景
- `img/character` - 角色立绘
- `audio/bgm` - 背景音乐
- `save` - 存档文件
- `general` - 通用文件（默认）

**注意**：以上仅为建议，实际路径由业务功能决定。

## 前端集成

### 配置

```typescript
// config.ts
export const AppConfig = {
  fileServer: {
    baseUrl: 'https://h.hony-wen.com:5102',
    apiKey: '', // 运行时从环境变量获取
  },
};
```

### 使用示例

```typescript
import { fileUploadService } from './services/fileUpload';

// 上传单个文件
const result = await fileUploadService.uploadFile(file, 'img/icon');
if (result.success) {
  console.log('文件已上传:', result.url);
}

// 获取文件访问 URL
const fileUrl = fileUploadService.getFileUrl('img/icon/avatar.png');

// 删除文件
await fileUploadService.deleteFile('img/icon/old-avatar.png');

// 列出目录文件
const list = await fileUploadService.listFiles('img/icon');
```

## 安全配置

### API Key 管理

1. **开发环境**：在 `file-server/upload-server/api-keys.env` 中配置
2. **生产环境**：使用 GitHub Actions Secrets 管理

### GitHub Actions Secrets 配置

在 GitHub 仓库设置中添加以下 Repository secrets：

| Secret 名称 | 说明 |
|-------------|------|
| `FILE_SERVER_API_KEY` | 文件服务器 API Key |

### 前端 API Key 注入

由于前端代码无法直接访问环境变量，推荐以下方案：

1. **构建时注入**：通过 Vite 的 `define` 功能
2. **运行时获取**：从后端 API 获取临时 token
3. **代理方案**：通过后端代理上传请求

## 文件命名规则

- 文件名保留原始名称
- 同名文件会被覆盖
- 目录不存在时自动创建
- 支持多级目录结构

## 文件大小限制

| 限制项 | 值 |
|--------|-----|
| 单文件最大 | 50MB |
| 批量上传数量 | 20 个 |

## 错误处理

| 错误 | 原因 | 处理方式 |
|------|------|----------|
| `Missing Authorization header` | 未提供 API Key | 检查请求头 |
| `Invalid API key` | API Key 错误 | 验证 Key 配置 |
| `No file provided` | 未选择文件 | 检查表单数据 |
| `File size exceeds limit` | 文件过大 | 压缩或分割文件 |
| `Invalid path` | 路径遍历攻击 | 使用合法路径 |

## 相关链接

- 文件服务器仓库：https://github.com/NyaaCaster/file-server
- 主项目仓库：https://github.com/NyaaCaster/AVG-AdventurerTavern
