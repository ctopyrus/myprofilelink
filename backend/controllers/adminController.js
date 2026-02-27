// routes/controllers/adminController.js (adjust path as you use)
const User = require('../models/User');
const sendEmail = require('../utils/sendgrid');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get users whose payment is done but need approval
exports.getPendingApprovals = async (req, res) => {
  try {
    const users = await User.find({
      subscriptionStatus: 'pending_approval',
    }).select('-passwordHash');

    res.json({ success: true, users });
  } catch (err) {
    console.error('Error in getPendingApprovals:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res
        .status(400)
        .json({ success: false, error: 'uid is required' });
    }

    const user = await User.findOne({ uid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: 'User not found' });
    }

    user.approved = true;
    user.subscriptionStatus = 'active';
    await user.save();

    // Send Notification
    try {
      await sendEmail({
        email: user.email,
        subject: 'Account Approved - MyProfileLink',
        html: `<p>Your account upgrade has been approved! You now have access to ${user.plan} features.</p>`,
      });
    } catch (emailErr) {
      console.error('Error sending approval email:', emailErr);
      // Don't fail the whole request because of email
    }

    res.json({ success: true, message: 'User approved' });
  } catch (err) {
    console.error('Error in approveUser:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Reject user
exports.rejectUser = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res
        .status(400)
        .json({ success: false, error: 'uid is required' });
    }

    const user = await User.findOne({ uid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: 'User not found' });
    }

    user.subscriptionStatus = 'rejected';
    user.plan = 'free';
    await user.save();

    res.json({ success: true, message: 'User rejected' });
  } catch (err) {
    console.error('Error in rejectUser:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
