module.exports = (models) => {
  const express = require('express');
  const router = express.Router();
  
  const { Client } = models;
  
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
      const clients = await Client.findAll();
      res.json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.get('/:id', auth, async (req, res) => {
    try {
      const client = await Client.findByPk(req.params.id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/', auth, async (req, res) => {
    try {
      const client = await Client.create(req.body);
      res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.put('/:id', auth, async (req, res) => {
    try {
      const client = await Client.findByPk(req.params.id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      await client.update(req.body);
      res.json(client);
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.delete('/:id', auth, async (req, res) => {
    try {
      const client = await Client.findByPk(req.params.id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      await client.destroy();
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return router;
};
