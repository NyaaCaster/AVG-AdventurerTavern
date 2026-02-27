import { getResValue } from './item-value-table';
import { ITEMS_RES } from './item-res';

/**
 * 市集食材店出售的食材商品列表
 * 只定义商人出售的商品及其售价，不限制库存
 * 购买数量上限由用户背包容量决定
 *
 * price 特殊值说明：
 * - price === 0：动态定价，实际售价 = 该素材星级基准价
 */
export interface ShopResItem {
  id: string;     // 商品条目ID
  resId: string;  // 对应 ITEMS_RES 的 id
  price: number;  // 商人售价 (G)；0 表示动态定价（星级基准价）
}

/**
 * 获取商品实际售价
 * - price 不为 0：直接返回 price
 * - price === 0：返回该素材星级基准价
 */
export const getResShopItemPrice = (item: ShopResItem): number => {
  if (item.price !== 0) return item.price;
  const res = ITEMS_RES[item.resId];
  return getResValue(res?.star);
};

export const ITEM_RES_SHOP: ShopResItem[] = [
  // --- 肉类 ---
  { id: 'food-shop-0101', resId: 'res-0101', price: 0 }, // 肉干
  { id: 'food-shop-0102', resId: 'res-0102', price: 0 }, // 牛肉
  { id: 'food-shop-1001', resId: 'res-1001', price: 0 }, // 鸡肉
  // --- 海鲜 ---
  { id: 'food-shop-1101', resId: 'res-1101', price: 0 }, // 青鱼
  { id: 'food-shop-1201', resId: 'res-1201', price: 0 }, // 大虾
  { id: 'food-shop-1301', resId: 'res-1301', price: 0 }, // 贻贝
  // --- 蔬菜 ---
  { id: 'food-shop-2201', resId: 'res-2201', price: 0 }, // 土豆
  { id: 'food-shop-2202', resId: 'res-2202', price: 0 }, // 新薯
  { id: 'food-shop-0201', resId: 'res-0201', price: 0 }, // 白萝卜
  { id: 'food-shop-1701', resId: 'res-1701', price: 0 }, // 青菜
  { id: 'food-shop-1801', resId: 'res-1801', price: 0 }, // 南瓜
  { id: 'food-shop-1901', resId: 'res-1901', price: 0 }, // 柠檬
  { id: 'food-shop-2001', resId: 'res-2001', price: 0 }, // 番茄
  // --- 菌菇 ---
  { id: 'food-shop-0301', resId: 'res-0301', price: 0 }, // 草菇
  { id: 'food-shop-0302', resId: 'res-0302', price: 0 }, // 香菇
  // --- 谷物・面包 ---
  { id: 'food-shop-0401', resId: 'res-0401', price: 0 }, // 面粉
  { id: 'food-shop-1401', resId: 'res-1401', price: 0 }, // 黑面包
  { id: 'food-shop-1402', resId: 'res-1402', price: 0 }, // 白面包
  { id: 'food-shop-1403', resId: 'res-1403', price: 0 }, // 黄油面包
  { id: 'food-shop-1501', resId: 'res-1501', price: 0 }, // 大米
  { id: 'food-shop-1601', resId: 'res-1601', price: 0 }, // 青豆
  { id: 'food-shop-1602', resId: 'res-1602', price: 0 }, // 玉米
  // --- 蛋类 ---
  { id: 'food-shop-0501', resId: 'res-0501', price: 0 }, // 鸡蛋
  // --- 乳制品 ---
  { id: 'food-shop-0601', resId: 'res-0601', price: 0 }, // 牛奶
  { id: 'food-shop-2101', resId: 'res-2101', price: 0 }, // 奶油
  { id: 'food-shop-2102', resId: 'res-2102', price: 0 }, // 奶酪
  { id: 'food-shop-2103', resId: 'res-2103', price: 0 }, // 黄油
  // --- 酒水 ---
  { id: 'food-shop-0701', resId: 'res-0701', price: 0 }, // 啤酒
  { id: 'food-shop-0702', resId: 'res-0702', price: 0 }, // 葡萄酒
  { id: 'food-shop-0703', resId: 'res-0703', price: 0 }, // 麦酒
  { id: 'food-shop-0704', resId: 'res-0704', price: 0 }, // 清酒
  { id: 'food-shop-0705', resId: 'res-0705', price: 0 }, // 烧酒
  { id: 'food-shop-0706', resId: 'res-0706', price: 0 }, // 威士忌
  { id: 'food-shop-0707', resId: 'res-0707', price: 0 }, // 伏特加
  { id: 'food-shop-0708', resId: 'res-0708', price: 0 }, // 朗姆酒
  { id: 'food-shop-0709', resId: 'res-0709', price: 0 }, // 蜂蜜酒
  // --- 凝胶 ---
  { id: 'food-shop-0801', resId: 'res-0801', price: 0 }, // 果胶
  // --- 调料 ---
  { id: 'food-shop-0901', resId: 'res-0901', price: 0 }, // 盐
  { id: 'food-shop-0902', resId: 'res-0902', price: 0 }, // 糖
  { id: 'food-shop-0903', resId: 'res-0903', price: 0 }, // 辣椒
  { id: 'food-shop-0904', resId: 'res-0904', price: 0 }, // 黑胡椒
  { id: 'food-shop-0905', resId: 'res-0905', price: 0 }, // 肉桂
  { id: 'food-shop-0906', resId: 'res-0906', price: 0 }, // 八角
  { id: 'food-shop-0907', resId: 'res-0907', price: 0 }, // 丁香
];

export const getResShopItemByResId = (resId: string) => {
  return ITEM_RES_SHOP.find(item => item.resId === resId);
};

export const getResShopItemById = (id: string) => {
  return ITEM_RES_SHOP.find(item => item.id === id);
};