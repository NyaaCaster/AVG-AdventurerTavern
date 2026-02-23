# 沉浸式界面风格规范

## 概述
沉浸式界面风格用于游戏内核心功能界面，营造玩家身处游戏世界的氛围感。设计理念是让界面看起来像游戏世界中真实存在的物品（账本、木板、羊皮纸等），而非现代化的数字界面。

**适用界面：**
- 旅店管理 (`ManagementModal.tsx`)
- 旅店扩建 (`ExpansionModal.tsx`)
- 库存盘查 (`InventoryModal.tsx`)
- 烹饪系统 (`CookingModal.tsx`)

---

## 色彩系统

### 主色调
- **背景基色**：`#e8dfd1` - 羊皮纸/旧纸张色
- **深色背景**：`#2c241b` - 深棕木色
- **次级背景**：`#382b26` - 中棕色
- **最深背景**：`#1a1512` - 接近黑的深棕

### 强调色
- **主要强调**：`#b45309` / `#9b7a4c` - 琥珀金/古铜色
- **边框装饰**：`#d6cbb8` / `#c7bca8` - 浅棕米色

### 文本色彩
- **主文本**：`#382b26` / `#2c241b` - 深棕色（高对比度）
- **次要文本**：`#5c4d45` / `#8c7b70` - 中灰棕色
- **浅色文本**：`#f0e6d2` / `#fffef8` - 米白色（用于深色背景）

### 功能色彩
- **成功/正向**：`emerald-500` / `emerald-600` - 翠绿色
- **警告/金币**：`amber-400` / `yellow-400` - 琥珀黄
- **错误/负向**：`red-500` / `red-600` - 红色
- **信息/中性**：`cyan-500` / `blue-400` - 青蓝色

---

## 纹理与材质

### 纸张纹理
```css
/* 羊皮纸背景 - 使用 SVG 图案 */
background-image: url("data:image/svg+xml,%3Csvg width='60' height='60'...");
opacity: 0.05-0.1;
```

### 木纹效果
```css
/* 深色木质背景 - 使用渐变模拟 */
background: linear-gradient(to bottom, #2c241b, #1a1512);
/* 可叠加纹理图案增强效果 */
```

### 线条装饰
```css
/* 账本横线效果 */
background-image: linear-gradient(#9b7a4c 1px, transparent 1px);
background-size: 100% 2.5rem;
opacity: 0.1;
margin-top: 3rem; /* 从标题下方开始 */
```

### 书脊效果
```css
/* 账本左侧书脊 */
width: 3-4px (移动端) / 4px (桌面);
background: linear-gradient(to right, #2c241b, #3d3226, #2c241b);
border-right: 1px solid #1a1512;
box-shadow: 0 0 50px rgba(0,0,0,0.5);

/* 书脊纹理叠加 */
opacity: 0.3;
background-pattern: 细小网格或噪点;
```

---

## 布局规范

### 容器结构
- **外层容器**：`bg-[#e8dfd1]` 羊皮纸色 + 细微纹理
- **深色容器**：`bg-[#2c241b]` 木质感 + 渐变效果
- **卡片容器**：`bg-[#f5f0e6]` / `bg-[#fcfaf7]` / `bg-[#fffef8]` 浅米色系

### 边框样式
```css
/* 主要边框 - 粗重装饰性 */
border: 2-3px solid #9b7a4c;
border-radius: 8-12px;

/* 次要边框 - 细腻分隔 */
border: 1-2px solid #d6cbb8;
border-radius: 4-8px;

/* 装饰性外框 */
border: 8px solid #382b26;
box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
border-left: 0; /* 书脊侧无边框 */
```

### 圆角规范
- **大容器**：`rounded-xl` (12px) / `rounded-lg` (8px)
- **卡片/按钮**：`rounded-lg` (8px) / `rounded` (4px)
- **小元素**：`rounded` (4px) / `rounded-sm` (2px)
- **圆形元素**：`rounded-full`
- **书本右侧**：`rounded-r-xl` (右侧圆角)

---

## 按钮样式

### 主要操作按钮
```css
/* 深色主按钮 */
background: #382b26;
color: #f0e6d2;
border: 2px solid #9b7a4c;
padding: 12-16px (桌面) / 10-12px (移动);
font-weight: bold;
letter-spacing: 0.1em;
box-shadow: 0 4px 16px rgba(0,0,0,0.15);

hover: {
  background: #4a3b32;
  transform: scale(1.01);
}
```

