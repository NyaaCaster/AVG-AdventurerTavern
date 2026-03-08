---
name: "save-system-designer"
description: "Guides save/load system design following unified data flow patterns. Invoke when designing new features that need data persistence or save/load functionality."
---

# Save System Designer

This skill ensures all new features follow the unified save/load data flow patterns defined in the technical documentation.

## When to Invoke

- Designing new features that require data persistence
- Creating new modal components that modify game state
- Adding new data fields to the save system
- Implementing new state management hooks
- User asks about save/load implementation patterns

## Core Principles

### 1. Unified Data Flow Pattern

**ALWAYS follow this pattern:**

```
用户操作 → 更新内存状态 → 存档触发 → handleSaveGame → saves 表
                                    ↓
                          数据库服务器同步 → 专用表（可选）
```

**NEVER:**
- Directly call database APIs from UI components
- Bypass `handleSaveGame` for core game data
- Use `slotId` in falsy checks (0 is valid!)

### 2. Save Timing Strategies

| Mode | Use Case | Trigger | Example Components |
|------|----------|---------|-------------------|
| **On-Close Save** | Batch editing | Modal close | PartyFormationModal, PartyEquipmentModal, PartySkillSetModal |
| **Immediate Save** | Single action | After action | QuestBoardModal |

### 2.1 Auto-Save Double-Write Mechanism

**重要**: 自动存档采用双重保存机制：

1. **当前槽位保存**: 保存到 `currentSlotId`
2. **Slot 0 备份**: 同时保存到 slot 0 作为备份

```typescript
const handleAutoSave = async () => {
    await handleSaveGame(currentSlotId);
    
    // 如果当前不是0号槽位，再保存到0号槽位作为备份
    // 注意：服务器端 /api/save 会自动同步所有独立表
    if (currentSlotId !== 0) {
        await handleSaveGame(0);
    }
};
```

**手动存档**: 只保存到当前槽位，不同步到 slot 0。

### 2.2 Dedicated Table Sync (Server-Side)

所有独立表都在服务器端 `/api/save` 端点中自动同步，客户端无需额外处理：

| 表名 | 同步函数 | 说明 |
|------|----------|------|
| `character_progress` | `syncCharacterProgress()` | 角色等级/经验 |
| `character_equipment` | `syncCharacterEquipment()` | 角色装备 |
| `character_skills` | `syncCharacterSkills()` | 角色技能配置 |
| `character_unlocks` | `syncCharacterUnlocks()` | 角色解锁状态 |

### 3. Component Implementation Pattern

#### On-Close Save Pattern

```typescript
interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MyDataType;
  onUpdateData: (data: MyDataType) => void;
  onAutoSave: () => void;
}

const MyModal: React.FC<MyModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
  onAutoSave
}) => {
  const handleClose = useCallback(() => {
    onAutoSave();
    onClose();
  }, [onAutoSave, onClose]);

  return (
    <div>
      <button onClick={handleClose}>Close</button>
    </div>
  );
};
```

#### Immediate Save Pattern

```typescript
<MyModal
  onAction={(param) => {
    core.handleAction(param);
    setTimeout(() => handleAutoSave().catch(err => console.error(err)), 100);
  }}
/>
```

**注意**: 使用 `handleAutoSave()` 而不是 `handleSaveGame(0)`，因为自动存档会同时保存到当前槽位和 slot 0（备份）。

## Implementation Checklist

When designing a new feature with data persistence:

### Step 1: Define Data Type

```typescript
interface MyNewData {
  field1: string;
  field2: number | null;
}
```

### Step 2: Add to SaveData Interface

Update `Doc/Technical/SAVE_SYSTEM_AND_DATABASE.md`:
- Add field to `SaveData` interface
- Add detailed field documentation

### Step 3: Add State to useCoreState

```typescript
const [myNewData, setMyNewData] = useState<MyNewData>(defaultData);

const normalizeMyNewData = (raw?: any): MyNewData => {
  return raw || defaultData;
};

const updateMyNewData = (data: MyNewData) => {
  setMyNewData(data);
};
```

### Step 4: Update Save/Load Functions

In `handleSaveGame`:
```typescript
const saveData = {
  // ... existing fields
  myNewData: core.myNewData,
};
```

In `applyLoadedData`:
```typescript
setMyNewData(normalizeMyNewData(data.myNewData));
```

### Step 5: Update Database Server (if needed)

If data needs dedicated table:
1. Create table in `database-server/index.js`
2. Add sync function
3. Call sync in save API

### Step 6: Update Documentation

Update `SAVE_SYSTEM_AND_DATABASE.md`:
- Data dictionary section
- Save flow section (if new pattern)

## Common Pitfalls

### ❌ Wrong: Falsy Check for slotId

```typescript
if (userId && slotId) {  // WRONG! slotId=0 is falsy
  saveGame(userId, slotId, data);
}
```

### ✅ Correct: Undefined Check

```typescript
if (userId !== undefined && slotId !== undefined) {
  saveGame(userId, slotId, data);
}
```

### ❌ Wrong: Direct Database Call

```typescript
const MyModal = ({ userId, slotId }) => {
  const handleUpdate = (data) => {
    updateDatabase(userId, slotId, data);  // WRONG!
  };
};
```

### ✅ Correct: Callback Pattern

```typescript
const MyModal = ({ onUpdateData, onAutoSave }) => {
  const handleUpdate = (data) => {
    onUpdateData(data);  // Update memory
  };
  
  const handleClose = () => {
    onAutoSave();  // Trigger save
    onClose();
  };
};
```

## Reference Files

- **Documentation**: `Doc/Technical/SAVE_SYSTEM_AND_DATABASE.md`
- **State Management**: `hooks/useCoreState.ts`
- **Save Service**: `services/db.ts`
- **Database Server**: `database-server/index.js`
- **Game Scene**: `components/GameScene.tsx`

## Verification

After implementing new save functionality:

1. ✅ TypeScript compiles without errors
2. ✅ Data persists after page refresh
3. ✅ Data loads correctly from save
4. ✅ Auto-save triggers at appropriate times
5. ✅ Documentation updated
