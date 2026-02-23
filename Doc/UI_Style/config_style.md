# 第四面墙界面风格规范

## 概述
第四面墙界面风格用于跳脱角色扮演的系统功能界面，采用暗色调现代化设计，让用户明确知道这不是游戏世界内的内容，而是游戏系统层面的功能。设计理念是科技感、专业性和清晰的信息层级。

**适用界面：**
- 系统设置 (`ConfigScreen.tsx`)
- 功能菜单 (`SystemMenu.tsx`)
- 登录与注册 (`TitleScreen.tsx` 中的 Login/Register Modal)

---

## 色彩系统

### 主色调
- **深色背景**：`slate-950` / `slate-900` - 接近黑的深灰蓝
- **次级背景**：`slate-800` - 中深灰
- **卡片背景**：`slate-900/90` - 半透明深灰（90%不透明度）
- **黑色背景**：`black/40` / `black/50` / `black/60` - 半透明黑色

### 强调色
- **主要强调**：`amber-500` / `amber-400` - 琥珀金色
- **次要强调**：`cyan-500` / `cyan-400` - 青色
- **成功色**：`emerald-500` / `emerald-600` - 翠绿色
- **警告色**：`yellow-500` / `yellow-600` - 黄色
- **错误色**：`red-400` / `red-500` - 红色

### 文本色彩
- **主文本**：`slate-100` / `white` - 浅灰白色
- **次要文本**：`slate-300` / `slate-400` - 中灰色
- **禁用文本**：`slate-500` / `slate-600` - 深灰色
- **标签文本**：`#f0e6d2` - 米白色（继承自沉浸式风格）

### 边框与分隔
- **主边框**：`slate-700` / `slate-700/50` - 中灰色边框
- **次边框**：`white/10` / `white/20` - 半透明白色
- **强调边框**：`cyan-500` / `amber-500` - 彩色强调

---

## 材质与效果

### 毛玻璃效果
```css
/* 标准毛玻璃 */
backdrop-filter: blur(4px) / blur(8px);
background: rgba(15, 23, 42, 0.9); /* slate-900/90 */

/* 强毛玻璃 */
backdrop-filter: blur(12px);
background: rgba(0, 0, 0, 0.7);
```

### 渐变效果
```css
/* 背景渐变 - 电影感叠加 */
background: linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1), rgba(0,0,0,0.6));
background: linear-gradient(to top, rgba(0,0,0,0.8), transparent, rgba(0,0,0,0.3));

/* 按钮渐变 */
background: linear-gradient(to top, cyan-900/40, transparent);
background: linear-gradient(to left, slate-950/90, slate-900/60, transparent);

/* 文字渐变 */
background: linear-gradient(to bottom right, white, slate-200, slate-400);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### 发光效果
```css
/* 强调发光 */
box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); /* amber */
box-shadow: 0 0 15px rgba(34, 211, 238, 0.3); /* cyan */

/* 文字发光 */
text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
drop-shadow: 0 5px 5px rgba(0, 0, 0, 0.8);
```

---

## 布局规范

### 容器结构
- **全屏遮罩**：`bg-slate-950/70` + `backdrop-blur-sm`
- **模态框容器**：`bg-slate-900/90` + `border border-slate-700/50` + `backdrop-blur-xl`
- **卡片容器**：`bg-slate-800/40` + `border border-slate-700/30`

### 边框样式
```css
/* 主要边框 */
border: 1px solid rgba(148, 163, 184, 0.5); /* slate-700/50 */
border-radius: 8-12px;

/* 次要边框 */
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 8px;

/* 强调边框 */
border: 2px solid cyan-500 / amber-500;
border-radius: 8-12px;
```

### 圆角规范
- **大容器**：`rounded-xl` (12px) / `rounded-2xl` (16px)
- **卡片/按钮**：`rounded-lg` (8px)
- **小元素**：`rounded` (4px)
- **圆形元素**：`rounded-full`

---

## 按钮样式

### 主要操作按钮
```css
/* 标准主按钮 */
background: amber-700;
color: white;
padding: 12px 24px;
font-weight: bold;
border-radius: 8px;
box-shadow: 0 4px 16px rgba(0,0,0,0.15);

hover: {
  background: amber-600;
}
```

### 次要操作按钮
```css
/* 标准次按钮 */
background: slate-800;
color: slate-300;
border: 1px solid slate-700;
padding: 8px 16px;
font-size: 14px;

