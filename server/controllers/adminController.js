const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Device = require('../models/Device');
const Consumption = require('../models/Consumption');
const asyncHandler = require('../middleware/async');
const path = require('path');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  // Check if user with email already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(
      new ErrorResponse(`User with email ${req.body.email} already exists`, 400)
    );
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Don't allow password update via this route
  if (req.body.password) {
    delete req.body.password;
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Find and delete the user directly
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all devices
// @route   GET /api/v1/admin/devices
// @access  Private/Admin
exports.getDevices = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single device
// @route   GET /api/v1/admin/devices/:id
// @access  Private/Admin
exports.getDevice = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('sharedWith.user', 'name email');

  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: device
  });
});

// @desc    Create device
// @route   POST /api/v1/admin/devices
// @access  Private/Admin
exports.createDevice = asyncHandler(async (req, res, next) => {
  try {
    // Create device data object
    const deviceData = {
      ...req.body,
      owner: req.user.id, // Set the owner to the current user
      isActive: true
    };

    // Set default location if not provided
    if (!deviceData.location) {
      deviceData.location = {
        type: 'Point',
        coordinates: [0, 0],
        address: 'Not specified'
      };
    }

    // Create the device
    const device = await Device.create(deviceData);

    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error creating device:', error);
    return next(new ErrorResponse('Failed to create device', 500));
  }
});

// @desc    Update device
// @route   PUT /api/v1/admin/devices/:id
// @access  Private/Admin
exports.updateDevice = asyncHandler(async (req, res, next) => {
  let device = await Device.findById(req.params.id);

  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.id}`, 404)
    );
  }

  device = await Device.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: device
  });
});

// @desc    Delete device
// @route   DELETE /api/v1/admin/devices/:id
// @access  Private/Admin
exports.deleteDevice = asyncHandler(async (req, res, next) => {
  const device = await Device.findByIdAndDelete(req.params.id);

  if (!device) {
    return next(
      new ErrorResponse(`Device not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get system status and health
// @route   GET /api/v1/admin/system/status
// @access  Private/Admin
exports.getSystemStatus = asyncHandler(async (req, res, next) => {
  try {
    // Get database status
    const dbStatus = await mongoose.connection.db.admin().ping();
    
    // Get system memory usage
    const memoryUsage = process.memoryUsage();
    
    // Get uptime
    const uptime = process.uptime();
    
    // Get number of connected users (example)
    const userCount = await User.countDocuments();
    const deviceCount = await Device.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: {
          value: uptime,
          humanReadable: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
        },
        database: {
          status: dbStatus.ok === 1 ? 'connected' : 'disconnected',
          url: process.env.MONGO_URI || 'mongodb://localhost:27017/ecotrackai'
        },
        resources: {
          memory: {
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            external: memoryUsage.external ? `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB` : 'N/A'
          }
        },
        metrics: {
          users: userCount,
          devices: deviceCount
        },
        environment: process.env.NODE_ENV || 'development',
        version: require('../../package.json').version
      }
    });
  } catch (error) {
    console.error('System status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get consumption statistics
// @route   GET /api/v1/admin/analytics/consumption
// @access  Private/Admin
exports.getConsumptionStats = asyncHandler(async (req, res, next) => {
  const stats = await Consumption.aggregate([
    {
      $match: {
        timestamp: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          $lte: new Date()
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        totalConsumption: { $sum: '$value' },
        avgConsumption: { $avg: '$value' },
        minConsumption: { $min: '$value' },
        maxConsumption: { $max: '$value' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    count: stats.length,
    data: stats
  });
});

// @desc    Get anomalies
// @route   GET /api/v1/admin/analytics/anomalies
// @access  Private/Admin
exports.getAnomalies = asyncHandler(async (req, res, next) => {
  const anomalies = await Consumption.find({
    'anomaly.detected': true,
    'anomaly.reviewed': { $ne: true }
  })
    .sort({ timestamp: -1 })
    .populate('device', 'name type')
    .populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: anomalies.length,
    data: anomalies
  });
});

// @desc    Get predictions
// @route   GET /api/v1/admin/analytics/predictions
// @access  Private/Admin
exports.getPredictions = asyncHandler(async (req, res, next) => {
  // This would typically call an ML service to get predictions
  // For now, we'll return sample data
  const predictions = [
    {
      date: new Date(),
      predictedConsumption: 1200,
      confidence: 0.95,
      upperBound: 1300,
      lowerBound: 1100
    },
    // Add more prediction data points
  ];

  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

// @desc    Get system alerts
// @route   GET /api/v1/admin/alerts
// @access  Private/Admin
exports.getAlerts = asyncHandler(async (req, res, next) => {
  // Get alerts from different sources
  const deviceAlerts = await Device.find({
    status: { $in: ['error', 'warning'] }
  })
    .select('name status lastSeen')
    .sort({ lastSeen: -1 });

  const consumptionAlerts = await Consumption.find({
    'anomaly.detected': true,
    'anomaly.reviewed': false
  })
    .select('deviceId value timestamp anomaly')
    .sort({ timestamp: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      deviceAlerts,
      consumptionAlerts
    }
  });
});

// @desc    Get system status
// @route   GET /api/v1/admin/status
// @access  Private/Admin
exports.getSystemStatus = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  const totalDevices = await Device.countDocuments();
  const activeDevices = await Device.countDocuments({ status: 'active' });
  const totalReadings = await Consumption.countDocuments();
  const todayReadings = await Consumption.countDocuments({
    timestamp: {
      $gte: new Date().setHours(0, 0, 0, 0),
      $lte: new Date()
    }
  });

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      devices: {
        total: totalDevices,
        active: activeDevices
      },
      readings: {
        total: totalReadings,
        today: todayReadings
      },
      system: {
        status: 'operational',
        lastChecked: new Date(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    }
  });
});

// @desc    Get audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  // In a real app, you would have an AuditLog model
  // const logs = await AuditLog.find().sort('-createdAt').populate('user', 'name email');
  
  // For now, return sample data
  const logs = [
    {
      action: 'login',
      user: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      timestamp: new Date()
    }
  ];

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});

