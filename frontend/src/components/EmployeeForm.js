import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
} from "antd";
import dayjs from "dayjs";

import employeeService from "../services/employeeService";
import departmentService from "../services/departmentService";
import positionService from "../services/positionService";

const EmployeeForm = ({
  open,
  employee,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    loadDropdowns();

    if (employee) {
      form.setFieldsValue({
        firstName: employee.FirstName,
        lastName: employee.LastName,
        email: employee.Email,
        phone: employee.Phone,
        dateOfBirth: employee.DateOfBirth
          ? dayjs(employee.DateOfBirth)
          : null,
        hireDate: employee.HireDate
          ? dayjs(employee.HireDate)
          : null,
        salary: employee.Salary,
        departmentId: employee.DepartmentId,
        positionId: employee.PositionId,
        status: employee.Status,
      });
    } else {
      form.resetFields();
      form.setFieldValue("status", "Active");
    }
  }, [open, employee, form]);

  const loadDropdowns = async () => {
    try {
      const departmentResponse =
        await departmentService.getDepartments();

      const positionResponse =
        await positionService.getPositions();

      setDepartments(departmentResponse.data);
      setPositions(positionResponse.data);
    } catch (error) {
      message.error(
        "Failed to load departments and positions."
      );
    }
  };

  const selectedDepartmentId = Form.useWatch(
    "departmentId",
    form
  );

  const filteredPositions = positions.filter(
    (position) =>
      position.DepartmentId === selectedDepartmentId
  );

  const handleDepartmentChange = () => {
    form.setFieldValue("positionId", undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const employeeData = {
        ...values,

        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,

        hireDate: values.hireDate.format("YYYY-MM-DD"),
      };

      if (employee) {
        await employeeService.updateEmployee(
          employee.EmployeeId,
          employeeData
        );

        message.success(
          "Employee updated successfully!"
        );
      } else {
        await employeeService.createEmployee(
          employeeData
        );

        message.success(
          "Employee created successfully!"
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      if (error.response) {
        message.error(
          error.response.data.message ||
            "Operation failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        employee
          ? "Edit Employee"
          : "Add Employee"
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText={
        employee
          ? "Update Employee"
          : "Save Employee"
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[
            {
              required: true,
              message: "Please enter the first name.",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            {
              required: true,
              message: "Please enter the last name.",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message: "Please enter the email.",
            },
            {
              type: "email",
              message: "Please enter a valid email.",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="dateOfBirth"
          label="Date of Birth"
        >
          <DatePicker
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="hireDate"
          label="Hire Date"
          rules={[
            {
              required: true,
              message: "Please select the hire date.",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="salary"
          label="Salary"
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `₱ ${value}`.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ","
              )
            }
            parser={(value) =>
              value.replace(/[₱,\s]/g, "")
            }
          />
        </Form.Item>

        <Form.Item
          name="departmentId"
          label="Department"
          rules={[
            {
              required: true,
              message: "Please select a department.",
            },
          ]}
        >
          <Select
            placeholder="Select Department"
            onChange={handleDepartmentChange}
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

        <Form.Item
          name="positionId"
          label="Position"
          rules={[
            {
              required: true,
              message: "Please select a position.",
            },
          ]}
        >
          <Select
            placeholder={
              selectedDepartmentId
                ? "Select Position"
                : "Select Department First"
            }
            disabled={!selectedDepartmentId}
            options={filteredPositions.map(
              (position) => ({
                label:
                  position.PositionName,
                value:
                  position.PositionId,
              })
            )}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="Active"
        >
          <Select
            options={[
              {
                label: "Active",
                value: "Active",
              },
              {
                label: "Inactive",
                value: "Inactive",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeForm;