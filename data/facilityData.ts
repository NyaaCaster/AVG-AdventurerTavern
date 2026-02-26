import { SceneId } from '../types';

export interface FacilityConfig {
  id: SceneId;
  name: string;
  maxLevel: number;
  // 鍗囩骇娑堣€楀熀鏁?  baseCostGold: number;
  baseCostMat: number; // 鐏垫湪銆佸够鐨€侀瓟鏅剁煶
  
  // 渚濊禆闄愬埗
  unlockInnLevel: number; // 鍑虹幇璇ヨ鏂藉缓璁鹃€夐」鎵€闇€鐨勬煖鍙扮瓑绾?  dependencyFactor?: number; // 鏈€澶х瓑绾?= 鏌滃彴绛夌骇 / factor (鎴栬€?* factor)
  dependencyType: 'multiply' | 'divide'; // 渚濊禆璁＄畻鏂瑰紡
  
  // 鎻忚堪鐢熸垚鍑芥暟
  getEffectDescription: (level: number) => string;
}

// 瀵煎嚭璁＄畻鍑芥暟锛屼緵鍏朵粬妯″潡浣跨敤锛堥渶瑕佸厛瀹氫箟锛屽洜涓?FACILITY_DATA 浼氬紩鐢ㄥ畠浠級

// 鏌滃彴 (scen_1) - 瀹㈡埧鍩虹浠锋牸
export const calculateRoomPrice = (innLevel: number) => {
  return 50 + (innLevel - 1) * 10;
};

// 瀹㈡埧鍖哄煙 (scen_2) - 浣忓浜烘暟涓婇檺
export const calculateMaxOccupancy = (roomLevel: number) => {
  return 20 + (roomLevel - 1) * 5;
};

// 閰掑満 (scen_3) - 椁愰ギ婧环鍜屾爮浣?export const calculateTavernBonus = (tavernLevel: number) => {
  const bonus = (tavernLevel - 1) * 2;
  const slots = 1 + Math.floor((tavernLevel - 1) / 5);
  return { bonus, slots };
};

// 璁粌鍦?(scen_4) - 璁粌缁忛獙鍊?export const calculateTrainingExp = (trainingLevel: number) => {
  return 50 + (trainingLevel - 1) * 25;
};

// 姝﹀櫒搴?(scen_5) - 鍑哄敭姝﹀櫒鍝佽川
export const calculateWeaponQuality = (weaponShopLevel: number) => {
  if (weaponShopLevel === 0) return null;
  const qualities = ['E', 'D', 'C', 'B', 'A', 'S'];
  return qualities[Math.min(weaponShopLevel - 1, 5)];
};

// 闃插叿搴?(scen_6) - 鍑哄敭闃插叿鍝佽川
export const calculateArmorQuality = (armorShopLevel: number) => {
  if (armorShopLevel === 0) return null;
  const qualities = ['E', 'D', 'C', 'B', 'A', 'S'];
  return qualities[Math.min(armorShopLevel - 1, 5)];
};

// 闇插ぉ娓╂硥 (scen_7) - 鐢熷懡鎭㈠鍔犳垚
export const calculateHotSpringBonus = (hotSpringLevel: number) => {
  if (hotSpringLevel === 0) return 0;
  return hotSpringLevel * 10; // Lv1=10%, Lv20=200%
};

// 鎸夋懇瀹?(scen_8) - 榄斿姏鎭㈠鍔犳垚
export const calculateMassageBonus = (massageLevel: number) => {
  if (massageLevel === 0) return 0;
  return massageLevel * 5; // Lv1=5%, Lv20=100%
};

