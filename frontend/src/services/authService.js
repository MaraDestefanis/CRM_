import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      if (email === 'admin@example.com' && password === 'password123') {
        const demoUser = {
          id: 1,
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'admin'
        };
        const demoToken = 'demo-token-' + Math.random().toString(36).substring(2);
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        return { user: demoUser, token: demoToken };
      }
      
      // const response = await api.post('/auth/login', { email, password });
      // return response.data;
      
      throw new Error('Credenciales inválidas');
    } catch (error) {
      throw error.response ? error.response.data : { message: error.message || 'Error de red' };
    }
  },

  register: async (userData) => {
    try {
      throw new Error('Registro no disponible en modo demostración');
      
      // const response = await api.post('/auth/register', userData);
      // return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: error.message || 'Error de red' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
