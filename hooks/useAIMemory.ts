import { useState, useCallback, useRef } from 'react';
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
    apiConfig?: ApiConfig; // 用于生成摘要
}

// 配置常量
const MAX_WORKING_MEMORY = 30;  // 工作记忆上限
const SUMMARIZE_BATCH = 20;      // 每次总结的对话数量
const SUMMARY_MAX_LENGTH = 150;  // 摘要最大字数

/**
 * AI 记忆系统 Hook
 * 管理角色的短期对话记忆和长期核心记忆
 */
export const useAIMemory = ({ userId, slotId, apiConfig }: UseAIMemoryProps) => {
    const [isLoadingMemory, setIsLoadingMemory] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    
    // 本地缓存，减少重复查询
    const memoryCache = useRef<{
        [key: string]: {
            data: any;
            timestamp: number;
        }
    }>({});
    
    // 缓存有效期（毫秒）
    const CACHE_TTL = 30000; // 30秒

    /**
     * 缓存管理工具函数
     */
    const cacheManager = {
        /**
         * 生成缓存键
         */
        generateKey: (prefix: string, characterId: string) => {
            return `${prefix}_${userId}_${slotId}_${characterId}`;
        },

        /**
         * 获取缓存数据
         */
        get: (key: string) => {
            const cached = memoryCache.current[key];
            if (!cached) return null;
            
            const now = Date.now();
            if (now - cached.timestamp > CACHE_TTL) {
                // 缓存过期，清除
                delete memoryCache.current[key];
                return null;
            }
            
            return cached.data;
        },

        /**
         * 设置缓存数据
         */
        set: (key: string, data: any) => {
            memoryCache.current[key] = {
                data,
                timestamp: Date.now()
            };
        },

        /**
         * 清除缓存
         */
        clear: (characterId?: string) => {
            if (characterId) {
                // 清除指定角色的缓存
                Object.keys(memoryCache.current).forEach(key => {
                    if (key.includes(`_${characterId}`)) {
                        delete memoryCache.current[key];
                    }
                });
            } else {
                // 清除所有缓存
                memoryCache.current = {};
            }
        }
    };

    /**
     * 带重试机制的API调用
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
     * 获取角色的完整记忆上下文（用于构建 LLM Prompt）
     */
    const getMemoryContext = useCallback(async (characterId: string): Promise<{
        recentMessages: ChatMessage[];
        coreMemories: CharacterMemory[];
        summaries: CharacterMemory[];
    }> => {
        // 尝试从缓存获取
        const cacheKey = cacheManager.generateKey('context', characterId);
        const cachedContext = cacheManager.get(cacheKey);
        if (cachedContext) {
            console.log('[AI Memory] Using cached memory context');
            return cachedContext;
        }

        setIsLoadingMemory(true);
        try {
            // 带重试机制的并行获取
            const [messagesResult, memoriesResult] = await Promise.all([
                retryApiCall(() => getChatMessages(userId, slotId, characterId, 15)), // 获取最近15条对话
                retryApiCall(() => getCharacterMemories(userId, slotId, characterId))
            ]);

            // 处理可能的空结果
            const messages = messagesResult || [];
            const memories = memoriesResult || [];

            // 分类记忆
            const coreMemories = memories.filter(m => m.memory_type === 'core_fact');
            const summaries = memories.filter(m => m.memory_type === 'summary');

            const result = {
                recentMessages: messages,
                coreMemories,
                summaries
            };

            // 缓存结果
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
     * 保存一条对话记录
     */
    const saveMessage = useCallback(async (
        characterId: string,
        role: 'user' | 'assistant',
        content: string
    ): Promise<boolean> => {
        try {
            const result = await retryApiCall(() => addChatMessage(userId, slotId, characterId, role, content));
            
            // 清除相关缓存
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
     * 保存 AI 提取的核心记忆
     */
    const saveMemories = useCallback(async (
        characterId: string,
        memories: string[],
        type: 'core_fact' | 'summary' = 'core_fact'
    ): Promise<boolean> => {
        if (!memories || memories.length === 0) return true;
        
        try {
            const result = await retryApiCall(() => addCharacterMemories(userId, slotId, characterId, memories, type));
            
            // 清除相关缓存
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
     * 构建增强的 System Prompt（包含记忆上下文）
     */
    const buildEnhancedPrompt = useCallback((
        basePrompt: string,
        memoryContext: {
            recentMessages: ChatMessage[];
            coreMemories: CharacterMemory[];
            summaries: CharacterMemory[];
        }
    ): string => {
        let enhancedPrompt = basePrompt;

        // 添加核心记忆
        if (memoryContext.coreMemories.length > 0) {
            const factsText = memoryContext.coreMemories
                .map(m => `- ${m.content}`)
                .join('\n');
            enhancedPrompt += `\n\n【你对玩家的核心记忆】\n${factsText}`;
        }

        // 添加历史摘要
        if (memoryContext.summaries.length > 0) {
            const summariesText = memoryContext.summaries
                .map(m => `- ${m.content}`)
                .join('\n');
            enhancedPrompt += `\n\n【过去的故事摘要】\n${summariesText}`;
        }

        return enhancedPrompt;
    }, []);

    /**
     * 生成历史摘要（调用 LLM）
     */
    const generateSummary = useCallback(async (
        oldSummary: string,
        messagesToSummarize: ChatMessage[]
    ): Promise<string> => {
        if (!apiConfig || !apiConfig.apiKey) {
            console.warn('[AI Memory] No API config, skipping summary generation');
            return oldSummary;
        }

        const conversationText = messagesToSummarize
            .map(m => `${m.role === 'user' ? '玩家' : 'AI'}: ${m.content}`)
            .join('\n');

        const summaryPrompt = `[系统指令]
你是一个专业的记忆整理助手，擅长从对话中提取核心信息并生成简洁明了的摘要。

请将以下【新发生的对话】融入到【原有的记忆摘要】中，生成一个新的综合摘要。

重要要求：
1. 核心信息提取：重点提取以下内容（按优先级排序）
   - 【最高优先级】性行为事件：任何形式的性行为，须保留时间、地点、双方情感状态
   - 【最高优先级】亲密里程碑：初吻、第一次拥抱/爱抚、第一次裸体相处、关系确立等
   - 玩家的重要偏好、习惯和特点
   - 角色与玩家之间的约定、承诺或计划
   - 情感变化和关系发展
   - 影响游戏进程的关键事件
   - 角色状态的重要变化

2. 摘要质量要求：
   - 必须使用第三人称客观描述
   - 语言简洁明了，逻辑清晰
   - 保持信息的准确性和完整性
   - 忽略无关紧要的寒暄和重复内容
   - 总字数严格控制在 ${SUMMARY_MAX_LENGTH} 字以内！
   - 【最高优先级，绝对不可压缩删除】：性行为记录、亲密里程碑（初吻/第一次裸体相处等）、关系确立事件，这些内容即使字数紧张也必须完整保留

3. 格式要求：
   - 只输出摘要文本，不要添加任何前缀或解释
   - 不要包含对话原文，只包含提炼后的信息
   - 使用自然流畅的中文表达

【原有记忆摘要】
${oldSummary || "无"}

【新发生的对话】
${conversationText}

请输出新的综合摘要：`;

        try {
            // 使用临时的 LLM 实例，避免污染主对话历史
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
                        temperature: 0.2, // 进一步降低温度，提高摘要的一致性和准确性
                        max_tokens: 300,
                        top_p: 0.9, // 控制生成的多样性
                        frequency_penalty: 0.1, // 减少重复内容
                        presence_penalty: 0.1 // 鼓励新内容
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const summaryText = data.choices?.[0]?.message?.content || oldSummary;
            
            // 清理可能的 Markdown 标记和多余的空白
            let cleanedSummary = summaryText.replace(/`{3}/g, '').trim();
            
            // 确保摘要长度符合要求
            if (cleanedSummary.length > SUMMARY_MAX_LENGTH) {
                cleanedSummary = cleanedSummary.substring(0, SUMMARY_MAX_LENGTH).trim();
            }
            
            return cleanedSummary;
        } catch (error) {
            console.error('[AI Memory] Failed to generate summary:', error);
            return oldSummary; // 失败时返回旧摘要
        }
    }, [apiConfig]);

    /**
     * 触发摘要压缩（如果需要）
     * 这是一个后台静默执行的函数，不阻塞 UI
     */
    const triggerSummaryIfNeeded = useCallback(async (characterId: string): Promise<void> => {
        // 如果正在总结中，跳过
        if (isSummarizing) {
            console.log('[AI Memory] Already summarizing, skipping');
            return;
        }

        try {
            setIsSummarizing(true);

            // 1. 获取当前角色的所有聊天记录
            const messages = await getChatMessages(userId, slotId, characterId, 100);
            
            // 2. 如果消息数量未达到阈值，什么都不做
            if (messages.length <= MAX_WORKING_MEMORY) {
                return;
            }

            console.log(`[AI Memory] 触发批量摘要压缩，当前消息数: ${messages.length}`);

            // 3. 切割：取出最老的 SUMMARIZE_BATCH 条准备总结
            const messagesToSummarize = messages.slice(0, SUMMARIZE_BATCH);
            const lastTimestampToSummarize = messagesToSummarize[SUMMARIZE_BATCH - 1].created_at;

            // 4. 获取旧的摘要（带重试）
            const memoriesResult = await retryApiCall(() => getCharacterMemories(userId, slotId, characterId));
            const memories = memoriesResult || [];
            const oldSummary = memories.find(m => m.memory_type === 'summary')?.content || "";

            // 5. 生成新摘要
            const newSummary = await generateSummary(oldSummary, messagesToSummarize);

            // 6. 更新数据库（带重试）
            await retryApiCall(() => updateCharacterSummary(userId, slotId, characterId, newSummary));
            
            // 7. 删除已经总结过的原始对话（带重试）
            await retryApiCall(() => deleteOldMessages(userId, slotId, characterId, lastTimestampToSummarize));

            // 清除相关缓存
            cacheManager.clear(characterId);
            console.log(`[AI Memory] 摘要更新成功，删除了 ${SUMMARIZE_BATCH} 条旧消息`);
            console.log(`[AI Memory] 新摘要: ${newSummary.substring(0, 50)}...`);
            console.log('[AI Memory] Cache cleared after summary update');
        } catch (error) {
            console.error('[AI Memory] 摘要生成失败，留待下次触发:', error);
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