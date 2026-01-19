const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const aiService = require('../services/aiService');
const Device = require('../models/Device');
const Consumption = require('../models/Consumption');

// @desc    Train AI model for a device
// @route   POST /api/v1/ai/models/train/:deviceId
// @access  Private
exports.trainModel = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.deviceId);
  
  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.deviceId}`, 404)
    );
  }

  // Check if user owns the device or is admin
  if (device.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to train model for this device`,
        401
      )
    );
  }

  const result = await aiService.trainModel(req.params.deviceId, req.body);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get consumption predictions
// @route   GET /api/v1/ai/predict/:deviceId
// @access  Private
exports.getPredictions = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.deviceId);
  
  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.deviceId}`, 404)
    );
  }

  // Check if user owns the device or is admin
  if (device.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to get predictions for this device`,
        401
      )
    );
  }

  const predictions = await aiService.predictConsumption(
    req.params.deviceId,
    req.query
  );
  
  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

// @desc    Detect anomalies in consumption data
// @route   GET /api/v1/ai/anomalies/detect/:deviceId
// @access  Private
exports.detectAnomalies = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.deviceId);
  
  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.deviceId}`, 404)
    );
  }

  // Check if user owns the device or is admin
  if (device.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to detect anomalies for this device`,
        401
      )
    );
  }

  const anomalies = await aiService.detectAnomalies(
    req.params.deviceId,
    req.query
  );
  
  res.status(200).json({
    success: true,
    count: anomalies.length,
    data: anomalies
  });
});

// @desc    Get energy saving recommendations
// @route   GET /api/v1/ai/recommendations
// @access  Private
exports.getRecommendations = asyncHandler(async (req, res, next) => {
  const recommendations = await aiService.generateRecommendations(req.user.id);
  
  res.status(200).json({
    success: true,
    count: recommendations.length,
    data: recommendations
  });
});

// @desc    Get device efficiency score
// @route   GET /api/v1/ai/efficiency/:deviceId
// @access  Private
exports.getEfficiencyScore = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.deviceId);
  
  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.deviceId}`, 404)
    );
  }

  // Check if user owns the device or is admin
  if (device.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view efficiency for this device`,
        401
      )
    );
  }

  const efficiency = await aiService.calculateEfficiency(req.params.deviceId);
  
  // Update device with latest efficiency score
  device.efficiency = {
    score: efficiency.score,
    lastUpdated: new Date()
  };
  await device.save();
  
  res.status(200).json({
    success: true,
    data: efficiency
  });
});

// @desc    Batch process anomalies for all devices
// @route   POST /api/v1/ai/anomalies/batch
// @access  Private/Admin
exports.batchProcessAnomalies = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to perform this action', 403)
    );
  }

  const devices = await Device.find({ 'ai.modelId': { $exists: true } });
  const results = [];
  
  // Process devices in parallel with concurrency limit
  const concurrency = 5;
  const processBatch = async (batch) => {
    return Promise.all(batch.map(async (device) => {
      try {
        const anomalies = await aiService.detectAnomalies(device._id);
        return {
          deviceId: device._id,
          status: 'success',
          anomaliesDetected: anomalies.length
        };
      } catch (error) {
        console.error(`Error processing device ${device._id}:`, error);
        return {
          deviceId: device._id,
          status: 'error',
          error: error.message
        };
      }
    }));
  };
  
  // Process in batches
  for (let i = 0; i < devices.length; i += concurrency) {
    const batch = devices.slice(i, i + concurrency);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
  }
  
  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});
