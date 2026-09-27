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