hover: {
  background: slate-700;
  color: white;
}
```

### 圆形图标按钮
```css
/* 功能菜单按钮 */
width: 40px;
height: 40px;
background: rgba(0, 0, 0, 0.5);
color: rgba(255, 255, 255, 0.7);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 50%;
backdrop-filter: blur(12px);

hover: {
  color: white;
  background: rgba(0, 0, 0, 0.7);
}

/* Debug 按钮变体 */
background: rgba(0, 0, 0, 0.5);
color: rgba(234, 179, 8, 0.7); /* yellow-500/70 */
border: 1px solid rgba(234, 179, 8, 0.2);

hover: {
  color: rgb(250, 204, 21); /* yellow-400 */
}
```

### 大型菜单按钮
```css
/* 标题画面菜单按钮 */
width: 100%;
height: 80px;
background: linear-gradient(to left, slate-950/90, slate-900/60, transparent);
border-top: 1px solid rgba(255,255,255,0.05);
border-bottom: 1px solid rgba(255,255,255,0.05);
transform: skew-x-[-12deg] translate-x-4px;

hover: {
  width: 110%;
  border-color: cyan-400/50 (或其他颜色);
  box-shadow: 0 0 15px rgba(34,211,238,0.3);
}

/* 内容区域 */
padding: 0 48px 0 64px;
text-align: right;
```

---

## 文本样式

### 标题层级
```css
/* H1 - 主标题 */
font-size: 20-24px (移动) / 24-32px (桌面);
font-weight: bold;
color: amber-500;
letter-spacing: 0.1-0.2em;

/* H2 - 次级标题 */
font-size: 18-20px (移动) / 20-24px (桌面);
font-weight: bold;
color: white / #f0e6d2;
letter-spacing: 0.1em;

/* H3 - 小标题 */
font-size: 16-18px;
font-weight: bold;
color: slate-200;

/* H4 - 区块标题 */
font-size: 14-18px;
font-weight: medium / bold;
color: slate-200 / slate-300;
```

### 正文文本
```css
/* 主要正文 */
font-size: 14px;
color: slate-100 / slate-200;
line-height: 1.5;

/* 次要说明 */
font-size: 12-14px;
color: slate-400;
line-height: 1.4;

/* 小字注释 */
font-size: 10-12px;
color: slate-500 / slate-600;
text-transform: uppercase (可选);
letter-spacing: 0.1-0.15em;
```

### 特殊文本
```css
/* 大标题文字 - 渐变效果 */
font-size: 48-96px;
font-weight: 900 (black);
background: linear-gradient(to bottom right, white, slate-200, slate-400);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
letter-spacing: -0.05em;
filter: drop-shadow(0 5px 5px rgba(0,0,0,0.8));

/* 副标题 */
font-size: 16-24px;
color: amber-500;
letter-spacing: 0.2em;

/* 提示文字 - 呼吸动画 */
color: slate-300/80;
letter-spacing: 0.5em;
animation: breath 3s infinite ease-in-out;

@keyframes breath {
  0%, 100% { opacity: 0.3; transform: scale(0.98); }
  50% { opacity: 0.9; transform: scale(1.02); }
}
```

---

## 图标系统

### 图标库
使用 **Font Awesome Solid** 图标集

### 常用图标映射
```
系统功能：
- 设置：fa-gear
- 菜单：fa-bars
- 关闭：fa-xmark
- 保存：fa-floppy-disk
- 加载：fa-folder-open
- 主页：fa-house
- 调试：fa-bug
- 音乐：fa-music
- 连接：fa-plug
- 检查：fa-check, fa-circle-check
- 链接：fa-link
- 密钥：fa-key
- 用户：fa-user
- 测试：fa-vial
```

### 图标尺寸
```css
/* 大图标 */
font-size: 20-24px;

/* 中图标 */
font-size: 16-20px;

/* 小图标 */
font-size: 14-16px;

/* 微图标 */
font-size: 10-12px;
```

### 图标动画
```css
/* 旋转动画 - 音乐图标 */
@keyframes music-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
animation: music-rotate 4s linear infinite;

/* 脉冲动画 */
animation: pulse 2s ease-in-out infinite;
```

---

## 交互反馈

### 悬停效果
```css
/* 按钮悬停 */
transform: scale(1.02);
background: 颜色加深;
border-color: 强调色;
transition: all 0.2-0.3s;

