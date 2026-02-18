
import { ItemData } from '../types';

export const ITEMS_RES: Record<string, ItemData> = {
  // --- 素材类 (res) ---
  'res-0001': { id: 'res-0001', name: '灵木', category: 'res', tag: 'non', quality: 'A', maxStack: 999, description: "蕴含魔力的神秘木材。可用于设施扩建。" },
  'res-0002': { id: 'res-0002', name: '幻皮', category: 'res', tag: 'non', quality: 'A', maxStack: 999, description: "柔韧结实的魔法皮革。可用于设施扩建。" },
  'res-0003': { id: 'res-0003', name: '魔晶石', category: 'res', tag: 'non', quality: 'A', maxStack: 999, description: "释放不可思议力量的矿石。可用于设施扩建。" },
  'res-0101': { id: 'res-0101', name: '狂暴兔肉', category: 'res', tag: 'meat', quality: 'D', maxStack: 99, description: "魔物`狂暴绒毛怪`的肉。可于烹饪。" },
  'res-0201': { id: 'res-0201', name: '青菜', category: 'res', tag: 'vegetable', quality: 'E', maxStack: 99, description: "世面常见的蔬菜。可于烹饪。" },
  'res-0301': { id: 'res-0301', name: '发光菌伞', category: 'res', tag: 'mushroom', quality: 'D', maxStack: 99, description: "魔物`光孢怪`的菌伞。可于烹饪。" },
  'res-0401': { id: 'res-0401', name: '面粉', category: 'res', tag: 'flour', quality: 'E', maxStack: 99, description: "世面常见的面粉。可于烹饪。" },
  'res-0501': { id: 'res-0501', name: '渡鸦蛋', category: 'res', tag: 'egg', quality: 'D', maxStack: 99, description: "魔物`死灵渡鸦`的蛋。可于烹饪。" },
  'res-0601': { id: 'res-0601', name: '牛奶', category: 'res', tag: 'milk', quality: 'E', maxStack: 99, description: "世面常见的牛奶。可于烹饪。" },
  'res-0701': { id: 'res-0701', name: '啤酒', category: 'res', tag: 'drinks', quality: 'E', maxStack: 99, description: "世面常见的啤酒。可在酒场销售。" },
  'res-0801': { id: 'res-0801', name: '史莱姆凝胶', category: 'res', tag: 'jelly', quality: 'D', maxStack: 99, description: "魔物`史莱姆`的黏液。可于烹饪。" },
  'res-0901': { id: 'res-0901', name: '木灵的胡椒', category: 'res', tag: 'spice', quality: 'D', maxStack: 99, description: "魔物`姆尔姆尔灌木`的胡椒。可于烹饪。" },
  // 角色专属素材
  'res-1011': { id: 'res-1011', name: '莉莉娅的乳肉', category: 'res', tag: 'meat', quality: 'S', maxStack: 99, description: "割取自`莉莉娅`乳房的肉，柔软滑腻，奶香多汁。可于烹饪。" },
  'res-1025': { id: 'res-1025', name: '米娜的蛋', category: 'res', tag: 'egg', quality: 'S', maxStack: 99, description: "`米娜`每个月生下的蛋，有芒果大小，浓香四溢。可于烹饪。" },
  'res-1032': { id: 'res-1032', name: '欧若拉的胡萝卜', category: 'res', tag: 'carrot', quality: 'S', maxStack: 99, description: "被`欧若拉`用作肛塞的胡萝卜，「皇室风味」。可于烹饪。" },
  'res-1047': { id: 'res-1047', name: '朱迪斯的「圣水」', category: 'res', tag: 'drinks', quality: 'S', maxStack: 99, description: "`朱迪斯`的尿液，酒精含量很高，相当于酿造的美酒。可在酒场销售。" },
  'res-1055': { id: 'res-1055', name: '莲华的腿肉', category: 'res', tag: 'meat', quality: 'S', maxStack: 99, description: "割取自`莲华`大腿的肌肉，韧劲十足，口感弹滑。可于烹饪。" },
  'res-1065': { id: 'res-1065', name: '艾琳的卤蛋', category: 'res', tag: 'egg', quality: 'S', maxStack: 99, description: "填充在`艾琳`阴道内的水煮蛋，腌制得咸香可口，晶莹剔透。可于烹饪。" },
  'res-1079': { id: 'res-1079', name: '菲洛的蜜汁', category: 'res', tag: 'spice', quality: 'S', maxStack: 99, description: "`菲洛`的爱液，有着神秘的幽香，只需少许就能提升菜品的风味。可于烹饪。" },
  'res-1086': { id: 'res-1086', name: '卡特琳娜的乳汁', category: 'res', tag: 'milk', quality: 'S', maxStack: 99, description: "榨取自`卡特琳娜`的乳汁，香甜可口，口感丝滑，加热后会散发`卡特琳娜`的体香。可于烹饪。" },
  'res-1095': { id: 'res-1095', name: '莱拉的腿肉', category: 'res', tag: 'meat', quality: 'S', maxStack: 99, description: "割取自`莱拉`大腿的肌肉，韧劲十足，口感弹滑。可于烹饪。" },
  'res-1108': { id: 'res-1108', name: '琉卡的「鱼子酱」', category: 'res', tag: 'jelly', quality: 'S', maxStack: 99, description: "秘密手法吸出的`琉卡`的卵子，经营透亮的粉色，带着粘稠的宫颈液，色泽口感都让人欲罢不能。可于烹饪。" },
  'res-1113': { id: 'res-1113', name: '吉娜用过的蘑菇', category: 'res', tag: 'mushroom', quality: 'S', maxStack: 99, description: "被`吉娜`当作自慰器械的菌杆，饱含`吉娜`的爱液，口感独特。可于烹饪。" },
};
