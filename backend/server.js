require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const multer = require('multer');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CRM API' });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.get('/api/users', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.get('/api/goals', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/goals', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.get('/api/sales', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/sales/import', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.get('/api/strategies', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/strategies', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.get('/api/tasks', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/tasks', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
