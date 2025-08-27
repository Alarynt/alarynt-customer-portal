import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/alarynt-rules', {
  retryWrites: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
});

// User Schema (same as in the backend)
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Manager', 'User', 'Viewer']
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function addTestUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@alarynt.com' });
    if (existingUser) {
      console.log('User already exists, updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update the password
      existingUser.password = hashedPassword;
      existingUser.updatedAt = new Date();
      await existingUser.save();
      
      console.log('✅ User password updated successfully');
      console.log('Email: admin@alarynt.com');
      console.log('Password: admin123');
    } else {
      // Create new user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newUser = new User({
        id: uuidv4(),
        email: 'admin@alarynt.com',
        name: 'System Administrator',
        company: 'Alarynt',
        role: 'Admin',
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newUser.save();
      console.log('✅ User created successfully');
      console.log('Email: admin@alarynt.com');
      console.log('Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addTestUser(); 