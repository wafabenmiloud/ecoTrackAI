const mongoose = require('mongoose');

const ConsumptionSchema = new mongoose.Schema({
  // Reference to user/company and device
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User reference is required'],
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      index: '2dsphere'
    },
    address: String,
    room: String,
    building: String,
    site: String
  },
  // Time-related fields for flexible aggregation
  time: {
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    year: { type: Number, index: true },
    month: { type: Number, index: true },
    day: { type: Number, index: true },
    hour: { type: Number, index: true },
    minute: { type: Number, index: true },
    dayOfWeek: { type: Number, index: true }, // 0-6 (Sunday-Saturday)
    isWeekend: { type: Boolean, index: true },
    hourOfDay: { type: Number, index: true } // 0-23
  },
  // Energy consumption data
  consumption: {
    value: { 
      type: Number, 
      required: [true, 'Consumption value is required'],
      min: [0, 'Consumption cannot be negative']
    },
    unit: { 
      type: String, 
      enum: ['Wh', 'kWh', 'MWh', 'J', 'MJ', 'GJ', 'BTU'],
      default: 'kWh'
    },
    power: { // Instantaneous power in Watts
      value: Number,
      unit: {
        type: String,
        enum: ['W', 'kW', 'MW'],
        default: 'W'
      }
    },
    powerFactor: { // Power factor (0-1)
      type: Number,
      min: 0,
      max: 1
    },
    voltage: Number, // in Volts
    current: Number, // in Amperes
    frequency: Number // in Hz
  },
  
  // Cost and financial data
  cost: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    rate: { // Cost per unit of energy
      type: Number,
      min: 0
    },
    tariff: { // Reference to tariff structure if applicable
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tariff'
    }
  },
  
  // Environmental impact
  carbonFootprint: {
    co2: { // CO2 emissions in kg
      type: Number,
      min: 0
    },
    carbonIntensity: { // gCO2/kWh
      type: Number,
      min: 0
    },
    source: { // Energy source (e.g., 'grid', 'solar', 'wind')
      type: String,
      enum: ['grid', 'solar', 'wind', 'hydro', 'nuclear', 'gas', 'coal', 'other'],
      default: 'grid'
    }
  },
  // Data quality and source information
  dataQuality: {
    source: { 
      type: String, 
      enum: ['manual', 'csv', 'api', 'smart_meter', 'sensor', 'billed', 'estimated', 'modeled'],
      required: true,
      default: 'sensor',
      index: true
    },
    sourceId: String, // External ID from the data source
    confidence: { // Data confidence score (0-1)
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    isEstimated: {
      type: Boolean,
      default: false,
      index: true
    },
    estimationMethod: String, // How the value was estimated if applicable
    lastCalibrated: Date // When the sensor was last calibrated
  },
  
  // Anomaly detection
  anomaly: {
    detected: {
      type: Boolean,
      default: false,
      index: true
    },
    score: { // Anomaly score (0-1)
      type: Number,
      min: 0,
      max: 1
    },
    confidence: { // Confidence in the anomaly detection (0-1)
      type: Number,
      min: 0,
      max: 1
    },
    type: { // Type of anomaly (spike, drop, pattern_change, etc.)
      type: String,
      enum: ['spike', 'drop', 'pattern_change', 'seasonal', 'other']
    },
    reason: String, // Explanation of the anomaly
    expectedValue: Number, // Expected normal value
    deviation: Number, // How much it deviates from expected
    reviewed: {
      by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      at: Date,
      status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'false_positive', 'ignored', 'resolved'],
        default: 'pending'
      },
      notes: String,
      actionTaken: String
    }
  },
  
  // Prediction data
  prediction: {
    model: String, // Model used for prediction
    predictedValue: Number, // Predicted consumption
    confidence: Number, // Confidence in the prediction (0-1)
    upperBound: Number, // Upper bound of prediction interval
    lowerBound: Number // Lower bound of prediction interval
  },
  
  // Additional metadata
  tags: [{
    type: String,
    index: true
  }],
  notes: String,
  metadata: mongoose.Schema.Types.Mixed, // For flexible additional data
  
  // System fields
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { 
  timestamps: true,
  // Create a compound index for efficient querying by user and timestamp
  autoIndex: true
});

