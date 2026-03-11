/**
 * 战斗AI模拟测试脚本
 * 
 * 使用uid=112玩家1号存档的角色阵容数据
 * 与quest-list.ts中id=0102的关卡进行模拟战斗演算
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 动态导入战斗系统模块
async function runTest() {
  // 导入模块
  const { createPlayerParty } = await import('./battle-system/player-unit-factory.js');
  const { createEnemyParty } = await import('./battle-system/enemy-unit-factory.js');
  const { 
    enemyBattleAI, 
    allyBattleAI,
    characterSkillsToActions,
    enemyActionToUnitAction
  } = await import('./battle-system/ai/index.js');
  const { SKILLS } = await import('./data/battle-data/skills.js');
  const { QUESTS } = await import('./data/quest-list.js');

  // 数据库路径
  const DB_PATH = path.join(__dirname, 'database-server', 'data', 'database.sqlite');

  // 创建技能映射
  function createSkillMap() {
    const skillMap = new Map();
    SKILLS.forEach(skill => skillMap.set(skill.id, skill));
    return skillMap;
  }

  // 模拟战斗回合
  function simulateTurn(
    turnNumber: number,
    playerUnits: any[],
    enemyUnits: any[],
    skillMap: Map<number, any>
  ) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`回合 ${turnNumber}`);
    console.log('='.repeat(60));

    // 显示当前状态
    console.log('\n【玩家队伍状态】');
    playerUnits.forEach((unit: any) => {
      console.log(`  ${unit.name} (Lv.${unit.level}) HP:${unit.stats.hp}/${unit.stats.maxHp} MP:${unit.stats.mp}/${unit.stats.maxMp} ${unit.isAlive ? '✓' : '✗'}`);
    });

    console.log('\n【敌人队伍状态】');
    enemyUnits.forEach((unit: any) => {
      console.log(`  ${unit.name} (Lv.${unit.level}) HP:${unit.stats.hp}/${unit.stats.maxHp} MP:${unit.stats.mp}/${unit.stats.maxMp} ${unit.isAlive ? '✓' : '✗'}`);
    });

    // 敌人AI决策
    console.log('\n【敌人AI决策】');
    enemyUnits.filter((u: any) => u.isAlive).forEach((enemy: any) => {
      const actions = enemy.actions.map((a: any) => enemyActionToUnitAction(a));
      
      const context = {
        unit: enemy,
        turnNumber,
        playerUnits: playerUnits.filter((u: any) => u.isAlive),
        enemyUnits: enemyUnits.filter((u: any) => u.isAlive),
        availableActions: actions,
        skillMap
      };

      const decision = enemyBattleAI.makeDecision(context);
      
      if (decision.isGuard) {
        console.log(`  ${enemy.name}: 选择防御 - ${decision.reason}`);
      } else {
        const skillName = decision.skill?.name || '未知技能';
        const targets = decision.targetIds.join(', ') || '无目标';
        console.log(`  ${enemy.name}: 使用【${skillName}】→ 目标: ${targets}`);
        console.log(`    原因: ${decision.reason}`);
      }
    });

    // 队友AI决策
    console.log('\n【队友AI决策】');
    playerUnits.filter((u: any) => u.isAlive && u.characterId !== 'char_1').forEach((ally: any) => {
      const actions = characterSkillsToActions(ally.skillSlots);
      
      const context = {
        unit: ally,
        turnNumber,
        playerUnits: playerUnits.filter((u: any) => u.isAlive),
        enemyUnits: enemyUnits.filter((u: any) => u.isAlive),
        availableActions: actions,
        skillMap
      };

      const decision = allyBattleAI.makeDecision(context);
      
      if (decision.isGuard) {
        console.log(`  ${ally.name}: 选择防御 - ${decision.reason}`);
      } else {
        const skillName = decision.skill?.name || '未知技能';
        const targets = decision.targetIds.join(', ') || '无目标';
        console.log(`  ${ally.name}: 使用【${skillName}】→ 目标: ${targets}`);
        console.log(`    原因: ${decision.reason}`);
      }
    });
  }

  // 主逻辑
  console.log('战斗AI模拟测试');
  console.log('='.repeat(60));

  // 读取数据库
  const db = new sqlite3.Database(DB_PATH, (err: Error | null) => {
    if (err) {
      console.error('无法打开数据库:', err.message);
      return;
    }
    console.log('数据库连接成功');
  });

  // 查询存档数据
  const saveData = await new Promise<any>((resolve, reject) => {
    db.get('SELECT data FROM saves WHERE user_id = 117 AND slot_id = 1', (err: Error | null, row: { data: string } | undefined) => {
      if (err) {
        reject(err);
        return;
      }
      if (!row) {
        reject(new Error('未找到存档数据'));
        return;
      }
      try {
        const data = JSON.parse(row.data);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });

  db.close();

  console.log('\n【存档数据解析成功】');
  console.log(`  旅店名称: ${saveData.innName || '未命名'}`);
  console.log(`  金币: ${saveData.gold || 0}`);

  // 获取关卡配置
  const quest = QUESTS['0102'];
  if (!quest) {
    throw new Error('未找到关卡0102');
  }

  console.log('\n【关卡信息】');
  console.log(`  关卡ID: ${quest.quest_id}`);
  console.log(`  关卡名: ${quest.quest_name}`);
  console.log(`  难度星级: ${quest.star}`);
  console.log(`  敌人等级: ${quest.enemy_level}`);
  console.log(`  敌人配置: ${JSON.stringify(quest.battle_config.enemies)}`);

  // 创建玩家队伍
  const battleParty = saveData.battleParty || ['char_1', 'char_101', 'char_102'];
  const characterIds = battleParty.filter((id: string | null) => id !== null);
  
  console.log('\n【玩家队伍】');
  console.log(`  阵容: ${characterIds.join(', ')}`);

  const playerUnits = createPlayerParty({
    members: characterIds.map((id: string, index: number) => ({ characterId: id, position: index + 1 })),
    levels: saveData.characterStats || {},
    equipments: saveData.characterEquipments || {},
    skillSlots: saveData.characterSkills || {}
  });

  console.log('\n【玩家单位创建结果】');
  playerUnits.forEach((unit: any) => {
    console.log(`  ${unit.name} (Lv.${unit.level})`);
    console.log(`    HP:${unit.stats.maxHp} MP:${unit.stats.maxMp} ATK:${unit.stats.atk} DEF:${unit.stats.def}`);
    console.log(`    技能槽: ${JSON.stringify(unit.skillSlots)}`);
  });

  // 创建敌人队伍
  const enemyUnits = createEnemyParty({
    enemies: quest.battle_config.enemies,
    enemyLevel: quest.enemy_level
  });

  console.log('\n【敌人单位创建结果】');
  enemyUnits.forEach((unit: any) => {
    console.log(`  ${unit.name} (Lv.${unit.level})`);
    console.log(`    HP:${unit.stats.maxHp} MP:${unit.stats.maxMp} ATK:${unit.stats.atk} DEF:${unit.stats.def}`);
    console.log(`    行动数: ${unit.actions.length}`);
  });

  // 创建技能映射
  const skillMap = createSkillMap();
  console.log(`\n【技能映射】共 ${skillMap.size} 个技能`);

  // 模拟3个回合
  for (let turn = 1; turn <= 3; turn++) {
    simulateTurn(turn, playerUnits, enemyUnits, skillMap);
  }

  console.log('\n' + '='.repeat(60));
  console.log('模拟测试完成');
}

runTest().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
