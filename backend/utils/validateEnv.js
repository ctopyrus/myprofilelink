module.exports = function validateEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, test, production');
  }

  const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = [];
  if (nodeEnv === 'production') {
    required.push('CLIENT_URL');
  }

  const emailEnabled = process.env.ENABLE_EMAIL === 'true';
  if (emailEnabled) {
    required.push('SENDGRID_API_KEY', 'FROM_EMAIL');
  }

  const stripeEnabled = process.env.ENABLE_STRIPE === 'true';
  if (stripeEnabled) {
    required.push(
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRO_PRICE_ID'
    );
    const hasBusinessPriceId =
      Boolean(process.env.STRIPE_BUSINESS_PRICE_ID) ||
      Boolean(process.env.STRIPE_ENTERPRISE_PRICE_ID);
    if (!hasBusinessPriceId) {
      missing.push('STRIPE_BUSINESS_PRICE_ID (or STRIPE_ENTERPRISE_PRICE_ID)');
    }
  }

  missing.push(...required.filter((key) => !process.env[key]));
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};
