module.exports = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email first' });
  }

  // Admins bypass payment/approval checks for their own tools
  if (req.user.role === 'admin') return next();

  if (req.user.paymentStatus !== 'paid' && req.user.plan !== 'free') {
    return res.status(403).json({ error: 'Payment required' });
  }

  if (!req.user.approved) {
    return res.status(403).json({ error: 'Account pending admin approval' });
  }

  next();
};