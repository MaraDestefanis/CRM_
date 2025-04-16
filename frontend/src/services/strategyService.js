import api from './api';

const strategyService = {
  getStrategies: async () => {
    try {
      const response = await api.get('/strategies');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  getStrategyById: async (id) => {
    try {
      const response = await api.get(`/strategies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  createStrategy: async (strategyData) => {
    try {
      const response = await api.post('/strategies', strategyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  updateStrategy: async (id, strategyData) => {
    try {
      const response = await api.put(`/strategies/${id}`, strategyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  deleteStrategy: async (id, deleteTasks = false) => {
    try {
      const response = await api.delete(`/strategies/${id}?deleteTasks=${deleteTasks}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default strategyService;
