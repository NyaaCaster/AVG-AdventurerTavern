# 技术向调试界面风格规范

## 概述
技术向调试界面风格用于开发者和维护者使用的调试工具，采用极简的现代化极客风格，让使用者明确知道这是用于调试和维护的界面，而不是游戏内容。设计理念是终端风格、高可读性和专业的技术感。

**适用界面：**
- API 日志控制台 (`DebugLogModal.tsx`)
- 资源调整工具 (`ResourceDebugModal.tsx`)
- 位置分布查看器 (`GameScene.tsx` 中的 Current Location Distribution)

**设计标准：**
以 `DebugLogModal.tsx` 的风格为基准

---

## 色彩系统

### 主色调
- **深黑背景**：`#0c0c0c` - 接近纯黑
- **次级背景**：`#1a1a1a` - 深灰黑
- **卡片背景**：`slate-900` / `slate-800` - 深灰色系

### 强调色
- **主要强调**：`emerald-500` / `emerald-400` - 翠绿色（终端风格）
- **警告色**：`yellow-500` / `yellow-400` - 黄色
- **错误色**：`red-400` / `red-900` - 红色系
- **信息色**：`blue-400` / `blue-900` - 蓝色系

### 文本色彩
- **主文本**：`slate-300` / `slate-200` - 浅灰色
- **次要文本**：`slate-500` / `slate-600` - 中灰色
- **强调文本**：`emerald-400` / `yellow-500` - 彩色强调

### 边框与分隔
- **主边框**：`slate-700/50` / `slate-800` - 半透明深灰
- **强调边框**：`yellow-500/50` / `yellow-500/30` - 半透明黄色
- **分隔线**：`slate-800/50` - 半透明深灰

---

## 字体系统

### 等宽字体
```css
/* 所有调试界面使用等宽字体 */
font-family: monospace / 'Courier New' / 'Monaco';
```

### 字体大小
```css
/* 标准文本 */
font-size: 12px (移动) / 14px (桌面);

/* 小文本 */
font-size: 10px;

/* 标题 */
font-size: 16-18px;
```

---

## 布局规范

### 容器结构
```css
/* 全屏模态框 */
background: #0c0c0c;
border: 1px solid rgba(148, 163, 184, 0.5);
border-radius: 8px;
box-shadow: 0 25px 50px rgba(0,0,0,0.5);

/* 头部区域 */
background: #1a1a1a;
border-bottom: 1px solid slate-800;
padding: 12px 16px;

/* 内容区域 */
background: #0c0c0c;
padding: 16px;
overflow-y: auto;
```

### 边框样式
```css
/* 标准边框 */
border: 1px solid rgba(148, 163, 184, 0.5);

/* 强调边框 */
border: 1px solid rgba(234, 179, 8, 0.5);
border-left: 4px solid rgba(234, 179, 8, 0.2);

/* 分类边框 */
border-left: 2px solid blue-900/30 (request);
border-left: 2px solid emerald-900/30 (response);
border-left: 2px solid red-900/30 (error);
```

---

## 按钮样式

### 标准按钮
```css
background: slate-700;
color: slate-300;
border: 1px solid slate-600;
padding: 8px 12px;
border-radius: 4px;

hover: {
  background: slate-600;
}
```

### 增减按钮
```css
/* 减少按钮 */
background: slate-700;
border: 1px solid slate-600;
color: slate-300;

hover: {
  background: rgba(127, 29, 29, 0.5); /* red-900/50 */
  border-color: red-500;
  color: rgb(252, 165, 165); /* red-200 */
}

/* 增加按钮 */
background: slate-700;
border: 1px solid slate-600;
color: slate-300;

hover: {
  background: rgba(6, 78, 59, 0.5); /* emerald-900/50 */
  border-color: emerald-500;
  color: rgb(167, 243, 208); /* emerald-200 */
}
```

---

## 日志系统样式

