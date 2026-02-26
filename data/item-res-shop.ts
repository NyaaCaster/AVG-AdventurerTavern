
/**
 * 道具店商人出售的素材商品列表
 * 只定义商人出售的商品及其售价，不限制库存
 * 购买数量上限由用户背包容量决定
 */
export interface ShopResItem {
  id: string;     // 商品条目ID
  resId: string;  // 对应 ITEMS_RES 的 id
  price: number;  // 商人售价 (G)
}

export const ITEM_RES_SHOP: ShopResItem[] = [
  { id: 'shop-res-0101', resId: 'res-0101', price: 20 },
  { id: 'shop-res-0201', resId: 'res-0201', price: 20 },
  { id: 'shop-res-0301', resId: 'res-0301', price: 20 },
];

export const getShopItemByResId = (resId: string) => {
  return ITEM_RES_SHOP.find(item => item.resId === resId);
};

export const getShopItemById = (id: string) => {
  return ITEM_RES_SHOP.find(item => item.id === id);
};

