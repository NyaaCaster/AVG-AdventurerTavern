
import { ItemData } from '../types';

export const ITEMS_SPC: Record<string, ItemData> = {
  // --- 特殊道具类 (spc) ---
  'spc-00': { id: 'spc-00', name: '「莫比乌斯」', category: 'spc', quality: 'S', maxStack: 1, description: "真名为「莫比乌斯」的圣剑，{{user}}作为勇者时并肩战斗的伙伴，在被「世界」认可为「勇者」的{{user}}手中时，可以通过支付巨大的代价，发动短时间改变时间流逝方式的权能「境界线」。现在被厚厚的白布包裹着，沉睡在库房的隐蔽角落。" },
  'spc-01': { id: 'spc-01', name: '迷惑药', category: 'spc', quality: 'C', maxStack: 9, description: "别名「魅惑香薰」，使用后，当日住宿费会增加100g，但评级会下降10%" },
  'spc-02': { id: 'spc-02', name: '安眠药', category: 'spc', quality: 'C', maxStack: 9, description: "别名「魔女的吐息」，使目标进入`💤昏睡`状态，受到任何行为都不会清醒，直到第二天清晨才会解除。可以在客房对女性角色使用。" },
  'spc-03': { id: 'spc-03', name: '媚药', category: 'spc', quality: 'B', maxStack: 9, description: "别名「蛊惑之蜜」，使目标进入`💗发情`状态，能确实引发情欲，使其身体变得淫荡，难以拒绝性方面的请求，直到第二天清晨才会解除。可以在客房对女性角色使用。" },
  'spc-04': { id: 'spc-04', name: '催眠药', category: 'spc', quality: 'A', maxStack: 9, description: "别名「梦幻之香」，使目标进入`💜支配`状态，产生淫靡情绪的幻觉，失去判断力，完全听从命令，直到第二天清晨才会解除，事后会遗忘这段经历。可以在客房对女性角色使用。" },
  'spc-05': { id: 'spc-05', name: '棉绳', category: 'spc', quality: 'D', maxStack: 9, description: "红色的棉绳，比普通麻绳质地柔软，收缩力强，似乎不是劳作工具。可以在客房对女性角色使用。" },
};
