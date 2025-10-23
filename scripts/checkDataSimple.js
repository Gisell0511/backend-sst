const Knex = require('knex');
const knexConfig = require('../knexfile');

async function checkData() {
  const knex = Knex(knexConfig.development);
  
  try {
    console.log('🔍 VERIFICANDO BASE DE DATOS...\n');
    
    // Verificar si las tablas existen
    const tables = await knex.raw(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('quiz_categories', 'quizzes', 'user_quiz_progress')
    `);
    
    console.log('📋 TABLAS EXISTENTES:');
    tables.forEach(table => {
      console.log(`   ✅ ${table.name}`);
    });
    
    // Contar categorías
    const categoryCount = await knex('quiz_categories').count('* as total');
    console.log(`\n📁 TOTAL CATEGORÍAS: ${categoryCount[0].total}`);
    
    // Contar quizzes
    const quizCount = await knex('quizzes').count('* as total');
    console.log(`❓ TOTAL QUIZZES: ${quizCount[0].total}`);
    
    // Mostrar algunas categorías si existen
    if (categoryCount[0].total > 0) {
      console.log('\n🗂️ CATEGORÍAS:');
      const categories = await knex('quiz_categories').select('id', 'name', 'level').limit(5);
      categories.forEach(cat => {
        console.log(`   ${cat.id}. ${cat.name} (${cat.level})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await knex.destroy();
  }
}

checkData();