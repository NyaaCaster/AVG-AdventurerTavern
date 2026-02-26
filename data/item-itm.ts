
import { ItemData } from '../types';

export const ITEMS_ITM: Record<string, ItemData> = {
  // --- 消耗品类 (itm) ---
  'itm-01': { id: 'itm-01', name: '治疗药·小', category: 'itm', quality: 'E', maxStack: 99, description: "恢复10%的生命值。只可对生命值不足100%战斗队员使用。" },
  'itm-02': { id: 'itm-02', name: '治疗药·中', category: 'itm', quality: 'D', maxStack: 99, description: "恢复30%的生命值。只可对生命值不足100%战斗队员使用。" },
  'itm-03': { id: 'itm-03', name: '治疗药·大', category: 'itm', quality: 'C', maxStack: 99, description: "恢复80%的生命值。只可对生命值不足100%战斗队员使用。" },
  'itm-04': { id: 'itm-04', name: '魔力药·凡', category: 'itm', quality: 'D', maxStack: 99, description: "恢复25%的魔力值。只可对魔力值不足100%战斗队员使用。" },
  'itm-05': { id: 'itm-05', name: '魔力药·极', category: 'itm', quality: 'B', maxStack: 99, description: "恢复50%的魔力值。只可对魔力值不足100%战斗队员使用。" },
  'itm-06': { id: 'itm-06', name: '魔力药·圣', category: 'itm', quality: 'S', maxStack: 99, description: "恢复100%的魔力值。只可对魔力值不足100%战斗队员使用。" },
  'itm-07': { id: 'itm-07', name: '精灵粉尘', category: 'itm', quality: 'B', maxStack: 99, description: "复活队友，并恢复20%的生命值。只可对`🪦死亡`状态的战斗队员使用。" },
  'itm-08': { id: 'itm-08', name: '凤凰之羽', category: 'itm', quality: 'A', maxStack: 99, description: "复活队友，并恢复60%的生命值。只可对`🪦死亡`状态的战斗队员使用。" },
  'itm-09': { id: 'itm-09', name: '女神遗香', category: 'itm', quality: 'S', maxStack: 99, description: "复活队友，并恢复100%的生命值，副作：进入于无法解除的`💗发情`状态，直到次日清晨才会解除。只可对`🪦死亡`状态的战斗队员使用。" },
  'itm-10': { id: 'itm-10', name: '清醒药', category: 'itm', quality: 'D', maxStack: 99, description: "解除队友的`💤昏睡`和`🌀晕眩`状态。只可对`💤昏睡`或`🌀晕眩`状态的战斗队员使用。" },
  'itm-11': { id: 'itm-11', name: '解毒剂', category: 'itm', quality: 'D', maxStack: 99, description: "解除队友的`🫐中毒`状态。只可`🫐中毒`状态的战斗队员使用。" },
  'itm-12': { id: 'itm-12', name: '绷带', category: 'itm', quality: 'E', maxStack: 99, description: "解除队友的`🩸流血`状态。只可`🩸流血`状态的战斗队员使用。" },
};
