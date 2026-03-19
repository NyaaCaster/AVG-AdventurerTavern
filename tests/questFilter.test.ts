import { describe, it, expect } from 'vitest';
import { AdventurerRank, ADVENTURER_RANKS, QuestStateMap, QuestStatus } from '../types';

interface MockQuest {
  quest_id: string;
  rank: string;
}

const filterQuestsByRank = (
  allQuests: MockQuest[],
  questStates: QuestStateMap,
  adventurerRank: AdventurerRank
): MockQuest[] => {
  const rankIndex = ADVENTURER_RANKS.indexOf(adventurerRank);
  const visibleRanks = ADVENTURER_RANKS.slice(0, rankIndex + 1);
  
  return allQuests.filter(q => {
    const status = questStates[q.quest_id]?.status;
    if (status === 'active' || status === 'completed') return true;
    return visibleRanks.includes(q.rank as AdventurerRank);
  });
};

describe('任务评级过滤逻辑', () => {
  
  const mockQuests: MockQuest[] = [
    { quest_id: 'quest_e1', rank: 'E' },
    { quest_id: 'quest_d1', rank: 'D' },
    { quest_id: 'quest_c1', rank: 'C' },
    { quest_id: 'quest_b1', rank: 'B' },
    { quest_id: 'quest_a1', rank: 'A' },
    { quest_id: 'quest_s1', rank: 'S' },
  ];

  describe('基础过滤测试 - 按冒险者评级显示可接受任务', () => {
    
    it('E级冒险者只能看到E级可接受任务', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'E');
      
      expect(result.length).toBe(1);
      expect(result[0].quest_id).toBe('quest_e1');
    });

    it('D级冒险者可以看到E和D级可接受任务', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'D');
      
      expect(result.length).toBe(2);
      expect(result.map(q => q.quest_id)).toEqual(['quest_e1', 'quest_d1']);
    });

    it('C级冒险者可以看到E、D、C级可接受任务', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'C');
      
      expect(result.length).toBe(3);
      expect(result.map(q => q.quest_id)).toEqual(['quest_e1', 'quest_d1', 'quest_c1']);
    });

    it('S级冒险者可以看到所有可接受任务', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'S');
      
      expect(result.length).toBe(6);
    });
  });

  describe('容错处理测试 - 进行中任务始终可见', () => {
    
    it('E级冒险者可以看到进行中的高评级任务', () => {
      const questStates: QuestStateMap = {
        'quest_s1': { questId: 'quest_s1', status: 'active' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'E');
      
      expect(result.length).toBe(2);
      expect(result.map(q => q.quest_id)).toContain('quest_e1');
      expect(result.map(q => q.quest_id)).toContain('quest_s1');
    });

    it('D级冒险者可以看到进行中的A级任务', () => {
      const questStates: QuestStateMap = {
        'quest_a1': { questId: 'quest_a1', status: 'active' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'D');
      
      expect(result.length).toBe(3);
      expect(result.map(q => q.quest_id)).toContain('quest_a1');
    });

    it('多个进行中任务都应该可见', () => {
      const questStates: QuestStateMap = {
        'quest_c1': { questId: 'quest_c1', status: 'active' },
        'quest_s1': { questId: 'quest_s1', status: 'active' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'E');
      
      expect(result.length).toBe(3);
      expect(result.map(q => q.quest_id)).toContain('quest_e1');
      expect(result.map(q => q.quest_id)).toContain('quest_c1');
      expect(result.map(q => q.quest_id)).toContain('quest_s1');
    });
  });

  describe('容错处理测试 - 已完成任务始终可见', () => {
    
    it('E级冒险者可以看到已完成的高评级任务', () => {
      const questStates: QuestStateMap = {
        'quest_b1': { questId: 'quest_b1', status: 'completed' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'E');
      
      expect(result.length).toBe(2);
      expect(result.map(q => q.quest_id)).toContain('quest_e1');
      expect(result.map(q => q.quest_id)).toContain('quest_b1');
    });

    it('已完成任务和进行中任务都应该可见', () => {
      const questStates: QuestStateMap = {
        'quest_a1': { questId: 'quest_a1', status: 'completed' },
        'quest_s1': { questId: 'quest_s1', status: 'active' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'D');
      
      expect(result.length).toBe(4);
      expect(result.map(q => q.quest_id)).toContain('quest_e1');
      expect(result.map(q => q.quest_id)).toContain('quest_d1');
      expect(result.map(q => q.quest_id)).toContain('quest_a1');
      expect(result.map(q => q.quest_id)).toContain('quest_s1');
    });
  });

  describe('数据保护测试 - 确保已接受任务不会丢失', () => {
    
    it('更新前接受的高评级任务在更新后仍可见（核心修复场景）', () => {
      const questStates: QuestStateMap = {
        'quest_s1': { questId: 'quest_s1', status: 'active', acceptedAt: Date.now() - 86400000 }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'E');
      
      expect(result.some(q => q.quest_id === 'quest_s1')).toBe(true);
    });

    it('更新前完成的高评级任务在更新后仍可交付', () => {
      const questStates: QuestStateMap = {
        'quest_a1': { questId: 'quest_a1', status: 'completed' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'C');
      
      expect(result.some(q => q.quest_id === 'quest_a1')).toBe(true);
    });

    it('所有已接受任务都不应被过滤掉', () => {
      const questStates: QuestStateMap = {
        'quest_d1': { questId: 'quest_d1', status: 'active' },
        'quest_c1': { questId: 'quest_c1', status: 'active' },
        'quest_b1': { questId: 'quest_b1', status: 'completed' },
        'quest_a1': { questId: 'quest_a1', status: 'completed' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'E');
      
      expect(result.some(q => q.quest_id === 'quest_d1')).toBe(true);
      expect(result.some(q => q.quest_id === 'quest_c1')).toBe(true);
      expect(result.some(q => q.quest_id === 'quest_b1')).toBe(true);
      expect(result.some(q => q.quest_id === 'quest_a1')).toBe(true);
    });
  });

  describe('边界值测试', () => {
    
    it('空任务列表应返回空数组', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank([], questStates, 'E');
      
      expect(result).toEqual([]);
    });

    it('空任务状态应按评级正常过滤', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'B');
      
      expect(result.length).toBe(4);
    });

    it('任务状态为available时应按评级过滤', () => {
      const questStates: QuestStateMap = {
        'quest_s1': { questId: 'quest_s1', status: 'available' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'D');
      
      expect(result.some(q => q.quest_id === 'quest_s1')).toBe(false);
    });
  });

  describe('边缘情况测试', () => {
    
    it('任务状态为undefined时应按评级过滤', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'C');
      
      expect(result.length).toBe(3);
    });

    it('任务状态对象存在但status为undefined时应按评级过滤', () => {
      const questStates: QuestStateMap = {
        'quest_s1': { questId: 'quest_s1', status: undefined as any }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'D');
      
      expect(result.some(q => q.quest_id === 'quest_s1')).toBe(false);
    });

    it('所有评级都应正确映射', () => {
      const questStates: QuestStateMap = {};
      
      const ranks: AdventurerRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
      const expectedCounts = [1, 2, 3, 4, 5, 6];
      
      ranks.forEach((rank, index) => {
        const result = filterQuestsByRank(mockQuests, questStates, rank);
        expect(result.length).toBe(expectedCounts[index]);
      });
    });
  });

  describe('正常数据测试', () => {
    
    it('混合状态任务应正确过滤', () => {
      const questStates: QuestStateMap = {
        'quest_e1': { questId: 'quest_e1', status: 'available' },
        'quest_d1': { questId: 'quest_d1', status: 'active' },
        'quest_c1': { questId: 'quest_c1', status: 'completed' },
        'quest_b1': { questId: 'quest_b1', status: 'available' },
        'quest_a1': { questId: 'quest_a1', status: 'active' },
        'quest_s1': { questId: 'quest_s1', status: 'available' }
      };
      const result = filterQuestsByRank(mockQuests, questStates, 'D');
      
      expect(result.length).toBe(4);
      expect(result.map(q => q.quest_id)).toContain('quest_e1');
      expect(result.map(q => q.quest_id)).toContain('quest_d1');
      expect(result.map(q => q.quest_id)).toContain('quest_c1');
      expect(result.map(q => q.quest_id)).toContain('quest_a1');
      expect(result.map(q => q.quest_id)).not.toContain('quest_b1');
      expect(result.map(q => q.quest_id)).not.toContain('quest_s1');
    });

    it('S级冒险者应看到所有任务', () => {
      const questStates: QuestStateMap = {};
      const result = filterQuestsByRank(mockQuests, questStates, 'S');
      
      expect(result.length).toBe(6);
      expect(result.map(q => q.quest_id)).toEqual([
        'quest_e1', 'quest_d1', 'quest_c1', 'quest_b1', 'quest_a1', 'quest_s1'
      ]);
    });
  });
});
