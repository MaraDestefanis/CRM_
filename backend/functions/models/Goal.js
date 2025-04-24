module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Goal = sequelize.define('Goal', {
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
    variable: {
      type: DataTypes.ENUM('revenue', 'clientCount', 'newClients', 'nonRetainedClients'),
      allowNull: false
    },
    productFamily: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active'
    }
  });

  return Goal;
};
