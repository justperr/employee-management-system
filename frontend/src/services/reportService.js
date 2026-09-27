import api from "./api";

const getEmployeeDirectoryReport = async () => {
  const response = await api.get("/reports/employee-directory");
  return response.data;
};

const getDepartmentHeadcountReport = async () => {
  const response = await api.get("/reports/department-headcount");
  return response.data;
};

const getSalarySummaryReport = async () => {
  const response = await api.get("/reports/salary-summary");
  return response.data;
};

const reportService = {
  getEmployeeDirectoryReport,
  getDepartmentHeadcountReport,
  getSalarySummaryReport,
};

export default reportService;