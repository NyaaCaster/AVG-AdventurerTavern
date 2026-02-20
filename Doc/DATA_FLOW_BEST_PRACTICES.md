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
HTTP POST /save
    ↓
后端验证并存储
    ↓
SQLite 数据库
```

### 读档数据流

```
用户选择存档
    ↓
HTTP POST /load
    ↓
后端查询数据库
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

---

## 📈 性能优化

1. **批量操作**: 合并多个小操作为一次大操作
2. **延迟写入**: 使用防抖避免频繁存档
3. **数据压缩**: 大型存档考虑压缩
4. **索引优化**: 确保数据库索引正确
5. **缓存策略**: 减少不必要的数据库查询

---

**最后更新**: 2026-02-21  
**维护者**: Nyaa