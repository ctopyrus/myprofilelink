
const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');


// Create order
router.post('/order', paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

router.post('/checkout', protect, createCheckoutSession);


router.post('/manual-claim', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = req.user;

    // Validate Plan
    if (!['pro', 'business'].includes(plan)) {
        return res.status(400).json({ success: false, error: 'Invalid plan' });
    }

    user.plan = plan;
    user.subscriptionStatus = 'pending_approval'; // Admin must approve payment
    user.paymentStatus = 'pending';
    
    // Add claim record
    user.paymentClaims.push({
        plan,
        amount: plan === 'pro' ? 399 : 699,
        status: 'pending'
    });

    await user.save();

    res.json({ success: true, message: 'Payment claim submitted. Waiting for approval.' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