// @desc    Get support tickets
// @route   GET /api/v1/admin/support-tickets
// @access  Private/Admin
exports.getSupportTickets = asyncHandler(async (req, res, next) => {
  // In a real app, you would have a SupportTicket model
  // const tickets = await SupportTicket.find().sort('-createdAt').populate('user', 'name email');
  
  // For now, return sample data
  const tickets = [
    {
      id: '1',
      subject: 'Login issues',
      status: 'open',
      priority: 'high',
      user: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets
  });
});

// @desc    Get single support ticket
// @route   GET /api/v1/admin/support-tickets/:id
// @access  Private/Admin
exports.getSupportTicket = asyncHandler(async (req, res, next) => {
  // const ticket = await SupportTicket.findById(req.params.id).populate('user', 'name email');
  
  // For now, return sample data
  const ticket = {
    id: req.params.id,
    subject: 'Login issues',
    status: 'open',
    priority: 'high',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    },
    messages: [
      {
        sender: 'user',
        message: 'I cannot log in to my account',
        timestamp: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Update support ticket
// @route   PUT /api/v1/admin/support-tickets/:id
// @access  Private/Admin
exports.updateSupportTicket = asyncHandler(async (req, res, next) => {
  // const ticket = await SupportTicket.findByIdAndUpdate(
  //   req.params.id,
  //   req.body,
  //   {
  //     new: true,
  //     runValidators: true
  //   }
  // );
  
  // For now, return sample data
  const ticket = {
    id: req.params.id,
    ...req.body,
    updatedAt: new Date()
  };

  res.status(200).json({
    success: true,
    data: ticket
  });
});
