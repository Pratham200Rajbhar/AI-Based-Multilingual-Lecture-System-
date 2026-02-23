import axios from 'axios';

// Get API base URL with fallback for development and production
const getBaseURL = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In production, use relative URL (same origin)
  if (import.meta.env.PROD) {
    return '/api';
  }

  // In development, fallback to localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Lectures API
export const lecturesAPI = {
  getAll: (params) => api.get('/lectures', { params }),
  getById: (id) => api.get(`/lectures/${id}`),
  create: (formData) => api.post('/lectures', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/lectures/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/lectures/${id}`)
};

// Quizzes API
export const quizzesAPI = {
  getAll: (params) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getResults: (id) => api.get(`/quizzes/${id}/results`)
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Courses API (public - any authenticated user)
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params })
};

// Attendance API
export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),
  getCourseAttendance: (courseId, params) => api.get(`/attendance/course/${courseId}`, { params }),
  getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params })
};

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (formData) => api.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submit: (id, formData) => api.post(`/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  gradeSubmission: (assignmentId, submissionId, data) =>
    api.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
  delete: (id) => api.delete(`/assignments/${id}`)
};

// Gradebook API
export const gradebookAPI = {
  getCourse: (courseId) => api.get(`/gradebook/${courseId}`),
  getStudentGrades: (courseId, studentId) => api.get(`/gradebook/${courseId}/student/${studentId}`),
  setComponents: (courseId, data) => api.post(`/gradebook/${courseId}/components`, data),
  enterGrades: (courseId, data) => api.post(`/gradebook/${courseId}/grades`, data)
};

// Timetable API
export const timetableAPI = {
  getAll: (params) => api.get('/timetable', { params }),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`)
};

// Notifications API
export const notificationsAPI = {
  getMy: (params) => api.get('/notifications/my', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Announcements API
export const announcementsAPI = {
  getMy: (params) => api.get('/announcements/my', { params }),
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`)
};

// Forum API
export const forumAPI = {
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post('/forum/posts', data),
  reply: (id, data) => api.post(`/forum/posts/${id}/reply`, data),
  toggleResolve: (id) => api.put(`/forum/posts/${id}/resolve`),
  upvoteReply: (postId, replyId) => api.put(`/forum/posts/${postId}/replies/${replyId}/upvote`),
  deletePost: (id) => api.delete(`/forum/posts/${id}`)
};

// Events / Calendar API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getStudent: (id) => api.get(`/analytics/student/${id}`),
  getCourse: (id) => api.get(`/analytics/course/${id}`),
  getDepartment: (id) => api.get(`/analytics/department/${id}`)
};

// Bulk Operations API
export const bulkAPI = {
  createUsers: (data) => api.post('/bulk/users', data),
  parseCsv: (data) => api.post('/bulk/users/parse-csv', data),
  deleteUsers: (data) => api.delete('/bulk/users', { data })
};

// Export API
export const exportAPI = {
  students: (params) => api.get('/export/students', { params }),
  courseReport: (id) => api.get(`/export/course/${id}`),
  attendance: (params) => api.get('/export/attendance', { params }),
  auditLogs: (params) => api.get('/export/audit-logs', { params })
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getReports: () => api.get('/admin/reports'),
  // Institutions
  getInstitutions: () => api.get('/admin/institutions'),
  createInstitution: (data) => api.post('/admin/institutions', data),
  updateInstitution: (id, data) => api.put(`/admin/institutions/${id}`, data),
  deleteInstitution: (id) => api.delete(`/admin/institutions/${id}`),
  // Departments
  getDepartments: (params) => api.get('/admin/departments', { params }),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  // Courses
  getCourses: (params) => api.get('/admin/courses', { params }),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`)
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: (params) => api.get('/audit-logs', { params })
};

export default api;
