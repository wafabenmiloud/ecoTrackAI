// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const Device = require('../models/Device');
const {
  // User management
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  
  // Device management
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  
  // Analytics & Monitoring
  getConsumptionStats,
  getAnomalies,
  getPredictions,
  getAlerts,
  
  // System Management
  getSystemStatus,
  getAuditLogs,
  
  // User Support
  getSupportTickets,
  getSupportTicket,
  updateSupportTicket
} = require('../controllers/adminController');

// Protect all routes with JWT and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination, filtering, and sorting
 * @access  Private/Admin
 * @example
 *   // Get first page of users (25 per page)
 *   GET /api/v1/admin/users
 *   
 *   // Get second page with 10 users per page
 *   GET /api/v1/admin/users?page=2&limit=10
 *   
 *   // Filter users by role
 *   GET /api/v1/admin/users?role=admin
 *   
 *   // Select specific fields
 *   GET /api/v1/admin/users?select=name,email,role
 *   
 *   // Sort by name (prefix with - for descending)
 *   GET /api/v1/admin/users?sort=name
 */
router.get('/users', advancedResults(User), getUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get single user
 * @access  Private/Admin
 */
router.get('/users/:id', getUser);

/**
 * @route   POST /api/v1/admin/users
 * @desc    Create user
 * @access  Private/Admin
 */
router.post(
  '/users',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role').isIn(['user', 'admin', 'auditor']).withMessage('Invalid role')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  createUser
);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put(
  '/users/:id',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('role').optional().isIn(['user', 'admin', 'auditor']).withMessage('Invalid role')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  updateUser
);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   GET /api/v1/admin/devices
 * @desc    Get all devices with pagination, filtering, and sorting
 * @access  Private/Admin
 * @example
 *   // Get first page of devices (25 per page)
 *   GET /api/v1/admin/devices
 *   
 *   // Get second page with 10 devices per page
 *   GET /api/v1/admin/devices?page=2&limit=10
 *   
 *   // Filter devices by type
 *   GET /api/v1/admin/devices?type=smart_meter
 *   
 *   // Search devices by name
 *   GET /api/v1/admin/devices?search=kitchen
 *   
 *   // Sort by name (prefix with - for descending)
 *   GET /api/v1/admin/devices?sort=name
 */
router.get('/devices', advancedResults(Device), getDevices);

/**
 * @route   GET /api/v1/admin/devices/:id
 * @desc    Get single device
 * @access  Private/Admin
 */
router.get('/devices/:id', getDevice);

/**
 * @route   POST /api/v1/admin/devices
 * @desc    Create device
 * @access  Private/Admin
 */
router.post(
  '/devices',
  [
    check('name', 'Device name is required').not().isEmpty(),
    check('type', 'Device type is required').isIn(['sensor', 'meter', 'gateway', 'appliance']),
    check('location', 'Location is required').not().isEmpty()
  ],
  createDevice
);

/**
 * @route   PUT /api/v1/admin/devices/:id
 * @desc    Update device
 * @access  Private/Admin
 */
router.put('/devices/:id', updateDevice);

/**
 * @route   DELETE /api/v1/admin/devices/:id
 * @desc    Delete device
 * @access  Private/Admin
 */
router.delete('/devices/:id', deleteDevice);

/**
 * @route   GET /api/v1/admin/analytics/consumption
 * @desc    Get consumption statistics
 * @access  Private/Admin
 */
router.get('/analytics/consumption', getConsumptionStats);

/**
 * @route   GET /api/v1/admin/analytics/anomalies
 * @desc    Get anomalies
 * @access  Private/Admin
 */
router.get('/analytics/anomalies', getAnomalies);

/**
 * @route   GET /api/v1/admin/system/status
 * @desc    Get system status and health
 * @access  Private/Admin
 * @returns {Object} System status information
 */
router.get('/system/status', getSystemStatus);

/**
 * @route   GET /api/v1/admin/analytics/predictions
 * @desc    Get predictions
 * @access  Private/Admin
 */
router.get('/analytics/predictions', getPredictions);

/**
 * @route   GET /api/v1/admin/alerts
 * @desc    Get system alerts
 * @access  Private/Admin
 */
router.get('/alerts', getAlerts);

/**
 * @route   GET /api/v1/admin/status
 * @desc    Get system status
 * @access  Private/Admin
 */
router.get('/status', getSystemStatus);

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private/Admin
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @route   GET /api/v1/admin/support-tickets
 * @desc    Get support tickets
 * @access  Private/Admin
 */
router.get('/support-tickets', getSupportTickets);

/**
 * @route   GET /api/v1/admin/support-tickets/:id
 * @desc    Get single support ticket
 * @access  Private/Admin
 */
router.get('/support-tickets/:id', getSupportTicket);

/**
 * @route   PUT /api/v1/admin/support-tickets/:id
 * @desc    Update support ticket
 * @access  Private/Admin
 */
router.put('/support-tickets/:id', updateSupportTicket);

module.exports = router;
