// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Adjust the relative path according to your folder structure
// If adminController.js is in `controllers` folder at same level as `routes`:
const adminController = require('../controllers/adminController');

const isAdmin = [protect, authorize('admin')];

// Get all users
router.get('/users', ...isAdmin, adminController.getAllUsers);

// Get all users that are pending approval
router.get(
  '/users/pending-approvals',
  ...isAdmin,
  adminController.getPendingApprovals
);

// Approve a user (uid in body)
router.post('/users/approve', ...isAdmin, adminController.approveUser);

// Reject a user (uid in body)
router.post('/users/reject', ...isAdmin, adminController.rejectUser);

module.exports = router;