export const FACILITY_DATA: Partial<Record<SceneId, FacilityConfig>> = {
  'scen_1': {
    id: 'scen_1',
    name: '鏌滃彴',
    maxLevel: 100,
    baseCostGold: 3000,
    baseCostMat: 10,
    unlockInnLevel: 1,
    dependencyType: 'multiply', // 鑷韩鏃犱緷璧?    getEffectDescription: (level) => `瀹㈡埧鍩虹浠锋牸: ${calculateRoomPrice(level)} G`,
  },
  'scen_2': {
    id: 'scen_2',
    name: '瀹㈡埧鍖哄煙',
    maxLevel: 50,
    baseCostGold: 2000,
    baseCostMat: 5,
    unlockInnLevel: 1,
    dependencyFactor: 1, // MaxLv = InnLv
    dependencyType: 'multiply',
    getEffectDescription: (level) => `浣忓浜烘暟涓婇檺: ${calculateMaxOccupancy(level)} 浜篳,
  },
  'scen_3': {
    id: 'scen_3',
    name: '閰掑満',
    maxLevel: 50,
    baseCostGold: 1000,
    baseCostMat: 5,
    unlockInnLevel: 1,
    dependencyFactor: 1, // MaxLv = InnLv
    dependencyType: 'multiply',
    getEffectDescription: (level) => {
      const { bonus, slots } = calculateTavernBonus(level);
      return `椁愰ギ婧环 +${bonus}% / 鏍忎綅: ${slots}`;
    },
  },
  'scen_4': {
    id: 'scen_4',
    name: '璁粌鍦?,
    maxLevel: 30,
    baseCostGold: 3000,
    baseCostMat: 10,
    unlockInnLevel: 1,
    dependencyFactor: 1, // MaxLv = InnLv
    dependencyType: 'multiply',
    getEffectDescription: (level) => `璁粌缁忛獙鍊? ${calculateTrainingExp(level)}`,
  },
  'scen_5': {
    id: 'scen_5',
    name: '姝﹀櫒搴?,
    maxLevel: 6,
    baseCostGold: 5000,
    baseCostMat: 30,
    unlockInnLevel: 10,
    dependencyFactor: 10, // MaxLv = InnLv / 10 (鍗虫瘡10绾ф煖鍙板崌1绾?
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "鏈缓璁?;
        const quality = calculateWeaponQuality(level);
        return `鍑哄敭姝﹀櫒鍝佽川: ${quality}`;
    },
  },
  'scen_6': {
    id: 'scen_6',
    name: '闃插叿搴?,
    maxLevel: 6,
    baseCostGold: 5000,
    baseCostMat: 30,
    unlockInnLevel: 10,
    dependencyFactor: 10, // MaxLv = InnLv / 10
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "鏈缓璁?;
        const quality = calculateArmorQuality(level);
        return `鍑哄敭闃插叿鍝佽川: ${quality}`;
    },
  },
  'scen_7': {
    id: 'scen_7',
    name: '闇插ぉ娓╂硥',
    maxLevel: 20,
    baseCostGold: 2500,
    baseCostMat: 25,
    unlockInnLevel: 5,
    dependencyFactor: 5, // MaxLv = InnLv / 5
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "鏈缓璁?;
        const bonus = calculateHotSpringBonus(level);
        return `鐢熷懡鎭㈠鍔犳垚: +${bonus}%`;
    },
  },
  'scen_8': {
    id: 'scen_8',
    name: '鎸夋懇瀹?,
    maxLevel: 20,
    baseCostGold: 2500,
    baseCostMat: 25,
    unlockInnLevel: 5,
    dependencyFactor: 5, // MaxLv = InnLv / 5
    dependencyType: 'divide',
    getEffectDescription: (level) => {
        if (level === 0) return "鏈缓璁?;
        const bonus = calculateMassageBonus(level);
        return `榄斿姏鎭㈠鍔犳垚: +${bonus}%`;
    },
  },
};

export const UPGRADE_MATERIALS = [
    { id: 'res-0001', name: '鐏垫湪' },
    { id: 'res-0002', name: '骞荤毊' },
    { id: 'res-0003', name: '榄旀櫠鐭? }
];

