/**
 * 战斗AI模块 - 条件解析器
 * 解析技能note中的AI条件标签，转换为结构化条件对象
 * 
 * 支持的标签格式：
 * - <All AI Conditions>...</All AI Conditions> - 所有条件必须满足
 * - <Any AI Conditions>...</Any AI Conditions> - 任一条件满足即可
 * - <AI Target: strategy> - 目标选择策略
 * - <Cooldown: x> - 冷却回合数
 */

import type {
  AICondition,
  SkillAIConfig,
  AITargetStrategy,
  HPPercentCondition,
  MPPercentCondition,
  HPValueCondition,
  MPValueCondition,
  StateCondition,
  StateTurnsCondition,
  BuffStacksCondition,
  TeamAliveCondition,
  TeamDeadCondition,
  RandomChanceCondition,
  SwitchCondition,
  VariableCondition,
  CustomExpressionCondition,
  TurnCondition,
  DamageCondition,
  StatCompareCondition,
  ConditionOperator,
  ConditionSubject
} from './types';

/** 条件解析缓存 */
const parseCache = new Map<string, SkillAIConfig>();

/**
 * 条件解析器类
 * 负责将技能note中的AI条件标签解析为结构化对象
 */
export class ConditionParser {
  private cache: Map<string, SkillAIConfig>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * 解析技能的AI配置
   * @param skillNote 技能note字符串
   * @returns 解析后的技能AI配置
   */
  parseSkillAIConfig(skillNote: string): SkillAIConfig {
    if (this.cache.has(skillNote)) {
      return this.cache.get(skillNote)!;
    }

    const config: SkillAIConfig = {
      allConditions: [],
      anyConditions: [],
      targetStrategy: undefined,
      cooldown: undefined
    };

    if (!skillNote) {
      this.cache.set(skillNote, config);
      return config;
    }

    config.allConditions = this.parseConditionBlock(skillNote, 'All AI Conditions');
    config.anyConditions = this.parseConditionBlock(skillNote, 'Any AI Conditions');
    config.targetStrategy = this.parseTargetStrategy(skillNote);
    config.cooldown = this.parseCooldown(skillNote);

    this.cache.set(skillNote, config);
    return config;
  }

  /**
   * 解析条件块
   * @param note 技能note
   * @param blockType 块类型（All AI Conditions 或 Any AI Conditions）
   * @returns 条件列表
   */
  private parseConditionBlock(note: string, blockType: 'All AI Conditions' | 'Any AI Conditions'): AICondition[] {
    const conditions: AICondition[] = [];
    const regex = new RegExp(`<${blockType}>([\\s\\S]*?)<\\/${blockType}>`, 'i');
    const match = note.match(regex);

    if (!match) {
      return conditions;
    }

    const blockContent = match[1].trim();
    const lines = blockContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
      const condition = this.parseSingleCondition(line);
      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions;
  }

  /**
   * 解析单个条件
   * @param line 条件行
   * @returns AI条件对象或null
   */
  private parseSingleCondition(line: string): AICondition | null {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('<')) {
      return null;
    }

