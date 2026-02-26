
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

  let resLevel = 1;

  switch (sceneId) {
    case 'scen_1': // 柜台
      // LV1~LV9: lv1, LV10~LV19: lv2, LV20~LV29: lv3, LV30~LV39: lv4, LV40+: lv5
      if (level >= 40) resLevel = 5;
      else if (level >= 30) resLevel = 4;
      else if (level >= 20) resLevel = 3;
      else if (level >= 10) resLevel = 2;
      else resLevel = 1;
      return `${basePath}/scen_1/bg_scen_1_lv${resLevel}_${p}.png`;

    case 'scen_2': // 客房
    case 'scen_3': // 酒场
    case 'scen_4': // 训练场
      // LV1~LV9: lv1, LV10~LV19: lv2, LV20+: lv3
      if (level >= 20) resLevel = 3;
      else if (level >= 10) resLevel = 2;
      else resLevel = 1;
      return `${basePath}/${sceneId}/bg_${sceneId}_lv${resLevel}_${p}.png`;

    case 'scen_5': // 武器店
    case 'scen_6': // 防具店
      // LV1~LV2: lv1, LV3~LV4: lv2, LV5+: lv3
      if (level >= 5) resLevel = 3;
      else if (level >= 3) resLevel = 2;
      else resLevel = 1;
      return `${basePath}/${sceneId}/bg_${sceneId}_lv${resLevel}_${p}.png`;

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
