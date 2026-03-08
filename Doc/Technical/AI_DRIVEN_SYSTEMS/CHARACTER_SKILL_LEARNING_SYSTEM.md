# 玩家技能学习系统技术文档

## 📋 系统概述

玩家技能学习系统通过 AI 对话触发，当玩家与角色进行直接性行为并使角色达到性高潮时，玩家可以从角色处习得技能。该系统包括触发判定、技能选择、排重保护和自动存档四大核心功能。

### 核心功能

- **AI 触发判定**: AI 根据对话内容判断是否满足技能学习条件
- **技能选择逻辑**: 系统自动选择角色当前等级已解锁的第一个可学习技能
- **排重保护**: 已习得的技能不会重复获得
- **对话锁定**: 每次对话最多习得一个技能
- **自动存档**: 习得技能后立即保存到存档

---

## 🎯 设计目标

1. **奖励机制**: 通过性行为高潮奖励玩家习得技能
2. **渐进获取**: 按技能ID顺序依次习得，不能跳过
3. **排重保护**: 已习得的技能不会重复获得
4. **等级关联**: 技能获取与角色等级挂钩
5. **数据持久化**: 习得后自动保存，不丢失进度

---

## 📊 数据结构

### AI 响应格式

```typescript
interface AIResponse {
    text: string;
    emotion?: string;
    clothing?: string;
    affinity_change?: number;
    learned_skill?: boolean;  // 存在即触发，系统自动识别当前对话角色
    // ... 其他字段
}
```

**示例**:
```json
{
    "text": "不要了...啊！（身体剧烈痉挛，达到了极限）...",
    "emotion": "pleasure",
    "affinity_change": 5,
    "learned_skill": true
}
```

### 玩家已学习技能存储

**位置**: `saves` 表 → `data` JSON 字段 → `playerLearnedSkills`

```typescript
type PlayerLearnedSkills = number[];  // 技能ID数组

// 示例
playerLearnedSkills: [802, 723, 551, 552]
```

---

## 🔧 实现细节

### 1. 触发条件判定

**AI 提示词定义** (`data/systemPrompts.ts`):

```
触发条件（必须全部满足）：
1. 当前正在进行直接性行为（已解锁 accept_direct_sexual）
2. 角色达到性高潮（在对话中明确描述了高潮表现）
3. 本次对话中玩家尚未习得任何技能

直接性行为的定义：
- 仅指插入式性行为（阴道性交、肛交等）
- 即玩家的性器官进入角色体内的行为

间接性行为（不触发技能学习）：
- 亲吻、爱抚、手淫等非插入式行为
- 使用器具（如按摩棒、跳蛋等）
- 角色自慰或被手淫
- 口交、乳交等非插入式性行为
```

### 2. 技能选择逻辑

**文件**: `hooks/useCoreState.ts`

```typescript
const getCharacterLearnableSkill = useCallback((characterId: string): number | null => {
    const characterData = CHARACTERS[characterId];
    if (!characterData?.battleData?.skills) return null;

    const characterLevel = characterStats[characterId]?.level || 1;
    
    // 1. 筛选角色当前等级已解锁的技能
    const unlockedSkills = characterData.battleData.skills
        .filter(skillLearning => characterLevel >= skillLearning.level)
        .map(skillLearning => skillLearning.skillId);

    // 2. 排除玩家已习得的技能
    const learnableSkills = unlockedSkills.filter(
        skillId => !playerLearnedSkills.includes(skillId)
    );

    // 3. 返回第一个可学习的技能
    return learnableSkills.length > 0 ? learnableSkills[0] : null;
}, [characterStats, playerLearnedSkills]);
```

### 3. 对话系统集成

**文件**: `hooks/useDialogueSystem.ts`

