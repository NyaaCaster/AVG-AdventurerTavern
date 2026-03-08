
import { Character, ApiConfig, LogEntry } from "../types";

export interface AIResponse {
  text: string;
  emotion: string;
  clothing?: string;
  move_to?: import('../types').SceneId; // 角色移动指令
  items?: { id: string; count: number }[];
  affinity_change?: number; // 好感度变化 (-5 到 +5)
  unlock_request?: string; // 角色解锁请求
  learned_skill?: boolean; // 玩家习得技能（存在即触发，系统自动识别当前对话角色）
  update_memory?: string[]; // AI 提取的核心记忆（长期记忆）
  usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class LlmService {
  private history: ChatMessage[] = [];
  private systemInstruction: string = "";
  private config: ApiConfig | null = null;
  private currentCharacterId: string | null = null; // 当前持有对话的角色ID
  
  private logs: LogEntry[] = [];
  private logSubscribers: ((logs: LogEntry[]) => void)[] = [];

  constructor() {}

  async initChat(character: Character, systemPrompt: string, config: ApiConfig) {
    this.config = { ...config }; // Create a copy
    this.history = [];
    this.systemInstruction = systemPrompt;
    this.currentCharacterId = character.id;
    
    const safeConfig = { ...this.config };
    if (safeConfig.apiKey) {
        safeConfig.apiKey = safeConfig.apiKey.startsWith('sk-') 
            ? 'sk-********************' 
            : '********************';
    }

    this.addLog('info', { message: `Initialized chat for ${character.name}`, config: safeConfig });
  }

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
    this.logs = [entry, ...this.logs].slice(0, 100);
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.logSubscribers.forEach(cb => cb(this.logs));
  }

  getCurrentCharacterId(): string | null {
    return this.currentCharacterId;
  }

  reset() {
    this.history = [];
    this.systemInstruction = '';
    this.currentCharacterId = null;
  }

