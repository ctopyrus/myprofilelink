
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/verify-email', authController.verifyEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected Routes
router.get('/me', authMiddleware.protect, authController.getMe);
router.get('/test-email', authController.testEmail);

module.exports = router;
