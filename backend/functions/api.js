const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const User = require('./models/User')(sequelize);
const Client = require('./models/Client')(sequelize);
const Goal = require('./models/Goal')(sequelize);
const Sale = require('./models/Sale')(sequelize);
const Strategy = require('./models/Strategy')(sequelize);
const Task = require('./models/Task')(sequelize);
const Comment = require('./models/Comment')(sequelize);
const MonthlyTarget = require('./models/MonthlyTarget')(sequelize);

User.hasMany(Goal, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'assignedTo' });
User.hasMany(Comment, { foreignKey: 'userId' });

Client.hasMany(Sale, { foreignKey: 'clientId' });
Client.belongsToMany(Strategy, { through: 'ClientStrategy', foreignKey: 'clientId' });

Goal.belongsTo(User, { foreignKey: 'userId' });
Goal.hasMany(MonthlyTarget, { foreignKey: 'goalId' });
Goal.hasMany(Strategy, { foreignKey: 'goalId' });

Strategy.belongsTo(Goal, { foreignKey: 'goalId' });
Strategy.belongsToMany(Client, { through: 'ClientStrategy', foreignKey: 'strategyId' });
Strategy.hasMany(Task, { foreignKey: 'strategyId' });

Task.belongsTo(User, { foreignKey: 'assignedTo' });
Task.belongsTo(Strategy, { foreignKey: 'strategyId' });
Task.hasMany(Comment, { foreignKey: 'referenceId', scope: { referenceType: 'task' } });

Comment.belongsTo(User, { foreignKey: 'userId' });

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/clients', auth, async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/clients', auth, async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: MonthlyTarget }
      ]
    });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/goals', auth, async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/strategies', auth, async (req, res) => {
  try {
    const strategies = await Strategy.findAll({
      include: [
        { model: Goal },
        { model: Client }
      ]
    });
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/strategies', auth, async (req, res) => {
  try {
    const { clientIds, ...strategyData } = req.body;
    const strategy = await Strategy.create(strategyData);
    
    if (clientIds && clientIds.length > 0) {
      await Promise.all(
        clientIds.map(clientId => 
          sequelize.models.ClientStrategy.create({
            strategyId: strategy.id,
            clientId
          })
        )
      );
    }
    
    res.status(201).json(strategy);
  } catch (error) {
    console.error('Error creating strategy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Strategy }
      ]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/comments/:type/:referenceId', auth, async (req, res) => {
  try {
    const { type, referenceId } = req.params;
    const comments = await Comment.findAll({
      where: {
        referenceType: type,
        referenceId
      },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/comments', auth, async (req, res) => {
  try {
    const comment = await Comment.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initializeDatabase();

exports.handler = serverless(app);
