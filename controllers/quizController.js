// controllers/quizController.js
const QuizCategory = require('../models/QuizCategory');
const Quiz = require('../models/Quiz');
const UserQuizProgress = require('../models/UserQuizProgress');

class QuizController {
  
  // Obtener todas las categorías
  async getCategories(req, res) {
    try {
      const categories = await QuizCategory.query()
        .select('id', 'name', 'level', 'description')
        .withGraphFetched('quizzes')
        .modifyGraph('quizzes', builder => {
          builder.select('id', 'question', 'difficulty');
        });

      // Agregar estadísticas básicas
      const categoriesWithStats = categories.map(category => ({
        id: category.id,
        name: category.name,
        level: category.level,
        description: category.description,
        total_questions: category.quizzes.length
      }));

      res.json(categoriesWithStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener quizzes por categoría
 // En getQuizzesByCategory - VERIFICAR
async getQuizzesByCategory(req, res) {
  try {
    const { categoryId } = req.params;

    console.log('🔍 BACKEND - Buscando quizzes para categoría:', categoryId);
    
    const quizzes = await Quiz.query()
      .where('category_id', categoryId)
      .select('id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'difficulty', 'correct_answer');

    console.log('🔍 BACKEND - Quizzes encontrados:', quizzes.length);
    if (quizzes.length > 0) {
      console.log('🔍 BACKEND - Primera pregunta:', quizzes[0]);
    }

    // Transformar a formato que espera el frontend
    const formattedQuizzes = quizzes.map(quiz => {
      const options = [];
      
      // Mapear cada opción con su letra correspondiente
      if (quiz.option_a) options.push({ letter: 'a', text: quiz.option_a });
      if (quiz.option_b) options.push({ letter: 'b', text: quiz.option_b });
      if (quiz.option_c) options.push({ letter: 'c', text: quiz.option_c });
      if (quiz.option_d) options.push({ letter: 'd', text: quiz.option_d });

      return {
        id: quiz.id,
        question: quiz.question,
        options: options, // ← ESTE ES EL CAMPO IMPORTANTE
        difficulty: quiz.difficulty,
        correct_answer: quiz.correct_answer
      };
    });

    console.log('✅ BACKEND - Quizzes formateados:', formattedQuizzes.length);
    console.log('🔍 BACKEND - Primera pregunta formateada:', formattedQuizzes[0]);
    
    res.json(formattedQuizzes);
  } catch (error) {
    console.error('❌ BACKEND - Error:', error);
    res.status(500).json({ error: error.message });
  }
}

  // Verificar respuesta del usuario
  async checkAnswer(req, res) {
    try {
      const { quizId, userAnswer } = req.body;
      const userId = req.user.id;

      const quiz = await Quiz.query().findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz no encontrado' });
      }

      const isCorrect = userAnswer === quiz.correct_answer;

      // Guardar progreso del usuario
      await UserQuizProgress.query().insert({
        user_id: userId,
        quiz_id: quizId,
        user_answer: userAnswer,
        is_correct: isCorrect
      });

      res.json({
        isCorrect,
        correctAnswer: quiz.correct_answer,
        explanation: quiz.explanation
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener progreso del usuario por categoría
  async getUserProgress(req, res) {
    try {
      const userId = req.user.id;
      const { categoryId } = req.params;

      // Progreso del usuario
      const userProgress = await UserQuizProgress.query()
        .where('user_id', userId)
        .whereIn('quiz_id', function() {
          this.select('id').from('quizzes').where('category_id', categoryId);
        })
        .select('is_correct')
        .count('id as total_answered')
        .sum('is_correct as correct_answers')
        .first();

      // Total de quizzes en la categoría
      const totalQuizzes = await Quiz.query()
        .where('category_id', categoryId)
        .resultSize();

      const totalAnswered = parseInt(userProgress.total_answered) || 0;
      const correctAnswers = parseInt(userProgress.correct_answers) || 0;

      res.json({
        total_questions: totalQuizzes,
        total_answered: totalAnswered,
        correct_answers: correctAnswers,
        progress_percentage: totalQuizzes > 0 ? 
          Math.round((totalAnswered / totalQuizzes) * 100) : 0,
        accuracy_percentage: totalAnswered > 0 ?
          Math.round((correctAnswers / totalAnswered) * 100) : 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener estadísticas generales del usuario
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      const userStats = await UserQuizProgress.query()
        .where('user_id', userId)
        .select('is_correct')
        .count('id as total_answered')
        .sum('is_correct as correct_answers')
        .first();

      const totalQuizzes = await Quiz.query().resultSize();

      const totalAnswered = parseInt(userStats.total_answered) || 0;
      const correctAnswers = parseInt(userStats.correct_answers) || 0;

      res.json({
        total_quizzes: totalQuizzes,
        total_answered: totalAnswered,
        correct_answers: correctAnswers,
        overall_accuracy: totalAnswered > 0 ?
          Math.round((correctAnswers / totalAnswered) * 100) : 0,
        completion_percentage: Math.round((totalAnswered / totalQuizzes) * 100)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener quiz específico con explicación (después de responder)
  async getQuizWithExplanation(req, res) {
    try {
      const { quizId } = req.params;
      
      const quiz = await Quiz.query()
        .findById(quizId)
        .select('id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'difficulty', 'explanation', 'correct_answer');

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz no encontrado' });
      }

      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
  // NUEVA FUNCIÓN: Enviar quiz completo
  async submitQuiz(req, res) {
    try {
      const { quizId, answers } = req.body;
      const userId = req.user.id;

      console.log(`📝 Usuario ${userId} enviando quiz completo:`, { 
        quizId, 
        totalAnswers: answers.length 
      });

      // Validar que el quiz existe
      const quiz = await Quiz.query().findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz no encontrado' });
      }

      let correctAnswersCount = 0;
      const results = [];

      // Procesar cada respuesta
      for (const answer of answers) {
        const { questionId, userAnswer } = answer;
        
        // Obtener la pregunta
        const question = await Quiz.query().findById(questionId);
        if (!question) {
          results.push({
            questionId,
            isCorrect: false,
            error: 'Pregunta no encontrada'
          });
          continue;
        }

        // Verificar si la respuesta es correcta
        const isCorrect = userAnswer === question.correct_answer;

        if (isCorrect) {
          correctAnswersCount++;
        }

        // Guardar el progreso individual
        await UserQuizProgress.query().insert({
          user_id: userId,
          quiz_id: questionId,
          user_answer: userAnswer,
          is_correct: isCorrect
        });

        results.push({
          questionId,
          isCorrect,
          correctAnswer: question.correct_answer,
          explanation: question.explanation
        });
      }

      // Calcular puntaje
      const score = Math.round((correctAnswersCount / answers.length) * 100);
      
      const result = {
        quizId: quizId,
        userId: userId,
        score: score,
        totalQuestions: answers.length,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: answers.length - correctAnswersCount,
        results: results,
        submittedAt: new Date().toISOString()
      };

      console.log('✅ Quiz enviado correctamente. Score:', score + '%');
      res.json(result);

    } catch (error) {
      console.error('❌ Error en submitQuiz:', error);
      res.status(500).json({ 
        error: 'Error al procesar el quiz completo',
        message: error.message 
      });
    }
  }
}

module.exports = new QuizController();