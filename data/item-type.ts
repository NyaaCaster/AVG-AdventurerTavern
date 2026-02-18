
import { ItemCategoryInfo, ItemTagInfo } from '../types';

// 道具分类定义
export const ITEM_CATEGORIES: ItemCategoryInfo[] = [
  { id: 'res', name: '素材' },
  { id: 'itm', name: '消耗品' },
  { id: 'spc', name: '特殊道具' },
  { id: 'wpn', name: '武器' },
  { id: 'arm', name: '防具' },
  { id: 'acs', name: '饰品' },
];

// 道具标签定义
export const ITEM_TAGS: ItemTagInfo[] = [
  // 食材
  { id: 'non', name: '非食用', icon: '' },  // 0
  { id: 'meat', name: '兽肉', icon: '🥩' },  // 1
  { id: 'poultry', name: '禽肉', icon: '🍗' },  // 10
  { id: 'fish', name: '鱼类', icon: '🐟️' },  // 11
  { id: 'shrimp', name: '虾蟹', icon: '🦐' },  // 12
  { id: 'mussel', name: '贝类', icon: '🐚' },  // 13
  { id: 'carrot', name: '萝卜', icon: '🥕' },  // 2
  { id: 'potato', name: '土豆', icon: '🥔' },  // 22
  { id: 'vegetable', name: '叶菜', icon: '🥬' },  // 17
  { id: 'melons', name: '瓜类', icon: '🎃' },  // 18
  { id: 'fruit', name: '水果', icon: '🍋' },  // 19
  { id: 'tomatoes', name: '茄类', icon: '🍅' },  // 20
  { id: 'mushroom', name: '菌类', icon: '🍄' },  // 3
  { id: 'flour', name: '面粉', icon: '🌾' },  // 4
  { id: 'bread', name: '面包', icon: '🍞' },  // 14
  { id: 'rice', name: '米', icon: '🍚' },  // 15
  { id: 'bean', name: '豆类', icon: '🫘' },  // 16
  { id: 'egg', name: '蛋类', icon: '🥚' },  // 5
  { id: 'milk', name: '奶', icon: '🍼' },  // 6
  { id: 'dairy', name: '乳制品', icon: '🧀' },  // 21
  { id: 'jelly', name: '凝胶', icon: '🍮' },  // 8
  { id: 'spice', name: '香料', icon: '🧂' },  // 9
  // 酒场上架品
  { id: 'foods', name: '餐点', icon: '🍛' },  //直接食用
  { id: 'drinks', name: '酒水', icon: '🍺' },  // 7
  // 装备
  { id: 'sword', name: '剑', icon: '🗡' },
  { id: 'book', name: '魔导书', icon: '📘' },
  { id: 'gun', name: '枪械', icon: '🔫' },
  { id: 'glove', name: '拳套', icon: '🥊' },
  { id: 'lance', name: '长矛', icon: '🦯' },
  { id: 'axe', name: '斧', icon: '🪓' },
  { id: 'bow', name: '弓', icon: '🏹' },
  { id: 'L-Arm', name: '轻甲', icon: '👗' },
  { id: 'M-Arm', name: '中甲', icon: '🎽' },
  { id: 'H-Arm', name: '重甲', icon: '🦺' },
];
