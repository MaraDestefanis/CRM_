const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/tmp/database.sqlite',
  logging: false
});

const app = express();
app.use(cors());
app.use(bodyParser.json());


const User = sequelize.define('User', {
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
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'supervisor', 'sales'),
    defaultValue: 'sales'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

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
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

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
    type: DataTypes.ENUM('revenue', 'clientCount', 'newClients', 'retention'),
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
    type: DataTypes.ENUM('planned', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'planned'
  }
});

const MonthlyTarget = sequelize.define('MonthlyTarget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  month: {
    type: DataTypes.DATE,
    allowNull: false
  },
  targetValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  productFamily: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
});

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
  status: {
    type: DataTypes.ENUM('planned', 'in-progress', 'paused', 'finished'),
    defaultValue: 'planned'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE
  }
});

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
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'done', 'cancelled'),
    defaultValue: 'todo'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATE
  },
  location: {
    type: DataTypes.STRING
  },
  coordinates: {
    type: DataTypes.STRING
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrencePattern: {
    type: DataTypes.STRING
  }
});

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
  }
});


User.hasMany(Goal);
User.hasMany(Task);
User.hasMany(Comment);
User.hasMany(Strategy);

Client.hasMany(Sale);
Client.hasMany(Task);
Client.hasMany(Comment);
Client.belongsToMany(Strategy, { through: 'ClientStrategy' });

Goal.belongsTo(User);
Goal.hasMany(MonthlyTarget);
Goal.hasMany(Strategy);

Strategy.belongsTo(User);
Strategy.belongsTo(Goal);
Strategy.belongsToMany(Client, { through: 'ClientStrategy' });
Strategy.hasMany(Task);
Strategy.hasMany(Comment);

Task.belongsTo(User);
Task.belongsTo(Client);
Task.belongsTo(Strategy);
Task.hasMany(Comment);

Comment.belongsTo(User);
Comment.belongsTo(Task, { constraints: false });
Comment.belongsTo(Client, { constraints: false });
Comment.belongsTo(Strategy, { constraints: false });

Sale.belongsTo(Client);

MonthlyTarget.belongsTo(Goal);
MonthlyTarget.belongsTo(User);


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

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'sales'
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/users', auth, checkRole(['admin', 'supervisor']), async (req, res) => {
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

