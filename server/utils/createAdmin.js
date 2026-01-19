// server/utils/createAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with retry logic
    const maxRetries = 3;
    let retries = 0;
    let connected = false;
    
    while (retries < maxRetries && !connected) {
      try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecotrackai', {
          serverSelectionTimeoutMS: 5000
        });
        connected = true;
        console.log('✅ Connected to MongoDB');
      } catch (err) {
        retries++;
        console.log(`❌ Connection attempt ${retries} failed, retrying...`);
        if (retries === maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Check if admin already exists
    console.log('🔍 Checking for existing admin user...');
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('ℹ️  Admin user already exists');
      console.log('   Email: admin@example.com');
      console.log('   Role:', adminExists.role);
      return;
    }

    console.log('👤 Creating new admin user...');
    
    // Create admin with all required fields
    const admin = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      preferences: {
        energyUnit: 'kWh',
        currency: 'USD',
        notifications: {
          anomaly: true,
          tips: true,
          weeklyReport: true
        }
      },
      company: null,
      lastLogin: new Date()
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);

    // Save the admin user
    await admin.save();
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('==============================');
    console.log('🔑 Login Credentials:');
    console.log('Email:    admin@example.com');
    console.log('Password: admin123');
    console.log('==============================\n');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    
    if (err.code === 11000) {
      console.log('\n💡 Duplicate key error. Trying to fix by dropping the collection...');
      try {
        await mongoose.connection.dropCollection('users');
        console.log('✅ Dropped users collection. Please run this script again.');
      } catch (dropErr) {
        console.error('❌ Failed to drop collection:', dropErr.message);
      }
    }
    
  } finally {
    // Close the connection if it's open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
    process.exit(1);
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;