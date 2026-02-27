const crypto = require('crypto');

module.exports = function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
};