### 次要操作按钮
```css
/* 浅色次按钮 */
background: #e8dfd1;
color: #5c4d45;
border: 1px solid #d6cbb8;
padding: 8-12px;
font-weight: bold;

hover: {
  background: #d6cbb8;
}
```

### 功能性按钮（小型）
```css
/* 内联操作按钮 - 三种配色 */
/* 绿色系 - 清洁/正向 */
background: emerald-100;
color: emerald-800;
border: 1px solid emerald-200;

/* 黄色系 - 揽客/警告 */
background: amber-100;
color: amber-800;
border: 1px solid amber-200;

/* 青色系 - 客谈/信息 */
background: cyan-100;
color: cyan-800;
border: 1px solid cyan-200;

/* 通用属性 */
padding: 6-8px;
font-size: 12-14px;
font-weight: bold;
border-radius: 4-8px;

hover: background 加深一级;
```

### 关闭按钮
```css
/* 右上角关闭 */
width: 24-28px (移动) / 28-32px (桌面);
height: 24-28px (移动) / 28-32px (桌面);
background: transparent / #382b26;
color: #9b7a4c;
border-radius: 50%;

hover: {
  background: rgba(255,255,255,0.1);
  color: #f0e6d2;
}
```

---

## 文本样式

### 标题层级
```css
/* H1 - 主标题 */
font-size: 18-20px (移动) / 20-24px (桌面);
font-weight: bold;
color: #382b26;
letter-spacing: 0.2em;

/* H2 - 次级标题 */
font-size: 16-18px (移动) / 18-20px (桌面);
font-weight: bold;
color: #2c241b;

/* H3 - 小标题 */
font-size: 14-16px (移动) / 16-18px (桌面);
font-weight: bold;
color: #5c4d45;

/* H4 - 卡片标题 */
font-size: 12-14px (移动) / 14-16px (桌面);
font-weight: bold;
color: #382b26;
```

### 正文文本
```css
/* 主要正文 */
font-size: 12-13px (移动) / 14px (桌面);
color: #382b26;
line-height: 1.5;

/* 次要说明 */
font-size: 10-11px (移动) / 12px (桌面);
color: #5c4d45 / #8c7b70;
line-height: 1.4;

/* 小字注释 */
font-size: 9-10px;
color: #8c7b70;
text-transform: uppercase (可选);
letter-spacing: 0.05-0.1em;
```

### 数值显示
```css
/* 大数值 */
font-size: 20-24px (移动) / 24-32px (桌面);
font-weight: 900 (black);
font-family: mono (可选);
color: #382b26 / #b45309;

/* 小数值 */
font-size: 14-16px (移动) / 14-18px (桌面);
font-weight: bold;
font-family: mono;
color: #b45309;
```

---

## 图标系统

### 图标库
使用 **Font Awesome Solid** 图标集

### 常用图标映射
```
功能分类：
- 旅店/住宿：fa-bed, fa-house-chimney
- 金币/货币：fa-coins (配合 #fcd34d 金色)
- 统计数据：fa-chart-pie, fa-chart-line
- 操作工具：fa-hammer, fa-wrench, fa-gear
- 清洁维护：fa-broom
- 社交互动：fa-comments, fa-bullhorn, fa-face-smile
- 吸引力：fa-magnet
- 食物烹饪：fa-utensils, fa-fire-burner, fa-carrot, fa-flask
- 库存物品：fa-boxes-stacked, fa-cube, fa-basket-shopping
- 武器装备：fa-khanda, fa-shield-halved, fa-ring
- 评价星级：fa-star
- 界面控制：fa-xmark (关闭), fa-check (确认), fa-circle-check
```

### 图标尺寸
```css
/* 大图标 - 装饰性 */
font-size: 48-64px;
opacity: 0.6;

/* 中图标 - 功能性 */
font-size: 24-32px;

/* 小图标 - 内联 */
font-size: 14-18px;

/* 微图标 - 标签内 */
font-size: 10-14px;
width: 12-20px (固定宽度居中);
```

### 图标颜色
```css
/* 装饰性图标 */
color: #9b7a4c;
opacity: 0.5-0.7;

/* 功能性图标 */
color: inherit; /* 继承父元素 */

/* 状态图标 */
成功: emerald-600;
警告: amber-600;
错误: red-600;
信息: cyan-600;
```

---

## 交互反馈

