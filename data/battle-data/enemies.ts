export interface EnemyAction {
  skillId: number;
  rating: number;
  conditionType: number;
  conditionParam1: number;
  conditionParam2: number;
}

export interface EnemyTrait {
  code: number;
  dataId: number;
  value: number;
}

export interface EnemyDamage {
  critical: string | number;
  elementId: string | number;
  formula: string;
  type: string | number;
  variance: string | number;
}

export interface EnemyData {
  id: number;
  name: string;
  battlerName: string;
  actions: EnemyAction[];
  traits: EnemyTrait[];
  damage?: EnemyDamage;
}

export const ENEMIES: EnemyData[] = [
  {
    "id": 101,
    "actions": [
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_001",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "光孢怪",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 102,
    "actions": [
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_002",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "死灵渡鸦",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 103,
    "actions": [
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_003",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "水凝胶怪",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 104,
    "actions": [
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_004",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "狂暴绒毛怪"
  },
  {
    "id": 105,
    "actions": [
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_005",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "影鼠"
  },
  {
    "id": 106,
    "actions": [
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_006",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1612,
        "value": 1
      }
    ],
    "name": "莫古挖掘者"
  },
  {
    "id": 107,
    "actions": [
      {
        "skillId": 6,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_007",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1634,
        "value": 1
      }
    ],
    "name": "噬焰兽"
  },
  {
    "id": 108,
    "actions": [
      {
        "skillId": 6,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_008",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1634,
        "value": 1
      }
    ],
    "name": "焰蝠"
  },
  {
    "id": 111,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_011",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1612,
        "value": 1
      }
    ],
    "name": "迅捷哥布林",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 112,
    "actions": [
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_012",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "影牙"
  },
  {
    "id": 113,
    "actions": [
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_013",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "纺车弓魔"
  },
  {
    "id": 114,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_014",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1612,
        "value": 1
      }
    ],
    "name": "影刃收割者"
  },
  {
    "id": 115,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_015",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1632,
        "value": 1
      }
    ],
    "name": "姆尔姆尔灌木"
  },
  {
    "id": 116,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_016",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1617,
        "value": 1
      }
    ],
    "name": "绿环怪"
  },
  {
    "id": 117,
    "actions": [
      {
        "skillId": 252,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_017",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1617,
        "value": 1
      }
    ],
    "name": "凶暴屠戮者"
  },
  {
    "id": 118,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    },
    "name": "绿色哨兵",
    "battlerName": "monster_018"
  },
  {
    "id": 119,
    "actions": [
      {
        "skillId": 242,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 39,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1632,
        "value": 1
      }
    ],
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    },
    "name": "大地魔像",
    "battlerName": "monster_019"
  },
  {
    "id": 121,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_021",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1632,
        "value": 1
      }
    ],
    "name": "毒木怪",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 122,
    "actions": [
      {
        "skillId": 251,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_022",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1612,
        "value": 1
      }
    ],
    "name": "镰刀收割者",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 123,
    "actions": [
      {
        "skillId": 256,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 259,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 36,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_023",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1631,
        "value": 1
      }
    ],
    "name": "翡翠蜥蜴"
  },
  {
    "id": 124,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 6,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_024",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1634,
        "value": 1
      }
    ],
    "name": "余烬蜥蜴"
  },
  {
    "id": 125,
    "actions": [
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_025",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "蜘蛛之眼"
  },
  {
    "id": 126,
    "actions": [
      {
        "skillId": 256,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_026",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1631,
        "value": 1
      }
    ],
    "name": "鸡蛇怪"
  },
  {
    "id": 127,
    "actions": [
      {
        "skillId": 45,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 42,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_027",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "克拉斯特拉克斯"
  },
  {
    "id": 128,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_028",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "猛禽钻地兽"
  },
  {
    "id": 131,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_031",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "绿牙怪"
  },
  {
    "id": 132,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_032",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "三头地狱犬"
  },
  {
    "id": 133,
    "actions": [
      {
        "skillId": 256,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 259,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 36,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_033",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1631,
        "value": 1
      }
    ],
    "name": "狮鹫女王"
  },
  {
    "id": 134,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_034",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "霜牙巨兽"
  },
  {
    "id": 135,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_035",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "毒影怪"
  },
  {
    "id": 136,
    "actions": [
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 42,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_036",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1635,
        "value": 1
      }
    ],
    "name": "雷霆蝰蛇"
  },
  {
    "id": 137,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 7,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_037",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1633,
        "value": 1
      }
    ],
    "name": "霜牙"
  },
  {
    "id": 141,
    "actions": [
      {
        "skillId": 252,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 44,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_041",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1617,
        "value": 1
      }
    ],
    "name": "屠戮者",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 142,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_042",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "奇美拉"
  },
  {
    "id": 143,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 242,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 39,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_043",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1632,
        "value": 1
      }
    ],
    "name": "绿盔怪"
  },
  {
    "id": 144,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 6,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_044",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1634,
        "value": 1
      }
    ],
    "name": "地狱烈焰"
  },
  {
    "id": 145,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 38,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 7,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_045",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1633,
        "value": 1
      }
    ],
    "name": "冰霜巨人"
  },
  {
    "id": 146,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_046",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1635,
        "value": 1
      }
    ],
    "name": "闪电狮王"
  },
  {
    "id": 151,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 1,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      }
    ],
    "battlerName": "monster_051",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "毒影幽魂",
    "damage": {
      "critical": "",
      "elementId": "",
      "formula": "",
      "type": "",
      "variance": ""
    }
  },
  {
    "id": 152,
    "actions": [
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 242,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 39,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_052",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "以太魔像"
  },
  {
    "id": 153,
    "actions": [
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_053",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "角盔狂战士"
  },
  {
    "id": 154,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_054",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "水生暴君"
  },
  {
    "id": 155,
    "actions": [
      {
        "skillId": 289,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 271,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 290,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_055",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1636,
        "value": 1
      }
    ],
    "name": "暗羽大鸦王"
  },
  {
    "id": 161,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_061",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "野猪龙"
  },
  {
    "id": 162,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_062",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "绿怒怪"
  },
  {
    "id": 163,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 41,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_063",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "雾嚎兽"
  },
  {
    "id": 164,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 20,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 242,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 39,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_064",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "竞技场巨像"
  },
  {
    "id": 165,
    "actions": [
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 42,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_065",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1635,
        "value": 1
      }
    ],
    "name": "风暴盘绕巨蛇"
  },
  {
    "id": 166,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 37,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 6,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_066",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1634,
        "value": 1
      }
    ],
    "name": "地狱烈焰猎犬"
  },
  {
    "id": 171,
    "actions": [
      {
        "skillId": 290,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_071",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1637,
        "value": 1
      }
    ],
    "name": "史莱姆王·水瓶座"
  },
  {
    "id": 172,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_072",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1611,
        "value": 1
      }
    ],
    "name": "哥布林领主·马拉达尔"
  },
  {
    "id": 173,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_073",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1637,
        "value": 1
      }
    ],
    "name": "奥克托比乌斯"
  },
  {
    "id": 174,
    "actions": [
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 290,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_074",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1635,
        "value": 1
      }
    ],
    "name": "巴尔扎克"
  },
  {
    "id": 175,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 8,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_075",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1635,
        "value": 1
      }
    ],
    "name": "雷霆粉碎者"
  },
  {
    "id": 181,
    "actions": [
      {
        "skillId": 46,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 288,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 287,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_081",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1616,
        "value": 1
      }
    ],
    "name": "灾厄祸主"
  },
  {
    "id": 182,
    "actions": [
      {
        "skillId": 289,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 271,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 281,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_082",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1612,
        "value": 1
      }
    ],
    "name": "暗夜梦魇"
  },
  {
    "id": 191,
    "actions": [
      {
        "skillId": 294,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 244,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 37,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 6,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_091",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1634,
        "value": 1
      }
    ],
    "name": "火山巨人"
  },
  {
    "id": 192,
    "actions": [
      {
        "skillId": 287,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 289,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "skillId": 271,
        "rating": 5,
        "conditionType": 0,
        "conditionParam1": 0,
        "conditionParam2": 0
      },
      {
        "conditionParam1": 0,
        "conditionParam2": 0,
        "conditionType": 0,
        "rating": 5,
        "skillId": 1
      }
    ],
    "battlerName": "monster_092",
    "traits": [
      {
        "code": 22,
        "dataId": 0,
        "value": 0.95
      },
      {
        "code": 22,
        "dataId": 1,
        "value": 0.05
      },
      {
        "code": 31,
        "dataId": 1,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 6,
        "value": 0
      },
      {
        "code": 21,
        "dataId": 7,
        "value": 0
      },
      {
        "code": 35,
        "dataId": 1612,
        "value": 1
      }
    ],
    "name": "死灵收割者"
  }
];
