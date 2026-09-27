import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import reportService from "../services/reportService";
import departmentService from "../services/departmentService";
import positionService from "../services/positionService";

const { Title, Text } = Typography;
const { Option } = Select;

const ReportsPage = () => {
  const [directory, setDirectory] = useState([]);
  const [departmentHeadcount, setDepartmentHeadcount] = useState([]);
  const [salarySummary, setSalarySummary] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [positionFilter, setPositionFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        employeeResponse,
        headcountResponse,
        salaryResponse,
      ] = await Promise.all([
        reportService.getEmployeeDirectoryReport(),
        reportService.getDepartmentHeadcountReport(),
        reportService.getSalarySummaryReport(),
      ]);

      setDirectory(employeeResponse.data || []);
      setDepartmentHeadcount(headcountResponse.data || []);
      setSalarySummary(salaryResponse.data || []);
    } catch (error) {
      console.error("Load reports error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to retrieve reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [departmentResponse, positionResponse] =
        await Promise.all([
          departmentService.getDepartments(),
          positionService.getPositions(),
        ]);

      setDepartments(departmentResponse.data || []);
      setPositions(positionResponse.data || []);
    } catch (error) {
      console.error("Load report filters error:", error);
    }
  };

  useEffect(() => {
    loadReports();
    loadDropdowns();
  }, []);

  const totalEmployees = directory.length;

  const activeEmployees = directory.filter(
    (employee) => employee.Status === "Active"
  ).length;

  const inactiveEmployees = directory.filter(
    (employee) => employee.Status === "Inactive"
  ).length;

  const totalSalary = directory.reduce(
    (total, employee) =>
      total + Number(employee.Salary || 0),
    0
  );

  const filteredPositions = useMemo(() => {
    if (!departmentFilter) {
      return positions;
    }

    return positions.filter(
      (position) =>
        Number(position.DepartmentId) ===
        Number(departmentFilter)
    );
  }, [positions, departmentFilter]);

  const filteredDirectory = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return directory.filter((employee) => {
      const fullName =
        `${employee.FirstName || ""} ${
          employee.LastName || ""
        }`.toLowerCase();

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        (employee.Email || "")
          .toLowerCase()
          .includes(keyword) ||
        (employee.DepartmentName || "")
          .toLowerCase()
          .includes(keyword) ||
        (employee.PositionName || "")
          .toLowerCase()
          .includes(keyword);

      const matchesDepartment =
        !departmentFilter ||
        Number(employee.DepartmentId) ===
          Number(departmentFilter);

      const matchesPosition =
        !positionFilter ||
        Number(employee.PositionId) ===
          Number(positionFilter);

      const matchesStatus =
        !statusFilter ||
        employee.Status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesStatus
      );
    });
  }, [
    directory,
    search,
    departmentFilter,
    positionFilter,
    statusFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter(null);
    setPositionFilter(null);
    setStatusFilter(null);
  };

  const handleDepartmentFilterChange = (value) => {
    setDepartmentFilter(value);
    setPositionFilter(null);
  };

  const exportDirectoryCSV = () => {
    if (filteredDirectory.length === 0) {
      message.warning(
        "There are no employees to export."
      );
      return;
    }

    const headers = [
      "#",
      "Employee",
      "Email",
      "Department",
      "Position",
      "Phone",
      "Hire Date",
      "Status",
    ];

    const rows = filteredDirectory.map(
      (employee, index) => [
        index + 1,
        `${employee.FirstName || ""} ${
          employee.LastName || ""
        }`,
        employee.Email || "",
        employee.DepartmentName || "",
        employee.PositionName || "",
        employee.Phone || "",
        employee.HireDate
          ? new Date(
              employee.HireDate
            ).toLocaleDateString("en-PH")
          : "",
        employee.Status || "",
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "employee-directory-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    message.success("Employee directory exported successfully.");
  };

  const printEmployeeDirectory = () => {
    if (filteredDirectory.length === 0) {
      message.warning(
        "There are no employees to print."
      );
      return;
    }

    const rows = filteredDirectory
      .map(
        (employee, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              ${employee.FirstName || ""} ${
                employee.LastName || ""
              }
            </td>
            <td>${employee.Email || ""}</td>
            <td>${employee.DepartmentName || ""}</td>
            <td>${employee.PositionName || ""}</td>
            <td>${employee.Phone || "-"}</td>
            <td>
              ${
                employee.HireDate
                  ? new Date(
                      employee.HireDate
                    ).toLocaleDateString("en-PH")
                  : "-"
              }
            </td>
            <td>${employee.Status || ""}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

    if (!printWindow) {
      message.error(
        "Unable to open print window. Please allow pop-ups."
      );
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Employee Directory Report</title>

          <style>
            @page {
              size: landscape;
              margin: 12mm;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #222;
            }

            h1 {
              margin-bottom: 5px;
            }

            .subtitle {
              margin-bottom: 20px;
              color: #666;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }

            th {
              background: #f5f5f5;
            }

            .footer {
              margin-top: 15px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>

        <body>
          <h1>Employee Directory Report</h1>

          <div class="subtitle">
            Generated on ${new Date().toLocaleString(
              "en-PH"
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Hire Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            Total Records: ${filteredDirectory.length}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const printDepartmentHeadcount = () => {
    const rows = departmentHeadcount
      .map(
        (department, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${department.DepartmentName}</td>
            <td>${department.EmployeeCount}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) {
      message.error(
        "Unable to open print window. Please allow pop-ups."
      );
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Department Headcount Report</title>

          <style>
            @page {
              size: portrait;
              margin: 15mm;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #222;
            }

            h1 {
              margin-bottom: 5px;
            }

            .subtitle {
              margin-bottom: 20px;
              color: #666;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
            }
          </style>
        </head>

        <body>
          <h1>Department Headcount Report</h1>

          <div class="subtitle">
            Generated on ${new Date().toLocaleString(
              "en-PH"
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Employee Count</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const printSalarySummary = () => {
    const rows = salarySummary
      .map(
        (department, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${department.DepartmentName}</td>
            <td>${department.EmployeeCount}</td>
            <td>
              ₱${Number(
                department.TotalSalary || 0
              ).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td>
              ₱${Number(
                department.AverageSalary || 0
              ).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=1100,height=700"
    );

    if (!printWindow) {
      message.error(
        "Unable to open print window. Please allow pop-ups."
      );
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Summary Report</title>

          <style>
            @page {
              size: landscape;
              margin: 15mm;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #222;
            }

            h1 {
              margin-bottom: 5px;
            }

            .subtitle {
              margin-bottom: 20px;
              color: #666;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
            }
          </style>
        </head>

        <body>
          <h1>Salary Summary Report</h1>

          <div class="subtitle">
            Generated on ${new Date().toLocaleString(
              "en-PH"
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Employee Count</th>
                <th>Total Salary</th>
                <th>Average Salary</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const directoryColumns = [
    {
      title: "#",
      key: "number",
      width: 60,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Employee",
      key: "employee",
      sorter: (a, b) =>
        `${a.FirstName} ${a.LastName}`.localeCompare(
          `${b.FirstName} ${b.LastName}`
        ),
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <strong>
            {record.FirstName} {record.LastName}
          </strong>

          <span>{record.Email}</span>
        </Space>
      ),
    },

    {
      title: "Department",
      dataIndex: "DepartmentName",
      key: "DepartmentName",
      sorter: (a, b) =>
        (a.DepartmentName || "").localeCompare(
          b.DepartmentName || ""
        ),
    },

    {
      title: "Position",
      dataIndex: "PositionName",
      key: "PositionName",
      sorter: (a, b) =>
        (a.PositionName || "").localeCompare(
          b.PositionName || ""
        ),
    },

    {
      title: "Phone",
      dataIndex: "Phone",
      key: "Phone",
      responsive: ["lg"],
    },

    {
      title: "Hire Date",
      dataIndex: "HireDate",
      key: "HireDate",
      sorter: (a, b) =>
        new Date(a.HireDate) -
        new Date(b.HireDate),
      render: (date) =>
        date
          ? new Date(
              date
            ).toLocaleDateString("en-PH")
          : "-",
    },

    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      sorter: (a, b) =>
        (a.Status || "").localeCompare(
          b.Status || ""
        ),
      render: (status) => (
        <Tag
          color={
            status === "Active"
              ? "green"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  const headcountColumns = [
    {
      title: "#",
      key: "number",
      width: 60,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Department",
      dataIndex: "DepartmentName",
      key: "DepartmentName",
      sorter: (a, b) =>
        (a.DepartmentName || "").localeCompare(
          b.DepartmentName || ""
        ),
    },

    {
      title: "Employee Count",
      dataIndex: "EmployeeCount",
      key: "EmployeeCount",
      sorter: (a, b) =>
        Number(a.EmployeeCount) -
        Number(b.EmployeeCount),
    },
  ];

  const salaryColumns = [
    {
      title: "#",
      key: "number",
      width: 60,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Department",
      dataIndex: "DepartmentName",
      key: "DepartmentName",
      sorter: (a, b) =>
        (a.DepartmentName || "").localeCompare(
          b.DepartmentName || ""
        ),
    },

    {
      title: "Employee Count",
      dataIndex: "EmployeeCount",
      key: "EmployeeCount",
      sorter: (a, b) =>
        Number(a.EmployeeCount) -
        Number(b.EmployeeCount),
    },

    {
      title: "Total Salary",
      dataIndex: "TotalSalary",
      key: "TotalSalary",
      sorter: (a, b) =>
        Number(a.TotalSalary) -
        Number(b.TotalSalary),
      render: (salary) =>
        `₱${Number(
          salary || 0
        ).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}`,
    },

    {
      title: "Average Salary",
      dataIndex: "AverageSalary",
      key: "AverageSalary",
      sorter: (a, b) =>
        Number(a.AverageSalary) -
        Number(b.AverageSalary),
      render: (salary) =>
        `₱${Number(
          salary || 0
        ).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}`,
    },
  ];

  return (
    <>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Reports
        </Title>

        <Button
          icon={<ReloadOutlined />}
          onClick={loadReports}
          loading={loading}
        >
          Refresh
        </Button>
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={totalEmployees}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Employees"
              value={activeEmployees}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inactive Employees"
              value={inactiveEmployees}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Salary"
              value={totalSalary}
              precision={2}
              prefix="₱"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Employee Directory"
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={exportDirectoryCSV}
            >
              Export CSV
            </Button>

            <Button
              icon={<PrinterOutlined />}
              onClick={printEmployeeDirectory}
            >
              Print
            </Button>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Space
          wrap
          style={{
            width: "100%",
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Search employee, email, department..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: 280,
            }}
            allowClear
          />

          <Select
            placeholder="Department"
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            allowClear
            style={{
              width: 180,
            }}
          >
            {departments.map((department) => (
              <Option
                key={department.DepartmentId}
                value={department.DepartmentId}
              >
                {department.DepartmentName}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Position"
            value={positionFilter}
            onChange={setPositionFilter}
            allowClear
            style={{
              width: 180,
            }}
            disabled={!departmentFilter}
          >
            {filteredPositions.map((position) => (
              <Option
                key={position.PositionId}
                value={position.PositionId}
              >
                {position.PositionName}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{
              width: 140,
            }}
          >
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>

          <Button onClick={clearFilters}>
            Clear Filters
          </Button>
        </Space>

        <Space
          style={{
            marginBottom: 12,
          }}
        >
          <Text type="secondary">
            Showing {filteredDirectory.length} of{" "}
            {directory.length} employees
          </Text>
        </Space>

        <Table
          rowKey="EmployeeId"
          columns={directoryColumns}
          dataSource={filteredDirectory}
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
          }}
          scroll={{
            x: 1000,
          }}
          locale={{
            emptyText: "No employees found.",
          }}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Department Headcount"
            extra={
              <Button
                icon={<PrinterOutlined />}
                onClick={printDepartmentHeadcount}
              >
                Print
              </Button>
            }
          >
            <Table
              rowKey="DepartmentId"
              columns={headcountColumns}
              dataSource={departmentHeadcount}
              loading={loading}
              pagination={false}
              size="small"
              locale={{
                emptyText:
                  "No department data found.",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Salary Summary"
            extra={
              <Button
                icon={<PrinterOutlined />}
                onClick={printSalarySummary}
              >
                Print
              </Button>
            }
          >
            <Table
              rowKey="DepartmentId"
              columns={salaryColumns}
              dataSource={salarySummary}
              loading={loading}
              pagination={false}
              size="small"
              locale={{
                emptyText:
                  "No salary data found.",
              }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ReportsPage;