const express = require('express');
const { Task, User, Strategy, Client, Comment } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'admin' || req.user.role === 'supervisor') {
      tasks = await Task.findAll({
        include: [
          { model: User, as: 'assignedTo' },
          { model: User, as: 'createdBy' },
          { model: Strategy },
          { model: Client }
        ]
      });
    } else {
      tasks = await Task.findAll({
        where: { assignedToId: req.user.id },
        include: [
          { model: User, as: 'assignedTo' },
          { model: User, as: 'createdBy' },
          { model: Strategy },
          { model: Client }
        ]
      });
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedTo' },
        { model: User, as: 'createdBy' },
        { model: Strategy },
        { model: Client }
      ]
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (req.user.role === 'sales' && task.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      status, 
      dueDate,
      latitude,
      longitude,
      recurrence,
      recurrenceEndDate,
      assignedToId,
      strategyId,
      clientId
    } = req.body;
    
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      latitude,
      longitude,
      recurrence,
      recurrenceEndDate,
      assignedToId,
      strategyId,
      clientId,
      createdById: req.user.id
    });
    
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo' },
        { model: User, as: 'createdBy' },
        { model: Strategy },
        { model: Client }
      ]
    });
    
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      status, 
      dueDate,
      completedDate,
      latitude,
      longitude,
      recurrence,
      recurrenceEndDate,
      assignedToId,
      strategyId,
      clientId
    } = req.body;
    
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (req.user.role === 'sales' && task.assignedToId !== req.user.id && task.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    const isCompletingTask = status === 'done' && task.status !== 'done';
    
    await task.update({
      title,
      description,
      priority,
      status,
      dueDate,
      completedDate: isCompletingTask ? new Date() : completedDate,
      latitude,
      longitude,
      recurrence,
      recurrenceEndDate,
      assignedToId,
      strategyId,
      clientId
    });
    
    if (isCompletingTask && task.recurrence !== 'none') {
      await createRecurringTask(task);
    }
    
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo' },
        { model: User, as: 'createdBy' },
        { model: Strategy },
        { model: Client }
      ]
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

async function createRecurringTask(completedTask) {
  try {
    let nextDueDate = new Date(completedTask.dueDate);
    
    switch (completedTask.recurrence) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      default:
        return; // No recurrence
    }
    
    if (completedTask.recurrenceEndDate && nextDueDate > new Date(completedTask.recurrenceEndDate)) {
      return; // Don't create new task if past end date
    }
    
    await Task.create({
      title: completedTask.title,
      description: completedTask.description,
      priority: completedTask.priority,
      status: 'todo',
      dueDate: nextDueDate,
      latitude: completedTask.latitude,
      longitude: completedTask.longitude,
      recurrence: completedTask.recurrence,
      recurrenceEndDate: completedTask.recurrenceEndDate,
      assignedToId: completedTask.assignedToId,
      strategyId: completedTask.strategyId,
      clientId: completedTask.clientId,
      createdById: completedTask.createdById
    });
  } catch (error) {
    console.error('Create recurring task error:', error);
    throw error;
  }
}

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (req.user.role === 'sales' && task.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    await task.destroy();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.id;
    
    const task = await Task.findByPk(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const comment = await Comment.create({
      content,
      type: 'task',
      referenceId: taskId,
      userId: req.user.id
    });
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
