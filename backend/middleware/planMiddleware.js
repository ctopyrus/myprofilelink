const Subscription = require('../models/Subscription');

// Middleware to check plan limits and subscription
exports.checkPlanLimits = async (req, res, next) => {
  try {
    // Admins are not limited by plan restrictions.
    if (req.user.role === 'admin') {
      return next();
    }

    // Free users are allowed but must respect free-tier block limits.
    if (req.user.plan === 'free') {
      const newBlocks = req.body.blocks || [];
      const restrictedTypes = ['link', 'product', 'media'];
      const restrictedCount = newBlocks.filter((b) => restrictedTypes.includes(b.type)).length;

      if (restrictedCount > 1) {
        return res.status(403).json({
          success: false,
          error: 'Free plan limit reached. Upgrade to add more links or media.',
          upgradeRequired: true,
        });
      }
      return next();
    }

    // Paid plans must have an active subscription.
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || subscription.status !== 'active') {
      return res.status(403).json({ success: false, error: 'No active subscription' });
    }

    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < Date.now()) {
      subscription.status = 'expired';
      await subscription.save();
      return res.status(403).json({ success: false, error: 'Subscription expired' });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
