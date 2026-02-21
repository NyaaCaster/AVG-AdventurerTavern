# 数据流转与最佳实践

## 📊 数据流转图

### 游戏启动流程

```
用户打开游戏
    ↓
加载本地配置 (LocalStorage)
    ↓
显示标题画面
    ↓
用户登录/注册
    ↓
获取用户存档列表
    ↓
用户选择：新游戏 / 读档
    ↓
初始化游戏状态
    ↓
开始游戏
```

### 存档数据流

```
游戏状态变化
    ↓
触发存档（自动/手动）
    ↓
useCoreState 收集数据
    ↓
GameScene.handleSaveGame()
    ↓
services/db.saveGame()
    ↓
HTTP POST /save → 数据库服务 (Port 3097)
    ↓
后端验证并存储 (database-server/index.js)
    ↓
SQLite 数据库 (database-server/data/database.sqlite)
```

### 读档数据流

```
用户选择存档
    ↓
HTTP POST /load → 数据库服务 (Port 3097)
    ↓
后端查询数据库 (database-server/index.js)
    ↓
从 SQLite 读取 (database-server/data/database.sqlite)
    ↓
返回 JSON 数据
    ↓
useCoreState.applyLoadedData()
    ↓
恢复游戏状态
    ↓
更新 UI
```

---

## 🎯 最佳实践

### 1. 存档时机

✅ **推荐**:
- 对话结束时自动存档
- 重要操作后自动存档
- 定时自动存档（5分钟）

❌ **避免**:
- 对话进行中存档
- 场景转换中存档
- 高频率存档（性能影响）

### 2. 数据验证

```typescript
// 存档前验证
if (!userId || userId <= 0) {
    throw new Error('Invalid user ID');
}

if (slotId < 0 || slotId > 3) {
    throw new Error('Invalid slot ID');
}

// 读档后验证
if (!data.gold || data.gold < 0) {
    data.gold = 0;
}
```

### 3. 错误处理

```typescript
try {
    await saveGame(userId, slotId, label, data);
} catch (error) {
    console.error('Save failed:', error);
    // 显示错误提示
    alert('保存失败，请检查网络连接');
}
```

### 4. 数据兼容性

```typescript
// 处理旧版本存档
const applyLoadedData = (data: any) => {
    // 设置默认值
    const safeData = {
        gold: data.gold || 0,
        inventory: data.inventory || {},
        characterStats: data.characterStats || {},
        // 新字段兼容
        userRecipes: data.userRecipes || [],
        foodStock: data.foodStock || {}
    };
    
    // 应用数据
    setGold(safeData.gold);
    setInventory(safeData.inventory);
    // ...
};
```

---

## 🔒 安全建议

1. **API Key 保护**: 不要在代码中硬编码 API Key
2. **密码安全**: 使用 bcrypt 加密，不要明文存储
3. **输入验证**: 所有用户输入都需要验证
4. **SQL 注入防护**: 使用参数化查询
5. **CORS 配置**: 生产环境限制允许的域名
6. **服务隔离**: 数据库服务与前端客户端分离部署
7. **网络安全**: 建议使用 HTTPS 加密通信（参考 database-server/SSL/）
8. **端口管理**: 数据库服务端口 (3097) 仅对可信来源开放

---

## 📈 性能优化

1. **批量操作**: 合并多个小操作为一次大操作
2. **延迟写入**: 使用防抖避免频繁存档
3. **数据压缩**: 大型存档考虑压缩
4. **索引优化**: 确保数据库索引正确
5. **缓存策略**: 减少不必要的数据库查询
6. **服务分离**: 前端和数据库独立扩展，避免资源竞争
7. **连接池**: 数据库服务使用连接池管理并发请求
8. **负载均衡**: 高并发场景可部署多个数据库服务实例

---

---

## 🏗️ 服务架构说明

### 前后端分离架构

本项目采用**微服务架构**，前端客户端和数据库服务独立部署：

```
┌─────────────────────────────────────┐
│      前端客户端 (Port 3098)          │
│   Docker: honywen/adv-tavern        │
│   Nginx + React 静态资源             │
└─────────────────────────────────────┘
              │
              │ HTTP/HTTPS
              │ API 调用
              ▼
┌─────────────────────────────────────┐
│    数据库服务 (Port 3097)            │
│   目录: database-server/             │
│   Node.js + Express                 │
│   SQLite: data/database.sqlite      │
└─────────────────────────────────────┘
```

### 服务通信

- **前端 → 数据库**: RESTful API (HTTP/HTTPS)
- **端口配置**:
  - 前端客户端: `3098`
  - 数据库服务: `3097`
- **数据格式**: JSON
- **认证方式**: 用户名/密码 (bcrypt 加密)

### 部署建议

1. **开发环境**: 两个服务都在本地运行
2. **生产环境**: 
   - 前端部署到 CDN 或静态托管
   - 数据库服务部署到独立服务器
   - 使用 HTTPS 加密通信
   - 配置防火墙限制数据库服务访问

### 数据持久化

- **数据库文件**: `database-server/data/database.sqlite`
- **备份策略**: 定期备份 SQLite 文件
- **Docker 卷**: 使用 Docker Volume 持久化数据

---

**最后更新**: 2026-02-21  
**设计者**: Nyaa  
**开发者**: Claude  
**维护者**: Claude  
**版本**: v2.0 (微服务架构)