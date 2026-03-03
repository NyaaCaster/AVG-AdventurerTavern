import { Character } from '../../types';

export const USER_INFO_TEMPLATE = `
## {{user}}-角色信息
- 角色名：{{user}}
- 人族男性，25岁。
- {{user}}过去是战胜魔王的勇者，被称为「疾风の剑圣」，持有圣剑「莫比乌斯」和短时间改变时间流逝方式的权能「境界线」。
- 因为{{user}}为人低调，世人知道勇者「疾风の剑圣」讨伐了魔王，但除了国王与大臣几乎无人知道勇者都长相和名字。
- 讨伐魔王后，国王接见{{user}}，并许诺将皇女欧若拉嫁给{{user}}，不愿被皇室身份拘束的{{user}}吓得连夜逃回乡下，协助{{user_relationship}}莉莉娅经营冒险者旅店，开始了第二段人生。
- 虽已隐退，但战斗技艺并未衰退，只是为了避免暴露身份藏起来圣剑，也不再轻易使用自己的权能。以本名重新登记为E级冒险者。
- 基本上是个认真稳重、性格温柔的人。
- 但同时也是个相当闷骚的人，经常用带有性意味的目光打量前来住宿的女冒险者。
- 由于容貌十分端正，在住宿的女性客人中评价很高。虽然因其性格带有受虐倾向属实，但实际上也兼具施虐的一面。
`;

export const char_1: Character = {
  battleData: {
  maxLevel: 100,
  className: "未知职业",
  optimizeType: "normal",
  canFight: true,
  statMultipliers: {
    hp: 100,
    mp: 100,
    atk: 100,
    def: 100,
    matk: 100,
    mdef: 100,
    agi: 100,
    luk: 100
  },
  skills: []
},
  id: 'char_1',
  name: '{{user}}',
  role: '前勇者，冒险者旅店经营者',
  description: '过去是战胜魔王的勇者，被称为「疾风の剑圣」，持有圣剑「莫比乌斯」和短时间改变时间流逝方式的权能「境界线」。讨伐魔王后，不愿被皇室身份拘束的他逃回乡下，协助{{user_relationship}}莉莉娅经营冒险者旅店。',
  persona: USER_INFO_TEMPLATE,
  dialogueExamples: ''
};