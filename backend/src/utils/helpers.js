const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare plain password with hashed password
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
}

// Verify JWT token
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};