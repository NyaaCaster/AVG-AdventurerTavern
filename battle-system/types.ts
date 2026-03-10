export enum DamageType {
  NONE = 0,
  HP_DAMAGE = 1,
  HP_RECOVERY = 3,
  HP_ABSORB = 5
}

export enum EffectCode {
  ADD_STATE = 21,
  REMOVE_STATE = 22,
  ADD_BUFF = 31,
  ADD_DEBUFF = 32,
  REMOVE_BUFF = 33,
  REMOVE_DEBUFF = 34,
  SPECIAL = 44
}

export enum SkillScope {
  NONE = 0,
  ENEMY_SINGLE = 1,
  ENEMY_ALL = 2,
  ENEMY_ALL_CONTINUOUS = 3,
  ENEMY_RANDOM_SINGLE = 4,
  ENEMY_RANDOM_X2 = 5,
  ALLY_SINGLE = 6,
  ALLY_ALL = 7,
  ALLY_ALL_CONTINUOUS = 8,
  SELF = 9,
  SELF_AFFECT_ALLY_ALL = 10,
  ENEMY_SINGLE_CONTINUOUS = 11
}

export enum Faction {
  PLAYER = 'player',
  ENEMY = 'enemy'
}

export enum ElementType {
  NONE = 0,
  FIRE = 1,
  ICE = 2,
  THUNDER = 3,
  WATER = 4,
  EARTH = 5,
  WIND = 6,
  LIGHT = 7,
  DARK = 8
}

export enum StatusEffectType {
  NEGATIVE = 'negative',
  POSITIVE = 'positive',
  SPECIAL = 'special'
}

export interface BattleStats {
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  atk: number;
  def: number;
  mat: number;
  mdf: number;
  agi: number;
  luk: number;
}

export interface BuffModifier {
  stat: keyof Pick<BattleStats, 'atk' | 'def' | 'mat' | 'mdf' | 'agi' | 'luk'>;
  value: number;
  turnsRemaining: number;
  isDebuff: boolean;
}

export interface StatusEffectInstance {
  effectId: number;
  name: string;
  type: StatusEffectType;
  turnsRemaining: number;
  damagePerTurn?: number;
  healPerTurn?: number;
  restrictAction?: boolean;
  restrictSkill?: boolean;
  restrictItem?: boolean;
  restrictMagic?: boolean;
}

export interface BattleUnit {
  id: string;
  name: string;
  faction: Faction;
  position: number;
  stats: BattleStats;
  baseStats: BattleStats;
  buffs: BuffModifier[];
  statusEffects: StatusEffectInstance[];
  isAlive: boolean;
  isGuarding: boolean;
  cooldowns: Map<number, number>;
}

export interface SkillEffect {
  code: EffectCode;
  dataId: number;
  value1: number;
  value2: number;
}

export interface SkillDamage {
  type: DamageType;
  elementId: ElementType;
  formula?: string;
  variance?: boolean;
  critical?: boolean;
}

export interface SkillData {
  id: number;
  name: string;
  description: string;
  scope: SkillScope;
  mpCost: number;
  damage?: SkillDamage;
  effects?: SkillEffect[];
  speed: number;
  successRate: number;
  repeats: number;
  hitType: number;
  cooldown?: number;
  isPassive?: boolean;
}

export interface DamageResult {
  value: number;
  isCritical: boolean;
  isHealing: boolean;
  isAbsorb: boolean;
  element: ElementType;
  variance: number;
}

export interface SkillExecutionResult {
  skillId: number;
  skillName: string;
  source: string;
  targets: TargetResult[];
  success: boolean;
  message: string;
}

export interface TargetResult {
  targetId: string;
  targetName: string;
  damage?: DamageResult;
  effects?: AppliedEffect[];
  missed: boolean;
}

export interface AppliedEffect {
  type: EffectCode;
  name: string;
  value: number;
  duration: number;
  success: boolean;
}

export interface TurnAction {
  unit: BattleUnit;
  skill?: SkillData;
  targetIds?: string[];
  isGuard?: boolean;
  isItem?: boolean;
  itemId?: number;
  priority: number;
}

export interface BattleState {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  turnNumber: number;
  actionQueue: TurnAction[];
  battleLog: BattleLogEntry[];
  isEnded: boolean;
  winner?: Faction;
}

export interface BattleLogEntry {
  turn: number;
  type: 'damage' | 'heal' | 'effect' | 'death' | 'revive' | 'buff' | 'debuff' | 'system';
  source?: string;
  target?: string;
  value?: number;
  description: string;
  details?: Record<string, unknown>;
}

export type StatKey = 'maxHp' | 'hp' | 'maxMp' | 'mp' | 'atk' | 'def' | 'mat' | 'mdf' | 'agi' | 'luk';
