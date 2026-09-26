const { getPool } = require('../config/database');

async function getEmployeeDirectoryReport(req, res) {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        e.EmployeeId,
        e.FirstName,
        e.LastName,
        e.Email,
        e.Phone,
        e.HireDate,
        e.Status,
        d.DepartmentName,
        p.PositionName
      FROM Employees e
      INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
      INNER JOIN Positions p ON e.PositionId = p.PositionId
      ORDER BY e.LastName, e.FirstName
    `);

    return res.status(200).json({
      message: 'Employee directory report generated successfully',
      totalRecords: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Employee directory report error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function getDepartmentHeadcountReport(req, res) {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        d.DepartmentId,
        d.DepartmentName,
        COUNT(e.EmployeeId) AS EmployeeCount
      FROM Departments d
      LEFT JOIN Employees e ON d.DepartmentId = e.DepartmentId
      GROUP BY d.DepartmentId, d.DepartmentName
      ORDER BY d.DepartmentName
    `);

    return res.status(200).json({
      message: 'Department headcount report generated successfully',
      totalDepartments: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Department headcount report error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function getSalarySummaryReport(req, res) {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        d.DepartmentId,
        d.DepartmentName,
        COUNT(e.EmployeeId) AS EmployeeCount,
        ISNULL(SUM(e.Salary), 0) AS TotalSalary,
        ISNULL(AVG(CAST(e.Salary AS DECIMAL(10,2))), 0) AS AverageSalary
      FROM Departments d
      LEFT JOIN Employees e ON d.DepartmentId = e.DepartmentId
      GROUP BY d.DepartmentId, d.DepartmentName
      ORDER BY d.DepartmentName
    `);

    return res.status(200).json({
      message: 'Salary summary report generated successfully',
      totalDepartments: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Salary summary report error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

module.exports = {
  getEmployeeDirectoryReport,
  getDepartmentHeadcountReport,
  getSalarySummaryReport
};