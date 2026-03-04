# 第四面墙（系统层）界面风格规范

## 概述
第四面墙界面风格用于跳脱角色扮演的系统功能界面（如读写存档、灵感面板、休息界面等）。采用高度现代化的暗色调高斯模糊设计，让用户明确感知这是系统级别的操作与交互。

设计核心理念：**深邃、科技、轻量、高辨识度**。

**适用界面：**
- 存档/读档 (`SaveLoadModal.tsx`)
- 灵感仪表盘 (`InspirationDashboardModal.tsx`)
- 系统休息/退出 (`RestModal.tsx`)
- 其他跳脱沉浸感的底层系统弹窗

---

## 色彩系统

### 全局遮罩
- **背景颜色**：`rgba(0, 0, 0, 0.82)`
- **毛玻璃滤镜**：`backdrop-filter: blur(8px)`

### 主容器材质
- **主背景**：`rgba(15, 23, 42, 0.93)` 至 `rgba(15, 23, 42, 0.95)` (深海蓝/深岩灰，近 `slate-900` ~ `slate-950`)
- **边框**：`1px solid rgba(148, 163, 184, 0.35)` 至 `0.2` (微弱的 `slate-400` 反光)
- **多重阴影**：`box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`
- **高斯模糊**：`backdrop-filter: blur(24px)`

### 强调色彩 (Highlight Colors)
系统中根据不同行为类型划分了高度统一的主题色：
- **青色 (Cyan)**：表示读取、灵感、信息展示。(`cyan-400` / `cyan-500` / `rgba(34,211,238,...)`)
- **琥珀色 (Amber)**：表示保存、休息、警告/覆写。(`amber-400` / `amber-500` / `rgba(245,158,11,...)`)
- **红色 (Red)**：表示删除、破坏性高危操作。(`red-400` / `red-500` / `rgba(239,68,68,...)`)
- **蓝色 (Blue)**：表示常规确认等中性操作。
- **翠绿色 (Emerald)**：表示成功、收益、自动存档提示。(`emerald-400` / `rgba(16,185,129,...)`)

### 分隔与装饰线条
- **弱分隔线**：`height: 1px; background: rgba(148,163,184,0.12)`
- **面板卡片底色**：`background: rgba(255,255,255,0.02)`，搭配 `border: 1px solid rgba(148,163,184,0.1)`

---

## 独特装饰元素

### 顶部/底部渐变光带
所有模态框的顶部和底部均包含标志性的中心发光细线，对应当前的强调色。
- **尺寸**：`width: 48px; height: 2px`
- **样式**：绝对居中对齐 (`left: 50%; transform: translateX(-50%)`)
- **渐变**：`linear-gradient(to right, transparent, rgba(主题色, 0.8), transparent)`

### 发光图标容器
用于标题旁或弹窗中心的核心视觉锚点。
- **尺寸**：`w-10 h-10` 或 `w-14 h-14` 或 `w-16 h-16`
- **形状**：`rounded-full` (圆形)
- **背景**：10% 透明度的主题色 (`rgba(..., 0.1)`)
- **边框**：25% 透明度的主题色 (`1px solid rgba(..., 0.25)`)
- **辉光** (可选大图标)：`box-shadow: 0 0 20px rgba(..., 0.15)`

---

## 字体与排版

### 字重与间距 (Weight & Tracking)
- **极大化字距**：大量运用 `tracking-widest` (标题、按钮) 和 `tracking-wider`。部分系统级标签使用 `tracking-[0.25em]`。
- **克制的字重**：摈弃粗体，主要使用 `font-light` (正文描述、数据) 和 `font-medium` (标题、按钮、强调文本)。

### 文本层级规范
- **模态框标题**：`text-xl font-medium text-slate-200 tracking-widest`
- **系统状态标签**：`text-xs tracking-[0.25em] uppercase font-medium color: rgba(148,163,184,0.6)`
- **卡片/列表标题**：`text-lg font-medium text-slate-200 tracking-wide truncate`
- **正文/说明文本**：`text-base` 或 `text-sm`, `font-light text-slate-200 / slate-300 leading-relaxed`
- **次要数据文本**：`text-sm font-light text-slate-400` (如金币、日期)

---

## 交互与组件样式

### 切换选项卡 (Tabs)
- **未激活**：`text-slate-500 hover:text-slate-300`, `opacity-50` (图标)
- **已激活**：主题色 (如 `text-cyan-400`), `opacity-100` (图标)
- **激活底栏指示器**：绝对定位，`h-[2px]`，主题色带阴影 (`box-shadow: 0 -2px 8px rgba(主题色, 0.5)`)

### 按钮组件 (Buttons)
摒弃了完全实心的色块按钮，转而采用带透明度的线框色块按钮。

**主操作按钮 (确认/覆盖/读取)：**
- **背景**：`bg-主题色/20` (如 `bg-blue-500/20`)
- **文本**：`text-主题色-400 font-medium text-sm tracking-widest`
- **边框**：`border border-主题色/30`
- **悬停**：`hover:bg-主题色/30`

**次操作按钮 (取消)：**
- **背景**：`bg-white/5`
- **文本**：`text-slate-300 font-medium text-sm tracking-widest`
- **边框**：`border border-slate-700/50`
- **悬停**：`hover:bg-white/10 hover:text-white`

**幽灵图标按钮 (关闭)：**
- **样式**：`w-10 h-10 rounded-full flex items-center justify-center text-slate-400`
- **悬停**：`hover:text-white hover:bg-white/5`

### 列表容器/卡片悬停交互
对于存档槽或记录项列表容器：
- **基础**：`p-5 rounded-xl border border-slate-400/10 bg-white/2`
- **可交互**：`cursor-pointer transition-all duration-300 group`
- **悬停状态**：`hover:bg-white/5 hover:shadow-lg`
- **禁用状态**：`opacity-40 cursor-not-allowed` / `pointer-events-none`

---

## 动画效果规范

系统弹窗需具备丝滑且轻量的登场与退场体验。

**进入动画（联动 React state `visible`）：**
- **遮罩层**：`transition-opacity duration-500`, 从 `opacity-0` 渐变至 `opacity-100`。
- **主窗体**：`transition-all duration-500`, 从 `translate-y-6 opacity-0` (上浮且淡入) 变更为 `translate-y-0 opacity-100`。
- **确认二次弹窗**：使用 `animate-fadeIn` (CSS 关键帧) 并附加 `backdrop-blur-md` 模糊背景。

---

## 总结

全新 v1.5 的系统界面风格大幅强化了“透明度”、“光晕”和“细线”的运用。通过不同色调的微弱发光（Amber、Cyan），为玩家创造一种身处星际战舰控制台或高端梦境潜入设备的现代科幻抽离感。一切以**暗、透、亮**为基调，搭配大间距与细体文字，确保高雅纯净的阅读体验。

---

**文档版本**：v1.5  
**最后更新**：2026-03-5  
**维护者**：Gemini