const User = require('../models/User');
const PendingSignup = require('../models/PendingSignup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');

const PENDING_SIGNUP_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_USER_STYLE = {
  layoutMode: 'list',
  fontFamily: 'Inter',
  backgroundColor: '#ffffff',
  textColor: '#000000',
};

const sanitizeUser = (userDoc) => {
  const user = userDoc && typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  delete user.passwordHash;
  delete user.refreshToken;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeUsername = (username) => String(username || '').trim();
const isTransientDbError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  const name = String(error?.name || '').toLowerCase();

  return (
    name.includes('mongonetworkerror') ||
    name.includes('mongoserverselectionerror') ||
    message.includes('buffering timed out') ||
    message.includes('eai_again') ||
    message.includes('topology is closed') ||
    message.includes('connection closed')
  );
};


// ==============================
// Password Validation
// ==============================
const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain lowercase letters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase letters' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain numbers' };
  if (!/[@$!%*?&]/.test(password)) return { valid: false, message: 'Password must contain special characters (@$!%*?&)' };
  return { valid: true };
};


// ==============================
// Token Generators
// ==============================
const generateAccessToken = (user) =>
  jwt.sign(
    { uid: user.uid, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { uid: user.uid },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );


// ==============================
// SIGNUP
// ==============================
exports.signup = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const username = normalizeUsername(req.body.username);
  const { password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email, username, and password are required',
    });
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ success: false, error: passwordCheck.message });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser?.emailVerified) {
    return res.status(400).json({ success: false, error: 'Email or Username already taken' });
  }

  let legacyUnverifiedUserId = null;
  // Backward compatibility: move legacy unverified users into the new pending flow.
  if (existingUser && !existingUser.emailVerified) {
    if (existingUser.email !== email || existingUser.username !== username) {
      return res.status(400).json({ success: false, error: 'Email or Username already taken' });
    }
    legacyUnverifiedUserId = existingUser._id;
  }

  const now = new Date();
  await PendingSignup.deleteMany({
    $or: [{ email }, { username }],
    expiresAt: { $lte: now },
  });

  const [pendingByEmail, pendingByUsername] = await Promise.all([
    PendingSignup.findOne({ email, expiresAt: { $gt: now } }),
    PendingSignup.findOne({ username, expiresAt: { $gt: now } }),
  ]);

  if (pendingByEmail && pendingByEmail.username !== username) {
    return res.status(400).json({ success: false, error: 'Email or Username already taken' });
  }

  if (pendingByUsername && pendingByUsername.email !== email) {
    return res.status(400).json({ success: false, error: 'Email or Username already taken' });
  }

  const existingPending =
    (pendingByEmail && pendingByEmail.username === username && pendingByEmail) ||
    (pendingByUsername && pendingByUsername.email === email && pendingByUsername) ||
    null;

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationCode = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + PENDING_SIGNUP_TTL_MS);

  await PendingSignup.findOneAndUpdate(
    { email, username },
    {
      uid: existingPending?.uid || crypto.randomUUID(),
      email,
      username,
      passwordHash,
      displayName: username,
      verificationToken,
      verificationCode,
      expiresAt,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (legacyUnverifiedUserId) {
    await User.deleteOne({ _id: legacyUnverifiedUserId });
  }

  await sendVerificationEmail(email, verificationToken, verificationCode);

  res.status(200).json({
    success: true,
    message: 'Verification email sent. Please verify to finish signup.',
  });
});


