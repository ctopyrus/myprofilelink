const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  stripeSubscriptionId: String,
  currentPeriodEnd: Date
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
