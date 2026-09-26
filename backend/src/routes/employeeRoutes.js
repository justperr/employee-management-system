const express = require('express');
const {
  createEmployee,
  getEmployees,
  getEmployeeById
} = require('../controllers/employeeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getEmployees);
router.get('/:id', authMiddleware, getEmployeeById);
router.post('/', authMiddleware, adminMiddleware, createEmployee);

module.exports = router;