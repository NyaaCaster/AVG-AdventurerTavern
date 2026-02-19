
/**
 * 素材 (RES) 价值表
 * 
 * 规则：
 * 1. ⭐1 的价值为金币 10G
 * 2. ⭐10 的价值为金币 2500G
 * 3. 中间按等差数列填充并取整
 * 
 * 公式: a_n = a_1 + (n-1)d
 * d = (2500 - 10) / 9 = 276.666...
 */
export const RES_STAR_VALUE: Record<string, number> = {
    '1': 10,
    '2': 287,
    '3': 563,
    '4': 840,
    '5': 1117,
    '6': 1393,
    '7': 1670,
    '8': 1947,
    '9': 2223,
    '10': 2500
};

/**
 * 获取素材基准价值
 * @param star 星级字符串 (如 '1', '3')
 * @returns 对应金币价值，如果未定义则返回 0
 */
export const getResValue = (star?: string): number => {
    if (!star) return 0;
    return RES_STAR_VALUE[star] || 0;
};
