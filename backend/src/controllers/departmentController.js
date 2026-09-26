const sql = require('mssql');
const { getPool } = require('../config/database');

async function getDepartments(req, res) {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        DepartmentId,
        DepartmentName,
        Description,
        CreatedAt,
        UpdatedAt
      FROM Departments
      ORDER BY DepartmentId DESC
    `);

    return res.status(200).json({
      message: 'Departments retrieved successfully',
      data: result.recordset
    });
  } catch (error) {
    console.error('Get departments error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function getDepartmentById(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          DepartmentId,
          DepartmentName,
          Description,
          CreatedAt,
          UpdatedAt
        FROM Departments
        WHERE DepartmentId = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    return res.status(200).json({
      message: 'Department retrieved successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Get department by ID error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function createDepartment(req, res) {
  try {
    const { departmentName, description } = req.body;

    if (!departmentName) {
      return res.status(400).json({
        message: 'Department name is required'
      });
    }

    const pool = getPool();

    const existingDepartment = await pool
      .request()
      .input('departmentName', sql.NVarChar, departmentName)
      .query(`
        SELECT DepartmentId
        FROM Departments
        WHERE DepartmentName = @departmentName
      `);

    if (existingDepartment.recordset.length > 0) {
      return res.status(400).json({
        message: 'Department name already exists'
      });
    }

    await pool
      .request()
      .input('departmentName', sql.NVarChar, departmentName)
      .input('description', sql.NVarChar, description || null)
      .query(`
        INSERT INTO Departments (DepartmentName, Description)
        VALUES (@departmentName, @description)
      `);

    return res.status(201).json({
      message: 'Department created successfully'
    });
  } catch (error) {
    console.error('Create department error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { departmentName, description } = req.body;

    if (!departmentName) {
      return res.status(400).json({
        message: 'Department name is required'
      });
    }

    const pool = getPool();

    const existingDepartment = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT DepartmentId
        FROM Departments
        WHERE DepartmentId = @id
      `);

    if (existingDepartment.recordset.length === 0) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    const duplicateDepartment = await pool
      .request()
      .input('departmentName', sql.NVarChar, departmentName)
      .input('id', sql.Int, id)
      .query(`
        SELECT DepartmentId
        FROM Departments
        WHERE DepartmentName = @departmentName AND DepartmentId <> @id
      `);

    if (duplicateDepartment.recordset.length > 0) {
      return res.status(400).json({
        message: 'Department name already exists'
      });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('departmentName', sql.NVarChar, departmentName)
      .input('description', sql.NVarChar, description || null)
      .query(`
        UPDATE Departments
        SET
          DepartmentName = @departmentName,
          Description = @description,
          UpdatedAt = GETDATE()
        WHERE DepartmentId = @id
      `);

    return res.status(200).json({
      message: 'Department updated successfully'
    });
  } catch (error) {
    console.error('Update department error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const existingDepartment = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT DepartmentId
        FROM Departments
        WHERE DepartmentId = @id
      `);

    if (existingDepartment.recordset.length === 0) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    const relatedEmployees = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT COUNT(*) AS EmployeeCount
        FROM Employees
        WHERE DepartmentId = @id
      `);

    if (relatedEmployees.recordset[0].EmployeeCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete department with assigned employees'
      });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM Departments
        WHERE DepartmentId = @id
      `);

    return res.status(200).json({
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};