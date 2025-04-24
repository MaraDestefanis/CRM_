module.exports = (models) => {
  const express = require('express');
  const router = express.Router();
  const jwt = require('jsonwebtoken');
  
  const { Task, User, Strategy } = models;
  
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
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
          { model: Strategy }
        ]
      });
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.get('/:id', auth, async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id, {
        include: [
          { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
          { model: Strategy }
        ]
      });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/', auth, async (req, res) => {
    try {
      const task = await Task.create({
        ...req.body,
        createdById: req.user.id
      });
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.put('/:id', auth, async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      await task.update(req.body);
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.delete('/:id', auth, async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      await task.destroy();
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return router;
};
