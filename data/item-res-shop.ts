
import { ITEMS_RES } from './item-res';

export interface ShopItem {
  id: string;
  resId: string;
  price: number;
}

export const ITEM_RES_SHOP: ShopItem[] = [
  { id: 'shop-001', resId: 'res-0101', price: 20 },
  { id: 'shop-002', resId: 'res-0201', price: 20 },
  { id: 'shop-003', resId: 'res-0301', price: 20 },
];

export const getShopItemByResId = (resId: string) =&gt; {
  return ITEM_RES_SHOP.find(item =&gt; item.resId === resId);
};

export const getShopItemById = (id: string) =&gt; {
  return ITEM_RES_SHOP.find(item =&gt; item.id === id);
};
