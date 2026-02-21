import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import authMiddleware from '../middleware/auth.js';
import { generateOtp, sendOtpEmail } from '../utils/mailer.js';

const router = Router();

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// ─── Sign Up Flow ───────────────────────────────────────

// Step 1: Send OTP to email for signup
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email, purpose: 'signup' });

    const code = generateOtp();
    await Otp.create({
      email,
      code,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, code, 'signup');

    res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

// Step 2: Verify OTP and create account
router.post('/signup/verify', async (req, res) => {
  try {
    const { name, email, password, code } = req.body;

    if (!name || !email || !password || !code) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const otpEntry = await Otp.findOne({ email, purpose: 'signup' });
    if (!otpEntry) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one' });
    }
    if (otpEntry.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteMany({ email, purpose: 'signup' });
      return res.status(400).json({ message: 'Code expired. Please request a new one' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    await Otp.deleteMany({ email, purpose: 'signup' });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Sign In ────────────────────────────────────────────

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Forgot Password Flow ───────────────────────────────

// Step 1: Send OTP
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email is registered, a code has been sent' });
    }

    await Otp.deleteMany({ email, purpose: 'reset' });

    const code = generateOtp();
    await Otp.create({
      email,
      code,
      purpose: 'reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, code, 'reset');

    res.json({ message: 'If the email is registered, a code has been sent' });
  } catch (err) {
    console.error('Forgot password OTP error:', err.message);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Step 2: Verify OTP
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const otpEntry = await Otp.findOne({ email, purpose: 'reset' });
    if (!otpEntry) {
      return res.status(400).json({ message: 'No reset code found. Please request a new one' });
    }
    if (otpEntry.code !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }
    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteMany({ email, purpose: 'reset' });
      return res.status(400).json({ message: 'Code expired. Please request a new one' });
    }

    // Issue a short-lived reset token
    const resetToken = jwt.sign({ email, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

    await Otp.deleteMany({ email, purpose: 'reset' });

    res.json({ resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 3: Reset password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset link expired. Please start over' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Get current user ───────────────────────────────────

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
