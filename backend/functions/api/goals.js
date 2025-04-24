module.exports = (models) => {
  const express = require('express');
  const router = express.Router();
  
  const { Goal, User, MonthlyTarget } = models;
  
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
  
  router.get('/', auth, async (req, res) => {
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
  
  router.get('/:id', auth, async (req, res) => {
    try {
      const goal = await Goal.findByPk(req.params.id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: MonthlyTarget }
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
  
  router.post('/', auth, async (req, res) => {
    try {
      const goal = await Goal.create({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.put('/:id', auth, async (req, res) => {
    try {
      const goal = await Goal.findByPk(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      await goal.update(req.body);
      res.json(goal);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.delete('/:id', auth, async (req, res) => {
    try {
      const goal = await Goal.findByPk(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      await goal.destroy();
      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return router;
};
