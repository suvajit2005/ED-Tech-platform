import api from './api';

const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Update profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Change password
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  
  // Update preferences
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

export default authAPI;
