const mongoose = require('mongoose');

const EnergyConsumptionSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kWh', 'Wh', 'MWh', 'J', 'kJ', 'MJ'],
    default: 'kWh'
  },
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    rate: Number // Cost per unit
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyScore: Number,
  metadata: {
    temperature: Number, // in Celsius
    humidity: Number,    // in percentage
    occupancy: Number,   // number of people
    weather: String,     // weather conditions
    deviceStatus: String // device operational status
  },
  source: {
    type: String,
    enum: ['manual', 'api', 'sensor', 'import'],
    default: 'sensor'
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient querying by device and timestamp
EnergyConsumptionSchema.index({ device: 1, timestamp: 1 });

// Index for anomaly detection queries
EnergyConsumptionSchema.index({ isAnomaly: 1, timestamp: 1 });

// Virtual for formatted date
EnergyConsumptionSchema.virtual('date').get(function() {
  return this.timestamp.toISOString().split('T')[0];
});

// Pre-save hook to calculate cost if not provided
EnergyConsumptionSchema.pre('save', async function() {
  try {
    if (this.isModified('value') && !this.cost?.amount && this.cost?.rate) {
      this.cost.amount = this.value * this.cost.rate;
    }
  } catch (error) {
    console.error('Error in EnergyConsumption pre-save hook:', error);
    throw error; // This will be caught by the controller's try-catch
  }
});

// Static method to get total consumption for a device in a time range
EnergyConsumptionSchema.statics.getTotalConsumption = async function(deviceId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        device: mongoose.Types.ObjectId(deviceId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$value' },
        average: { $avg: '$value' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { total: 0, average: 0, count: 0 };
};

// Static method to detect anomalies using z-score
EnergyConsumptionSchema.statics.detectAnomalies = async function(deviceId, threshold = 3) {
  // Implementation of anomaly detection
  // This is a placeholder - in a real app, you'd implement more sophisticated detection
  const stats = await this.aggregate([
    {
      $match: { device: mongoose.Types.ObjectId(deviceId) }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: '$value' },
        stdDev: { $stdDevPop: '$value' }
      }
    }
  ]);

  if (stats.length === 0) return [];

  const { avg, stdDev } = stats[0];
  
  if (stdDev === 0) return []; // No variation in data

  const anomalies = await this.find({
    device: deviceId,
    $expr: {
      $gt: [
        { $abs: { $subtract: ['$value', avg] } },
        { $multiply: [threshold, stdDev] }
      ]
    }
  });

  // Update anomaly status
  await this.updateMany(
    { _id: { $in: anomalies.map(a => a._id) } },
    { $set: { isAnomaly: true, anomalyScore: 1 } } // Simple scoring for now
  );

  return anomalies;
};

module.exports = mongoose.model('EnergyConsumption', EnergyConsumptionSchema);
