const Knex = require('knex');
const knexConfig = require('../knexfile');
const fs = require('fs');
const path = require('path');

async function loadQuizzes() {
  const knex = Knex(knexConfig.development);
  
  try {
    console.log('🚀 INICIANDO CARGA DE QUIZZES...\n');
    
    // Verificar que el archivo JSON existe
    const jsonPath = path.join(__dirname, 'quizzes.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error('❌ Archivo quizzes.json no encontrado');
    }
    
    // Importar tu JSON
    const quizData = require('./quizzes.json');
    console.log(`📊 JSON cargado: ${quizData.categories.length} categorías encontradas\n`);
    
    // Limpiar datos existentes (si los hay)
    console.log('🧹 Limpiando datos existentes...');
    await knex('user_quiz_progress').delete();
    await knex('quizzes').delete();
    await knex('quiz_categories').delete();
    
    let totalQuizzes = 0;
    let insertedCategories = 0;
    
    console.log('\n📦 INSERTANDO DATOS...');
    
    // Insertar categorías y quizzes
    for (const categoryData of quizData.categories) {
      console.log(`\n➕ Procesando: ${categoryData.name}`);
      
      // Insertar categoría
      const [categoryId] = await knex('quiz_categories').insert({
        name: categoryData.name,
        level: categoryData.level,
        description: categoryData.description
      });
      
      insertedCategories++;
      
      // Insertar quizzes
      const quizzesToInsert = categoryData.quizzes.map((quiz, index) => ({
        category_id: categoryId,
        question: quiz.question,
        option_a: quiz.option_a,
        option_b: quiz.option_b,
        option_c: quiz.option_c,
        option_d: quiz.option_d,
        correct_answer: quiz.correct_answer,
        explanation: quiz.explanation || `Explicación para pregunta ${index + 1}`,
        difficulty: quiz.difficulty || 'medium'
      }));
      
      await knex('quizzes').insert(quizzesToInsert);
      totalQuizzes += quizzesToInsert.length;
      
      console.log(`   ✅ ${quizzesToInsert.length} quizzes insertados`);
    }
    
    console.log('\n🎉 CARGA COMPLETADA EXITOSAMENTE!');
    console.log(`📊 RESUMEN:`);
    console.log(`   📁 Categorías: ${insertedCategories}`);
    console.log(`   ❓ Quizzes: ${totalQuizzes}`);
    console.log(`   📈 Total preguntas: ${totalQuizzes}`);
    
  } catch (error) {
    console.error('❌ ERROR durante la carga:', error.message);
    console.error('Detalles:', error);
  } finally {
    await knex.destroy();
  }
}

// Ejecutar
loadQuizzes();