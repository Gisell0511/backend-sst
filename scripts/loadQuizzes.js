// Configurar Objection primero
const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('../knexfile');

// Inicializar Knex
const knex = Knex(knexConfig.development);
Model.knex(knex);

// Ahora importar los modelos
const QuizCategory = require('../models/QuizCategory');
const Quiz = require('../models/Quiz');

async function loadQuizzes() {
  try {
    console.log('Iniciando carga de quizzes...');

    // Importar tu JSON
    const quizData = require('./quizzes.json');

    // Verificar que los modelos funcionen
    console.log('✅ Modelos cargados correctamente');

    // Limpiar datos existentes
    console.log('Limpiando datos existentes...');
    await Quiz.query().delete();
    await QuizCategory.query().delete();

    console.log('Creando categorías y quizzes...');
    
    for (const categoryData of quizData.categories) {
      // Crear categoría
      const category = await QuizCategory.query().insert({
        name: categoryData.name,
        level: categoryData.level,
        description: categoryData.description
      });

      console.log(`✅ Categoría creada: ${category.name}`);

      // Crear quizzes para esta categoría
      const quizzesToInsert = categoryData.quizzes.map((quiz, index) => ({
        category_id: category.id,
        question: quiz.question,
        option_a: quiz.option_a,
        option_b: quiz.option_b,
        option_c: quiz.option_c,
        option_d: quiz.option_d,
        correct_answer: quiz.correct_answer,
        explanation: quiz.explanation || '',
        difficulty: quiz.difficulty || 'medium'
      }));

      await Quiz.query().insertGraph(quizzesToInsert);
      console.log(`✅ ${quizzesToInsert.length} quizzes creados para ${category.name}`);
    }

    console.log('🎉 Todos los quizzes han sido cargados exitosamente!');
    return { success: true, message: 'Datos cargados correctamente' };
  } catch (error) {
    console.error('❌ Error cargando quizzes:', error);
    throw error;
  }
}

// Ejecutar la carga
loadQuizzes()
  .then(() => {
    console.log('✅ Carga completada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error en la carga:', error);
    process.exit(1);
  });