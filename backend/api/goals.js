const express = require('express');
const { Goal, MonthlyTarget, User } = require('../models');
const { auth, supervisorOrAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let goals;
    
    if (req.user.role === 'admin' || req.user.role === 'supervisor') {
      goals = await Goal.findAll({
        include: [
          { model: User },
          { model: MonthlyTarget }
        ]
      });
    } else {
      goals = await Goal.findAll({
        where: { userId: req.user.id },
        include: [
          { model: User },
          { model: MonthlyTarget }
        ]
      });
    }
    
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id, {
      include: [
        { model: User },
        { model: MonthlyTarget }
      ]
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    if (req.user.role === 'sales' && goal.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this goal' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, supervisorOrAdmin, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      variable, 
      productFamily, 
      startDate, 
      endDate, 
      userId,
      monthlyTargets 
    } = req.body;
    
    const goal = await Goal.create({
      name,
      description,
      variable,
      productFamily,
      startDate,
      endDate,
      userId
    });
    
    if (monthlyTargets && monthlyTargets.length > 0) {
      const targetsToCreate = monthlyTargets.map(target => ({
        ...target,
        goalId: goal.id
      }));
      
      await MonthlyTarget.bulkCreate(targetsToCreate);
    }
    
    const createdGoal = await Goal.findByPk(goal.id, {
      include: [
        { model: User },
        { model: MonthlyTarget }
      ]
    });
    
    res.status(201).json(createdGoal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, supervisorOrAdmin, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      variable, 
      productFamily, 
      startDate, 
      endDate, 
      status,
      userId,
      monthlyTargets 
    } = req.body;
    
    const goal = await Goal.findByPk(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    await goal.update({
      name,
      description,
      variable,
      productFamily,
      startDate,
      endDate,
      status,
      userId
    });
    
    if (monthlyTargets && monthlyTargets.length > 0) {
      await MonthlyTarget.destroy({ where: { goalId: goal.id } });
      
      const targetsToCreate = monthlyTargets.map(target => ({
        ...target,
        goalId: goal.id
      }));
      
      await MonthlyTarget.bulkCreate(targetsToCreate);
    }
    
    const updatedGoal = await Goal.findByPk(goal.id, {
      include: [
        { model: User },
        { model: MonthlyTarget }
      ]
    });
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, supervisorOrAdmin, async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    await MonthlyTarget.destroy({ where: { goalId: goal.id } });
    
    await goal.destroy();
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
