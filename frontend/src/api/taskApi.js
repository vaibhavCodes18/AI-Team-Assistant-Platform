import api from "./api";

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
