const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Goal = require('./Goal');
const MonthlyTarget = require('./MonthlyTarget');
const Sale = require('./Sale');
const Strategy = require('./Strategy');
const Task = require('./Task');
const Comment = require('./Comment');

User.hasMany(Goal, { foreignKey: 'userId' });
Goal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Task, { foreignKey: 'assignedToId' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

User.hasMany(Task, { foreignKey: 'createdById' });
Task.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

Goal.hasMany(MonthlyTarget, { foreignKey: 'goalId' });
MonthlyTarget.belongsTo(Goal, { foreignKey: 'goalId' });

User.hasMany(MonthlyTarget, { foreignKey: 'responsibleId' });
MonthlyTarget.belongsTo(User, { foreignKey: 'responsibleId', as: 'responsible' });

Client.hasMany(Sale, { foreignKey: 'clientId' });
Sale.belongsTo(Client, { foreignKey: 'clientId' });

Goal.hasMany(Strategy, { foreignKey: 'goalId' });
Strategy.belongsTo(Goal, { foreignKey: 'goalId' });

Client.hasMany(Strategy, { foreignKey: 'clientId' });
Strategy.belongsTo(Client, { foreignKey: 'clientId' });

Strategy.hasMany(Task, { foreignKey: 'strategyId' });
Task.belongsTo(Strategy, { foreignKey: 'strategyId' });

Client.hasMany(Task, { foreignKey: 'clientId' });
Task.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = {
  sequelize,
  User,
  Client,
  Goal,
  MonthlyTarget,
  Sale,
  Strategy,
  Task,
  Comment
};
