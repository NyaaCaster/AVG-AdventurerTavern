mport { useState, useCallback, useRef } from 'react';
import { 
    getChatMessages, 
    addChatMessage, 
    getCharacterMemories, 
    addCharacterMemories,
    updateCharacterSummary,
    deleteOldMessages
} from '../services/db';
import { llmService } from '../services/llmService';
import { ApiConfig } from '../types';

interface ChatMessage {
    role: string;
    content: string;
    created_at: number;
}

interface CharacterMemory {
    memory_type: string;
    content: string;
    created_at: number;
}

interface UseAIMemoryProps {
    userId: number;
    slotId: number;
    apiConfig?: ApiConfig; // 鐢ㄤ簬鐢熸垚鎽樿
}

// 閰嶇疆甯搁噺
const MAX_WORKING_MEMORY = 30;  // 宸ヤ綔璁板繂涓婇檺
const SUMMARIZE_BATCH = 20;      // 姣忔鎬荤粨鐨勫璇濇暟閲?const SUMMARY_MAX_LENGTH = 150;  // 鎽樿鏈€澶у瓧鏁?
/**
 * AI 璁板繂绯荤粺 Hook
 * 绠＄悊瑙掕壊鐨勭煭鏈熷璇濊蹇嗗拰闀挎湡鏍稿績璁板繂
 */