    return (
      this.parseHPPercentCondition(trimmedLine) ||
      this.parseMPPercentCondition(trimmedLine) ||
      this.parseHPValueCondition(trimmedLine) ||
      this.parseMPValueCondition(trimmedLine) ||
      this.parseStateCondition(trimmedLine) ||
      this.parseStateTurnsCondition(trimmedLine) ||
      this.parseBuffStacksCondition(trimmedLine) ||
      this.parseTeamCondition(trimmedLine) ||
      this.parseRandomChanceCondition(trimmedLine) ||
      this.parseSwitchCondition(trimmedLine) ||
      this.parseVariableCondition(trimmedLine) ||
      this.parseTurnCondition(trimmedLine) ||
      this.parseDamageCondition(trimmedLine) ||
      this.parseStatCompareCondition(trimmedLine) ||
      this.parseCustomExpressionCondition(trimmedLine)
    );
  }

  /**
   * 解析HP百分比条件
   * 格式: User/Target HP% >= 50, User/Target HP% <= 30
   */
  private parseHPPercentCondition(line: string): HPPercentCondition | null {
    const regex = /^(User|Target|Lowest|Highest)\s+HP%\s*(>=|<=|>|<)\s*(\d+(?:\.\d+)?)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'hp_percent',
        operator: match[2] as ConditionOperator,
        value: parseFloat(match[3]),
        subject: match[1].toLowerCase() as ConditionSubject
      };
    }

    const negateRegex = /^(User|Target|Lowest|Highest)\s+HP%\s*!==?\s*(\d+(?:\.\d+)?)$/i;
    const negateMatch = line.match(negateRegex);
    if (negateMatch) {
      return {
        raw: line,
        negate: true,
        type: 'hp_percent',
        operator: '!==',
        value: parseFloat(negateMatch[2]),
        subject: negateMatch[1].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析MP百分比条件
   * 格式: User/Target MP% >= 50
   */
  private parseMPPercentCondition(line: string): MPPercentCondition | null {
    const regex = /^(User|Target|Lowest|Highest)\s+MP%\s*(>=|<=|>|<)\s*(\d+(?:\.\d+)?)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'mp_percent',
        operator: match[2] as ConditionOperator,
        value: parseFloat(match[3]),
        subject: match[1].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析HP绝对值条件
   * 格式: 0 < Target HP, Target HP <= 100
   */
  private parseHPValueCondition(line: string): HPValueCondition | null {
    const regex = /^(User|Target|Lowest|Highest)\s+HP\s*(>=|<=|>|<)\s*(\d+)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'hp_value',
        operator: match[2] as ConditionOperator,
        value: parseInt(match[3], 10),
        subject: match[1].toLowerCase() as ConditionSubject
      };
    }

    const reverseRegex = /^(\d+)\s*(>=|<=|>|<)\s*(User|Target|Lowest|Highest)\s+HP$/i;
    const reverseMatch = line.match(reverseRegex);
    if (reverseMatch) {
      const reverseOp = this.reverseOperator(reverseMatch[2] as ConditionOperator);
      return {
        raw: line,
        negate: false,
        type: 'hp_value',
        operator: reverseOp,
        value: parseInt(reverseMatch[1], 10),
        subject: reverseMatch[3].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析MP绝对值条件
   */
  private parseMPValueCondition(line: string): MPValueCondition | null {
    const regex = /^(User|Target|Lowest|Highest)\s+MP\s*(>=|<=|>|<)\s*(\d+)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'mp_value',
        operator: match[2] as ConditionOperator,
        value: parseInt(match[3], 10),
        subject: match[1].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析状态条件
   * 格式: User/Target Has State X, User/Target Not State X
   */
  private parseStateCondition(line: string): StateCondition | null {
    const hasRegex = /^(User|Target|Lowest|Highest)\s+Has\s+State\s+(\d+)$/i;
    const hasMatch = line.match(hasRegex);

    if (hasMatch) {
      return {
        raw: line,
        negate: false,
        type: 'has_state',
        stateId: parseInt(hasMatch[2], 10),
        subject: hasMatch[1].toLowerCase() as ConditionSubject
      };
    }

    const notRegex = /^(User|Target|Lowest|Highest)\s+Not\s+State\s+(\d+)$/i;
    const notMatch = line.match(notRegex);

    if (notMatch) {
      return {
        raw: line,
        negate: true,
        type: 'has_state',
        stateId: parseInt(notMatch[2], 10),
        subject: notMatch[1].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析状态回合数条件
   * 格式: User State X Turns === 0
   */
  private parseStateTurnsCondition(line: string): StateTurnsCondition | null {
    const regex = /^(User|Target|Lowest|Highest)\s+State\s+(\d+)\s+Turns\s*(>=|<=|>|<|===|!==)\s*(\d+)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: match[5] === '!==',
        type: 'state_turns',
        stateId: parseInt(match[2], 10),
        operator: match[3] as ConditionOperator,
        value: parseInt(match[4], 10),
        subject: match[1].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析Buff层数条件
   * 格式: User/Target atk buff stacks < 2, Target def debuff stacks > 0
   */
  private parseBuffStacksCondition(line: string): BuffStacksCondition | null {
    const regex = /^(User|Target|Lowest|Highest)\s+(atk|def|matk|mdef|agi|luk)\s+(buff|debuff)\s+stacks\s*(>=|<=|>|<)\s*(\d+)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'buff_stacks',
        stat: match[2].toLowerCase() as BuffStacksCondition['stat'],
        operator: match[4] as ConditionOperator,
        value: parseInt(match[5], 10),
        subject: match[1].toLowerCase() as ConditionSubject,
        isDebuff: match[3].toLowerCase() === 'debuff'
      };
    }

    return null;
  }

  /**
   * 解析队伍存活成员数条件
   * 格式: Target Team Alive Members >= 2, User Team Alive Members < 4
   */
  private parseTeamCondition(line: string): TeamAliveCondition | TeamDeadCondition | null {
    const aliveRegex = /^(User|Target|Lowest|Highest)\s+Team\s+Alive\s+Members\s*(>=|<=|>|<)\s*(\d+)$/i;
    const aliveMatch = line.match(aliveRegex);

    if (aliveMatch) {
      return {
        raw: line,
        negate: false,
        type: 'team_alive',
        operator: aliveMatch[2] as ConditionOperator,
        value: parseInt(aliveMatch[3], 10),
        subject: aliveMatch[1].toLowerCase() as ConditionSubject
      };
    }

    const deadRegex = /^(User|Target|Lowest|Highest)\s+Team\s+Dead\s+Members\s*(>=|<=|>|<)\s*(\d+)$/i;
    const deadMatch = line.match(deadRegex);

    if (deadMatch) {
      return {
        raw: line,
        negate: false,
        type: 'team_dead',
        operator: deadMatch[2] as ConditionOperator,
        value: parseInt(deadMatch[3], 10),
        subject: deadMatch[1].toLowerCase() as ConditionSubject
      };
    }

    return null;
  }

  /**
   * 解析随机概率条件
   * 格式: X% Chance
   */
  private parseRandomChanceCondition(line: string): RandomChanceCondition | null {
    const regex = /^(\d+(?:\.\d+)?)%\s+Chance$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'random_chance',
        value: parseFloat(match[1])
      };
    }

    return null;
  }

  /**
   * 解析开关条件
   * 格式: $gameSwitches.value(X) === true/false
   */
  private parseSwitchCondition(line: string): SwitchCondition | null {
    const regex = /\$gameSwitches\.value\((\d+)\)\s*===?\s*(true|false)/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'switch',
        switchId: parseInt(match[1], 10),
        expectedValue: match[2].toLowerCase() === 'true'
      };
    }

    return null;
  }

  /**
   * 解析变量条件
   * 格式: $gameVariables.value(X) === Y
   */
  private parseVariableCondition(line: string): VariableCondition | null {
    const regex = /\$gameVariables\.value\((\d+)\)\s*(===|!==|>=|<=|>|<)\s*(\d+)/;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: match[2] === '!==',
        type: 'variable',
        variableId: parseInt(match[1], 10),
        operator: match[2] as ConditionOperator,
        value: parseInt(match[3], 10)
      };
    }

    return null;
  }

  /**
   * 解析回合数条件
   */
  private parseTurnCondition(line: string): TurnCondition | null {
    const regex = /^Turn\s*(>=|<=|>|<|===)\s*(\d+)$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'turn',
        operator: match[1] as ConditionOperator,
        value: parseInt(match[2], 10)
      };
    }

    return null;
  }

  /**
   * 解析伤害计算条件
   * 格式: 0 < a.param(2) * 4 - b.param(3) * 2
   */
  private parseDamageCondition(line: string): DamageCondition | null {
    const regex = /^(\d+)\s*(>=|<=|>|<)\s*a\.param\(\d+\)\s*[\*\+\-\/\s\w\(\)]+$/i;
    const match = line.match(regex);

    if (match) {
      return {
        raw: line,
        negate: false,
        type: 'damage',
        operator: match[2] as ConditionOperator,
        value: parseInt(match[1], 10)
      };
    }

    return null;
  }

  /**
   * 解析属性比较条件
   * 格式: a.param(4) * 4 >= (a.param(2) * 4 - b.param(3) * 2)
   */
  private parseStatCompareCondition(line: string): StatCompareCondition | null {
    const regex = /a\.param\((\d+)\)\s*\*\s*(\d+(?:\.\d+)?)\s*(>=|<=|>|<)\s*\(?\s*a\.param\((\d+)\)/i;
    const match = line.match(regex);

    if (match) {
      const statMap: Record<number, keyof import('../types').BattleStats> = {
        0: 'maxHp', 1: 'maxMp', 2: 'atk', 3: 'def',
        4: 'matk', 5: 'mdef', 6: 'agi', 7: 'luk'
      };
      return {
        raw: line,
        negate: false,
        type: 'stat_compare',
        statA: statMap[parseInt(match[1], 10)] || 'atk',
        statB: statMap[parseInt(match[4], 10)] || 'atk',
        operator: match[3] as ConditionOperator,
        multiplier: parseFloat(match[2])
      };
    }

    return null;
  }

  /**
   * 解析自定义表达式条件
   * 作为最后的fallback，将无法识别的条件作为自定义表达式处理
   */
  private parseCustomExpressionCondition(line: string): CustomExpressionCondition | null {
    if (line.includes('$game') || line.includes('a.param') || line.includes('b.param')) {
      return {
        raw: line,
        negate: false,
        type: 'custom',
        expression: line
      };
    }

    return null;
  }

  /**
   * 解析目标选择策略
   * 格式: <AI Target: strategy>
   */
  private parseTargetStrategy(note: string): AITargetStrategy | undefined {
    const regex = /<AI\s+Target:\s*(\w+(?:\s+\w+)*)>/i;
    const match = note.match(regex);

    if (match) {
      const strategy = match[1].toLowerCase().replace(/\s+/g, '_');
      const validStrategies: AITargetStrategy[] = [
        'lowest_hp', 'highest_hp', 'lowest_hp_percent', 'highest_hp_percent',
        'lowest_mp', 'highest_mp', 'highest_atk', 'lowest_atk',
        'highest_def', 'lowest_def', 'highest_matk', 'lowest_matk',
        'highest_mdef', 'lowest_mdef', 'highest_agi', 'lowest_agi',
        'highest_luk', 'lowest_luk', 'highest_level', 'lowest_level',
        'highest_negative_state_count', 'random', 'first', 'last'
      ];

      if (validStrategies.includes(strategy as AITargetStrategy)) {
        return strategy as AITargetStrategy;
      }
    }

    return undefined;
  }

  /**
   * 解析冷却回合数
   * 格式: <Cooldown: x>
   */
  private parseCooldown(note: string): number | undefined {
    const regex = /<Cooldown:\s*(\d+)>/i;
    const match = note.match(regex);

    if (match) {
      return parseInt(match[1], 10);
    }

    return undefined;
  }

  /**
   * 反转操作符
   */
  private reverseOperator(op: ConditionOperator): ConditionOperator {
    const reverseMap: Record<string, ConditionOperator> = {
      '>': '<',
      '<': '>',
      '>=': '<=',
      '<=': '>='
    };
    return reverseMap[op] || op;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/** 默认条件解析器实例 */
export const conditionParser = new ConditionParser();

/**
 * 快捷函数：解析技能AI配置
 */
export function parseSkillAIConfig(skillNote: string): SkillAIConfig {
  return conditionParser.parseSkillAIConfig(skillNote);
}
