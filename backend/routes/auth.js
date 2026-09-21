import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import crypto from 'crypto';

const router = express.Router();

// টেলিগ্রাম অথেন্টিকেশন
router.post('/telegram-login', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username, photoUrl } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID required' });
    }

    let user = await User.findOne({ telegramId });

    if (!user) {
      // নতুন ইউজার তৈরি করো
      user = new User({
        telegramId,
        username: username || `user_${telegramId}`,
        authMethod: 'telegram',
        isVerified: true,
        preferences: {
          language: 'bn',
          currency: 'BDT'
        }
      });
      await user.save();
    }

    // JWT টোকেন তৈরি করো
    const token = jwt.sign(
      { userId: user._id, telegramId: user.telegramId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        walletBalance: user.walletBalance,
        telegramId: user.telegramId
      }
    });
  } catch (error) {
    console.error('Telegram login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ওয়েব সাইনআপ
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // ইমেইল চেক করো
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // পাসওয়ার্ড হ্যাশ করো
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      username,
      passwordHash,
      authMethod: 'email'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// ওয়েব লগইন
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// মিডলওয়্যার - টোকেন ভেরিফাই করো
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ইউজার প্রোফাইল
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
