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

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de quizzes funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba
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
      health: '/health',
      test: '/api/test',
      categories: '/api/quizzes/categories',
      quizzes: '/api/quizzes/category/:id/quizzes'
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

// Ruta no encontrada - SIN USAR *
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Servidor de Quizzes SST iniciado');
  console.log('='.repeat(50));
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🔧 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Test: http://localhost:${PORT}/api/test`);
  console.log(`📚 Quizzes: http://localhost:${PORT}/api/quizzes/categories`);
  console.log('='.repeat(50));
});