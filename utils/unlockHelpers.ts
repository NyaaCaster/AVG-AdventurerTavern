import { CharacterUnlocks } from '../types';
import { UNLOCK_STATUS_NAMES } from '../data/unlockConditions';

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
        accept_sexual_slavery: 0
    };
}
