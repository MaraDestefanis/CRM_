return (sequelize) => {
  const { DataTypes } = require('sequelize');


const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  reason: {
    type: DataTypes.STRING
  },
  abcClass: {
    type: DataTypes.ENUM('A', 'B', 'C')
  },
  latitude: {
    type: DataTypes.FLOAT
  },
  longitude: {
    type: DataTypes.FLOAT
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastPurchaseDate: {
    type: DataTypes.DATE
  }
});

return Client;
};

