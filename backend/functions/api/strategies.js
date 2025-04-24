module.exports = (models) => {
  const express = require('express');
  const router = express.Router();
  const jwt = require('jsonwebtoken');
  
  const { Strategy, Goal, Client } = models;
  
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
  
  router.get('/:id', auth, async (req, res) => {
    try {
      const strategy = await Strategy.findByPk(req.params.id, {
        include: [
          { model: Goal },
          { model: Client }
        ]
      });
      if (!strategy) {
        return res.status(404).json({ message: 'Strategy not found' });
      }
      res.json(strategy);
    } catch (error) {
      console.error('Error fetching strategy:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/', auth, async (req, res) => {
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
  
  router.put('/:id', auth, async (req, res) => {
    try {
      const strategy = await Strategy.findByPk(req.params.id);
      if (!strategy) {
        return res.status(404).json({ message: 'Strategy not found' });
      }
      await strategy.update(req.body);
      res.json(strategy);
    } catch (error) {
      console.error('Error updating strategy:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.delete('/:id', auth, async (req, res) => {
    try {
      const strategy = await Strategy.findByPk(req.params.id);
      if (!strategy) {
        return res.status(404).json({ message: 'Strategy not found' });
      }
      await strategy.destroy();
      res.json({ message: 'Strategy deleted successfully' });
    } catch (error) {
      console.error('Error deleting strategy:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return router;
};
