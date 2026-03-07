
import { ItemData } from '../types';

export const ITEMS_EQUIP: Record<string, ItemData> = {
  // --- 武器类 (wpn) ---
  // 剑
  'wpn-101': { id: 'wpn-101', name: '木剑', category: 'wpn', tag: 'sword', quality: 'E', stats: { atk: 6 }, maxStack: 9, description: "训练用的武器，本质是发挥使用着自身的力量。" },
  'wpn-102': { id: 'wpn-102', name: '铁剑', category: 'wpn', tag: 'sword', quality: 'D', stats: { atk: 30 }, maxStack: 9, description: "正常人都是用这个。" },
  'wpn-103': { id: 'wpn-103', name: '钢剑', category: 'wpn', tag: 'sword', quality: 'C', stats: { atk: 54 }, maxStack: 9, description: "很沉，没有一定的训练挥舞不起来。" },
  'wpn-104': { id: 'wpn-104', name: '秘银剑', category: 'wpn', tag: 'sword', quality: 'B', stats: { atk: 80 }, maxStack: 9, description: "大师精品，轻盈而锋利，就是价格昂贵……" },
  'wpn-105': { id: 'wpn-105', name: '精金剑', category: 'wpn', tag: 'sword', quality: 'A', stats: { atk: 170 }, maxStack: 9, description: "稀有的珍品，光是材料就让人垂延三尺。" },
  'wpn-106': { id: 'wpn-106', name: '水晶剑', category: 'wpn', tag: 'sword', quality: 'S', stats: { atk: 300 }, maxStack: 9, description: "寄宿着世界魔力的宝剑，如同在使用魔法本身进行挥砍。" },
  // 魔导书
  'wpn-201': { id: 'wpn-201', name: '《实用魔法大全》', category: 'wpn', tag: 'book', quality: 'E', stats: { matk: 6 }, maxStack: 9, description: "民俗研究社出版，收录了公认有用的民间智慧。" },
  'wpn-202': { id: 'wpn-202', name: '《学院精修百科》', category: 'wpn', tag: 'book', quality: 'D', stats: { matk: 30 }, maxStack: 9, description: "国立魔法学院的百年传承精品，走向大师巅峰的阶梯。" },
  'wpn-203': { id: 'wpn-203', name: '《星界秘法》', category: 'wpn', tag: 'book', quality: 'C', stats: { matk: 54 }, maxStack: 9, description: "这是一本威力巨大的秘法……但似乎不是人类的语言撰写的……" },
  'wpn-204': { id: 'wpn-204', name: '《诸神的低语》', category: 'wpn', tag: 'book', quality: 'B', stats: { matk: 80 }, maxStack: 9, description: "记录了众神战争时诸神曾经咏唱过的魔法。" },
  'wpn-205': { id: 'wpn-205', name: '《禁书·创造与毁灭》', category: 'wpn', tag: 'book', quality: 'A', stats: { matk: 170 }, maxStack: 9, description: "魔法学院最高等级禁忌之一，这不是人类应该掌握的知识。" },
  'wpn-206': { id: 'wpn-206', name: '《全知全能的终极》', category: 'wpn', tag: 'book', quality: 'S', stats: { matk: 300 }, maxStack: 9, description: "一即使全，全即是一" },
  // 枪械
  'wpn-301': { id: 'wpn-301', name: '「三岁准用」', category: 'wpn', tag: 'gun', quality: 'E', stats: { atk: 6 }, maxStack: 9, description: "\"未满三岁的儿童请在家长看护下玩耍\"" },
  'wpn-302': { id: 'wpn-302', name: '「夏日重现」', category: 'wpn', tag: 'gun', quality: 'D', stats: { atk: 30 }, maxStack: 9, description: "\"夏日祭限定涂装！换上热水也是有点攻击力的！！\"" },
  'wpn-303': { id: 'wpn-303', name: '「过热冲击」', category: 'wpn', tag: 'gun', quality: 'C', stats: { atk: 54 }, maxStack: 9, description: "\"将枪膛过热转化成冲击力的极限改造！\"" },
  'wpn-304': { id: 'wpn-304', name: '「全金属狂潮」', category: 'wpn', tag: 'gun', quality: 'B', stats: { atk: 80 }, maxStack: 9, description: "\"吉娜工作室全新出品！！！\"" },
  'wpn-305': { id: 'wpn-305', name: '「流星」', category: 'wpn', tag: 'gun', quality: 'A', stats: { atk: 170 }, maxStack: 9, description: "\"那不是我的子弹，那是被我打下来的星星（叉腰）\"" },
  'wpn-306': { id: 'wpn-306', name: '「改写现象的一击」', category: 'wpn', tag: 'gun', quality: 'S', stats: { atk: 300 }, maxStack: 9, description: "\"哎哟我操！看日落的小山没了~\"" },
  // 拳套
  'wpn-401': { id: 'wpn-401', name: '绑带', category: 'wpn', tag: 'glove', quality: 'E', stats: { atk: 6 }, maxStack: 9, description: "绑住自己的双手的，是信念" },
  'wpn-402': { id: 'wpn-402', name: '护手', category: 'wpn', tag: 'glove', quality: 'D', stats: { atk: 30 }, maxStack: 9, description: "这是用来抑制自己泛滥的力量的" },
  'wpn-403': { id: 'wpn-403', name: '拳击手套', category: 'wpn', tag: 'glove', quality: 'C', stats: { atk: 54 }, maxStack: 9, description: "这不是在保护自己，而是在保护对手" },
  'wpn-404': { id: 'wpn-404', name: '龙牙拳套', category: 'wpn', tag: 'glove', quality: 'B', stats: { atk: 80 }, maxStack: 9, description: "将双拳彻底化为凶残的恶龙之口" },
  'wpn-405': { id: 'wpn-405', name: '『自在极意』', category: 'wpn', tag: 'glove', quality: 'A', stats: { atk: 170 }, maxStack: 9, description: "悟，就是空" },
  'wpn-406': { id: 'wpn-406', name: '『 』', category: 'wpn', tag: 'glove', quality: 'S', stats: { atk: 300 }, maxStack: 9, description: "………………" },
  // 长矛
  'wpn-501': { id: 'wpn-501', name: '晾衣杆', category: 'wpn', tag: 'lance', quality: 'E', stats: { atk: 6 }, maxStack: 9, description: "最大的优点是随手可得！" },
  'wpn-502': { id: 'wpn-502', name: '铁矛', category: 'wpn', tag: 'lance', quality: 'D', stats: { atk: 30 }, maxStack: 9, description: "正常人类的武器，连哥布林都会用" },
  'wpn-503': { id: 'wpn-503', name: '军用长枪', category: 'wpn', tag: 'lance', quality: 'C', stats: { atk: 54 }, maxStack: 9, description: "标准制式的军队武器，上位军官的会更华丽一些" },
  'wpn-504': { id: 'wpn-504', name: '女武神之枪', category: 'wpn', tag: 'lance', quality: 'B', stats: { atk: 80 }, maxStack: 9, description: "象征着女性武者最高洁与犀利的银枪" },
  'wpn-505': { id: 'wpn-505', name: '世界树的木枝', category: 'wpn', tag: 'lance', quality: 'A', stats: { atk: 170 }, maxStack: 9, description: "回归初心，世界上最坚硬的……晾衣杆" },
  'wpn-506': { id: 'wpn-506', name: '「白虹」', category: 'wpn', tag: 'lance', quality: 'S', stats: { atk: 300 }, maxStack: 9, description: "有人说，那一刹，阳光被斩断了……" },
  // 斧
  'wpn-601': { id: 'wpn-601', name: '手斧', category: 'wpn', tag: 'axe', quality: 'E', stats: { atk: 6 }, maxStack: 9, description: "不管是劈柴还是讲道理，都非常好用" },
  'wpn-602': { id: 'wpn-602', name: '战斧', category: 'wpn', tag: 'axe', quality: 'D', stats: { atk: 30 }, maxStack: 9, description: "黑铁铸造的粗糙双刃斧，战场上不需要无用的华丽" },
  'wpn-603': { id: 'wpn-603', name: '蛮之斧', category: 'wpn', tag: 'axe', quality: 'C', stats: { atk: 54 }, maxStack: 9, description: "巨大的双刃斧，背在背上都能掩盖身形" },
  'wpn-604': { id: 'wpn-604', name: '狂之斧', category: 'wpn', tag: 'axe', quality: 'B', stats: { atk: 80 }, maxStack: 9, description: "这不是人类能挥动的东西，挥舞它的人已经化身鬼神" },
  'wpn-605': { id: 'wpn-605', name: '「噬龙者」', category: 'wpn', tag: 'axe', quality: 'A', stats: { atk: 170 }, maxStack: 9, description: "\"龙███好█吃██吗██喵███？\"" },
  'wpn-606': { id: 'wpn-606', name: '「创世者」', category: 'wpn', tag: 'axe', quality: 'S', stats: { atk: 300 }, maxStack: 9, description: "\"哈！！！\"" },
  // 弓
  'wpn-701': { id: 'wpn-701', name: '练习弓', category: 'wpn', tag: 'bow', quality: 'E', stats: { atk: 6 }, maxStack: 9, description: "训练用的武器，本质是发挥使用着自身的力量……但如果不用箭矢也能造成伤害的话……" },
  'wpn-702': { id: 'wpn-702', name: '猎弓', category: 'wpn', tag: 'bow', quality: 'D', stats: { atk: 30 }, maxStack: 9, description: "亚马逊女猎人的第二支幻肢" },
  'wpn-703': { id: 'wpn-703', name: '必中之弓', category: 'wpn', tag: 'bow', quality: 'C', stats: { atk: 54 }, maxStack: 9, description: "\"中！\"" },
  'wpn-704': { id: 'wpn-704', name: '「龙弦」', category: 'wpn', tag: 'bow', quality: 'B', stats: { atk: 80 }, maxStack: 9, description: "能将龙筋作为弓弦并能拉开的人，必然拥有匹敌巨龙体能的力量" },
  'wpn-705': { id: 'wpn-705', name: '「疾风点破」', category: 'wpn', tag: 'bow', quality: 'A', stats: { atk: 170 }, maxStack: 9, description: "这是扭转因果的一箭，箭的轨迹，只是为了将必中这个结果补全在世界的现象中。" },
  'wpn-706': { id: 'wpn-706', name: '「听雨」', category: 'wpn', tag: 'bow', quality: 'S', stats: { atk: 300 }, maxStack: 9, description: "你……能躲开雨滴吗？听，那就是雨。" },

  // --- 防具类 (arm) ---
  // 轻甲
  'arm-101': { id: 'arm-101', name: '长袍Lv1', category: 'arm', tag: 'L-Arm', quality: 'E', stats: { def: 1, mp: 1, matk: 2, mdef: 3 }, maxStack: 9, description: "比起防御力，更重要的是时尚！" },
  'arm-102': { id: 'arm-102', name: '长袍Lv2', category: 'arm', tag: 'L-Arm', quality: 'D', stats: { def: 5, mp: 10, matk: 7, mdef: 11 }, maxStack: 9, description: "在呼吸时就能产生魔力的纤维" },
  'arm-103': { id: 'arm-103', name: '长袍Lv3', category: 'arm', tag: 'L-Arm', quality: 'C', stats: { def: 8, mp: 40, matk: 25, mdef: 32 }, maxStack: 9, description: "这不是防具，是魔法师的武装！" },
  'arm-104': { id: 'arm-104', name: '长袍Lv4', category: 'arm', tag: 'L-Arm', quality: 'B', stats: { def: 12, mp: 65, matk: 50, mdef: 60 }, maxStack: 9, description: "魔法使者称其为「礼装」" },
  'arm-105': { id: 'arm-105', name: '长袍Lv5', category: 'arm', tag: 'L-Arm', quality: 'A', stats: { def: 20, mp: 110, matk: 95, mdef: 105 }, maxStack: 9, description: "能将吸收大气中魔力的织物" },
  'arm-106': { id: 'arm-106', name: '长袍Lv6', category: 'arm', tag: 'L-Arm', quality: 'S', stats: { def: 30, mp: 175, matk: 160, mdef: 170 }, maxStack: 9, description: "将魔力这个概念本身覆盖在皮肤上的现象" },
  // 中甲
  'arm-201': { id: 'arm-201', name: '皮甲Lv1', category: 'arm', tag: 'M-Arm', quality: 'E', stats: { def: 4, agi: 1 }, maxStack: 9, description: "这个装备其实只是为了用来遮羞的" },
  'arm-202': { id: 'arm-202', name: '皮甲Lv2', category: 'arm', tag: 'M-Arm', quality: 'D', stats: { def: 8, agi: 5 }, maxStack: 9, description: "穿了这个，要的就不是防御力，而是灵巧！" },
  'arm-203': { id: 'arm-203', name: '皮甲Lv3', category: 'arm', tag: 'M-Arm', quality: 'C', stats: { def: 13, agi: 10 }, maxStack: 9, description: "活动自如，身材也展现自如" },
  'arm-204': { id: 'arm-204', name: '皮甲Lv4', category: 'arm', tag: 'M-Arm', quality: 'B', stats: { def: 20, agi: 15 }, maxStack: 9, description: "健步如飞，在战斗中闲庭信步" },
  'arm-205': { id: 'arm-205', name: '皮甲Lv5', category: 'arm', tag: 'M-Arm', quality: 'A', stats: { def: 27, agi: 20 }, maxStack: 9, description: "真的飞起来了……" },
  'arm-206': { id: 'arm-206', name: '皮甲Lv6', category: 'arm', tag: 'M-Arm', quality: 'S', stats: { def: 35, agi: 35 }, maxStack: 9, description: "其实那点防御已经没必要了，只是为了在迅捷的战斗中找点遮羞用的东西" },
  // 重甲
  'arm-301': { id: 'arm-301', name: '铠甲Lv1', category: 'arm', tag: 'H-Arm', quality: 'E', stats: { def: 15, agi: -2 }, maxStack: 9, description: "\"很结实，不过好像有点沉\"" },
  'arm-302': { id: 'arm-302', name: '铠甲Lv2', category: 'arm', tag: 'H-Arm', quality: 'D', stats: { def: 37, agi: -4 }, maxStack: 9, description: "\"哥布林打上来跟挠痒一样，但脚有点不听使唤\"" },
  'arm-303': { id: 'arm-303', name: '铠甲Lv3', category: 'arm', tag: 'H-Arm', quality: 'C', stats: { def: 65, agi: -8 }, maxStack: 9, description: "\"魔狼已经要不穿我的铠甲了……但我也追不上他们\"" },
  'arm-304': { id: 'arm-304', name: '铠甲Lv4', category: 'arm', tag: 'H-Arm', quality: 'B', stats: { def: 100, agi: -10 }, maxStack: 9, description: "\"撞上去好像产生的伤害更大一点……如果能冲得动的话……\"" },
  'arm-305': { id: 'arm-305', name: '铠甲Lv5', category: 'arm', tag: 'H-Arm', quality: 'A', stats: { def: 155, agi: -15 }, maxStack: 9, description: "\"我觉得自己能顶住龙的吐息！\"" },
  'arm-306': { id: 'arm-306', name: '铠甲Lv6', category: 'arm', tag: 'H-Arm', quality: 'S', stats: { def: 230, agi: -20 }, maxStack: 9, description: "「不动如山」" },

  // --- 饰品类 (acs) ---
  'acs-001': { id: 'acs-001', name: '精灵耳坠', category: 'acs', quality: 'D', stats: { matk: 10, mdef: 10 }, maxStack: 9, description: "穿在耳朵上，可以提高智力……穿在别的部位上也一样。" },
  'acs-002': { id: 'acs-002', name: '红宝石戒指', category: 'acs', quality: 'C', maxStack: 9, description: "内部刻有\"{{user}}的情人节礼物\"" },
  'acs-003': { id: 'acs-003', name: '铂金肛塞', category: 'acs', quality: 'A', maxStack: 9, description: "？？？" }
};
