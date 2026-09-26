const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You have accessed a protected route',
    user: req.user
  });
});

router.get('/admin-only', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: 'Welcome Admin',
    user: req.user
  });
});

module.exports = router;