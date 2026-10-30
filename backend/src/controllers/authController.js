const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'blood_connect_super_secret_key_2026';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, bloodGroup, city } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created through public registration' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      phone: phone || '',
      role: role || 'donor',
      bloodGroup: role === 'hospital' ? 'All' : bloodGroup || '',
      city: city || ''
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        city: user.city,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login User
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'User not found with this email. Please register first!' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password! Please check your password.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bloodGroup: user.bloodGroup,
      phone: user.phone,
      city: user.city,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser
};
