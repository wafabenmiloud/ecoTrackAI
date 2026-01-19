const mongoose = require('mongoose');

const EcoTipSchema = new mongoose.Schema({
  // Tip content
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'heating', 
      'cooling', 
      'lighting', 
      'appliances', 
      'water', 
      'transportation',
      'renewable',
      'behavioral',
      'other'
    ]
  },
  
  // Impact and metrics
  impactLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedSavings: {
    value: Number,
    unit: {
      type: String,
      enum: ['%', 'kWh/year', 'kgCO2/year', 'currency'],
      default: '%'
    },
    description: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeToImplement: {
    value: Number,
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'minutes'
    }
  },
  
  // Content details
  content: {
    type: String,
    required: true
  },
  imageUrl: String,
  videoUrl: String,
  externalLinks: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'calculator', 'product', 'other']
    }
  }],
  
  // Targeting and personalization
  tags: [String],
  applicableDevices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],
  applicableUserTypes: [{
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'all']
  }],
  applicableSeasons: [{
    type: String,
    enum: ['winter', 'spring', 'summer', 'autumn', 'all']
  }],
  applicableRegions: [String], // ISO country codes or region names
  
  // Gamification
  points: {
    type: Number,
    default: 10
  },
  badge: {
    name: String,
    icon: String
  },
  
  // Metadata
  source: {
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['internal', 'government', 'ngo', 'utility', 'other'],
      default: 'internal'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  
  // User interaction tracking
  stats: {
    views: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    saved: { type: Number, default: 0 },
    shared: { type: Number, default: 0 },
    lastViewed: Date
  },
  
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1
  },
  
  // Relationships
  relatedTips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoTip'
  }],
  
  // Custom fields
  customFields: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for efficient querying
EcoTipSchema.index({ category: 1, isActive: 1 });
EcoTipSchema.index({ tags: 1 });
EcoTipSchema.index({ impactLevel: 1 });
EcoTipSchema.index({ 'estimatedSavings.value': 1 });
EcoTipSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });

// Pre-save hook to ensure at least one applicable user type
EcoTipSchema.pre('save', function(next) {
  if (this.applicableUserTypes.length === 0) {
    this.applicableUserTypes = ['all'];
  }
  
  if (this.applicableSeasons.length === 0) {
    this.applicableSeasons = ['all'];
  }
  
  next();
});

// Instance method to get a summary of the tip
EcoTipSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    impactLevel: this.impactLevel,
    estimatedSavings: this.estimatedSavings,
    difficulty: this.difficulty,
    timeToImplement: this.timeToImplement,
    points: this.points,
    imageUrl: this.imageUrl
  };
};

// Static method to get tips by user profile
EcoTipSchema.statics.getPersonalizedTips = async function(user, limit = 5) {
  const query = {
    isActive: true,
    $or: [
      { applicableUserTypes: 'all' },
      { applicableUserTypes: user.profile?.userType || 'residential' }
    ]
  };
  
  // Add seasonal filtering if applicable
  const month = new Date().getMonth();
  let season = 'all';
  
  if ([11, 0, 1].includes(month)) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'autumn';
  
  query.$or.push({ applicableSeasons: 'all' }, { applicableSeasons: season });
  
  // Add regional filtering if user has location data
  if (user.profile?.location) {
    // This is a simplified example - you'd want to implement more sophisticated geolocation
    query.$or.push({ applicableRegions: { $in: [user.profile.location, 'global'] } });
  }
  
  return this.find(query)
    .sort({ priority: -1, 'stats.views': 1, 'stats.completed': 1 })
    .limit(limit)
    .lean();
};

// Static method to log tip interaction
EcoTipSchema.statics.logInteraction = async function(tipId, interactionType, userId = null) {
  const update = { $inc: {} };
  
  switch (interactionType) {
    case 'view':
      update.$inc['stats.views'] = 1;
      update.$set = { 'stats.lastViewed': new Date() };
      break;
    case 'complete':
      update.$inc['stats.completed'] = 1;
      break;
    case 'save':
      update.$inc['stats.saved'] = 1;
      break;
    case 'share':
      update.$inc['stats.shared'] = 1;
      break;
    default:
      return null;
  }
  
  if (userId) {
    // Here you might want to update user-specific tracking
    // For example, mark the tip as viewed/completed for the user
  }
  
  return this.findByIdAndUpdate(tipId, update, { new: true });
};

module.exports = mongoose.model('EcoTip', EcoTipSchema);
