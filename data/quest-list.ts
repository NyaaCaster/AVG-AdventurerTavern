import { QuestList, QuestMap } from '../types';

export const QUESTS: QuestMap = {
  "0101": {
  "quest_id": "0101",
  "quest_name": "发光孢子的威胁",
  "description": "释放着幻想之光的光孢怪出现在古老的森林中。美丽而危险的孢子正在扩散。恢复生态系统的平衡！",
  "star": 1,
  "enemy_level": 1,
  "target": "光孢怪",
  "background_image": "bg_dungeon_001.png",
  "target_image": "monster_001.png",
  "battle_config": {
    "troop_id": 1,
    "enemies": [
      {
        "enemy_id": 101,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 101,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 101,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 1
      },
      {
        "item_id": "res-m0101",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0102": {
  "quest_id": "0102",
  "quest_name": "讨伐破坏紫羽田地的怪物",
  "description": "在紫羽田地中出现了破坏者。为了保护农作物，去讨伐这些破坏者！",
  "star": 1,
  "enemy_level": 3,
  "target": "死灵渡鸦",
  "background_image": "bg_dungeon_002.png",
  "target_image": "monster_002.png",
  "battle_config": {
    "troop_id": 2,
    "enemies": [
      {
        "enemy_id": 102,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 102,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 102,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 1
      },
      {
        "item_id": "res-m0102",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0103": {
  "quest_id": "0103",
  "quest_name": "威胁水源的蓝色入侵者",
  "description": "蓝色入侵者威胁着水源。保护水源的纯净，击退这些入侵者！",
  "star": 1,
  "enemy_level": 4,
  "target": "史莱姆",
  "background_image": "bg_dungeon_003.png",
  "target_image": "monster_003.png",
  "battle_config": {
    "troop_id": 3,
    "enemies": [
      {
        "enemy_id": 103,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 103,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 103,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 1
      },
      {
        "item_id": "res-m0103",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0104": {
  "quest_id": "0104",
  "quest_name": "讨伐失控的白兔大群",
  "description": "失控的白兔大群正在破坏农田。去讨伐这些白兔，保护农作物！",
  "star": 1,
  "enemy_level": 6,
  "target": "狂暴绒毛怪",
  "background_image": "bg_dungeon_004.png",
  "target_image": "monster_004.png",
  "battle_config": {
    "troop_id": 4,
    "enemies": [
      {
        "enemy_id": 104,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 104,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 104,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 1
      },
      {
        "item_id": "res-m0104",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0105": {
  "quest_id": "0105",
  "quest_name": "追踪暗影编织者",
  "description": "暗影编织者在森林中制造混乱。追踪并击败这个神秘的敌人！",
  "star": 1,
  "enemy_level": 8,
  "target": "影鼠",
  "background_image": "bg_dungeon_005.png",
  "target_image": "monster_005.png",
  "battle_config": {
    "troop_id": 5,
    "enemies": [
      {
        "enemy_id": 105,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 105,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 105,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 1
      },
      {
        "item_id": "res-m0105",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0106": {
  "quest_id": "0106",
  "quest_name": "讨伐地底掘削者",
  "description": "地底掘削者正在破坏村庄的基础。去讨伐这些掘削者，保护村庄！",
  "star": 1,
  "enemy_level": 10,
  "target": "莫古挖掘者",
  "background_image": "bg_dungeon_006.png",
  "target_image": "monster_006.png",
  "battle_config": {
    "troop_id": 6,
    "enemies": [
      {
        "enemy_id": 106,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 106,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 106,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 1
      },
      {
        "item_id": "res-m0106",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0107": {
  "quest_id": "0107",
  "quest_name": "森林恶作剧火精骚动",
  "description": "森林中的火精正在制造恶作剧，引发火灾。平息这些火精的骚动！",
  "star": 1,
  "enemy_level": 11,
  "target": "噬焰兽",
  "background_image": "bg_dungeon_007.png",
  "target_image": "monster_007.png",
  "battle_config": {
    "troop_id": 7,
    "enemies": [
      {
        "enemy_id": 107,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 107,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 107,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 1
      },
      {
        "item_id": "res-m0107",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0108": {
  "quest_id": "0108",
  "quest_name": "击退炎翼作战",
  "description": "炎翼怪物正在袭击过往的旅人。执行击退炎翼的作战！",
  "star": 1,
  "enemy_level": 13,
  "target": "焰蝠",
  "background_image": "bg_dungeon_008.png",
  "target_image": "monster_008.png",
  "battle_config": {
    "troop_id": 8,
    "enemies": [
      {
        "enemy_id": 108,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 108,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 108,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 3000,
    "experience": 50,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 1
      },
      {
        "item_id": "res-m0108",
        "item_num": 5
      }
    ]
  },
  "rank": "E"
},
  "0201": {
  "quest_id": "0201",
  "quest_name": "威胁街道安全的绿色恶徒",
  "description": "绿色恶徒威胁着街道的安全。保护行人和商队，击败这些恶徒！",
  "star": 2,
  "enemy_level": 15,
  "target": "迅捷哥布林",
  "background_image": "bg_dungeon_011.png",
  "target_image": "monster_011.png",
  "battle_config": {
    "troop_id": 11,
    "enemies": [
      {
        "enemy_id": 111,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 111,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 111,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 2
      },
      {
        "item_id": "res-m0201",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0202": {
  "quest_id": "0202",
  "quest_name": "守护牧场的羊群！",
  "description": "牧场的羊群受到了威胁。守护牧场的羊群，击退来袭的敌人！",
  "star": 2,
  "enemy_level": 16,
  "target": "影牙",
  "background_image": "bg_dungeon_012.png",
  "target_image": "monster_012.png",
  "battle_config": {
    "troop_id": 12,
    "enemies": [
      {
        "enemy_id": 112,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 112,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 112,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 2
      },
      {
        "item_id": "res-m0202",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0203": {
  "quest_id": "0203",
  "quest_name": "驯服狂暴机械",
  "description": "狂暴的机械正在破坏村庄。驯服这些机械，恢复村庄的和平！",
  "star": 2,
  "enemy_level": 18,
  "target": "纺车弓魔",
  "background_image": "bg_dungeon_013.png",
  "target_image": "monster_013.png",
  "battle_config": {
    "troop_id": 13,
    "enemies": [
      {
        "enemy_id": 113,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 113,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 113,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 2
      },
      {
        "item_id": "res-m0203",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0204": {
  "quest_id": "0204",
  "quest_name": "讨伐月影之刃",
  "description": "月影之刃在夜晚袭击村民。讨伐这个神秘的敌人，保护村庄！",
  "star": 2,
  "enemy_level": 20,
  "target": "影刃收割者",
  "background_image": "bg_dungeon_014.png",
  "target_image": "monster_014.png",
  "battle_config": {
    "troop_id": 14,
    "enemies": [
      {
        "enemy_id": 114,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 114,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 114,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 2
      },
      {
        "item_id": "res-m0204",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0205": {
  "quest_id": "0205",
  "quest_name": "平息觉醒森林的木灵",
  "description": "觉醒的森林木灵正在制造混乱。平息这些木灵的愤怒，恢复森林的平静！",
  "star": 2,
  "enemy_level": 21,
  "target": "姆尔姆尔灌木",
  "background_image": "bg_dungeon_015.png",
  "target_image": "monster_015.png",
  "battle_config": {
    "troop_id": 15,
    "enemies": [
      {
        "enemy_id": 115,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 115,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 115,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 2
      },
      {
        "item_id": "res-m0205",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0206": {
  "quest_id": "0206",
  "quest_name": "森林的小小吵闹者",
  "description": "森林中的小小吵闹者正在干扰村民的生活。安抚这些生物，恢复宁静！",
  "star": 2,
  "enemy_level": 23,
  "target": "绿环怪",
  "background_image": "bg_dungeon_016.png",
  "target_image": "monster_016.png",
  "battle_config": {
    "troop_id": 16,
    "enemies": [
      {
        "enemy_id": 116,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 116,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 116,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 2
      },
      {
        "item_id": "res-m0206",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0207": {
  "quest_id": "0207",
  "quest_name": "驱逐狂暴怪鱼",
  "description": "狂暴的怪鱼正在袭击渔民。驱逐这些怪鱼，保护渔民的安全！",
  "star": 2,
  "enemy_level": 25,
  "target": "凶暴屠戮者",
  "background_image": "bg_dungeon_017.png",
  "target_image": "monster_017.png",
  "battle_config": {
    "troop_id": 17,
    "enemies": [
      {
        "enemy_id": 117,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 117,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 117,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 2
      },
      {
        "item_id": "res-m0207",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0208": {
  "quest_id": "0208",
  "quest_name": "森林哨兵的异变",
  "description": "森林哨兵出现了异变，开始攻击过往的旅人。调查并解决这个问题！",
  "star": 2,
  "enemy_level": 26,
  "target": "绿色哨兵",
  "background_image": "bg_dungeon_018.png",
  "target_image": "monster_018.png",
  "battle_config": {
    "troop_id": 18,
    "enemies": [
      {
        "enemy_id": 118,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 118,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 118,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 2
      },
      {
        "item_id": "res-m0208",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0209": {
  "quest_id": "0209",
  "quest_name": "觉醒的岩石守卫",
  "description": "觉醒的岩石守卫正在封锁山路。击败这些守卫，重新开通山路！",
  "star": 2,
  "enemy_level": 28,
  "target": "大地魔像",
  "background_image": "bg_dungeon_019.png",
  "target_image": "monster_019.png",
  "battle_config": {
    "troop_id": 19,
    "enemies": [
      {
        "enemy_id": 119,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 119,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 119,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 6000,
    "experience": 110,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 2
      },
      {
        "item_id": "res-m0209",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0301": {
  "quest_id": "0301",
  "quest_name": "枯萎森林的守护者",
  "description": "枯萎森林的守护者变得狂暴。平息它的愤怒，恢复森林的生机！",
  "star": 3,
  "enemy_level": 30,
  "target": "毒木怪",
  "background_image": "bg_dungeon_021.png",
  "target_image": "monster_021.png",
  "battle_config": {
    "troop_id": 21,
    "enemies": [
      {
        "enemy_id": 121,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 121,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 121,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 3
      },
      {
        "item_id": "res-m0301",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0302": {
  "quest_id": "0302",
  "quest_name": "粉碎收获的诅咒",
  "description": "收获的诅咒正在影响农田。粉碎这个诅咒，确保丰收！",
  "star": 3,
  "enemy_level": 32,
  "target": "镰刀收割者",
  "background_image": "bg_dungeon_022.png",
  "target_image": "monster_022.png",
  "battle_config": {
    "troop_id": 22,
    "enemies": [
      {
        "enemy_id": 122,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 122,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 122,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 3
      },
      {
        "item_id": "res-m0302",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0303": {
  "quest_id": "0303",
  "quest_name": "讨伐翠谷的暴龙",
  "description": "翠谷中的暴龙正在袭击过往的旅人。讨伐这条暴龙，确保道路的安全！",
  "star": 3,
  "enemy_level": 33,
  "target": "翡翠蜥蜴",
  "background_image": "bg_dungeon_023.png",
  "target_image": "monster_023.png",
  "battle_config": {
    "troop_id": 23,
    "enemies": [
      {
        "enemy_id": 123,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 123,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 123,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 3
      },
      {
        "item_id": "res-m0303",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0304": {
  "quest_id": "0304",
  "quest_name": "阻挡温泉之路的火蜥蜴",
  "description": "火蜥蜴阻挡了前往温泉的道路。清除这些障碍，重新开通温泉之路！",
  "star": 3,
  "enemy_level": 35,
  "target": "余烬蜥蜴",
  "background_image": "bg_dungeon_024.png",
  "target_image": "monster_024.png",
  "battle_config": {
    "troop_id": 24,
    "enemies": [
      {
        "enemy_id": 124,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 124,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 124,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 3
      },
      {
        "item_id": "res-m0304",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0305": {
  "quest_id": "0305",
  "quest_name": "紫雾森林的多眼威胁",
  "description": "紫雾森林中的多眼怪物威胁着村庄。击败这个威胁，保护村庄！",
  "star": 3,
  "enemy_level": 37,
  "target": "蜘蛛之眼",
  "background_image": "bg_dungeon_025.png",
  "target_image": "monster_025.png",
  "battle_config": {
    "troop_id": 25,
    "enemies": [
      {
        "enemy_id": 125,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 125,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 125,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 3
      },
      {
        "item_id": "res-m0305",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0306": {
  "quest_id": "0306",
  "quest_name": "白羽蛇尾的威胁",
  "description": "白羽蛇尾的威胁正在靠近村庄。讨伐这个怪物，保护村庄！",
  "star": 3,
  "enemy_level": 38,
  "target": "鸡蛇怪",
  "background_image": "bg_dungeon_026.png",
  "target_image": "monster_026.png",
  "battle_config": {
    "troop_id": 26,
    "enemies": [
      {
        "enemy_id": 126,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 126,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 126,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 3
      },
      {
        "item_id": "res-m0306",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0307": {
  "quest_id": "0307",
  "quest_name": "燃烧大地的清道夫",
  "description": "燃烧大地的清道夫正在破坏农田。驱逐这些生物，保护农田！",
  "star": 3,
  "enemy_level": 40,
  "target": "克拉斯特拉克斯",
  "background_image": "bg_dungeon_027.png",
  "target_image": "monster_027.png",
  "battle_config": {
    "troop_id": 27,
    "enemies": [
      {
        "enemy_id": 127,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 127,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 127,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 3
      },
      {
        "item_id": "res-m0307",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0308": {
  "quest_id": "0308",
  "quest_name": "地底苏醒的猎人",
  "description": "地底苏醒的猎人正在袭击村庄。讨伐这些猎人，保护村庄！",
  "star": 3,
  "enemy_level": 42,
  "target": "猛禽钻地兽",
  "background_image": "bg_dungeon_028.png",
  "target_image": "monster_028.png",
  "battle_config": {
    "troop_id": 28,
    "enemies": [
      {
        "enemy_id": 128,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 128,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 128,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 9000,
    "experience": 180,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 3
      },
      {
        "item_id": "res-m0308",
        "item_num": 5
      }
    ]
  },
  "rank": "D"
},
  "0401": {
  "quest_id": "0401",
  "quest_name": "封印翠牙的威胁",
  "description": "翠牙的威胁正在逼近村庄。封印这个威胁，保护村庄！",
  "star": 4,
  "enemy_level": 44,
  "target": "绿牙怪",
  "background_image": "bg_dungeon_031.png",
  "target_image": "monster_031.png",
  "battle_config": {
    "troop_id": 31,
    "enemies": [
      {
        "enemy_id": 116,
        "position": 1,
        "role": "servant"
      },
      {
        "enemy_id": 116,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 131,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 4
      },
      {
        "item_id": "res-m0401",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0402": {
  "quest_id": "0402",
  "quest_name": "月影森林中回响的咆哮",
  "description": "在月光森林中目击到了三头地狱犬。为了保护城镇免受其獠牙的伤害，希望你去讨伐它。",
  "star": 4,
  "enemy_level": 46,
  "target": "三头地狱犬",
  "background_image": "bg_dungeon_032.png",
  "target_image": "monster_032.png",
  "battle_config": {
    "troop_id": 32,
    "enemies": [
      {
        "enemy_id": 132,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 132,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 132,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 4
      },
      {
        "item_id": "res-m0402",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0403": {
  "quest_id": "0403",
  "quest_name": "击败山顶的支配者",
  "description": "来自天空巢穴的猛禽威胁。为了保护山村的和平，去讨伐狮鹫女王。",
  "star": 4,
  "enemy_level": 47,
  "target": "狮鹫女王",
  "background_image": "bg_dungeon_033.png",
  "target_image": "monster_033.png",
  "battle_config": {
    "troop_id": 33,
    "enemies": [
      {
        "enemy_id": 133,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 133,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 133,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 4
      },
      {
        "item_id": "res-m0403",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0404": {
  "quest_id": "0404",
  "quest_name": "平息冰河的威胁",
  "description": "出现在冰河地带的巨大雪兽袭击了旅人。击退凶猛的霜牙巨兽，确保道路的安全。",
  "star": 4,
  "enemy_level": 49,
  "target": "霜牙巨兽",
  "background_image": "bg_dungeon_034.png",
  "target_image": "monster_034.png",
  "battle_config": {
    "troop_id": 34,
    "enemies": [
      {
        "enemy_id": 134,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 104,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 104,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 4
      },
      {
        "item_id": "res-m0404",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0405": {
  "quest_id": "0405",
  "quest_name": "暗月森林中潜伏的暗影",
  "description": "在暗月森林中出现了变得狂暴的影狼兽毒影怪。击退威胁村民的存在，恢复森林的和平。",
  "star": 4,
  "enemy_level": 51,
  "target": "毒影怪",
  "background_image": "bg_dungeon_035.png",
  "target_image": "monster_035.png",
  "battle_config": {
    "troop_id": 35,
    "enemies": [
      {
        "enemy_id": 135,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 112,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 112,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 4
      },
      {
        "item_id": "res-m0405",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0406": {
  "quest_id": "0406",
  "quest_name": "蛇眼中寄宿的青雷",
  "description": "在峡谷的遗迹中目击到了雷霆蝰蛇。虽然它携带的雷电规模不大，但威胁着前来遗迹的人们。击退这条机械蛇。",
  "star": 4,
  "enemy_level": 53,
  "target": "雷霆蝰蛇",
  "background_image": "bg_dungeon_036.png",
  "target_image": "monster_036.png",
  "battle_config": {
    "troop_id": 36,
    "enemies": [
      {
        "enemy_id": 136,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 136,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 136,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 4
      },
      {
        "item_id": "res-m0406",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0407": {
  "quest_id": "0407",
  "quest_name": "冰雾中潜伏的暗影",
  "description": "在雪原的边缘出现了散发着冰之气息的野兽霜牙。它的存在带来了寒气，威胁着猎人们的生活。防止更严重的寒潮到来。",
  "star": 4,
  "enemy_level": 54,
  "target": "霜牙",
  "background_image": "bg_dungeon_037.png",
  "target_image": "monster_037.png",
  "battle_config": {
    "troop_id": 37,
    "enemies": [
      {
        "enemy_id": 137,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 137,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 137,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 12000,
    "experience": 260,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 4
      },
      {
        "item_id": "res-m0407",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0501": {
  "quest_id": "0501",
  "quest_name": "解除海岸的诅咒！",
  "description": "在海岸附近的海湾出现了深海的怨灵屠戮者，在周围肆虐。消灭这个威胁，恢复沿岸地区的和平！",
  "star": 5,
  "enemy_level": 56,
  "target": "屠戮者",
  "background_image": "bg_dungeon_041.png",
  "target_image": "monster_041.png",
  "battle_config": {
    "troop_id": 41,
    "enemies": [
      {
        "enemy_id": 141,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 117,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 117,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 15000,
    "experience": 350,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 5
      },
      {
        "item_id": "res-m0501",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0502": {
  "quest_id": "0502",
  "quest_name": "讨伐统治荒野的兽王",
  "description": "讨伐统治荒野的兽王，恢复荒野的和平！",
  "star": 5,
  "enemy_level": 58,
  "target": "奇美拉",
  "background_image": "bg_dungeon_042.png",
  "target_image": "monster_042.png",
  "battle_config": {
    "troop_id": 42,
    "enemies": [
      {
        "enemy_id": 142,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 126,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 126,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 15000,
    "experience": 350,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 5
      },
      {
        "item_id": "res-m0502",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0503": {
  "quest_id": "0503",
  "quest_name": "古代树的愤怒",
  "description": "古代树的愤怒正在引发自然灾害。平息它的愤怒，恢复自然的平衡！",
  "star": 5,
  "enemy_level": 60,
  "target": "绿盔怪",
  "background_image": "bg_dungeon_043.png",
  "target_image": "monster_043.png",
  "battle_config": {
    "troop_id": 43,
    "enemies": [
      {
        "enemy_id": 143,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 115,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 115,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 15000,
    "experience": 350,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 5
      },
      {
        "item_id": "res-m0503",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0504": {
  "quest_id": "0504",
  "quest_name": "平息火焰的暴走",
  "description": "火焰的暴走正在破坏森林。平息这场火灾，保护森林！",
  "star": 5,
  "enemy_level": 61,
  "target": "地狱烈焰",
  "background_image": "bg_dungeon_044.png",
  "target_image": "monster_044.png",
  "battle_config": {
    "troop_id": 44,
    "enemies": [
      {
        "enemy_id": 144,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 112,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 112,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 15000,
    "experience": 350,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 5
      },
      {
        "item_id": "res-m0504",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0505": {
  "quest_id": "0505",
  "quest_name": "平息冻结的冰鸣",
  "description": "冻结的冰鸣正在引发严寒。平息这个现象，恢复温暖！",
  "star": 5,
  "enemy_level": 63,
  "target": "冰霜巨人",
  "background_image": "bg_dungeon_045.png",
  "target_image": "monster_045.png",
  "battle_config": {
    "troop_id": 45,
    "enemies": [
      {
        "enemy_id": 145,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 137,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 137,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 15000,
    "experience": 350,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 5
      },
      {
        "item_id": "res-m0505",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0506": {
  "quest_id": "0506",
  "quest_name": "缠绕青雷的兽影",
  "description": "缠绕着青雷的兽影正在袭击村庄。击败这个怪物，保护村庄！",
  "star": 5,
  "enemy_level": 65,
  "target": "闪电狮王",
  "background_image": "bg_dungeon_046.png",
  "target_image": "monster_046.png",
  "battle_config": {
    "troop_id": 46,
    "enemies": [
      {
        "enemy_id": 146,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 146,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 146,
        "position": 3,
        "role": "master"
      }
    ]
  },
  "rewards": {
    "gold": 15000,
    "experience": 350,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 5
      },
      {
        "item_id": "res-m0506",
        "item_num": 5
      }
    ]
  },
  "rank": "C"
},
  "0601": {
  "quest_id": "0601",
  "quest_name": "毒蘑菇讨伐",
  "description": "击退出现在古老森林中的巨大蘑菇怪物毒影幽魂。森林正在被有毒孢子污染。生态系统崩溃的危机！",
  "star": 6,
  "enemy_level": 67,
  "target": "毒影幽魂",
  "background_image": "bg_dungeon_051.png",
  "target_image": "monster_051.png",
  "battle_config": {
    "troop_id": 51,
    "enemies": [
      {
        "enemy_id": 151,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 101,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 101,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 18000,
    "experience": 450,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 6
      },
      {
        "item_id": "res-m0601",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0602": {
  "quest_id": "0602",
  "quest_name": "平息暴走魔力的威胁！",
  "description": "平息暴走魔力的威胁！保护村庄免受魔力的伤害！",
  "star": 6,
  "enemy_level": 69,
  "target": "以太魔像",
  "background_image": "bg_dungeon_052.png",
  "target_image": "monster_052.png",
  "battle_config": {
    "troop_id": 52,
    "enemies": [
      {
        "enemy_id": 152,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 113,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 113,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 18000,
    "experience": 450,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 6
      },
      {
        "item_id": "res-m0602",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0603": {
  "quest_id": "0603",
  "quest_name": "浓雾深谷的暴乱者",
  "description": "浓雾深谷的暴乱者正在袭击过往的旅人。讨伐这些暴乱者，确保道路的安全！",
  "star": 6,
  "enemy_level": 71,
  "target": "角盔狂战士",
  "background_image": "bg_dungeon_053.png",
  "target_image": "monster_053.png",
  "battle_config": {
    "troop_id": 53,
    "enemies": [
      {
        "enemy_id": 153,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 116,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 116,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 18000,
    "experience": 450,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 6
      },
      {
        "item_id": "res-m0603",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0604": {
  "quest_id": "0604",
  "quest_name": "苍蓝暴君的侵攻",
  "description": "苍蓝暴君的入侵正在威胁村庄。击败这个暴君，保护村庄！",
  "star": 6,
  "enemy_level": 73,
  "target": "水生暴君",
  "background_image": "bg_dungeon_054.png",
  "target_image": "monster_054.png",
  "battle_config": {
    "troop_id": 54,
    "enemies": [
      {
        "enemy_id": 154,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 123,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 123,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 18000,
    "experience": 450,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 6
      },
      {
        "item_id": "res-m0604",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0605": {
  "quest_id": "0605",
  "quest_name": "枯萎森林的诅咒",
  "description": "枯萎森林的诅咒正在蔓延。解除这个诅咒，恢复森林的生机！",
  "star": 6,
  "enemy_level": 75,
  "target": "暗羽大鸦王",
  "background_image": "bg_dungeon_055.png",
  "target_image": "monster_055.png",
  "battle_config": {
    "troop_id": 55,
    "enemies": [
      {
        "enemy_id": 155,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 102,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 102,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 18000,
    "experience": 450,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 6
      },
      {
        "item_id": "res-m0605",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0701": {
  "quest_id": "0701",
  "quest_name": "震撼大地的掘削兽威胁",
  "description": "震撼大地的掘削兽威胁正在破坏村庄。击败这些掘削兽，保护村庄！",
  "star": 7,
  "enemy_level": 77,
  "target": "野猪龙",
  "background_image": "bg_dungeon_061.png",
  "target_image": "monster_061.png",
  "battle_config": {
    "troop_id": 61,
    "enemies": [
      {
        "enemy_id": 161,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 128,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 128,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 21000,
    "experience": 560,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 7
      },
      {
        "item_id": "res-m0701",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0702": {
  "quest_id": "0702",
  "quest_name": "暴走自然的镇静",
  "description": "平息暴走的自然，恢复自然的平衡！",
  "star": 7,
  "enemy_level": 79,
  "target": "绿怒怪",
  "background_image": "bg_dungeon_062.png",
  "target_image": "monster_062.png",
  "battle_config": {
    "troop_id": 62,
    "enemies": [
      {
        "enemy_id": 162,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 118,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 118,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 21000,
    "experience": 560,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 7
      },
      {
        "item_id": "res-m0702",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0703": {
  "quest_id": "0703",
  "quest_name": "讨伐雾之谷潜伏的兽王",
  "description": "讨伐潜伏在雾谷中的兽王，恢复雾谷的和平！",
  "star": 7,
  "enemy_level": 81,
  "target": "雾嚎兽",
  "background_image": "bg_dungeon_063.png",
  "target_image": "monster_063.png",
  "battle_config": {
    "troop_id": 63,
    "enemies": [
      {
        "enemy_id": 163,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 135,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 135,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 21000,
    "experience": 560,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 7
      },
      {
        "item_id": "res-m0703",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0704": {
  "quest_id": "0704",
  "quest_name": "震撼荒野之地的威胁",
  "description": "震撼荒野之地的威胁正在逼近。击败这个威胁，保护荒野！",
  "star": 7,
  "enemy_level": 83,
  "target": "竞技场巨像",
  "background_image": "bg_dungeon_064.png",
  "target_image": "monster_064.png",
  "battle_config": {
    "troop_id": 64,
    "enemies": [
      {
        "enemy_id": 164,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 119,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 119,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 21000,
    "experience": 560,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 7
      },
      {
        "item_id": "res-m0704",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0705": {
  "quest_id": "0705",
  "quest_name": "驱除雷蛇之威胁",
  "description": "驱除雷蛇的威胁，保护村庄免受雷击！",
  "star": 7,
  "enemy_level": 85,
  "target": "风暴盘绕巨蛇",
  "background_image": "bg_dungeon_065.png",
  "target_image": "monster_065.png",
  "battle_config": {
    "troop_id": 65,
    "enemies": [
      {
        "enemy_id": 165,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 136,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 136,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 21000,
    "experience": 560,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 7
      },
      {
        "item_id": "res-m0705",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0706": {
  "quest_id": "0706",
  "quest_name": "驰骋灼热荒野的业火",
  "description": "驰骋在灼热荒野的业火正在蔓延。扑灭这场大火，保护荒野！",
  "star": 7,
  "enemy_level": 87,
  "target": "地狱烈焰猎犬",
  "background_image": "bg_dungeon_066.png",
  "target_image": "monster_066.png",
  "battle_config": {
    "troop_id": 66,
    "enemies": [
      {
        "enemy_id": 166,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 107,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 107,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 21000,
    "experience": 560,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 7
      },
      {
        "item_id": "res-m0706",
        "item_num": 5
      }
    ]
  },
  "rank": "B"
},
  "0801": {
  "quest_id": "0801",
  "quest_name": "滴落威胁的讨伐",
  "description": "讨伐滴落的威胁，保护村庄免受腐蚀！",
  "star": 8,
  "enemy_level": 89,
  "target": "史莱姆王·水瓶座",
  "background_image": "bg_dungeon_071.png",
  "target_image": "monster_071.png",
  "battle_config": {
    "troop_id": 71,
    "enemies": [
      {
        "enemy_id": 103,
        "position": 1,
        "role": "servant"
      },
      {
        "enemy_id": 171,
        "position": 2,
        "role": "master"
      },
      {
        "enemy_id": 103,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 24000,
    "experience": 680,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 8
      },
      {
        "item_id": "res-m0801",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "0802": {
  "quest_id": "0802",
  "quest_name": "讨伐祸根之森的哥布林王国",
  "description": "讨伐祸根森林的哥布林王国，恢复森林的和平！",
  "star": 8,
  "enemy_level": 91,
  "target": "哥布林领主·马拉达尔",
  "background_image": "bg_dungeon_072.png",
  "target_image": "monster_072.png",
  "battle_config": {
    "troop_id": 72,
    "enemies": [
      {
        "enemy_id": 172,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 111,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 111,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 24000,
    "experience": 680,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 8
      },
      {
        "item_id": "res-m0802",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "0803": {
  "quest_id": "0803",
  "quest_name": "紫色触手，青色威胁",
  "description": "紫色触手，青色威胁正在袭击村庄。击败这个怪物，保护村庄！",
  "star": 8,
  "enemy_level": 93,
  "target": "奥克托比乌斯",
  "background_image": "bg_dungeon_073.png",
  "target_image": "monster_073.png",
  "battle_config": {
    "troop_id": 73,
    "enemies": [
      {
        "enemy_id": 173,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 117,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 117,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 24000,
    "experience": 680,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 8
      },
      {
        "item_id": "res-m0803",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "0804": {
  "quest_id": "0804",
  "quest_name": "笼罩紫烟之森的恶魔威胁",
  "description": "笼罩紫烟森林的恶魔威胁正在蔓延。击败这个恶魔，保护森林！",
  "star": 8,
  "enemy_level": 95,
  "target": "巴尔扎克",
  "background_image": "bg_dungeon_074.png",
  "target_image": "monster_074.png",
  "battle_config": {
    "troop_id": 74,
    "enemies": [
      {
        "enemy_id": 174,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 108,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 108,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 24000,
    "experience": 680,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 8
      },
      {
        "item_id": "res-m0804",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "0805": {
  "quest_id": "0805",
  "quest_name": "击败雷角暴君",
  "description": "击败雷角暴君，保护村庄免受雷暴的伤害！",
  "star": 8,
  "enemy_level": 97,
  "target": "雷霆粉碎者",
  "background_image": "bg_dungeon_075.png",
  "target_image": "monster_075.png",
  "battle_config": {
    "troop_id": 75,
    "enemies": [
      {
        "enemy_id": 175,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 146,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 146,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 24000,
    "experience": 680,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 8
      },
      {
        "item_id": "res-m0805",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "0901": {
  "quest_id": "0901",
  "quest_name": "击退六头暗龙",
  "description": "击退六头暗龙，保护世界免受黑暗的威胁！",
  "star": 9,
  "enemy_level": 98,
  "target": "灾厄祸主",
  "background_image": "bg_dungeon_081.png",
  "target_image": "monster_081.png",
  "battle_config": {
    "troop_id": 81,
    "enemies": [
      {
        "enemy_id": 181,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 132,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 132,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 27000,
    "experience": 810,
    "items": [
      {
        "item_id": "res-0002",
        "item_num": 9
      },
      {
        "item_id": "res-m0901",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "0902": {
  "quest_id": "0902",
  "quest_name": "讨伐漆黑骑士",
  "description": "讨伐漆黑骑士，保护村庄免受黑暗力量的伤害！",
  "star": 9,
  "enemy_level": 99,
  "target": "暗夜梦魇",
  "background_image": "bg_dungeon_082.png",
  "target_image": "monster_082.png",
  "battle_config": {
    "troop_id": 82,
    "enemies": [
      {
        "enemy_id": 182,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 155,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 155,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 27000,
    "experience": 810,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 9
      },
      {
        "item_id": "res-m0902",
        "item_num": 5
      }
    ]
  },
  "rank": "A"
},
  "1001": {
  "quest_id": "1001",
  "quest_name": "平息灼热巨人",
  "description": "平息灼热巨人，保护世界免受火山爆发的威胁！",
  "star": 10,
  "enemy_level": 99,
  "target": "火山巨人",
  "background_image": "bg_dungeon_091.png",
  "target_image": "monster_091.png",
  "battle_config": {
    "troop_id": 91,
    "enemies": [
      {
        "enemy_id": 191,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 124,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 124,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 30000,
    "experience": 950,
    "items": [
      {
        "item_id": "res-0003",
        "item_num": 10
      },
      {
        "item_id": "res-m1001",
        "item_num": 5
      }
    ]
  },
  "rank": "S"
},
  "1002": {
  "quest_id": "1002",
  "quest_name": "来自枯萎大地的警告",
  "description": "死灵收割者正在剥夺大地的生命力。守护生命之泉，将不毛之地恢复原状。",
  "star": 10,
  "enemy_level": 99,
  "target": "死灵收割者",
  "background_image": "bg_dungeon_092.png",
  "target_image": "monster_092.png",
  "battle_config": {
    "troop_id": 92,
    "enemies": [
      {
        "enemy_id": 192,
        "position": 1,
        "role": "master"
      },
      {
        "enemy_id": 122,
        "position": 2,
        "role": "servant"
      },
      {
        "enemy_id": 122,
        "position": 3,
        "role": "servant"
      }
    ]
  },
  "rewards": {
    "gold": 30000,
    "experience": 950,
    "items": [
      {
        "item_id": "res-0001",
        "item_num": 10
      },
      {
        "item_id": "res-m1002",
        "item_num": 5
      }
    ]
  },
  "rank": "S"
}
};
