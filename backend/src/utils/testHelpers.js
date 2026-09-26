require('dotenv').config();
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
} = require('./helpers');

async function test() {
  const password = 'admin123';

  const hashed = await hashPassword(password);
  console.log('Hashed password:', hashed);

  const isMatch = await comparePassword(password, hashed);
  console.log('Password match:', isMatch);

  const token = generateToken({
    userId: 1,
    email: 'admin@company.com',
    role: 'Admin'
  });
  console.log('Generated token:', token);

  const decoded = verifyToken(token);
  console.log('Decoded token:', decoded);
}

test();