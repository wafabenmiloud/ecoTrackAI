const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  // Basic company information
  name: {
    type: String,
    required: true,
    trim: true
  },
  legalName: String,
  description: String,
  logo: String,
  website: String,
  industry: String,
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+'],
    default: '1-10'
  },
  
  // Contact information
  contact: {
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  
  // Billing information
  billing: {
    companyName: String,
    taxId: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    contactEmail: String,
    contactPhone: String
  },
  
  // Subscription and plan
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'past_due', 'canceled', 'expired'],
      default: 'trial'
    },
    startDate: Date,
    endDate: Date,
    trialEndsAt: Date,
    paymentMethod: String,
    billingCycle: {
      type: String,
      enum: ['monthly', 'annually'],
      default: 'monthly'
    },
    nextBillingDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    maxUsers: {
      type: Number,
      default: 1
    },
    maxDevices: {
      type: Number,
      default: 5
    },
    features: [String],
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Company settings
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    locale: {
      type: String,
      default: 'en-US'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    energyUnit: {
      type: String,
      enum: ['Wh', 'kWh', 'MWh', 'J', 'MJ', 'GJ'],
      default: 'kWh'
    },
    notifications: {
      email: {
        billing: { type: Boolean, default: true },
        reports: { type: Boolean, default: true },
        alerts: { type: Boolean, default: true },
        news: { type: Boolean, default: true }
      },
      inApp: {
        billing: { type: Boolean, default: true },
        reports: { type: Boolean, default: true },
        alerts: { type: Boolean, default: true },
        news: { type: Boolean, default: true }
      }
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      ipWhitelist: [String],
      sessionTimeout: { type: Number, default: 24 } // in hours
    }
  },
  
  // Company members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member', 'viewer'],
      default: 'member'
    },
    departments: [String],
    title: String,
    joinDate: {
      type: Date,
      default: Date.now
    },
    lastActive: Date,
    permissions: {
      viewAllDevices: { type: Boolean, default: true },
      manageDevices: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: true },
      manageUsers: { type: Boolean, default: false },
      manageBilling: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'inactive'],
      default: 'pending'
    }
  }],
  
  // Company locations
  locations: [{
    name: String,
    type: {
      type: String,
      enum: ['headquarters', 'branch', 'warehouse', 'retail', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    contact: {
      name: String,
      email: String,
      phone: String
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Additional metadata
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  
  // System fields
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  
  // Relationships
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  subsidiaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  
  // Analytics
  stats: {
    totalUsers: { type: Number, default: 0 },
    totalDevices: { type: Number, default: 0 },
    totalLocations: { type: Number, default: 0 },
    totalConsumption: { type: Number, default: 0 }, // in Wh
    totalCost: { type: Number, default: 0 }, // in company currency
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Indexes
CompanySchema.index({ 'contact.address.coordinates': '2dsphere' });
CompanySchema.index({ 'locations.address.coordinates': '2dsphere' });
CompanySchema.index({ name: 'text', description: 'text', 'contact.email': 'text' });

// Pre-save hook to update stats
CompanySchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('members')) {
    this.stats.totalUsers = this.members.filter(m => m.status === 'active').length;
    this.stats.lastUpdated = new Date();
  }
  next();
});

// Add a method to add a member
CompanySchema.methods.addMember = async function(userId, role = 'member', options = {}) {
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  
  if (existingMember) {
    // Update existing member
    Object.assign(existingMember, {
      role,
      ...options,
      status: 'active',
      lastActive: new Date()
    });
  } else {
    // Add new member
    this.members.push({
      user: userId,
      role,
      ...options,
      joinDate: new Date(),
      lastActive: new Date(),
      status: 'active'
    });
  }
  
  return this.save();
};

// Add a method to remove a member
CompanySchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  return this.save();
};

// Add a method to check if a user has a specific role
CompanySchema.methods.hasRole = function(userId, roles) {
  const member = this.members.find(m => 
    m.user.toString() === userId.toString() && 
    m.status === 'active'
  );
  
  if (!member) return false;
  if (roles.includes('*')) return true;
  return roles.includes(member.role);
};

// Add a method to get primary location
CompanySchema.methods.getPrimaryLocation = function() {
  return this.locations.find(loc => loc.isPrimary) || this.locations[0] || null;
};

// Add a method to get company address as string
CompanySchema.methods.getAddressString = function() {
  const loc = this.getPrimaryLocation() || this.contact;
  if (!loc) return '';
  
  const parts = [
    loc.address?.street,
    loc.address?.city,
    loc.address?.state,
    loc.address?.postalCode,
    loc.address?.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

module.exports = mongoose.model('Company', CompanySchema);
