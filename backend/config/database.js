const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' ? ':memory:' : './database.sqlite',
  logging: false
});

module.exports = sequelize;
