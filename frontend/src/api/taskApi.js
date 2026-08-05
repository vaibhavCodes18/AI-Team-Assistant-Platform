import api from "./axios";

export const getProjectTasks = async (projectId) => {
  const response = await api.get(`/v1/projects/${projectId}/tasks`);
  return response.data;
};
export const getTicketTasks = async (ticketId) => {
  const response = await api.get(`/v1/tickets/${ticketId}/tasks`);
  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/v1/tasks/${taskId}`);
  return response.data;
};
export const deleteTaskById = async (taskId) => {
  const response = await api.delete(`/v1/tasks/${taskId}`);
  return response.data;
};
export const addTask = async (task) => {
  const response = await api.post(`/v1/tasks`, task);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/v1/tasks/${taskId}`, taskData);
  return response.data;
};

