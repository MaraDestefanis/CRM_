require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const sequelize = require('./config/database');
const models = require('./models');

const authRoutes = require('./api/auth');
const goalsRoutes = require('./api/goals');
const clientsRoutes = require('./api/clients');
const salesRoutes = require('./api/sales');
const strategiesRoutes = require('./api/strategies');
const tasksRoutes = require('./api/tasks');
const commentsRoutes = require('./api/comments');

const { auth, adminOnly, supervisorOrAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.options('*', cors());

app.use((req, res, next) => {
  console.log('Request from origin:', req.headers.origin);
  console.log('Request method:', req.method);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    
    models.User.findOne({ where: { role: 'admin' } })
      .then(admin => {
        if (!admin) {
          const bcrypt = require('bcryptjs');
          bcrypt.hash('admin123', 10)
            .then(hashedPassword => {
              return models.User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
              });
            })
            .then(() => console.log('Admin user created.'))
            .catch(err => console.error('Error creating admin user:', err));
        }
      })
      .catch(err => console.error('Error checking for admin user:', err));
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CRM API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/strategies', strategiesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/comments', commentsRoutes);

app.get('/api/users', auth, supervisorOrAdmin, async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/:id', auth, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.user.role === 'sales' && req.user.id !== user.id) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

if (process.env.EMAIL_MONITORING_ENABLED === 'true') {
  console.log('Email monitoring would be set up here if enabled.');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
