const express = require('express');
const { Comment, User } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/:type/:referenceId', auth, async (req, res) => {
  try {
    const { type, referenceId } = req.params;
    
    const comments = await Comment.findAll({
      where: { 
        type, 
        referenceId 
      },
      include: [{ model: User }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { content, type, referenceId } = req.body;
    
    const comment = await Comment.create({
      content,
      type,
      referenceId,
      userId: req.user.id
    });
    
    const createdComment = await Comment.findByPk(comment.id, {
      include: [{ model: User }]
    });
    
    res.status(201).json(createdComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const comment = await Comment.findByPk(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    await comment.update({ content });
    
    const updatedComment = await Comment.findByPk(comment.id, {
      include: [{ model: User }]
    });
    
    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await comment.destroy();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
