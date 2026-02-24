import { useState, useCallback } from 'react';
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

    /**
     * 获取角色的完整记忆上下文（用于构建 LLM Prompt）
     */
    const getMemoryContext = useCallback(async (characterId: string): Promise<{
        recentMessages: ChatMessage[];
        coreMemories: CharacterMemory[];
        summaries: CharacterMemory[];
    }> => {
        setIsLoadingMemory(true);
        try {
            // 并行获取短期对话和长期记忆
            const [messages, memories] = await Promise.all([
                getChatMessages(userId, slotId, characterId, 15), // 获取最近15条对话
                getCharacterMemories(userId, slotId, characterId)
            ]);

            // 分类记忆
            const coreMemories = memories.filter(m => m.memory_type === 'core_fact');
            const summaries = memories.filter(m => m.memory_type === 'summary');

            return {
                recentMessages: messages,
                coreMemories,
                summaries
            };
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
            return await addChatMessage(userId, slotId, characterId, role, content);
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
            return await addCharacterMemories(userId, slotId, characterId, memories, type);
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

        const summaryPrompt = `
[系统指令]
你是一个记忆整理助手。请将以下【新发生的对话】融入到【原有的记忆摘要】中。

要求：
1. 提取推动剧情的事件、感情变化和关键信息
2. 忽略没有营养的寒暄和重复内容
3. 必须使用第三人称客观描述
4. 总字数严格控制在 ${SUMMARY_MAX_LENGTH} 字以内！
5. 只输出摘要文本，不要添加任何前缀或解释

【原有记忆摘要】
${oldSummary || "无"}

【新发生的对话】
${conversationText}

请输出新的摘要：
`;

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
                        temperature: 0.3, // 降低温度，让摘要更稳定
                        max_tokens: 300
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const summaryText = data.choices?.[0]?.message?.content || oldSummary;
            
            // 清理可能的 Markdown 标记
            return summaryText.replace(/```/g, '').trim();
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

            // 4. 获取旧的摘要
            const memories = await getCharacterMemories(userId, slotId, characterId);
            const oldSummary = memories.find(m => m.memory_type === 'summary')?.content || "";

            // 5. 生成新摘要
            const newSummary = await generateSummary(oldSummary, messagesToSummarize);

            // 6. 更新数据库
            await updateCharacterSummary(userId, slotId, characterId, newSummary);
            
            // 7. 删除已经总结过的原始对话
            await deleteOldMessages(userId, slotId, characterId, lastTimestampToSummarize);

            console.log(`[AI Memory] 摘要更新成功，删除了 ${SUMMARIZE_BATCH} 条旧消息`);
            console.log(`[AI Memory] 新摘要: ${newSummary.substring(0, 50)}...`);
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
```