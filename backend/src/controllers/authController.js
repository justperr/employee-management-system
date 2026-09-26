const sql = require('mssql');
const { getPool } = require('../config/database');
const { comparePassword, generateToken, hashPassword } = require('../utils/helpers');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const pool = getPool();

    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      return res.status(403).json({
        message: 'User account is inactive'
      });
    }

    const isMatch = await comparePassword(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = generateToken({
      userId: user.UserId,
      email: user.Email,
      role: user.Role
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user.UserId,
        email: user.Email,
        role: user.Role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function register(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: 'Email, password, and role are required'
      });
    }

    const pool = getPool();

    const existingUser = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserId FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await hashPassword(password);

    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, role)
      .query(`
        INSERT INTO Users (Email, PasswordHash, Role)
        VALUES (@email, @passwordHash, @role)
      `);

    return res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

module.exports = {
  login,
  register
};