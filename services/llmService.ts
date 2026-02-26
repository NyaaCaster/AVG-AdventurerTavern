import { Character, ApiConfig, LogEntry } from "../types";

export interface AIResponse {
  text: string;
  emotion: string;
  clothing?: string;
  move_to?: string; // 瑙掕壊绉诲姩鎸囦护
  items?: { id: string; count: number }[];
  affinity_change?: number; // 濂芥劅搴﹀彉鍖?(-5 鍒?+5)
  unlock_request?: string; // 瑙掕壊瑙ｉ攣璇锋眰
  update_memory?: string[]; // AI 鎻愬彇鐨勬牳蹇冭蹇嗭紙闀挎湡璁板繂锛?  usage?: {
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
   * 鐢熸垚鏂欑悊鍚嶇О鍜屾弿杩?   */
  async generateFoodLore(ingredients: { name: string; description: string }[], cookingMethod: string, config: ApiConfig): Promise<{ name: string; description: string }> {
      this.config = { ...config };
      
      if (!this.config.apiKey) throw new Error("API Key missing");
      
      const ingredientsInfo = ingredients.map(i => `- ${i.name} (鐗规€? ${i.description})`).join('\n');

      const prompt = `
浣犳槸涓€浣嶅紓涓栫晫閰掗鐨勫垱鎰忎富鍘ㄣ€?璇锋牴鎹互涓嬬礌鏉愬垪琛ㄥ拰鐑归オ鏂规硶锛岃璁′竴閬撳厖婊″够鎯抽鏍肩殑鏂欑悊銆?璇峰姟蹇呯粨鍚堛€愮礌鏉愬悕绉般€戙€併€愮礌鏉愭弿杩般€戝拰銆愮児楗柟娉曘€戞潵鐞嗚В椋熸潗鐨勭壒鎬э紙濡傚彛鎰熴€佸懗閬撱€佹潵婧愮瓑锛夊拰鏂欑悊鐨勫仛娉曪紝纭繚鐢熸垚鐨勬枡鐞嗗悕绉板拰鎻忚堪绗﹀悎甯歌瘑涓庨€昏緫銆?渚嬪锛氬鏋滄槸鑲夌被绱犳潗涓旂児楗柟娉曟槸"鐑よ倝"锛屽簲鐢熸垚鐑よ倝绫绘枡鐞嗭紱濡傛灉鏄潰绮変笖鐑归オ鏂规硶鏄?铔嬬硶"锛屽簲鐢熸垚铔嬬硶绫荤敎鐐广€傚垏鍕垮嚭鐜扮礌鏉愩€佺児楗柟娉曚笌鏂欑悊绫诲瀷涓ラ噸鍐茬獊鐨勬儏鍐碉紙濡傚叏鏄倝绫讳笖鏂规硶鏄?鐐栬倝"鍗村仛鎴愭厱鏂級銆?
鐑归オ鏂规硶: ${cookingMethod}

绱犳潗鍒楄〃:
${ingredientsInfo}

璇蜂弗鏍间互 JSON 鏍煎紡杈撳嚭锛屽寘鍚互涓嬪瓧娈碉細
- name: 鏂欑悊鍚嶇О (涓枃锛屼笉瓒呰繃10涓瓧锛屽瘜鏈夎叮鍛虫€э紝蹇呴』浣撶幇绱犳潗鐗硅壊鍜岀児楗柟娉?
- description: 鏂欑悊鎻忚堪 (涓枃锛?0瀛椾互鍐咃紝鎻忚堪鍙ｆ劅鍜岀壒鑹诧紝闇€瑕佸弽鏄犲嚭绱犳潗鎻忚堪涓殑瑕佺礌鍜岀児楗柟娉?

绀轰緥:
{
  "name": "鐏劙鍙茶幈濮嗗喕",
  "description": "铏界劧澶栬〃绾㈤€氶€氱殑锛屽叆鍙ｅ嵈鏄啺鍑夌殑鏋滃喕鍙ｆ劅锛岄殢鍚庡湪鍠夊挋娣卞鐖嗗彂鍑轰竴鑲℃殩鎰忥紝闈炲父绁炲銆?
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
                  name: "鏈煡鏂欑悊",
                  description: content.substring(0, 50).replace(/\n/g, ' ') || "鐪嬭捣鏉ュ彲浠ュ悆銆?
              };
          }
          
          return {
              name: json.name || "鏈煡鏂欑悊",
              description: json.description || "鐪嬭捣鏉ュ彲浠ュ悆銆?
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

