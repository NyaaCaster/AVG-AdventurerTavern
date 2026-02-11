
import { ItemData, ItemCategoryInfo, ItemTagInfo } from '../types';

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
  { id: 'non', name: '非食用', icon: '' },
  { id: 'meat', name: '肉类', icon: '🥩' },
  { id: 'vegetable', name: '果蔬', icon: '🥬' },
  { id: 'mushroom', name: '菌类', icon: '🍄‍🟫' },
  { id: 'cereal', name: '谷物', icon: '🍞' },
  { id: 'egg', name: '蛋类', icon: '🥚' },
  { id: 'milk', name: '奶类', icon: '🍼' },
  { id: 'wine', name: '酒水', icon: '🍺' },
  { id: 'jelly', name: '凝胶', icon: '🍮' },
  { id: 'spice', name: '香料', icon: '🧂' },
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

// 道具数据库
export const ITEMS: Record<string, ItemData> = {
  // --- 素材类 (res) ---
  'res-0001': { id: 'res-0001', name: '灵木', category: 'res', tag: 'non', quality: 'A', maxStack: 999, description: "蕴含魔力的神秘木材。可用于设施扩建。" },
  'res-0002': { id: 'res-0002', name: '幻皮', category: 'res', tag: 'non', quality: 'A', maxStack: 999, description: "柔韧结实的魔法皮革。可用于设施扩建。" },
  'res-0003': { id: 'res-0003', name: '魔晶石', category: 'res', tag: 'non', quality: 'A', maxStack: 999, description: "释放不可思议力量的矿石。可用于设施扩建。" },
  'res-0101': { id: 'res-0101', name: '狂暴兔肉', category: 'res', tag: 'meat', quality: 'D', maxStack: 99, description: "魔物`狂暴绒毛怪`的肉。可于烹饪。" },
  'res-0201': { id: 'res-0201', name: '青菜', category: 'res', tag: 'vegetable', quality: 'E', maxStack: 99, description: "世面常见的蔬菜。可于烹饪。" },
  'res-0301': { id: 'res-0301', name: '发光菌伞', category: 'res', tag: 'mushroom', quality: 'D', maxStack: 99, description: "魔物`光孢怪`的菌伞。可于烹饪。" },
  'res-0401': { id: 'res-0401', name: '面粉', category: 'res', tag: 'cereal', quality: 'E', maxStack: 99, description: "世面常见的面粉。可于烹饪。" },
  'res-0501': { id: 'res-0501', name: '渡鸦蛋', category: 'res', tag: 'egg', quality: 'D', maxStack: 99, description: "魔物`死灵渡鸦`的蛋。可于烹饪。" },
  'res-0601': { id: 'res-0601', name: '牛奶', category: 'res', tag: 'milk', quality: 'E', maxStack: 99, description: "世面常见的牛奶。可于烹饪。" },
  'res-0701': { id: 'res-0701', name: '啤酒', category: 'res', tag: 'wine', quality: 'E', maxStack: 99, description: "世面常见的啤酒。可于烹饪。" },
  'res-0801': { id: 'res-0801', name: '史莱姆凝胶', category: 'res', tag: 'jelly', quality: 'D', maxStack: 99, description: "魔物`史莱姆`的黏液。可于烹饪。" },
  'res-0901': { id: 'res-0901', name: '木灵的胡椒', category: 'res', tag: 'spice', quality: 'D', maxStack: 99, description: "魔物`姆尔姆尔灌木`的胡椒。可于烹饪。" },
  // 角色专属素材
  'res-1011': { id: 'res-1011', name: '莉莉娅的乳肉', category: 'res', tag: 'meat', quality: 'S', maxStack: 99, description: "割取自`莉莉娅`乳房的肉，柔软滑腻，奶香多汁。可于烹饪。" },
  'res-1025': { id: 'res-1025', name: '米娜的蛋', category: 'res', tag: 'egg', quality: 'S', maxStack: 99, description: "`米娜`每个月剩下的蛋，有芒果大小，浓香四溢。可于烹饪。" },
  'res-1032': { id: 'res-1032', name: '欧若拉的胡萝卜', category: 'res', tag: 'vegetable', quality: 'S', maxStack: 99, description: "被`欧若拉`用作肛塞的胡萝卜，「皇室风味」。可于烹饪。" },
  'res-1047': { id: 'res-1047', name: '朱迪斯的「圣水」', category: 'res', tag: 'wine', quality: 'S', maxStack: 99, description: "`朱迪斯`的尿液，酒精含量很高，相当于酿造的美酒。可于烹饪。" },
  'res-1055': { id: 'res-1055', name: '莲华的腿肉', category: 'res', tag: 'meat', quality: 'S', maxStack: 99, description: "割取自`莲华`大腿的肌肉，韧劲十足，口感弹滑。可于烹饪。" },
  'res-1065': { id: 'res-1065', name: '艾琳的卤蛋', category: 'res', tag: 'egg', quality: 'S', maxStack: 99, description: "填充在`艾琳`阴道内的水煮蛋，腌制得咸香可口，晶莹剔透。可于烹饪。" },
  'res-1079': { id: 'res-1079', name: '菲洛的蜜汁', category: 'res', tag: 'spice', quality: 'S', maxStack: 99, description: "`菲洛`的爱液，有着神秘的幽香，只需少许就能提升菜品的风味。可于烹饪。" },
  'res-1086': { id: 'res-1086', name: '卡特琳娜的乳汁', category: 'res', tag: 'milk', quality: 'S', maxStack: 99, description: "榨取自`卡特琳娜`的乳汁，香甜可口，口感丝滑，加热后会散发`卡特琳娜`的体香。可于烹饪。" },
  'res-1095': { id: 'res-1095', name: '莱拉的腿肉', category: 'res', tag: 'meat', quality: 'S', maxStack: 99, description: "割取自`莱拉`大腿的肌肉，韧劲十足，口感弹滑。可于烹饪。" },
  'res-1108': { id: 'res-1108', name: '琉卡的「鱼子酱」', category: 'res', tag: 'jelly', quality: 'S', maxStack: 99, description: "秘密手法吸出的`琉卡`的卵子，经营透亮的粉色，带着粘稠的宫颈液，色泽口感都让人欲罢不能。可于烹饪。" },
  'res-1113': { id: 'res-1113', name: '吉娜用过的蘑菇', category: 'res', tag: 'mushroom', quality: 'S', maxStack: 99, description: "被`吉娜`当作自慰器械的菌杆，饱含`吉娜`的爱液，口感独特。可于烹饪。" },

  // --- 消耗品类 (itm) ---
  // 注：修复了 ID 冲突，统一使用 'itm-' 前缀
  'itm-01': { id: 'itm-01', name: '治疗药·小', category: 'itm', quality: 'E', maxStack: 99, description: "恢复10%的生命值。只可对生命值不足100%战斗队员使用。" },
  'itm-02': { id: 'itm-02', name: '治疗药·中', category: 'itm', quality: 'D', maxStack: 99, description: "恢复30%的生命值。只可对生命值不足100%战斗队员使用。" },
  'itm-03': { id: 'itm-03', name: '治疗药·大', category: 'itm', quality: 'C', maxStack: 99, description: "恢复80%的生命值。只可对生命值不足100%战斗队员使用。" },
  'itm-04': { id: 'itm-04', name: '魔力药·凡', category: 'itm', quality: 'D', maxStack: 99, description: "恢复25%的魔力值。只可对魔力值不足100%战斗队员使用。" },
  'itm-05': { id: 'itm-05', name: '魔力药·极', category: 'itm', quality: 'B', maxStack: 99, description: "恢复50%的魔力值。只可对魔力值不足100%战斗队员使用。" },
  'itm-06': { id: 'itm-06', name: '魔力药·圣', category: 'itm', quality: 'S', maxStack: 99, description: "恢复100%的魔力值。只可对魔力值不足100%战斗队员使用。" },
  'itm-07': { id: 'itm-07', name: '精灵粉尘', category: 'itm', quality: 'B', maxStack: 99, description: "复活队友，并恢复20%的生命值。只可对`🪦死亡`状态的战斗队员使用。" },
  'itm-08': { id: 'itm-08', name: '凤凰之羽', category: 'itm', quality: 'A', maxStack: 99, description: "复活队友，并恢复60%的生命值。只可对`🪦死亡`状态的战斗队员使用。" },
  'itm-09': { id: 'itm-09', name: '女神遗香', category: 'itm', quality: 'S', maxStack: 99, description: "复活队友，并恢复100%的生命值，副作：进入于无法解除的`💗发情`状态，直到次日清晨才会解除。只可对`🪦死亡`状态的战斗队员使用。" },
  'itm-10': { id: 'itm-10', name: '清醒药', category: 'itm', quality: 'D', maxStack: 99, description: "解除队友的`💤昏睡`和`🌀晕眩`状态。只可对`💤昏睡`或`🌀晕眩`状态的战斗队员使用。" },
  'itm-11': { id: 'itm-11', name: '解毒剂', category: 'itm', quality: 'D', maxStack: 99, description: "解除队友的`🫐中毒`状态。只可`🫐中毒`状态的战斗队员使用。" },
  'itm-12': { id: 'itm-12', name: '绷带', category: 'itm', quality: 'E', maxStack: 99, description: "解除队友的`🩸流血`状态。只可`🩸流血`状态的战斗队员使用。" },

  // --- 特殊道具类 (spc) ---
  // 注：修复了 ID 冲突，统一使用 'spc-' 前缀
  'spc-00': { id: 'spc-00', name: '「莫比乌斯」', category: 'spc', quality: 'S', maxStack: 1, description: "真名为「莫比乌斯」的圣剑，{{user}}作为勇者时并肩战斗的伙伴，在被「世界」认可为「勇者」的{{user}}手中时，可以通过支付巨大的代价，发动短时间改变时间流逝方式的权能「境界线」。现在被厚厚的白布包裹着，沉睡在库房的隐蔽角落。" },
  'spc-01': { id: 'spc-01', name: '迷惑药', category: 'spc', quality: 'C', maxStack: 9, description: "别名「魅惑香薰」，使用后，当日住宿费会增加100g，但评级会下降10%" },
  'spc-02': { id: 'spc-02', name: '安眠药', category: 'spc', quality: 'C', maxStack: 9, description: "别名「魔女的吐息」，使目标进入`💤昏睡`状态，受到任何行为都不会清醒，直到第二天清晨才会解除。可以在客房对女性角色使用。" },
  'spc-03': { id: 'spc-03', name: '媚药', category: 'spc', quality: 'B', maxStack: 9, description: "别名「蛊惑之蜜」，使目标进入`💗发情`状态，能确实引发情欲，使其身体变得淫荡，难以拒绝性方面的请求，直到第二天清晨才会解除。可以在客房对女性角色使用。" },
  'spc-04': { id: 'spc-04', name: '催眠药', category: 'spc', quality: 'A', maxStack: 9, description: "别名「梦幻之香」，使目标进入`💜支配`状态，产生淫靡情绪的幻觉，失去判断力，完全听从命令，直到第二天清晨才会解除，事后会遗忘这段经历。可以在客房对女性角色使用。" },
  'spc-05': { id: 'spc-05', name: '棉绳', category: 'spc', quality: 'D', maxStack: 9, description: "红色的棉绳，比普通麻绳质地柔软，收缩力强，似乎不是劳作工具。可以在客房对女性角色使用。" },

  // --- 武器类 (wpn) ---
  // 剑
  'wpn-101': { id: 'wpn-101', name: '木剑', category: 'wpn', tag: 'sword', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "训练用的武器，本质是发挥使用着自身的力量。" },
  'wpn-102': { id: 'wpn-102', name: '铁剑', category: 'wpn', tag: 'sword', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "正常人都是用这个。" },
  'wpn-103': { id: 'wpn-103', name: '钢剑', category: 'wpn', tag: 'sword', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "很沉，没有一定的训练挥舞不起来。" },
  'wpn-104': { id: 'wpn-104', name: '秘银剑', category: 'wpn', tag: 'sword', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "大师精品，轻盈而锋利，就是价格昂贵……" },
  'wpn-105': { id: 'wpn-105', name: '精金剑', category: 'wpn', tag: 'sword', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "稀有的珍品，光是材料就让人垂延三尺。" },
  'wpn-106': { id: 'wpn-106', name: '水晶剑', category: 'wpn', tag: 'sword', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "寄宿着世界魔力的宝剑，如同在使用魔法本身进行挥砍。" },
  // 魔导书
  'wpn-201': { id: 'wpn-201', name: '《实用魔法大全》', category: 'wpn', tag: 'book', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "民俗研究社出版，收录了公认有用的民间智慧。" },
  'wpn-202': { id: 'wpn-202', name: '《学院精修百科》', category: 'wpn', tag: 'book', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "国立魔法学院的百年传承精品，走向大师巅峰的阶梯。" },
  'wpn-203': { id: 'wpn-203', name: '《星界秘法》', category: 'wpn', tag: 'book', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "这是一本威力巨大的秘法……但似乎不是人类的语言撰写的……" },
  'wpn-204': { id: 'wpn-204', name: '《诸神的低语》', category: 'wpn', tag: 'book', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "记录了众神战争时诸神曾经咏唱过的魔法。" },
  'wpn-205': { id: 'wpn-205', name: '《禁书·创造与毁灭》', category: 'wpn', tag: 'book', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "魔法学院最高等级禁忌之一，这不是人类应该掌握的知识。" },
  'wpn-206': { id: 'wpn-206', name: '《全知全能的终极》', category: 'wpn', tag: 'book', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "一即使全，全即是一" },
  // 枪械
  'wpn-301': { id: 'wpn-301', name: '「三岁准用」', category: 'wpn', tag: 'gun', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "“未满三岁的儿童请在家长看护下玩耍”" },
  'wpn-302': { id: 'wpn-302', name: '「夏日重现」', category: 'wpn', tag: 'gun', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "“夏日祭限定涂装！换上热水也是有点攻击力的！！”" },
  'wpn-303': { id: 'wpn-303', name: '「过热冲击」', category: 'wpn', tag: 'gun', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "“将枪膛过热转化成冲击力的极限改造！”" },
  'wpn-304': { id: 'wpn-304', name: '「全金属狂潮」', category: 'wpn', tag: 'gun', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "“吉娜工作室全新出品！！！”" },
  'wpn-305': { id: 'wpn-305', name: '「流星」', category: 'wpn', tag: 'gun', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "“那不是我的子弹，那是被我打下来的星星（叉腰）”" },
  'wpn-306': { id: 'wpn-306', name: '「改写现象的一击」', category: 'wpn', tag: 'gun', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "“哎哟我操！看日落的小山没了~”" },
  // 拳套
  'wpn-401': { id: 'wpn-401', name: '绑带', category: 'wpn', tag: 'glove', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "绑住自己的双手的，是信念" },
  'wpn-402': { id: 'wpn-402', name: '护手', category: 'wpn', tag: 'glove', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "这是用来抑制自己泛滥的力量的" },
  'wpn-403': { id: 'wpn-403', name: '拳击手套', category: 'wpn', tag: 'glove', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "这不是在保护自己，而是在保护对手" },
  'wpn-404': { id: 'wpn-404', name: '龙牙拳套', category: 'wpn', tag: 'glove', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "将双拳彻底化为凶残的恶龙之口" },
  'wpn-405': { id: 'wpn-405', name: '『自在极意』', category: 'wpn', tag: 'glove', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "悟，就是空" },
  'wpn-406': { id: 'wpn-406', name: '『 』', category: 'wpn', tag: 'glove', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "………………" },
  // 长矛
  'wpn-501': { id: 'wpn-501', name: '晾衣杆', category: 'wpn', tag: 'lance', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "最大的优点是随手可得！" },
  'wpn-502': { id: 'wpn-502', name: '铁矛', category: 'wpn', tag: 'lance', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "正常人类的武器，连哥布林都会用" },
  'wpn-503': { id: 'wpn-503', name: '军用长枪', category: 'wpn', tag: 'lance', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "标准制式的军队武器，上位军官的会更华丽一些" },
  'wpn-504': { id: 'wpn-504', name: '女武神之枪', category: 'wpn', tag: 'lance', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "象征着女性武者最高洁与犀利的银枪" },
  'wpn-505': { id: 'wpn-505', name: '世界树的木枝', category: 'wpn', tag: 'lance', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "回归初心，世界上最坚硬的……晾衣杆" },
  'wpn-506': { id: 'wpn-506', name: '「白虹」', category: 'wpn', tag: 'lance', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "有人说，那一刹，阳光被斩断了……" },
  // 斧
  'wpn-601': { id: 'wpn-601', name: '手斧', category: 'wpn', tag: 'axe', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "不管是劈柴还是讲道理，都非常好用" },
  'wpn-602': { id: 'wpn-602', name: '战斧', category: 'wpn', tag: 'axe', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "黑铁铸造的粗糙双刃斧，战场上不需要无用的华丽" },
  'wpn-603': { id: 'wpn-603', name: '蛮之斧', category: 'wpn', tag: 'axe', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "巨大的双刃斧，背在背上都能掩盖身形" },
  'wpn-604': { id: 'wpn-604', name: '狂之斧', category: 'wpn', tag: 'axe', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "这不是人类能挥动的东西，挥舞它的人已经化身鬼神" },
  'wpn-605': { id: 'wpn-605', name: '「噬龙者」', category: 'wpn', tag: 'axe', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "“龙███好█吃██吗██喵███？”" },
  'wpn-606': { id: 'wpn-606', name: '「创世者」', category: 'wpn', tag: 'axe', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "“哈！！！”" },
  // 弓
  'wpn-701': { id: 'wpn-701', name: '练习弓', category: 'wpn', tag: 'bow', quality: 'E', stats: { ATK: 1 }, maxStack: 9, description: "训练用的武器，本质是发挥使用着自身的力量……但如果不用箭矢也能造成伤害的话……" },
  'wpn-702': { id: 'wpn-702', name: '猎弓', category: 'wpn', tag: 'bow', quality: 'D', stats: { ATK: 15 }, maxStack: 9, description: "亚马逊女猎人的第二支幻肢" },
  'wpn-703': { id: 'wpn-703', name: '必中之弓', category: 'wpn', tag: 'bow', quality: 'C', stats: { ATK: 30 }, maxStack: 9, description: "“中！”" },
  'wpn-704': { id: 'wpn-704', name: '「龙弦」', category: 'wpn', tag: 'bow', quality: 'B', stats: { ATK: 50 }, maxStack: 9, description: "能将龙筋作为弓弦并能拉开的人，必然拥有匹敌巨龙体能的力量" },
  'wpn-705': { id: 'wpn-705', name: '「疾风点破」', category: 'wpn', tag: 'bow', quality: 'A', stats: { ATK: 150 }, maxStack: 9, description: "这是扭转因果的一箭，箭的轨迹，只是为了将必中这个结果补全在世界的现象中。" },
  'wpn-706': { id: 'wpn-706', name: '「听雨」', category: 'wpn', tag: 'bow', quality: 'S', stats: { ATK: 500 }, maxStack: 9, description: "你……能躲开雨滴吗？听，那就是雨。" },

  // --- 防具类 (arm) ---
  // 轻甲
  'arm-101': { id: 'arm-101', name: '长袍Lv1', category: 'arm', tag: 'L-Arm', quality: 'E', stats: { DEF: 0, AGI: 1, INT: 10 }, maxStack: 9, description: "比起防御力，更重要的是时尚！" },
  'arm-102': { id: 'arm-102', name: '长袍Lv2', category: 'arm', tag: 'L-Arm', quality: 'D', stats: { DEF: 0, AGI: 2, INT: 20 }, maxStack: 9, description: "在呼吸时就能产生魔力的纤维" },
  'arm-103': { id: 'arm-103', name: '长袍Lv3', category: 'arm', tag: 'L-Arm', quality: 'C', stats: { DEF: 0, AGI: 3, INT: 40 }, maxStack: 9, description: "这不是防具，是魔法师的武装！" },
  'arm-104': { id: 'arm-104', name: '长袍Lv4', category: 'arm', tag: 'L-Arm', quality: 'B', stats: { DEF: 0, AGI: 4, INT: 80 }, maxStack: 9, description: "魔法使者称其为「礼装」" },
  'arm-105': { id: 'arm-105', name: '长袍Lv5', category: 'arm', tag: 'L-Arm', quality: 'A', stats: { DEF: 0, AGI: 5, INT: 160 }, maxStack: 9, description: "能将吸收大气中魔力的织物" },
  'arm-106': { id: 'arm-106', name: '长袍Lv6', category: 'arm', tag: 'L-Arm', quality: 'S', stats: { DEF: 0, AGI: 6, INT: 320 }, maxStack: 9, description: "将魔力这个概念本身覆盖在皮肤上的现象" },
  // 中甲
  'arm-201': { id: 'arm-201', name: '皮甲Lv1', category: 'arm', tag: 'M-Arm', quality: 'E', stats: { DEF: 5, AGI: 5 }, maxStack: 9, description: "这个装备其实只是为了用来遮羞的" },
  'arm-202': { id: 'arm-202', name: '皮甲Lv2', category: 'arm', tag: 'M-Arm', quality: 'D', stats: { DEF: 10, AGI: 10 }, maxStack: 9, description: "穿了这个，要的就不是防御力，而是灵巧！" },
  'arm-203': { id: 'arm-203', name: '皮甲Lv3', category: 'arm', tag: 'M-Arm', quality: 'C', stats: { DEF: 15, AGI: 15 }, maxStack: 9, description: "活动自如，身材也展现自如" },
  'arm-204': { id: 'arm-204', name: '皮甲Lv4', category: 'arm', tag: 'M-Arm', quality: 'B', stats: { DEF: 20, AGI: 20 }, maxStack: 9, description: "健步如飞，在战斗中闲庭信步" },
  'arm-205': { id: 'arm-205', name: '皮甲Lv5', category: 'arm', tag: 'M-Arm', quality: 'A', stats: { DEF: 25, AGI: 25 }, maxStack: 9, description: "真的飞起来了……" },
  'arm-206': { id: 'arm-206', name: '皮甲Lv6', category: 'arm', tag: 'M-Arm', quality: 'S', stats: { DEF: 30, AGI: 30 }, maxStack: 9, description: "其实那点防御已经没必要了，只是为了在迅捷的战斗中找点遮羞用的东西" },
  // 重甲
  'arm-301': { id: 'arm-301', name: '铠甲Lv1', category: 'arm', tag: 'H-Arm', quality: 'E', stats: { DEF: 20, AGI: -5 }, maxStack: 9, description: "“很结实，不过好像有点沉”" },
  'arm-302': { id: 'arm-302', name: '铠甲Lv2', category: 'arm', tag: 'H-Arm', quality: 'D', stats: { DEF: 40, AGI: -10 }, maxStack: 9, description: "“哥布林打上来跟挠痒一样，但脚有点不听使唤”" },
  'arm-303': { id: 'arm-303', name: '铠甲Lv3', category: 'arm', tag: 'H-Arm', quality: 'C', stats: { DEF: 80, AGI: -15 }, maxStack: 9, description: "“魔狼已经要不穿我的铠甲了……但我也追不上他们”" },
  'arm-304': { id: 'arm-304', name: '铠甲Lv4', category: 'arm', tag: 'H-Arm', quality: 'B', stats: { DEF: 160, AGI: -20 }, maxStack: 9, description: "“撞上去好像产生的伤害更大一点……如果能冲得动的话……”" },
  'arm-305': { id: 'arm-305', name: '铠甲Lv5', category: 'arm', tag: 'H-Arm', quality: 'A', stats: { DEF: 320, AGI: -25 }, maxStack: 9, description: "“我觉得自己能顶住龙的吐息！”" },
  'arm-306': { id: 'arm-306', name: '铠甲Lv6', category: 'arm', tag: 'H-Arm', quality: 'S', stats: { DEF: 640, AGI: -30 }, maxStack: 9, description: "「不动如山」" },

  // --- 饰品类 (acs) ---
  'acs-001': { id: 'acs-001', name: '精灵耳坠', category: 'acs', quality: 'D', stats: { INT: 10 }, maxStack: 9, description: "穿在耳朵上，可以提高智力……穿在别的部位上也一样。" },
  'acs-002': { id: 'acs-002', name: '红宝石戒指', category: 'acs', quality: 'C', maxStack: 9, description: "内部刻有“{{user}}的情人节礼物”" },
  'acs-003': { id: 'acs-003', name: '铂金肛塞', category: 'acs', quality: 'A', maxStack: 9, description: "？？？" }
};
