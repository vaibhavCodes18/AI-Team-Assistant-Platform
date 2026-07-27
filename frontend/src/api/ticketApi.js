import api from "./axios";

export const createTicket = async (ticketData) => {
  const response = await api.post("/v1/tickets", ticketData);
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await api.get(`/v1/tickets/${ticketId}`);
  return response.data;
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await api.put(`/v1/tickets/${ticketId}`, ticketData);
  return response.data;
};

export const deleteTicket = async (ticketId) => {
  const response = await api.delete(`/v1/tickets/${ticketId}`);
  return response.data;
};
