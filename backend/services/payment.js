const createOrder = async () => {
  const error = new Error('Legacy order flow is disabled. Use Stripe checkout.');
  error.statusCode = 410;
  throw error;
};

const verifyPayment = async () => {
  const error = new Error('Legacy verify flow is disabled. Use Stripe webhook events.');
  error.statusCode = 410;
  throw error;
};

module.exports = {
  createOrder,
  verifyPayment,
};
