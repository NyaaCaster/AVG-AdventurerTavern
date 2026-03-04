/**
 * 货币转换与价值表
 * 
 * 规则：
 * 1. 系统货币：理智 (Sanity) - 逻辑层使用的基础单位
 * 2. 客户端货币：灵感 (Inspiration) - 玩家界面显示的单位
 * 3. 游戏内货币：金币 (Gold) - 游戏内的通用货币
 * 
 * 转换关系：
 * - 1 灵感 = 10000 理智
 * - 1 灵感 = 100000 金币
 */

// 1 灵感对应的理智数值
export const INSPIRATION_TO_SANITY_RATIO = 10000;

// 1 灵感对应的金币数值
export const INSPIRATION_TO_GOLD_RATIO = 100000;

/**
 * 将系统理智值转换为客户端显示的灵感值
 * @param sanity 系统理智值
 * @returns 客户端显示的灵感值
 */
export const sanityToInspiration = (sanity: number): number => {
    return sanity / INSPIRATION_TO_SANITY_RATIO;
};

/**
 * 将客户端显示的灵感值转换为系统理智值
 * @param inspiration 客户端显示的灵感值
 * @returns 系统理智值
 */
export const inspirationToSanity = (inspiration: number): number => {
    return inspiration * INSPIRATION_TO_SANITY_RATIO;
};

/**
 * 将客户端显示的灵感值转换为金币值
 * @param inspiration 客户端显示的灵感值
 * @returns 对应的金币值
 */
export const inspirationToGold = (inspiration: number): number => {
    return inspiration * INSPIRATION_TO_GOLD_RATIO;
};

/**
 * 将金币值转换为客户端显示的灵感值
 * @param gold 金币值
 * @returns 对应的灵感值
 */
export const goldToInspiration = (gold: number): number => {
    return gold / INSPIRATION_TO_GOLD_RATIO;
};

/**
 * 将系统理智值直接转换为金币值
 * @param sanity 系统理智值
 * @returns 对应的金币值
 */
export const sanityToGold = (sanity: number): number => {
    return sanityToInspiration(sanity) * INSPIRATION_TO_GOLD_RATIO;
};

/**
 * 将金币值直接转换为系统理智值
 * @param gold 金币值
 * @returns 对应的系统理智值
 */
export const goldToSanity = (gold: number): number => {
    return goldToInspiration(gold) * INSPIRATION_TO_SANITY_RATIO;
};
