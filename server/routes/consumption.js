const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const energyController = require('../controllers/energyController');
const upload = require('../config/multer');

// Protect all routes
router.use(protect);

/**
 * @route   POST /api/v1/consumption
 * @desc    Add energy consumption data
 * @access  Private
 */
router.post(
  '/',
  [
    check('deviceId', 'Device ID is required').not().isEmpty(),
    check('value', 'Value is required and must be a number').isNumeric(),
    check('unit', 'Unit is required').isIn(['Wh', 'kWh', 'MWh', 'J', 'MJ', 'GJ', 'BTU']),
    check('timestamp', 'Invalid timestamp').optional().isISO8601()
  ],
  energyController.addConsumption
);

/**
 * @route   POST /api/v1/consumption/import/csv
 * @desc    Import consumption data from CSV
 * @access  Private
 */
router.post(
  '/import/csv',
  upload.single('file'),
  energyController.importConsumptionCSV
);

/**
 * @route   GET /api/v1/consumption
 * @desc    Get consumption data with filters
 * @access  Private
 */
router.get(
  '/',
  [
    check('deviceId').optional().isMongoId(),
    check('startDate').optional().isISO8601(),
    check('endDate').optional().isISO8601(),
    check('limit').optional().isInt({ min: 1, max: 1000 }),
    check('page').optional().isInt({ min: 1 })
  ],
  energyController.getConsumption
);

/**
 * @route   GET /api/v1/consumption/stats
 * @desc    Get consumption statistics
 * @access  Private
 */
router.get(
  '/stats',
  [
    check('deviceId').optional().isMongoId(),
    check('startDate').optional().isISO8601(),
    check('endDate').optional().isISO8601(),
    check('groupBy').optional().isIn(['hour', 'day', 'week', 'month', 'year'])
  ],
  energyController.getConsumptionStats
);

/**
 * @route   GET /api/v1/consumption/anomalies
 * @desc    Get consumption anomalies
 * @access  Private
 */
router.get('/anomalies', energyController.getAnomalies);

/**
 * @route   GET /api/v1/consumption/predictions
 * @desc    Get consumption predictions
 * @access  Private
 */
router.get('/predictions', energyController.getPredictions);

/**
 * @route   GET /api/v1/consumption/export
 * @desc    Export consumption data as CSV
 * @access  Private
 */
router.get('/export', energyController.exportConsumption);

/**
 * @route   DELETE /api/v1/consumption/:id
 * @desc    Delete consumption record
 * @access  Private
 */
router.delete('/:id', energyController.deleteConsumption);

/**
 * @route   GET /api/v1/consumption/anomalies
 * @desc    Get consumption anomalies
 * @access  Private
 */
router.get(
  '/anomalies',
  [
    check('deviceId').optional().isMongoId(),
    check('startDate').optional().isISO8601(),
    check('endDate').optional().isISO8601(),
    check('severity').optional().isIn(['low', 'medium', 'high']),
    check('status').optional().isIn(['pending', 'confirmed', 'resolved', 'false_positive'])
  ],
  energyController.getAnomalies
);

/**
 * @route   GET /api/v1/consumption/predictions
 * @desc    Get consumption predictions
 * @access  Private
 */
router.get(
  '/predictions',
  [
    check('deviceId').optional().isMongoId(),
    check('horizon').optional().isIn(['1h', '24h', '7d', '30d', '90d']),
    check('confidence').optional().isFloat({ min: 0.5, max: 0.99 })
  ],
  energyController.getPredictions
);

/**
 * @route   GET /api/v1/consumption/export
 * @desc    Export consumption data
 * @access  Private
 */
router.get(
  '/export',
  [
    check('format').isIn(['csv', 'json', 'xlsx']),
    check('deviceId').optional().isMongoId(),
    check('startDate').optional().isISO8601(),
    check('endDate').optional().isISO8601()
  ],
  energyController.exportConsumption
);

/**
 * @route   DELETE /api/v1/consumption/:id
 * @desc    Delete consumption record
 * @access  Private
 */
router.delete(
  '/:id',
  energyController.deleteConsumption
);

module.exports = router;