/* 大型菜单按钮悬停 */
width: 110%;
border-color: cyan-400/50;
box-shadow: 0 0 15px rgba(34,211,238,0.3);
transition: all 0.3s ease-out;

/* 文字悬停 */
color: white / amber-400;
letter-spacing: 增加 0.1em;
transition: all 0.3s;
```

### 焦点状态
```css
/* 输入框焦点 */
outline: none;
border-color: cyan-500 / amber-500;
ring: 1px solid cyan-500;
transition: all 0.2s;
```

### 禁用状态
```css
/* 禁用按钮 */
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

### 加载状态
```css
/* 旋转加载器 */
width: 12-16px;
height: 12-16px;
border: 2px solid rgba(255,255,255,0.3);
border-top-color: white;
border-radius: 50%;
animation: spin 1s linear infinite;
```

---

## 表单元素

### 输入框
```css
/* 标准输入框 */
background: rgba(0, 0, 0, 0.4) / slate-950/50;
border: 1px solid slate-700 / slate-600;
color: slate-100;
padding: 10-12px 16px;
border-radius: 8px;
font-size: 14px;

placeholder: {
  color: slate-500 / slate-600;
}

focus: {
  outline: none;
  border-color: cyan-500 / amber-500;
  ring: 1px solid cyan-500;
}
```

### 下拉选择器
```css
/* 自定义下拉按钮 */
background: slate-950/50;
border: 1px solid slate-700;
color: slate-100;
padding: 12px 16px;
border-radius: 8px;
text-align: left;

/* 下拉列表 */
position: absolute;
background: slate-900;
border: 1px solid slate-700;
border-radius: 8px;
box-shadow: 0 10px 40px rgba(0,0,0,0.5);
max-height: 300px;
overflow-y: auto;

/* 下拉项 */
padding: 12px 16px;
hover: background: slate-800;
selected: {
  color: cyan-400;
  background: rgba(6, 182, 212, 0.1);
}
```

### 滑块
```css
/* Range Slider */
height: 8px;
background: slate-700;
border-radius: 9999px;
appearance: none;
cursor: pointer;
accent-color: cyan-500 / amber-500;
```

### 开关切换
```css
/* Toggle Switch */
width: 48px;
height: 24px;
background: slate-700 (off) / cyan-600 (on);
border-radius: 9999px;
transition: background 0.3s;

/* 滑块 */
width: 16px;
height: 16px;
background: white;
border-radius: 50%;
transform: translateX(0) (off) / translateX(24px) (on);
transition: transform 0.3s;
```

---

## 模态框与弹窗

### 遮罩层
```css
background: rgba(0, 0, 0, 0.7) / rgba(0, 0, 0, 0.8);
backdrop-filter: blur(4px) / blur(8px);
z-index: 100;
```

### 系统设置模态框
```css
/* 主容器 */
max-width: 1280px;
height: 90%;
background: rgba(15, 23, 42, 0.9); /* slate-900/90 */
border: 1px solid rgba(148, 163, 184, 0.5);
border-radius: 12px;
box-shadow: 0 25px 50px rgba(0,0,0,0.5);
backdrop-filter: blur(24px);

/* 侧边栏 */
width: 256px (桌面) / 100% (移动);
background: rgba(2, 6, 23, 0.5); /* slate-950/50 */
border-right: 1px solid rgba(148, 163, 184, 0.5);
```

### 登录注册模态框
```css
/* 容器 */
max-width: 448px;
background: rgba(15, 23, 42, 0.9);
border: 1px solid rgba(148, 163, 184, 0.5);
padding: 32px;
border-radius: 8px;
box-shadow: 0 25px 50px rgba(0,0,0,0.5);
backdrop-filter: blur(12px);
```

### 功能菜单弹出
```css
/* 网格容器 */
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 12px;
padding: 12px;
background: rgba(0, 0, 0, 0.2);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 16px;
backdrop-filter: blur(12px);
box-shadow: 0 25px 50px rgba(0,0,0,0.5);
```

---

## 标签页系统

### 标签按钮
```css
/* 未激活状态 */
padding: 12px 16px;
color: slate-400;
background: transparent;
border-bottom: 2px solid transparent (桌面);
border-left: 4px solid transparent (桌面侧边栏);

hover: {
  color: slate-200;
  background: rgba(255,255,255,0.05);
}

/* 激活状态 */
color: white / cyan-400;
background: linear-gradient(to top, rgba(6,182,212,0.4), transparent) (桌面);
background: linear-gradient(to right, rgba(6,182,212,0.4), transparent) (侧边栏);
border-bottom-color: cyan-500 (桌面);
border-left-color: cyan-500 (侧边栏);
box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
transform: scale(1.05);
```

