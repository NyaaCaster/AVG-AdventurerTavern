
import { useState, useRef, useEffect } from 'react';
import { 
    Character, ClothingState, DialogueEntry, GameSettings, WorldState, LogEntry, CharacterUnlocks, SceneId, CharacterStat 
} from '../types';
import { llmService } from '../services/llmService';
import { USER_INFO_TEMPLATE, generateSystemPrompt, CHARACTERS } from '../data/scenarioData';
import { getCharacterSprite } from '../utils/gameLogic';
import { SCENE_NAMES } from '../utils/gameConstants';
import { getDefaultUnlocks } from '../data/unlockConditions';
import { updateCharacterUnlocks as updateCharacterUnlocksDB } from '../services/db';
import { useAIMemory } from './useAIMemory';
import { PLAYER_AVATAR_URL } from '../data/resources/characterImageResources';
import { applyPlayerTextTemplate, resolveCharacterDisplayName } from '../utils/playerText';

interface UseDialogueSystemProps {
    settings: GameSettings;
    worldState: WorldState;
    characterStats: Record<string, CharacterStat>;
    characterUnlocks: Record<string, CharacterUnlocks>;
    userId: number;
    currentSlotId: number;
    onItemsGained: (items: { id: string; count: number }[]) => void;
    onCharacterMove: (charId: string, targetId: SceneId) => void;
    onAffinityChange: (charId: string, change: number) => void;
    onUnlockUpdate: (charId: string, unlockKey: keyof CharacterUnlocks) => void;
    onSkillLearned: (characterId: string) => Promise<{ skillId: number; skillName: string; characterName: string } | null>;
}

