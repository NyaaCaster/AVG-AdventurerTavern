# 项目图标使用说明

## 概述

本文档汇总了本项目使用的所有图标实现方式，供开发者参考。

---

## 图标实现方式概览

| 实现方式 | 使用场景 | 主要文件 |
|---------|---------|---------|
| **Font Awesome** | 按钮、Toast 提示、UI 交互 | 最广泛使用 |
| **@ant-design/icons** | 配置界面特定图标 | ConfigScreen.tsx |
| **SVG 文件** | 天气图标、自定义图标 | WeatherIcon.tsx |
| **Emoji** | 技能、状态、战斗效果 | ToastManager.tsx, battle-preview.html |
| **图片资源** | 角色头像、战斗单位 | BattleScene.tsx |
| **CSS 背景/伪元素** | 装饰性图标 | index.html |

---

## 1. Font Awesome 字体图标库

### CDN 引入位置

- **主页面**：[index.html#L10](file:///d:/GitHub/AVG-AdventurerTavern/index.html#L10)
- **战斗预览页面**：[battle-preview.html#L106](file:///d:/GitHub/AVG-AdventurerTavern/battle-preview.html#L106)
- **RPG Maker 预览页面**：[rpgmaker-battle-preview.html#L7](file:///d:/GitHub/AVG-AdventurerTavern/rpgmaker-battle-preview.html#L7)

### 版本信息

当前使用的是 **Font Awesome 6.4.0** 版本（Free 免费版）。

### 官方图标查询

- **Font Awesome 官方图标库**：https://fontawesome.com/icons
- 支持按分类搜索、查看 CSS 类名
- 建议筛选 **Free** 标签的图标（专业版图标不可用）

### 项目中已使用的图标

| 图标类名 | 用途 |
|---------|------|
| `fa-right-from-bracket` | 退出/登出 |
| `fa-rotate-right` | 刷新/重新生成 |
| `fa-paper-plane` | 发送 |
| `fa-coins` | 金币 |
| `fa-heart` | 爱心/好感度 |
| `fa-unlock` | 解锁 |
| `fa-user` | 用户/入住 |
| `fa-sword` | 武器/战斗 |
| `fa-terminal` | 终端/调试 |
| `fa-xmark` | 关闭 |
| `fa-screwdriver-wrench` | 工具 |
| `fa-calendar-days` | 日历 |
| `fa-clock` | 时钟 |
| `fa-arrow-up` | 箭头上 |
| `fa-arrow-down` | 箭头下 |
| `fa-bed` | 旅店/住宿 |
| `fa-house-chimney` | 房屋 |
| `fa-chart-pie` | 统计图表 |
| `fa-chart-line` | 趋势图 |
| `fa-hammer` | 工具/建造 |
| `fa-wrench` | 设置 |
| `fa-gear` | 齿轮/设置 |
| `fa-broom` | 清洁 |
| `fa-comments` | 对话 |
| `fa-bullhorn` | 广播/揽客 |
| `fa-face-smile` | 满意度 |
| `fa-magnet` | 吸引力 |
| `fa-utensils` | 餐具/烹饪 |
| `fa-fire-burner` | 烹饪 |
| `fa-carrot` | 食材 |
| `fa-flask` | 炼金/实验 |
| `fa-boxes-stacked` | 库存 |
| `fa-cube` | 物品 |
| `fa-basket-shopping` | 购物 |
| `fa-khanda` | 武器 |
| `fa-shield-halved` | 盾牌 |
| `fa-ring` | 戒指/饰品 |
| `fa-star` | 星级/评价 |
| `fa-check` | 确认 |
| `fa-circle-check` | 完成 |

### 使用文件参考

- [ChatInterface.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/ChatInterface.tsx#L125-L126) - 退出按钮、重新生成、发送按钮
- [ToastManager.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/ToastManager.tsx#L131-L132) - 金币、爱心、解锁、用户等 Toast 图标
- [SceneActionBtn.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/SceneActionBtn.tsx#L125-L126) - 场景操作按钮

---

## 2. @ant-design/icons

### 使用位置

- [ConfigScreen.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/ConfigScreen.tsx#L35-L39)

### 已使用的图标

- `Icons.Ollama`
- `Icons.Google`

---

## 3. SVG 图标（文件形式）

### 使用位置

- [WeatherIcon.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/WeatherIcon.tsx#L1-L35) - 天气图标，从 `img/svg/weather/` 目录加载
- [ChatInterface.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/ChatInterface.tsx#L172-L174) - 使用 `free-chat.svg` 等 SVG 文件
- [ToastManager.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/ToastManager.tsx#L168-L171) - 自定义内联 SVG 灵感图标

### SVG 文件存放路径

- `img/svg/` - 通用 SVG 图标
- `img/svg/weather/` - 天气相关 SVG 图标

---

## 4. Emoji 字符串作为图标

### 使用位置

- [ToastManager.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/ToastManager.tsx#L326-L327) - 技能图标 `"🔯"`
- [battle-preview.html](file:///d:/GitHub/AVG-AdventurerTavern/battle-preview.html#L300-L304) - 状态图标 `☠️`
- [index.html](file:///d:/GitHub/AVG-AdventurerTavern/index.html#L605-L607) - 战斗效果 `🔥`、`🎯`

---

## 5. 图片资源作为图标

通过 `resolveImgPath` 工具函数加载图片资源。

### 使用位置

- [BattleScene.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/scenes/BattleScene.tsx#L100-L113) - 敌方单位图片
- [TurnOrderPanel.tsx](file:///d:/GitHub/AVG-AdventurerTavern/components/scenes/BattleSceneModules/TurnOrderPanel.tsx#L126) - 角色头像
- [characterImageResources.ts](file:///d:/GitHub/AVG-AdventurerTavern/data/resources/characterImageResources.ts) - 角色图片资源定义

### 图片资源路径规范

根据 [FILE_UPLOAD_STANDARD.md](file:///d:/GitHub/AVG-AdventurerTavern/Doc/Technical/FILE_UPLOAD_STANDARD.md#L112) 文档：
- `img/icon/` - UI 图标和头像

---

## 6. CSS 背景图片/伪元素

### 使用位置

- [index.html](file:///d:/GitHub/AVG-AdventurerTavern/index.html#L139-L141) - 背景图片设置图标
- [battle-preview.html](file:///d:/GitHub/AVG-AdventurerTavern/battle-preview.html#L140-L140) - `::before` 伪元素实现关闭按钮图标

---

## 图标选择建议

### 根据界面风格选择

1. **沉浸式界面**（旅店管理、库存等）
   - 优先使用 Font Awesome 图标
   - 参考 [story_style.md](file:///d:/GitHub/AVG-AdventurerTavern/Doc/UI_Style/story_style.md) 中的图标映射表

2. **第四面墙界面**（存档、设置等）
   - 可使用 Font Awesome 或自定义 SVG
   - 参考 [config_style.md](file:///d:/GitHub/AVG-AdventurerTavern/Doc/UI_Style/config_style.md)

3. **调试界面**
   - 使用 Font Awesome 图标
   - 参考 [debug_style.md](file:///d:/GitHub/AVG-AdventurerTavern/Doc/UI_Style/debug_style.md) 中的图标列表

### 新增图标流程

1. 优先在 [Font Awesome 官网](https://fontawesome.com/icons) 搜索免费图标
2. 如 Font Awesome 不满足需求，考虑使用 SVG 文件
3. 将新 SVG 文件放入 `img/svg/` 目录
4. 更新本文档记录新增图标

---

**文档版本**：v1.0  
**最后更新**：2026-03-28  
**维护者**：AI Assistant