// ==============================
// VERIFY EMAIL
// ==============================
exports.verifyEmail = asyncHandler(async (req, res) => {
  try {
    const token = req.query.token || req.params.token || req.body?.token;
    const code = req.query.code || req.body?.code;

    if (!token && !code) {
      return res.status(400).json({ success: false, error: 'Verification token is required' });
    }

    let pendingSignup = null;
    if (token) {
      pendingSignup = await PendingSignup.findOne({
        verificationToken: token,
        expiresAt: { $gt: new Date() },
      });
    } else if (code) {
      pendingSignup = await PendingSignup.findOne({
        verificationCode: String(code).trim(),
        expiresAt: { $gt: new Date() },
      });
    }

    if (pendingSignup) {
      const existingUser = await User.findOne({
        $or: [{ email: pendingSignup.email }, { username: pendingSignup.username }],
      });

      if (existingUser) {
        if (
          existingUser.email === pendingSignup.email &&
          existingUser.username === pendingSignup.username &&
          !existingUser.emailVerified
        ) {
          existingUser.emailVerified = true;
          existingUser.verificationToken = undefined;
          await existingUser.save();
        } else {
          return res.status(409).json({
            success: false,
            error: 'Email or Username already taken. Please sign up again.',
          });
        }
      } else {
        try {
          await User.create({
            uid: pendingSignup.uid || crypto.randomUUID(),
            email: pendingSignup.email,
            username: pendingSignup.username,
            passwordHash: pendingSignup.passwordHash,
            displayName: pendingSignup.displayName || pendingSignup.username,
            emailVerified: true,
            style: DEFAULT_USER_STYLE,
          });
        } catch (error) {
          if (error.code === 11000) {
            return res.status(409).json({
              success: false,
              error: 'Email or Username already taken. Please sign up again.',
            });
          }
          throw error;
        }
      }

      await PendingSignup.deleteMany({
        $or: [{ email: pendingSignup.email }, { username: pendingSignup.username }],
      });

      return res.json({ success: true, message: 'Email verified successfully' });
    }

    // Legacy fallback for old verification links tied to User.verificationToken.
    if (token) {
      const user = await User.findOne({ verificationToken: token });
      if (user) {
        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' });
      }
    }

    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  } catch (error) {
    if (isTransientDbError(error)) {
      return res.status(503).json({
        success: false,
        error: 'Verification service is temporarily unavailable. Please try again in a minute.',
      });
    }
    throw error;
  }
});


// ==============================
// LOGIN
// ==============================
exports.login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide credentials' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    const pendingSignup = await PendingSignup.findOne({
      email,
      expiresAt: { $gt: new Date() },
    });

    if (pendingSignup) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email first',
        needsVerification: true,
      });
    }

    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your email first',
      needsVerification: true
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Rotate refresh tokens (max 5)
  const refreshTokens = user.refreshToken || [];
  if (refreshTokens.length >= 5) refreshTokens.shift();
  refreshTokens.push(refreshToken);

  user.refreshToken = refreshTokens;
  await user.save();

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    accessToken,
    user: sanitizeUser(user)
  });
});


// ==============================
// REFRESH TOKEN
// ==============================
exports.refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ success: false, error: 'No refresh token' });
  }

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production'
  });

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const filteredTokens = user.refreshToken.filter(rt => rt !== refreshToken);

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    async (err, decoded) => {
      if (err || user.uid !== decoded.uid) {
        user.refreshToken = filteredTokens;
        await user.save();
        return res.status(403).json({ success: false, error: 'Invalid token' });
      }

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      user.refreshToken = [...filteredTokens, newRefreshToken];
      await user.save();

      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ success: true, accessToken });
    }
  );
});


// ==============================
// LOGOUT
// ==============================
exports.logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = user.refreshToken.filter(rt => rt !== refreshToken);
    await user.save();
  }

  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(204).json({ success: true });
});


// ==============================
// FORGOT PASSWORD
// ==============================
exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If exists, email sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();
  await sendPasswordResetEmail(email, resetToken);

  res.json({ success: true, message: 'If exists, email sent.' });
});


// ==============================
// RESET PASSWORD
// ==============================
exports.resetPassword = asyncHandler(async (req, res) => {
  const token = req.body.token || req.params.token;
  const { newPassword } = req.body;

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) {
    return res.status(400).json({ success: false, error: passwordCheck.message });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.emailVerified = true;

  await user.save();

  res.json({ success: true, message: 'Password reset successful.' });
});


// ==============================
// GET CURRENT USER
// ==============================
exports.getMe = (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
};


// ==============================
// TEST EMAIL (Dev Only)
// ==============================
exports.testEmail = asyncHandler(async (req, res) => {
  await sendVerificationEmail(req.query.email, 'test-token', '123456');
  res.json({ success: true });
});
