module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');


const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('task', 'client', 'strategy'),
    allowNull: false
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

return Comment;
};

}
