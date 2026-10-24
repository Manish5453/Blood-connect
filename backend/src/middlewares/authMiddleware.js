const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1].trim();
      const secret = process.env.JWT_SECRET || 'blood_connect_super_secret_key_2026';
      
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next(); // <--- Make sure yeh next() ho, bina brackets ke mat likhna!
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const preventAdminAction = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return res.status(403).json({
      message: 'Admin account is restricted from placing emergency blood requests.',
    });
  }
  return next();
};

module.exports = { protect, preventAdminAction };