
import { useState, useRef, useEffect } from 'react';
import { 
    Character, ClothingState, DialogueEntry, GameSettings, WorldState, LogEntry, CharacterUnlocks 
} from '../types';
import { llmService } from '../services/llmService';
import { USER_INFO_TEMPLATE, generateSystemPrompt, CHARACTERS } from '../data/scenarioData';
import { getCharacterSprite } from '../utils/gameLogic';
import { SCENE_NAMES } from '../utils/gameConstants';
import { getDefaultUnlocks } from '../utils/unlockHelpers';
import { updateCharacterUnlocks as updateCharacterUnlocksDB } from '../services/db';
import { useAIMemory } from './useAIMemory';

interface UseDialogueSystemProps {
    settings: GameSettings;
    worldState: WorldState;
    characterStats: Record<string, { level: number; affinity: number }>;
    characterUnlocks: Record<string, CharacterUnlocks>;
    userId: number;
    currentSlotId: number;
    onItemsGained: (items: { id: string; count: number }[]) => void;
    onCharacterMove: (charId: string, targetId: string) => void;
    onAffinityChange: (charId: string, change: number) => void;
    onUnlockUpdate: (charId: string, unlockKey: keyof CharacterUnlocks) => void;
}

export const useDialogueSystem = ({ 
    settings, worldState, characterStats, characterUnlocks, userId, currentSlotId, onItemsGained, onCharacterMove, onAffinityChange, onUnlockUpdate 
}: UseDialogueSystemProps) => {
  // AI 记忆系统
  const aiMemory = useAIMemory({ 
      userId, 
      slotId: currentSlotId,
      apiConfig: settings.apiConfig 
  });
  const [isDialogueMode, setIsDialogueMode] = useState(false);
  const [isDialogueEnding, setIsDialogueEnding] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [clothingState, setClothingState] = useState<ClothingState>('default');
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<{ speaker: string; text: string }>({ speaker: '', text: '' });
  const [currentSprite, setCurrentSprite] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<DialogueEntry[]>([]);
  const [debugLogs, setDebugLogs] = useState<LogEntry[]>([]); 

  // Ambient States
  const [ambientCharacter, setAmbientCharacter] = useState<Character | null>(null);
  const [ambientText, setAmbientText] = useState<string>('');
  const [isAmbientLoading, setIsAmbientLoading] = useState(false);
  const [isAmbientSleeping, setIsAmbientSleeping] = useState(false); 
  const [isAmbientBathing, setIsAmbientBathing] = useState(false); 
  const [showAmbientDialogue, setShowAmbientDialogue] = useState(true);
  const [lastAffinityChange, setLastAffinityChange] = useState<number | undefined>(undefined);
  
  // [角色主动结束对话] 跟踪当前对话中的好感度累计变化
  const [sessionAffinityTotal, setSessionAffinityTotal] = useState<number>(0);

  // Subscribe to LLM logs
  useEffect(() => {
    const unsubscribe = llmService.subscribeLogs((logs) => {
        setDebugLogs([...logs]); 
    });
    return () => unsubscribe();
  }, []);

  const initLLM = async (char: Character) => {
    const dynamicUserInfo = USER_INFO_TEMPLATE.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    
    // Get character unlocks or use default
    const unlocks = characterUnlocks[char.id] || getDefaultUnlocks();
    
    // Get current affinity
    const stats = characterStats[char.id] || { level: 1, affinity: 0 };
    
    let systemPrompt = generateSystemPrompt(char, dynamicUserInfo, settings.innName, settings.enableNSFW, unlocks, stats.affinity);
    systemPrompt = systemPrompt.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    
    // 加载角色记忆并增强 System Prompt
    const memoryContext = await aiMemory.getMemoryContext(char.id);
    const enhancedPrompt = aiMemory.buildEnhancedPrompt(systemPrompt, memoryContext);
    
    // 添加 update_memory 字段的说明
    const memoryInstruction = `\n\n【记忆提取指令】\n"update_memory": [可选] 字符串数组。如果你在对话中得知了关于玩家的重要信息、喜好、约定或承诺，请将它们作为简短的事实提取出来。\n例如：["玩家喜欢喝麦酒", "约定了明天一起去温泉"]。如果没有重要信息，请不要输出此字段。`;
    
    const fullPrompt = `${enhancedPrompt}${memoryInstruction}\n\n${dynamicUserInfo}`;
    
    await llmService.initChat(char, fullPrompt, settings.apiConfig);
  };

  const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    const char = CHARACTERS[characterId];
    if (!char) return;

    // [角色主动结束对话] 重置对话会话的好感度累计
    setSessionAffinityTotal(0);

    let nextClothingState: ClothingState = 'default';
    if (
        (actionType === 'peep' || actionType === 'bath_together') || 
        (actionType === 'massage_give' || actionType === 'massage_receive') 
    ) {
        nextClothingState = 'nude';
    }
    
    setClothingState(nextClothingState);
    setActiveCharacter(char);
    
    const sprite = getCharacterSprite(char, nextClothingState, 'normal');
    setCurrentSprite(sprite);
    setCurrentDialogue({ speaker: char.name, text: "..." });
    setIsDialogueMode(true);
    setIsDialogueEnding(false);
    
    const stats = characterStats[characterId] || { level: 1, affinity: 0 };
    
    if (settings.apiConfig.apiKey) {
        setIsLoading(true);
        try {
            await initLLM(char);
            
            const contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为剧情生成指令]
玩家(${settings.userName})在【${worldState.periodLabel}】的【${worldState.sceneName}】找到了你。
玩家当前的行动意图是:【${actionType}】。
当前你对玩家的好感度为: ${stats.affinity} (0-100)。
你的衣着状态是: ${nextClothingState === 'nude' ? '裸体/未穿衣' : '日常装束'}。
请根据你的性格、当前时间、地点、好感度以及玩家的行为，生成一句符合情境的开场白或反应。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
            const response = await llmService.sendMessage(contextPrompt);
            const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);

            // 保存开场白到聊天记录
            await aiMemory.saveMessage(char.id, 'assistant', displayText);

            setCurrentDialogue({ speaker: char.name, text: displayText });
            setHistory(prev => [...prev, { 
                speaker: char.name, text: displayText, timestamp: Date.now(), 
                type: 'npc', avatarUrl: char.avatarUrl, tokens: response.usage?.completion_tokens 
            }]);

            if (response.emotion) {
                const emotionSprite = getCharacterSprite(char, nextClothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
            setIsTyping(true);
        } catch(e) {
            console.error(e);
            setErrorMessage("角色初始化失败");
            setCurrentDialogue({ speaker: char.name, text: `*(${char.name}看着你)* ...有什么事吗？` });
        } finally {
            setIsLoading(false);
        }
    } else {
        setCurrentDialogue({ speaker: char.name, text: `*(${char.name}似乎正在发呆)* ...` });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !activeCharacter) return;
    if (!settings.apiConfig.apiKey) {
        setErrorMessage("请配置 API Key。");
        return;
    }

    const userMessage = inputText;
    setInputText('');
    setIsLoading(true);
    setHistory(prev => [...prev, { speaker: settings.userName, text: userMessage, timestamp: Date.now(), type: 'user', avatarUrl: 'img/face/1.png' }]);

    try {
      const contextBlock = `\n[当前环境]\n场景: ${worldState.sceneName}\n时间: ${worldState.timeStr}\n衣着: ${clothingState}\n`;
      const enrichedMessage = `${contextBlock}\n用户发言: "${userMessage}"`;
      
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
      
      // 保存用户消息和 AI 回复到聊天记录
      await aiMemory.saveMessage(activeCharacter.id, 'user', userMessage);
      await aiMemory.saveMessage(activeCharacter.id, 'assistant', displayText);
      
      // 如果 AI 提取了新的核心记忆，保存到数据库
      if (response.update_memory && response.update_memory.length > 0) {
          console.log('[AI Memory] Extracted memories:', response.update_memory);
          await aiMemory.saveMemories(activeCharacter.id, response.update_memory, 'core_fact');
      }
      
      // 静默触发摘要压缩（不阻塞 UI）
      aiMemory.triggerSummaryIfNeeded(activeCharacter.id).catch(err => {
          console.error('[AI Memory] Summary trigger failed:', err);
      });
      
      setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
      
      if (response.items && response.items.length > 0) {
          onItemsGained(response.items);
      }

      if (response.affinity_change && activeCharacter) {
          // [好感度上限] 检查是否已达到正面好感度累计上限
          const shouldApplyChange = response.affinity_change < 0 || sessionAffinityTotal < 10;
          
          if (shouldApplyChange) {
              onAffinityChange(activeCharacter.id, response.affinity_change);
              setLastAffinityChange(response.affinity_change);
              // 清除变化指示器
              setTimeout(() => setLastAffinityChange(undefined), 2500);
              
              // [角色主动结束对话] 累计好感度变化
              const newTotal = sessionAffinityTotal + response.affinity_change;
              setSessionAffinityTotal(newTotal);
              
              // 如果累计好感度变化 <= -10 且不在 bondage 状态，角色主动结束对话
              if (newTotal <= -10 && clothingState !== 'bondage') {
                  console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);
                  // 延迟触发，让当前消息显示完毕
                  setTimeout(() => {
                      handleEndDialogueGeneration();
                  }, 1000);
              }
          } else {
              console.log(`[好感度上限] 当前累计: ${sessionAffinityTotal}, 忽略正面变化: +${response.affinity_change}`);
          }
      }

      if (settings.enableNSFW && response.clothing) {
          const newClothing = response.clothing.toLowerCase();
          if (['default', 'nude', 'bondage'].includes(newClothing) && newClothing !== clothingState) {
              setClothingState(newClothing as ClothingState);
          }
      }

      if (response.move_to) {
          onCharacterMove(activeCharacter.id, response.move_to);
          // [角色移动系统] 当角色决定移动场景时，主动结束对话
          console.log(`[角色移动系统] ${activeCharacter.name} 决定移动到 ${response.move_to}，主动结束对话`);
          // 延迟触发，让当前消息显示完毕
          setTimeout(() => {
              handleEndDialogueGenerationWithMove(response.move_to);
          }, 1000);
      }

      // Handle unlock request
      if (response.unlock_request && activeCharacter) {
          const unlockKey = response.unlock_request as keyof CharacterUnlocks;
          console.log(`[Unlock Request] Character ${activeCharacter.id} agreed to unlock: ${unlockKey}`);
          
          // Update local state
          onUnlockUpdate(activeCharacter.id, unlockKey);
          
          // Update database
          try {
              await updateCharacterUnlocksDB(userId, currentSlotId, activeCharacter.id, {
                  [unlockKey]: 1
              });
              console.log(`[Unlock Request] Database updated successfully`);
          } catch (error) {
              console.error(`[Unlock Request] Failed to update database:`, error);
          }
      }

      setHistory(prev => {
        const newHistory = [...prev];
        for (let i = newHistory.length - 1; i >= 0; i--) {
            if (newHistory[i].type === 'user' && !newHistory[i].tokens) {
                 if (response.usage) newHistory[i] = { ...newHistory[i], tokens: response.usage.prompt_tokens };
                 break; 
            }
        }
        newHistory.push({ 
            speaker: activeCharacter.name, text: displayText, timestamp: Date.now(), 
            type: 'npc', avatarUrl: activeCharacter.avatarUrl, tokens: response.usage?.completion_tokens 
        });
        return newHistory;
      });

      const effectiveClothingState = (settings.enableNSFW && response.clothing && ['default', 'nude', 'bondage'].includes(response.clothing)) 
                                     ? response.clothing 
                                     : clothingState;

      const sprite = response.emotion ? getCharacterSprite(activeCharacter, effectiveClothingState, response.emotion) 
                                      : getCharacterSprite(activeCharacter, effectiveClothingState, 'normal');
      setCurrentSprite(sprite);
      setIsTyping(true);
    } catch (error) {
      setErrorMessage(`通信故障: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
     if(isLoading || !activeCharacter) return;
     setIsLoading(true);
     try {
         const response = await llmService.redoLastMessage();
         if(response) {
            const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
            setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
            setIsTyping(true);
            
            if (response.items && response.items.length > 0) onItemsGained(response.items);

            if (response.affinity_change && activeCharacter) {
                // [好感度上限] 检查是否已达到正面好感度累计上限
                const shouldApplyChange = response.affinity_change < 0 || sessionAffinityTotal < 10;
                
                if (shouldApplyChange) {
                    onAffinityChange(activeCharacter.id, response.affinity_change);
                    setLastAffinityChange(response.affinity_change);
                    setTimeout(() => setLastAffinityChange(undefined), 2500);
                    
                    // [角色主动结束对话] 累计好感度变化
                    const newTotal = sessionAffinityTotal + response.affinity_change;
                    setSessionAffinityTotal(newTotal);
                    
                    // 如果累计好感度变化 <= -10 且不在 bondage 状态，角色主动结束对话
                    if (newTotal <= -10 && clothingState !== 'bondage') {
                        console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);
                        setTimeout(() => {
                            handleEndDialogueGeneration();
                        }, 1000);
                    }
                } else {
                    console.log(`[好感度上限] 当前累计: ${sessionAffinityTotal}, 忽略正面变化: +${response.affinity_change}`);
                }
            }

            if (settings.enableNSFW && response.clothing) {
                const newClothing = response.clothing.toLowerCase();
                if (['default', 'nude', 'bondage'].includes(newClothing) && newClothing !== clothingState) {
                    setClothingState(newClothing as ClothingState);
                }
            }

            if (response.move_to) {
                onCharacterMove(activeCharacter.id, response.move_to);
                // [角色移动系统] 当角色决定移动场景时，主动结束对话
                console.log(`[角色移动系统] ${activeCharacter.name} 决定移动到 ${response.move_to}，主动结束对话`);
                // 延迟触发，让当前消息显示完毕
                setTimeout(() => {
                    handleEndDialogueGenerationWithMove(response.move_to);
                }, 1000);
            }

            // Handle unlock request
            if (response.unlock_request && activeCharacter) {
                const unlockKey = response.unlock_request as keyof CharacterUnlocks;
                console.log(`[Unlock Request] Character ${activeCharacter.id} agreed to unlock: ${unlockKey}`);
                
                // Update local state
                onUnlockUpdate(activeCharacter.id, unlockKey);
                
                // Update database
                try {
                    await updateCharacterUnlocksDB(userId, currentSlotId, activeCharacter.id, {
                        [unlockKey]: 1
                    });
                    console.log(`[Unlock Request] Database updated successfully`);
                } catch (error) {
                    console.error(`[Unlock Request] Failed to update database:`, error);
                }
            }

            setHistory(prev => {
                const newHistory = [...prev];
                if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === 'npc') newHistory.pop();
                
                if (response.usage) {
                    for (let i = newHistory.length - 1; i >= 0; i--) {
                        if (newHistory[i].type === 'user') {
                            newHistory[i] = { ...newHistory[i], tokens: response.usage.prompt_tokens };
                            break;
                        }
                    }
                }
                newHistory.push({
                    speaker: activeCharacter.name, text: displayText, timestamp: Date.now(),
                    type: 'npc', avatarUrl: activeCharacter.avatarUrl, tokens: response.usage?.completion_tokens
                });
                return newHistory;
            });

             const effectiveClothingState = (settings.enableNSFW && response.clothing && ['default', 'nude', 'bondage'].includes(response.clothing)) 
                                     ? response.clothing 
                                     : clothingState;
             const sprite = response.emotion ? getCharacterSprite(activeCharacter, effectiveClothingState, response.emotion)
                                             : getCharacterSprite(activeCharacter, effectiveClothingState, 'normal');
             setCurrentSprite(sprite);
         }
     } catch (e) {
         setErrorMessage("重生成失败");
     } finally {
         setIsLoading(false);
     }
  };

  const handleEndDialogueGeneration = async () => {
    if (isLoading || isDialogueEnding || !activeCharacter) return;
    
    const stats = characterStats[activeCharacter.id] || { level: 1, affinity: 0 };
    setIsLoading(true);

    try {
        // [角色主动结束对话] 判断是否为角色主动结束
        const isCharacterInitiated = sessionAffinityTotal <= -10 && clothingState !== 'bondage';
        
        let contextPrompt = '';
        if (isCharacterInitiated) {
            // 角色因恼怒主动结束对话
            contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为系统指令]
你因为玩家的言行感到非常不满和恼怒，决定主动结束这次对话。
当前场景【${worldState.sceneName}】、时间【${worldState.periodLabel}】、好感度(${stats.affinity})。
在这次对话中，你的好感度累计下降了 ${Math.abs(sessionAffinityTotal)} 点。
请根据刚才的对话内容和你当前的情绪状态（生气、失望、厌烦等），生成一句简短但明确表达不满的告别语。
你的台词应该体现出你主动结束对话的意图，而不是被动告别。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
        } else {
            // 玩家主动结束对话
            contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为系统指令]
玩家决定结束当前的对话离开。
请根据当前场景【${worldState.sceneName}】、时间【${worldState.periodLabel}】、好感度(${stats.affinity})以及刚才的对话氛围，生成一句简短自然的告别语。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
        }
        let displayText = '';
        let tokensUsed = 0;

        if (settings.apiConfig.apiKey) {
            const response = await llmService.sendMessage(contextPrompt);
            displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
            tokensUsed = response.usage?.completion_tokens || 0;
            if (response.emotion) {
                const emotionSprite = getCharacterSprite(activeCharacter, clothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
        } else {
             displayText = `*(${activeCharacter.name}微笑着挥了挥手)* 下次见。`;
        }

        setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
        setHistory(prev => [...prev, { 
            speaker: activeCharacter.name, text: displayText, timestamp: Date.now(), 
            type: 'npc', avatarUrl: activeCharacter.avatarUrl, tokens: tokensUsed
        }]);
        
        setIsTyping(true);
        setIsDialogueEnding(true); 
    } catch(e) {
        console.error(e);
        setCurrentDialogue({ speaker: activeCharacter.name, text: `*(${activeCharacter.name}点了点头)* 回见。` });
        setIsTyping(true);
        setIsDialogueEnding(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEndDialogueGenerationWithMove = async (targetSceneId: string) => {
    if (isLoading || isDialogueEnding || !activeCharacter) return;
    
    const stats = characterStats[activeCharacter.id] || { level: 1, affinity: 0 };
    const targetSceneName = SCENE_NAMES[targetSceneId as any] || '未知场景';
    setIsLoading(true);

    try {
        // [角色移动系统] 角色决定移动场景，生成包含目标场景的告别语
        const contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为系统指令]
你决定主动结束当前对话并前往 ${targetSceneName}。
当前场景【${worldState.sceneName}】、时间【${worldState.periodLabel}】、好感度(${stats.affinity})。
请根据刚才的对话内容和你当前的情绪状态，生成一句简短但明确表达你要前往 ${targetSceneName} 的告别语。
你的台词应该自然流畅，体现出你即将离开的意图，并且明确提到你要去的地方。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
        
        let displayText = '';
        let tokensUsed = 0;

        if (settings.apiConfig.apiKey) {
            const response = await llmService.sendMessage(contextPrompt);
            displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
            tokensUsed = response.usage?.completion_tokens || 0;
            if (response.emotion) {
                const emotionSprite = getCharacterSprite(activeCharacter, clothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
        } else {
             displayText = `*(${activeCharacter.name}微笑着挥了挥手)* 我要去${targetSceneName}了，下次见。`;
        }

        setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
        setHistory(prev => [...prev, { 
            speaker: activeCharacter.name, text: displayText, timestamp: Date.now(), 
            type: 'npc', avatarUrl: activeCharacter.avatarUrl, tokens: tokensUsed
        }]);
        
        setIsTyping(true);
        setIsDialogueEnding(true); 
    } catch(e) {
        console.error(e);
        setCurrentDialogue({ speaker: activeCharacter.name, text: `*(${activeCharacter.name}点了点头)* 我去${targetSceneName}了，回见。` });
        setIsTyping(true);
        setIsDialogueEnding(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFinalClose = () => {
      setIsDialogueMode(false);
      setIsDialogueEnding(false);
      setActiveCharacter(null);
      setClothingState('default');
      // [角色主动结束对话] 重置好感度累计
      setSessionAffinityTotal(0);
  };

  const generateAmbientLine = async (char: Character, state: ClothingState, sceneId: string) => {
      if (!settings.apiConfig.apiKey) {
          setAmbientText("......");
          return;
      }

      setIsAmbientLoading(true);
      try {
          // 加载角色记忆以增强环境台词的连续性
          const memoryContext = await aiMemory.getMemoryContext(char.id);
          
          await initLLM(char);
          
          const stats = characterStats[char.id] || { level: 1, affinity: 0 };
          let prompt = "";

          if (sceneId === 'scen_7') {
              prompt = `
[系统指令: 此消息仅生成环境氛围台词]
你现在正在温泉里泡澡，非常放松。
你没有注意到玩家(${settings.userName})的到来，正在自言自语。
请结合当前的舒适环境，生成一句简短的、符合你性格的自言自语。
不要与玩家对话，不要使用第二人称。
`;
          } else {
              prompt = `
[系统指令: 此消息仅生成环境氛围台词]
你目前身处【${worldState.sceneName}】，时间是【${worldState.periodLabel}】，天气【${worldState.weather}】。
玩家(${settings.userName})刚刚进入这个场景，但还没有和你搭话。
当前你对玩家的好感度为: ${stats.affinity}。
请根据你的性格、当前时间、地点和心情，生成一句简短的“闲聊”或“自言自语”。
或者是注意到玩家进来后的一句简单的招呼（如果是外向性格）。
`;
          }

          // 增强 prompt，加入角色记忆上下文
          const enhancedPrompt = aiMemory.buildEnhancedPrompt(prompt, memoryContext);
          const response = await llmService.sendMessage(enhancedPrompt);
          let text = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
          setAmbientText(text);
          
          if (response.emotion) {
              const sprite = getCharacterSprite(char, state, response.emotion);
              setCurrentSprite(sprite);
          }

      } catch (e) {
          console.error("Ambient Gen Error", e);
          setAmbientText("......");
      } finally {
          setIsAmbientLoading(false);
      }
  };

  return {
      isDialogueMode, setIsDialogueMode,
      activeCharacter, setActiveCharacter,
      clothingState, setClothingState,
      inputText, setInputText,
      isLoading, setIsLoading,
      currentDialogue, setCurrentDialogue,
      currentSprite, setCurrentSprite,
      isTyping, setIsTyping,
      errorMessage, setErrorMessage,
      history, setHistory,
      debugLogs, setDebugLogs,
      isDialogueEnding, setIsDialogueEnding,
      lastAffinityChange,
      sessionAffinityTotal, // [角色主动结束对话] 导出好感度累计
      
      ambientCharacter, setAmbientCharacter,
      ambientText, setAmbientText,
      isAmbientLoading, setIsAmbientLoading,
      isAmbientSleeping, setIsAmbientSleeping,
      isAmbientBathing, setIsAmbientBathing,
      showAmbientDialogue, setShowAmbientDialogue,

      handleEnterDialogue,
      handleSend,
      handleRegenerate,
      handleEndDialogueGeneration,
      handleEndDialogueGenerationWithMove, // [角色移动系统] 导出移动时的对话结束函数
      handleFinalClose,
      generateAmbientLine
  };
};
