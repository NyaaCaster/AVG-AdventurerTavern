
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
    '2': 280,
    '3': 560,
    '4': 840,
    '5': 1100,
    '6': 1300,
    '7': 1600,
    '8': 1900,
    '9': 2300,
    '10': 2500
};

/**
 * 武器 (WPN) 价值表
 * 
 * 规则：
 * 1. quality: 'E' 的价值为金币 350G
 * 2. quality: 'S' 的价值为金币 700000G
 * 3. 中间按指数增长填充并取整
 * 
 * 公式: a_n = a_1 * r^(n-1)
 * r = (700000/350)^(1/5) ≈ 4.571
 */
export const WPN_QUALITY_VALUE: Record<string, number> = {
    'E': 350,
    'D': 1600,
    'C': 7300,
    'B': 33000,
    'A': 150000,
    'S': 700000
};

/**
 * 防具 (ARM) 价值表
 * 
 * 规则：
 * 1. quality: 'E' 的价值为金币 300G
 * 2. quality: 'S' 的价值为金币 500000G
 * 3. 中间按指数增长填充并取整
 * 
 * 公式: a_n = a_1 * r^(n-1)
 * r = (500000/300)^(1/5) ≈ 4.409
 */
export const ARM_QUALITY_VALUE: Record<string, number> = {
    'E': 300,
    'D': 1300,
    'C': 5800,
    'B': 25000,
    'A': 110000,
    'S': 500000
};

/**
 * 饰品 (ACS) 价值表
 * 
 * 规则：
 * 1. quality: 'E' 的价值为金币 500G
 * 2. quality: 'S' 的价值为金币 750000G
 * 3. 中间按指数增长填充并取整
 * 
 * 公式: a_n = a_1 * r^(n-1)
 * r = (750000/500)^(1/5) ≈ 4.348
 */
export const ACS_QUALITY_VALUE: Record<string, number> = {
    'E': 500,
    'D': 2100,
    'C': 9400,
    'B': 41000,
    'A': 170000,
    'S': 750000
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

export const getWpnValue = (quality?: string): number => {
    if (!quality) return 0;
    return WPN_QUALITY_VALUE[quality] || 0;
};

export const getArmValue = (quality?: string): number => {
    if (!quality) return 0;
    return ARM_QUALITY_VALUE[quality] || 0;
};

export const getAcsValue = (quality?: string): number => {
    if (!quality) return 0;
    return ACS_QUALITY_VALUE[quality] || 0;
};
