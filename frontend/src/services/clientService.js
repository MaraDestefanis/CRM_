import api from './api';

const clientService = {
  getClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  getClientById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  updateClientCategory: async (id, categoryData) => {
    try {
      const response = await api.patch(`/clients/${id}/categorize`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default clientService;
