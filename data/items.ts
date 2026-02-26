import { ItemData } from '../types';
import { ITEMS_RES } from './item-res';
import { ITEMS_ITM } from './item-itm';
import { ITEMS_SPC } from './item-spc';
import { ITEMS_EQUIP } from './item-equip';

export * from './item-type';

export const ITEMS: Record<string, ItemData> = {
  ...ITEMS_RES,
  ...ITEMS_ITM,
  ...ITEMS_SPC,
  ...ITEMS_EQUIP
};

