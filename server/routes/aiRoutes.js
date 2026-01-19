const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  trainModel,
  getPredictions,
  detectAnomalies,
  getRecommendations,
  getEfficiencyScore,
  batchProcessAnomalies
} = require('../controllers/aiController');

// Protect all routes with JWT
router.use(protect);

// @desc    Train AI model for a device
// @route   POST /api/v1/ai/models/train/:deviceId
// @access  Private
router.post(
  '/models/train/:deviceId',
  [
    check('modelType', 'Please specify a valid model type').isIn(['prophet', 'lstm', 'arima']),
    check('trainTestSplit', 'Train/test split must be between 0.5 and 0.9').optional().isFloat({ min: 0.5, max: 0.9 })
  ],
  trainModel
);

// @desc    Get consumption predictions
// @route   GET /api/v1/ai/predict/:deviceId
// @access  Private
router.get(
  '/predict/:deviceId',
  [
    check('horizon').optional().isIn(['1h', '24h', '7d', '30d']),
    check('confidence').optional().isFloat({ min: 0.5, max: 0.99 })
  ],
  getPredictions
);

// @desc    Detect anomalies in consumption data
// @route   GET /api/v1/ai/anomalies/detect/:deviceId
// @access  Private
router.get(
  '/anomalies/detect/:deviceId',
  [
    check('threshold').optional().isFloat({ min: 1, max: 5 }),
    check('method').optional().isIn(['isolation_forest', 'dbscan', 'lof'])
  ],
  detectAnomalies
);

// @desc    Get energy saving recommendations
// @route   GET /api/v1/ai/recommendations
// @access  Private
router.get('/recommendations', getRecommendations);

// @desc    Get device efficiency score
// @route   GET /api/v1/ai/efficiency/:deviceId
// @access  Private
router.get('/efficiency/:deviceId', getEfficiencyScore);

// @desc    Batch process anomalies for all devices
// @route   POST /api/v1/ai/anomalies/batch
// @access  Private/Admin
router.post('/anomalies/batch', authorize('admin'), batchProcessAnomalies);

module.exports = router;
