
import { Character, ApiConfig, LogEntry } from "../types";

export interface AIResponse {
  text: string;
  emotion: string;
  clothing?: string; // 新增：支持 AI 返回衣着状态变更建议
  items?: { id: string; count: number }[]; // 新增：支持 AI 返回获得的道具
  usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
  };
}

// 统一使用 OpenAI 标准格式
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class LlmService {
  private history: ChatMessage[] = [];
  private systemInstruction: string = "";
  private config: ApiConfig | null = null;
  
  // 日志相关
  private logs: LogEntry[] = [];
  private logSubscribers: ((logs: LogEntry[]) => void)[] = [];

  constructor() {}

  async initChat(character: Character, systemPrompt: string, config: ApiConfig) {
    this.config = config;
    this.history = [];
    this.systemInstruction = systemPrompt;
    
    // 创建用于日志的配置副本，隐藏敏感信息
    const safeConfig = { ...config };
    if (safeConfig.apiKey) {
        // 保留前缀 sk- (如果存在)，隐藏后续部分
        safeConfig.apiKey = safeConfig.apiKey.startsWith('sk-') 
            ? 'sk-********************' 
            : '********************';
    }

    this.addLog('info', { message: `Initialized chat for ${character.name}`, config: safeConfig });
  }

  // 订阅日志更新
  public subscribeLogs(callback: (logs: LogEntry[]) => void) {
    this.logSubscribers.push(callback);
    callback(this.logs);
    return () => {
      this.logSubscribers = this.logSubscribers.filter(cb => cb !== callback);
    };
  }

  private addLog(type: LogEntry['type'], content: any) {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      content
    };
    // 保留最近 100 条日志
    this.logs = [entry, ...this.logs].slice(0, 100);
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.logSubscribers.forEach(cb => cb(this.logs));
  }

  async sendMessage(message: string): Promise<AIResponse> {
    if (!this.config || !this.config.apiKey) {
        const err = new Error("API Config or API Key missing.");
        this.addLog('error', { message: err.message });
        throw err;
    }
    
    if (!this.config.model) {
        const err = new Error("Model not configured.");
        this.addLog('error', { message: err.message });
        throw err;
    }

    // 1. 添加用户消息 (OpenAI 标准格式)
    this.history.push({
      role: 'user',
      content: message
    });

    let responseText = "{}";

    try {
      // 2. 统一构建请求，不区分厂商，全部走 OpenAI 兼容协议
      // 更新 System Prompt 后缀，明确 JSON 结构包含 clothing 字段
      const requestPayload: any = {
          model: this.config.model,
          messages: [
              { 
                  role: 'system', 
                  content: this.systemInstruction + "\n\nIMPORTANT: Respond strictly in valid JSON format with keys 'text', 'emotion', 'clothing' (optional, 'default'|'nude'|'bondage'), and 'gain_items' (optional, list of {id, count}). Do not use Markdown code blocks." 
              },
              ...this.history
          ],
          temperature: 0.9
      };

      // 仅对原生 OpenAI 或 Google 等明确支持 json_object 的厂商启用 response_format
      if (this.config.provider === 'openai' || this.config.provider === 'google') {
          requestPayload.response_format = { type: "json_object" };
      }

      this.addLog('request', requestPayload);

      // 获取标准化端点
      const { endpoint, headers } = this.getProviderDetails();

      const response = await fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
          const errorText = await response.text();
          const errorMsg = `API Error (${this.config.provider}): ${response.status} - ${errorText}`;
          this.addLog('error', { status: response.status, body: errorText });
          throw new Error(errorMsg);
      }

      const data = await response.json();
      this.addLog('response', data);
      
      // 统一解析 OpenAI 格式响应
      responseText = data.choices?.[0]?.message?.content || "{}";

      // --- JSON 解析与容错 ---
      let jsonResponse: AIResponse;
      try {
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        
        let jsonStr = cleanText;
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = cleanText.substring(firstBrace, lastBrace + 1);
        }

        jsonResponse = JSON.parse(jsonStr) as AIResponse;
        
        if (!jsonResponse.text) jsonResponse.text = cleanText;
        if (!jsonResponse.emotion) jsonResponse.emotion = "normal";
      } catch (parseError) {
        console.warn("Failed to parse JSON response:", responseText);
        jsonResponse = { text: responseText, emotion: "normal" };
        this.addLog('info', { message: "JSON Parse failed, using raw text", raw: responseText });
      }

      // --- 核心过滤：移除思考内容 ---
      if (jsonResponse.text) {
          jsonResponse.text = jsonResponse.text
              .replace(/<think>[\s\S]*?<\/think>/gi, '')
              .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
              .replace(/\*\*Thinking about your request\*\*/gi, '')
              .trim();
      }

      // --- 道具获取解析逻辑 ---
      // 检查 JSON 中是否直接包含 gain_items
      const rawItems = (jsonResponse as any).gain_items;
      if (Array.isArray(rawItems)) {
          jsonResponse.items = rawItems;
      } else {
          jsonResponse.items = [];
      }

      // 附加 Usage 信息
      if (data.usage) {
          jsonResponse.usage = {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens
          };
      }

      // 3. 添加助手消息 (OpenAI 标准格式)
      // 注意：这里保存的是清理后的文本，以防止历史记录污染
      this.history.push({
        role: 'assistant',
        content: JSON.stringify(jsonResponse) // 保存完整的 JSON 结构以便下一次上下文可能需要
      });

      return jsonResponse;

    } catch (error) {
      console.error("LLM Service Error:", error);
      this.history.pop();
      this.addLog('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // 重新生成上一条消息
  async redoLastMessage(): Promise<AIResponse | null> {
    if (!this.config || !this.config.apiKey) {
         throw new Error("API Config or API Key missing.");
    }
    
    if (this.history.length === 0) return null;

    const lastMsg = this.history[this.history.length - 1];
    
    // 如果最后一条是助手回复，说明要重新生成这一轮
    if (lastMsg.role === 'assistant') {
        this.history.pop(); // 移除助手回复
        
        // 获取上一条用户消息
        if (this.history.length > 0 && this.history[this.history.length - 1].role === 'user') {
            const userMsg = this.history.pop(); // 移除用户消息以便重新发送
            if (userMsg) {
                return this.sendMessage(userMsg.content);
            }
        }
    } 
    // 如果最后一条是用户（例如只有用户消息没有助手回复的情况）
    else if (lastMsg.role === 'user') {
         const userMsg = this.history.pop();
         if (userMsg) {
             return this.sendMessage(userMsg.content);
         }
    }
    
    return null;
  }

  // 获取不同供应商的 OpenAI 兼容端点
  private getProviderDetails(): { endpoint: string, headers: Record<string, string> } {
      if (!this.config) throw new Error("Config missing");
      
      const apiKey = this.config.apiKey;
      let baseUrl = this.config.baseUrl;
      let endpoint = "";

      switch (this.config.provider) {
          case 'google':
              // 使用 Google 的 OpenAI 兼容端点，从而复用统一逻辑
              endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
              break;
          case 'openai':
              endpoint = 'https://api.openai.com/v1/chat/completions';
              break;
          case 'deepseek':
              endpoint = 'https://api.deepseek.com/chat/completions';
              break;
          case 'openai_compatible':
          default:
              baseUrl = (baseUrl || '').replace(/\/$/, '');
              endpoint = `${baseUrl}/chat/completions`;
              break;
      }

      return {
          endpoint,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          }
      };
  }
}

export const llmService = new LlmService();
