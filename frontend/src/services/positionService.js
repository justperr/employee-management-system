import api from "./api";

const getPositions = async () => {
  const response = await api.get("/positions");

  return response.data;
};

const createPosition = async (positionData) => {
  const response = await api.post(
    "/positions",
    positionData
  );

  return response.data;
};

const updatePosition = async (
  id,
  positionData
) => {
  const response = await api.put(
    `/positions/${id}`,
    positionData
  );

  return response.data;
};

const deletePosition = async (id) => {
  const response = await api.delete(
    `/positions/${id}`
  );

  return response.data;
};

const positionService = {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
};

export default positionService;