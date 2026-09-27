const { getPool } = require('../config/database');

async function getPositions(req, res) {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        PositionId,
        PositionName,
        DepartmentId
      FROM Positions
      ORDER BY PositionName ASC
    `);

    return res.status(200).json({
      message: 'Positions retrieved successfully',
      data: result.recordset
    });
  } catch (error) {
    console.error('Get positions error:', error.message);

    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function createPosition(req, res) {
  try {
    const { positionName, departmentId } = req.body;

    if (!positionName || !positionName.trim()) {
      return res.status(400).json({
        message: 'Position name is required'
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        message: 'Department is required'
      });
    }

    const pool = getPool();

    // Check if department exists
    const departmentCheck = await pool
      .request()
      .input('departmentId', departmentId)
      .query(`
        SELECT DepartmentId
        FROM Departments
        WHERE DepartmentId = @departmentId
      `);

    if (departmentCheck.recordset.length === 0) {
      return res.status(400).json({
        message: 'Selected department does not exist'
      });
    }

    // Prevent duplicate position names within the same department
    const duplicateCheck = await pool
      .request()
      .input('positionName', positionName.trim())
      .input('departmentId', departmentId)
      .query(`
        SELECT PositionId
        FROM Positions
        WHERE PositionName = @positionName
          AND DepartmentId = @departmentId
      `);

    if (duplicateCheck.recordset.length > 0) {
      return res.status(400).json({
        message:
          'This position already exists in the selected department'
      });
    }

    const result = await pool
      .request()
      .input('positionName', positionName.trim())
      .input('departmentId', departmentId)
      .query(`
        INSERT INTO Positions (
          PositionName,
          DepartmentId
        )
        OUTPUT
          INSERTED.PositionId,
          INSERTED.PositionName,
          INSERTED.DepartmentId
        VALUES (
          @positionName,
          @departmentId
        )
      `);

    return res.status(201).json({
      message: 'Position created successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Create position error:', error.message);

    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function updatePosition(req, res) {
  try {
    const { id } = req.params;
    const { positionName, departmentId } = req.body;

    if (!positionName || !positionName.trim()) {
      return res.status(400).json({
        message: 'Position name is required'
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        message: 'Department is required'
      });
    }

    const pool = getPool();

    // Check if position exists
    const positionCheck = await pool
      .request()
      .input('positionId', id)
      .query(`
        SELECT PositionId
        FROM Positions
        WHERE PositionId = @positionId
      `);

    if (positionCheck.recordset.length === 0) {
      return res.status(404).json({
        message: 'Position not found'
      });
    }

    // Check if department exists
    const departmentCheck = await pool
      .request()
      .input('departmentId', departmentId)
      .query(`
        SELECT DepartmentId
        FROM Departments
        WHERE DepartmentId = @departmentId
      `);

    if (departmentCheck.recordset.length === 0) {
      return res.status(400).json({
        message: 'Selected department does not exist'
      });
    }

    // Prevent duplicate position names within the same department
    const duplicateCheck = await pool
      .request()
      .input('positionId', id)
      .input('positionName', positionName.trim())
      .input('departmentId', departmentId)
      .query(`
        SELECT PositionId
        FROM Positions
        WHERE PositionName = @positionName
          AND DepartmentId = @departmentId
          AND PositionId <> @positionId
      `);

    if (duplicateCheck.recordset.length > 0) {
      return res.status(400).json({
        message:
          'This position already exists in the selected department'
      });
    }

    const result = await pool
      .request()
      .input('positionId', id)
      .input('positionName', positionName.trim())
      .input('departmentId', departmentId)
      .query(`
        UPDATE Positions
        SET
          PositionName = @positionName,
          DepartmentId = @departmentId
        OUTPUT
          INSERTED.PositionId,
          INSERTED.PositionName,
          INSERTED.DepartmentId
        WHERE PositionId = @positionId
      `);

    return res.status(200).json({
      message: 'Position updated successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Update position error:', error.message);

    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

async function deletePosition(req, res) {
  try {
    const { id } = req.params;

    const pool = getPool();

    // Check if position exists
    const positionCheck = await pool
      .request()
      .input('positionId', id)
      .query(`
        SELECT PositionId
        FROM Positions
        WHERE PositionId = @positionId
      `);

    if (positionCheck.recordset.length === 0) {
      return res.status(404).json({
        message: 'Position not found'
      });
    }

    // Prevent deletion if employees are using this position
    const employeeCheck = await pool
      .request()
      .input('positionId', id)
      .query(`
        SELECT COUNT(*) AS EmployeeCount
        FROM Employees
        WHERE PositionId = @positionId
      `);

    if (employeeCheck.recordset[0].EmployeeCount > 0) {
      return res.status(400).json({
        message:
          'This position cannot be deleted because it is assigned to one or more employees.'
      });
    }

    await pool
      .request()
      .input('positionId', id)
      .query(`
        DELETE FROM Positions
        WHERE PositionId = @positionId
      `);

    return res.status(200).json({
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Delete position error:', error.message);

    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

module.exports = {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition
};