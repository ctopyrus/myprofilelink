const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

let stripeClient = null;
function getStripeClient() {
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

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    await Payment.create({
      user: userId,
      amount: session.amount_total / 100,
      currency: session.currency,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      status: 'completed'
    });

    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        plan,
        status: 'active',
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: new Date(session.current_period_end * 1000)
      },
      { upsert: true, new: true }
    );
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { status: 'cancelled' }
    );
  }

  res.json({ received: true });
};
