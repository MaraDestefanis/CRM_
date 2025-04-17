const express = require('express');
const { Client, Sale } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [{ model: Sale }]
    });
    
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: Sale }]
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      category,
      reason,
      abcClass,
      latitude,
      longitude
    } = req.body;
    
    const client = await Client.create({
      name,
      email,
      phone,
      address,
      category,
      reason,
      abcClass,
      latitude,
      longitude
    });
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      category,
      reason,
      abcClass,
      latitude,
      longitude,
      active
    } = req.body;
    
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    await client.update({
      name,
      email,
      phone,
      address,
      category,
      reason,
      abcClass,
      latitude,
      longitude,
      active
    });
    
    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    await client.update({ active: false });
    
    res.json({ message: 'Client marked as inactive' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/categorize', auth, async (req, res) => {
  try {
    const { category, reason } = req.body;
    
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    await client.update({ category, reason });
    
    res.json(client);
  } catch (error) {
    console.error('Update client category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
