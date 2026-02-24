# 设置迁移系统

## 概述

游戏实现了一个基于版本控制的设置迁移系统，用于在添加新配置选项或修改现有选项时确保平滑升级。该系统会自动检测过时的设置并将其迁移到当前版本，同时保留用户偏好。

## 架构设计

### 版本控制

```typescript
const SETTINGS_VERSION = 2; // 当前设置架构版本

interface StoredSettings extends GameSettings {
  _version?: number; // 与设置一起存储的版本标识符
}
```

系统使用简单的整数版本号来跟踪设置架构版本。每当设置结构发生变化（添加新字段、删除字段或修改字段类型）时，版本号就会递增。

## 迁移流程

### 1. 加载设置

应用程序启动时，尝试从 `localStorage` 读取设置：

```typescript
const stored = localStorage.getItem(STORAGE_KEY);
const parsed: StoredSettings = JSON.parse(stored);
```

### 2. 版本检查

系统将存储的版本与当前版本进行比较：

```typescript
if (!parsed._version || parsed._version < SETTINGS_VERSION) {
  // 触发迁移
}
```

### 3. 迁移过程

当检测到过时版本时：

1. **从默认值开始**：以当前默认设置为基础
2. **保留关键数据**：复制应该保留的用户特定数据：
   - API 配置（供应商、端点、API 密钥、模型）
   - 用户偏好（用户名、旅店名称）
   - 其他非结构性设置
3. **保存迁移后的设置**：将更新后的设置写回存储，并附带新版本号

```typescript
const migratedSettings = { ...defaultSettings };

// 保留 API 配置
if (parsed.apiConfig) {
  migratedSettings.apiConfig = { 
    ...defaultSettings.apiConfig, 
    ...parsed.apiConfig 
  };
}

// 保留用户数据
if (parsed.userName) migratedSettings.userName = parsed.userName;
if (parsed.innName) migratedSettings.innName = parsed.innName;

// 保存新版本
saveSettings(migratedSettings);
```

### 4. 安全字段合并

对于版本正确的设置，系统使用类型安全的字段合并：

```typescript
const mergedSettings: GameSettings = { ...defaultSettings };

// 仅复制类型有效的字段
if (typeof parsed.enableTypewriter === 'boolean') {
  mergedSettings.enableTypewriter = parsed.enableTypewriter;
}
if (typeof parsed.dialogueTransparency === 'number') {
  mergedSettings.dialogueTransparency = parsed.dialogueTransparency;
}
```

这种方法可以防止 `undefined` 值覆盖默认值。

## 优势

### 1. 自动升级
当添加新功能时，用户无需手动重置设置。系统会自动为新字段应用合理的默认值。

### 2. 数据保留
关键用户数据（API 密钥、自定义名称）在迁移过程中得以保留，避免用户需要重新配置所有内容。

### 3. 类型安全
字段合并期间的类型检查确保损坏或无效的数据不会破坏应用程序。

### 4. 调试支持
迁移事件会记录到控制台：

```typescript
console.log(`[Settings] Migrating from version ${parsed._version || 0} to ${SETTINGS_VERSION}`);
```

这有助于开发人员识别迁移发生的时间和原因。

## 版本历史

| 版本 | 变更内容 | 迁移策略 |
|------|---------|---------|
| 1 | 初始设置结构 | 不适用 |
| 2 | 添加新的布尔配置字段 | 保留 API 配置和用户数据，为新字段应用默认值 |

## 实现指南

### 何时递增版本号

在以下情况下递增 `SETTINGS_VERSION`：
- 向 `GameSettings` 添加新的必需字段
- 从 `GameSettings` 删除字段
- 更改字段类型
- 重构嵌套对象（例如 `apiConfig`）

### 何时不递增版本号

以下情况不需要递增：
- 添加具有默认值的可选字段
- 更改默认值（这些会自动应用）
- 仅影响 UI 而不影响设置架构的更改

### 添加新字段

添加新字段时：

1. 将字段添加到 `GameSettings` 类型定义
2. 将默认值添加到 `defaultSettings`
3. 递增 `SETTINGS_VERSION`
4. 在 `loadSettings()` 中添加类型安全的字段复制：

```typescript
if (typeof parsed.newField === 'boolean') {
  mergedSettings.newField = parsed.newField;
}
```

5. 如果字段需要特殊处理，更新迁移逻辑

## 测试迁移

测试迁移系统的步骤：

1. **模拟旧版本**：
   ```javascript
   // 在浏览器控制台中
   const oldSettings = JSON.parse(localStorage.getItem('adventurer_tavern_settings'));
   delete oldSettings._version; // 或设置为旧版本号
   localStorage.setItem('adventurer_tavern_settings', JSON.stringify(oldSettings));
   ```

2. **重新加载页面**：迁移应自动触发

3. **验证控制台输出**：查找迁移日志消息

4. **检查设置**：验证新字段具有默认值且旧字段已保留

## 错误处理

系统包含全面的错误处理：

```typescript
try {
  // 加载和解析设置
} catch (e) {
  console.error("Failed to load settings", e);
  return defaultSettings; // 回退到默认值
}
```

如果设置损坏或无法解析，系统会回退到默认设置，确保应用程序保持功能正常。

## 未来增强

迁移系统的潜在改进：

1. **迁移回调**：允许为复杂转换提供自定义迁移逻辑
2. **回滚支持**：存储先前的设置版本以支持潜在的回滚
3. **迁移历史**：跟踪已应用的迁移
4. **验证架构**：使用架构验证库（例如 Zod）进行更强大的类型检查

## 相关文件

- `utils/storage.ts` - 核心迁移实现
- `types.ts` - 设置类型定义
- `App.tsx` - 设置初始化和使用

## 结论

基于版本控制的设置迁移系统为应用程序配置架构的演进提供了一种健壮、可维护的方法。通过自动处理升级和保留用户数据，它确保了跨更新的流畅用户体验，同时保持代码质量和类型安全。

---

## 更新日志

### v1.0.0 (2026-02-25)
- 🎉 初始设计与实现
- 📊 基于版本号的自动迁移机制
- 🔒 类型安全的字段合并策略
- 💾 关键用户数据保留逻辑
- 📝 完整技术文档

---

**最后更新**: 2026-02-25  
**文档版本**: 1.0.0  
**设计者**: Nyaa  
**开发者**: Claude  
**维护者**: Claude  
**标签**: `#设置系统` `#版本控制` `#自动迁移` `#数据保留` `#类型安全`