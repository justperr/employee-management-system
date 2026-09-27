import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
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

import positionService from "../services/positionService";
import departmentService from "../services/departmentService";
import authService from "../services/authService";

const { Title } = Typography;

const PositionsPage = () => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "Admin";

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingPosition, setEditingPosition] =
    useState(null);

  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        positionResponse,
        departmentResponse,
      ] = await Promise.all([
        positionService.getPositions(),
        departmentService.getDepartments(),
      ]);

      setPositions(positionResponse.data);
      setDepartments(departmentResponse.data);
    } catch (error) {
      console.error(
        "Positions error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load positions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDepartmentName = (
    departmentId
  ) => {
    const department = departments.find(
      (item) =>
        item.DepartmentId === departmentId
    );

    return department
      ? department.DepartmentName
      : "-";
  };

  const handleAdd = () => {
    setEditingPosition(null);

    form.resetFields();

    setOpenForm(true);
  };

  const handleEdit = (position) => {
    setEditingPosition(position);

    form.setFieldsValue({
      positionName:
        position.PositionName,
      departmentId:
        position.DepartmentId,
    });

    setOpenForm(true);
  };

  const handleClose = () => {
    setOpenForm(false);
    setEditingPosition(null);

    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      if (editingPosition) {
        await positionService.updatePosition(
          editingPosition.PositionId,
          values
        );

        message.success(
          "Position updated successfully!"
        );
      } else {
        await positionService.createPosition(
          values
        );

        message.success(
          "Position created successfully!"
        );
      }

      handleClose();
      loadData();
    } catch (error) {
      if (error.response) {
        message.error(
          error.response.data.message ||
            "Operation failed."
        );
      }
    }
  };

  const handleDelete = async (positionId) => {
    try {
      await positionService.deletePosition(
        positionId
      );

      message.success(
        "Position deleted successfully!"
      );

      loadData();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Unable to delete position."
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
      title: "Position Name",
      dataIndex: "PositionName",
      key: "PositionName",
    },
    {
      title: "Department",
      dataIndex: "DepartmentId",
      key: "DepartmentId",
      render: (departmentId) =>
        getDepartmentName(departmentId),
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
                  onClick={() =>
                    handleEdit(record)
                  }
                >
                  Edit
                </Button>

                <Popconfirm
                  title="Delete position"
                  description="Are you sure you want to delete this position?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() =>
                    handleDelete(
                      record.PositionId
                    )
                  }
                >
                  <Button
                    type="text"
                    danger
                    icon={
                      <DeleteOutlined />
                    }
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
          Positions
        </Title>

        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Position
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
          rowKey="PositionId"
          columns={columns}
          dataSource={positions}
          loading={loading}
          pagination={false}
          locale={{
            emptyText:
              "No positions found.",
          }}
        />
      </Card>

      {isAdmin && (
        <Modal
          title={
            editingPosition
              ? "Edit Position"
              : "Add Position"
          }
          open={openForm}
          onCancel={handleClose}
          onOk={handleSubmit}
          okText={
            editingPosition
              ? "Update Position"
              : "Save Position"
          }
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="positionName"
              label="Position Name"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter the position name.",
                },
                {
                  whitespace: true,
                  message:
                    "Position name cannot be empty.",
                },
              ]}
            >
              <Input
                placeholder="e.g. Software Developer"
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="departmentId"
              label="Department"
              rules={[
                {
                  required: true,
                  message:
                    "Please select a department.",
                },
              ]}
            >
              <Select
                placeholder="Select Department"
                options={departments.map(
                  (department) => ({
                    label:
                      department.DepartmentName,
                    value:
                      department.DepartmentId,
                  })
                )}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default PositionsPage;