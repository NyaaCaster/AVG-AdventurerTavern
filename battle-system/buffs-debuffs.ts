import {
  BattleUnit,
  BattleStats,
  BuffModifier,
  EffectCode,
  AppliedEffect,
  StatKey
} from './types';

export type BuffableStat = 'atk' | 'def' | 'mat' | 'mdf' | 'agi' | 'luk';

export const BUFFABLE_STATS: BuffableStat[] = ['atk', 'def', 'mat', 'mdf', 'agi', 'luk'];

export interface BuffDefinition {
  id: number;
  name: string;
  stat: BuffableStat;
  value: number;
  duration: number;
  isDebuff: boolean;
  isPercentage?: boolean;
}

const MAX_BUFF_STACKS = 2;
const BUFF_STAT_MULTIPLIER = 0.25;

export function hasBuff(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): boolean {
  return unit.buffs.some(
    buff => buff.stat === stat && buff.isDebuff === isDebuff
  );
}

export function getBuff(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): BuffModifier | undefined {
  return unit.buffs.find(
    buff => buff.stat === stat && buff.isDebuff === isDebuff
  );
}

export function getBuffStacks(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): number {
  const buff = getBuff(unit, stat, isDebuff);
  return buff ? 1 : 0;
}

export function applyBuff(
  unit: BattleUnit,
  definition: BuffDefinition,
  successRate: number = 1
): AppliedEffect {
  const roll = Math.random();
  const success = roll < successRate;
  
  if (!success) {
    return {
      type: definition.isDebuff ? EffectCode.ADD_DEBUFF : EffectCode.ADD_BUFF,
      name: definition.name,
      value: 0,
      duration: 0,
      success: false
    };
  }
  
  const existingBuff = getBuff(unit, definition.stat, definition.isDebuff);
  
  if (existingBuff) {
    existingBuff.turnsRemaining = Math.max(
      existingBuff.turnsRemaining,
      definition.duration
    );
  } else {
    const buff: BuffModifier = {
      stat: definition.stat,
      value: definition.value,
      turnsRemaining: definition.duration,
      isDebuff: definition.isDebuff
    };
    unit.buffs.push(buff);
  }
  
  return {
    type: definition.isDebuff ? EffectCode.ADD_DEBUFF : EffectCode.ADD_BUFF,
    name: definition.name,
    value: definition.value,
    duration: definition.duration,
    success: true
  };
}

export function removeBuff(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): boolean {
  const index = unit.buffs.findIndex(
    buff => buff.stat === stat && buff.isDebuff === isDebuff
  );
  if (index === -1) {
    return false;
  }
  unit.buffs.splice(index, 1);
  return true;
}

export function removeAllBuffs(unit: BattleUnit): number {
  const count = unit.buffs.filter(buff => !buff.isDebuff).length;
  unit.buffs = unit.buffs.filter(buff => buff.isDebuff);
  return count;
}

export function removeAllDebuffs(unit: BattleUnit): number {
  const count = unit.buffs.filter(buff => buff.isDebuff).length;
  unit.buffs = unit.buffs.filter(buff => !buff.isDebuff);
  return count;
}

export function processBuffTurn(unit: BattleUnit): string[] {
  const expiredBuffs: string[] = [];
  
  for (let i = unit.buffs.length - 1; i >= 0; i--) {
    const buff = unit.buffs[i];
    buff.turnsRemaining--;
    
    if (buff.turnsRemaining <= 0) {
      expiredBuffs.push(`${buff.isDebuff ? '减益' : '增益'}: ${buff.stat}`);
      unit.buffs.splice(i, 1);
    }
  }
  
  return expiredBuffs;
}

export function calculateBuffedStat(
  baseValue: number,
  buffs: BuffModifier[],
  stat: BuffableStat
): number {
  let modifier = 0;
  
  for (const buff of buffs) {
    if (buff.stat === stat) {
      if (buff.isDebuff) {
        modifier -= buff.value;
      } else {
        modifier += buff.value;
      }
    }
  }
  
  return Math.max(0, baseValue + modifier);
}

export function getStatBuffValue(unit: BattleUnit, stat: BuffableStat): number {
  const buff = getBuff(unit, stat, false);
  return buff ? buff.value : 0;
}

export function getStatDebuffValue(unit: BattleUnit, stat: BuffableStat): number {
  const debuff = getBuff(unit, stat, true);
  return debuff ? debuff.value : 0;
}

export function getNetBuffValue(unit: BattleUnit, stat: BuffableStat): number {
  const buffValue = getStatBuffValue(unit, stat);
  const debuffValue = getStatDebuffValue(unit, stat);
  return buffValue - debuffValue;
}

export function createStandardBuff(
  stat: BuffableStat,
  duration: number = 4,
  isDebuff: boolean = false
): BuffDefinition {
  return {
    id: isDebuff ? 100 + BUFFABLE_STATS.indexOf(stat) : BUFFABLE_STATS.indexOf(stat),
    name: isDebuff ? `${getStatName(stat)}下降` : `${getStatName(stat)}上升`,
    stat,
    value: BUFF_STAT_MULTIPLIER,
    duration,
    isDebuff,
    isPercentage: true
  };
}

function getStatName(stat: BuffableStat): string {
  const names: Record<BuffableStat, string> = {
    atk: '攻击力',
    def: '防御力',
    mat: '魔法攻击',
    mdf: '魔法防御',
    agi: '敏捷',
    luk: '幸运'
  };
  return names[stat];
}

export function applyStandardBuff(
  unit: BattleUnit,
  stat: BuffableStat,
  duration: number = 4,
  isDebuff: boolean = false,
  successRate: number = 1
): AppliedEffect {
  const definition = createStandardBuff(stat, duration, isDebuff);
  return applyBuff(unit, definition, successRate);
}

export function getBuffCount(unit: BattleUnit): number {
  return unit.buffs.filter(buff => !buff.isDebuff).length;
}

export function getDebuffCount(unit: BattleUnit): number {
  return unit.buffs.filter(buff => buff.isDebuff).length;
}

export function isBuffed(unit: BattleUnit, stat: BuffableStat): boolean {
  return hasBuff(unit, stat, false);
}

export function isDebuffed(unit: BattleUnit, stat: BuffableStat): boolean {
  return hasBuff(unit, stat, true);
}
