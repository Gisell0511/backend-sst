const express = require('express');
const cors = require('cors');
const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('./knexfile');

// Inicializar Knex
const knex = Knex(knexConfig.development);
Model.knex(knex);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const quizRoutes = require('./routes/quizRoutes');

// Usar rutas
app.use('/api/quizzes', quizRoutes);

// ✅ RUTAS BÁSICAS CORREGIDAS
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de quizzes funcionando',
    timestamp: new Date().toISOString()
  });
});

// ✅ RUTAS DE AUTH TEMPORALES
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Intento de login:', { email });
  
  // Login temporal - acepta cualquier credencial
  const token = 'temp-token-' + Date.now();
  
  res.json({
    success: true,
    message: 'Login exitoso',
    token: token,
    user: {
      id: 1,
      email: email,
      name: 'Usuario Demo'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  console.log('👤 Intento de registro:', { email, name });
  
  const token = 'temp-token-' + Date.now();
  
  res.json({
    success: true, 
    message: 'Registro exitoso',
    token: token,
    user: {
      id: 2,
      email: email,
      name: name
    }
  });
});

// ✅ RUTAS DE QUIZZES FALTANTES - AGREGAR ESTAS
app.post('/api/quizzes/submit', (req, res) => {
  console.log('📝 Recibiendo quiz completo:', req.body);
  
  // Simular procesamiento exitoso
  res.json({
    success: true,
    message: 'Quiz enviado correctamente',
    quizId: req.body.quizId,
    totalQuestions: req.body.answers.length,
    correctAnswers: Math.floor(Math.random() * req.body.answers.length) + 1,
    score: Math.floor(Math.random() * 100) + 1,
    submittedAt: new Date().toISOString()
  });
});

app.post('/api/quizzes/check-answer', (req, res) => {
  console.log('✅ Verificando respuesta:', req.body);
  
  // Simular verificación (siempre correcta por ahora)
  res.json({
    isCorrect: true,
    correctAnswer: 'b',
    explanation: 'Respuesta verificada correctamente'
  });
});

app.get('/api/quizzes/progress/:categoryId', (req, res) => {
  console.log('📊 Obteniendo progreso para categoría:', req.params.categoryId);
  
  res.json({
    total_questions: 30,
    total_answered: 0,
    correct_answers: 0,
    progress_percentage: 0,
    accuracy_percentage: 0
  });
});

app.get('/api/quizzes/user-stats', (req, res) => {
  console.log('📈 Obteniendo estadísticas del usuario');
  
  res.json({
    total_quizzes: 15,
    total_answered: 0,
    correct_answers: 0,
    overall_accuracy: 0,
    completion_percentage: 0
  });
});

// Mantener rutas originales por compatibilidad
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de quizzes funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend SST funcionando correctamente',
    version: '1.0.0'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido al API de Quizzes SST',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register'
      },
      quizzes: {
        categories: '/api/quizzes/categories',
        quizzes: '/api/quizzes?category=1',
        submit: '/api/quizzes/submit',
        checkAnswer: '/api/quizzes/check-answer',
        progress: '/api/quizzes/progress/:categoryId',
        userStats: '/api/quizzes/user-stats'
      }
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/quizzes/categories',
      'GET /api/quizzes?category=:id',
      'POST /api/quizzes/submit',
      'POST /api/quizzes/check-answer',
      'GET /api/quizzes/progress/:categoryId',
      'GET /api/quizzes/user-stats'
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Servidor de Quizzes SST iniciado');
  console.log('='.repeat(50));
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🔧 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Test: http://localhost:${PORT}/api/test`);
  console.log(`📚 Quizzes: http://localhost:${PORT}/api/quizzes/categories`);
  console.log('='.repeat(50));
});