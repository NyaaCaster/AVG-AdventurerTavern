
import { SceneId, WorldState } from '../types';

/**
 * 获取场景背景图片路径
 * @param sceneId 场景ID
 * @param period 时间段 (day/evening/night)
 * @param level 场景等级 (默认为1)
 */
export const getSceneBackground = (sceneId: SceneId, period: WorldState['period'], level: number = 1): string => {
  const basePath = "img/bg/AdventurerTavern";
  
  // 统一处理时间段后缀：evening 对应 evenfall 资源
  const p = period === 'evening' ? 'evenfall' : period;

  // 辅助函数：限制等级范围
  // 如果当前等级超过最大资源等级，则使用最大等级资源
  const clampLevel = (lvl: number, max: number) => Math.min(Math.max(lvl, 1), max);

  switch (sceneId) {
    case 'scen_1': // 柜台: LV1-LV5
      return `${basePath}/scen_1/bg_scen_1_lv${clampLevel(level, 5)}_${p}.png`;

    case 'scen_2': // 客房: LV1-LV3
      return `${basePath}/scen_2/bg_scen_2_lv${clampLevel(level, 3)}_${p}.png`;

    case 'scen_3': // 酒场: LV1-LV3
      return `${basePath}/scen_3/bg_scen_3_lv${clampLevel(level, 3)}_${p}.png`;

    case 'scen_4': // 训练场: LV1-LV3
      return `${basePath}/scen_4/bg_scen_4_lv${clampLevel(level, 3)}_${p}.png`;

    case 'scen_5': // 武器店: LV1-LV3
      return `${basePath}/scen_5/bg_scen_5_lv${clampLevel(level, 3)}_${p}.png`;

    case 'scen_6': // 防具店: LV1-LV3
      return `${basePath}/scen_6/bg_scen_6_lv${clampLevel(level, 3)}_${p}.png`;

    // 以下场景无等级区分，使用通用背景
    case 'scen_7': // 温泉
      return `${basePath}/bg_scen_7.png`;

    case 'scen_8': // 按摩室
      return `${basePath}/bg_scen_8.png`;

    case 'scen_9': // 库房
      return `${basePath}/bg_scen_9.png`;

    case 'scen_10': // 道具店
      return `${basePath}/bg_scen_10.png`;

    default:
      // 默认回退
      return `${basePath}/scen_1/bg_scen_1_lv1_day.png`;
  }
};
