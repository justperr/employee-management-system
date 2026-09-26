const sql = require('mssql');
const { getPool } = require('../config/database');

async function createEmployee(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hireDate,
      salary,
      departmentId,
      positionId,
      status
    } = req.body;

    if (!firstName || !lastName || !email || !hireDate || !departmentId || !positionId) {
      return res.status(400).json({
        message: 'First name, last name, email, hire date, department, and position are required'
      });
    }

    const pool = getPool();

    const existingEmployee = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT EmployeeId FROM Employees WHERE Email = @email');

    if (existingEmployee.recordset.length > 0) {
      return res.status(400).json({
        message: 'Employee email already exists'
      });
    }

    await pool
      .request()
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone || null)
      .input('dateOfBirth', sql.Date, dateOfBirth || null)
      .input('hireDate', sql.Date, hireDate)
      .input('salary', sql.Decimal(10, 2), salary || null)
      .input('departmentId', sql.Int, departmentId)
      .input('positionId', sql.Int, positionId)
      .input('status', sql.NVarChar, status || 'Active')
      .query(`
        INSERT INTO Employees
        (FirstName, LastName, Email, Phone, DateOfBirth, HireDate, Salary, DepartmentId, PositionId, Status)
        VALUES
        (@firstName, @lastName, @email, @phone, @dateOfBirth, @hireDate, @salary, @departmentId, @positionId, @status)
      `);

    return res.status(201).json({
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Create employee error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function getEmployees(req, res) {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        e.EmployeeId,
        e.FirstName,
        e.LastName,
        e.Email,
        e.Phone,
        e.DateOfBirth,
        e.HireDate,
        e.Salary,
        e.Status,
        e.CreatedAt,
        e.UpdatedAt,
        d.DepartmentId,
        d.DepartmentName,
        p.PositionId,
        p.PositionName
      FROM Employees e
      INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
      INNER JOIN Positions p ON e.PositionId = p.PositionId
      ORDER BY e.EmployeeId DESC
    `);

    return res.status(200).json({
      message: 'Employees retrieved successfully',
      data: result.recordset
    });
  } catch (error) {
    console.error('Get employees error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          e.EmployeeId,
          e.FirstName,
          e.LastName,
          e.Email,
          e.Phone,
          e.DateOfBirth,
          e.HireDate,
          e.Salary,
          e.Status,
          e.CreatedAt,
          e.UpdatedAt,
          d.DepartmentId,
          d.DepartmentName,
          p.PositionId,
          p.PositionName
        FROM Employees e
        INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
        INNER JOIN Positions p ON e.PositionId = p.PositionId
        WHERE e.EmployeeId = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      message: 'Employee retrieved successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Get employee by ID error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hireDate,
      salary,
      departmentId,
      positionId,
      status
    } = req.body;

    if (!firstName || !lastName || !email || !hireDate || !departmentId || !positionId) {
      return res.status(400).json({
        message: 'First name, last name, email, hire date, department, and position are required'
      });
    }

    const pool = getPool();

    const existingEmployee = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT EmployeeId FROM Employees WHERE EmployeeId = @id');

    if (existingEmployee.recordset.length === 0) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    const duplicateEmail = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('id', sql.Int, id)
      .query(`
        SELECT EmployeeId
        FROM Employees
        WHERE Email = @email AND EmployeeId <> @id
      `);

    if (duplicateEmail.recordset.length > 0) {
      return res.status(400).json({
        message: 'Employee email already exists'
      });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone || null)
      .input('dateOfBirth', sql.Date, dateOfBirth || null)
      .input('hireDate', sql.Date, hireDate)
      .input('salary', sql.Decimal(10, 2), salary || null)
      .input('departmentId', sql.Int, departmentId)
      .input('positionId', sql.Int, positionId)
      .input('status', sql.NVarChar, status || 'Active')
      .query(`
        UPDATE Employees
        SET
          FirstName = @firstName,
          LastName = @lastName,
          Email = @email,
          Phone = @phone,
          DateOfBirth = @dateOfBirth,
          HireDate = @hireDate,
          Salary = @salary,
          DepartmentId = @departmentId,
          PositionId = @positionId,
          Status = @status,
          UpdatedAt = GETDATE()
        WHERE EmployeeId = @id
      `);

    return res.status(200).json({
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Update employee error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const existingEmployee = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT EmployeeId FROM Employees WHERE EmployeeId = @id');

    if (existingEmployee.recordset.length === 0) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Employees WHERE EmployeeId = @id');

    return res.status(200).json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error.message);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};