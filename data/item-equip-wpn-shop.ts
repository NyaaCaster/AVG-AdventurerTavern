import { getWpnValue } from './item-value-table';
import { ITEMS_EQUIP } from './item-equip';
import { calculateWeaponQuality } from './facilityData';

export interface ShopEquipWpnItem {
  id: string;
  equipId: string;
  price: number;
}

export const getEquipWpnShopItemPrice = (item: ShopEquipWpnItem): number => {
  if (item.price !== 0) return item.price;
  const equip = ITEMS_EQUIP[item.equipId];
  return getWpnValue(equip?.quality);
};

export const ITEM_EQUIP_WPN_SHOP: ShopEquipWpnItem[] = [
  { id: 'shop-wpn-101', equipId: 'wpn-101', price: 0 },
  { id: 'shop-wpn-102', equipId: 'wpn-102', price: 0 },
  { id: 'shop-wpn-103', equipId: 'wpn-103', price: 0 },
  { id: 'shop-wpn-104', equipId: 'wpn-104', price: 0 },
  { id: 'shop-wpn-105', equipId: 'wpn-105', price: 0 },
  { id: 'shop-wpn-106', equipId: 'wpn-106', price: 0 },
  { id: 'shop-wpn-201', equipId: 'wpn-201', price: 0 },
  { id: 'shop-wpn-202', equipId: 'wpn-202', price: 0 },
  { id: 'shop-wpn-203', equipId: 'wpn-203', price: 0 },
  { id: 'shop-wpn-204', equipId: 'wpn-204', price: 0 },
  { id: 'shop-wpn-205', equipId: 'wpn-205', price: 0 },
  { id: 'shop-wpn-206', equipId: 'wpn-206', price: 0 },
  { id: 'shop-wpn-301', equipId: 'wpn-301', price: 0 },
  { id: 'shop-wpn-302', equipId: 'wpn-302', price: 0 },
  { id: 'shop-wpn-303', equipId: 'wpn-303', price: 0 },
  { id: 'shop-wpn-304', equipId: 'wpn-304', price: 0 },
  { id: 'shop-wpn-305', equipId: 'wpn-305', price: 0 },
  { id: 'shop-wpn-306', equipId: 'wpn-306', price: 0 },
  { id: 'shop-wpn-401', equipId: 'wpn-401', price: 0 },
  { id: 'shop-wpn-402', equipId: 'wpn-402', price: 0 },
  { id: 'shop-wpn-403', equipId: 'wpn-403', price: 0 },
  { id: 'shop-wpn-404', equipId: 'wpn-404', price: 0 },
  { id: 'shop-wpn-405', equipId: 'wpn-405', price: 0 },
  { id: 'shop-wpn-406', equipId: 'wpn-406', price: 0 },
  { id: 'shop-wpn-501', equipId: 'wpn-501', price: 0 },
  { id: 'shop-wpn-502', equipId: 'wpn-502', price: 0 },
  { id: 'shop-wpn-503', equipId: 'wpn-503', price: 0 },
  { id: 'shop-wpn-504', equipId: 'wpn-504', price: 0 },
  { id: 'shop-wpn-505', equipId: 'wpn-505', price: 0 },
  { id: 'shop-wpn-506', equipId: 'wpn-506', price: 0 },
  { id: 'shop-wpn-601', equipId: 'wpn-601', price: 0 },
  { id: 'shop-wpn-602', equipId: 'wpn-602', price: 0 },
  { id: 'shop-wpn-603', equipId: 'wpn-603', price: 0 },
  { id: 'shop-wpn-604', equipId: 'wpn-604', price: 0 },
  { id: 'shop-wpn-605', equipId: 'wpn-605', price: 0 },
  { id: 'shop-wpn-606', equipId: 'wpn-606', price: 0 },
  { id: 'shop-wpn-701', equipId: 'wpn-701', price: 0 },
  { id: 'shop-wpn-702', equipId: 'wpn-702', price: 0 },
  { id: 'shop-wpn-703', equipId: 'wpn-703', price: 0 },
  { id: 'shop-wpn-704', equipId: 'wpn-704', price: 0 },
  { id: 'shop-wpn-705', equipId: 'wpn-705', price: 0 },
  { id: 'shop-wpn-706', equipId: 'wpn-706', price: 0 },
];

export const getFilteredWpnShopItems = (weaponShopLevel: number): ShopEquipWpnItem[] => {
  const maxQuality = calculateWeaponQuality(weaponShopLevel);
  if (!maxQuality) return [];
  
  const qualityOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  const maxQualityIndex = qualityOrder.indexOf(maxQuality);
  
  return ITEM_EQUIP_WPN_SHOP.filter(item => {
    const equip = ITEMS_EQUIP[item.equipId];
    if (!equip) return false;
    const itemQualityIndex = qualityOrder.indexOf(equip.quality || 'E');
    return itemQualityIndex <= maxQualityIndex;
  });
};

export const getEquipWpnShopItemByEquipId = (equipId: string) => {
  return ITEM_EQUIP_WPN_SHOP.find(item => item.equipId === equipId);
};

export const getEquipWpnShopItemById = (id: string) => {
  return ITEM_EQUIP_WPN_SHOP.find(item => item.id === id);
};