---

## 状态指示器

### 连接状态点
```css
/* 容器 */
display: flex;
align-items: center;
gap: 8px;
padding: 8px 16px;
background: rgba(0,0,0,0.4);
border: 1px solid slate-800;
border-radius: 9999px;

/* 状态点 */
width: 10px;
height: 10px;
border-radius: 50%;

/* 已连接 */
background: emerald-500;
box-shadow: 0 0 8px rgba(16,185,129,0.8);

/* 连接中 */
background: yellow-500;
animation: pulse 1s ease-in-out infinite;

/* 断开 */
background: red-500;
```

---

## 装饰元素

### 分隔线
```css
/* 水平分隔线 */
height: 1px;
background: slate-800;
margin: 16px 0;

/* 渐变分隔线 */
height: 1px;
background: linear-gradient(to right, transparent, cyan-400, transparent);
opacity: 0.3-0.8;
```

### 装饰性线条
```css
/* 标题下划线 */
width: 48px;
height: 2px;
background: amber-500;
box-shadow: 0 0 10px rgba(245,158,11,0.8);
```

### 背景粒子效果
```css
/* Canvas 粒子动画 */
position: absolute;
inset: 0;
z-index: 15;
pointer-events: none;
opacity: 0.8;

/* 粒子属性 */
size: 0.5-2.5px;
color: rgba(251,191,36,0.1-0.8) / rgba(252,211,77,0.1-0.8) / rgba(255,255,255,0.1-0.8);
speed: 0.1-0.5px/frame;
shadow-blur: 4px;
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

### 呼吸动画
```css
@keyframes breath {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(0.98); 
  }
  50% { 
    opacity: 0.9; 
    transform: scale(1.02); 
  }
}

animation: breath 3s infinite ease-in-out;
```

### Ken Burns 效果（背景图片）
```css
@keyframes kenburns {
  0% { 
    transform: scale(1) translate(0, 0); 
    transform-origin: 50% 50%; 
  }
  50% { 
    transform: scale(1.08) translate(-1%, 1%); 
    transform-origin: 40% 60%; 
  }
  100% { 
    transform: scale(1.15) translate(1%, -1%); 
    transform-origin: 60% 40%; 
  }
}

animation: kenburns 25s ease-in-out infinite alternate;
```

### 旋转动画
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

animation: spin 1s linear infinite;
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

### 移动端适配
- 侧边栏改为顶部横向标签
- 字体缩小 1-2px
- 内边距减少 25-50%
- 按钮高度减少
- 网格列数减少
- 模态框宽度 100%，高度适应

---

## 特殊效果

### 斜切变形
```css
/* 菜单按钮斜切 */
transform: skew-x-[-12deg] translate-x-4px;
```

### 混合模式
```css
/* 电影感叠加 */
mix-blend-mode: multiply;
```

### 文字裁剪渐变
```css
/* 渐变文字 */
background: linear-gradient(to bottom right, white, slate-200, slate-400);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 可访问性

### 对比度要求
- 主文本与背景对比度 >= 4.5:1
- 大文本与背景对比度 >= 3:1
- 交互元素清晰可辨

### 焦点状态
```css
focus: {
  outline: none;
  ring: 1-2px solid cyan-500;
  border-color: cyan-500;
}
```

### 语义化标签
- 使用正确的 HTML 标签
- 提供 aria-label 和 title 属性
- 支持键盘导航（Tab, Enter, Esc）

---

## 设计原则总结

1. **暗色基调**：深色背景营造专业、沉稳的系统界面感
2. **科技感**：毛玻璃、发光效果、渐变等现代化视觉元素
3. **清晰层级**：通过颜色、大小、间距明确信息层级
4. **流畅动画**：过渡动画提升交互体验，但不过度
5. **高对比度**：确保文字和交互元素清晰可读
6. **一致性**：所有第四面墙界面保持统一的视觉语言
7. **功能优先**：美观不影响功能性和可用性
8. **响应式**：适配不同屏幕尺寸

---

**文档版本**：v1.0  
**最后更新**：2026-02-21 
**维护者**：Gemini