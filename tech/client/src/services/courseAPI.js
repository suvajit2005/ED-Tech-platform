import api from './api';

const courseAPI = {
  // Get all courses
  getCourses: (params) => api.get('/courses', { params }),
  
  // Get course by ID
  getCourseById: (id) => api.get(`/courses/${id}`),
  
  // Create course
  createCourse: (courseData) => api.post('/courses', courseData),
  
  // Update course
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  
  // Delete course
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Add lesson to course
  addLesson: (id, lessonData) => api.post(`/courses/${id}/lessons`, lessonData),
  
  // Update lesson
  updateLesson: (courseId, lessonId, lessonData) => 
    api.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData),
  
  // Delete lesson
  deleteLesson: (courseId, lessonId) => 
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  
  // Get instructor's courses
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  
  // Get student's enrolled courses
  getEnrolledCourses: () => api.get('/courses/student/enrolled'),
};

export default courseAPI;
