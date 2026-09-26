import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
};

export default authService;