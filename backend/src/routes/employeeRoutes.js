const express = require('express');
const { createEmployee } = require('../controllers/employeeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createEmployee);

module.exports = router;