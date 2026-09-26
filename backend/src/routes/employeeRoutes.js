const express = require('express');
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getEmployees);
router.get('/:id', authMiddleware, getEmployeeById);
router.post('/', authMiddleware, adminMiddleware, createEmployee);
router.put('/:id', authMiddleware, adminMiddleware, updateEmployee);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEmployee);

module.exports = router;