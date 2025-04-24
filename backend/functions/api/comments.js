module.exports = (models) => {
  const express = require('express');
  const router = express.Router();
  const jwt = require('jsonwebtoken');
  
  const { Comment, User } = models;
  
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
  
  router.get('/:type/:referenceId', auth, async (req, res) => {
    try {
      const { type, referenceId } = req.params;
      const comments = await Comment.findAll({
        where: {
          type,
          referenceId
        },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/', auth, async (req, res) => {
    try {
      const comment = await Comment.create({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.put('/:id', auth, async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      if (comment.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }
      
      await comment.update(req.body);
      res.json(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
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
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return router;
};