export const useAIMemory = ({ userId, slotId, apiConfig }: UseAIMemoryProps) => {
    const [isLoadingMemory, setIsLoadingMemory] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    
    // 鏈湴缂撳瓨锛屽噺灏戦噸澶嶆煡璇?    const memoryCache = useRef<{
        [key: string]: {
            data: any;
            timestamp: number;
        }
    }>({});
    
    // 缂撳瓨鏈夋晥鏈燂紙姣锛?    const CACHE_TTL = 30000; // 30绉?
    /**
     * 缂撳瓨绠＄悊宸ュ叿鍑芥暟
     */
    const cacheManager = {
        /**
         * 鐢熸垚缂撳瓨閿?         */
        generateKey: (prefix: string, characterId: string) => {
            return `${prefix}_${userId}_${slotId}_${characterId}`;
        },

        /**
         * 鑾峰彇缂撳瓨鏁版嵁
         */
        get: (key: string) => {
            const cached = memoryCache.current[key];
            if (!cached) return null;
            
            const now = Date.now();
            if (now - cached.timestamp > CACHE_TTL) {
                // 缂撳瓨杩囨湡锛屾竻闄?                delete memoryCache.current[key];
                return null;
            }
            
            return cached.data;
        },

        /**
         * 璁剧疆缂撳瓨鏁版嵁
         */
        set: (key: string, data: any) => {
            memoryCache.current[key] = {
                data,
                timestamp: Date.now()
            };
        },

        /**
         * 娓呴櫎缂撳瓨
         */
        clear: (characterId?: string) => {
            if (characterId) {
                // 娓呴櫎鎸囧畾瑙掕壊鐨勭紦瀛?                Object.keys(memoryCache.current).forEach(key => {
                    if (key.includes(`_${characterId}`)) {
                        delete memoryCache.current[key];
                    }
                });
            } else {
                // 娓呴櫎鎵€鏈夌紦瀛?                memoryCache.current = {};
            }
        }
    };

    /**
     * 甯﹂噸璇曟満鍒剁殑API璋冪敤
     */
    const retryApiCall = async <T>(apiCall: () => Promise<T>, maxRetries: number = 2, delay: number = 500): Promise<T | null> => {
        let lastError: any = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                lastError = error;
                console.warn(`[AI Memory] API call attempt ${attempt + 1} failed:`, error);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        console.error('[AI Memory] All API call attempts failed:', lastError);
        return null;
    };

    /**
     * 鑾峰彇瑙掕壊鐨勫畬鏁磋蹇嗕笂涓嬫枃锛堢敤浜庢瀯寤?LLM Prompt锛?     */
    const getMemoryContext = useCallback(async (characterId: string): Promise<{
        recentMessages: ChatMessage[];
        coreMemories: CharacterMemory[];
        summaries: CharacterMemory[];
    }> => {
        // 灏濊瘯浠庣紦瀛樿幏鍙?        const cacheKey = cacheManager.generateKey('context', characterId);
        const cachedContext = cacheManager.get(cacheKey);
        if (cachedContext) {
            console.log('[AI Memory] Using cached memory context');
            return cachedContext;
        }

        setIsLoadingMemory(true);
        try {
            // 甯﹂噸璇曟満鍒剁殑骞惰鑾峰彇
            const [messagesResult, memoriesResult] = await Promise.all([
                retryApiCall(() => getChatMessages(userId, slotId, characterId, 15)), // 鑾峰彇鏈€杩?5鏉″璇?                retryApiCall(() => getCharacterMemories(userId, slotId, characterId))
            ]);

            // 澶勭悊鍙兘鐨勭┖缁撴灉
            const messages = messagesResult || [];
            const memories = memoriesResult || [];

            // 鍒嗙被璁板繂
            const coreMemories = memories.filter(m => m.memory_type === 'core_fact');
            const summaries = memories.filter(m => m.memory_type === 'summary');

            const result = {
                recentMessages: messages,
                coreMemories,
                summaries
            };

            // 缂撳瓨缁撴灉
            cacheManager.set(cacheKey, result);

            return result;
        } catch (error) {
            console.error('[AI Memory] Failed to load memory context:', error);
            return {
                recentMessages: [],
                coreMemories: [],
                summaries: []
            };
        } finally {
            setIsLoadingMemory(false);
        }
    }, [userId, slotId]);

    /**
     * 淇濆瓨涓€鏉″璇濊褰?     */
    const saveMessage = useCallback(async (
        characterId: string,
        role: 'user' | 'assistant',
        content: string
    ): Promise<boolean> => {
        try {
            const result = await retryApiCall(() => addChatMessage(userId, slotId, characterId, role, content));
            
            // 娓呴櫎鐩稿叧缂撳瓨
            if (result !== null) {
                cacheManager.clear(characterId);
                console.log('[AI Memory] Cache cleared after saving message');
            }
            
            return result !== null;
        } catch (error) {
            console.error('[AI Memory] Failed to save message:', error);
            return false;
        }
    }, [userId, slotId]);

    /**
     * 淇濆瓨 AI 鎻愬彇鐨勬牳蹇冭蹇?     */
    const saveMemories = useCallback(async (
        characterId: string,
        memories: string[],
        type: 'core_fact' | 'summary' = 'core_fact'
    ): Promise<boolean> => {
        if (!memories || memories.length === 0) return true;
        
        try {
            const result = await retryApiCall(() => addCharacterMemories(userId, slotId, characterId, memories, type));
            
            // 娓呴櫎鐩稿叧缂撳瓨
            if (result !== null) {
                cacheManager.clear(characterId);
                console.log('[AI Memory] Cache cleared after saving memories');
            }
            
            return result !== null;
        } catch (error) {
            console.error('[AI Memory] Failed to save memories:', error);
            return false;
        }
    }, [userId, slotId]);

    /**
     * 鏋勫缓澧炲己鐨?System Prompt锛堝寘鍚蹇嗕笂涓嬫枃锛?     */
    const buildEnhancedPrompt = useCallback((
        basePrompt: string,
        memoryContext: {
            recentMessages: ChatMessage[];
            coreMemories: CharacterMemory[];
            summaries: CharacterMemory[];
        }
    ): string => {
        let enhancedPrompt = basePrompt;

        // 娣诲姞鏍稿績璁板繂
        if (memoryContext.coreMemories.length > 0) {
            const factsText = memoryContext.coreMemories
                .map(m => `- ${m.content}`)
                .join('\n');
            enhancedPrompt += `\n\n銆愪綘瀵圭帺瀹剁殑鏍稿績璁板繂銆慭n${factsText}`;
        }

        // 娣诲姞鍘嗗彶鎽樿
        if (memoryContext.summaries.length > 0) {
            const summariesText = memoryContext.summaries
                .map(m => `- ${m.content}`)
                .join('\n');
            enhancedPrompt += `\n\n銆愯繃鍘荤殑鏁呬簨鎽樿銆慭n${summariesText}`;
        }

        return enhancedPrompt;
    }, []);

    /**
     * 鐢熸垚鍘嗗彶鎽樿锛堣皟鐢?LLM锛?     */
    const generateSummary = useCallback(async (
        oldSummary: string,
        messagesToSummarize: ChatMessage[]
    ): Promise<string> => {
        if (!apiConfig || !apiConfig.apiKey) {
            console.warn('[AI Memory] No API config, skipping summary generation');
            return oldSummary;
        }

        const conversationText = messagesToSummarize
            .map(m => `${m.role === 'user' ? '鐜╁' : 'AI'}: ${m.content}`)
            .join('\n');

        const summaryPrompt = `[绯荤粺鎸囦护]
浣犳槸涓€涓笓涓氱殑璁板繂鏁寸悊鍔╂墜锛屾搮闀夸粠瀵硅瘽涓彁鍙栨牳蹇冧俊鎭苟鐢熸垚绠€娲佹槑浜嗙殑鎽樿銆?
璇峰皢浠ヤ笅銆愭柊鍙戠敓鐨勫璇濄€戣瀺鍏ュ埌銆愬師鏈夌殑璁板繂鎽樿銆戜腑锛岀敓鎴愪竴涓柊鐨勭患鍚堟憳瑕併€?
閲嶈瑕佹眰锛?1. 鏍稿績淇℃伅鎻愬彇锛氶噸鐐规彁鍙栦互涓嬪唴瀹?   - 鐜╁鐨勯噸瑕佸亸濂姐€佷範鎯拰鐗圭偣
   - 瑙掕壊涓庣帺瀹朵箣闂寸殑绾﹀畾銆佹壙璇烘垨璁″垝
   - 鎯呮劅鍙樺寲鍜屽叧绯诲彂灞?   - 褰卞搷娓告垙杩涚▼鐨勫叧閿簨浠?   - 瑙掕壊鐘舵€佺殑閲嶈鍙樺寲

2. 鎽樿璐ㄩ噺瑕佹眰锛?   - 蹇呴』浣跨敤绗笁浜虹О瀹㈣鎻忚堪
   - 璇█绠€娲佹槑浜嗭紝閫昏緫娓呮櫚
   - 淇濇寔淇℃伅鐨勫噯纭€у拰瀹屾暣鎬?   - 蹇界暐鏃犲叧绱ц鐨勫瘨鏆勫拰閲嶅鍐呭
   - 鎬诲瓧鏁颁弗鏍兼帶鍒跺湪 ${SUMMARY_MAX_LENGTH} 瀛椾互鍐咃紒

3. 鏍煎紡瑕佹眰锛?   - 鍙緭鍑烘憳瑕佹枃鏈紝涓嶈娣诲姞浠讳綍鍓嶇紑鎴栬В閲?   - 涓嶈鍖呭惈瀵硅瘽鍘熸枃锛屽彧鍖呭惈鎻愮偧鍚庣殑淇℃伅
   - 浣跨敤鑷劧娴佺晠鐨勪腑鏂囪〃杈?
銆愬師鏈夎蹇嗘憳瑕併€?${oldSummary || "鏃?}

銆愭柊鍙戠敓鐨勫璇濄€?${conversationText}

璇疯緭鍑烘柊鐨勭患鍚堟憳瑕侊細`;

        try {
            // 浣跨敤涓存椂鐨?LLM 瀹炰緥锛岄伩鍏嶆薄鏌撲富瀵硅瘽鍘嗗彶
            const response = await fetch(
                apiConfig.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' :
                apiConfig.provider === 'google' ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' :
                apiConfig.provider === 'deepseek' ? 'https://api.deepseek.com/chat/completions' :
                `${apiConfig.baseUrl}/chat/completions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: apiConfig.model,
                        messages: [{ role: 'user', content: summaryPrompt }],
                        temperature: 0.2, // 杩涗竴姝ラ檷浣庢俯搴︼紝鎻愰珮鎽樿鐨勪竴鑷存€у拰鍑嗙‘鎬?                        max_tokens: 300,
                        top_p: 0.9, // 鎺у埗鐢熸垚鐨勫鏍锋€?                        frequency_penalty: 0.1, // 鍑忓皯閲嶅鍐呭
                        presence_penalty: 0.1 // 榧撳姳鏂板唴瀹?                    })
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const summaryText = data.choices?.[0]?.message?.content || oldSummary;
            
            // 娓呯悊鍙兘鐨?Markdown 鏍囪鍜屽浣欑殑绌虹櫧
            let cleanedSummary = summaryText.replace(/`{3}/g, '').trim();
            
            // 纭繚鎽樿闀垮害绗﹀悎瑕佹眰
            if (cleanedSummary.length > SUMMARY_MAX_LENGTH) {
                cleanedSummary = cleanedSummary.substring(0, SUMMARY_MAX_LENGTH).trim();
            }
            
            return cleanedSummary;
        } catch (error) {
            console.error('[AI Memory] Failed to generate summary:', error);
            return oldSummary; // 澶辫触鏃惰繑鍥炴棫鎽樿
        }
    }, [apiConfig]);

    /**
     * 瑙﹀彂鎽樿鍘嬬缉锛堝鏋滈渶瑕侊級
     * 杩欐槸涓€涓悗鍙伴潤榛樻墽琛岀殑鍑芥暟锛屼笉闃诲 UI
     */
    const triggerSummaryIfNeeded = useCallback(async (characterId: string): Promise<void> => {
        // 濡傛灉姝ｅ湪鎬荤粨涓紝璺宠繃
        if (isSummarizing) {
            console.log('[AI Memory] Already summarizing, skipping');
            return;
        }

        try {
            setIsSummarizing(true);

            // 1. 鑾峰彇褰撳墠瑙掕壊鐨勬墍鏈夎亰澶╄褰?            const messages = await getChatMessages(userId, slotId, characterId, 100);
            
            // 2. 濡傛灉娑堟伅鏁伴噺鏈揪鍒伴槇鍊硷紝浠€涔堥兘涓嶅仛
            if (messages.length <= MAX_WORKING_MEMORY) {
                return;
            }

            console.log(`[AI Memory] 瑙﹀彂鎵归噺鎽樿鍘嬬缉锛屽綋鍓嶆秷鎭暟: ${messages.length}`);

            // 3. 鍒囧壊锛氬彇鍑烘渶鑰佺殑 SUMMARIZE_BATCH 鏉″噯澶囨€荤粨
            const messagesToSummarize = messages.slice(0, SUMMARIZE_BATCH);
            const lastTimestampToSummarize = messagesToSummarize[SUMMARIZE_BATCH - 1].created_at;

            // 4. 鑾峰彇鏃х殑鎽樿锛堝甫閲嶈瘯锛?            const memoriesResult = await retryApiCall(() => getCharacterMemories(userId, slotId, characterId));
            const memories = memoriesResult || [];
            const oldSummary = memories.find(m => m.memory_type === 'summary')?.content || "";

            // 5. 鐢熸垚鏂版憳瑕?            const newSummary = await generateSummary(oldSummary, messagesToSummarize);

            // 6. 鏇存柊鏁版嵁搴擄紙甯﹂噸璇曪級
            await retryApiCall(() => updateCharacterSummary(userId, slotId, characterId, newSummary));
            
            // 7. 鍒犻櫎宸茬粡鎬荤粨杩囩殑鍘熷瀵硅瘽锛堝甫閲嶈瘯锛?            await retryApiCall(() => deleteOldMessages(userId, slotId, characterId, lastTimestampToSummarize));

            // 娓呴櫎鐩稿叧缂撳瓨
            cacheManager.clear(characterId);
            console.log(`[AI Memory] 鎽樿鏇存柊鎴愬姛锛屽垹闄や簡 ${SUMMARIZE_BATCH} 鏉℃棫娑堟伅`);
            console.log(`[AI Memory] 鏂版憳瑕? ${newSummary.substring(0, 50)}...`);
            console.log('[AI Memory] Cache cleared after summary update');
        } catch (error) {
            console.error('[AI Memory] 鎽樿鐢熸垚澶辫触锛岀暀寰呬笅娆¤Е鍙?', error);
        } finally {
            setIsSummarizing(false);
        }
    }, [userId, slotId, isSummarizing, generateSummary]);

    return {
        isLoadingMemory,
        isSummarizing,
        getMemoryContext,
        saveMessage,
        saveMemories,
        buildEnhancedPrompt,
        triggerSummaryIfNeeded
    };
};
