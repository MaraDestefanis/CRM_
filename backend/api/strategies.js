const express = require('express');
const { Strategy, Goal, Client, Task } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const strategies = await Strategy.findAll({
      include: [
        { model: Goal },
        { model: Client },
        { model: Task }
      ]
    });
    
    res.json(strategies);
  } catch (error) {
    console.error('Get strategies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const strategy = await Strategy.findByPk(req.params.id, {
      include: [
        { model: Goal },
        { model: Client },
        { model: Task }
      ]
    });
    
    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found' });
    }
    
    res.json(strategy);
  } catch (error) {
    console.error('Get strategy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      state, 
      startDate, 
      endDate,
      goalId,
      clientId
    } = req.body;
    
    const strategy = await Strategy.create({
      name,
      description,
      state,
      startDate,
      endDate,
      goalId,
      clientId
    });
    
    if (req.body.createInitialTask) {
      await Task.create({
        title: `Initial task for ${name}`,
        description: `First task for strategy: ${description}`,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        strategyId: strategy.id,
        clientId: clientId,
        assignedToId: req.user.id
      });
    }
    
    const createdStrategy = await Strategy.findByPk(strategy.id, {
      include: [
        { model: Goal },
        { model: Client },
        { model: Task }
      ]
    });
    
    res.status(201).json(createdStrategy);
  } catch (error) {
    console.error('Create strategy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      state, 
      startDate, 
      endDate,
      results,
      roi,
      goalId,
      clientId
    } = req.body;
    
    const strategy = await Strategy.findByPk(req.params.id);
    
    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found' });
    }
    
    await strategy.update({
      name,
      description,
      state,
      startDate,
      endDate,
      results,
      roi,
      goalId,
      clientId
    });
    
    const updatedStrategy = await Strategy.findByPk(strategy.id, {
      include: [
        { model: Goal },
        { model: Client },
        { model: Task }
      ]
    });
    
    res.json(updatedStrategy);
  } catch (error) {
    console.error('Update strategy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const strategy = await Strategy.findByPk(req.params.id);
    
    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found' });
    }
    
    if (req.query.deleteTasks === 'true') {
      await Task.destroy({ where: { strategyId: strategy.id } });
    } else {
      await Task.update(
        { strategyId: null },
        { where: { strategyId: strategy.id } }
      );
    }
    
    await strategy.destroy();
    
    res.json({ message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Delete strategy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
