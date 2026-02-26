import { useState, useRef, useEffect } from 'react';
import { 
    Character, ClothingState, DialogueEntry, GameSettings, WorldState, LogEntry, CharacterUnlocks 
} from '../types';
import { llmService } from '../services/llmService';
import { USER_INFO_TEMPLATE, generateSystemPrompt, CHARACTERS } from '../data/scenarioData';
import { getCharacterSprite } from '../utils/gameLogic';
import { SCENE_NAMES } from '../utils/gameConstants';
import { getDefaultUnlocks } from '../data/unlockConditions';
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
  // AI 璁板繂绯荤粺
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
  
  // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 璺熻釜褰撳墠瀵硅瘽涓殑濂芥劅搴︾疮璁″彉鍖?  const [sessionAffinityTotal, setSessionAffinityTotal] = useState<number>(0);

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
    
    let systemPrompt = generateSystemPrompt(char, dynamicUserInfo, settings.innName, settings.enableNSFW, unlocks, stats.affinity, settings.isBloodRelated);
    systemPrompt = systemPrompt.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
    
    // 鍔犺浇瑙掕壊璁板繂骞跺寮?System Prompt
    const memoryContext = await aiMemory.getMemoryContext(char.id);
    const enhancedPrompt = aiMemory.buildEnhancedPrompt(systemPrompt, memoryContext);
    
    // 娣诲姞 update_memory 瀛楁鐨勮鏄?    const memoryInstruction = `\n\n銆愯蹇嗘彁鍙栨寚浠ゃ€慭n"update_memory": [鍙€塢 瀛楃涓叉暟缁勩€傚鏋滀綘鍦ㄥ璇濅腑寰楃煡浜嗗叧浜庣帺瀹剁殑閲嶈淇℃伅銆佸枩濂姐€佺害瀹氭垨鎵胯锛岃灏嗗畠浠綔涓虹畝鐭殑浜嬪疄鎻愬彇鍑烘潵銆俓n渚嬪锛歔"鐜╁鍠滄鍠濋害閰?, "绾﹀畾浜嗘槑澶╀竴璧峰幓娓╂硥"]銆傚鏋滄病鏈夐噸瑕佷俊鎭紝璇蜂笉瑕佽緭鍑烘瀛楁銆俙;
    
    const fullPrompt = `${enhancedPrompt}${memoryInstruction}\n\n${dynamicUserInfo}`;
    
    await llmService.initChat(char, fullPrompt, settings.apiConfig);
  };

  const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    const char = CHARACTERS[characterId];
    if (!char) return;

    // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 閲嶇疆瀵硅瘽浼氳瘽鐨勫ソ鎰熷害绱
    setSessionAffinityTotal(0);

    let nextClothingState: ClothingState = 'default';
    if (
        (actionType.includes('peep') || actionType.includes('bath')) || 
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
            
            let contextPrompt = `
[绯荤粺鎸囦护: 姝ゆ秷鎭笉鏄剧ず缁欑帺瀹讹紝浠呬綔涓哄墽鎯呯敓鎴愭寚浠
鐜╁(${settings.userName})鍦ㄣ€?{worldState.periodLabel}銆戠殑銆?{worldState.sceneName}銆戞壘鍒颁簡浣犮€?鐜╁褰撳墠鐨勮鍔ㄦ剰鍥炬槸:銆?{actionType}銆戙€?褰撳墠浣犲鐜╁鐨勫ソ鎰熷害涓? ${stats.affinity} (0-100)銆?浣犵殑琛ｇ潃鐘舵€佹槸: ${nextClothingState === 'nude' ? '瑁镐綋/鏈┛琛? : '鏃ュ父瑁呮潫'}銆?`;
            
            // 娣诲姞闂存帴鎬ц涓虹殑鐢熸垚鍐呭瑕佺礌
            if (actionType === 'bath_together_passionate' || actionType === 'massage_receive_passionate') {
                contextPrompt += `
[鍐呭瑕佺礌: 闂存帴鎬ц涓篯
鍦ㄨ繖娆′簰鍔ㄤ腑锛屽彲鑳戒細鍖呭惈浜插惢銆佺埍鎶氱瓑浜插瘑琛屼负銆傝鏍规嵁浣犵殑鎬ф牸鍜屽綋鍓嶅ソ鎰熷害锛岃嚜鐒跺湴琛ㄧ幇鍑虹浉搴旂殑鍙嶅簲锛屽寘鎷韩浣撶殑鎺ヨЕ銆佹儏鎰熺殑琛ㄨ揪绛夈€?`;
            }
            
            contextPrompt += `
璇锋牴鎹綘鐨勬€ф牸銆佸綋鍓嶆椂闂淬€佸湴鐐广€佸ソ鎰熷害浠ュ強鐜╁鐨勮涓猴紝鐢熸垚涓€鍙ョ鍚堟儏澧冪殑寮€鍦虹櫧鎴栧弽搴斻€?涓嶉渶瑕佹坊鍔犱换浣曠郴缁熷墠缂€锛岀洿鎺ヨ緭鍑鸿鑹茬殑鍙拌瘝鍜屽姩浣滄弿鍐欍€?`;
            const response = await llmService.sendMessage(contextPrompt);
            const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);

            // 淇濆瓨寮€鍦虹櫧鍒拌亰澶╄褰?            await aiMemory.saveMessage(char.id, 'assistant', displayText);

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
            setErrorMessage("瑙掕壊鍒濆鍖栧け璐?);
            setCurrentDialogue({ speaker: char.name, text: `*(${char.name}鐪嬬潃浣?* ...鏈変粈涔堜簨鍚楋紵` });
        } finally {
            setIsLoading(false);
        }
    } else {
        setCurrentDialogue({ speaker: char.name, text: `*(${char.name}浼间箮姝ｅ湪鍙戝憜)* ...` });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !activeCharacter) return;
    if (!settings.apiConfig.apiKey) {
        setErrorMessage("璇烽厤缃?API Key銆?);
        return;
    }

    const userMessage = inputText;
    setInputText('');
    setIsLoading(true);
    setHistory(prev => [...prev, { speaker: settings.userName, text: userMessage, timestamp: Date.now(), type: 'user', avatarUrl: 'img/face/1.png' }]);

    try {
      const contextBlock = `\n[褰撳墠鐜]\n鍦烘櫙: ${worldState.sceneName}\n鏃堕棿: ${worldState.timeStr}\n琛ｇ潃: ${clothingState}\n`;
      const enrichedMessage = `${contextBlock}\n鐢ㄦ埛鍙戣█: "${userMessage}"`;
      
      const response = await llmService.sendMessage(enrichedMessage);
      const displayText = response.text.replace(/{{user}}/g, settings.userName).replace(/{{home}}/g, settings.innName);
      
      // 淇濆瓨鐢ㄦ埛娑堟伅鍜?AI 鍥炲鍒拌亰澶╄褰?      await aiMemory.saveMessage(activeCharacter.id, 'user', userMessage);
      await aiMemory.saveMessage(activeCharacter.id, 'assistant', displayText);
      
      // 濡傛灉 AI 鎻愬彇浜嗘柊鐨勬牳蹇冭蹇嗭紝淇濆瓨鍒版暟鎹簱
      if (response.update_memory && response.update_memory.length > 0) {
          console.log('[AI Memory] Extracted memories:', response.update_memory);
          await aiMemory.saveMemories(activeCharacter.id, response.update_memory, 'core_fact');
      }
      
      // 闈欓粯瑙﹀彂鎽樿鍘嬬缉锛堜笉闃诲 UI锛?      aiMemory.triggerSummaryIfNeeded(activeCharacter.id).catch(err => {
          console.error('[AI Memory] Summary trigger failed:', err);
      });
      
      setCurrentDialogue({ speaker: activeCharacter.name, text: displayText });
      
      if (response.items && response.items.length > 0) {
          onItemsGained(response.items);
      }

      if (response.affinity_change && activeCharacter) {
          // [濂芥劅搴︿笂闄怾 妫€鏌ユ槸鍚﹀凡杈惧埌姝ｉ潰濂芥劅搴︾疮璁′笂闄?          const shouldApplyChange = response.affinity_change < 0 || sessionAffinityTotal < 10;
          
          if (shouldApplyChange) {
              onAffinityChange(activeCharacter.id, response.affinity_change);
              setLastAffinityChange(response.affinity_change);
              // 娓呴櫎鍙樺寲鎸囩ず鍣?              setTimeout(() => setLastAffinityChange(undefined), 2500);
              
              // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 绱濂芥劅搴﹀彉鍖?              const newTotal = sessionAffinityTotal + response.affinity_change;
              setSessionAffinityTotal(newTotal);
              
              // 濡傛灉绱濂芥劅搴﹀彉鍖?<= -10 涓斾笉鍦?bondage 鐘舵€侊紝瑙掕壊涓诲姩缁撴潫瀵硅瘽
              if (newTotal <= -10 && clothingState !== 'bondage') {
                  console.log(`[瑙掕壊涓诲姩缁撴潫瀵硅瘽] 濂芥劅搴︾疮璁? ${newTotal}, 瑙﹀彂寮哄埗缁撴潫`);
                  // 寤惰繜瑙﹀彂锛岃褰撳墠娑堟伅鏄剧ず瀹屾瘯
                  setTimeout(() => {
                      handleEndDialogueGeneration();
                  }, 1000);
              }
          } else {
              console.log(`[濂芥劅搴︿笂闄怾 褰撳墠绱: ${sessionAffinityTotal}, 蹇界暐姝ｉ潰鍙樺寲: +${response.affinity_change}`);
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
          // [瑙掕壊绉诲姩绯荤粺] 褰撹鑹插喅瀹氱Щ鍔ㄥ満鏅椂锛屼富鍔ㄧ粨鏉熷璇?          console.log(`[瑙掕壊绉诲姩绯荤粺] ${activeCharacter.name} 鍐冲畾绉诲姩鍒?${response.move_to}锛屼富鍔ㄧ粨鏉熷璇漙);
          // 寤惰繜瑙﹀彂锛岃褰撳墠娑堟伅鏄剧ず瀹屾瘯
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
      setErrorMessage(`閫氫俊鏁呴殰: ${error instanceof Error ? error.message : 'Unknown Error'}`);
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
                // [濂芥劅搴︿笂闄怾 妫€鏌ユ槸鍚﹀凡杈惧埌姝ｉ潰濂芥劅搴︾疮璁′笂闄?                const shouldApplyChange = response.affinity_change < 0 || sessionAffinityTotal < 10;
                
                if (shouldApplyChange) {
                    onAffinityChange(activeCharacter.id, response.affinity_change);
                    setLastAffinityChange(response.affinity_change);
                    setTimeout(() => setLastAffinityChange(undefined), 2500);
                    
                    // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 绱濂芥劅搴﹀彉鍖?                    const newTotal = sessionAffinityTotal + response.affinity_change;
                    setSessionAffinityTotal(newTotal);
                    
                    // 濡傛灉绱濂芥劅搴﹀彉鍖?<= -10 涓斾笉鍦?bondage 鐘舵€侊紝瑙掕壊涓诲姩缁撴潫瀵硅瘽
                    if (newTotal <= -10 && clothingState !== 'bondage') {
                        console.log(`[瑙掕壊涓诲姩缁撴潫瀵硅瘽] 濂芥劅搴︾疮璁? ${newTotal}, 瑙﹀彂寮哄埗缁撴潫`);
                        setTimeout(() => {
                            handleEndDialogueGeneration();
                        }, 1000);
                    }
                } else {
                    console.log(`[濂芥劅搴︿笂闄怾 褰撳墠绱: ${sessionAffinityTotal}, 蹇界暐姝ｉ潰鍙樺寲: +${response.affinity_change}`);
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
                // [瑙掕壊绉诲姩绯荤粺] 褰撹鑹插喅瀹氱Щ鍔ㄥ満鏅椂锛屼富鍔ㄧ粨鏉熷璇?                console.log(`[瑙掕壊绉诲姩绯荤粺] ${activeCharacter.name} 鍐冲畾绉诲姩鍒?${response.move_to}锛屼富鍔ㄧ粨鏉熷璇漙);
                // 寤惰繜瑙﹀彂锛岃褰撳墠娑堟伅鏄剧ず瀹屾瘯
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
         setErrorMessage("閲嶇敓鎴愬け璐?);
     } finally {
         setIsLoading(false);
     }
  };

  const handleEndDialogueGeneration = async () => {
    if (isLoading || isDialogueEnding || !activeCharacter) return;
    
    const stats = characterStats[activeCharacter.id] || { level: 1, affinity: 0 };
    setIsLoading(true);

    try {
        // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 鍒ゆ柇鏄惁涓鸿鑹蹭富鍔ㄧ粨鏉?        const isCharacterInitiated = sessionAffinityTotal <= -10 && clothingState !== 'bondage';
        
        let contextPrompt = '';
        if (isCharacterInitiated) {
            // 瑙掕壊鍥犳伡鎬掍富鍔ㄧ粨鏉熷璇?            contextPrompt = `
[绯荤粺鎸囦护: 姝ゆ秷鎭笉鏄剧ず缁欑帺瀹讹紝浠呬綔涓虹郴缁熸寚浠
浣犲洜涓虹帺瀹剁殑瑷€琛屾劅鍒伴潪甯镐笉婊″拰鎭兼€掞紝鍐冲畾涓诲姩缁撴潫杩欐瀵硅瘽銆?褰撳墠鍦烘櫙銆?{worldState.sceneName}銆戙€佹椂闂淬€?{worldState.periodLabel}銆戙€佸ソ鎰熷害(${stats.affinity})銆?鍦ㄨ繖娆″璇濅腑锛屼綘鐨勫ソ鎰熷害绱涓嬮檷浜?${Math.abs(sessionAffinityTotal)} 鐐广€?璇锋牴鎹垰鎵嶇殑瀵硅瘽鍐呭鍜屼綘褰撳墠鐨勬儏缁姸鎬侊紙鐢熸皵銆佸け鏈涖€佸帉鐑︾瓑锛夛紝鐢熸垚涓€鍙ョ畝鐭絾鏄庣‘琛ㄨ揪涓嶆弧鐨勫憡鍒銆?浣犵殑鍙拌瘝搴旇浣撶幇鍑轰綘涓诲姩缁撴潫瀵硅瘽鐨勬剰鍥撅紝鑰屼笉鏄鍔ㄥ憡鍒€?涓嶉渶瑕佹坊鍔犱换浣曠郴缁熷墠缂€锛岀洿鎺ヨ緭鍑鸿鑹茬殑鍙拌瘝鍜屽姩浣滄弿鍐欍€?`;
        } else {
            // 鐜╁涓诲姩缁撴潫瀵硅瘽
            contextPrompt = `
[绯荤粺鎸囦护: 姝ゆ秷鎭笉鏄剧ず缁欑帺瀹讹紝浠呬綔涓虹郴缁熸寚浠
鐜╁鍐冲畾缁撴潫褰撳墠鐨勫璇濈寮€銆?璇锋牴鎹綋鍓嶅満鏅€?{worldState.sceneName}銆戙€佹椂闂淬€?{worldState.periodLabel}銆戙€佸ソ鎰熷害(${stats.affinity})浠ュ強鍒氭墠鐨勫璇濇皼鍥达紝鐢熸垚涓€鍙ョ畝鐭嚜鐒剁殑鍛婂埆璇€?涓嶉渶瑕佹坊鍔犱换浣曠郴缁熷墠缂€锛岀洿鎺ヨ緭鍑鸿鑹茬殑鍙拌瘝鍜屽姩浣滄弿鍐欍€?`;
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
             displayText = `*(${activeCharacter.name}寰瑧鐫€鎸ヤ簡鎸ユ墜)* 涓嬫瑙併€俙;
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
        setCurrentDialogue({ speaker: activeCharacter.name, text: `*(${activeCharacter.name}鐐逛簡鐐瑰ご)* 鍥炶銆俙 });
        setIsTyping(true);
        setIsDialogueEnding(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEndDialogueGenerationWithMove = async (targetSceneId: string) => {
    if (isLoading || isDialogueEnding || !activeCharacter) return;
    
    const stats = characterStats[activeCharacter.id] || { level: 1, affinity: 0 };
    const targetSceneName = SCENE_NAMES[targetSceneId as any] || '鏈煡鍦烘櫙';
    setIsLoading(true);

    try {
        // [瑙掕壊绉诲姩绯荤粺] 瑙掕壊鍐冲畾绉诲姩鍦烘櫙锛岀敓鎴愬寘鍚洰鏍囧満鏅殑鍛婂埆璇?        const contextPrompt = `
[绯荤粺鎸囦护: 姝ゆ秷鎭笉鏄剧ず缁欑帺瀹讹紝浠呬綔涓虹郴缁熸寚浠
浣犲喅瀹氫富鍔ㄧ粨鏉熷綋鍓嶅璇濆苟鍓嶅線 ${targetSceneName}銆?褰撳墠鍦烘櫙銆?{worldState.sceneName}銆戙€佹椂闂淬€?{worldState.periodLabel}銆戙€佸ソ鎰熷害(${stats.affinity})銆?璇锋牴鎹垰鎵嶇殑瀵硅瘽鍐呭鍜屼綘褰撳墠鐨勬儏缁姸鎬侊紝鐢熸垚涓€鍙ョ畝鐭絾鏄庣‘琛ㄨ揪浣犺鍓嶅線 ${targetSceneName} 鐨勫憡鍒銆?浣犵殑鍙拌瘝搴旇鑷劧娴佺晠锛屼綋鐜板嚭浣犲嵆灏嗙寮€鐨勬剰鍥撅紝骞朵笖鏄庣‘鎻愬埌浣犺鍘荤殑鍦版柟銆?涓嶉渶瑕佹坊鍔犱换浣曠郴缁熷墠缂€锛岀洿鎺ヨ緭鍑鸿鑹茬殑鍙拌瘝鍜屽姩浣滄弿鍐欍€?`;
        
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
             displayText = `*(${activeCharacter.name}寰瑧鐫€鎸ヤ簡鎸ユ墜)* 鎴戣鍘?{targetSceneName}浜嗭紝涓嬫瑙併€俙;
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
        setCurrentDialogue({ speaker: activeCharacter.name, text: `*(${activeCharacter.name}鐐逛簡鐐瑰ご)* 鎴戝幓${targetSceneName}浜嗭紝鍥炶銆俙 });
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
      // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 閲嶇疆濂芥劅搴︾疮璁?      setSessionAffinityTotal(0);
  };

  const generateAmbientLine = async (char: Character, state: ClothingState, sceneId: string) => {
      if (!settings.apiConfig.apiKey) {
          setAmbientText("......");
          return;
      }

      setIsAmbientLoading(true);
      try {
          // 鍔犺浇瑙掕壊璁板繂浠ュ寮虹幆澧冨彴璇嶇殑杩炵画鎬?          const memoryContext = await aiMemory.getMemoryContext(char.id);
          
          await initLLM(char);
          
          const stats = characterStats[char.id] || { level: 1, affinity: 0 };
          let prompt = "";

          if (sceneId === 'scen_7') {
              prompt = `
[绯荤粺鎸囦护: 姝ゆ秷鎭粎鐢熸垚鐜姘涘洿鍙拌瘝]
浣犵幇鍦ㄦ鍦ㄦ俯娉夐噷娉℃尽锛岄潪甯告斁鏉俱€?浣犳病鏈夋敞鎰忓埌鐜╁(${settings.userName})鐨勫埌鏉ワ紝姝ｅ湪鑷█鑷銆?璇风粨鍚堝綋鍓嶇殑鑸掗€傜幆澧冿紝鐢熸垚涓€鍙ョ畝鐭殑銆佺鍚堜綘鎬ф牸鐨勮嚜瑷€鑷銆?涓嶈涓庣帺瀹跺璇濓紝涓嶈浣跨敤绗簩浜虹О銆?`;
          } else {
              prompt = `
[绯荤粺鎸囦护: 姝ゆ秷鎭粎鐢熸垚鐜姘涘洿鍙拌瘝]
浣犵洰鍓嶈韩澶勩€?{worldState.sceneName}銆戯紝鏃堕棿鏄€?{worldState.periodLabel}銆戯紝澶╂皵銆?{worldState.weather}銆戙€?鐜╁(${settings.userName})鍒氬垰杩涘叆杩欎釜鍦烘櫙锛屼絾杩樻病鏈夊拰浣犳惌璇濄€?褰撳墠浣犲鐜╁鐨勫ソ鎰熷害涓? ${stats.affinity}銆?璇锋牴鎹綘鐨勬€ф牸銆佸綋鍓嶆椂闂淬€佸湴鐐瑰拰蹇冩儏锛岀敓鎴愪竴鍙ョ畝鐭殑鈥滈棽鑱娾€濇垨鈥滆嚜瑷€鑷鈥濄€?鎴栬€呮槸娉ㄦ剰鍒扮帺瀹惰繘鏉ュ悗鐨勪竴鍙ョ畝鍗曠殑鎷涘懠锛堝鏋滄槸澶栧悜鎬ф牸锛夈€?`;
          }

          // 澧炲己 prompt锛屽姞鍏ヨ鑹茶蹇嗕笂涓嬫枃
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
      sessionAffinityTotal, // [瑙掕壊涓诲姩缁撴潫瀵硅瘽] 瀵煎嚭濂芥劅搴︾疮璁?      
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
      handleEndDialogueGenerationWithMove, // [瑙掕壊绉诲姩绯荤粺] 瀵煎嚭绉诲姩鏃剁殑瀵硅瘽缁撴潫鍑芥暟
      handleFinalClose,
      generateAmbientLine
  };
};

