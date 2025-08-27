const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      full_name,
      phone,
      address
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to register user'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login'
    });
  }
});

// GET /api/auth/profile - Get user profile (requires authentication)
router.get('/profile', async (req, res) => {
  try {
    // TODO: Add authentication middleware to extract user ID from token
    // For now, using hardcoded user ID
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile'
    });
  }
});

// PUT /api/auth/profile - Update user profile (requires authentication)
router.put('/profile', async (req, res) => {
  try {
    // TODO: Add authentication middleware to extract user ID from token
    // For now, using hardcoded user ID
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';
    
    const { full_name, phone, address } = req.body;

    const user = await User.updateProfile(userId, {
      full_name,
      phone,
      address
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// PUT /api/auth/change-password - Change password (requires authentication)
router.put('/change-password', async (req, res) => {
  try {
    // TODO: Add authentication middleware to extract user ID from token
    // For now, using hardcoded user ID
    const userId = '1919f650-bb52-4d9d-a1c3-3667f57be959';
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // TODO: Verify current password before changing
    // For now, just update the password
    await User.updatePassword(userId, newPassword);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      error: 'Failed to change password'
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // by removing the token from storage
  res.json({
    message: 'Logout successful'
  });
});

module.exports = router;
