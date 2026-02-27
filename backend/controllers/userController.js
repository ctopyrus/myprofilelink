
const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { blocks, style, displayName, bio, username, avatarUrl, customDomain } = req.body;
    
    // Admin or Owner check is handled by middleware
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (blocks) user.blocks = blocks;
    if (style) user.style = style;
    if (displayName) user.displayName = displayName;
    if (bio) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (typeof customDomain === 'string') {
      user.customDomain = customDomain.trim().toLowerCase();
    }
    
    // Username change logic (simplified)
    if (username && username !== user.username) {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ success: false, error: 'Username taken' });
        user.username = username;
    }

    await user.save();
    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, error: 'Profile not found' });
    
    // Only return public data
    const publicData = {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        blocks: user.blocks,
        style: user.style,
        plan: user.plan,
        isVerified: user.plan !== 'free'
    };

    res.json({ success: true, profile: publicData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