// Indexes for performance
ConsumptionSchema.index({ 'location.coordinates': '2dsphere' });

// Common query patterns
ConsumptionSchema.index({ user: 1, 'time.timestamp': -1 });
ConsumptionSchema.index({ device: 1, 'time.timestamp': -1 });
ConsumptionSchema.index({ company: 1, 'time.timestamp': -1 });
ConsumptionSchema.index({ 'time.year': 1, 'time.month': 1, 'time.day': 1 });
ConsumptionSchema.index({ 'anomaly.detected': 1, 'time.timestamp': -1 });
ConsumptionSchema.index({ 'dataQuality.source': 1, 'time.timestamp': -1 });

// Pre-save hook to set time-related fields
ConsumptionSchema.pre('save', function(next) {
  if (this.isModified('time.timestamp') || !this.time.timestamp) {
    const date = this.time.timestamp || new Date();
    this.time = {
      timestamp: date,
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-12
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      dayOfWeek: date.getDay(), // 0-6 (Sunday-Saturday)
      isWeekend: [0, 6].includes(date.getDay()),
      hourOfDay: date.getHours()
    };
  }
  
  // Calculate cost if rate is provided but amount is not
  if (this.cost?.rate !== undefined && this.cost?.amount === undefined) {
    this.cost.amount = this.consumption.value * this.cost.rate;
  }
  
  // Set default values for anomaly detection
  if (this.anomaly?.detected && !this.anomaly.reviewed) {
    this.anomaly.reviewed = this.anomaly.reviewed || {};
    this.anomaly.reviewed.status = 'pending';
  }
  
  next();
});

// Method to convert to a specific unit
ConsumptionSchema.methods.convertToUnit = function(targetUnit) {
  // Conversion factors to Wh (Watt-hours)
  const toWh = {
    Wh: 1,
    kWh: 1000,
    MWh: 1000000,
    J: 0.000277778,  // 1 Wh = 3600 J
    MJ: 277.778,     // 1 MJ = 0.277778 kWh
    GJ: 277778,      // 1 GJ = 277.778 kWh
    BTU: 0.29307107,  // 1 Wh = 3.41214 BTU
    J: 0.000277778,
    MJ: 0.277778,
    GJ: 277.778
  };

  if (!conversions[this.unit] || !conversions[targetUnit]) {
    throw new Error('Unsupported unit conversion');
  }

  return (this.value * conversions[this.unit]) / conversions[targetUnit];
};

// Add a method to detect if this is an anomaly
ConsumptionSchema.methods.isAnomalyDetected = function() {
  return this.anomaly?.detected === true && this.anomaly?.reviewed?.status !== 'false_negative';
};

// Add a method to get the consumption in a standard unit (kWh)
ConsumptionSchema.methods.getStandardizedValue = function() {
  return this.convertToUnit('kWh');
};

// Add a method to calculate cost savings compared to baseline
ConsumptionSchema.methods.calculateSavings = function(baselineConsumption, rate) {
  if (this.consumption.value <= baselineConsumption) {
    return {
      amount: 0,
      percentage: 0,
      currency: this.cost?.currency || 'USD'
    };
  }
  
  const diff = this.consumption.value - baselineConsumption;
  const currentRate = rate || this.cost?.rate || 0;
  
  return {
    amount: diff * currentRate,
    percentage: ((this.consumption.value - baselineConsumption) / baselineConsumption) * 100,
    currency: this.cost?.currency || 'USD',
    energySaved: diff,
    unit: this.consumption.unit
  };
};

