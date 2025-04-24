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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'sales'
  }
});

const Client = sequelize.define('Client', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING
  }
});

const Goal = sequelize.define('Goal', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  variable: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productFamily: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'planned'
  }
});


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

app.get('/api/users', async (req, res) => {
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

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await Goal.findAll();
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/init-db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    
    await Client.create({
      name: 'Sample Client',
      email: 'client@example.com',
      phone: '123-456-7890',
      category: 'Active'
    });
    
    await Goal.create({
      name: 'Increase Revenue Q2',
      description: 'Increase revenue by 15% in Q2',
      variable: 'revenue',
      productFamily: 'Product Family A',
      status: 'in-progress'
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

const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
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
