const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecotrackai', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // The new password
    const newPassword = 'admin123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the admin user
    const result = await usersCollection.updateOne(
      { email: 'admin@example.com' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ Admin user not found. Creating one...');
      
      // Create admin user if it doesn't exist
      await usersCollection.insertOne({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created new admin user');
    } else {
      console.log('✅ Updated admin password');
    }
    
    // Verify the password works
    const user = await usersCollection.findOne({ email: 'admin@example.com' });
    const isMatch = await bcrypt.compare(newPassword, user.password);
    
    if (!isMatch) {
      throw new Error('Password verification failed after update!');
    }
    
    console.log('\n🎉 Admin credentials:');
    console.log('===================');
    console.log('Email:    admin@example.com');
    console.log('Password: admin123');
    console.log('===================\n');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.code === 11000) {
      console.log('\n💡 Duplicate key error. Try dropping the users collection and run again.');
    }
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed.');
    }
  }
}

// Run the function
resetAdminPassword();
