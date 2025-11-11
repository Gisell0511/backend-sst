// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/categories', quizController.getCategories);
router.get('/category/:categoryId/quizzes', quizController.getQuizzesByCategory);
router.get('/', quizController.getQuizzes); // ✅ NUEVA RUTA - AGREGAR ESTA LÍNEA

// Rutas protegidas (requieren autenticación)
router.use(auth);

router.post('/check-answer', quizController.checkAnswer);
router.post('/submit', quizController.submitQuiz);
router.get('/progress/:categoryId', quizController.getUserProgress);
router.get('/user-stats', quizController.getUserStats);
router.get('/quiz/:quizId/explanation', quizController.getQuizWithExplanation);

module.exports = router;