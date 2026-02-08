
import { SceneId, WorldState } from '../types';

export const getSceneBackground = (sceneId: SceneId, period: WorldState['period']): string => {
  // 简化的背景映射逻辑。
  // 注意：实际项目中，这里可以扩展为根据店铺等级(LV1-LV5)返回不同的图片
  // 目前统一使用 LV1 或通用背景
  
  const basePath = "img/bg/AdventurerTavern";
  const p = period === 'evening' ? 'evenfall' : period; // Convert 'evening' -> 'evenfall' for file naming if needed, though most files use 'evenfall'

  switch (sceneId) {
    case 'scen_1': // 宿屋
      return `${basePath}/scen_1/bg_scen_1_lv1_${p}.png`;
    case 'scen_2': // 客房
      return `${basePath}/scen_2/bg_scen_2_lv1_${p}.png`;
    case 'scen_3': // 酒场
      return `${basePath}/scen_3/bg_scen_3_lv1_${p}.png`;
    case 'scen_4': // 训练场
      return `${basePath}/scen_4/bg_scen_4_lv1_${p}.png`;
    case 'scen_5': // 武器店
      return `${basePath}/scen_5/bg_scen_5_lv1_${p}.png`;
    case 'scen_6': // 防具店
      return `${basePath}/scen_6/bg_scen_6_lv1_${p}.png`;
    case 'scen_7': // 温泉
      return `${basePath}/bg_scen_7.png`; // 通用
    case 'scen_8': // 按摩室
      return `${basePath}/bg_scen_8.png`; // 通用
    case 'scen_9': // 库房
      return `${basePath}/bg_scen_9.png`; // 通用
    case 'scen_10': // 道具店
      return `${basePath}/bg_scen_10.png`; // 通用
    default:
      return `${basePath}/scen_1/bg_scen_1_lv1_day.png`;
  }
};
