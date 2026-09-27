import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import departmentService from "../services/departmentService";
import authService from "../services/authService";

const { Title } = Typography;

const DepartmentsPage = () => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "Admin";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [form] = Form.useForm();

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await departmentService.getDepartments();

      setDepartments(response.data);
    } catch (error) {
      console.error(
        "Departments error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setOpenForm(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);

    form.setFieldsValue({
      departmentName:
        department.DepartmentName,
    });

    setOpenForm(true);
  };

  const handleClose = () => {
    setOpenForm(false);
    setEditingDepartment(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      if (editingDepartment) {
        await departmentService.updateDepartment(
          editingDepartment.DepartmentId,
          values
        );

        message.success(
          "Department updated successfully!"
        );
      } else {
        await departmentService.createDepartment(
          values
        );

        message.success(
          "Department created successfully!"
        );
      }

      handleClose();
      loadDepartments();
    } catch (error) {
      if (error.response) {
        message.error(
          error.response.data.message ||
            "Operation failed."
        );
      }
    }
  };

  const handleDelete = async (departmentId) => {
    try {
      await departmentService.deleteDepartment(
        departmentId
      );

      message.success(
        "Department deleted successfully!"
      );

      loadDepartments();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Unable to delete department."
      );
    }
  };

const columns = [
  {
    title: "#",
    key: "number",
    width: 80,
    render: (_, __, index) => index + 1,
  },
  {
    title: "Department Name",
    dataIndex: "DepartmentName",
    key: "DepartmentName",
  },

  ...(isAdmin
    ? [
        {
          title: "Actions",
          key: "actions",
          width: 180,
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
                title="Delete department"
                description="Are you sure you want to delete this department?"
                okText="Yes"
                cancelText="No"
                onConfirm={() =>
                  handleDelete(record.DepartmentId)
                }
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
      ]
    : []),
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
          Departments
        </Title>

        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Department
          </Button>
        )}
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{
            marginBottom: 20,
          }}
        />
      )}

      <Card>
        <Table
          rowKey="DepartmentId"
          columns={columns}
          dataSource={departments}
          loading={loading}
          pagination={false}
          locale={{
            emptyText:
              "No departments found.",
          }}
        />
      </Card>

      {isAdmin && (
        <Modal
          title={
            editingDepartment
              ? "Edit Department"
              : "Add Department"
          }
          open={openForm}
          onCancel={handleClose}
          onOk={handleSubmit}
          okText={
            editingDepartment
              ? "Update Department"
              : "Save Department"
          }
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="departmentName"
              label="Department Name"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter the department name.",
                },
                {
                  whitespace: true,
                  message:
                    "Department name cannot be empty.",
                },
              ]}
            >
              <Input
                placeholder="e.g. Human Resources"
                maxLength={100}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentsPage;