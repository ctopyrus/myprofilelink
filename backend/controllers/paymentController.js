const stripeService = require('../services/stripeService');
const asyncHandler = require('../utils/asyncHandler');

exports.createPaymentOrder = async (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'Legacy order API has been retired. Use /api/payment/checkout.',
  });
};

exports.verifyPayment = async (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'Legacy verify API has been retired. Use Stripe webhook confirmation.',
  });
};

exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  try {
    const { plan } = req.body;

    const session = await stripeService.createCheckoutSession(req.user, plan);

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    return next(error);
  }
});
