export interface SkillEffect {
  code: number;
  dataId: number;
  value1: number;
  value2: number;
}

export interface SkillDamage {
  critical: boolean;
  elementId: number;
  formula: string;
  type: number;
  variance: number;
}

export interface SkillData {
  id: number;
  animationId: number;
  damage: SkillDamage;
  description: string;
  effects: SkillEffect[];
  hitType: number;
  iconIndex: number;
  message1: string;
  name: string;
  note: string;
  occasion: number;
  scope: number;
  speed: number;
  stypeId: number;
  successRate: number;
  tpGain: number;
}

export const SKILLS: SkillData[] = [
  {
    "id": 1,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1101,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 76,
    "message1": "%1的攻击！",
    "name": "攻击",
    "note": "<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n0 < Target HP\n</All AI Conditions>\n<TargetPercent:10>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 0,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 6,
    "animationId": 66,
    "damage": {
      "critical": false,
      "elementId": 2,
      "formula": "Math.max(a.mat * 4 - b.mdf * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌单体造成炎属性小伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 64,
    "message1": "%1吟唱了%2！",
    "name": "火焰",
    "note": "\n<All AI Conditions>\n30% Chance\n</All AI Conditions>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 7,
    "animationId": 73,
    "damage": {
      "critical": false,
      "elementId": 3,
      "formula": "Math.max(a.mat * 3 - b.mdf * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成冰属性小伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 65,
    "message1": "%1吟唱了%2！",
    "name": "冰冻",
    "note": "\n<All AI Conditions>\n20% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 8,
    "animationId": 639,
    "damage": {
      "critical": false,
      "elementId": 4,
      "formula": "a.mat * 0.75",
      "type": 1,
      "variance": 20
    },
    "description": "对随机4名敌人造成雷属性小伤害。（无视防御）",
    "effects": [],
    "hitType": 2,
    "iconIndex": 66,
    "message1": "%1吟唱了%2！",
    "name": "雷电",
    "note": "\n<All AI Conditions>\n20% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 20,
    "animationId": 39,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "Math.max(a.atk * 4 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成伤害，并破坏其平衡。",
    "effects": [
      {
        "code": 21,
        "dataId": 13,
        "value1": 0.5,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 78,
    "message1": "%1进行了%2！",
    "name": "冲撞",
    "note": "<All AI Conditions>\n30% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 36,
    "animationId": 93,
    "damage": {
      "critical": true,
      "elementId": 7,
      "formula": "Math.min(50 + a.atk * 2, 200)",
      "type": 1,
      "variance": 20
    },
    "description": "对全体敌人造成风属性伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 69,
    "message1": "%1释放了%2！",
    "name": "镰鼬",
    "note": "<All AI Conditions>\n20% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 37,
    "animationId": 68,
    "damage": {
      "critical": true,
      "elementId": 2,
      "formula": "Math.min(30 + a.atk * 2, 200)",
      "type": 1,
      "variance": 20
    },
    "description": "对全体敌人造成炎属性伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 64,
    "message1": "%1释放了%2！",
    "name": "火焰吐息",
    "note": "<All AI Conditions>\n20% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 38,
    "animationId": 74,
    "damage": {
      "critical": true,
      "elementId": 3,
      "formula": "Math.min(30 + a.atk * 2, 200)",
      "type": 1,
      "variance": 20
    },
    "description": "对全体敌人造成冰属性伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 65,
    "message1": "%1释放了%2！",
    "name": "寒冰吐息",
    "note": "<All AI Conditions>\n20% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 39,
    "animationId": 89,
    "damage": {
      "critical": true,
      "elementId": 6,
      "formula": "Math.min(100 + a.atk, 200)",
      "type": 1,
      "variance": 20
    },
    "description": "对全体敌人造成土属性伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 68,
    "message1": "%1引发了%2！",
    "name": "地震",
    "note": "<All AI Conditions>\n20% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 41,
    "animationId": 17,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "Math.max(a.atk * 4.5 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 105,
    "message1": "%1的%2！",
    "name": "抓击",
    "note": "<All AI Conditions>\n25% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 5
  },
  {
    "id": 42,
    "animationId": 123,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "Math.max(a.atk * 3 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 13,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 599,
    "message1": "%1的%2！",
    "name": "缠绕",
    "note": "<All AI Conditions>\n25% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 5
  },
  {
    "id": 44,
    "animationId": 12,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "Math.min(a.atk * 3, 500)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 107,
    "message1": "%1的%2！",
    "name": "防御穿透",
    "note": "<All AI Conditions>\n25% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 5
  },
  {
    "id": 45,
    "animationId": 59,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "Math.max(a.atk * 4 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成伤害。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 21,
        "dataId": 4,
        "value1": 0.5,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 105,
    "message1": "%1的%2！",
    "name": "毒攻击",
    "note": "<All AI Conditions>\n25% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 5
  },
  {
    "id": 46,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "Math.max(a.atk * 2.5 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对随机敌方单体进行4次攻击。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 77,
    "message1": "%1进行了%2！",
    "name": "大闹一番",
    "note": "<All AI Conditions>\n25% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 242,
    "animationId": 511,
    "damage": {
      "critical": false,
      "elementId": 6,
      "formula": "Math.max(a.atk * 3.5 - b.def * 2, 150)",
      "type": 1,
      "variance": 20
    },
    "description": "对全体敌人造成土属性伤害。",
    "effects": [],
    "hitType": 1,
    "iconIndex": 68,
    "message1": "%1发动了%2！",
    "name": "大地之怒",
    "note": "<All AI Conditions>\n10% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 244,
    "animationId": 434,
    "damage": {
      "critical": false,
      "elementId": 2,
      "formula": "Math.max(a.mat * 3 - b.mdf * 2, 250)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成火属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 64,
    "message1": "%1发动了%2！",
    "name": "地狱灼热",
    "note": "<All AI Conditions>\n15% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 251,
    "animationId": 23,
    "damage": {
      "critical": false,
      "elementId": -1,
      "formula": "Math.max(a.atk * 3 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 97,
    "message1": "%1释放了%2！",
    "name": "神速斩",
    "note": "<Common Event Key: EnemySkill>\n<All AI Conditions>\n15% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 252,
    "animationId": 26,
    "damage": {
      "critical": false,
      "elementId": -1,
      "formula": "Math.max(a.atk * 3 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方4体随机进行4次攻击。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 107,
    "message1": "%1释放了%2！",
    "name": "乱突",
    "note": "<Common Event Key: EnemySkill>\n<All AI Conditions>\n15% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 256,
    "animationId": 289,
    "damage": {
      "critical": false,
      "elementId": 7,
      "formula": "Math.max(200 + a.mat * 2 - b.mdf * 2, 200)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成风属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 69,
    "message1": "%1吟唱了%2！",
    "name": "风刃",
    "note": "\n<All AI Conditions>\n30% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 259,
    "animationId": 288,
    "damage": {
      "critical": false,
      "elementId": 7,
      "formula": "Math.max(100 + a.mat * 2 - b.mdf * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对全体敌人造成风属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 69,
    "message1": "%1吟唱了%2！",
    "name": "龙卷风",
    "note": "\n<All AI Conditions>\n10% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 271,
    "animationId": 103,
    "damage": {
      "critical": false,
      "elementId": 9,
      "formula": "Math.max(100 + a.mat * 2 - b.mdf * 2, 300)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成暗属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 71,
    "message1": "%1吟唱了%2！",
    "name": "暗黑领域",
    "note": "\n<All AI Conditions>\n10% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 2,
    "speed": -6,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 281,
    "animationId": 2,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "Math.max(a.atk * 5 - b.def * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体进行强力攻击。",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 77,
    "message1": "%1释放了%2！",
    "name": "强力一击",
    "note": "<Common Event Key: EnemySkill>\n<All AI Conditions>\n15% Chance\n</All AI Conditions>\n<Cooldown: 2>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 287,
    "animationId": 146,
    "damage": {
      "critical": false,
      "elementId": 9,
      "formula": "Math.max(a.mat * 3.5 - b.mdf * 2, 300)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成暗属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 71,
    "message1": "%1释放了%2！",
    "name": "血雨",
    "note": "<All AI Conditions>\n15% Chance\n</All AI Conditions>\n<Cooldown: 2>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 288,
    "animationId": 147,
    "damage": {
      "critical": false,
      "elementId": 9,
      "formula": "Math.max(a.mat * 3 - b.mdf * 2, 300)",
      "type": 1,
      "variance": 20
    },
    "description": "对随机4名敌人造成暗属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 71,
    "message1": "%1释放了%2！",
    "name": "血陨石",
    "note": "<All AI Conditions>\n20% Chance\n</All AI Conditions>\n<Cooldown: 2>\n",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 3,
    "successRate": 75,
    "tpGain": 0
  },
  {
    "id": 289,
    "animationId": 148,
    "damage": {
      "critical": false,
      "elementId": 9,
      "formula": "Math.max(150 + a.mat * 2 - b.mdf * 2, 300)",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成暗属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 71,
    "message1": "%1释放了%2！",
    "name": "暗黑能量",
    "note": "<All AI Conditions>\n10% Chance\n</All AI Conditions>\n<Cooldown: 2>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 290,
    "animationId": 220,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "Math.max(a.mat * 2 - b.mdf * 2, 100)",
      "type": 1,
      "variance": 20
    },
    "description": "使敌方全体强化无效",
    "effects": [
      {
        "code": 33,
        "dataId": 2,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 33,
        "dataId": 4,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 33,
        "dataId": 3,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 33,
        "dataId": 5,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 71,
    "message1": "%1释放了%2！",
    "name": "虚无波动",
    "note": "<SkillConsecutive>\n291, 1, true\n</SkillConsecutive>\n<Any AI Conditions>\nTarget Has atk buff stacks > 0\nTarget Has def buff stacks > 0\nTarget Has mat buff stacks > 0\nTarget Has mdf buff stacks > 0\nUser Has atk debuff stacks > 0\nUser Has def debuff stacks > 0\nUser Has mat debuff stacks > 0\nUser Has mdf debuff stacks > 0\nUser Has State 101\nUser Has State 102\nUser Has State 103\nUser Has State 104\nUser Has State 105\nUser Has State 106\nUser Has State 107\nUser Has State 108\n</Any AI Conditions>\n<All AI Conditions>\n50% Chance\n</All AI Conditions>\n",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 7,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 294,
    "animationId": 773,
    "damage": {
      "critical": false,
      "elementId": -1,
      "formula": "Math.max(a.atk * 5 - b.def * 2, 500)",
      "type": 0,
      "variance": 0
    },
    "description": "",
    "effects": [
      {
        "code": 34,
        "dataId": 2,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 34,
        "dataId": 4,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 34,
        "dataId": 3,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 34,
        "dataId": 5,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 101,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 102,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 103,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 104,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 105,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 106,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 107,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 108,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 11,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 4,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 64,
    "message1": "%1的状态异常被烧尽了！",
    "name": "燃尽波动",
    "note": "<SkillConsecutive>\n295, 1, true\n</SkillConsecutive>\n<Any AI Conditions>\nTarget Has atk buff stacks > 0\nTarget Has def buff stacks > 0\nTarget Has mat buff stacks > 0\nTarget Has mdf buff stacks > 0\nUser Has atk debuff stacks > 0\nUser Has def debuff stacks > 0\nUser Has mat debuff stacks > 0\nUser Has mdf debuff stacks > 0\nUser Has State 101\nUser Has State 102\nUser Has State 103\nUser Has State 104\nUser Has State 105\nUser Has State 106\nUser Has State 107\nUser Has State 108\n</Any AI Conditions>\n<All AI Conditions>\n50% Chance\n</All AI Conditions>",
    "occasion": 1,
    "scope": 11,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 511,
    "animationId": 41,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "a.mhp * 0.6",
      "type": 3,
      "variance": 20
    },
    "description": "将使用者的HP恢复至最大HP的60%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1进行了%2！",
    "name": "冥想",
    "note": "\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3511) === false\n$gameVariables.value(4049) === 0\nUser HP% <= 50%\n</All AI Conditions>\n<//Cooldown: 4>\n<SkillUnlockRate:35, 10>\n<OrderId:2020>",
    "occasion": 1,
    "scope": 11,
    "speed": 0,
    "stypeId": 8,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 512,
    "animationId": 41,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "a.mhp * 0.5",
      "type": 3,
      "variance": 20
    },
    "description": "将我方单体的HP恢复至最大HP的50%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1进行了%2！",
    "name": "应急处理",
    "note": "\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3512) === false\n$gameVariables.value(4049) === 0\nLowest HP% <= 50%\n</All AI Conditions>\n<//Cooldown: 4>\n<SkillUnlockRate:35, 10>\n<OrderId:2020>",
    "occasion": 1,
    "scope": 7,
    "speed": 0,
    "stypeId": 8,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 514,
    "animationId": 58,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "Math.min(a.mhp / 2, a.mhp - a.hp)",
      "type": 5,
      "variance": 20
    },
    "description": "",
    "effects": [],
    "hitType": 1,
    "iconIndex": 659,
    "message1": "%1释放了%2！",
    "name": "生命偷取",
    "note": "<DescriptionResult:最大HP-残HP>\n<DescriptionResultAfter:<最大ダメージ:最大HP÷2>>\n<Learn AP Cost: \\v[626]>\n\n<AI Target: Highest HP>\n<All AI Conditions>\n$gameSwitches.value(3514) === false\nUser HP% <= 50%\n</All AI Conditions>\n<//Cooldown: 5>\n<SkillUnlockRate:35, 10>\n<TargetPercent:20>\n<OrderId:2030>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 517,
    "animationId": 26,
    "damage": {
      "critical": false,
      "elementId": -1,
      "formula": "a.atk * 3 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 107,
    "message1": "%1释放了%2！",
    "name": "乱突",
    "note": "<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3517) === false\n50% <= User HP%\n0 < a.param(2) * 3 - b.param(3) * 2\n</All AI Conditions>\n<//Cooldown: 3>\n<SkillUnlockRate:40, 10>\n<//Warmup: 3>\n<//HP Cost: 10%>\n<TargetPercent:10>\n<OrderId:2032>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 518,
    "animationId": 161,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "a.atk * 8 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 21,
        "dataId": 0,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 1120,
    "message1": "%1释放了%2！",
    "name": "剑闪乱舞",
    "note": "<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3518) === false\n50% <= User HP%\n0 < a.param(2) * 8 - b.param(3) * 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 8 - b.param(3) * 2\n</Any AI Conditions>\n<TargetPercent:50>\n<//Cooldown: 3>\n<SkillUnlockRate:40, 10>\n<//Warmup: 3>\n<//HP Cost: 10%>\n<OrderId:2035>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 521,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "a.atk * 6 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 535,
    "message1": "%1释放了%2！",
    "name": "强击",
    "note": "<SkillUnlockRate:90,10>\n<Learn AP Cost: \\v[624]>\n<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3521) === false\n65% <= User HP%\n0 < a.param(2) * 6 - b.param(3) * 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 6 - b.param(3) * 2\n</Any AI Conditions>\n<TargetPercent:50>\n<OrderId:2030>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 524,
    "animationId": 201,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 32,
        "dataId": 3,
        "value1": 3,
        "value2": 0
      },
      {
        "code": 32,
        "dataId": 5,
        "value1": 3,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 59,
    "message1": "%1释放了%2！",
    "name": "破防",
    "note": "<Learn AP Cost: \\v[624]>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3524) === false\n60% <= User HP%\ntarget def debuff stacks < 2\n0 < a.param(2) * 4 - b.param(3) * 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 4 - b.param(3) * 2\n</Any AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<TargetPercent:30>\n<OrderId:2061>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 525,
    "animationId": 203,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 32,
        "dataId": 2,
        "value1": 3,
        "value2": 0
      },
      {
        "code": 32,
        "dataId": 4,
        "value1": 3,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 671,
    "message1": "%1释放了%2！",
    "name": "力量破碎",
    "note": "<Learn AP Cost: \\v[624]>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3525) === false\n60% <= User HP%\ntarget atk debuff stacks < 2\n0 < a.param(2) * 4 - b.param(3) * 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 4 - b.param(3) * 2\n</Any AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<TargetPercent:30>\n<OrderId:2060>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 526,
    "animationId": 838,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 8 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [],
    "hitType": 1,
    "iconIndex": 538,
    "message1": "%1释放了%2！",
    "name": "蓄力攻击",
    "note": "<Learn AP Cost: \\v[622]>\n<//Warmup: 5>\n<//Cooldown: 5>\n<SkillUnlockRate:35, 10>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3526) === false\n80% <= User HP%\n0 < a.param(2) * 8 - b.param(3) * 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 8 - b.param(3) * 2\n</Any AI Conditions>\n<TargetPercent:50>\n<OrderId:2036>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 527,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 669,
    "message1": "%1释放了%2！",
    "name": "力量提升",
    "note": "<Cast Animation: 414>\n<BuffControlSelf: atk, 3, 1, 0, true>\n<BuffControlSelf: mat, 3, 1, 0, true>\n<AddInfoWindowP:\\C[4]強化付与:\\C[6]攻撃力 3ターン>\n<AddInfoWindowP:\\C[4]強化付与:\\C[6]魔法力 3ターン>\n<Learn AP Cost: \\v[624]>\n<//AutoDescriptionOff>\n<//DescriptionAdd:自分の攻撃力魔法力を20%上昇（上限40%）させ、>\n<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3527) === false\nuser atk buff stacks < 2\n60% <= User HP%\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\n</Any AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<TargetPercent:30>\n<OrderId:2050>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 528,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 43,
    "message1": "%1释放了%2！",
    "name": "防御提升",
    "note": "<Cast Animation: 202>\n<BuffControlSelf: def, 3, 1, 0, true>\n<BuffControlSelf: mdf, 3, 1, 0, true>\n<AddInfoWindowP:\\C[4]強化付与:\\C[6]防御力 3ターン>\n<AddInfoWindowP:\\C[4]強化付与:\\C[6]魔法防御 3ターン>\n<Learn AP Cost: \\v[624]>\n<//AutoDescriptionOff>\n<//DescriptionAdd:自分の防御力魔法防御を20%上昇（上限40%）させ、>\n<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3528) === false\nuser def buff stacks < 2\n60% <= User HP%\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\n</Any AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<TargetPercent:30>\n<OrderId:2051>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 529,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "a.atk * 3 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 78,
    "message1": "%1释放了%2！",
    "name": "全体攻击",
    "note": "<Learn AP Cost: \\v[625]>\n<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3529) === false\n70% <= User HP%\n0 < a.param(2) * 3 - b.param(3) * 2\nTarget Team Alive Members >= 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 3 - b.param(3) * 2\n</Any AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<TargetPercent:10>\n<OrderId:2030>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 531,
    "animationId": 469,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "300 + a.mat",
      "type": 3,
      "variance": 20
    },
    "description": "小幅回复我方单体的HP。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "治疗Ⅰ",
    "note": "<Learn AP Cost: \\v[624]>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3531) === false\n$gameVariables.value(4049) === 0\nLowest HP% < 75%\n</All AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<OrderId:2201>",
    "occasion": 1,
    "scope": 7,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 532,
    "animationId": 470,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "700 + a.mat",
      "type": 3,
      "variance": 20
    },
    "description": "中幅回复我方单体的HP。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "治疗Ⅱ",
    "note": "<Learn Require Level: 10>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3532) === false\n$gameVariables.value(4049) === 0\nLowest HP% < 75%\n$gameSwitches.value(702) === false\n</All AI Conditions>\n<//Warmup: 1>\n<//Cooldown: 3>\n<SkillUnlockRate:50, 10>\n<OrderId:2202>",
    "occasion": 1,
    "scope": 7,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 533,
    "animationId": 471,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "1200 + a.mat",
      "type": 3,
      "variance": 20
    },
    "description": "大幅回复我方单体的HP。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "治疗Ⅲ",
    "note": "<Learn Require Level: 20>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3533) === false\n$gameVariables.value(4049) === 0\nLowest HP% < 75%\n$gameSwitches.value(703) === false\n</All AI Conditions>\n<//Warmup: 3>\n<//Cooldown: 5>\n<SkillUnlockRate:30, 10>\n<OrderId:2203>",
    "occasion": 1,
    "scope": 7,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 534,
    "animationId": 472,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "200 + a.mat",
      "type": 3,
      "variance": 20
    },
    "description": "小幅回复我方全体的HP。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "恢复Ⅰ",
    "note": "<Learn AP Cost: \\v[626]>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3534) === false\n$gameVariables.value(4049) === 0\n$gameSwitches.value(702) === true\n</All AI Conditions>\n<//Cooldown: 3>\n<SkillUnlockRate:50, 10>\n<OrderId:2211>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 535,
    "animationId": 43,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "400 + a.mat",
      "type": 3,
      "variance": 20
    },
    "description": "中幅回复我方全体的HP。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "恢复Ⅱ",
    "note": "<Learn Require Level: 10>\n<//Learn AP Cost: \\v[625]>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3535) === false\n$gameVariables.value(4049) === 0\n$gameSwitches.value(703) === true\n</All AI Conditions>\n<//Warmup: 1>\n<//Cooldown: 5>\n<SkillUnlockRate:35, 10>\n<OrderId:2212>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 536,
    "animationId": 473,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "800 + a.mat",
      "type": 3,
      "variance": 20
    },
    "description": "大幅回复我方全体的HP。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "恢复Ⅲ",
    "note": "<Learn Require Level: 20>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3536) === false\n$gameVariables.value(4049) === 0\n$gameSwitches.value(704) === true\n</All AI Conditions>\n<//Warmup: 3>\n<//Cooldown: 7>\n<SkillUnlockRate:20, 10>\n<OrderId:2213>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 537,
    "animationId": 484,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "200 + a.mat",
      "type": 0,
      "variance": 20
    },
    "description": "治疗我方单体的中毒・麻痹・睡眠状态。",
    "effects": [
      {
        "code": 22,
        "dataId": 4,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 10,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 12,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 2510,
    "message1": "%1吟唱了%2！",
    "name": "治愈Ⅰ",
    "note": "\n<AI Target: Highest Negative State Count>\n<All AI Conditions>\n$gameSwitches.value(3537) === false\n$gameVariables.value(4049) === 0\n</All AI Conditions>\n<Any AI Conditions>\nTarget Has State 4\nTarget Has State 10\nTarget Has State 12\n</Any AI Conditions>\n<//Cooldown: 3>\n<SkillUnlockRate:70, 10>\n<OrderId:2231>",
    "occasion": 1,
    "scope": 7,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 538,
    "animationId": 483,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "200 + a.mat",
      "type": 0,
      "variance": 20
    },
    "description": "治疗我方单体除战斗不能外的异常状态。",
    "effects": [
      {
        "code": 22,
        "dataId": 4,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 5,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 6,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 7,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 8,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 9,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 10,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 12,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 2510,
    "message1": "%1吟唱了%2！",
    "name": "治愈Ⅱ",
    "note": "<Learn Require Level: 10>\n\n<AI Target: Highest Negative State Count>\n<All AI Conditions>\n$gameSwitches.value(3538) === false\n$gameVariables.value(4049) === 0\n</All AI Conditions>\n<Any AI Conditions>\nTarget Has State 4\nTarget Has State 5\nTarget Has State 6\nTarget Has State 7\nTarget Has State 8\nTarget Has State 9\nTarget Has State 10\nTarget Has State 12\n</Any AI Conditions>\n<//Cooldown: 5>\n<SkillUnlockRate:50, 10>\n<OrderId:2232>",
    "occasion": 1,
    "scope": 7,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 539,
    "animationId": 47,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "200 + a.mat",
      "type": 0,
      "variance": 20
    },
    "description": "治疗我方全体除战斗不能外的异常状态。",
    "effects": [
      {
        "code": 22,
        "dataId": 4,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 5,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 6,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 7,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 8,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 9,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 10,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 22,
        "dataId": 12,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 2,
    "iconIndex": 2510,
    "message1": "%1吟唱了%2！",
    "name": "治愈Ⅲ",
    "note": "<Learn Require Level: 20>\n\n<AI Target: Highest Negative State Count>\n<All AI Conditions>\n$gameSwitches.value(3539) === false\n$gameVariables.value(4049) === 0\n$gameSwitches.value(705) === true\n</All AI Conditions>\n<//Cooldown: 7>\n<SkillUnlockRate:30, 10>\n<OrderId:2233>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 540,
    "animationId": 486,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "b.mhp / 5",
      "type": 3,
      "variance": 20
    },
    "description": "使我方单体从战斗不能状态复活。",
    "effects": [
      {
        "code": 22,
        "dataId": 1,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "复活Ⅰ",
    "note": "<Learn AP Cost: \\v[626]>\n<AI Target: Highest Level>\n<All AI Conditions>\n$gameSwitches.value(3540) === false\n$gameVariables.value(4049) === 0\n$gameParty.aliveMembers().length < 4\n</All AI Conditions>\n<//Cooldown: 3>\n<SkillUnlockRate:50, 10>\n<OrderId:2221>",
    "occasion": 1,
    "scope": 9,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 541,
    "animationId": 487,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "b.mhp / 2",
      "type": 3,
      "variance": 20
    },
    "description": "使我方单体从战斗不能状态复活，并大幅恢复HP。",
    "effects": [
      {
        "code": 22,
        "dataId": 1,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "复活Ⅱ",
    "note": "<Learn Require Level: 10>\n<AI Target: Highest Level>\n<All AI Conditions>\n$gameSwitches.value(3541) === false\n$gameVariables.value(4049) === 0\n$gameParty.aliveMembers().length < 4\n</All AI Conditions>\n<//Cooldown: 6>\n<SkillUnlockRate:30, 10>\n<OrderId:2222>",
    "occasion": 1,
    "scope": 9,
    "speed": 0,
    "stypeId": 4,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 542,
    "animationId": 97,
    "damage": {
      "critical": false,
      "elementId": 8,
      "formula": "a.mat * 4 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成光属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 70,
    "message1": "%1吟唱了%2！",
    "name": "圣光术",
    "note": "<JS Targets>\nconst actor = this.subject();\nconsole.log(\"Actor:\", actor);\n\n// 防具ID 1805が装備されていない場合の処理\nif (!actor.equips().some(item => item && item.id === 1805)) {\n    // 手動でターゲットが選択されているか（this._targetIndex が -1 でないか）で分岐\n    if (this._targetIndex !== -1) {\n        console.log(\"Armor ID 1805 not equipped, using user selected target.\");\n        // ユーザーが選択したターゲットを取得（対象が敵の場合を想定）\n        const userTarget = $gameTroop.members()[this._targetIndex];\n        if (userTarget) {\n            console.log(\"User selected target:\", userTarget.name());\n            return [userTarget];\n        } else {\n            console.log(\"No user selected target available.\");\n            return [];\n        }\n    } else {\n        // ターゲットが未選択（＝オートバトル中とみなす）場合は AI 選定処理へ進む\n        console.log(\"Armor ID 1805 not equipped, but no manual target selected (auto battle), proceeding with AI target selection.\");\n    }\n}\n\n// 以下、防具ID 1805装備時、またはオートバトル時の AI によるターゲット選定処理\n\nconst enemies = $gameTroop.aliveMembers();\nconsole.log(\"Total enemies:\", enemies.length);\n\n// AIの基本条件でフィルタリング\nconst validEnemies = enemies.filter(enemy => {\n    const condition1 = !enemy.isStateAffected(11); // Target Not State 11\n    const condition2 = (0 < (actor.param(4) * 4 - enemy.param(5) * 2)); // ダメージが0より大きい\n    if (!condition1) console.log(enemy.name(), \"is affected by state 11.\");\n    if (!condition2) console.log(enemy.name(), \"does not satisfy the damage condition.\");\n    return condition1 && condition2;\n});\nconsole.log(\"Valid enemies after filtering:\", validEnemies.length);\n\nif (validEnemies.length === 0) {\n    console.log(\"No valid enemies found.\");\n    return [];\n}\n\n// ダメージ計算関数（ステート1008の場合は2倍）\nconst calculateDamage = (enemy) => {\n    let damage = actor.param(4) * 4 - enemy.param(5) * 2;\n    if (enemy.isStateAffected(1008)) {\n        damage *= 2;\n    }\n    return damage;\n};\n\n// 倒せる敵をフィルタリング（ダメージ計算を考慮）\nconst killableEnemies = validEnemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    const killable = enemy.hp <= dmg;\n    console.log(\"Evaluating\", enemy.name(), \"- HP:\", enemy.hp, \", Calculated Damage:\", dmg, \", Killable:\", killable);\n    return killable;\n});\nconsole.log(\"Killable enemies count:\", killableEnemies.length);\n\n// ステート1008を持つ敵のフィルタリング\nconst state1008Enemies = validEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1008);\n    if (hasState) console.log(enemy.name(), \"has state 1008.\");\n    return hasState;\n});\nconsole.log(\"Enemies with state 1008 count:\", state1008Enemies.length);\n\n// ステート1008を持つ敵の中で倒せる敵をフィルタリング\nconst killableState1008Enemies = killableEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1008);\n    if (hasState) console.log(enemy.name(), \"is killable and has state 1008.\");\n    return hasState;\n});\nconsole.log(\"Killable enemies with state 1008 count:\", killableState1008Enemies.length);\n\n// ステート1008を持つが倒せない敵をフィルタリング\nconst nonKillableState1008Enemies = state1008Enemies.filter(enemy => {\n    const nonKillable = enemy.hp > calculateDamage(enemy);\n    if (nonKillable) console.log(enemy.name(), \"has state 1008 but is not killable.\");\n    return nonKillable;\n});\nconsole.log(\"Non-killable enemies with state 1008 count:\", nonKillableState1008Enemies.length);\n\nlet target;\nif (killableState1008Enemies.length > 0) {\n    // 1. ステート1008持ちで倒せる敵を最優先\n    target = killableState1008Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable state 1008 enemy:\", target.name());\n} else if (killableEnemies.length > 0) {\n    // 2. その他の倒せる敵を次に優先\n    target = killableEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable enemy:\", target.name());\n} else if (nonKillableState1008Enemies.length > 0) {\n    // 3. ステート1008を持つが倒せない敵を選択\n    target = nonKillableState1008Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected non-killable state 1008 enemy:\", target.name());\n} else {\n    // 4. それ以外はHP最小の敵を選択\n    target = validEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected lowest HP enemy:\", target.name());\n}\n\nconsole.log(\"Final target set:\", target.name());\nreturn [target];\n</JS Targets>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3542) === false\n0 < a.param(4) * 4 - b.param(5) * 2\nTarget Not State 11\n</All AI Conditions>\n\n<Any AI Conditions>\nTarget HP <= a.param(4) * 4 - b.param(5) * 2\na.param(4) * 4 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2)\n</Any AI Conditions>\n\n<TargetPercent:-2>\n<//Cooldown: 3>\n<SkillUnlockRate:80, 10>\n<OrderId:2341>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 543,
    "animationId": 100,
    "damage": {
      "critical": false,
      "elementId": 8,
      "formula": "a.mat * 6 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成光属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 70,
    "message1": "%1吟唱了%2！",
    "name": "星光闪耀",
    "note": "<Learn Require Level: 10>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3543) === false\n$gameSwitches.value(701) === false\nTarget Team Alive Members >= 1\n0 < a.param(4) * 6 - b.param(5) * 2\nTarget Not State 11\n</All AI Conditions>\n<Any AI Conditions>\nTarget HP <= a.param(4) * 6 - b.param(5) * 2\na.param(4) * 6 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2)\n</Any AI Conditions>\n<TargetPercent:-2>\n<//Cooldown: 6>\n<SkillUnlockRate:60, 10>\n<OrderId:2342>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 545,
    "animationId": 101,
    "damage": {
      "critical": false,
      "elementId": 9,
      "formula": "a.mat * 5 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成暗属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 71,
    "message1": "%1吟唱了%2！",
    "name": "暗影",
    "note": "<JS Targets>\nconst actor = this.subject();\nconsole.log(\"Actor:\", actor);\n\n// 防具ID 1805が装備されていない場合の処理\nif (!actor.equips().some(item => item && item.id === 1805)) {\n    // 手動でターゲットが選択されているか（this._targetIndex が -1 でないか）で分岐\n    if (this._targetIndex !== -1) {\n        console.log(\"Armor ID 1805 not equipped, using user selected target.\");\n        // ユーザーが選択したターゲットを取得（対象が敵の場合を想定）\n        const userTarget = $gameTroop.members()[this._targetIndex];\n        if (userTarget) {\n            console.log(\"User selected target:\", userTarget.name());\n            return [userTarget];\n        } else {\n            console.log(\"No user selected target available.\");\n            return [];\n        }\n    } else {\n        // ターゲットが未選択（＝オートバトル中とみなす）場合は AI 選定処理へ進む\n        console.log(\"Armor ID 1805 not equipped, but no manual target selected (auto battle), proceeding with AI target selection.\");\n    }\n}\n\n// 以下、防具ID 1805装備時、またはオートバトル時の AI によるターゲット選定処理\n\n\nconst enemies = $gameTroop.aliveMembers();\nconsole.log(\"Total enemies:\", enemies.length);\n\n// AIの基本条件でフィルタリング\nconst validEnemies = enemies.filter(enemy => {\n    const condition1 = !enemy.isStateAffected(11); // Target Not State 11\n    const condition2 = (0 < (actor.param(4) * 5 - enemy.param(5) * 2)); // ダメージが0より大きい\n    const condition3 = (actor.hp / actor.mhp >= 0.6); // User HP% >= 60%\n    if (!condition1) console.log(enemy.name(), \"is affected by state 11.\");\n    if (!condition2) console.log(enemy.name(), \"does not satisfy the damage condition.\");\n    if (!condition3) console.log(\"User HP below 60%.\");\n    return condition1 && condition2 && condition3;\n});\nconsole.log(\"Valid enemies after filtering:\", validEnemies.length);\n\nif (validEnemies.length === 0) {\n    console.log(\"No valid enemies found.\");\n    targets = [];\n    return;\n}\n\n// ダメージ計算関数（ステート1009の場合は2倍）\nconst calculateDamage = (enemy) => {\n    let damage = actor.param(4) * 5 - enemy.param(5) * 2;\n    if (enemy.isStateAffected(1009)) {\n        damage *= 2;\n    }\n    return damage;\n};\n\n// 倒せる敵をフィルタリング（ダメージ計算を考慮）\nconst killableEnemies = validEnemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    const killable = enemy.hp <= dmg;\n    console.log(\"Evaluating\", enemy.name(), \"- HP:\", enemy.hp, \", Calculated Damage:\", dmg, \", Killable:\", killable);\n    return killable;\n});\nconsole.log(\"Killable enemies count:\", killableEnemies.length);\n\n// ステート1009を持つ敵のフィルタリング\nconst state1009Enemies = validEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1009);\n    if (hasState) console.log(enemy.name(), \"has state 1009.\");\n    return hasState;\n});\nconsole.log(\"Enemies with state 1009 count:\", state1009Enemies.length);\n\n// ステート1009を持つ敵の中で倒せる敵をフィルタリング\nconst killableState1009Enemies = killableEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1009);\n    if (hasState) console.log(enemy.name(), \"is killable and has state 1009.\");\n    return hasState;\n});\nconsole.log(\"Killable enemies with state 1009 count:\", killableState1009Enemies.length);\n\n// ステート1009を持つが倒せない敵をフィルタリング\nconst nonKillableState1009Enemies = state1009Enemies.filter(enemy => {\n    const nonKillable = enemy.hp > calculateDamage(enemy);\n    if (nonKillable) console.log(enemy.name(), \"has state 1009 but is not killable.\");\n    return nonKillable;\n});\nconsole.log(\"Non-killable enemies with state 1009 count:\", nonKillableState1009Enemies.length);\n\nlet target;\nif (killableState1009Enemies.length > 0) {\n    // 1. ステート1009持ちで倒せる敵を最優先\n    target = killableState1009Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable state 1009 enemy:\", target.name());\n} else if (killableEnemies.length > 0) {\n    // 2. その他の倒せる敵を次に優先\n    target = killableEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable enemy:\", target.name());\n} else if (nonKillableState1009Enemies.length > 0) {\n    // 3. ステート1009を持つが倒せない敵を選択\n    target = nonKillableState1009Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected non-killable state 1009 enemy:\", target.name());\n} else {\n    // 4. それ以外はHP最小の敵を選択\n    target = validEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected lowest HP enemy:\", target.name());\n}\n\nconsole.log(\"Final target set:\", target.name());\ntargets = [target];\nreturn [target];\n</JS Targets>\n\n// === AI TAGS ===\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3545) === false\n60% <= User HP%\n0 < a.param(4) * 5 - b.param(5) * 2\nTarget Not State 11\n</All AI Conditions>\n\n<Any AI Conditions>\nTarget HP <= a.param(4) * 5 - b.param(5) * 2\na.param(4) * 5 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2)\n</Any AI Conditions>\n\n<TargetPercent:50>\n<//Cooldown: 3>\n<SkillUnlockRate:80, 10>\n<OrderId:2351>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 546,
    "animationId": 103,
    "damage": {
      "critical": false,
      "elementId": 9,
      "formula": "a.mat * 7 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成暗属性伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 71,
    "message1": "%1吟唱了%2！",
    "name": "暗黑领域",
    "note": "<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3546) === false\n$gameSwitches.value(701) === false\n70% <= User HP%\n0 < a.param(4) * 7 - b.param(5) * 2\nTarget Not State 11\n</All AI Conditions>\n<Any AI Conditions>\na.param(4) * 7 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2)\nTarget HP <= a.param(4) * 7 - b.param(5) * 2\n</Any AI Conditions>\n<TargetPercent:50>\n<//Cooldown: 6>\n<SkillUnlockRate:60, 10>\n<OrderId:2352>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 551,
    "animationId": 66,
    "damage": {
      "critical": false,
      "elementId": 2,
      "formula": "a.mat * 4 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌单体造成炎属性小伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 64,
    "message1": "%1吟唱了%2！",
    "name": "火焰Ⅰ",
    "note": "<JS Targets>\nconst actor = this.subject();\nconsole.log(\"Actor:\", actor);\n\n// 防具ID 1805が装備されていない場合の処理\nif (!actor.equips().some(item => item && item.id === 1805)) {\n    // 手動でターゲットが選択されているか（this._targetIndex が -1 でないか）で分岐\n    if (this._targetIndex !== -1) {\n        console.log(\"Armor ID 1805 not equipped, using user selected target.\");\n        // ユーザーが選択したターゲットを取得（対象が敵の場合を想定）\n        const userTarget = $gameTroop.members()[this._targetIndex];\n        if (userTarget) {\n            console.log(\"User selected target:\", userTarget.name());\n            return [userTarget];\n        } else {\n            console.log(\"No user selected target available.\");\n            return [];\n        }\n    } else {\n        // ターゲットが未選択（＝オートバトル中とみなす）場合は AI 選定処理へ進む\n        console.log(\"Armor ID 1805 not equipped, but no manual target selected (auto battle), proceeding with AI target selection.\");\n    }\n}\n\n// 以下、防具ID 1805装備時、またはオートバトル時の AI によるターゲット選定処理\n\nconst enemies = $gameTroop.aliveMembers();\nconsole.log(\"Total enemies:\", enemies.length);\n\n// AI の基本条件でフィルタリング\nconst validEnemies = enemies.filter(enemy => {\n    const physicalDamage = actor.param(4) * 4 - enemy.param(5) * 2;\n    const magicalDamage = actor.param(2) * 4 - enemy.param(3) * 2;\n    const condition1 = physicalDamage > 0;\n    const condition2 = physicalDamage >= magicalDamage;\n    if (!condition1) console.log(enemy.name(), \"damage is not greater than 0.\");\n    if (!condition2) console.log(enemy.name(), \"physical damage is less than magical damage.\");\n    return condition1 && condition2;\n});\n\nif (validEnemies.length === 0) {\n    console.log(\"No valid enemies found.\");\n    return [];\n}\n\n// ダメージ計算関数（ステート1002の場合は2倍）\nconst calculateDamage = (enemy) => {\n    let damage = actor.param(4) * 4 - enemy.param(5) * 2;\n    if (enemy.isStateAffected(1002)) {\n        damage *= 2;\n    }\n    return damage;\n};\n\n// 倒せる敵をフィルタリング（ダメージ計算を考慮）\nconst killableEnemies = validEnemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    console.log(\"Evaluating\", enemy.name(), \"- HP:\", enemy.hp, \", Calculated Damage:\", dmg);\n    return enemy.hp <= dmg;\n});\n\n// ステート1002を持つ敵のフィルタリング\nconst state1002Enemies = validEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1002);\n    if (hasState) console.log(enemy.name(), \"has state 1002.\");\n    return hasState;\n});\n\n// ステート1002を持つ敵の中で倒せる敵をフィルタリング\nconst killableState1002Enemies = killableEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1002);\n    if (hasState) console.log(enemy.name(), \"is killable and has state 1002.\");\n    return hasState;\n});\n\n// ステート1002を持つが倒せない敵をフィルタリング\nconst nonKillableState1002Enemies = state1002Enemies.filter(enemy => {\n    const nonKillable = enemy.hp > calculateDamage(enemy);\n    if (nonKillable) console.log(enemy.name(), \"has state 1002 but is not killable.\");\n    return nonKillable;\n});\n\nlet target;\nif (killableState1002Enemies.length > 0) {\n    // 1. ステート1002持ちで倒せる敵を最優先\n    target = killableState1002Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable state1002 enemy:\", target.name());\n} else if (killableEnemies.length > 0) {\n    // 2. その他の倒せる敵を次に優先\n    target = killableEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable enemy:\", target.name());\n} else if (nonKillableState1002Enemies.length > 0) {\n    // 3. ステート1002を持つが倒せない敵を選択\n    target = nonKillableState1002Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected non-killable state1002 enemy:\", target.name());\n} else {\n    // 4. それ以外は HP 最小の敵を選択\n    target = validEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected lowest HP enemy:\", target.name());\n}\n\nconsole.log(\"Final target set:\", target.name());\nreturn [target];\n</JS Targets>\n\n<Learn AP Cost: \\v[621]>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3551) === false\na.param(4) * 4 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2)\n0 < a.param(4) * 4 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:10>\n<OrderId:2301>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 552,
    "animationId": 73,
    "damage": {
      "critical": false,
      "elementId": 3,
      "formula": "a.mat * 3 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成冰属性小伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 65,
    "message1": "%1吟唱了%2！",
    "name": "冻结Ⅰ",
    "note": "<Learn AP Cost: \\v[621]>\n\n<AI Target: Lowest HP> \n<All AI Conditions>\n$gameSwitches.value(3552) === false\n40% <= User HP%\nTarget Team Alive Members >= 3\n0 < a.param(4) * 3 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:10>\n<OrderId:2311>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 553,
    "animationId": 76,
    "damage": {
      "critical": false,
      "elementId": 4,
      "formula": "a.mat * 1.1",
      "type": 1,
      "variance": 20
    },
    "description": "对随机4名敌人造成雷属性小伤害。（无视防御）",
    "effects": [],
    "hitType": 2,
    "iconIndex": 66,
    "message1": "%1吟唱了%2！",
    "name": "雷电Ⅰ",
    "note": "<Learn AP Cost: \\v[621]>\n<SkillUnlockRate:80, 10>\n<AI Target: Lowest HP>\n\n<All AI Conditions>\n$gameSwitches.value(3553) === false\n40% <= User HP%\n0 < (a.param(4) * 1.1) * 4\n(a.param(4) * 1.1) * 4 >= (a.param(2) * 4 - b.param(3) * 2)\n(a.param(4) * 1.1) * 4 > a.param(4) * 4 - b.param(5) * 2\n</All AI Conditions>\n\n<TargetPercent:10>\n<OrderId:2321>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 554,
    "animationId": 67,
    "damage": {
      "critical": false,
      "elementId": 2,
      "formula": "a.mat * 6 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌单体造成炎属性中伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 64,
    "message1": "%1吟唱了%2！",
    "name": "火焰Ⅱ",
    "note": "<JS Targets>\nconst actor = this.subject();\nconsole.log(\"Actor:\", actor);\n\n// 防具ID 1805が装備されていない場合の処理\nif (!actor.equips().some(item => item && item.id === 1805)) {\n    // 手動でターゲットが選択されているか（this._targetIndex が -1 でないか）で分岐\n    if (this._targetIndex !== -1) {\n        console.log(\"Armor ID 1805 not equipped, using user selected target.\");\n        // ユーザーが選択したターゲットを取得（対象が敵の場合を想定）\n        const userTarget = $gameTroop.members()[this._targetIndex];\n        if (userTarget) {\n            console.log(\"User selected target:\", userTarget.name());\n            return [userTarget];\n        } else {\n            console.log(\"No user selected target available.\");\n            return [];\n        }\n    } else {\n        // ターゲットが未選択（＝オートバトル中とみなす）場合は AI 選定処理へ進む\n        console.log(\"Armor ID 1805 not equipped, but no manual target selected (auto battle), proceeding with AI target selection.\");\n    }\n}\n\n// 以下、防具ID 1805装備時、またはオートバトル時の AI によるターゲット選定処理\n\nconst enemies = $gameTroop.aliveMembers();\nconsole.log(\"Total enemies:\", enemies.length);\n\n// AIの基本条件でフィルタリング\nconst validEnemies = enemies.filter(enemy => {\n    const physicalDamage = subject.param(4) * 6 - enemy.param(5) * 2;\n    const magicalDamage = subject.param(2) * 4 - enemy.param(3) * 2;\n    const userHpRatio = subject.hp / subject.mhp;\n    const condition1 = physicalDamage > 0;\n    const condition2 = physicalDamage >= magicalDamage;\n    const condition3 = userHpRatio >= 0.5;\n    if (!condition1) console.log(enemy.name(), \"damage is not greater than 0.\");\n    if (!condition2) console.log(enemy.name(), \"physical damage is less than magical damage.\");\n    if (!condition3) console.log(\"User HP% is less than 50%.\");\n    return condition1 && condition2 && condition3;\n});\n\nif (validEnemies.length === 0) {\n    console.log(\"No valid enemies found.\");\n    return [];\n}\n\n// ダメージ計算関数（ステート1002の場合は2倍）\nconst calculateDamage = (enemy) => {\n    let damage = subject.param(4) * 6 - enemy.param(5) * 2;\n    if (enemy.isStateAffected(1002)) {\n        damage *= 2;\n    }\n    return damage;\n};\n\n// 倒せる敵をフィルタリング（ダメージ計算を考慮）\nconst killableEnemies = validEnemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    console.log(\"Evaluating\", enemy.name(), \"- HP:\", enemy.hp, \", Calculated Damage:\", dmg);\n    return enemy.hp <= dmg;\n});\n\n// ステート1002を持つ敵のフィルタリング\nconst state1002Enemies = validEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1002);\n    if (hasState) console.log(enemy.name(), \"has state 1002.\");\n    return hasState;\n});\n\n// ステート1002を持つ敵の中で倒せる敵をフィルタリング\nconst killableState1002Enemies = killableEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1002);\n    if (hasState) console.log(enemy.name(), \"is killable and has state 1002.\");\n    return hasState;\n});\n\n// ステート1002を持つが倒せない敵をフィルタリング\nconst nonKillableState1002Enemies = state1002Enemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    const nonKillable = enemy.hp > dmg;\n    if (nonKillable) console.log(enemy.name(), \"has state 1002 but is not killable.\");\n    return nonKillable;\n});\n\nlet target;\nif (killableState1002Enemies.length > 0) {\n    // 1. ステート1002持ちで倒せる敵を最優先\n    target = killableState1002Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable state1002 enemy:\", target.name());\n} else if (killableEnemies.length > 0) {\n    // 2. その他の倒せる敵を次に優先\n    target = killableEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable enemy:\", target.name());\n} else if (nonKillableState1002Enemies.length > 0) {\n    // 3. ステート1002を持つが倒せない敵を選択\n    target = nonKillableState1002Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected non-killable state1002 enemy:\", target.name());\n} else {\n    // 4. それ以外はHP最小の敵を選択\n    target = validEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected lowest HP enemy:\", target.name());\n}\n\nconsole.log(\"Final target set:\", target.name());\nreturn [target];\n</JS Targets>\n\n<//Cooldown: 2>\n<SkillUnlockRate:80, 10>\n<Learn Require Level: 10>\n<//Learn AP Cost: \\v[623]>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3554) === false\n50% <= User HP%\na.param(4) * 6 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2)\n0 < a.param(4) * 6 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:20>\n<OrderId:2302>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 555,
    "animationId": 74,
    "damage": {
      "critical": false,
      "elementId": 3,
      "formula": "a.mat * 4.5 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成冰属性中伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 65,
    "message1": "%1吟唱了%2！",
    "name": "冻结Ⅱ",
    "note": "<//Cooldown: 2>\n<SkillUnlockRate:80, 10>\n<Learn Require Level: 10>\n<//Learn AP Cost: \\v[623]>\n\n<AI Target: Lowest HP> \n<All AI Conditions>\n$gameSwitches.value(3555) === false\n60% <= User HP%\nTarget Team Alive Members >= 3\n0 < a.param(4) * 4.5 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:20>\n<OrderId:2312>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 556,
    "animationId": 77,
    "damage": {
      "critical": false,
      "elementId": 4,
      "formula": "a.mat * 1.6",
      "type": 1,
      "variance": 20
    },
    "description": "对随机4名敌人造成雷属性中伤害（无视防御）",
    "effects": [],
    "hitType": 2,
    "iconIndex": 66,
    "message1": "%1吟唱了%2！",
    "name": "雷电Ⅱ",
    "note": "<//Cooldown: 2>\n<SkillUnlockRate:70, 10>\n<Learn Require Level: 10>\n<//Learn AP Cost: \\v[623]>\n\n<AI Target: Lowest HP> \n<All AI Conditions>\n$gameSwitches.value(3556) === false\n75% <= User HP%\n0 < (a.param(4) * 1.6) * 4\n(a.param(4) * 1.6) * 4 >= (a.param(2) * 4 - b.param(3) * 2)\n(a.param(4) * 1.6) * 4 > a.param(4) * 6 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:20>\n<OrderId:2322>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 557,
    "animationId": 151,
    "damage": {
      "critical": false,
      "elementId": 2,
      "formula": "a.mat * 8 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方单体造成火属性大伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 64,
    "message1": "%1吟唱了%2！",
    "name": "火焰Ⅲ",
    "note": "<JS Targets>\nconst actor = this.subject();\nconsole.log(\"Actor:\", actor);\n\n// 防具ID 1805が装備されていない場合の処理\nif (!actor.equips().some(item => item && item.id === 1805)) {\n    // 手動でターゲットが選択されているか（this._targetIndex が -1 でないか）で分岐\n    if (this._targetIndex !== -1) {\n        console.log(\"Armor ID 1805 not equipped, using user selected target.\");\n        // ユーザーが選択したターゲットを取得（対象が敵の場合を想定）\n        const userTarget = $gameTroop.members()[this._targetIndex];\n        if (userTarget) {\n            console.log(\"User selected target:\", userTarget.name());\n            return [userTarget];\n        } else {\n            console.log(\"No user selected target available.\");\n            return [];\n        }\n    } else {\n        // ターゲットが未選択（＝オートバトル中とみなす）場合は AI 選定処理へ進む\n        console.log(\"Armor ID 1805 not equipped, but no manual target selected (auto battle), proceeding with AI target selection.\");\n    }\n}\n\n// 以下、防具ID 1805装備時、またはオートバトル時の AI によるターゲット選定処理\n\nconst enemies = $gameTroop.aliveMembers();\nconsole.log(\"Total enemies:\", enemies.length);\n\n// AIの基本条件でフィルタリング\nconst validEnemies = enemies.filter(enemy => {\n    const physicalDamage = actor.param(4) * 8 - enemy.param(5) * 2;\n    const magicalDamage = actor.param(2) * 4 - enemy.param(3) * 2;\n    const userHpRatio = actor.hp / actor.mhp;\n    const condition1 = physicalDamage > 0;\n    const condition2 = physicalDamage >= magicalDamage * 1.4;\n    const condition3 = userHpRatio >= 0.7;\n    if (!condition1) console.log(enemy.name(), \"damage is not greater than 0.\");\n    if (!condition2) console.log(enemy.name(), \"physical damage is less than 1.4x of magical damage.\");\n    if (!condition3) console.log(\"User HP% is less than 70%.\");\n    return condition1 && condition2 && condition3;\n});\n\nif (validEnemies.length === 0) {\n    console.log(\"No valid enemies found.\");\n    return [];\n}\n\n// ダメージ計算関数（ステート1002の場合は2倍）\nconst calculateDamage = (enemy) => {\n    let damage = actor.param(4) * 8 - enemy.param(5) * 2;\n    if (enemy.isStateAffected(1002)) {\n        damage *= 2;\n    }\n    return damage;\n};\n\n// 倒せる敵をフィルタリング（ダメージ計算を考慮）\nconst killableEnemies = validEnemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    console.log(\"Evaluating\", enemy.name(), \"- HP:\", enemy.hp, \", Calculated Damage:\", dmg);\n    return enemy.hp <= dmg;\n});\n\n// ステート1002を持つ敵のフィルタリング\nconst state1002Enemies = validEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1002);\n    if (hasState) console.log(enemy.name(), \"has state 1002.\");\n    return hasState;\n});\n\n// ステート1002を持つ敵の中で倒せる敵をフィルタリング\nconst killableState1002Enemies = killableEnemies.filter(enemy => {\n    const hasState = enemy.isStateAffected(1002);\n    if (hasState) console.log(enemy.name(), \"is killable and has state 1002.\");\n    return hasState;\n});\n\n// ステート1002を持つが倒せない敵をフィルタリング\nconst nonKillableState1002Enemies = state1002Enemies.filter(enemy => {\n    const dmg = calculateDamage(enemy);\n    const nonKillable = enemy.hp > dmg;\n    if (nonKillable) console.log(enemy.name(), \"has state 1002 but is not killable.\");\n    return nonKillable;\n});\n\nlet target;\nif (killableState1002Enemies.length > 0) {\n    // 1. ステート1002持ちで倒せる敵を最優先\n    target = killableState1002Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable state1002 enemy:\", target.name());\n} else if (killableEnemies.length > 0) {\n    // 2. その他の倒せる敵を次に優先\n    target = killableEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected killable enemy:\", target.name());\n} else if (nonKillableState1002Enemies.length > 0) {\n    // 3. ステート1002を持つが倒せない敵を選択\n    target = nonKillableState1002Enemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected non-killable state1002 enemy:\", target.name());\n} else {\n    // 4. それ以外はHP最小の敵を選択\n    target = validEnemies.reduce((a, b) => a.hp <= b.hp ? a : b);\n    console.log(\"Selected lowest HP enemy:\", target.name());\n}\n\nconsole.log(\"Final target set:\", target.name());\nreturn [target];\n</JS Targets>\n\n<//Cooldown: 3>\n<SkillUnlockRate:60, 10>\n<Learn Require Level: 20>\n<//Learn AP Cost: \\v[625]>\n\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3557) === false\n70% <= User HP%\na.param(4) * 8 - b.param(5) * 2 >= (a.param(2) * 4 - b.param(3) * 2) * 1.4\n0 < a.param(4) * 8 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:30>\n<OrderId:2303>\n",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 558,
    "animationId": 75,
    "damage": {
      "critical": false,
      "elementId": 3,
      "formula": "a.mat * 6 - b.mdf * 2",
      "type": 1,
      "variance": 20
    },
    "description": "对敌方全体造成冰属性大伤害。",
    "effects": [],
    "hitType": 2,
    "iconIndex": 65,
    "message1": "%1吟唱了%2！",
    "name": "冻结Ⅲ",
    "note": "<//Cooldown: 3>\n<SkillUnlockRate:60, 10>\n<Learn Require Level: 20>\n<//Learn AP Cost: \\v[625]>\n\n<AI Target: Lowest HP> \n<All AI Conditions>\n$gameSwitches.value(3558) === false\n$gameSwitches.value(701) === false\n70% <= User HP%\nTarget Team Alive Members >= 3\n0 < a.param(4) * 6 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:30>\n<OrderId:2313>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 559,
    "animationId": 153,
    "damage": {
      "critical": false,
      "elementId": 4,
      "formula": "a.mat * 2.1",
      "type": 1,
      "variance": 20
    },
    "description": "对随机4名敌人造成雷属性大伤害（无视防御）",
    "effects": [],
    "hitType": 2,
    "iconIndex": 66,
    "message1": "%1吟唱了%2！",
    "name": "雷电Ⅲ",
    "note": "<//Cooldown: 3>\n<SkillUnlockRate:60, 10>\n<Learn Require Level: 20>\n<//Learn AP Cost: \\v[625]>\n\n<AI Target: Lowest HP> \n<All AI Conditions>\n$gameSwitches.value(3559) === false\nTarget Not State 11\n$gameSwitches.value(701) === false\n70% <= User HP%\n0 < (a.param(4) * 2.1) * 4\n(a.param(4) * 2.1) * 4 >= (a.param(2) * 4 - b.param(3) * 2)\n(a.param(4) * 2.1) * 4 > a.param(4) * 8 - b.param(5) * 2\n</All AI Conditions>\n<TargetPercent:30>\n<OrderId:2323>",
    "occasion": 1,
    "scope": 6,
    "speed": 0,
    "stypeId": 3,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 561,
    "animationId": 37,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "对全体敌人施加敌视+愤怒",
    "effects": [
      {
        "code": 21,
        "dataId": 11,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 541,
    "message1": "%1对敌人进行了%2！",
    "name": "挑衅",
    "note": "\n<All AI Conditions>\n$gameSwitches.value(3561) === false\n70% <= User HP%\n2 <= Target Team Alive Members\n$gameParty.aliveMembers().length !== 1\n$gameVariables.value(529) < $gameTroop.aliveMembers().length\n</All AI Conditions>\n<RemoveState: 20>\n<RemoveState: 21>\n<//AutoDescriptionOff>\n<TargetPercent:100>\n<OrderId:2100>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 5,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 563,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 21,
        "dataId": 11,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 535,
    "message1": "%1将敌人吸引到了自己身边！",
    "name": "吸引敌人",
    "note": "<Learn AP Cost: \\v[622]>\n<//Custom Action Sequence>\n<AI Target: Highest ATK>\n<All AI Conditions>\n$gameSwitches.value(3563) === false\n60% <= User HP%\na.param(2) * 4 - b.param(3) * 2 < Target HP\n$gameVariables.value(529) < $gameTroop.aliveMembers().length\nTarget Not State 11\n</All AI Conditions>\n<RemoveState: 20>\n<RemoveState: 21>\n<TargetPercent:100>\n<//AutoDescriptionOff>\n<DescriptionAdd:敵を敵視させたあと、>\n<OrderId:2040>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 567,
    "animationId": 2,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 8 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [],
    "hitType": 1,
    "iconIndex": 535,
    "message1": "%1释放了%2！",
    "name": "舍身攻击",
    "note": "<Learn AP Cost: \\v[622]>\n<AI Target: Highest ATK>\n<All AI Conditions>\n$gameSwitches.value(3567) === false\n70% <= User HP%\na.param(2) * 8 - b.param(3) * 2 < Target HP\n$gameVariables.value(529) < $gameTroop.aliveMembers().length\n</All AI Conditions>\n<//Cooldown: 3>\n<SkillUnlockRate:50, 10>\n<TargetPercent:80>\n<//HP Cost: 10%>\n<OrderId:2041>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 568,
    "animationId": 2,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "a.mhp - a.hp",
      "type": 1,
      "variance": 0
    },
    "description": "",
    "effects": [],
    "hitType": 1,
    "iconIndex": 535,
    "message1": "%1释放了%2！",
    "name": "愤怒一击",
    "note": "<Learn AP Cost: \\v[622]>\n<AI Target: Highest ATK>\n<All AI Conditions>\n$gameSwitches.value(3568) === false\na.param(2) * 4 - b.param(3) * 2 < (User MaxHP - User HP)\n$gameVariables.value(529) < $gameTroop.aliveMembers().length\n</All AI Conditions>\n<SkillUnlockRate:35, 10>\n<TargetPercent:50>\n<OrderId:2045>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 575,
    "animationId": 535,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 6 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [],
    "hitType": 1,
    "iconIndex": 1229,
    "message1": "%1释放了%2！",
    "name": "烈风箭阵",
    "note": "<Learn AP Cost: \\v[625]>\n<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3575) === false\n70% <= User HP%\nTarget Team Alive Members >= 1\n0 < a.param(2) * 6 - b.param(3) * 2\n</All AI Conditions>\n<Any AI Conditions>\nTarget Not State 11\nTarget HP <= a.param(2) * 6 - b.param(3) * 2\n</Any AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:30, 10>\n<TargetPercent:10>\n<OrderId:2032>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 576,
    "animationId": 58,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "Math.min(a.mhp / 2, (a.mhp - a.hp) / 3)",
      "type": 5,
      "variance": 20
    },
    "description": "",
    "effects": [],
    "hitType": 1,
    "iconIndex": 659,
    "message1": "%1释放了%2！",
    "name": "生命吸收",
    "note": "<DescriptionResult:(最大HP-残HP)÷3>\n<DescriptionResultAfter:<最大ダメージ:最大HP÷2>>\n<Learn AP Cost: \\v[626]>\n\n<AI Target: Highest HP>\n<All AI Conditions>\n$gameSwitches.value(3576) === false\nTarget Team Alive Members >= 2\nUser HP% <= 50%\n</All AI Conditions>\n<//Cooldown: 5>\n<SkillUnlockRate:35, 10>\n<TargetPercent:20>\n<OrderId:2031>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 579,
    "animationId": 864,
    "damage": {
      "critical": true,
      "elementId": -1,
      "formula": "a.atk * 3 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      },
      {
        "code": 21,
        "dataId": 1001,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 4664,
    "message1": "%1让%2进行了！",
    "name": "弱点解放",
    "note": "<SkillUnlockRate:50,10>\n<//Custom Action Sequence>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3579) === false\n$gameSwitches.value(2530) === true\nTarget Not State 1002\nTarget Not State 1003\nTarget Not State 1004\nTarget Not State 1005\nTarget Not State 1006\nTarget Not State 1007\nTarget Not State 1008\nTarget Not State 1009\nTarget Team Alive Members >= 2\n60% <= Target HP%\n30% <= User HP%\n</All AI Conditions>\n<TargetPercent:20>\n<OrderId:2031>",
    "occasion": 1,
    "scope": 2,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 581,
    "animationId": 414,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "味方全体の攻撃力・魔法力を上げる。\n２回まで重ねがけできる。",
    "effects": [
      {
        "code": 31,
        "dataId": 2,
        "value1": 3,
        "value2": 0
      },
      {
        "code": 31,
        "dataId": 4,
        "value1": 3,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 34,
    "message1": "%1吟唱了%2！",
    "name": "力量提升",
    "note": "<All AI Conditions>\n$gameSwitches.value(3581) === false\nuser atk buff stacks < 2\n3 <= user Team Alive Members\n50% <= User HP%\n</All AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<OrderId:2401>",
    "occasion": 1,
    "scope": 8,
    "speed": 3,
    "stypeId": 6,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 583,
    "animationId": 202,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "味方全体の防御力・魔法防御を上げる。\n２回まで重ねがけできる。",
    "effects": [
      {
        "code": 31,
        "dataId": 3,
        "value1": 3,
        "value2": 0
      },
      {
        "code": 31,
        "dataId": 5,
        "value1": 3,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 35,
    "message1": "%1吟唱了%2！",
    "name": "防御提升",
    "note": "<All AI Conditions>\n$gameSwitches.value(3583) === false\nuser def debuff stacks < 2\n3 <= user Team Alive Members\n50% <= User HP%\n</All AI Conditions>\n<//Cooldown: 2>\n<SkillUnlockRate:60, 10>\n<OrderId:2405>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 6,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 585,
    "animationId": 46,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 21,
        "dataId": 15,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 72,
    "message1": "%1吟唱了%2！",
    "name": "治愈光环",
    "note": "<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3585) === false\nUser State 15 Turns === 0\n2 <= user Team Alive Members\nLowest HP% <= 80%\n</All AI Conditions>\n<//Cooldown: 4>\n<SkillUnlockRate:35,10>\n<OrderId:2420>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 6,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 586,
    "animationId": 669,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "味方全体の回避率を10%上げる。\n２回まで重ねがけできる。",
    "effects": [
      {
        "code": 21,
        "dataId": 1103,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 2509,
    "message1": "%1吟唱了%2！",
    "name": "回避率提升",
    "note": "<All AI Conditions>\n$gameSwitches.value(3586) === false\nUser State 1103 Turns === 0\nUser State 1104 Turns === 0\n3 <= user Team Alive Members\n</All AI Conditions>\n<SkillUnlockRate:60, 10>\n<OrderId:2406>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 6,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 587,
    "animationId": 769,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "味方全体の会心率を10%上げる。\n２回まで重ねがけできる。",
    "effects": [
      {
        "code": 21,
        "dataId": 1105,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 2504,
    "message1": "%1吟唱了%2！",
    "name": "会心率提升",
    "note": "<All AI Conditions>\n$gameSwitches.value(3587) === false\nUser State 1105 Turns === 0\nUser State 1106 Turns === 0\n3 <= user Team Alive Members\n</All AI Conditions>\n<SkillUnlockRate:50, 10>\n<OrderId:2407>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 6,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 588,
    "animationId": 703,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "味方全体の反撃率を10%上げる。\n２回まで重ねがけできる。",
    "effects": [
      {
        "code": 21,
        "dataId": 1107,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 0,
    "iconIndex": 2508,
    "message1": "%1吟唱了%2！",
    "name": "反击率提升",
    "note": "<All AI Conditions>\n$gameSwitches.value(3588) === false\nUser State 1107 Turns === 0\nUser State 1108 Turns === 0\n3 <= user Team Alive Members\n</All AI Conditions>\n<SkillUnlockRate:30, 10>\n<OrderId:2408>",
    "occasion": 1,
    "scope": 8,
    "speed": 0,
    "stypeId": 6,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 593,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 2499,
    "message1": "%1释放了%2！",
    "name": "回避提升",
    "note": "<Cast Animation: 414>\n<AddState: 1103>\n<AddInfoWindowP:\\C[4]ステート付与:\\C[6]回避率+10% 3ターン>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3593) === false\nUser State 1104 Turns === 0\nTarget Not State 11\n40% <= User HP%\n</All AI Conditions>\n<SkillUnlockRate:50, 10>\n<TargetPercent:30>\n<OrderId:2052>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 594,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 2496,
    "message1": "%1释放了%2！",
    "name": "会心提升",
    "note": "<Cast Animation: 414>\n<AddState: 1105>\n<AddInfoWindowP:\\C[4]ステート付与:\\C[6]会心率+10% 3ターン>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3594) === false\nUser State 1106 Turns === 0\nTarget Not State 11\n40% <= User HP%\n</All AI Conditions>\n<SkillUnlockRate:40, 10>\n<TargetPercent:30>\n<OrderId:2053>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 595,
    "animationId": -1,
    "damage": {
      "critical": true,
      "elementId": 0,
      "formula": "a.atk * 4 - b.def * 2",
      "type": 1,
      "variance": 20
    },
    "description": "",
    "effects": [
      {
        "code": 44,
        "dataId": 1112,
        "value1": 1,
        "value2": 0
      }
    ],
    "hitType": 1,
    "iconIndex": 2503,
    "message1": "%1释放了%2！",
    "name": "反击提升",
    "note": "<Cast Animation: 414>\n<AddState: 1107>\n<AddInfoWindowP:\\C[4]ステート付与:\\C[6]反撃率+10% 3ターン>\n<AI Target: Lowest HP>\n<All AI Conditions>\n$gameSwitches.value(3595) === false\nUser State 1108 Turns === 0\nTarget Not State 11\n40% <= User HP%\n</All AI Conditions>\n<SkillUnlockRate:20, 10>\n<TargetPercent:30>\n<OrderId:2054>",
    "occasion": 1,
    "scope": 1,
    "speed": 0,
    "stypeId": 2,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 710,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "使状态异常无效",
    "effects": [],
    "hitType": 0,
    "iconIndex": 81,
    "message1": "",
    "name": "状态异常无效",
    "note": "<//Learn Gold Cost: \\v[610]>\n<Learn AP Cost: \\v[630]>\n<Passive State: 710>\n<AutoDescriptionOff>\n<OrderId:200>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 722,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "敵から攻撃を受けたとき、10%の確率で\n攻撃を無効化し、反撃する。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 77,
    "message1": "",
    "name": "反击率+10%",
    "note": "<Passive State: 722>\n<AutoDescriptionOff>\n<OrderId:399>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 723,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "有10%的概率反射来自敌人的魔法。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 222,
    "message1": "",
    "name": "魔法反射+10%",
    "note": "<Passive State: 723>\n<AutoDescriptionOff>\n<OrderId:499>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 724,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "暴击率增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 4624,
    "message1": "",
    "name": "暴击率+10%",
    "note": "<Passive State: 724>\n<AutoDescriptionOff>\n<OrderId:699>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 726,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "回避率增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 43,
    "message1": "",
    "name": "回避率+10%",
    "note": "<Passive State: 726>\n<AutoDescriptionOff>\n<OrderId:999>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 727,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "来自敌人的魔法攻击伤害率减少10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 45,
    "message1": "",
    "name": "魔法伤害率-10%",
    "note": "<Passive State: 727>\n<AutoDescriptionOff>\n<OrderId:1099>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 728,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "魔法回避率增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 45,
    "message1": "",
    "name": "魔法回避率+10%",
    "note": "<Passive State: 728>\n<AutoDescriptionOff>\n<OrderId:1199>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 751,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "最大HP增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 32,
    "message1": "",
    "name": "最大HP+10%",
    "note": "<//Learn Gold Cost: \\v[602]>\n<Learn AP Cost: \\v[622]>\n<Passive State: 751>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 752,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "最大HP增加20%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 32,
    "message1": "",
    "name": "最大HP+20%",
    "note": "<//Learn Gold Cost: \\v[604]>\n<Learn AP Cost: \\v[624]>\n<Passive State: 752>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 771,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "攻击力增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 34,
    "message1": "",
    "name": "攻击力+10%",
    "note": "<//Learn Gold Cost: \\v[602]>\n<Learn AP Cost: \\v[622]>\n<Passive State: 771>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 772,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "攻击力增加20%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 34,
    "message1": "",
    "name": "攻击力+20%",
    "note": "<//Learn Gold Cost: \\v[604]>\n<Learn AP Cost: \\v[624]>\n<Passive State: 772>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 781,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "防御力增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 35,
    "message1": "",
    "name": "防御力+10%",
    "note": "<//Learn Gold Cost: \\v[602]>\n<Learn AP Cost: \\v[622]>\n<Passive State: 781>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 782,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "防御力增加20%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 35,
    "message1": "",
    "name": "防御力+20%",
    "note": "<//Learn Gold Cost: \\v[604]>\n<Learn AP Cost: \\v[624]>\n<Passive State: 782>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 791,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "魔法力增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 36,
    "message1": "",
    "name": "魔法力+10%",
    "note": "<//Learn Gold Cost: \\v[602]>\n<Learn AP Cost: \\v[622]>\n<Passive State: 791>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 792,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "魔法力增加20%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 36,
    "message1": "",
    "name": "魔法力+20%",
    "note": "<//Learn Gold Cost: \\v[604]>\n<Learn AP Cost: \\v[624]>\n<Passive State: 792>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 801,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "魔法防御增加10%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 37,
    "message1": "",
    "name": "魔法防御+10%",
    "note": "<//Learn Gold Cost: \\v[602]>\n<Learn AP Cost: \\v[622]>\n<Passive State: 801>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 802,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "魔法防御增加20%。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 37,
    "message1": "",
    "name": "魔法防御+20%",
    "note": "<//Learn Gold Cost: \\v[604]>\n<Learn AP Cost: \\v[624]>\n<Passive State: 802>\n<AutoDescriptionOff>\n<OrderId:100>",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  },
  {
    "id": 999,
    "animationId": 0,
    "damage": {
      "critical": false,
      "elementId": 0,
      "formula": "0",
      "type": 0,
      "variance": 20
    },
    "description": "毫无斗志，散漫摸鱼，随随便便应付一下战斗。",
    "effects": [],
    "hitType": 0,
    "iconIndex": 1,
    "message1": "",
    "name": "怠惰",
    "note": "",
    "occasion": 3,
    "scope": 0,
    "speed": 0,
    "stypeId": 1,
    "successRate": 100,
    "tpGain": 0
  }
];