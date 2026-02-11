
import { Character, ApiConfig, LogEntry } from "../types";

export interface AIResponse {
  text: string;
  emotion: string;
  clothing?: string;
  items?: { id: string; count: number }[];
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
  
  private logs: LogEntry[] = [];
  private logSubscribers: ((logs: LogEntry[]) => void)[] = [];

  constructor() {}

  async initChat(character: Character, systemPrompt: string, config: ApiConfig) {
    this.config = { ...config }; // Create a copy
    
    // Auto-inject env key if missing in config
    if (!this.config.apiKey) {
        try {
            if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
                this.config.apiKey = process.env.API_KEY;
                // If model is also missing and we are using env key, default to Gemini
                if (!this.config.model) {
                    this.config.model = 'gemini-3-flash-preview';
                    this.config.provider = 'google';
                }
            }
        } catch(e) { /* ignore */ }
    }

    this.history = [];
    this.systemInstruction = systemPrompt;
    
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

  async sendMessage(message: string): Promise<AIResponse> {
    if (!this.config || !this.config.apiKey) {
        // Double check env var just in case initChat wasn't called with it or config was reset
        try {
             if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
                 if (!this.config) {
                     this.config = {
                         provider: 'google',
                         baseUrl: '',
                         apiKey: process.env.API_KEY,
                         model: 'gemini-3-flash-preview',
                         autoConnect: true
                     };
                 } else {
                     this.config.apiKey = process.env.API_KEY;
                 }
             }
        } catch(e) { /* ignore */ }
    }

    if (!this.config || !this.config.apiKey) {
        const err = new Error("API Config or API Key missing.");
        this.addLog('error', { message: err.message });
        throw err;
    }
    
    if (!this.config.model) {
        // Fallback model if missing
        this.config.model = 'gemini-3-flash-preview';
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
                  content: this.systemInstruction + "\n\nIMPORTANT: Respond strictly in valid JSON format with keys 'text', 'emotion', 'clothing' (optional, 'default'|'nude'|'bondage'), and 'gain_items' (optional, list of {id, count}). Do not use Markdown code blocks." 
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
