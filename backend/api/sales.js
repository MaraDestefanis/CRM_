const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { Sale, Client } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /csv|xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [{ model: Client }]
    });
    
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: Client }]
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { 
      date,
      amount,
      quantity,
      productFamily,
      productName,
      invoiceNumber,
      notes,
      clientId
    } = req.body;
    
    const sale = await Sale.create({
      date,
      amount,
      quantity,
      productFamily,
      productName,
      invoiceNumber,
      notes,
      clientId
    });
    
    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (client) {
        await client.update({ lastPurchaseDate: date });
      }
    }
    
    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let salesData = [];
    
    if (fileExt === '.csv') {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          salesData = results;
          await processSalesData(salesData, res);
        });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      salesData = xlsx.utils.sheet_to_json(worksheet);
      await processSalesData(salesData, res);
    }
  } catch (error) {
    console.error('Import sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

async function processSalesData(salesData, res) {
  try {
    const createdSales = [];
    const errors = [];
    
    for (const [index, sale] of salesData.entries()) {
      try {
        let client = null;
        if (sale.clientName || sale.clientEmail) {
          const [foundClient] = await Client.findOrCreate({
            where: sale.clientEmail ? { email: sale.clientEmail } : { name: sale.clientName },
            defaults: {
              name: sale.clientName || 'Unknown',
              email: sale.clientEmail || null,
              phone: sale.clientPhone || null
            }
          });
          client = foundClient;
        }
        
        const newSale = await Sale.create({
          date: new Date(sale.date) || new Date(),
          amount: parseFloat(sale.amount) || 0,
          quantity: parseInt(sale.quantity) || 1,
          productFamily: sale.productFamily || 'Unknown',
          productName: sale.productName || 'Unknown',
          invoiceNumber: sale.invoiceNumber || null,
          notes: sale.notes || null,
          clientId: client ? client.id : null
        });
        
        if (client) {
          await client.update({ lastPurchaseDate: newSale.date });
        }
        
        createdSales.push(newSale);
      } catch (error) {
        errors.push({ row: index + 1, error: error.message });
      }
    }
    
    res.status(201).json({
      message: `Imported ${createdSales.length} sales`,
      totalRows: salesData.length,
      successfulImports: createdSales.length,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Process sales data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      date,
      amount,
      quantity,
      productFamily,
      productName,
      invoiceNumber,
      notes,
      clientId
    } = req.body;
    
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    await sale.update({
      date,
      amount,
      quantity,
      productFamily,
      productName,
      invoiceNumber,
      notes,
      clientId
    });
    
    res.json(sale);
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    await sale.destroy();
    
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
