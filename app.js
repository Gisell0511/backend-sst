// app.js
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

// Rutas
app.use('/api/quizzes', require('./routes/quizRoutes'));

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de quizzes funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de quizzes corriendo en puerto ${PORT}`);
});