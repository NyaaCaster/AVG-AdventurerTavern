import { getResValue } from './item-value-table';
import { ITEMS_RES } from './item-res';

/**
 * 道具店商人出售的素材商品列表
 * 只定义商人出售的商品及其售价，不限制库存
 * 购买数量上限由用户背包容量决定
 *
 * price 特殊值说明：
 * - price === 0：动态定价，实际售价 = 该素材星级基准价
 */
export interface ShopItmItem {
  id: string;     // 商品条目ID
  resId: string;  // 对应 ITEMS_RES 的 id
  price: number;  // 商人售价 (G)；0 表示动态定价（星级基准价）
}

/**
 * 获取商品实际售价
 * - price 不为 0：直接返回 price
 * - price === 0：返回该素材星级基准价
 */
export const getItmShopItemPrice = (item: ShopItmItem): number => {
  if (item.price !== 0) return item.price;
  const res = ITEMS_RES[item.resId];
  return getResValue(res?.star);
};

export const ITEM_ITM_SHOP: ShopItmItem[] = [
  { id: 'shop-res-0001', resId: 'res-0001', price: 0 },
  { id: 'shop-res-0002', resId: 'res-0002', price: 0 },
  { id: 'shop-res-0003', resId: 'res-0003', price: 0 },
];

export const getItmShopItemByResId = (resId: string) => {
  return ITEM_ITM_SHOP.find(item => item.resId === resId);
};

export const getItmShopItemById = (id: string) => {
  return ITEM_ITM_SHOP.find(item => item.id === id);
};