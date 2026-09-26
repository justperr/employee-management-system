const express = require('express');
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getDepartments);
router.get('/:id', authMiddleware, getDepartmentById);
router.post('/', authMiddleware, adminMiddleware, createDepartment);
router.put('/:id', authMiddleware, adminMiddleware, updateDepartment);
router.delete('/:id', authMiddleware, adminMiddleware, deleteDepartment);

module.exports = router;