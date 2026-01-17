const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Consumption = require('../models/Consumption');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Middleware to check if user is authenticated
router.use(auth);

// Manual data entry
router.post('/manual', async (req, res) => {
  try {
    const { timestamp, value, unit = 'kWh' } = req.body;
    const consumption = new Consumption({
      userId: req.user.id,
      timestamp: new Date(timestamp),
      value: parseFloat(value),
      unit,
      source: 'manual'
    });
    await consumption.save();
    res.status(201).json(consumption);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV file upload
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let rowNumber = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      rowNumber++;
      try {
        // Validate required fields
        if (!data.timestamp || !data.value) {
          errors.push(`Row ${rowNumber}: Missing required fields`);
          return;
        }
        
        results.push({
          userId: req.user.id,
          timestamp: new Date(data.timestamp),
          value: parseFloat(data.value),
          unit: data.unit || 'kWh',
          source: 'csv'
        });
      } catch (err) {
        errors.push(`Error processing row ${rowNumber}: ${err.message}`);
      }
    })
    .on('end', async () => {
      try {
        // Save all valid records
        if (results.length > 0) {
          await Consumption.insertMany(results);
        }
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({
          message: 'File processed successfully',
          imported: results.length,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (err) {
        res.status(500).json({ error: 'Error saving data to database' });
      }
    });
});

// API import (placeholder for future implementation)
router.post('/api-import', async (req, res) => {
  // Implementation for API-based data import
  // This would connect to an external API and fetch consumption data
  res.status(501).json({ message: 'API import not implemented yet' });
});

// Get user's consumption data
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.id };
    
    if (startDate) query.timestamp = { $gte: new Date(startDate) };
    if (endDate) {
      query.timestamp = query.timestamp || {};
      query.timestamp.$lte = new Date(endDate);
    }
    
    const data = await Consumption.find(query).sort({ timestamp: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
