/**
 * 绱犳潗 (RES) 浠峰€艰〃
 * 
 * 瑙勫垯锛? * 1. 猸? 鐨勪环鍊间负閲戝竵 10G
 * 2. 猸?0 鐨勪环鍊间负閲戝竵 2500G
 * 3. 涓棿鎸夌瓑宸暟鍒楀～鍏呭苟鍙栨暣
 * 
 * 鍏紡: a_n = a_1 + (n-1)d
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
 * 鑾峰彇绱犳潗鍩哄噯浠峰€? * @param star 鏄熺骇瀛楃涓?(濡?'1', '3')
 * @returns 瀵瑰簲閲戝竵浠峰€硷紝濡傛灉鏈畾涔夊垯杩斿洖 0
 */
export const getResValue = (star?: string): number => {
    if (!star) return 0;
    return RES_STAR_VALUE[star] || 0;
};

