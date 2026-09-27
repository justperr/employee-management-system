import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  ReloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

import reportService from "../services/reportService";

const { Title, Text } = Typography;

const ReportsPage = () => {
  const [directory, setDirectory] = useState([]);
  const [headcount, setHeadcount] = useState([]);
  const [salarySummary, setSalarySummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      return;
    }

    const headers = Object.keys(data[0]);

    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";

            return `"${String(value).replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob(
      [csvRows.join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

const printEmployeeDirectory = () => {
  if (!directory || directory.length === 0) {
    return;
  }

  const printWindow = window.open(
    "",
    "_blank",
    "width=1200,height=800"
  );

  if (!printWindow) {
    return;
  }

  const rows = directory
    .map(
      (employee) => `
        <tr>
          <td>${employee.FirstName || ""} ${
        employee.LastName || ""
      }</td>
          <td>${employee.Email || ""}</td>
          <td>${employee.DepartmentName || "-"}</td>
          <td>${employee.PositionName || "-"}</td>
          <td>${employee.Phone || "-"}</td>
          <td>${
            employee.HireDate
              ? new Date(
                  employee.HireDate
                ).toLocaleDateString("en-PH")
              : "-"
          }</td>
          <td>${employee.Status || "-"}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Employee Directory</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #000;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 24px;
          }

          .subtitle {
            margin-bottom: 24px;
            color: #555;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #f0f0f0;
            font-weight: bold;
          }

          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #555;
          }

          @media print {
            body {
              margin: 20px;
            }

            @page {
              size: landscape;
              margin: 15mm;
            }
          }
        </style>
      </head>

      <body>
        <h1>Employee Directory</h1>

        <div class="subtitle">
          Employee Management System
        </div>

        <table>
          <thead>
            <tr>
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
          Total Employees: ${directory.length}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

