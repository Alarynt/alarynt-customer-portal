import mongoose from 'mongoose';

// User Schema
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

// Activity Schema
const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'error', 'info']
  },
  user: String,
  userId: String,
  ruleName: String,
  ruleId: String,
  actionName: String,
  actionId: String,
  details: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const Activity = mongoose.model('Activity', activitySchema);

// Export schemas object for backward compatibility
export const schemas = {
  User,
  Activity
}; 