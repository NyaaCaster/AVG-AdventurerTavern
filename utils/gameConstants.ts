
import { SceneId, ManagementStats } from '../types';

export const SCENE_NAMES: Record<SceneId, string> = {
  'scen_1': '柜台',
  'scen_2': '客房',
  'scen_3': '酒场',
  'scen_4': '训练场',
  'scen_5': '武器店',
  'scen_6': '防具店',
  'scen_7': '温泉',
  'scen_8': '按摩室',
  'scen_9': '库房',
  'scen_10': '道具店'
};

export const INITIAL_SCENE_LEVELS: Record<string, number> = {
  'scen_1': 1,
  'scen_2': 1,
  'scen_3': 1,
  'scen_4': 1,
  'scen_5': 0, 
  'scen_6': 0, 
  'scen_7': 0, 
  'scen_8': 0, 
  'scen_9': 1,
  'scen_10': 1,
};

export const INITIAL_CHARACTER_STATS: Record<string, { level: number; affinity: number }> = {
  'char_101': { level: 5, affinity: 85 },
  'char_102': { level: 99, affinity: 45 },
  'char_103': { level: 1, affinity: 20 },
  'char_104': { level: 12, affinity: 35 },
  'char_105': { level: 20, affinity: 15 },
  'char_106': { level: 30, affinity: 5 },
  'char_107': { level: 50, affinity: 60 },
  'char_108': { level: 40, affinity: 70 },
  'char_109': { level: 8, affinity: 90 },
  'char_110': { level: 15, affinity: 50 },
  'char_111': { level: 10, affinity: 40 },
};

export const INITIAL_INVENTORY: Record<string, number> = {
    'res-0001': 15, 
    'res-0002': 15, 
    'res-0003': 15, 
    'res-0101': 20, 
    'res-0201': 20, 
    'res-0301': 20, 
    'res-0401': 20, 
    'res-0501': 20, 
    'res-0601': 20, 
    'res-0701': 20, 
    'res-0801': 20, 
    'res-0901': 20,  
    'itm-01': 5,    
    'itm-07': 1,    
    'wpn-102': 1,   
    'arm-201': 1,   
    'spc-00': 1,    
    'spc-05': 2, 
};

export const INITIAL_MANAGEMENT_STATS: ManagementStats = {
    occupancy: 12,
    maxOccupancy: 20,
    roomPrice: 500,
    satisfaction: 85,
    attraction: 78,
    reputation: 92
};