app.get('/api/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.user.id !== user.id && !['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
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

app.get('/api/clients/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
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

app.put('/api/clients/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: MonthlyTarget },
        { model: Strategy }
      ]
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/goals', auth, checkRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const goal = await Goal.create({
      ...req.body,
      UserId: req.body.UserId || req.user.id
    });
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
        { model: User, attributes: ['id', 'name', 'email'] },
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
    const strategy = await Strategy.create({
      ...req.body,
      UserId: req.body.UserId || req.user.id
    });
    
    if (strategy) {
      await Task.create({
        title: `Initial task for ${strategy.name}`,
        description: `First task for strategy: ${strategy.description}`,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        UserId: strategy.UserId,
        StrategyId: strategy.id
      });
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
        { model: Client },
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
    const task = await Task.create({
      ...req.body,
      UserId: req.body.UserId || req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/tasks/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await task.update({ status });
    
    if (status === 'done' && task.isRecurring && task.recurrencePattern) {
      const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrencePattern);
      
      await Task.create({
        title: task.title,
        description: task.description,
        status: 'todo',
        priority: task.priority,
        dueDate: nextDueDate,
        location: task.location,
        coordinates: task.coordinates,
        isRecurring: true,
        recurrencePattern: task.recurrencePattern,
        UserId: task.UserId,
        ClientId: task.ClientId,
        StrategyId: task.StrategyId
      });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/sales', auth, async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [{ model: Client }]
    });
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sales', auth, async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/comments/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    let whereClause = { type };
    
    switch (type) {
      case 'task':
        whereClause.TaskId = id;
        break;
      case 'client':
        whereClause.ClientId = id;
        break;
      case 'strategy':
        whereClause.StrategyId = id;
        break;
      default:
        return res.status(400).json({ message: 'Invalid comment type' });
    }
    
    const comments = await Comment.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
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
      UserId: req.user.id
    });
    
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    
    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/init-db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    
    const supervisor = await User.create({
      name: 'Supervisor',
      email: 'supervisor@example.com',
      password: 'supervisor123',
      role: 'supervisor'
    });
    
    const salesPerson = await User.create({
      name: 'Sales Person',
      email: 'sales@example.com',
      password: 'sales123',
      role: 'sales'
    });
    
    const client1 = await Client.create({
      name: 'ABC Corporation',
      email: 'contact@abc.com',
      phone: '123-456-7890',
      address: '123 Main St, City',
      category: 'Active',
      abcClass: 'A'
    });
    
    const client2 = await Client.create({
      name: 'XYZ Industries',
      email: 'info@xyz.com',
      phone: '987-654-3210',
      address: '456 Oak Ave, Town',
      category: 'New',
      abcClass: 'B'
    });
    
    const goal = await Goal.create({
      name: 'Increase Revenue Q2',
      description: 'Increase revenue by 15% in Q2 for Product Family A',
      variable: 'revenue',
      productFamily: 'Product Family A',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2023-06-30'),
      status: 'in-progress',
      UserId: supervisor.id
    });
    
    await MonthlyTarget.create({
      month: new Date('2023-04-01'),
      targetValue: 50000,
      GoalId: goal.id,
      UserId: salesPerson.id
    });
    
    await MonthlyTarget.create({
      month: new Date('2023-05-01'),
      targetValue: 55000,
      GoalId: goal.id,
      UserId: salesPerson.id
    });
    
    await MonthlyTarget.create({
      month: new Date('2023-06-01'),
      targetValue: 60000,
      GoalId: goal.id,
      UserId: salesPerson.id
    });
    
    const strategy = await Strategy.create({
      name: 'Upsell to Existing Clients',
      description: 'Focus on upselling Product Family A to existing clients',
      status: 'in-progress',
      startDate: new Date('2023-04-15'),
      endDate: new Date('2023-06-15'),
      UserId: supervisor.id,
      GoalId: goal.id
    });
    
    await strategy.addClient(client1);
    
    const task1 = await Task.create({
      title: 'Call ABC Corporation',
      description: 'Schedule a meeting to discuss new products',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2023-04-20'),
      UserId: salesPerson.id,
      ClientId: client1.id,
      StrategyId: strategy.id
    });
    
    await Task.create({
      title: 'Prepare proposal for XYZ Industries',
      description: 'Create a customized proposal for their needs',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2023-04-25'),
      UserId: salesPerson.id,
      ClientId: client2.id
    });
    
    await Comment.create({
      content: 'Client is interested in our premium package',
      type: 'client',
      UserId: salesPerson.id,
      ClientId: client1.id
    });
    
    await Comment.create({
      content: 'Call scheduled for next Tuesday',
      type: 'task',
      UserId: salesPerson.id,
      TaskId: task1.id
    });
    
    await Sale.create({
      date: new Date('2023-03-15'),
      amount: 15000,
      productFamily: 'Product Family A',
      quantity: 3,
      ClientId: client1.id
    });
    
    await Sale.create({
      date: new Date('2023-04-05'),
      amount: 8500,
      productFamily: 'Product Family B',
      quantity: 1,
      ClientId: client2.id
    });
    
    res.json({ 
      message: 'Database initialized successfully',
      adminUser: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ message: 'Database initialization failed', error: error.message });
  }
});


function calculateNextDueDate(currentDueDate, recurrencePattern) {
  const date = new Date(currentDueDate);
  
  switch (recurrencePattern) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    default:
      date.setDate(date.getDate() + 7); // Default to weekly
  }
  
  return date;
}


const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
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
