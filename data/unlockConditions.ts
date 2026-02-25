import { CharacterUnlocks } from '../types';

/**
 * 将角色解锁状态格式化为可读的文本，用于注入到 AI 提示词中
 * @param unlocks 角色的解锁状态对象
 * @returns 格式化的解锁状态文本
 */
export function formatUnlockStatusForAI(unlocks: CharacterUnlocks): string {
    const statusLines = Object.entries(unlocks).map(([key, value]) => {
        const statusName = UNLOCK_STATUS_NAMES[key as keyof CharacterUnlocks];
        const status = value === 1 ? '✓ 已解锁' : '✗ 未解锁';
        return `- ${statusName}: ${status}`;
    });
    
    return statusLines.join('\n');
}

/**
 * 获取默认的全部未解锁状态（用于角色没有解锁记录时）
 * @returns 全部未解锁的状态对象
 */
export function getDefaultUnlocks(): CharacterUnlocks {
    return {
        accept_battle_party: 0,
        accept_flirt_topic: 0,
        accept_nsfw_topic: 0,
        accept_physical_contact: 0,
        accept_indirect_sexual: 0,
        accept_become_lover: 0,
        accept_direct_sexual: 0,
        accept_sexual_partner: 0,
        accept_public_exposure: 0,
        accept_public_sexual: 0,
        accept_group_sexual: 0,
        accept_prostitution: 0,
        accept_sexual_slavery: 0,
        accept_bathing_together: 0,
        accept_player_massage: 0,
        accept_character_massage: 0
    };
}


/**
 * 解锁状态显示名称映射
 * 用于 UI 显示和 AI 提示词生成
 */
export const UNLOCK_STATUS_NAMES: Record<keyof CharacterUnlocks, string> = {
    accept_battle_party: '战斗组队',
    accept_flirt_topic: '暧昧话题',
    accept_nsfw_topic: '色情话题',
    accept_physical_contact: '身体接触',
    accept_indirect_sexual: '间接性行为',
    accept_become_lover: '成为恋人',
    accept_direct_sexual: '直接性行为',
    accept_sexual_partner: '成为性伴侣',
    accept_public_exposure: '公开露出',
    accept_public_sexual: '公开性行为',
    accept_group_sexual: '多人性行为',
    accept_prostitution: '卖春',
    accept_sexual_slavery: '性奴役',
    accept_bathing_together: '共浴',
    accept_player_massage: '玩家为角色按摩',
    accept_character_massage: '角色为玩家按摩'
};

/**
 * 解锁条件配置
 * 定义每个状态解锁所需的最低好感度
 */
export const UNLOCK_AFFINITY_REQUIREMENTS: Record<keyof CharacterUnlocks, number> = {
    accept_battle_party: 10,
    accept_flirt_topic: 20,
    accept_nsfw_topic: 30,
    accept_physical_contact: 40,
    accept_indirect_sexual: 50,
    accept_become_lover: 60,
    accept_direct_sexual: 60,
    accept_sexual_partner: 80,
    accept_public_exposure: 90,
    accept_public_sexual: 90,
    accept_group_sexual: 100,
    accept_prostitution: 80,
    accept_sexual_slavery: 80,
    accept_bathing_together: 50,
    accept_player_massage: 40,
    accept_character_massage: 50
};

/**
 * 角色特殊限制配置
 * 定义某些角色永远无法解锁的状态
 */
export const CHARACTER_UNLOCK_RESTRICTIONS: Record<string, Partial<Record<keyof CharacterUnlocks, string>>> = {
    // 莉莉娅 - 非战斗人员
    'char_101': {
        accept_battle_party: '莉莉娅是非战斗人员，她不会参与任何战斗。'
    },
    // 米娜 - 具有毁灭性战斗力
    'char_102': {
        accept_battle_party: '米娜的战斗力过于强大，她不会加入普通的战斗队伍。'
    },
    // 欧若拉 - 阴道受法术封印（但可以肛交）
    'char_103': {
        // 注意：char_103 可以接受 accept_direct_sexual（通过肛交），
        // 只是在实际性行为中不能进行阴道插入
        // 这个限制不在解锁系统中体现，而是在对话中由 AI 根据角色设定处理
    }
};

/**
 * 检查角色是否可以解锁某个状态
 * @param characterId 角色ID
 * @param unlockKey 解锁状态键
 * @param currentAffinity 当前好感度
 * @returns 检查结果
 */
export function canAttemptUnlock(
    characterId: string,
    unlockKey: keyof CharacterUnlocks,
    currentAffinity: number
): { canAttempt: boolean; reason?: string } {
    // 检查角色特殊限制
    const restrictions = CHARACTER_UNLOCK_RESTRICTIONS[characterId];
    if (restrictions && restrictions[unlockKey]) {
        return {
            canAttempt: false,
            reason: restrictions[unlockKey]
        };
    }
    
    // 检查好感度要求
    const requiredAffinity = UNLOCK_AFFINITY_REQUIREMENTS[unlockKey];
    if (currentAffinity < requiredAffinity) {
        return {
            canAttempt: false,
            reason: `需要好感度 ${requiredAffinity}（当前 ${currentAffinity}）`
        };
    }
    
    return { canAttempt: true };
}