```typescript
// 会话状态：跟踪本次对话是否已习得技能
const [sessionLearnedSkill, setSessionLearnedSkill] = useState<boolean>(false);

// 处理 AI 响应中的 learned_skill 字段
if (response.learned_skill && activeCharacter && !sessionLearnedSkill) {
    const { character_id } = response.learned_skill;
    if (character_id === activeCharacter.id) {
        console.log(`[技能学习] AI 触发技能学习: 角色ID=${character_id}`);
        const learned = await onSkillLearned(character_id);
        if (learned) {
            setSessionLearnedSkill(true);  // 锁定本次对话
            console.log(`[技能学习] 玩家成功习得技能，本次对话已锁定`);
        }
    }
}

// 对话开始时重置
const handleEnterDialogue = async (characterId: string) => {
    setSessionLearnedSkill(false);
    // ...
};

// 对话结束时重置
const handleFinalClose = () => {
    setSessionLearnedSkill(false);
    // ...
};
```

### 4. 自动存档集成

**文件**: `components/GameScene.tsx`

```typescript
const dialogue = useDialogueSystem({
    // ... 其他属性
    onSkillLearned: async (characterId: string): Promise<{ skillId: number; skillName: string; characterName: string } | null> => {
        const skillId = core.getCharacterLearnableSkill(characterId);
        if (skillId === null) {
            console.log(`[技能学习] 角色 ${characterId} 没有可学习的技能`);
            return null;
        }
        const learned = await handleLearnPlayerSkill(skillId);
        if (learned) {
            // 显示 Toast 通知
            const skillData = SKILLS.find(s => s.id === skillId);
            const skillName = skillData?.name || `技能${skillId}`;
            const characterData = CHARACTERS[characterId];
            const characterName = characterData?.name || characterId;
            console.log(`[技能学习] 玩家从角色 ${characterName} 习得技能 ${skillName}`);
            return { skillId, skillName, characterName };
        }
        return null;
    }
});

// handleLearnPlayerSkill 定义（注意使用 currentSlotId）
const handleLearnPlayerSkill = async (skillId: number): Promise<boolean> => {
    const learned = core.learnPlayerSkill(skillId);
    if (learned) {
        console.log(`[Skill] Player learned skill ${skillId}, auto-saving to slot ${currentSlotId}...`);
        await handleSaveGame(currentSlotId).catch(err => 
            console.error('Auto-save after learning skill failed:', err)
        );
    }
    return learned;
};
```

---

## 📊 数据流全景

```
玩家与角色进行插入式性行为
    ↓
角色达到性高潮
    ↓
AI 输出 learned_skill: true
    ↓
useDialogueSystem 检测到 learned_skill 字段
    ↓
检查 sessionLearnedSkill（本次对话是否已习得）
    ↓
调用 onSkillLearned(activeCharacter.id)
    ↓
getCharacterLearnableSkill(characterId)
    ├── 获取角色当前等级
    ├── 筛选已解锁技能
    ├── 排除已习得技能
    └── 返回第一个可学习技能ID
    ↓
handleLearnPlayerSkill(skillId)
    ├── 更新 playerLearnedSkills 状态
    └── 自动存档到 currentSlotId（当前存档槽位）
    ↓
显示 Toast 通知（灵魂共鸣习得）
```
    ↓
setSessionLearnedSkill(true)  // 锁定本次对话
```

---

## 🎮 使用示例

### 场景 1: 正常习得技能

```
1. 玩家与 char_103 进行插入式性行为
   ↓
2. AI 响应:
   {
     "text": "啊...！（身体剧烈颤抖，达到了高潮）...",
     "emotion": "pleasure",
     "affinity_change": 5,
     "learned_skill": true
   }
   ↓
3. 系统处理:
   - 当前对话角色: char_103
   - char_103 等级: 10
   - 已解锁技能: [802, 723, 551, 552, 553, 542, 545, 728, 727, 554, 555, 556]
   - 玩家已习得: [802, 723]
   - 可学习技能: [551, 552, 553, 542, 545, 728, 727, 554, 555, 556]
   - 习得技能: 551
   ↓
