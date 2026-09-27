import api from "./api";

const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export default {
  getDepartments,
};