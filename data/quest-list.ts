import { QuestList, QuestMap } from '../types';

export const QUESTS: QuestMap = {
  "0101": {
  "quest_id": "0101",
  "quest_name": "发光孢子的威胁",
  "description": "释放着幻想之光的光孢怪出现在古老的森林中。美丽而危险的孢子正在扩散。恢复生态系统的平衡！",
  "star": 1,
  "target": "光孢怪",
  "background_image": "bg_dungeon_001.png",
  "target_image": "monster_001.png",
  "battle_config": {
    "troop_id": 1,
    "enemies": [
      {
        "enemy_id": 101,
        "position": 1
      },
      {
        "enemy_id": 101,
        "position": 2
      },
      {
        "enemy_id": 101,
        "position": 3
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 3000,
    "items": [
      {
        "item_id": "res-0001",
        // item_name: '灵木'
        "item_num": 1
      },
      {
        "item_id": "res-m0101",
        // item_name: '光孢菌伞'
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "1002": {
  "quest_id": "1002",
  "quest_name": "来自枯萎大地的警告",
  "description": "死灵收割者正在剥夺大地的生命力。守护生命之泉，将不毛之地恢复原状。",
  "star": 10,
  "target": "死灵收割者",
  "background_image": "bg_dungeon_092.png",
  "target_image": "monster_092.png",
  "battle_config": {
    "troop_id": 92,
    "enemies": [
      {
        "enemy_id": 192,
        "position": 1
      },
      {
        "enemy_id": 122,
        "position": 2
      },
      {
        "enemy_id": 122,
        "position": 3
      }
    ]
  },
  "rewards": {
    "gold": 30000,
    "experience": 57000,
    "items": [
      {
        "item_id": "res-0001",
        // item_name: '灵木'
        "item_num": 10
      },
      {
        "item_id": "res-m1002",
        // item_name: '灵魂粉尘'
        "item_num": 5
      }
    ]
  },
  "rank": "S"
}
};
