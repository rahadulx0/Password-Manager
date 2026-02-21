import { Router } from 'express';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import Password from '../models/Password.js';
import authMiddleware from '../middleware/auth.js';
import { generateOtp, sendOtpEmail } from '../utils/mailer.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ─── Update Profile (name & username) ───────────────────

router.put('/profile', async (req, res) => {
  try {
    const { name, username } = req.body;

    if (!name || !username) {
      return res.status(400).json({ message: 'Name and username are required' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be 3-30 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.userId },
    });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), username: username.toLowerCase() },
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      categories: user.categories || [],
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Change Email: Send OTP ─────────────────────────────

router.post('/change-email/send-otp', async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: 'New email and password are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const existingEmail = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    await Otp.deleteMany({ email: newEmail.toLowerCase(), purpose: 'email-change' });

    const code = generateOtp();
    await Otp.create({
      email: newEmail.toLowerCase(),
      code,
      purpose: 'email-change',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(newEmail, code, 'email-change');

    res.json({ message: 'Verification code sent to your new email' });
  } catch (err) {
    console.error('Change email send OTP error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Change Email: Verify OTP ───────────────────────────

router.post('/change-email/verify', async (req, res) => {
  try {
    const { newEmail, code } = req.body;

    if (!newEmail || !code) {
      return res.status(400).json({ message: 'New email and code are required' });
    }

    const otpEntry = await Otp.findOne({ email: newEmail.toLowerCase(), purpose: 'email-change' });
    if (!otpEntry) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one' });
    }
    if (otpEntry.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteMany({ email: newEmail.toLowerCase(), purpose: 'email-change' });
      return res.status(400).json({ message: 'Code expired. Please request a new one' });
    }

    const existingEmail = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { email: newEmail.toLowerCase() },
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    await Otp.deleteMany({ email: newEmail.toLowerCase(), purpose: 'email-change' });

    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      categories: user.categories || [],
    });
  } catch (err) {
    console.error('Change email verify error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Change Password ────────────────────────────────────

router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Toggle 2FA ─────────────────────────────────────────

router.put('/two-factor', async (req, res) => {
  try {
    const { enabled, password } = req.body;

    if (typeof enabled !== 'boolean' || !password) {
      return res.status(400).json({ message: 'Enabled status and password are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.twoFactorEnabled = enabled;
    await user.save();

    res.json({
      message: enabled ? '2-step verification enabled' : '2-step verification disabled',
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    console.error('Toggle 2FA error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Category Management ────────────────────────────

const DEFAULT_CATEGORIES = [
  { value: 'social', label: 'Social', icon: 'Globe' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'finance', label: 'Finance', icon: 'Landmark' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { value: 'work', label: 'Work', icon: 'Briefcase' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Gamepad2' },
  { value: 'other', label: 'Other', icon: 'Key' },
];

async function ensureCategories(user) {
  if (!user.categories || user.categories.length === 0) {
    user.categories = DEFAULT_CATEGORIES;
    await user.save();
  }
  return user;
}

function generateSlug(label, existingValues) {
  let base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!base) base = 'category';
  let slug = base;
  let counter = 2;
  while (existingValues.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

// Add category
router.post('/categories', async (req, res) => {
  try {
    const { label, icon } = req.body;

    if (!label || !icon) {
      return res.status(400).json({ message: 'Label and icon are required' });
    }
    if (label.trim().length === 0 || label.trim().length > 30) {
      return res.status(400).json({ message: 'Label must be 1-30 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await ensureCategories(user);

    if (user.categories.length >= 20) {
      return res.status(400).json({ message: 'Maximum 20 categories allowed' });
    }

    const existingValues = user.categories.map((c) => c.value);
    const value = generateSlug(label.trim(), existingValues);

    user.categories.push({ value, label: label.trim(), icon });
    await user.save();

    res.json({ categories: user.categories });
  } catch (err) {
    console.error('Add category error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/categories/:value', async (req, res) => {
  try {
    const { label, icon } = req.body;
    const { value } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await ensureCategories(user);

    const cat = user.categories.find((c) => c.value === value);
    if (!cat) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (label !== undefined) {
      if (label.trim().length === 0 || label.trim().length > 30) {
        return res.status(400).json({ message: 'Label must be 1-30 characters' });
      }
      cat.label = label.trim();
    }
    if (icon !== undefined) {
      if (!icon) {
        return res.status(400).json({ message: 'Icon cannot be empty' });
      }
      cat.icon = icon;
    }

    await user.save();

    res.json({ categories: user.categories });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/categories/:value', async (req, res) => {
  try {
    const { value } = req.params;

    if (value === 'other') {
      return res.status(400).json({ message: 'Cannot delete the "other" category' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await ensureCategories(user);

    const catIndex = user.categories.findIndex((c) => c.value === value);
    if (catIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    user.categories.splice(catIndex, 1);
    await user.save();

    // Reassign passwords from deleted category to "other"
    await Password.updateMany(
      { user: req.userId, category: value },
      { category: 'other' },
    );

    res.json({ categories: user.categories });
  } catch (err) {
    console.error('Delete category error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Delete Account ─────────────────────────────────────

router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Delete all user's passwords and the user account
    await Password.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
