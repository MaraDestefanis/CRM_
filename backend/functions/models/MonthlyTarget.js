module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');


const MonthlyTarget = sequelize.define('MonthlyTarget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  targetValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currentValue: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'failed'),
    defaultValue: 'pending'
  }
});

return MonthlyTarget;
};

}
