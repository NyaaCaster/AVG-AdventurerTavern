/**
 * 战斗系统 - 伤害公式解析器
 * 解析并计算技能数据中定义的伤害公式
 * 
 * 支持的公式语法：
 * - 属性引用：a.atk, b.def, a.mat, b.mdf, a.mhp, b.mhp 等
 * - 数学函数：Math.max, Math.min, Math.floor, Math.ceil, Math.round, Math.abs, Math.sqrt, Math.pow
 * - 算术运算：+, -, *, /
 * 
 * 公式示例：
 * - "a.atk * 4 - b.def * 2"           // 基础物理伤害
 * - "Math.max(a.mat * 4 - b.mdf * 2, 100)"  // 带最小值的魔法伤害
 * - "a.mhp * 0.6"                     // 基于最大HP的治疗
 */

import { BattleUnit, BattleStats } from './types';

/**
 * 公式计算上下文
 */
export interface FormulaContext {
  /** 攻击者 */
  a: BattleUnit;
  /** 目标 */
  b: BattleUnit;
}

/**
 * 公式计算结果
 */
export interface FormulaResult {
  /** 计算结果值 */
  value: number;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 安全的数学函数映射表
 * 仅允许使用预定义的安全函数，防止代码注入
 */
const SAFE_MATH_FUNCTIONS: Record<string, ((...args: number[]) => number) | (() => number)> = {
  max: Math.max,
  min: Math.min,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  abs: Math.abs,
  sqrt: Math.sqrt,
  pow: Math.pow,
  random: Math.random
};

/**
 * 获取单位的属性值
 * @param unit 战斗单位
 * @param property 属性名称
 * @returns 属性值
 */
function getUnitValue(unit: BattleUnit, property: string): number {
  const stats = unit.stats;
  const statMap: Record<string, number> = {
    atk: stats.atk,
    def: stats.def,
    mat: stats.matk,
    mdf: stats.mdef,
    agi: stats.agi,
    luk: stats.luk,
    hp: stats.hp,
    mp: stats.mp,
    mhp: stats.maxHp,
    mmp: stats.maxMp,
    maxHp: stats.maxHp,
    maxMp: stats.maxMp,
    matk: stats.matk,
    mdef: stats.mdef
  };
  
  return statMap[property] ?? 0;
}

function evaluateOperand(context: FormulaContext, operand: string): number {
  const trimmed = operand.trim();
  
  if (/^a\.[a-zA-Z]+$/.test(trimmed)) {
    const prop = trimmed.substring(2);
    return getUnitValue(context.a, prop);
  }
  
  if (/^b\.[a-zA-Z]+$/.test(trimmed)) {
    const prop = trimmed.substring(2);
    return getUnitValue(context.b, prop);
  }
  
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    return num;
  }
  
  return 0;
}

function evaluateMathFunction(
  funcName: string,
  args: string[],
  context: FormulaContext
): number {
  const func = SAFE_MATH_FUNCTIONS[funcName as keyof typeof SAFE_MATH_FUNCTIONS];
  if (!func) {
    return 0;
  }
  
  const evaluatedArgs = args.map(arg => evaluateExpression(arg, context));
  
  if (funcName === 'random') {
    return func();
  }
  
  return (func as (...args: number[]) => number)(...evaluatedArgs);
}

function evaluateExpression(expr: string, context: FormulaContext): number {
  let trimmed = expr.trim();
  
  const mathFuncRegex = /^Math\.(max|min|floor|ceil|round|abs|sqrt|pow|random)\(([^)]+)\)$/;
  const match = trimmed.match(mathFuncRegex);
  
  if (match) {
    const funcName = match[1];
    const argsStr = match[2];
    const args = splitByComma(argsStr);
    return evaluateMathFunction(funcName, args, context);
  }
  
  if (trimmed.includes('(') && trimmed.includes(')')) {
    const parenRegex = /^(.+?)\((.+)\)$/;
    const parenMatch = trimmed.match(parenRegex);
    if (parenMatch && !parenMatch[1].includes('Math')) {
      const inner = parenMatch[2];
      return evaluateExpression(inner, context);
    }
  }
  
  if (trimmed.includes('+') || trimmed.includes('-') || trimmed.includes('*') || trimmed.includes('/')) {
    return evaluateArithmetic(trimmed, context);
  }
  
  return evaluateOperand(context, trimmed);
}

function splitByComma(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenDepth = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') parenDepth++;
    if (char === ')') parenDepth--;
    
    if (char === ',' && parenDepth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    result.push(current.trim());
  }
  
  return result;
}

function findOperatorIndex(expr: string): { index: number; operator: string } | null {
  let parenDepth = 0;
  
  for (let i = expr.length - 1; i >= 0; i--) {
    const char = expr[i];
    if (char === ')') parenDepth++;
    if (char === '(') parenDepth--;
    
    if (parenDepth === 0) {
      if (char === '+' || char === '-') {
        if (i > 0 && (expr[i - 1] === '*' || expr[i - 1] === '/' || expr[i - 1] === '+' || expr[i - 1] === '-')) {
          continue;
        }
        return { index: i, operator: char };
      }
    }
  }
  
  parenDepth = 0;
  for (let i = expr.length - 1; i >= 0; i--) {
    const char = expr[i];
    if (char === ')') parenDepth++;
    if (char === '(') parenDepth--;
    
    if (parenDepth === 0) {
      if (char === '*' || char === '/') {
        return { index: i, operator: char };
      }
    }
  }
  
  return null;
}

function evaluateArithmetic(expr: string, context: FormulaContext): number {
  const trimmed = expr.trim();
  
  const opInfo = findOperatorIndex(trimmed);
  
  if (!opInfo) {
    return evaluateOperand(context, trimmed);
  }
  
  const { index, operator } = opInfo;
  const left = trimmed.substring(0, index).trim();
  const right = trimmed.substring(index + 1).trim();
  
  const leftVal = evaluateExpression(left, context);
  const rightVal = evaluateExpression(right, context);
  
  switch (operator) {
    case '+': return leftVal + rightVal;
    case '-': return leftVal - rightVal;
    case '*': return leftVal * rightVal;
    case '/': return rightVal !== 0 ? leftVal / rightVal : 0;
    default: return 0;
  }
}

export function evaluateFormula(formula: string, context: FormulaContext): FormulaResult {
  try {
    const sanitized = formula
      .replace(/\s+/g, ' ')
      .trim();
    
    const value = evaluateExpression(sanitized, context);
    
    if (isNaN(value) || !isFinite(value)) {
      return { value: 0, error: 'Invalid calculation result' };
    }
    
    return { value: Math.floor(value) };
  } catch (error) {
    return { 
      value: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export function calculateSkillDamage(
  formula: string,
  source: BattleUnit,
  target: BattleUnit
): number {
  const result = evaluateFormula(formula, { a: source, b: target });
  return Math.max(0, result.value);
}
