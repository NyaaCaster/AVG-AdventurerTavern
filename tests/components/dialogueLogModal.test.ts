import { describe, it, expect } from 'vitest';

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatLogContent = (content: string): string => {
  if (!content) return "";
  let html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/(\([^\)]*?\)|（[^\）]*?）)/g, '<span class="italic text-amber-500 font-medium">$1</span>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br/>');

  return html;
};

describe('DialogueLogModal - formatTime 时间格式化', () => {
  describe('正常时间戳', () => {
    it('应该正确格式化标准时间戳', () => {
      const timestamp = new Date(2024, 0, 15, 10, 30, 45).getTime();
      const result = formatTime(timestamp);
      
      expect(result).toBe('2024-01-15 10:30:45');
    });

    it('应该正确格式化午夜时间', () => {
      const timestamp = new Date(2024, 5, 1, 0, 0, 0).getTime();
      const result = formatTime(timestamp);
      
      expect(result).toBe('2024-06-01 00:00:00');
    });

    it('应该正确格式化午夜前时间', () => {
      const timestamp = new Date(2024, 11, 31, 23, 59, 59).getTime();
      const result = formatTime(timestamp);
      
      expect(result).toBe('2024-12-31 23:59:59');
    });
  });

  describe('边界值测试', () => {
    it('应该正确处理个位数月份（补零）', () => {
      const timestamp = new Date(2024, 0, 5, 8, 5, 3).getTime();
      const result = formatTime(timestamp);
      
      expect(result).toContain('2024-01-05');
      expect(result).toContain('08:05:03');
    });

    it('应该正确处理两位数月份', () => {
      const timestamp = new Date(2024, 11, 15, 12, 30, 45).getTime();
      const result = formatTime(timestamp);
      
      expect(result).toContain('2024-12-15');
    });

    it('应该正确处理Unix纪元时间', () => {
      const timestamp = 0;
      const result = formatTime(timestamp);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('格式验证', () => {
    it('返回格式应为 YYYY-MM-DD HH:MM:SS', () => {
      const timestamp = Date.now();
      const result = formatTime(timestamp);
      const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      
      expect(result).toMatch(pattern);
    });

    it('月份应该补零到两位', () => {
      const timestamp = new Date(2024, 0, 1).getTime();
      const result = formatTime(timestamp);
      
      expect(result.substring(5, 7)).toBe('01');
    });

    it('日期应该补零到两位', () => {
      const timestamp = new Date(2024, 0, 1).getTime();
      const result = formatTime(timestamp);
      
      expect(result.substring(8, 10)).toBe('01');
    });

    it('小时应该补零到两位', () => {
      const timestamp = new Date(2024, 0, 1, 5, 0, 0).getTime();
      const result = formatTime(timestamp);
      
      expect(result.substring(11, 13)).toBe('05');
    });

    it('分钟应该补零到两位', () => {
      const timestamp = new Date(2024, 0, 1, 0, 5, 0).getTime();
      const result = formatTime(timestamp);
      
      expect(result.substring(14, 16)).toBe('05');
    });

    it('秒应该补零到两位', () => {
      const timestamp = new Date(2024, 0, 1, 0, 0, 5).getTime();
      const result = formatTime(timestamp);
      
      expect(result.substring(17, 19)).toBe('05');
    });
  });
});

describe('DialogueLogModal - formatLogContent 内容格式化', () => {
  describe('HTML转义', () => {
    it('应该转义 & 符号', () => {
      const result = formatLogContent('Tom & Jerry');
      
      expect(result).toBe('Tom &amp; Jerry');
    });

    it('应该转义 < 符号', () => {
      const result = formatLogContent('a < b');
      
      expect(result).toBe('a &lt; b');
    });

    it('应该转义 > 符号', () => {
      const result = formatLogContent('a > b');
      
      expect(result).toBe('a &gt; b');
    });

    it('应该同时转义多个特殊字符', () => {
      const result = formatLogContent('<script>alert("xss")</script>');
      
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;/script&gt;');
    });

    it('应该转义HTML标签防止XSS', () => {
      const result = formatLogContent('<img src=x onerror=alert(1)>');
      
      expect(result).toContain('&lt;img');
      expect(result).toContain('&gt;');
      expect(result).not.toContain('<img');
    });
  });

  describe('Markdown粗体', () => {
    it('应该将 **文本** 转换为 <strong>标签', () => {
      const result = formatLogContent('这是**重要**的内容');
      
      expect(result).toBe('这是<strong>重要</strong>的内容');
    });

    it('应该处理多个粗体', () => {
      const result = formatLogContent('**第一**和**第二**');
      
      expect(result).toBe('<strong>第一</strong>和<strong>第二</strong>');
    });

    it('不成对的**会被处理为空斜体', () => {
      const result = formatLogContent('这是**不成对的内容');
      
      expect(result).toContain('<em></em>');
    });
  });

  describe('Markdown斜体', () => {
    it('应该将 *文本* 转换为 <em>标签', () => {
      const result = formatLogContent('这是*强调*的内容');
      
      expect(result).toBe('这是<em>强调</em>的内容');
    });

    it('应该处理多个斜体', () => {
      const result = formatLogContent('*第一*和*第二*');
      
      expect(result).toBe('<em>第一</em>和<em>第二</em>');
    });
  });

  describe('括号样式化', () => {
    it('应该为半角括号内容添加样式', () => {
      const result = formatLogContent('这是(备注)内容');
      
      expect(result).toContain('<span class="italic text-amber-500 font-medium">(备注)</span>');
    });

    it('应该为全角括号内容添加样式', () => {
      const result = formatLogContent('这是（备注）内容');
      
      expect(result).toContain('<span class="italic text-amber-500 font-medium">（备注）</span>');
    });

    it('应该处理多个括号', () => {
      const result = formatLogContent('(第一)和（第二）');
      
      expect(result).toContain('(第一)');
      expect(result).toContain('（第二）');
      expect(result).toContain('text-amber-500');
    });
  });

  describe('换行处理', () => {
    it('应该将 \\n 转换为 <br/>', () => {
      const result = formatLogContent('第一行\n第二行');
      
      expect(result).toBe('第一行<br/>第二行');
    });

    it('应该处理多个换行', () => {
      const result = formatLogContent('第一行\n\n第二行');
      
      expect(result).toBe('第一行<br/><br/>第二行');
    });
  });

  describe('组合格式化', () => {
    it('应该同时处理粗体和斜体', () => {
      const result = formatLogContent('**粗体**和*斜体*');
      
      expect(result).toBe('<strong>粗体</strong>和<em>斜体</em>');
    });

    it('应该同时处理转义和Markdown', () => {
      const result = formatLogContent('**重要**: a < b & c > d');
      
      expect(result).toContain('<strong>重要</strong>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });

    it('应该同时处理括号和换行', () => {
      const result = formatLogContent('第一行(备注)\n第二行');
      
      expect(result).toContain('<span class="italic text-amber-500 font-medium">(备注)</span>');
      expect(result).toContain('<br/>');
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      const result = formatLogContent('');
      
      expect(result).toBe('');
    });

    it('应该处理纯文本（无特殊格式）', () => {
      const result = formatLogContent('这是普通文本');
      
      expect(result).toBe('这是普通文本');
    });

    it('应该处理只有空格的字符串', () => {
      const result = formatLogContent('   ');
      
      expect(result).toBe('   ');
    });

    it('应该处理包含特殊字符的复杂内容', () => {
      const result = formatLogContent('**标题**\n- 项目1 & 项目2\n- (说明)');
      
      expect(result).toContain('<strong>标题</strong>');
      expect(result).toContain('<br/>');
      expect(result).toContain('&amp;');
      expect(result).toContain('text-amber-500');
    });
  });

  describe('数据保护', () => {
    it('原始内容中的HTML标签不应被解析', () => {
      const maliciousInput = '<div onclick="alert(1)">点击</div>';
      const result = formatLogContent(maliciousInput);
      
      expect(result).not.toContain('<div');
      expect(result).toContain('&lt;div');
    });

    it('用户输入的脚本不应被执行', () => {
      const maliciousInput = '<script>document.cookie</script>';
      const result = formatLogContent(maliciousInput);
      
      expect(result).not.toContain('<script');
      expect(result).toContain('&lt;script');
    });
  });
});

describe('DialogueLogModal - 历史记录显示逻辑', () => {
  interface DialogueEntry {
    type: 'user' | 'npc';
    speaker: string;
    text: string;
    timestamp: number;
    avatarUrl?: string;
    tokens?: number;
  }

  const createMockHistory = (entries: Partial<DialogueEntry>[]): DialogueEntry[] => {
    return entries.map((entry, index) => ({
      type: entry.type || 'npc',
      speaker: entry.speaker || `角色${index}`,
      text: entry.text || '测试文本',
      timestamp: entry.timestamp || Date.now(),
      avatarUrl: entry.avatarUrl,
      tokens: entry.tokens,
    }));
  };

  describe('历史记录结构', () => {
    it('应该正确创建用户消息', () => {
      const history = createMockHistory([{ type: 'user', speaker: '玩家' }]);
      
      expect(history[0].type).toBe('user');
      expect(history[0].speaker).toBe('玩家');
    });

    it('应该正确创建NPC消息', () => {
      const history = createMockHistory([{ type: 'npc', speaker: 'NPC' }]);
      
      expect(history[0].type).toBe('npc');
      expect(history[0].speaker).toBe('NPC');
    });

    it('应该正确处理可选字段', () => {
      const history = createMockHistory([{
        type: 'user',
        speaker: '玩家',
        text: '测试',
        tokens: 100,
        avatarUrl: 'img/face/1.png',
      }]);
      
      expect(history[0].tokens).toBe(100);
      expect(history[0].avatarUrl).toBe('img/face/1.png');
    });
  });

  describe('消息类型判断', () => {
    it('用户消息应该有正确的类型标识', () => {
      const history = createMockHistory([{ type: 'user' }]);
      
      expect(history[0].type).toBe('user');
    });

    it('NPC消息应该有正确的类型标识', () => {
      const history = createMockHistory([{ type: 'npc' }]);
      
      expect(history[0].type).toBe('npc');
    });
  });

  describe('Token显示逻辑', () => {
    it('有tokens字段时应该显示', () => {
      const history = createMockHistory([{ tokens: 150 }]);
      
      expect(history[0].tokens).toBeDefined();
      expect(history[0].tokens).toBe(150);
    });

    it('没有tokens字段时应该为undefined', () => {
      const history = createMockHistory([{}]);
      
      expect(history[0].tokens).toBeUndefined();
    });
  });

  describe('空历史记录处理', () => {
    it('应该正确处理空数组', () => {
      const history: DialogueEntry[] = [];
      
      expect(history.length).toBe(0);
    });
  });
});