export const useDialogueSystem = ({ 
    settings, worldState, characterStats, characterUnlocks, userId, currentSlotId, onItemsGained, onCharacterMove, onAffinityChange, onUnlockUpdate, onSkillLearned 
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
  
  // [技能学习系统] 跟踪当前对话中是否已习得技能（每次对话最多一个）
  const [sessionLearnedSkill, setSessionLearnedSkill] = useState<boolean>(false);

  // Subscribe to LLM logs
  useEffect(() => {
    const unsubscribe = llmService.subscribeLogs((logs) => {
        setDebugLogs([...logs]); 
    });
    return () => unsubscribe();
  }, []);

  const getSpeakerName = (character: Character) => resolveCharacterDisplayName(character.name, settings.userName);

  const formatTemplateText = (text: string) => {
      return applyPlayerTextTemplate(text, {
          userName: settings.userName,
          innName: settings.innName,
          isBloodRelated: settings.isBloodRelated
      });
  };

  const initLLM = async (char: Character) => {
    const dynamicUserInfo = formatTemplateText(USER_INFO_TEMPLATE);
    
    // Get character unlocks or use default
    const unlocks = characterUnlocks[char.id] || getDefaultUnlocks();
    
    // Get current affinity
    const stats = characterStats[char.id] || { level: 1, affinity: 0 };
    
    let systemPrompt = generateSystemPrompt(char, dynamicUserInfo, settings.innName, settings.enableNSFW, unlocks, stats.affinity, settings.isBloodRelated);
    systemPrompt = formatTemplateText(systemPrompt);
    
    // 加载角色记忆并增强 System Prompt
    const memoryContext = await aiMemory.getMemoryContext(char.id);
    const enhancedPrompt = aiMemory.buildEnhancedPrompt(systemPrompt, memoryContext);
    
        // 添加 update_memory 字段的说明
    const memoryInstruction = `\n\n【记忆提取指令】\n"update_memory": [可选] 字符串数组。在每轮对话后，主动检查是否发生了以下事件，有则必须提取：\n\n最高优先级（必须记录，不可遗漏）：\n- 任何形式的性行为（口交、手交、性交、肛交等），须记录发生的场景、时间和双方情感状态\n- 亲密里程碑：初吻、第一次拥抱、第一次爱抚、第一次裸体相处等\n- 关系确立：成为恋人、成为性伴侣、特殊身份约定等\n\n普通优先级（重要时记录）：\n- 玩家的重要偏好或习惯，例如："${settings.userName}喜欢喝麦酒"\n- 双方的约定或承诺，例如："约定明天一起去温泉"\n- 影响关系发展的关键对话\n\n记录格式：使用第一人称，包含时间和场景背景。\n示例："在客房夜晚，我与${settings.userName}发生了第一次性行为，双方都很珍视"\n示例："在温泉，我与${settings.userName}初吻，气氛温柔亲密"\n\n如果本轮对话没有上述重要事件，请不要输出此字段。`;
    
    const fullPrompt = `${enhancedPrompt}${memoryInstruction}\n\n${dynamicUserInfo}`;
    
    await llmService.initChat(char, fullPrompt, settings.apiConfig);
  };

  const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    const char = CHARACTERS[characterId];
    if (!char) return;

    // [角色主动结束对话] 重置对话会话的好感度累计
    setSessionAffinityTotal(0);
    
    // [技能学习系统] 重置对话会话的技能学习状态
    setSessionLearnedSkill(false);

    let nextClothingState: ClothingState = 'default';
    if (
        (actionType.includes('peep') || actionType.includes('bath')) || 
        (actionType === 'massage_give' || actionType === 'massage_receive') 
    ) {
        nextClothingState = 'nude';
    }
    
    setClothingState(nextClothingState);
    setActiveCharacter(char);
    
    // [BUG FIX] 确保立绘与角色ID匹配，防止显示错误的角色立绘
    const sprite = getCharacterSprite(char, nextClothingState, 'normal');
    setCurrentSprite(sprite);
    console.log(`[对话系统] 进入对话 - 角色: ${char.name} (${char.id}), 立绘: ${sprite}`);
    setCurrentDialogue({ speaker: getSpeakerName(char), text: "..." });
    setIsDialogueMode(true);
    setIsDialogueEnding(false);
    
    const stats = characterStats[characterId] || { level: 1, affinity: 0 };
    
        if (settings.apiConfig.apiKey) {
        setIsLoading(true);
        try {
            await initLLM(char);

            // [角色移动系统] 检查核心记忆中是否有关于移动到当前场景的约定
            const memoryContextForInit = await aiMemory.getMemoryContext(char.id);
            const moveRelatedMemory = memoryContextForInit.coreMemories.find(m =>
                m.content.includes(worldState.sceneName) &&
                (m.content.includes('前往') || m.content.includes('同意') || m.content.includes('邀请'))
            );
            
            let contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为剧情生成指令]
玩家(${settings.userName})在【${worldState.periodLabel}】的【${worldState.sceneName}】找到了你。
玩家当前的行动意图是:【${actionType}】。
当前你对玩家的好感度为: ${stats.affinity} (0-100)。
你的衣着状态是: ${nextClothingState === 'nude' ? '裸体/未穿衣' : '日常装束'}。
`;
            // [角色移动系统] 如果有移动约定，追加背景提示
            if (moveRelatedMemory) {
                contextPrompt += `
[重要背景] ${moveRelatedMemory.content}。
你是主动来到这里等待玩家的，这次相遇在你的预期之内，请表现出符合约定背景的自然反应，不要表现出惊讶或疑惑。
`;
            }
            
            // 添加间接性行为的生成内容要素
            if (actionType === 'bath_together_passionate' || actionType === 'massage_receive_passionate') {
                contextPrompt += `
[内容要素: 间接性行为]
在这次互动中，可能会包含亲吻、爱抚等亲密行为。请根据你的性格和当前好感度，自然地表现出相应的反应，包括身体的接触、情感的表达等。
`;
            }
            
            contextPrompt += `
请根据你的性格、当前时间、地点、好感度以及玩家的行为，生成一句符合情境的开场白或反应。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
            const response = await llmService.sendMessage(contextPrompt);
            const displayText = formatTemplateText(response.text);

            // 保存开场白到聊天记录
            await aiMemory.saveMessage(char.id, 'assistant', displayText);

            setCurrentDialogue({ speaker: getSpeakerName(char), text: displayText });
            setHistory(prev => [...prev, { 
                speaker: getSpeakerName(char), text: displayText, timestamp: Date.now(), 
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
            setCurrentDialogue({ speaker: getSpeakerName(char), text: `*(${getSpeakerName(char)}看着你)* ...有什么事吗？` });
        } finally {
            setIsLoading(false);
        }
    } else {
        setCurrentDialogue({ speaker: getSpeakerName(char), text: `*(${getSpeakerName(char)}似乎正在发呆)* ...` });
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
    setHistory(prev => [...prev, { speaker: settings.userName, text: userMessage, timestamp: Date.now(), type: 'user', avatarUrl: PLAYER_AVATAR_URL }]);

    try {
      const contextBlock = `\n[当前环境]\n场景: ${worldState.sceneName}\n时间: ${worldState.timeStr}\n衣着: ${clothingState}\n`;
      const enrichedMessage = `${contextBlock}\n用户发言: "${userMessage}"`;
      
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = formatTemplateText(response.text);
      
            // 保存用户消息和 AI 回复到聊天记录
      await aiMemory.saveMessage(activeCharacter.id, 'user', userMessage);
      await aiMemory.saveMessage(activeCharacter.id, 'assistant', displayText);
      
            // 如果 AI 提取了新的核心记忆，保存到数据库
      if (response.update_memory && response.update_memory.length > 0) {
          console.log('[AI Memory] Extracted memories:', response.update_memory);
          await aiMemory.saveMemories(activeCharacter.id, response.update_memory, 'core_fact');
      }

      // [亲密行为记忆] 当衣着变为 nude 且好感度为正时，主动强制写入亲密事件记忆
      // 防止 AI 漏提取性行为/亲密行为这类关键事件
      const newClothingFromResponse = response.clothing?.toLowerCase();
      const isIntimacyOccurred = newClothingFromResponse === 'nude' || clothingState === 'nude';
      const hasPositiveAffinity = response.affinity_change && response.affinity_change > 0;
      if (isIntimacyOccurred && hasPositiveAffinity && settings.enableNSFW) {
          const alreadyCaptured = response.update_memory && response.update_memory.length > 0;
          if (!alreadyCaptured) {
              const intimacyMemory = `${worldState.periodLabel}，在${worldState.sceneName}，我与${settings.userName}发生了亲密互动（好感度+${response.affinity_change}）`;
              await aiMemory.saveMemories(activeCharacter.id, [intimacyMemory], 'core_fact');
              console.log('[AI Memory] 主动写入亲密行为记忆:', intimacyMemory);
          }
      }
      
      // 静默触发摘要压缩（不阻塞 UI）
      aiMemory.triggerSummaryIfNeeded(activeCharacter.id).catch(err => {
          console.error('[AI Memory] Summary trigger failed:', err);
      });

      // [角色移动系统] 检测到移动指令，跳过正常回复直接进入告别流程
      if (response.move_to) {
          const moveTarget = response.move_to;
          onCharacterMove(activeCharacter.id, moveTarget);
          console.log(`[角色移动系统] ${activeCharacter.name} 决定移动到 ${moveTarget}，直接进入告别流程`);
          handleEndDialogueGenerationWithMove(moveTarget);
          return;
      }

      if (response.items && response.items.length > 0) {
          onItemsGained(response.items);
      }

      let shouldTriggerAngryEnd = false;
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
              
              // 如果累计好感度变化 <= -10 且不在 bondage 状态，标记触发愤怒结束
              if (newTotal <= -10 && clothingState !== 'bondage') {
                  console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 直接进入告别流程`);
                  shouldTriggerAngryEnd = true;
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

      // [角色主动结束对话] 跳过正常回复直接进入愤怒告别流程
      if (shouldTriggerAngryEnd) {
          handleEndDialogueGeneration();
          return;
      }

      setCurrentDialogue({ speaker: getSpeakerName(activeCharacter), text: displayText });

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

      // [技能学习系统] 处理玩家从角色处习得技能
      if (response.learned_skill && activeCharacter && !sessionLearnedSkill) {
          const { character_id } = response.learned_skill;
          
          // 支持两种格式：角色ID（char_xxx）或角色名
          const isValidCharacter = character_id === activeCharacter.id || 
              character_id.toLowerCase() === activeCharacter.id.toLowerCase() ||
              character_id.toLowerCase() === activeCharacter.name?.toLowerCase();
          
          if (isValidCharacter) {
              console.log(`[技能学习] AI 触发技能学习: 输入ID=${character_id}, 实际ID=${activeCharacter.id}`);
              const result = await onSkillLearned(activeCharacter.id);
              if (result) {
                  setSessionLearnedSkill(true);
                  console.log(`[技能学习] 玩家成功习得技能 ${result.skillName}，本次对话已锁定`);
              } else {
                  console.log(`[技能学习] 技能习得失败（可能已全部学会或无可用技能）`);
              }
          } else {
              console.log(`[技能学习] 角色ID不匹配: 输入=${character_id}, 当前角色=${activeCharacter.id}(${activeCharacter.name})`);
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
            speaker: getSpeakerName(activeCharacter), text: displayText, timestamp: Date.now(), 
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
            const displayText = formatTemplateText(response.text);
            setCurrentDialogue({ speaker: getSpeakerName(activeCharacter), text: displayText });
            setIsTyping(true);
            
            if (response.items && response.items.length > 0) onItemsGained(response.items);

                        // [角色移动系统] 检测到移动指令，跳过正常回复直接进入告别流程
            if (response.move_to) {
                const moveTarget = response.move_to;
                onCharacterMove(activeCharacter.id, moveTarget);
                console.log(`[角色移动系统] ${activeCharacter.name} 决定移动到 ${moveTarget}，直接进入告别流程`);
                handleEndDialogueGenerationWithMove(moveTarget);
                return;
            }

            let shouldTriggerAngryEnd = false;
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
                    
                    if (newTotal <= -10 && clothingState !== 'bondage') {
                        console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 直接进入告别流程`);
                        shouldTriggerAngryEnd = true;
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

            // [角色主动结束对话] 跳过正常回复直接进入愤怒告别流程
            if (shouldTriggerAngryEnd) {
                handleEndDialogueGeneration();
                return;
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
                    speaker: getSpeakerName(activeCharacter), text: displayText, timestamp: Date.now(),
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
            displayText = formatTemplateText(response.text);
            tokensUsed = response.usage?.completion_tokens || 0;
            if (response.emotion) {
                const emotionSprite = getCharacterSprite(activeCharacter, clothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
        } else {
             displayText = `*(${getSpeakerName(activeCharacter)}微笑着挥了挥手)* 下次见。`;
        }

        // [角色主动结束对话] 将告别语保存到记忆数据库
        await aiMemory.saveMessage(activeCharacter.id, 'assistant', displayText);

        setCurrentDialogue({ speaker: getSpeakerName(activeCharacter), text: displayText });
        setHistory(prev => [...prev, { 
            speaker: getSpeakerName(activeCharacter), text: displayText, timestamp: Date.now(), 
            type: 'npc', avatarUrl: activeCharacter.avatarUrl, tokens: tokensUsed
        }]);
        
        setIsTyping(true);
        setIsDialogueEnding(true); 
    } catch(e) {
        console.error(e);
        setCurrentDialogue({ speaker: getSpeakerName(activeCharacter), text: `*(${getSpeakerName(activeCharacter)}点了点头)* 回见。` });
        setIsTyping(true);
        setIsDialogueEnding(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEndDialogueGenerationWithMove = async (targetSceneId: SceneId) => {
    if (isLoading || isDialogueEnding || !activeCharacter) return;
    
    const stats = characterStats[activeCharacter.id] || { level: 1, affinity: 0 };
    const targetSceneName = SCENE_NAMES[targetSceneId] || '未知场景';
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
            displayText = formatTemplateText(response.text);
            tokensUsed = response.usage?.completion_tokens || 0;
            if (response.emotion) {
                const emotionSprite = getCharacterSprite(activeCharacter, clothingState, response.emotion);
                setCurrentSprite(emotionSprite);
            }
        } else {
             displayText = `*(${getSpeakerName(activeCharacter)}微笑着挥了挥手)* 我要去${targetSceneName}了，下次见。`;
        }

                // [角色移动系统] 将告别语保存到记忆数据库
        await aiMemory.saveMessage(activeCharacter.id, 'assistant', displayText);

        // [角色移动系统] 主动写入核心记忆，记录本次移动约定
        // 这样角色在目标场景与玩家重新开始对话时，能清楚地记得「我们是约好一起来这里的」
        const moveMemory = `${worldState.periodLabel}，${settings.userName}邀请我前往${targetSceneName}，我同意并已前往该场景等待`;
        await aiMemory.saveMemories(activeCharacter.id, [moveMemory], 'core_fact');
        console.log(`[角色移动系统] 已将移动记忆写入数据库: ${moveMemory}`);

        setCurrentDialogue({ speaker: getSpeakerName(activeCharacter), text: displayText });
        setHistory(prev => [...prev, { 
            speaker: getSpeakerName(activeCharacter), text: displayText, timestamp: Date.now(), 
            type: 'npc', avatarUrl: activeCharacter.avatarUrl, tokens: tokensUsed
        }]);
        
        setIsTyping(true);
        setIsDialogueEnding(true); 
    } catch(e) {
        console.error(e);
        setCurrentDialogue({ speaker: getSpeakerName(activeCharacter), text: `*(${getSpeakerName(activeCharacter)}点了点头)* 我去${targetSceneName}了，回见。` });
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
      // [BUG FIX] 清除立绘，防止角色立绘残留
      setCurrentSprite('');
      // [角色主动结束对话] 重置好感度累计
      setSessionAffinityTotal(0);
      // [技能学习系统] 重置技能学习状态
      setSessionLearnedSkill(false);
      // 清理 llmService，防止残留上一个角色的上下文
      llmService.reset();
      console.log('[对话系统] 对话结束，已清除所有状态');
  };

  const generateAmbientLine = async (char: Character, state: ClothingState, sceneId: string) => {
      if (!settings.apiConfig.apiKey) {
          setAmbientText("......");
          return;
      }

      // [BUG FIX] 记录当前请求的角色ID，用于验证响应
      const requestCharacterId = char.id;
      console.log(`[环境台词] 开始生成 - 角色: ${char.name} (${requestCharacterId}), 场景: ${sceneId}`);
      
      setIsAmbientLoading(true);
      try {
          // 加载角色记忆（有 character_id 隔离，安全）
          const memoryContext = await aiMemory.getMemoryContext(char.id);

          const stats = characterStats[char.id] || { level: 1, affinity: 0 };
          const unlocks = characterUnlocks[char.id] || getDefaultUnlocks();
          const dynamicUserInfo = formatTemplateText(USER_INFO_TEMPLATE);

          // 构建角色专属 system prompt，不调用 initLLM，避免污染全局 llmService
          let baseSystemPrompt = generateSystemPrompt(
              char, dynamicUserInfo, settings.innName,
              settings.enableNSFW, unlocks, stats.affinity, settings.isBloodRelated
          );
          baseSystemPrompt = formatTemplateText(baseSystemPrompt);
          const enhancedSystemPrompt = aiMemory.buildEnhancedPrompt(baseSystemPrompt, memoryContext);

                    // [角色移动系统] 检查核心记忆中是否有关于移动到当前场景的约定
          const moveRelatedMemory = memoryContext.coreMemories.find(m =>
              m.content.includes(worldState.sceneName) &&
              (m.content.includes('前往') || m.content.includes('同意') || m.content.includes('邀请'))
          );
          const hasMoveContext = !!moveRelatedMemory;

          let userPrompt = "";
          if (hasMoveContext) {
              // 有移动约定时，无论哪个场景都生成符合约定语境的台词
              userPrompt = `[系统指令: 此消息仅生成环境氛围台词]\n你目前身处【${worldState.sceneName}】，时间是【${worldState.periodLabel}】。\n重要背景：${moveRelatedMemory!.content}，你是按照约定来到这里的，知道${settings.userName}会来找你。\n${settings.userName}刚刚进入场景，请用符合你性格的方式打招呼，体现出你们之间已有约定的亲切感。\n不要表现出惊讶，不要说"你怎么来了"之类的话，而是自然地迎接对方。`;
          } else if (sceneId === 'scen_7') {
              userPrompt = `[系统指令: 此消息仅生成环境氛围台词]\n你现在正在温泉里泡澡，非常放松。\n你没有注意到玩家(${settings.userName})的到来，正在自言自语。\n请结合当前的舒适环境，生成一句简短的、符合你性格的自言自语。\n不要与玩家对话，不要使用第二人称。`;
          } else {
              userPrompt = `[系统指令: 此消息仅生成环境氛围台词]\n你目前身处【${worldState.sceneName}】，时间是【${worldState.periodLabel}】，天气【${worldState.weather}】。\n玩家(${settings.userName})刚刚进入这个场景，但还没有和你搭话。\n当前你对玩家的好感度为: ${stats.affinity}。\n请根据你的性格、当前时间、地点和心情，生成一句简短的"闲聊"或"自言自语"。\n或者是注意到玩家进来后的一句简单的招呼（如果是外向性格）。`;
          }

          // 直接发起一次性 API 请求，完全不触碰全局 llmService，杜绝角色窜台
          const cfg = settings.apiConfig;
          let ambientEndpoint = "";
          switch (cfg.provider) {
              case 'google':   ambientEndpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'; break;
              case 'openai':   ambientEndpoint = 'https://api.openai.com/v1/chat/completions'; break;
              case 'deepseek': ambientEndpoint = 'https://api.deepseek.com/chat/completions'; break;
              default:         ambientEndpoint = `${(cfg.baseUrl || '').replace(/\/$/, '')}/chat/completions`;
          }

          const ambientPayload: any = {
              model: cfg.model,
              messages: [
                  {
                      role: 'system',
                      content: enhancedSystemPrompt + "\n\nIMPORTANT: Respond strictly in valid JSON format with keys 'text', 'emotion'. Do not use Markdown code blocks."
                  },
                  { role: 'user', content: userPrompt }
              ],
              temperature: 0.9
          };
          if (cfg.provider === 'openai' || cfg.provider === 'google') {
              ambientPayload.response_format = { type: "json_object" };
          }

          const ambientRes = await fetch(ambientEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
              body: JSON.stringify(ambientPayload)
          });
          if (!ambientRes.ok) throw new Error(`Ambient API Error: ${ambientRes.status}`);

          const ambientData = await ambientRes.json();
          const raw = ambientData.choices?.[0]?.message?.content || '{"text":"......","emotion":"normal"}';

          let parsed: { text?: string; emotion?: string } = {};
          try {
              const clean = raw.replace(/`{3}json/g, '').replace(/`{3}/g, '').trim();
              const si = clean.indexOf('{');
              const ei = clean.lastIndexOf('}');
              parsed = JSON.parse(si !== -1 && ei !== -1 ? clean.substring(si, ei + 1) : clean);
          } catch { parsed = { text: raw, emotion: 'normal' }; }

          const text = formatTemplateText(parsed.text || raw);
          
          // [BUG FIX] 验证角色ID是否匹配，防止异步请求导致的角色错乱
          if (requestCharacterId === char.id) {
              setAmbientText(text);
              console.log(`[环境台词] 生成成功 - 角色: ${char.name} (${requestCharacterId})`);

              if (parsed.emotion) {
                  const sprite = getCharacterSprite(char, state, parsed.emotion);
                  setCurrentSprite(sprite);
                  console.log(`[环境台词] 更新立绘 - ${sprite}`);
              }
          } else {
              console.warn(`[环境台词] 角色ID不匹配，丢弃响应 - 请求: ${requestCharacterId}, 当前: ${char.id}`);
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