### 日志条目
```css
/* 日志容器 */
margin-bottom: 24px;
border-bottom: 1px solid rgba(30, 41, 59, 0.5);
padding-bottom: 16px;

/* 日志头部 */
display: flex;
align-items: center;
gap: 12px;
opacity: 0.7;

group-hover: {
  opacity: 1;
}
```

### 日志类型标签
```css
/* Request */
background: rgba(30, 58, 138, 0.3); /* blue-900/30 */
color: rgb(96, 165, 250); /* blue-400 */

/* Response */
background: rgba(6, 78, 59, 0.3); /* emerald-900/30 */
color: rgb(52, 211, 153); /* emerald-400 */

/* Error */
background: rgba(127, 29, 29, 0.3); /* red-900/30 */
color: rgb(248, 113, 113); /* red-400 */

/* 通用属性 */
font-weight: bold;
padding: 2px 6px;
border-radius: 4px;
font-size: 10px;
text-transform: uppercase;
```

### Token 使用显示
```css
/* 容器 */
display: flex;
align-items: center;
gap: 12px;
font-size: 10px;
background: rgba(15, 23, 42, 0.8); /* slate-900/80 */
border: 1px solid slate-800;
padding: 2px 8px;
border-radius: 4px;
box-shadow: 0 1px 2px rgba(0,0,0,0.05);

/* Input Tokens */
color: slate-400;
icon: fa-arrow-up;

/* Output Tokens */
color: emerald-400;
icon: fa-arrow-down;

/* Total Tokens */
color: amber-500;
font-weight: bold;
border-left: 1px solid slate-700;
padding-left: 8px;
margin-left: 4px;
```

---

## 表格与列表

### 资源列表项
```css
/* 容器 */
background: rgba(30, 41, 59, 0.3); /* slate-800/30 */
border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700/50 */
padding: 8px 12px;
border-radius: 4px;

hover: {
  border-color: slate-600;
}

/* 金币特殊样式 */
background: rgba(30, 41, 59, 0.5);
border: 1px solid rgba(234, 179, 8, 0.2);
```

### 位置分布网格
```css
/* 网格容器 */
display: grid;
grid-template-columns: repeat(1, 1fr) (移动);
grid-template-columns: repeat(2, 1fr) (平板);
grid-template-columns: repeat(3, 1fr) (桌面);
gap: 16px;

/* 位置卡片 */
background: rgba(30, 41, 59, 0.5);
border: 1px solid slate-700;
padding: 12px;
border-radius: 4px;

/* 角色标签 */
background: rgba(67, 56, 202, 0.5); /* indigo-900/50 */
color: rgb(199, 210, 254); /* indigo-200 */
border: 1px solid rgba(99, 102, 241, 0.2); /* indigo-500/20 */
padding: 2px 6px;
font-size: 12px;
border-radius: 4px;
```

---

## 图标系统

### 常用图标
```
- 终端：fa-terminal
- 关闭：fa-xmark
- 工具：fa-screwdriver-wrench
- 日历：fa-calendar-days
- 时钟：fa-clock
- 金币：fa-coins
- 箭头上：fa-arrow-up
- 箭头下：fa-arrow-down
```

---

## 滚动条样式

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #0c0c0c;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: slate-700;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: slate-600;
}
```

---

## 动画效果

```css
/* 淡入 */
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

/* 悬停过渡 */
transition: opacity 0.2s, background 0.2s, border-color 0.2s;
```

---

## 设计原则

1. **终端风格**：黑色背景 + 绿色文字的经典终端配色
2. **等宽字体**：所有文本使用等宽字体
3. **高对比度**：确保文字清晰可读
4. **极简设计**：去除不必要的装饰
5. **功能优先**：信息密度高，便于快速查看
6. **专业感**：让开发者一眼识别这是调试工具

---

**文档版本**：v1.0  
**最后更新**：2026-02-21 
**维护者**：Gemini