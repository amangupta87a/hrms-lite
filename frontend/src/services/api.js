import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiHttpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const employeeService = {
  fetchAllEmployees: () =>
    apiHttpClient.get('/employees').then((response) => response.data),
  fetchEmployeeById: (employeeId) =>
    apiHttpClient
      .get(`/employees/${employeeId}`)
      .then((response) => response.data),
  createEmployee: (employeePayload) =>
    apiHttpClient
      .post('/employees', employeePayload)
      .then((response) => response.data),
  deleteEmployeeById: (employeeId) =>
    apiHttpClient
      .delete(`/employees/${employeeId}`)
      .then((response) => response.data),
};

export const attendanceService = {
  fetchAttendanceRecords: (queryParams = {}) =>
    apiHttpClient
      .get('/attendance', { params: queryParams })
      .then((response) => response.data),
  fetchAttendanceByEmployeeId: (employeeId) =>
    apiHttpClient
      .get(`/attendance/employee/${employeeId}`)
      .then((response) => response.data),
  createAttendanceRecord: (attendancePayload) =>
    apiHttpClient
      .post('/attendance', attendancePayload)
      .then((response) => response.data),
  updateAttendanceRecord: (employeeId, date, attendancePayload) =>
    apiHttpClient
      .put(`/attendance/${employeeId}/${date}`, attendancePayload)
      .then((response) => response.data),
  deleteAttendanceRecord: (employeeId, date) =>
    apiHttpClient
      .delete(`/attendance/${employeeId}/${date}`)
      .then((response) => response.data),
};

export const authService = {
  fetchCurrentCredentials: () =>
    apiHttpClient
      .get('/auth/credentials')
      .then((response) => response.data),
  performLogin: (loginPayload) =>
    apiHttpClient
      .post('/auth/login', loginPayload)
      .then((response) => response.data),
  updatePassword: (passwordChangePayload) =>
    apiHttpClient
      .post('/auth/change-password', passwordChangePayload)
      .then((response) => response.data),
  resetCredentialsToDefault: () =>
    apiHttpClient.post('/auth/reset').then((response) => response.data),
};

export const extractApiErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.detail || 'Something went wrong';
  }

  if (error.request) {
    return 'Cannot connect to server';
  }

  return error.message || 'Unknown error';
};

export default apiHttpClient;
