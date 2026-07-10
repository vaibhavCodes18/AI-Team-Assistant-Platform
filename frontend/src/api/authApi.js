import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/v1/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/v1/auth/login", credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/v1/auth/logout");
  
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post("/v1/auth/refresh");
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await api.get("/v1/auth/profile");
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put("/v1/auth/profile", profileData);
  return response.data;
};
