const express = require('express');
const {
  getEmployeeDirectoryReport,
  getDepartmentHeadcountReport,
  getSalarySummaryReport
} = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/employee-directory', authMiddleware, getEmployeeDirectoryReport);
router.get('/department-headcount', authMiddleware, getDepartmentHeadcountReport);
router.get('/salary-summary', authMiddleware, getSalarySummaryReport);

module.exports = router;