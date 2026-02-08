import { Character, ApiConfig } from "../types";

export interface AIResponse {
  text: string;
  emotion: string;
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

  constructor() {}

  async initChat(character: Character, systemPrompt: string, config: ApiConfig) {
    this.config = config;
    this.history = [];
    this.systemInstruction = systemPrompt;
  }

  async sendMessage(message: string): Promise<AIResponse> {
    if (!this.config || !this.config.apiKey) {
        throw new Error("API Config or API Key missing.");
    }
    
    if (!this.config.model) {
        throw new Error("Model not configured.");
    }

    // 1. 添加用户消息 (OpenAI 标准格式)
    this.history.push({
      role: 'user',
      content: message
    });

    let responseText = "{}";

    try {
      // 2. 统一构建请求，不区分厂商，全部走 OpenAI 兼容协议
      const requestPayload: any = {
          model: this.config.model,
          messages: [
              { 
                  role: 'system', 
                  content: this.systemInstruction + "\n\nIMPORTANT: Respond strictly in valid JSON format with keys 'text' and 'emotion'. Do not use Markdown code blocks." 
              },
              ...this.history
          ],
          temperature: 0.9
      };

      // 仅对原生 OpenAI 或 Google 等明确支持 json_object 的厂商启用 response_format
      // openai_compatible 可能是旧版 vLLM/Ollama/OneAPI 等，对 response_format 支持不统一，故默认禁用以提高兼容性
      // DeepSeek 文档支持 json_object 但为了最大兼容性，若非必要也可不加，或者视情况而定。
      // 这里为了修复用户遇到的 400 错误，排除了 openai_compatible。
      if (this.config.provider === 'openai' || this.config.provider === 'google') {
          requestPayload.response_format = { type: "json_object" };
      }

      // 获取标准化端点
      const { endpoint, headers } = this.getProviderDetails();

      const response = await fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error (${this.config.provider}): ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
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
      }

      // --- 核心过滤：移除思考内容 ---
      // 移除 <think>...</think>, <thinking>...</thinking>, **Thinking about...**
      if (jsonResponse.text) {
          jsonResponse.text = jsonResponse.text
              .replace(/<think>[\s\S]*?<\/think>/gi, '')
              .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
              .replace(/\*\*Thinking about your request\*\*/gi, '')
              .trim();
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