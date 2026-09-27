import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import reportService from "../services/reportService";
import authService from "../services/authService";

const { Title, Text } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "Admin";

  const [employees, setEmployees] = useState([]);
  const [headcount, setHeadcount] = useState([]);
  const [salarySummary, setSalarySummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
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

      setEmployees(directoryResponse.data);
      setHeadcount(headcountResponse.data);
      setSalarySummary(salaryResponse.data);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.Status === "Active"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.Status === "Inactive"
  ).length;

  const totalSalary = salarySummary.reduce(
    (total, department) =>
      total + Number(department.TotalSalary || 0),
    0
  );

  const activePercentage =
    totalEmployees > 0
      ? Math.round(
          (activeEmployees / totalEmployees) * 100
        )
      : 0;

  const recentEmployees = [...employees]
    .sort(
      (a, b) =>
        new Date(b.HireDate) -
        new Date(a.HireDate)
    )
    .slice(0, 5);

  const maxDepartmentCount =
    headcount.length > 0
      ? Math.max(
          ...headcount.map(
            (department) =>
              Number(
                department.EmployeeCount
              )
          )
        )
      : 0;

  const formatSalary = (value) =>
    `₱${Number(value).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  return (
    <div>
      <Space
        direction="vertical"
        size={4}
        style={{
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>

        <Text type="secondary">
          Overview of your organization's workforce
        </Text>
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{
            marginBottom: 24,
          }}
        />
      )}

      {/* KPI CARDS */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={totalEmployees}
              prefix={<TeamOutlined />}
              loading={loading}
            />

            <Text type="secondary">
              All employee records
            </Text>
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

            <Text type="secondary">
              {activePercentage}% of workforce
            </Text>
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

            <Text type="secondary">
              Currently inactive
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Payroll"
              value={totalSalary}
              loading={loading}
              formatter={(value) =>
                formatSalary(value)
              }
            />

            <Text type="secondary">
              Combined employee salaries
            </Text>
          </Card>
        </Col>
      </Row>

      {/* MAIN DASHBOARD CONTENT */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >
        {/* DEPARTMENT DISTRIBUTION */}

        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ApartmentOutlined />
                <span>
                  Employees by Department
                </span>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() =>
                  navigate("/departments")
                }
              >
                View Departments
                <ArrowRightOutlined />
              </Button>
            }
          >
            {loading ? (
              <Progress
                percent={0}
                status="active"
                showInfo={false}
              />
            ) : headcount.length === 0 ? (
              <Text type="secondary">
                No department data available.
              </Text>
            ) : (
              <Space
                direction="vertical"
                size={18}
                style={{
                  width: "100%",
                }}
              >
                {headcount.map(
                  (department) => {
                    const employeeCount =
                      Number(
                        department.EmployeeCount
                      );

                    const percentage =
                      maxDepartmentCount > 0
                        ? Math.round(
                            (employeeCount /
                              maxDepartmentCount) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={
                          department.DepartmentId
                        }
                      >
                        <Space
                          style={{
                            width: "100%",
                            justifyContent:
                              "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text strong>
                            {
                              department.DepartmentName
                            }
                          </Text>

                          <Text type="secondary">
                            {employeeCount}{" "}
                            {employeeCount === 1
                              ? "employee"
                              : "employees"}
                          </Text>
                        </Space>

                        <Progress
                          percent={percentage}
                          showInfo={false}
                        />
                      </div>
                    );
                  }
                )}
              </Space>
            )}
          </Card>
        </Col>

        {/* WORKFORCE STATUS */}

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>
                  Workforce Status
                </span>
              </Space>
            }
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              <Progress
                type="circle"
                percent={activePercentage}
                size={150}
                format={(percent) =>
                  `${percent}%`
                }
              />

              <div
                style={{
                  marginTop: 12,
                }}
              >
                <Text type="secondary">
                  Active workforce
                </Text>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Statistic
                    title="Active"
                    value={activeEmployees}
                    loading={loading}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Statistic
                    title="Inactive"
                    value={inactiveEmployees}
                    loading={loading}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* RECENT HIRES + QUICK ACTIONS */}

      <Row
        gutter={[
          16,
          16,
        ]}
      >
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <UserAddOutlined />
                <span>
                  Recent Hires
                </span>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() =>
                  navigate("/employees")
                }
              >
                View Employees
                <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              loading={loading}
              dataSource={recentEmployees}
              locale={{
                emptyText:
                  "No employee records found.",
              }}
              renderItem={(employee) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar>
                        {employee.FirstName?.charAt(
                          0
                        )}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <span>
                          {employee.FirstName}{" "}
                          {employee.LastName}
                        </span>

                        <Tag
                          color={
                            employee.Status ===
                            "Active"
                              ? "green"
                              : "red"
                          }
                        >
                          {employee.Status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size={0}
                      >
                        <span>
                          {
                            employee.PositionName
                          }{" "}
                          ·{" "}
                          {
                            employee.DepartmentName
                          }
                        </span>

                        <Text type="secondary">
                          Hired{" "}
                          {new Date(
                            employee.HireDate
                          ).toLocaleDateString(
                            "en-PH"
                          )}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* QUICK ACTIONS */}

        <Col xs={24} lg={8}>
          <Card title="Quick Actions">
            <Space
              direction="vertical"
              size={12}
              style={{
                width: "100%",
              }}
            >
              {isAdmin && (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block
                    onClick={() =>
                      navigate("/employees")
                    }
                  >
                    Manage Employees
                  </Button>

                  <Button
                    icon={<ApartmentOutlined />}
                    block
                    onClick={() =>
                      navigate("/departments")
                    }
                  >
                    Manage Departments
                  </Button>

                  <Button
                    icon={<TeamOutlined />}
                    block
                    onClick={() =>
                      navigate("/positions")
                    }
                  >
                    Manage Positions
                  </Button>
                </>
              )}

              <Button
                icon={<FileTextOutlined />}
                block
                onClick={() =>
                  navigate("/reports")
                }
              >
                View Reports
              </Button>
            </Space>
          </Card>

          {/* PAYROLL SUMMARY */}

          <Card
            title="Payroll Summary"
            style={{
              marginTop: 16,
            }}
          >
            <Statistic
              title="Total Salary"
              value={totalSalary}
              loading={loading}
              formatter={(value) =>
                formatSalary(value)
              }
            />

            <Text type="secondary">
              Across all departments
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;