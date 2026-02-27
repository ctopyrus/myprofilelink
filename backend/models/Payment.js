const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: Number,
  currency: String,
  stripeSessionId: String,
  stripePaymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  providerSessionId: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);