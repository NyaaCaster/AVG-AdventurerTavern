/**
 * 战斗系统 - 增益/减益效果模块
 * 处理角色属性增益和减益的管理逻辑
 */

import {
  BattleUnit,
  BattleStats,
  BuffModifier,
  EffectCode,
  AppliedEffect,
  StatKey
} from './types';

/** 可被增益/减益影响的属性类型 */
export type BuffableStat = 'atk' | 'def' | 'matk' | 'mdef' | 'agi' | 'luk';

/** 可增益属性列表 */
export const BUFFABLE_STATS: BuffableStat[] = ['atk', 'def', 'matk', 'mdef', 'agi', 'luk'];

/**
 * 增益/减益定义接口
 */
export interface BuffDefinition {
  /** 增益ID */
  id: number;
  /** 增益名称 */
  name: string;
  /** 影响的属性 */
  stat: BuffableStat;
  /** 增益数值 */
  value: number;
  /** 持续回合数 */
  duration: number;
  /** 是否为减益 */
  isDebuff: boolean;
  /** 是否为百分比加成 */
  isPercentage?: boolean;
}

/** 最大增益叠加层数 */
const MAX_BUFF_STACKS = 2;
/** 标准增益数值倍率（25%） */
const BUFF_STAT_MULTIPLIER = 0.25;

/**
 * 检查单位是否有指定的增益/减益
 * @param unit 战斗单位
 * @param stat 属性类型
 * @param isDebuff 是否为减益
 * @returns 是否存在
 */
export function hasBuff(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): boolean {
  return unit.buffs.some(
    buff => buff.stat === stat && buff.isDebuff === isDebuff
  );
}

/**
 * 获取单位指定的增益/减益
 * @param unit 战斗单位
 * @param stat 属性类型
 * @param isDebuff 是否为减益
 * @returns 增益修饰符或undefined
 */
export function getBuff(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): BuffModifier | undefined {
  return unit.buffs.find(
    buff => buff.stat === stat && buff.isDebuff === isDebuff
  );
}

/**
 * 获取增益叠加层数
 * @param unit 战斗单位
 * @param stat 属性类型
 * @param isDebuff 是否为减益
 * @returns 叠加层数
 */
export function getBuffStacks(unit: BattleUnit, stat: BuffableStat, isDebuff: boolean): number {
  const buff = getBuff(unit, stat, isDebuff);
  return buff ? 1 : 0;
}

/**
 * 应用增益/减益效果
 * @param unit 战斗单位
 * @param definition 增益定义
 * @param successRate 成功率，默认1（100%）
 * @returns 应用效果结果
 */
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

/**
 * 移除指定的增益/减益
 * @param unit 战斗单位
 * @param stat 属性类型
 * @param isDebuff 是否为减益
 * @returns 是否成功移除
 */
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

/**
 * 移除所有增益效果
 * @param unit 战斗单位
 * @returns 移除的增益数量
 */
export function removeAllBuffs(unit: BattleUnit): number {
  const count = unit.buffs.filter(buff => !buff.isDebuff).length;
  unit.buffs = unit.buffs.filter(buff => buff.isDebuff);
  return count;
}

/**
 * 移除所有减益效果
 * @param unit 战斗单位
 * @returns 移除的减益数量
 */
export function removeAllDebuffs(unit: BattleUnit): number {
  const count = unit.buffs.filter(buff => buff.isDebuff).length;
  unit.buffs = unit.buffs.filter(buff => !buff.isDebuff);
  return count;
}

/**
 * 处理增益/减益回合结束
 * 减少所有增益/减益的剩余回合数，移除过期的效果
 * @param unit 战斗单位
 * @returns 过期的增益/减益名称列表
 */
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

/**
 * 计算增益/减益后的属性值
 * @param baseValue 基础属性值
 * @param buffs 增益修饰符列表
 * @param stat 要计算的属性
 * @returns 计算后的属性值
 */
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

/**
 * 获取指定属性的增益值
 * @param unit 战斗单位
 * @param stat 属性类型
 * @returns 增益值
 */
export function getStatBuffValue(unit: BattleUnit, stat: BuffableStat): number {
  const buff = getBuff(unit, stat, false);
  return buff ? buff.value : 0;
}

/**
 * 获取指定属性的减益值
 * @param unit 战斗单位
 * @param stat 属性类型
 * @returns 减益值
 */
export function getStatDebuffValue(unit: BattleUnit, stat: BuffableStat): number {
  const debuff = getBuff(unit, stat, true);
  return debuff ? debuff.value : 0;
}

/**
 * 获取指定属性的净增益值（增益-减益）
 * @param unit 战斗单位
 * @param stat 属性类型
 * @returns 净增益值
 */
export function getNetBuffValue(unit: BattleUnit, stat: BuffableStat): number {
  const buffValue = getStatBuffValue(unit, stat);
  const debuffValue = getStatDebuffValue(unit, stat);
  return buffValue - debuffValue;
}

/**
 * 创建标准增益/减益定义
 * @param stat 属性类型
 * @param duration 持续回合数，默认4
 * @param isDebuff 是否为减益
 * @returns 增益定义
 */
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

/**
 * 获取属性的中文名称
 * @param stat 属性类型
 * @returns 中文名称
 */
function getStatName(stat: BuffableStat): string {
  const names: Record<BuffableStat, string> = {
    atk: '攻击力',
    def: '防御力',
    matk: '魔法攻击',
    mdef: '魔法防御',
    agi: '敏捷',
    luk: '幸运'
  };
  return names[stat];
}

/**
 * 应用标准增益/减益
 * @param unit 战斗单位
 * @param stat 属性类型
 * @param duration 持续回合数，默认4
 * @param isDebuff 是否为减益
 * @param successRate 成功率，默认1
 * @returns 应用效果结果
 */
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

/**
 * 获取增益效果数量
 * @param unit 战斗单位
 * @returns 增益数量
 */
export function getBuffCount(unit: BattleUnit): number {
  return unit.buffs.filter(buff => !buff.isDebuff).length;
}

/**
 * 获取减益效果数量
 * @param unit 战斗单位
 * @returns 减益数量
 */
export function getDebuffCount(unit: BattleUnit): number {
  return unit.buffs.filter(buff => buff.isDebuff).length;
}

/**
 * 检查单位是否有指定属性的增益
 * @param unit 战斗单位
 * @param stat 属性类型
 * @returns 是否有增益
 */
export function isBuffed(unit: BattleUnit, stat: BuffableStat): boolean {
  return hasBuff(unit, stat, false);
}

/**
 * 检查单位是否有指定属性的减益
 * @param unit 战斗单位
 * @param stat 属性类型
 * @returns 是否有减益
 */
export function isDebuffed(unit: BattleUnit, stat: BuffableStat): boolean {
  return hasBuff(unit, stat, true);
}
