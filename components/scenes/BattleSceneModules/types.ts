import { BattleUnit, BattleState, Faction, SkillScope, SkillData as BattleSkillData } from '../../../battle-system/types';
import { PlayerCommand, BattleEndReason } from '../../../battle-system/player-commands';
import { QuestList, BattlePartySlots, CharacterStat, CharacterEquipment } from '../../../types';

export interface ExpGainInfo {
  characterId: string;
  name: string;
  avatarUrl: string;
  currentLevel: number;
  currentExp: number;
  gainedExp: number;
  finalExp: number;
  finalLevel: number;
  leveledUp: boolean;
  expToNextLevel: number;
  expPercentBefore: number;
  expPercentAfter: number;
}

export interface BattleSceneProps {
  isOpen: boolean;
  onClose: () => void;
  quest: QuestList;
  battleState: BattleState;
  battleParty: BattlePartySlots;
  characterStats: Record<string, CharacterStat>;
  characterEquipments: Record<string, CharacterEquipment>;
  inventory: Record<string, number>;
  userName: string;
  currentTurnUnit: BattleUnit | null;
  turnOrder: BattleUnit[];
  endReason: BattleEndReason | null;
  onExecuteCommand: (command: PlayerCommand, targetIds?: string[], skillId?: number, itemId?: string) => void;
  onAutoSave: () => void;
  enableDebug?: boolean;
}

export interface EnemyUnitWithImage extends BattleUnit {
  imageUrl: string;
  role: 'master' | 'servant';
}

export interface PlayerUnitWithImage extends BattleUnit {
  avatarUrl: string;
  name: string;
}

export interface SkillWithAvailability {
  id: number;
  name: string;
  mpCost: number;
  description?: string;
  scope?: SkillScope;
  isAvailable: boolean;
  reason?: string;
}

export type GaugeType = 'hp' | 'mp' | 'exp';

export interface GaugeBarProps {
  current: number;
  max: number;
  type: GaugeType;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  percent?: number;
}

export interface DamagePopupData {
  id: string;
  value: number;
  type: 'hpDamage' | 'hpHeal' | 'critical';
  x: number;
  y: number;
}

export interface BattleCursorProps {
  x: number;
  y: number;
  visible: boolean;
  isAllyTarget?: boolean;
  isMobile?: boolean;
}