  async sendMessage(message: string): Promise<AIResponse> {
    if (!this.config || !this.config.apiKey) {
        const err = new Error("API Config or API Key missing.");
        this.addLog('error', { message: err.message });
        throw err;
    }
    
    this.history.push({
      role: 'user',
      content: message
    });

    let responseText = "{}";

    try {
      const requestPayload: any = {
          model: this.config.model,
          messages: [
              { 
                  role: 'system', 
                  content: this.systemInstruction + "\n\nIMPORTANT: Respond strictly in valid JSON format with keys 'text', 'emotion', 'clothing' (optional, 'default'|'nude'|'bondage'), 'move_to' (optional, scene_id), and 'gain_items' (optional, list of {id, count}). Do not use Markdown code blocks." 
              },
              ...this.history
          ],
          temperature: 0.9
      };

      if (this.config.provider === 'openai' || this.config.provider === 'google') {
          requestPayload.response_format = { type: "json_object" };
      }

      this.addLog('request', requestPayload);

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
      
      responseText = data.choices?.[0]?.message?.content || "{}";

      let jsonResponse: AIResponse;
      try {
        const cleanText = responseText.replace(/`{3}json/g, '').replace(/`{3}/g, '').trim();
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

      if (jsonResponse.text) {
          jsonResponse.text = jsonResponse.text
              .replace(/<think>[\s\S]*?<\/think>/gi, '')
              .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
              .replace(/\*\*Thinking about your request\*\*/gi, '')
              .trim();
      }

      const rawItems = (jsonResponse as any).gain_items;
      if (Array.isArray(rawItems)) {
          jsonResponse.items = rawItems;
      } else {
          jsonResponse.items = [];
      }

      if (data.usage) {
          jsonResponse.usage = {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens
          };
      }

      this.history.push({
        role: 'assistant',
        content: JSON.stringify(jsonResponse)
      });

      return jsonResponse;

    } catch (error) {
      console.error("LLM Service Error:", error);
      this.history.pop();
      this.addLog('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async redoLastMessage(): Promise<AIResponse | null> {
    if (!this.config || !this.config.apiKey) {
         throw new Error("API Config or API Key missing.");
    }
    
    if (this.history.length === 0) return null;

    const lastMsg = this.history[this.history.length - 1];
    
    if (lastMsg.role === 'assistant') {
        this.history.pop();
        
        if (this.history.length > 0 && this.history[this.history.length - 1].role === 'user') {
            const userMsg = this.history.pop();
            if (userMsg) {
                return this.sendMessage(userMsg.content);
            }
        }
    } 
    else if (lastMsg.role === 'user') {
         const userMsg = this.history.pop();
         if (userMsg) {
             return this.sendMessage(userMsg.content);
         }
    }
    
    return null;
  }

  /**
   * 生成料理名称和描述
   */
  async generateFoodLore(ingredients: { name: string; description: string }[], cookingMethod: string, config: ApiConfig): Promise<{ name: string; description: string }> {
      this.config = { ...config };
      
      if (!this.config.apiKey) throw new Error("API Key missing");
      
      const ingredientsInfo = ingredients.map(i => `- ${i.name} (特性: ${i.description})`).join('\n');

      const prompt = `
你是一位异世界酒馆的创意主厨。
请根据以下素材列表和烹饪方法，设计一道充满幻想风格的料理。
请务必结合【素材名称】、【素材描述】和【烹饪方法】来理解食材的特性（如口感、味道、来源等）和料理的做法，确保生成的料理名称和描述符合常识与逻辑。
例如：如果是肉类素材且烹饪方法是"烤肉"，应生成烤肉类料理；如果是面粉且烹饪方法是"蛋糕"，应生成蛋糕类甜点。切勿出现素材、烹饪方法与料理类型严重冲突的情况（如全是肉类且方法是"炖肉"却做成慕斯）。

烹饪方法: ${cookingMethod}

素材列表:
${ingredientsInfo}

请严格以 JSON 格式输出，包含以下字段：
- name: 料理名称 (中文，不超过10个字，富有趣味性，必须体现素材特色和烹饪方法)
- description: 料理描述 (中文，50字以内，描述口感和特色，需要反映出素材描述中的要素和烹饪方法)

示例:
{
  "name": "火焰史莱姆冻",
  "description": "虽然外表红通通的，入口却是冰凉的果冻口感，随后在喉咙深处爆发出一股暖意，非常神奇。"
}
`;

      const performRequest = async (useJsonMode: boolean) => {
          const { endpoint, headers } = this.getProviderDetails();
          const requestPayload: any = {
              model: this.config!.model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 1.0, // Creativity
          };

          if (useJsonMode) {
              requestPayload.response_format = { type: "json_object" };
          }

          this.addLog('request', { type: 'food_gen', payload: requestPayload, useJsonMode });

          const response = await fetch(endpoint, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(requestPayload)
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`${response.status} - ${errorText}`);
          }
          return await response.json();
      };

      try {
          let data;
          
          // Only force JSON mode for providers that reliably support it to avoid 400 Bad Request
          // Google and OpenAI usually support it. Others might strictly reject it.
          const defaultUseJson = ['google', 'openai', 'deepseek'].includes(this.config.provider);

          try {
              data = await performRequest(defaultUseJson);
          } catch (e: any) {
              // Retry without JSON mode if we got a 400 error (likely unsupported parameter)
              if (String(e).includes('400')) {
                  console.warn("Food Gen got 400, retrying without response_format...");
                  data = await performRequest(false);
              } else {
                  throw e;
              }
          }

          this.addLog('response', { type: 'food_gen', data });

          const content = data.choices?.[0]?.message?.content || "{}";
          // Sanitize and parse
          const jsonStr = content.replace(/`{3}json/g, '').replace(/`{3}/g, '').trim();
          
          let json;
          try {
              // Try to find the JSON object
              const start = jsonStr.indexOf('{');
              const end = jsonStr.lastIndexOf('}');
              if (start !== -1 && end !== -1) {
                  json = JSON.parse(jsonStr.substring(start, end + 1));
              } else {
                  json = JSON.parse(jsonStr);
              }
          } catch (pError) {
              console.warn("JSON parse failed, falling back to raw text", jsonStr);
              // Fallback: Try to heuristically extract info if JSON fails
              return {
                  name: "未知料理",
                  description: content.substring(0, 50).replace(/\n/g, ' ') || "看起来可以吃。"
              };
          }
          
          return {
              name: json.name || "未知料理",
              description: json.description || "看起来可以吃。"
          };

      } catch (e) {
          console.error("Food Gen Error", e);
          this.addLog('error', { message: "Food Gen Failed", error: String(e) });
          throw e;
      }
  }

  private getProviderDetails(): { endpoint: string, headers: Record<string, string> } {
      if (!this.config) throw new Error("Config missing");
      
      const apiKey = this.config.apiKey;
      let baseUrl = this.config.baseUrl;
      let endpoint = "";

      switch (this.config.provider) {
          case 'google':
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
