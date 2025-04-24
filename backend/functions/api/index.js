const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('../config/database');
const initModels = require('../models');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const models = initModels(sequelize);

const authRoutes = require('./auth')(models);
app.use('/api/auth', authRoutes);

const clientRoutes = require('./clients')(models);
app.use('/api/clients', clientRoutes);

const goalRoutes = require('./goals')(models);
app.use('/api/goals', goalRoutes);

const strategyRoutes = require('./strategies')(models);
app.use('/api/strategies', strategyRoutes);

const taskRoutes = require('./tasks')(models);
app.use('/api/tasks', taskRoutes);

const commentRoutes = require('./comments')(models);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const { initializeDatabase } = require('../db-init');
initializeDatabase();

module.exports.handler = serverless(app);
