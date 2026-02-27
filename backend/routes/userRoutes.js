
const express = require('express');
const router = express.Router();
const { updateProfile, getPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkPlanLimits } = require('../middleware/planMiddleware');

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});
router.get('/public/:username', getPublicProfile);
router.put('/update', protect, checkPlanLimits, updateProfile);

const Subscription = require("../models/Subscription");

router.get("/subscription", protect, async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id });

  if (!subscription) {
    return res.json({
      plan: "free",
      status: "inactive"
    });
  }

  res.json(subscription);
});

module.exports = router;
