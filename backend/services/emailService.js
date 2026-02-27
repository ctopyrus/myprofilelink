const sgMail = require('@sendgrid/mail');

// ==============================
// Configure SendGrid
// ==============================
if (!process.env.SENDGRID_API_KEY) {
  console.warn('[email] SENDGRID_API_KEY is not set. Email delivery is disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function getClientUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5173';
}

function mapEmailProviderError(err) {
  const providerStatus =
    err?.response?.statusCode ||
    err?.code ||
    err?.statusCode ||
    err?.response?.body?.errors?.[0]?.field;
  const providerMessage = String(
    err?.response?.body?.errors?.[0]?.message || err?.message || ''
  ).toLowerCase();

  if (
    providerStatus === 401 ||
    providerMessage.includes('authorization grant is invalid') ||
    providerMessage.includes('invalid api key') ||
    providerMessage.includes('expired') ||
    providerMessage.includes('revoked')
  ) {
    const error = new Error('Email provider authentication failed. Please contact support.');
    error.statusCode = 502;
    return error;
  }

  if (providerStatus === 403) {
    const error = new Error('Email sender is not authorized. Please contact support.');
    error.statusCode = 502;
    return error;
  }

  if (providerStatus === 429) {
    const error = new Error('Email service is rate-limited. Please try again shortly.');
    error.statusCode = 429;
    return error;
  }

  const error = new Error('Unable to send verification email right now. Please try again.');
  error.statusCode = 502;
  return error;
}

// ==============================
// Core Email Sender
// ==============================
async function sendEmail({ to, subject, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    const error = new Error('Email service is not configured.');
    error.statusCode = 503;
    throw error;
  }

  if (!process.env.FROM_EMAIL) {
    const error = new Error('FROM_EMAIL is not configured.');
    error.statusCode = 500;
    throw error;
  }

  try {
    await sgMail.send({
      to,
      from: process.env.FROM_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('SendGrid Error:', err.response?.body || err.message);
    throw mapEmailProviderError(err);
  }
}

// ==============================
// Verification Email
// ==============================
function sendVerificationEmail(email, token, code) {
  const verifyUrl = `${getClientUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const codeHtml = code
    ? `<p>Verification code (optional): <strong>${code}</strong></p>`
    : '';

  return sendEmail({
    to: email,
    subject: 'Verify your email',
    html: `
      <p>Welcome to MyProfileLink.</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      ${codeHtml}
    `,
  });
}

// ==============================
// Password Reset Email
// ==============================
function sendPasswordResetEmail(email, token) {
  const resetUrl = `${getClientUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <p>We received a password reset request.</p>
      <p>Use the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}

// ==============================
// Export Functions
// ==============================
module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
