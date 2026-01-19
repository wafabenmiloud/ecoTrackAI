const mongoose = require('mongoose');
const EnergyConsumption = require('../models/EnergyConsumption');
const Device = require('../models/Device');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs'); 
const csv = require('csv-parser');

// @desc    Add energy consumption data
// @route   POST /api/v1/consumption
// @access  Private
exports.addConsumption = asyncHandler(async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Authenticated user ID:', req.user ? req.user.id : 'No user');

    const { deviceId, value, unit, timestamp } = req.body;

    // Log the device ID and its type
    console.log('Device ID from request:', deviceId, 'Type:', typeof deviceId);

    // Verify the device ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return next(new ErrorResponse(`Invalid device ID format: ${deviceId}`, 400));
    }

    // Convert deviceId to ObjectId for consistent querying
    const deviceObjectId = new mongoose.Types.ObjectId(deviceId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log('Converted Device ID:', deviceObjectId);
    console.log('Converted User ID:', userId);

    // First, check if device exists at all
    const anyDevice = await Device.findById(deviceObjectId);
    
    if (!anyDevice) {
      console.log('Device does not exist in the database');
      return next(new ErrorResponse(`No device found with id ${deviceId}`, 404));
    }
    
    console.log('Device found in database:', {
      _id: anyDevice._id,
      name: anyDevice.name,
      user: anyDevice.user,
      userType: typeof anyDevice.user,
      userString: String(anyDevice.user)
    });
    
    // Check if the device has no owner or is owned by the current user
    if (anyDevice.user && !anyDevice.user.equals(userId)) {
      console.log('User does not own this device');
      console.log('Expected user ID:', userId);
      console.log('Device owner ID:', anyDevice.user);
      console.log('Owner ID type:', typeof anyDevice.user);
      console.log('Owner ID string:', String(anyDevice.user));
      
      return next(new ErrorResponse(`You don't have permission to add data to this device`, 403));
    }
    
    // If device has no owner, assign it to the current user
    if (!anyDevice.user) {
      console.log('Device has no owner, assigning to current user');
      anyDevice.user = userId;
      await anyDevice.save();
      console.log('Device ownership updated');
    }
    
    const device = anyDevice;
    
    console.log('Device found and user has access:', device);

    // Create the consumption record
    const consumptionData = {
      device: deviceId,
      user: req.user.id,
      value,
      unit,
      timestamp: timestamp || Date.now()
    };
  
  console.log('Creating consumption record:', consumptionData);
  
  const consumption = await EnergyConsumption.create(consumptionData);
  console.log('Consumption record created:', consumption);

  res.status(201).json({
    success: true,
    data: consumption
  });
  } catch (error) {
    console.error('Error in addConsumption:', error);
    next(error);
  }
});

// @desc    Import consumption data from CSV
// @route   POST /api/v1/consumption/import/csv
// @access  Private
exports.importConsumptionCSV = asyncHandler(async (req, res, next) => {
  let filePath;
  
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a CSV file', 400));
    }
    
    filePath = path.resolve(req.file.path);
    console.log('Processing file:', filePath);
    
    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse('Uploaded file not found', 404));
    }

    const results = [];
    const errors = [];

    // Process CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Process each row
    for (const [index, row] of results.entries()) {
      try {
        const { deviceId, value, unit, timestamp } = row;
        
        // Validate required fields
        if (!deviceId || !value || !unit) {
          errors.push(`Row ${index + 1}: Missing required fields`);
          continue;
        }

        // Debug: Log the device ID and user ID being used for lookup
        console.log(`Looking up device with ID: ${deviceId}`);
        console.log(`Authenticated user ID: ${req.user.id}`);
        
        // First, check if device exists regardless of owner
        const device = await Device.findById(deviceId);
        console.log('Found device:', device);
        
        if (!device) {
          errors.push(`Row ${index + 1}: Device not found with ID: ${deviceId}`);
          continue;
        }
        
        // Then check ownership - using device.owner instead of device.user
        if (device.owner.toString() !== req.user.id && 
            (!device.sharedWith || !device.sharedWith.some(sw => sw.user.toString() === req.user.id))) {
          errors.push(`Row ${index + 1}: You don't have permission to add data to device ${deviceId}`);
          continue;
        }

        // Create consumption record
        await EnergyConsumption.create({
          device: deviceId,
          user: req.user.id,
          value: parseFloat(value),
          unit,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        });
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      imported: results.length - errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error in importConsumptionCSV:', error);
    return next(new ErrorResponse('Error processing CSV file', 500));
  } finally {
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }
});

