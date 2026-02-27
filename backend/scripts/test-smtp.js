const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sendVerificationEmail } = require('../services/emailService');

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Please provide a target email address.');
  console.log('Usage: node test-smtp.js your-email@example.com');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', `🚀 Attempting to send test email to: ${targetEmail}`);
console.log(`Config: Host=${process.env.SMTP_HOST}, Port=${process.env.SMTP_PORT}, User=${process.env.SMTP_USER}`);

sendVerificationEmail(targetEmail, 'test-cli-token-' + Date.now())
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '✅ Email sent successfully! Check your inbox.');
  })
  .catch((err) => {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to send email:');
    console.error(err);
  });
