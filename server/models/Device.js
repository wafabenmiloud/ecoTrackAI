const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  // Basic device information
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true,
    maxlength: [100, 'Device name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: [
      'smart_meter', 
      'sensor', 
      'appliance',
      'lighting',
      'heating',
      'cooling',
      'water_heater',
      'refrigerator',
      'television',
      'computer',
      'other'
    ],
    required: [true, 'Device type is required']
  },
  model: {
    type: String,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  manufacturer: {
    type: String,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  firmwareVersion: String,
  isActive: {
    type: Boolean,
    default: true
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  
  // Ownership and access control
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    }
  }],
  
  // Location information
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    },
    address: String,
    room: String,
    floor: String,
    building: String
  },
  
  // Energy specifications
  powerRating: {
    value: {
      type: Number,
      min: [0, 'Power rating cannot be negative']
    },
    unit: {
      type: String,
      enum: ['W', 'kW', 'VA', 'kVA'],
      default: 'W'
    },
    measuredAt: Date
  },
  voltage: {
    value: {
      type: Number,
      min: [0, 'Voltage cannot be negative']
    },
    unit: {
      type: String,
      enum: ['V'],
      default: 'V'
    },
    measuredAt: Date
  },
  current: {
    value: {
      type: Number,
      min: [0, 'Current cannot be negative']
    },
    unit: {
      type: String,
      enum: ['A', 'mA'],
      default: 'A'
    },
    measuredAt: Date
  },
  energyEfficiency: {
    rating: {
      type: String,
      enum: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', null],
      default: null
    },
    annualConsumption: Number, // in kWh/year
    co2Emission: Number // in kgCO2/year
  },
  
  // Status and monitoring
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    index: true
  },
  connectionStatus: {
    type: String,
    enum: ['online', 'offline', 'disconnected', 'error'],
    default: 'offline'
  },
  connectionType: {
    type: String,
    enum: ['wifi', 'ethernet', 'cellular', 'zigbee', 'zwave', 'bluetooth', 'other', null],
    default: null
  },
  ipAddress: {
    type: String,
    match: [/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 'Please enter a valid IP address']
  },
  macAddress: {
    type: String,
    match: [/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Please enter a valid MAC address']
  },
  lastEnergyReading: {
    timestamp: Date,
    value: Number,
    unit: {
      type: String,
      enum: ['kWh', 'Wh', 'MWh', 'J'],
      default: 'kWh'
    }
  },
  // AI/ML related fields
  baselineConsumption: {
    value: Number, // Average consumption in W
    calculatedAt: Date,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  anomalyThreshold: {
    type: Number,
    default: 2.0, // Standard deviations from mean
    min: 1.0
  },
  predictionModel: {
    type: String,
    enum: ['linear', 'neural_network', 'prophet', 'lstm', null],
    default: null
  },
  modelLastTrained: Date,
  
  // Configuration
  measurementInterval: {
    type: Number, // in seconds
    default: 300 // 5 minutes
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Metadata
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  
  // System fields
  isActive: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // For IoT devices
  deviceId: String, // External device ID
  apiKey: String,   // For device authentication
  
  // Energy monitoring capabilities
  capabilities: {
    realtimeMonitoring: Boolean,
    energyMetering: Boolean,
    powerQuality: Boolean,
    loadControl: Boolean,
    scheduling: Boolean,
    demandResponse: Boolean
  },
  
  // Additional metadata
  additionalMetadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
DeviceSchema.index({ 'location': '2dsphere' });

// Text index for search
DeviceSchema.index({
  name: 'text',
  description: 'text',
  model: 'text',
  manufacturer: 'text',
  serialNumber: 'text',
  tags: 'text'
});

// Virtual for device status based on last seen
DeviceSchema.virtual('status').get(function() {
  if (!this.lastSeen) return 'unknown';
  const minutesAgo = (Date.now() - this.lastSeen) / (1000 * 60);
  if (minutesAgo < 5) return 'online';
  if (minutesAgo < 60) return 'recent';
  return 'offline';
});

// Calculate energy efficiency score (0-100)
DeviceSchema.methods.calculateEfficiencyScore = function() {
  if (!this.energyEfficiency?.rating) return null;
  
  const ratingScores = {
    'A+++': 100, 'A++': 90, 'A+': 80, 'A': 75, 
    'B': 65, 'C': 55, 'D': 45, 'E': 35, 'F': 25, 'G': 15
  };
  
  return ratingScores[this.energyEfficiency.rating] || null;
};

// Get estimated annual cost
DeviceSchema.methods.getEstimatedAnnualCost = function(ratePerKwh) {
  if (!this.energyEfficiency?.annualConsumption || !ratePerKwh) return null;
  return this.energyEfficiency.annualConsumption * ratePerKwh;
};

// Check if device is consuming abnormally
DeviceSchema.methods.isConsumptionAbnormal = function(currentConsumption) {
  if (!this.baselineConsumption?.value || !this.anomalyThreshold) return false;
  
  const threshold = this.baselineConsumption.value * (1 + this.anomalyThreshold / 100);
  return currentConsumption > threshold;
};

// Add a method to get device location as string
DeviceSchema.methods.getLocationString = function() {
  if (this.location?.address) return this.location.address;
  if (this.location?.room) return this.location.room;
  if (this.location?.building) return this.location.building;
  if (this.location?.coordinates?.length === 2) {
    return `${this.location.coordinates[1].toFixed(4)}, ${this.location.coordinates[0].toFixed(4)}`;
  }
  return 'Location not specified';
};

// Pre-save hook using async/await pattern
DeviceSchema.pre('save', async function() {
  // Update lastSeen when device comes online
  if (this.isModified('isOnline') && this.isOnline) {
    this.lastSeen = new Date();
    this.connectionStatus = 'online';
  }
  
  // Update connection status based on lastSeen
  if (this.isModified('lastSeen') || this.isNew) {
    const lastSeen = this.lastSeen || new Date();
    const minutesAgo = (Date.now() - new Date(lastSeen)) / (1000 * 60);
    
    if (minutesAgo < 5) {
      this.connectionStatus = 'online';
    } else if (minutesAgo < 60) {
      this.connectionStatus = 'recent';
    } else {
      this.connectionStatus = 'offline';
    }
  }
});

// Indexes for performance
DeviceSchema.index({ owner: 1, isActive: 1 });
DeviceSchema.index({ type: 1, isActive: 1 });
DeviceSchema.index({ 'location.coordinates': '2dsphere' });
DeviceSchema.index({ lastSeen: -1 });
DeviceSchema.index({ 'energyEfficiency.rating': 1 });

module.exports = mongoose.model('Device', DeviceSchema);
