const axios = require('axios');
const Consumption = require('../models/Consumption');
const Device = require('../models/Device');
const ErrorResponse = require('../utils/errorResponse');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const PREDICTION_HORIZON = process.env.PREDICTION_HORIZON || '24h';
const ANOMALY_THRESHOLD = process.env.ANOMALY_THRESHOLD || 3.0; // Standard deviations from mean

/**
 * Train a new model for a specific device
 * @param {string} deviceId - ID of the device
 * @param {Object} options - Training options
 * @returns {Promise<Object>} Training results
 */
exports.trainModel = async (deviceId, options = {}) => {
  try {
    // Get historical data for the device
    const history = await Consumption.find({ device: deviceId })
      .sort({ timestamp: 1 })
      .limit(1000); // Limit to last 1000 records for training

    if (history.length < 100) {
      throw new ErrorResponse('Insufficient data for training. At least 100 data points are required.', 400);
    }

    // Prepare training data
    const trainingData = history.map(record => ({
      timestamp: record.timestamp,
      value: record.value,
      unit: record.unit
    }));

    // Call AI service to train model
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/models/train`, {
      deviceId,
      data: trainingData,
      options: {
        modelType: 'prophet', // or 'lstm', 'arima', etc.
        trainTestSplit: 0.8,
        ...options
      }
    });

    // Update device with model info
    await Device.findByIdAndUpdate(deviceId, {
      'ai.modelId': response.data.modelId,
      'ai.modelType': response.data.modelType,
      'ai.lastTrained': new Date(),
      'ai.metrics': response.data.metrics
    });

    return response.data;
  } catch (error) {
    console.error('Error training model:', error);
    throw new ErrorResponse(`AI Service Error: ${error.message}`, error.statusCode || 500);
  }
};

/**
 * Generate consumption predictions
 * @param {string} deviceId - ID of the device
 * @param {Object} options - Prediction options
 * @returns {Promise<Array>} Array of predictions
 */
exports.predictConsumption = async (deviceId, options = {}) => {
  try {
    // Get device and check if model exists
    const device = await Device.findById(deviceId);
    if (!device.ai?.modelId) {
      throw new ErrorResponse('No trained model found for this device', 400);
    }

    // Get recent data for context
    const recentData = await Consumption.find({ device: deviceId })
      .sort({ timestamp: -1 })
      .limit(24) // Last 24 hours
      .select('timestamp value unit')
      .lean();

    // Call AI service for predictions
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/models/predict`, {
      modelId: device.ai.modelId,
      context: recentData.reverse(), // Reverse to chronological order
      options: {
        horizon: PREDICTION_HORIZON,
        confidence: 0.95,
        ...options
      }
    });

    return response.data.predictions;
  } catch (error) {
    console.error('Error generating predictions:', error);
    throw new ErrorResponse(`Prediction Error: ${error.message}`, error.statusCode || 500);
  }
};

/**
 * Detect anomalies in consumption data
 * @param {string} deviceId - ID of the device
 * @param {Object} options - Anomaly detection options
 * @returns {Promise<Array>} Array of detected anomalies
 */
exports.detectAnomalies = async (deviceId, options = {}) => {
  try {
    // Get recent consumption data
    const recentData = await Consumption.find({
      device: deviceId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
      .sort({ timestamp: 1 })
      .select('timestamp value unit')
      .lean();

    if (recentData.length === 0) {
      return [];
    }

    // Call AI service for anomaly detection
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/anomaly/detect`, {
      data: recentData,
      options: {
        method: 'isolation_forest', // or 'dbscan', 'lof', etc.
        threshold: ANOMALY_THRESHOLD,
        ...options
      }
    });

    // Update consumption records with anomaly info
    const bulkOps = response.data.anomalies.map(anomaly => ({
      updateOne: {
        filter: { _id: anomaly.dataPointId },
        update: {
          $set: {
            'anomaly': {
              detected: true,
              score: anomaly.score,
              method: response.data.method,
              timestamp: new Date(),
              reviewed: false
            }
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await Consumption.bulkWrite(bulkOps);
    }

    return response.data.anomalies;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    throw new ErrorResponse(`Anomaly Detection Error: ${error.message}`, error.statusCode || 500);
  }
};

/**
 * Generate energy saving recommendations
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of recommendations
 */
exports.generateRecommendations = async (userId) => {
  try {
    // Get user's devices and consumption patterns
    const devices = await Device.find({ user: userId });
    const deviceIds = devices.map(d => d._id);
    
    const consumption = await Consumption.aggregate([
      {
        $match: {
          device: { $in: deviceIds },
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: {
            device: '$device',
            hour: { $hour: '$timestamp' },
            dayOfWeek: { $dayOfWeek: '$timestamp' }
          },
          avgConsumption: { $avg: '$value' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.device': 1, '_id.dayOfWeek': 1, '_id.hour': 1 } }
    ]);

    // Call AI service for recommendations
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/recommendations/generate`, {
      userId,
      devices: devices.map(d => ({
        id: d._id,
        type: d.type,
        model: d.model,
        specifications: d.specifications
      })),
      consumptionPatterns: consumption,
      options: {
        maxRecommendations: 5,
        minImpact: 0.1 // Minimum 10% potential savings
      }
    });

    return response.data.recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new ErrorResponse(`Recommendation Error: ${error.message}`, error.statusCode || 500);
  }
};

/**
 * Calculate energy efficiency score
 * @param {string} deviceId - ID of the device
 * @returns {Promise<Object>} Efficiency metrics
 */
exports.calculateEfficiency = async (deviceId) => {
  try {
    const device = await Device.findById(deviceId);
    if (!device) {
      throw new ErrorResponse('Device not found', 404);
    }

    // Get consumption data for the last 30 days
    const consumption = await Consumption.aggregate([
      {
        $match: {
          device: device._id,
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          avgConsumption: { $avg: '$value' },
          maxConsumption: { $max: '$value' },
          minConsumption: { $min: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (consumption.length === 0) {
      return {
        score: 0,
        metrics: {},
        message: 'Insufficient data for efficiency calculation'
      };
    }

    const stats = consumption[0];
    
    // Calculate efficiency score (0-100)
    // This is a simplified example - adjust based on your specific requirements
    const baseEfficiency = 80; // Base efficiency for a well-functioning device
    const variabilityPenalty = Math.min(20, (stats.maxConsumption - stats.minConsumption) / stats.avgConsumption * 10);
    const score = Math.max(0, Math.min(100, baseEfficiency - variabilityPenalty));

    return {
      score: Math.round(score),
      metrics: {
        averageConsumption: stats.avgConsumption,
        consumptionVariability: (stats.maxConsumption - stats.minConsumption) / stats.avgConsumption,
        dataPoints: stats.count
      },
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error calculating efficiency:', error);
    throw new ErrorResponse(`Efficiency Calculation Error: ${error.message}`, error.statusCode || 500);
  }
};
