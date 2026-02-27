
const mongoose = require('mongoose');

const PaymentClaimSchema = new mongoose.Schema({
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  claimedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminNote: String
});

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: String,
  bio: String,
  avatarUrl: String,
  customDomain: String,
  
  // Custom Style & Blocks
  blocks: { type: Array, default: [] },
  style: { type: Object, default: {} },
  
  // Subscription & Lifecycle
  plan: { 
    type: String, 
    enum: ['free', 'pro', 'business'], 
    default: 'free' 
  },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'past_due', 'cancelled', 'pending', 'pending_approval', 'rejected'], 
    default: 'active' 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  
  // Verification & Approval
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Auth & Security
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshToken: [String], // Array for multi-device support, strict rotation
  approved: { type: Boolean, default: false },
  
  // Usage tracking
  aiGenerationCount: { type: Number, default: 0 },
  paymentClaims: [PaymentClaimSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
