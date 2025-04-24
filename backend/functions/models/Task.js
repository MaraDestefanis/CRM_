module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      defaultValue: 'todo'
    },
    dueDate: {
      type: DataTypes.DATE
    },
    completedDate: {
      type: DataTypes.DATE
    },
    latitude: {
      type: DataTypes.FLOAT
    },
    longitude: {
      type: DataTypes.FLOAT
    },
    recurrence: {
      type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly'),
      defaultValue: 'none'
    },
    recurrenceEndDate: {
      type: DataTypes.DATE
    }
  });

  return Task;
};
