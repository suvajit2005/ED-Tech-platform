import api from './api';

const testAPI = {
  // Get tests for a course
  getTests: (courseId, params) => api.get(`/tests/course/${courseId}`, { params }),
  
  // Get test by ID
  getTestById: (id) => api.get(`/tests/${id}`),
  
  // Create test
  createTest: (testData) => api.post('/tests', testData),
  
  // Update test
  updateTest: (id, testData) => api.put(`/tests/${id}`, testData),
  
  // Delete test
  deleteTest: (id) => api.delete(`/tests/${id}`),
  
  // Start test attempt
  startTestAttempt: (testId) => api.post(`/tests/${testId}/start`),
  
  // Submit test answer
  submitTestAnswer: (testId, answerData) => 
    api.post(`/tests/${testId}/submit-answer`, answerData),
  
  // Finish test
  finishTest: (testId, attemptId) => 
    api.post(`/tests/${testId}/finish`, { attemptId }),
  
  // Get test attempts
  getTestAttempts: (testId) => api.get(`/tests/${testId}/attempts`),
};

export default testAPI;
