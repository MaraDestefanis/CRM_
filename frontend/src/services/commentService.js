import api from './api';

const commentService = {
  getComments: async (type, referenceId) => {
    try {
      const response = await api.get(`/comments/${type}/${referenceId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  createComment: async (commentData) => {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  updateComment: async (id, content) => {
    try {
      const response = await api.put(`/comments/${id}`, { content });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  deleteComment: async (id) => {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default commentService;