// Static method to get consumption statistics with flexible grouping
ConsumptionSchema.statics.getStats = async function({
  userId,
  companyId,
  deviceId,
  startDate,
  endDate,
  groupBy = 'day', // 'hour', 'day', 'week', 'month', 'year'
  timezone = 'UTC'
}) {
  const match = { 'time.timestamp': {} };
  
  if (startDate) match['time.timestamp'].$gte = new Date(startDate);
  if (endDate) match['time.timestamp'].$lte = new Date(endDate);
  if (userId) match.user = mongoose.Types.ObjectId(userId);
  if (companyId) match.company = mongoose.Types.ObjectId(companyId);
  if (deviceId) match.device = mongoose.Types.ObjectId(deviceId);
  
  // Handle empty date range
  if (Object.keys(match['time.timestamp']).length === 0) {
    delete match['time.timestamp'];
  }
  
  // Grouping logic
  let groupId = {};
  let sort = {};
  
  switch (groupBy) {
    case 'hour':
      groupId = {
        year: '$time.year',
        month: '$time.month',
        day: '$time.day',
        hour: '$time.hour'
      };
      sort = { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 };
      break;
    case 'week':
      // Using ISO week (starts on Monday)
      groupId = {
        year: { $isoWeekYear: { date: '$time.timestamp', timezone } },
        week: { $isoWeek: { date: '$time.timestamp', timezone } }
      };
      sort = { '_id.year': 1, '_id.week': 1 };
      break;
    case 'month':
      groupId = {
        year: '$time.year',
        month: '$time.month'
      };
      sort = { '_id.year': 1, '_id.month': 1 };
      break;
    case 'year':
      groupId = { year: '$time.year' };
      sort = { '_id.year': 1 };
      break;
    case 'day':
    default:
      groupId = {
        year: '$time.year',
        month: '$time.month',
        day: '$time.day'
      };
      sort = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
  }
  
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: groupId,
        timestamp: { $first: '$time.timestamp' },
        consumption: { $sum: '$consumption.value' },
        cost: { $sum: '$cost.amount' },
        co2: { $sum: '$carbonFootprint.co2' },
        count: { $sum: 1 },
        avgPower: { $avg: '$consumption.power.value' },
        peakPower: { $max: '$consumption.power.value' }
      }
    },
    { $sort: sort },
    {
      $project: {
        _id: 0,
        date: '$_id',
        timestamp: 1,
        consumption: 1,
        cost: { $ifNull: ['$cost', 0] },
        co2: { $ifNull: ['$co2', 0] },
        count: 1,
        avgPower: { $ifNull: ['$avgPower', 0] },
        peakPower: { $ifNull: ['$peakPower', 0] }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to detect anomalies in a time range
ConsumptionSchema.statics.detectAnomalies = async function({
  userId,
  deviceId,
  startDate,
  endDate,
  threshold = 2.5, // Standard deviations
  minConfidence = 0.7
}) {
  // Implementation would use statistical methods to detect anomalies
  // This is a simplified example
  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        device: deviceId ? mongoose.Types.ObjectId(deviceId) : { $exists: true },
        'time.timestamp': { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: '$consumption.value' },
        stdDev: { $stdDevPop: '$consumption.value' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (!stats.length || stats[0].count < 10) {
    return []; // Not enough data
  }
  
  const { avg, stdDev } = stats[0];
  const thresholdValue = avg + (stdDev * threshold);
  
  // Find records above threshold
  const anomalies = await this.find({
    user: userId,
    device: deviceId || { $exists: true },
    'time.timestamp': { $gte: new Date(startDate), $lte: new Date(endDate) },
    'consumption.value': { $gt: thresholdValue },
    'anomaly.detected': { $ne: true } // Only find new anomalies
  });
  
  // Mark as anomalies
  const updates = anomalies.map(record => ({
    updateOne: {
      filter: { _id: record._id },
      update: {
        $set: {
          'anomaly.detected': true,
          'anomaly.score': (record.consumption.value - thresholdValue) / stdDev,
          'anomaly.confidence': minConfidence,
          'anomaly.expectedValue': avg,
          'anomaly.deviation': record.consumption.value - avg,
          'anomaly.reviewed.status': 'pending'
        }
      }
    }
  }));
  
  if (updates.length) {
    await this.bulkWrite(updates);
  }
  
  return anomalies;
};

module.exports = mongoose.model('Consumption', ConsumptionSchema);
