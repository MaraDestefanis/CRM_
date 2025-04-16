const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Strategy = sequelize.define('Strategy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  state: {
    type: DataTypes.ENUM('planned', 'in-progress', 'paused', 'finished'),
    defaultValue: 'planned'
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  results: {
    type: DataTypes.TEXT
  },
  roi: {
    type: DataTypes.FLOAT
  }
});

module.exports = Strategy;
