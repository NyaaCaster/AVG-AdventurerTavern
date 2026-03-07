import { getArmValue } from './item-value-table';
import { ITEMS_EQUIP } from './item-equip';
import { calculateArmorQuality } from './facilityData';

export interface ShopEquipArmItem {
  id: string;
  equipId: string;
  price: number;
}

export const getEquipArmShopItemPrice = (item: ShopEquipArmItem): number => {
  if (item.price !== 0) return item.price;
  const equip = ITEMS_EQUIP[item.equipId];
  return getArmValue(equip?.quality);
};

export const ITEM_EQUIP_ARM_SHOP: ShopEquipArmItem[] = [
  { id: 'shop-arm-101', equipId: 'arm-101', price: 0 },
  { id: 'shop-arm-102', equipId: 'arm-102', price: 0 },
  { id: 'shop-arm-103', equipId: 'arm-103', price: 0 },
  { id: 'shop-arm-104', equipId: 'arm-104', price: 0 },
  { id: 'shop-arm-105', equipId: 'arm-105', price: 0 },
  { id: 'shop-arm-106', equipId: 'arm-106', price: 0 },
  { id: 'shop-arm-201', equipId: 'arm-201', price: 0 },
  { id: 'shop-arm-202', equipId: 'arm-202', price: 0 },
  { id: 'shop-arm-203', equipId: 'arm-203', price: 0 },
  { id: 'shop-arm-204', equipId: 'arm-204', price: 0 },
  { id: 'shop-arm-205', equipId: 'arm-205', price: 0 },
  { id: 'shop-arm-206', equipId: 'arm-206', price: 0 },
  { id: 'shop-arm-301', equipId: 'arm-301', price: 0 },
  { id: 'shop-arm-302', equipId: 'arm-302', price: 0 },
  { id: 'shop-arm-303', equipId: 'arm-303', price: 0 },
  { id: 'shop-arm-304', equipId: 'arm-304', price: 0 },
  { id: 'shop-arm-305', equipId: 'arm-305', price: 0 },
  { id: 'shop-arm-306', equipId: 'arm-306', price: 0 },
];

export const getFilteredArmShopItems = (armorShopLevel: number): ShopEquipArmItem[] => {
  const maxQuality = calculateArmorQuality(armorShopLevel);
  if (!maxQuality) return [];
  
  const qualityOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  const maxQualityIndex = qualityOrder.indexOf(maxQuality);
  
  return ITEM_EQUIP_ARM_SHOP.filter(item => {
    const equip = ITEMS_EQUIP[item.equipId];
    if (!equip) return false;
    const itemQualityIndex = qualityOrder.indexOf(equip.quality || 'E');
    return itemQualityIndex <= maxQualityIndex;
  });
};

export const getEquipArmShopItemByEquipId = (equipId: string) => {
  return ITEM_EQUIP_ARM_SHOP.find(item => item.equipId === equipId);
};

export const getEquipArmShopItemById = (id: string) => {
  return ITEM_EQUIP_ARM_SHOP.find(item => item.id === id);
};
