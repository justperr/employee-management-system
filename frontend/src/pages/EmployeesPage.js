import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Typography,
  Alert,
  Input,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import employeeService from "../services/employeeService";
import EmployeeForm from "../components/EmployeeForm";

const { Title } = Typography;

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await employeeService.getEmployees();

      setEmployees(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to retrieve employees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setOpenForm(true);
  };

  const handleDelete = async (employeeId) => {
  try {
    await employeeService.deleteEmployee(employeeId);

    message.success("Employee deleted successfully!");

    loadEmployees();
  } catch (error) {
    message.error(
      error.response?.data?.message ||
        "Unable to delete employee."
    );
  }
};

  const handleAdd = () => {
    setEditingEmployee(null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = useMemo(() => {
    const keyword = search.toLowerCase();

    return employees.filter((employee) => {
      return (
        employee.FirstName.toLowerCase().includes(keyword) ||
        employee.LastName.toLowerCase().includes(keyword) ||
        employee.Email.toLowerCase().includes(keyword) ||
        employee.DepartmentName.toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  const columns = [
    {
      title: "Employee",
      key: "employee",
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
    },

    {
      title: "Position",
      dataIndex: "PositionName",
      key: "PositionName",
    },

    {
      title: "Salary",
      dataIndex: "Salary",
      key: "Salary",
      render: (salary) =>
        salary
          ? `₱${Number(salary).toLocaleString("en-PH")}`
          : "-",
    },

    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

        <Popconfirm
        title="Delete employee"
        description="Are you sure you want to delete this employee?"
        okText="Yes"
        cancelText="No"
        onConfirm={() => handleDelete(record.EmployeeId)}
        >
        <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
        >
            Delete
        </Button>
        </Popconfirm>
        </Space>
      ),
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
          Employees
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Employee
        </Button>
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Input
        placeholder="Search employee, email, or department..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: 20,
          maxWidth: 400,
        }}
      />

      <Table
        rowKey="EmployeeId"
        columns={columns}
        dataSource={filteredEmployees}
        loading={loading}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
        locale={{
          emptyText: "No employees found.",
        }}
      />

      <EmployeeForm
        open={openForm}
        employee={editingEmployee}
        onClose={handleCloseForm}
        onSuccess={loadEmployees}
      />
    </>
  );
};

export default EmployeesPage;