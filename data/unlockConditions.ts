mport { CharacterUnlocks } from '../types';

/**
 * 灏嗚鑹茶В閿佺姸鎬佹牸寮忓寲涓哄彲璇荤殑鏂囨湰锛岀敤浜庢敞鍏ュ埌 AI 鎻愮ず璇嶄腑
 * @param unlocks 瑙掕壊鐨勮В閿佺姸鎬佸璞? * @returns 鏍煎紡鍖栫殑瑙ｉ攣鐘舵€佹枃鏈? */
export function formatUnlockStatusForAI(unlocks: CharacterUnlocks): string {
    const statusLines = Object.entries(unlocks).map(([key, value]) => {
        const statusName = UNLOCK_STATUS_NAMES[key as keyof CharacterUnlocks];
        const status = value === 1 ? '鉁?宸茶В閿? : '鉁?鏈В閿?;
        return `- ${statusName}: ${status}`;
    });
    
    return statusLines.join('\n');
}

/**
 * 鑾峰彇榛樿鐨勫叏閮ㄦ湭瑙ｉ攣鐘舵€侊紙鐢ㄤ簬瑙掕壊娌℃湁瑙ｉ攣璁板綍鏃讹級
 * @returns 鍏ㄩ儴鏈В閿佺殑鐘舵€佸璞? */
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
 * 瑙ｉ攣鐘舵€佹樉绀哄悕绉版槧灏? * 鐢ㄤ簬 UI 鏄剧ず鍜?AI 鎻愮ず璇嶇敓鎴? */
export const UNLOCK_STATUS_NAMES: Record<keyof CharacterUnlocks, string> = {
    accept_battle_party: '鎴樻枟缁勯槦',
    accept_flirt_topic: '鏆ф槯璇濋',
    accept_nsfw_topic: '鑹叉儏璇濋',
    accept_physical_contact: '韬綋鎺ヨЕ',
    accept_indirect_sexual: '闂存帴鎬ц涓?,
    accept_become_lover: '鎴愪负鎭嬩汉',
    accept_direct_sexual: '鐩存帴鎬ц涓?,
    accept_sexual_partner: '鎴愪负鎬т即渚?,
    accept_public_exposure: '鍏紑闇插嚭',
    accept_public_sexual: '鍏紑鎬ц涓?,
    accept_group_sexual: '澶氫汉鎬ц涓?,
    accept_prostitution: '鍗栨槬',
    accept_sexual_slavery: '鎬уゴ褰?,
    accept_bathing_together: '鍏辨荡',
    accept_player_massage: '鐜╁涓鸿鑹叉寜鎽?,
    accept_character_massage: '瑙掕壊涓虹帺瀹舵寜鎽?
};

/**
 * 瑙ｉ攣鏉′欢閰嶇疆
 * 瀹氫箟姣忎釜鐘舵€佽В閿佹墍闇€鐨勬渶浣庡ソ鎰熷害
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
 * 瑙掕壊鐗规畩闄愬埗閰嶇疆
 * 瀹氫箟鏌愪簺瑙掕壊姘歌繙鏃犳硶瑙ｉ攣鐨勭姸鎬? */
export const CHARACTER_UNLOCK_RESTRICTIONS: Record<string, Partial<Record<keyof CharacterUnlocks, string>>> = {
    // 鑾夎帀濞?- 闈炴垬鏂椾汉鍛?    'char_101': {
        accept_battle_party: '鑾夎帀濞呮槸闈炴垬鏂椾汉鍛橈紝濂逛笉浼氬弬涓庝换浣曟垬鏂椼€?
    },
    // 绫冲 - 鍏锋湁姣佺伃鎬ф垬鏂楀姏
    'char_102': {
        accept_battle_party: '绫冲鐨勬垬鏂楀姏杩囦簬寮哄ぇ锛屽ス涓嶄細鍔犲叆鏅€氱殑鎴樻枟闃熶紞銆?
    },
    // 娆ц嫢鎷?- 闃撮亾鍙楁硶鏈皝鍗帮紙浣嗗彲浠ヨ倹浜わ級
    'char_103': {
        // 娉ㄦ剰锛歝har_103 鍙互鎺ュ彈 accept_direct_sexual锛堥€氳繃鑲涗氦锛夛紝
        // 鍙槸鍦ㄥ疄闄呮€ц涓轰腑涓嶈兘杩涜闃撮亾鎻掑叆
        // 杩欎釜闄愬埗涓嶅湪瑙ｉ攣绯荤粺涓綋鐜帮紝鑰屾槸鍦ㄥ璇濅腑鐢?AI 鏍规嵁瑙掕壊璁惧畾澶勭悊
    }
};

/**
 * 妫€鏌ヨ鑹叉槸鍚﹀彲浠ヨВ閿佹煇涓姸鎬? * @param characterId 瑙掕壊ID
 * @param unlockKey 瑙ｉ攣鐘舵€侀敭
 * @param currentAffinity 褰撳墠濂芥劅搴? * @returns 妫€鏌ョ粨鏋? */
export function canAttemptUnlock(
    characterId: string,
    unlockKey: keyof CharacterUnlocks,
    currentAffinity: number
): { canAttempt: boolean; reason?: string } {
    // 妫€鏌ヨ鑹茬壒娈婇檺鍒?    const restrictions = CHARACTER_UNLOCK_RESTRICTIONS[characterId];
    if (restrictions && restrictions[unlockKey]) {
        return {
            canAttempt: false,
            reason: restrictions[unlockKey]
        };
    }
    
    // 妫€鏌ュソ鎰熷害瑕佹眰
    const requiredAffinity = UNLOCK_AFFINITY_REQUIREMENTS[unlockKey];
    if (currentAffinity < requiredAffinity) {
        return {
            canAttempt: false,
            reason: `闇€瑕佸ソ鎰熷害 ${requiredAffinity}锛堝綋鍓?${currentAffinity}锛塦
        };
    }
    
    return { canAttempt: true };
}