// @desc    Get consumption data with filters
// @route   GET /api/v1/consumption
// @access  Private
exports.getConsumption = asyncHandler(async (req, res, next) => {
  try {
    // Build query object
    const queryObj = {};
    
    // Add device filter if provided
    if (req.query.deviceId) {
      // Convert string deviceId to ObjectId
      queryObj.device = new mongoose.Types.ObjectId(req.query.deviceId);
    }
    
    // Add date range filter if provided
    if (req.query.startDate || req.query.endDate) {
      queryObj.timestamp = {};
      if (req.query.startDate) {
        queryObj.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Set end of day for endDate
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryObj.timestamp.$lte = endDate;
      }
    }
    
    // Add user filter to only show user's data (unless admin)
    if (req.user.role !== 'admin') {
      queryObj.user = new mongoose.Types.ObjectId(req.user.id);
    }

    console.log('Query Object:', JSON.stringify(queryObj, null, 2));
    
    // Create base query
    let query = EnergyConsumption.find(queryObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-timestamp');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await EnergyConsumption.countDocuments(queryObj);
    
    // Apply pagination
    query = query.skip(startIndex).limit(limit);

    // Execute query with population of device details
    const results = await query.populate('device', 'name type model');

    // Calculate pagination
    const pagination = {};
    const endIndex = page * limit;

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      pagination,
      data: results
    });
    
  } catch (error) {
    console.error('Error in getConsumption:', error);
    next(error);
  }
});

// @desc    Get consumption statistics
// @route   GET /api/v1/consumption/stats
// @access  Private
exports.getConsumptionStats = asyncHandler(async (req, res, next) => {
  const stats = await EnergyConsumption.aggregate([
    {
      $match: req.user.role !== 'admin' ? { user: req.user._id } : {}
    },
    {
      $group: {
        _id: null,
        totalConsumption: { $sum: '$value' },
        avgConsumption: { $avg: '$value' },
        minConsumption: { $min: '$value' },
        maxConsumption: { $max: '$value' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {}
  });
});

// @desc    Get consumption anomalies
// @route   GET /api/v1/consumption/anomalies
// @access  Private
exports.getAnomalies = asyncHandler(async (req, res, next) => {
  const anomalies = await EnergyConsumption.find({
    'anomaly.detected': true,
    ...(req.user.role !== 'admin' && { user: req.user._id })
  }).sort({ timestamp: -1 });

  res.status(200).json({
    success: true,
    count: anomalies.length,
    data: anomalies
  });
});

// @desc    Get consumption predictions
// @route   GET /api/v1/consumption/predictions
// @access  Private
exports.getPredictions = asyncHandler(async (req, res, next) => {
  // This is a placeholder - in a real app, you would call your AI service
  const predictions = [];
  
  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

// @desc    Export consumption data
// @route   GET /api/v1/consumption/export
// @access  Private
exports.exportConsumption = asyncHandler(async (req, res, next) => {
  const consumptions = await EnergyConsumption.find({
    ...(req.user.role !== 'admin' && { user: req.user._id })
  }).sort({ timestamp: -1 });

  // Convert to CSV
  let csv = 'Timestamp,Device ID,Value,Unit,Cost\n';
  
  consumptions.forEach(consumption => {
    csv += `${consumption.timestamp},${consumption.device},${consumption.value},${consumption.unit},${consumption.cost || ''}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=consumption-export.csv');
  
  res.status(200).send(csv);
});

// @desc    Delete consumption record
// @route   DELETE /api/v1/consumption/:id
// @access  Private
exports.deleteConsumption = asyncHandler(async (req, res, next) => {
  const consumption = await EnergyConsumption.findById(req.params.id);

  if (!consumption) {
    return next(
      new ErrorResponse(`Consumption record not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is consumption owner or admin
  if (consumption.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to delete this consumption record`, 401)
    );
  }

  await consumption.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
