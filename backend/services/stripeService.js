let stripeClient = null;

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Stripe is not configured.');
    err.statusCode = 503;
    throw err;
  }

  if (stripeClient) return stripeClient;

  let Stripe;
  try {
    Stripe = require('stripe');
  } catch (error) {
    const err = new Error(
      "Stripe SDK is not installed. Run 'npm install stripe' in backend."
    );
    err.statusCode = 500;
    throw err;
  }

  stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

exports.createCheckoutSession = async (user, plan) => {
  const stripe = getStripeClient();
  const priceId = getPriceId(plan);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    metadata: {
      userId: user._id.toString(),
      plan
    }
  });

  return session;
};

function getPriceId(plan) {
  if (plan === 'pro') {
    if (!process.env.STRIPE_PRO_PRICE_ID) {
      const err = new Error('STRIPE_PRO_PRICE_ID is not configured.');
      err.statusCode = 503;
      throw err;
    }
    return process.env.STRIPE_PRO_PRICE_ID;
  }
  if (plan === 'business') {
    const businessPriceId = process.env.STRIPE_BUSINESS_PRICE_ID || process.env.STRIPE_ENTERPRISE_PRICE_ID;
    if (!businessPriceId) {
      const err = new Error('STRIPE_BUSINESS_PRICE_ID is not configured.');
      err.statusCode = 503;
      throw err;
    }
    return businessPriceId;
  }
  throw new Error('Invalid plan selected');
}