4. 自动存档到 currentSlotId
   ↓
5. 显示 Toast 通知
```

### 场景 2: 已全部学会

```
1. 玩家与 char_103 进行插入式性行为
   ↓
2. AI 响应包含 learned_skill: true
   ↓
3. 系统处理:
   - char_103 所有技能已习得
   - getCharacterLearnableSkill 返回 null
   ↓
4. 不习得任何技能，返回 null
```

### 场景 3: 非直接性行为

```
1. 玩家使用器具刺激 char_103
   ↓
2. AI 响应:
   {
     "text": "啊...！",
     "emotion": "pleasure",
     "affinity_change": 3
     // 不包含 learned_skill
   }
   ↓
3. 不触发技能学习
```

---

## 🔍 调试与监控

### 控制台日志

```javascript
// AI 触发技能学习
console.log(`[技能学习] AI 触发技能学习: 角色ID=${character_id}`);

// 成功习得
console.log(`[技能学习] 玩家成功习得技能，本次对话已锁定`);

// 习得失败
console.log(`[技能学习] 技能习得失败（可能已全部学会或无可用技能）`);

// 自动存档
console.log(`[Skill] Player learned skill ${skillId}, auto-saving...`);
```

### 常见问题排查

**问题：AI 不输出 `learned_skill` 字段**

可能原因：
1. 未满足触发条件（非直接性行为、未达高潮）
2. 本次对话已习得过技能
3. 系统提示词未正确加载

排查步骤：
1. 检查 `GLOBAL_AI_RULES` 是否包含 `PROMPT_SKILL_LEARNING`
2. 确认对话内容满足触发条件
3. 检查 `sessionLearnedSkill` 状态

**问题：技能习得失败**

可能原因：
1. 角色没有可学习的技能
2. 所有技能已习得
3. 角色等级不足

排查步骤：
1. 检查 `CHARACTERS[characterId].battleData.skills`
2. 检查 `playerLearnedSkills` 数组
3. 检查 `characterStats[characterId].level`

---

## 🚀 未来扩展方向

### 1. 多种技能获取途径

```typescript
type SkillLearnMethod = 
    | 'sexual_climax'      // 性行为高潮
    | 'quest_reward'       // 任务奖励
    | 'item_use'           // 道具使用
    | 'special_event';     // 特殊事件
```

### 2. 技能熟练度系统

```typescript
interface LearnedSkill {
    skillId: number;
    proficiency: number;  // 熟练度 0-100
    learnedAt: number;    // 学习时间戳
    method: SkillLearnMethod;
}
```

### 3. 技能遗忘与重学

- 允许玩家遗忘已习得的技能
- 重新从角色处学习

---

## 📚 相关文档

- [AI 驱动系统技术标准](./AI_DRIVEN_SYSTEMS.md)
- [存档系统](../SAVE_SYSTEM_AND_DATABASE.md)
- [角色解锁系统](./CHARACTER_UNLOCK_SYSTEM.md)

---

## 🔗 相关文件

- `data/systemPrompts.ts` - AI 提示词配置
- `hooks/useCoreState.ts` - 状态管理和技能获取逻辑
- `hooks/useDialogueSystem.ts` - 对话系统集成
- `components/GameScene.tsx` - 自动存档集成
- `services/llmService.ts` - AI 响应类型定义

---

## 📝 变更日志

### v1.0.0 (2026-03-08)
- ✅ 初始实现技能学习系统
- ✅ AI 触发判定和提示词
- ✅ 技能排重和等级限制
- ✅ 对话系统集成
- ✅ 自动存档功能

---

**最后更新**: 2026-03-08  
**文档版本**: 1.0.0  
**设计者**: Nyaa  
**开发者**: Claude  
**维护者**: Claude  
**标签**: `#技能学习` `#AI驱动` `#性行为奖励` `#自动存档`