### 悬停效果
```css
/* 按钮悬停 */
transform: scale(1.02) / translateY(-2px);
background: 颜色加深 10-20%;
border-color: 强调色;
transition: all 0.2-0.3s;

/* 卡片悬停 */
border-color: #9b7a4c;
box-shadow: 0 4px 16px rgba(0,0,0,0.15);
background: 颜色加深 5%;
transition: all 0.2-0.3s;
```

### 点击反馈
```css
/* 按钮按下 */
transform: scale(0.95-0.98);
box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
```

### 禁用状态
```css
/* 禁用按钮 */
background: #d6cbb8;
color: #f5f0e6;
cursor: not-allowed;
opacity: 0.5-0.6;
```

### 加载状态
```css
/* 旋转加载器 */
width: 40-56px (移动) / 56px (桌面);
height: 40-56px (移动) / 56px (桌面);
border: 4px solid #382b26;
border-top-color: transparent;
border-radius: 50%;
animation: spin 1s linear infinite;

/* 脉冲效果 */
animation: pulse 2s ease-in-out infinite;
```

---

## 进度条与状态栏

### 横向进度条
```css
/* 容器 */
height: 6px (移动) / 6-8px (桌面);
background: #d6cbb8;
border: 1px solid #c7bca8;
border-radius: 9999px;
box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);

/* 填充条 */
height: 100%;
background: emerald-500 / cyan-500 / rose-500;
border-radius: 9999px;
transition: width 1s ease-out;
```

### 数值标签
```css
/* 进度条上方标签 */
font-size: 10px (移动) / 10-12px (桌面);
font-weight: bold;
color: #5c4d45;
display: flex;
justify-content: space-between;
margin-bottom: 2-4px;
```

### 状态栏示例（旅店管理）
```
满足度：emerald-500 (绿色) + fa-face-smile
集客力：cyan-500 (青色) + fa-magnet
好评度：rose-500 (玫瑰红) + fa-star
```

---

## 模态框与弹窗

### 遮罩层
```css
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(4px);
z-index: 100;
```

### 主模态框
```css
/* 大型模态框 */
max-width: 640px (移动) / 1024-1280px (桌面);
height: 70vh (移动) / 85-90vh (桌面);
background: #e8dfd1 / #2c241b;
border: 2-3px solid #9b7a4c;
border-radius: 12px (右侧) / 2px (左侧);
box-shadow: 0 0 50px rgba(0,0,0,0.5);
```

### 小型确认框
```css
/* 确认对话框 */
max-width: 400-500px;
background: #fffef8;
border: 2px solid #d6cbb8;
padding: 12-16px (移动) / 20-24px (桌面);
border-radius: 8px;
box-shadow: 0 10px 40px rgba(0,0,0,0.3);
transform: rotate(-1deg); /* 可选，增加手写感 */
```

### 胶带装饰效果
```css
/* 顶部胶带 - 模拟便签纸固定 */
position: absolute;
top: -12px;
left: 50%;
transform: translateX(-50%);
width: 64-80px (移动) / 80-100px (桌面);
height: 20-24px (移动) / 24-32px (桌面);
background: rgba(243, 240, 224, 0.9);
border-left: 1px solid rgba(255,255,255,0.5);
border-right: 1px solid rgba(255,255,255,0.5);
transform: translateX(-50%) rotate(1deg);
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
```

---

## 表格样式

### 表头
```css
font-size: 9-10px (移动) / 10-12px (桌面);
color: #8c7b70;
text-transform: uppercase;
font-weight: bold;
letter-spacing: 0.1-0.15em;
border-bottom: 1-2px solid #9b7a4c;
padding-bottom: 4-8px;
```

### 表格行
```css
font-size: 10-12px (移动) / 12-14px (桌面);
color: #382b26;
border-bottom: 1px solid rgba(214, 203, 184, 0.3);
padding: 4-8px (移动) / 8-12px (桌面);

hover: {
  background: rgba(155, 122, 76, 0.1);
}
```

### 表格单元格
```css
/* 数值单元格 */
text-align: right;
font-weight: bold;
font-family: mono (可选);

/* 标签单元格 */
display: inline-flex;
padding: 2-4px 4-6px (移动) / 2-4px 6-8px (桌面);
border-radius: 4px;
font-size: 8-9px (移动) / 9-10px (桌面);
font-weight: bold;
```

---

## 标签与徽章