const printDepartmentHeadcount = () => {
  if (!headcount || headcount.length === 0) {
    return;
  }

  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=800"
  );

  if (!printWindow) {
    return;
  }

  const totalEmployees = headcount.reduce(
    (total, department) =>
      total + Number(department.EmployeeCount || 0),
    0
  );

  const rows = headcount
    .map(
      (department) => `
        <tr>
          <td>${department.DepartmentName || "-"}</td>
          <td class="center">
            ${Number(department.EmployeeCount || 0)}
          </td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Department Headcount Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #000;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 24px;
          }

          .subtitle {
            margin-bottom: 24px;
            color: #555;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f0f0f0;
            font-weight: bold;
          }

          .center {
            text-align: center;
          }

          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #555;
          }

          @media print {
            body {
              margin: 20px;
            }

            @page {
              size: portrait;
              margin: 15mm;
            }
          }
        </style>
      </head>

      <body>
        <h1>Department Headcount Report</h1>

        <div class="subtitle">
          Employee Management System
        </div>

        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Employee Count</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Total Employees: ${totalEmployees}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

const printSalarySummary = () => {
  if (!salarySummary || salarySummary.length === 0) {
    return;
  }

  const printWindow = window.open(
    "",
    "_blank",
    "width=1100,height=800"
  );

  if (!printWindow) {
    return;
  }

  const totalEmployees = salarySummary.reduce(
    (total, department) =>
      total + Number(department.EmployeeCount || 0),
    0
  );

  const totalSalary = salarySummary.reduce(
    (total, department) =>
      total + Number(department.TotalSalary || 0),
    0
  );

  const rows = salarySummary
    .map(
      (department) => `
        <tr>
          <td>${department.DepartmentName || "-"}</td>

          <td class="center">
            ${Number(department.EmployeeCount || 0)}
          </td>

          <td class="right">
            ₱${Number(
              department.TotalSalary || 0
            ).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>

          <td class="right">
            ₱${Number(
              department.AverageSalary || 0
            ).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Salary Summary Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #000;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 24px;
          }

          .subtitle {
            margin-bottom: 24px;
            color: #555;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 10px;
          }

          th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: left;
          }

          .center {
            text-align: center;
          }

          .right {
            text-align: right;
          }

          .summary {
            margin-top: 24px;
            font-size: 13px;
          }

          .summary strong {
            display: inline-block;
            min-width: 140px;
          }

          @media print {
            body {
              margin: 20px;
            }

            @page {
              size: landscape;
              margin: 15mm;
            }
          }
        </style>
      </head>

      <body>
        <h1>Salary Summary Report</h1>

        <div class="subtitle">
          Employee Management System
        </div>

        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
              <th>Total Salary</th>
              <th>Average Salary</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="summary">
          <div>
            <strong>Total Employees:</strong>
            ${totalEmployees}
          </div>

          <div>
            <strong>Total Salary:</strong>
            ₱${totalSalary.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        directoryResponse,
        headcountResponse,
        salaryResponse,
      ] = await Promise.all([
        reportService.getEmployeeDirectoryReport(),
        reportService.getDepartmentHeadcountReport(),
        reportService.getSalarySummaryReport(),
      ]);

      setDirectory(directoryResponse.data);
      setHeadcount(headcountResponse.data);
      setSalarySummary(salaryResponse.data);
    } catch (error) {
      console.error("Reports error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const totalEmployees = directory.length;

  const activeEmployees = directory.filter(
    (employee) => employee.Status === "Active"
  ).length;

  const inactiveEmployees = directory.filter(
    (employee) => employee.Status === "Inactive"
  ).length;

  const totalSalary = salarySummary.reduce(
    (total, department) =>
      total + Number(department.TotalSalary || 0),
    0
  );

  const directoryColumns = [
    {
      title: "Employee",
      key: "employee",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <strong>
            {record.FirstName} {record.LastName}
          </strong>
          <Text type="secondary">
            {record.Email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "DepartmentName",
      key: "DepartmentName",
    },
    {
      title: "Position",
      dataIndex: "PositionName",
      key: "PositionName",
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      key: "Phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Hire Date",
      dataIndex: "HireDate",
      key: "HireDate",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString(
              "en-PH"
            )
          : "-",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
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
      title: "Department",
      dataIndex: "DepartmentName",
      key: "DepartmentName",
    },
    {
      title: "Employee Count",
      dataIndex: "EmployeeCount",
      key: "EmployeeCount",
      align: "center",
    },
  ];

  const salaryColumns = [
    {
      title: "Department",
      dataIndex: "DepartmentName",
      key: "DepartmentName",
    },
    {
      title: "Employees",
      dataIndex: "EmployeeCount",
      key: "EmployeeCount",
      align: "center",
    },
    {
      title: "Total Salary",
      dataIndex: "TotalSalary",
      key: "TotalSalary",
      render: (salary) =>
        `₱${Number(salary || 0).toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`,
    },
    {
      title: "Average Salary",
      dataIndex: "AverageSalary",
      key: "AverageSalary",
      render: (salary) =>
        `₱${Number(salary || 0).toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`,
    },
  ];

  return (
    <div>
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

      {/* Summary Cards */}
      <Row
        gutter={[
          16,
          16,
        ]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={totalEmployees}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Employees"
              value={activeEmployees}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inactive Employees"
              value={inactiveEmployees}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Salary"
              value={totalSalary}
              precision={2}
              prefix={<DollarOutlined />}
              loading={loading}
              formatter={(value) =>
                `₱${Number(value).toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Department Headcount */}
      <Card
        title="Department Headcount"
        extra={
        <Space>
            <Button
            icon={<PrinterOutlined />}
            onClick={printDepartmentHeadcount}
            disabled={headcount.length === 0}
            >
            Print
            </Button>

            <Button
            onClick={() =>
                downloadCSV(
                headcount,
                "department-headcount.csv"
                )
            }
            >
            Export CSV
            </Button>
        </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          rowKey="DepartmentId"
          columns={headcountColumns}
          dataSource={headcount}
          loading={loading}
          pagination={false}
          locale={{
            emptyText:
              "No department data found.",
          }}
        />
      </Card>

      {/* Salary Summary */}
      <Card
        title="Salary Summary"
        extra={
        <Space>
            <Button
            icon={<PrinterOutlined />}
            onClick={printSalarySummary}
            disabled={salarySummary.length === 0}
            >
            Print
            </Button>

            <Button
            onClick={() =>
                downloadCSV(
                salarySummary,
                "salary-summary.csv"
                )
            }
            >
            Export CSV
            </Button>
        </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          rowKey="DepartmentId"
          columns={salaryColumns}
          dataSource={salarySummary}
          loading={loading}
          pagination={false}
          locale={{
            emptyText:
              "No salary data found.",
          }}
        />
      </Card>

      {/* Employee Directory */}
      <Card
        title="Employee Directory"
        extra={
          <Space>
            <Button
              icon={<PrinterOutlined />}
              onClick={
                printEmployeeDirectory
              }
              disabled={
                directory.length === 0
              }
            >
              Print
            </Button>

            <Button
              onClick={() =>
                downloadCSV(
                  directory,
                  "employee-directory.csv"
                )
              }
            >
              Export CSV
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="EmployeeId"
          columns={directoryColumns}
          dataSource={directory}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: 900 }}
          locale={{
            emptyText:
              "No employee records found.",
          }}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;