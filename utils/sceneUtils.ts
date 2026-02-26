import { SceneId, WorldState } from '../types';

/**
 * 鑾峰彇鍦烘櫙鑳屾櫙鍥剧墖璺緞
 * @param sceneId 鍦烘櫙ID
 * @param period 鏃堕棿娈?(day/evening/night)
 * @param level 鍦烘櫙绛夌骇 (榛樿涓?)
 */
export const getSceneBackground = (sceneId: SceneId, period: WorldState['period'], level: number = 1): string => {
  const basePath = "img/bg/AdventurerTavern";
  
  // 缁熶竴澶勭悊鏃堕棿娈靛悗缂€锛歟vening 瀵瑰簲 evenfall 璧勬簮
  const p = period === 'evening' ? 'evenfall' : period;

  let resLevel = 1;

  switch (sceneId) {
    case 'scen_1': // 鏌滃彴
      // LV1~LV9: lv1, LV10~LV19: lv2, LV20~LV29: lv3, LV30~LV39: lv4, LV40+: lv5
      if (level >= 40) resLevel = 5;
      else if (level >= 30) resLevel = 4;
      else if (level >= 20) resLevel = 3;
      else if (level >= 10) resLevel = 2;
      else resLevel = 1;
      return `${basePath}/scen_1/bg_scen_1_lv${resLevel}_${p}.png`;

    case 'scen_2': // 瀹㈡埧
    case 'scen_3': // 閰掑満
    case 'scen_4': // 璁粌鍦?      // LV1~LV9: lv1, LV10~LV19: lv2, LV20+: lv3
      if (level >= 20) resLevel = 3;
      else if (level >= 10) resLevel = 2;
      else resLevel = 1;
      return `${basePath}/${sceneId}/bg_${sceneId}_lv${resLevel}_${p}.png`;

    case 'scen_5': // 姝﹀櫒搴?    case 'scen_6': // 闃插叿搴?      // LV1~LV2: lv1, LV3~LV4: lv2, LV5+: lv3
      if (level >= 5) resLevel = 3;
      else if (level >= 3) resLevel = 2;
      else resLevel = 1;
      return `${basePath}/${sceneId}/bg_${sceneId}_lv${resLevel}_${p}.png`;

    // 浠ヤ笅鍦烘櫙鏃犵瓑绾у尯鍒嗭紝浣跨敤閫氱敤鑳屾櫙
    case 'scen_7': // 娓╂硥
      return `${basePath}/bg_scen_7.png`;

    case 'scen_8': // 鎸夋懇瀹?      return `${basePath}/bg_scen_8.png`;

    case 'scen_9': // 搴撴埧
      return `${basePath}/bg_scen_9.png`;

    case 'scen_10': // 閬撳叿搴?      return `${basePath}/bg_scen_10.png`;

    default:
      // 榛樿鍥為€€
      return `${basePath}/scen_1/bg_scen_1_lv1_day.png`;
  }
};