### 品质标签
```css
/* 星级标签 (素材) */
background: rgba(0, 0, 0, 0.4);
color: #fcd34d; /* yellow-400 */
border: 1px solid rgba(252, 211, 77, 0.3);
padding: 2-4px 6-8px (移动) / 2-4px 8-12px (桌面);
font-size: 10-12px (移动) / 12-14px (桌面);
font-weight: bold;
border-radius: 4px;

/* 品质标签 (装备) */
S级: #fbbf24 (amber-400) + text-shadow: 0 0 2px rgba(251,191,36,0.8);
A级: #f87171 (red-400);
B级: #60a5fa (blue-400);
C级: #34d399 (emerald-400);
D级: #cbd5e1 (slate-300);
E级: #64748b (slate-500);
```

### 状态标签
```css
/* 小型状态标签 */
padding: 2-4px 4-6px (移动) / 2-4px 6-8px (桌面);
font-size: 8-9px (移动) / 9-11px (桌面);
font-weight: bold;
border-radius: 4px;
text-transform: uppercase;

/* 类型标签示例 */
住宿: {
  background: indigo-100;
  color: indigo-800;
  border: 1px solid indigo-200;
}

酒场: {
  background: amber-100;
  color: amber-800;
  border: 1px solid amber-200;
}
```

---

## 滚动条样式

### 自定义滚动条
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6-8px;
  height: 6-8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #e8dfd1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #9b7a4c;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #b45309;
}
```

---

## 阴影系统

### 阴影层级
```css
/* 轻微阴影 - 卡片内元素 */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* 标准阴影 - 普通卡片 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* 悬浮阴影 - 悬停状态 */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

/* 强调阴影 - 模态框 */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);

/* 超强阴影 - 主模态框 */
box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);

/* 内阴影 - 凹陷效果 */
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
```

### 特殊阴影
```css
/* 发光效果 - 强调元素 */
box-shadow: 0 0 8px rgba(180, 83, 9, 0.5);

/* 文字阴影 - 增强可读性 */
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
```

---

## 动画效果

### 淡入动画
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
```

### 旋转加载
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### 脉冲效果
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### 弹跳效果
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
```

---

## 响应式设计

### 断点规范
```css
/* 移动端 */
default: < 768px

/* 平板/桌面 */
md: >= 768px

/* 大屏 */
lg: >= 1024px
```

### 移动端适配原则
- 字体缩小 1-2px
- 内边距减少 25-50%
- 按钮高度减少 4-8px
- 图标尺寸减少 2-4px
- 网格列数减少（4列→2列→1列）
- 横向滚动改为纵向堆叠
- 隐藏次要信息，保留核心功能

---

## 特殊效果

### 纸张撕裂边缘
```css
/* 不规则边缘效果 - 使用 clip-path 或 SVG mask */
clip-path: polygon(...);
```

### 墨水晕染效果
```css
/* 文字边缘模糊 - 模拟墨水渗透 */
filter: blur(0.5px);
opacity: 0.95;
```

### 羊皮纸卷曲
```css
/* 轻微旋转 - 增加手工感 */
transform: rotate(-1deg) / rotate(1deg);
```

### 网格图案背景
```css
/* SVG 网格图案 */
background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
opacity: 0.05-0.1;
```

---

## 可访问性

### 对比度要求
- 主文本与背景对比度 >= 4.5:1
- 大文本与背景对比度 >= 3:1
- 交互元素清晰可辨
- 禁用状态明显区分

### 焦点状态
```css
focus: {
  outline: none;
  ring: 2px solid cyan-500;
  border-color: cyan-500;
}
```

### 语义化标签
- 使用正确的 HTML 标签（button, input, label, table）
- 提供 aria-label 和 title 属性
- 支持键盘导航（Tab, Enter, Esc）
- 屏幕阅读器友好

---

## 设计原则总结

1. **材质真实感**：使用纸张、木材、皮革等自然材质的视觉语言
2. **色彩温暖**：以棕色、米色、琥珀色为主，营造温馨氛围
3. **细节装饰**：书脊、胶带、横线等细节增强沉浸感
4. **柔和过渡**：避免生硬的直角和高对比度
5. **手工感**：轻微旋转、不规则边缘等模拟手工制品
6. **功能优先**：装饰不影响可读性和可用性
7. **一致性**：所有沉浸式界面保持统一的视觉语言
8. **响应式**：移动端和桌面端保持风格一致，适当调整尺寸

---

**文档版本**：v1.0  
**最后更新**：2026-02-21 
**维护者**：Gemini