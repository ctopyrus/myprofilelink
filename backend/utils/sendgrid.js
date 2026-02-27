const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set. Emails will be skipped.');
}

const sendEmail = async (options) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not set. Email skipped.');
    return;
  }

  const msg = {
    to: options.email,
    from: process.env.FROM_EMAIL || 'business@myprofilelink.in',
    subject: options.subject,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('SendGrid Error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = sendEmail;
