/**
 * RoomCheckInSystem.ts
 *
 * 角色入住条件管理模块
 * 定义每个角色入住旅店所需的场景升级条件。
 * 当所有条件中任意一项满足时，该角色即可入住。
 *
 * 配合 INITIAL_CHECKED_IN_CHARACTERS（gameConstants.ts）使用：
 * - INITIAL_CHECKED_IN_CHARACTERS：游戏开始时已默认入住的角色
 * - ROOM_CHECK_IN_REQUIREMENTS：需要通过场景升级解锁入住的角色条件
 */

import { SceneId } from '../types';

export interface CheckInRequirement {
  sceneId: SceneId;
  minLevel: number;
}

/**
 * 各角色的入住解锁条件
 * 满足列表中【任意一项】条件即可触发入住
 */
export const ROOM_CHECK_IN_REQUIREMENTS: Record<string, CheckInRequirement[]> = {
  // 朱迪斯
  'char_104': [
    { sceneId: 'scen_3', minLevel: 2 }, // 酒场
  ],

  // 莲华
  'char_105': [
    { sceneId: 'scen_4', minLevel: 2 }, // 训练场
  ],

  // 艾琳
  'char_106': [
    { sceneId: 'scen_5', minLevel: 1 }, // 武器店
  ],

  // 菲洛
  'char_107': [
    { sceneId: 'scen_8', minLevel: 1 }, // 按摩室
  ],

  // 卡特琳娜
  'char_108': [
    { sceneId: 'scen_6', minLevel: 1 }, // 防具店
  ],

  // 莱拉
  'char_109': [
    { sceneId: 'scen_2', minLevel: 2 }, // 客房
  ],

  // 琉卡
  'char_110': [
    { sceneId: 'scen_7', minLevel: 1 }, // 温泉
  ],

  // 吉娜
  'char_111': [
    { sceneId: 'scen_2', minLevel: 3 }, // 客房
  ],
};

/**
 * 检查某个角色是否满足入住条件
 * @param charId 角色 ID
 * @param sceneLevels 当前各场景等级
 * @returns 是否可以入住
 */
export const isCharacterEligibleToCheckIn = (
  charId: string,
  sceneLevels: Record<string, number>
): boolean => {
  const requirements = ROOM_CHECK_IN_REQUIREMENTS[charId];
  if (!requirements || requirements.length === 0) return false;

  // 满足任意一项条件即可入住
  return requirements.some(req => (sceneLevels[req.sceneId] ?? 0) >= req.minLevel);
};

/**
 * 根据当前场景等级，返回所有已满足入住条件的角色 ID 列表
 * @param sceneLevels 当前各场景等级
 */
export const getEligibleCheckInCharacters = (
  sceneLevels: Record<string, number>
): string[] => {
  return Object.keys(ROOM_CHECK_IN_REQUIREMENTS).filter(charId =>
    isCharacterEligibleToCheckIn(charId, sceneLevels)
  );
};