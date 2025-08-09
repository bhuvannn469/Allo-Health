import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Queue API endpoints
export const queueApi = {
  getQueue: () =>
    api.get('/queue'),
  
  getQueueStats: () =>
    api.get('/queue/stats'),
  
  addToQueue: (payload: { 
    patientPhone: string; 
    patientName?: string; 
    priority?: number; 
    notes?: string 
  }) => {
    // Backend expects { patient: { name, phone }, priority, notes }
    const body: any = {
      patient: {
        phone: payload.patientPhone,
        name: payload.patientName || 'Walk-in Patient'
      }
    };
    if (payload.priority) body.priority = payload.priority;
    if (payload.notes) body.notes = payload.notes;
    return api.post('/queue', body);
  },
  
  updateQueueStatus: (id: number, status: string) =>
    api.patch(`/queue/${id}/status`, { status }),
  
  skipQueue: (id: number) =>
    api.patch(`/queue/${id}/skip`),
  
  removeFromQueue: (id: number) =>
    api.delete(`/queue/${id}`),
};

// Appointment API endpoints
export const appointmentApi = {
  getAppointments: (params?: { date?: string; doctorId?: number; status?: string }) =>
    api.get('/appointments', { params }),
  
  getAppointment: (id: number) =>
    api.get(`/appointments/${id}`),
  
  bookAppointment: (appointment: {
    patientPhone: string;
    patientName?: string;
    doctorId: number;
    scheduledAt: string;
    durationMinutes?: number;
    notes?: string;
  }) => {
    const body: any = {
      doctorId: appointment.doctorId,
      scheduledAt: appointment.scheduledAt,
    };
    if (appointment.durationMinutes) body.durationMinutes = appointment.durationMinutes;
    if (appointment.notes) body.notes = appointment.notes;
    // Provide patient object for creation / matching
    body.patient = {
      phone: appointment.patientPhone,
      name: appointment.patientName || 'Patient'
    };
    return api.post('/appointments', body);
  },
  
  updateAppointment: (id: number, data: any) =>
    api.patch(`/appointments/${id}`, data),
  
  cancelAppointment: (id: number) =>
    api.delete(`/appointments/${id}`),
};

// Doctor API endpoints
export const doctorApi = {
  getDoctors: (params?: { specialization?: string; location?: string; search?: string }) =>
    api.get('/doctors', { params }),
  
  getDoctor: (id: number) =>
    api.get(`/doctors/${id}`),
  
  createDoctor: (doctor: {
    name: string;
    specialization: string;
    phone: string;
    email?: string;
    location?: string;
  }) =>
    api.post('/doctors', doctor),
  
  updateDoctor: (id: number, data: any) =>
    api.patch(`/doctors/${id}`, data),
  
  deleteDoctor: (id: number) =>
    api.delete(`/doctors/${id}`),
  
  getDoctorAvailability: (id: number, params?: { date?: string }) =>
    api.get(`/doctors/${id}/availability`, { params }),
  
  addDoctorAvailability: (id: number, availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }) =>
    api.post(`/doctors/${id}/availability`, availability),
};

// Patient API endpoints
export const patientApi = {
  getPatients: (params?: { search?: string; phone?: string }) => {
    // Backend expects 'query' param, not 'search'
    const backendParams: any = {};
    if (params?.search) backendParams.query = params.search;
    if (params?.phone) backendParams.phone = params.phone; // (phone filtering not implemented server-side yet)
    return api.get('/patients', { params: backendParams }).then(res => {
      // Map backend 'dob' to frontend 'dateOfBirth' for display consistency
      const mapped = (res.data || []).map((p: any) => ({
        ...p,
        dateOfBirth: p.dob || null,
      }));
      return { ...res, data: mapped };
    });
  },

  getPatient: (id: number) => api.get(`/patients/${id}`).then(res => ({
    ...res,
    data: { ...res.data, dateOfBirth: res.data?.dob || null }
  })),

  // NOTE: Backend CreatePatientDto only allows: name, phone, dob?, notes?
  // We accept richer form data and map it to the allowed DTO shape to avoid
  // ValidationPipe forbidNonWhitelisted errors (e.g., "property dateOfBirth should not exist").
  createPatient: (patient: {
    name: string;
    phone: string;
    email?: string;        // optional UI field -> folded into notes
    dateOfBirth?: string;  // mapped to dob
    address?: string;      // optional UI field -> folded into notes
  }) => {
    const body: any = {
      name: patient.name,
      phone: patient.phone,
    };
    if (patient.dateOfBirth) body.dob = patient.dateOfBirth; // backend expects 'dob'
    const notesParts: string[] = [];
    if (patient.email) notesParts.push(`Email: ${patient.email}`);
    if (patient.address) notesParts.push(`Address: ${patient.address}`);
    if (notesParts.length) body.notes = notesParts.join(' | ');
    return api.post('/patients', body);
  },

  updatePatient: (id: number, data: any) => {
    // Strip disallowed fields & map to backend schema
    const body: any = {};
    if (data.name) body.name = data.name;
    if (data.phone) body.phone = data.phone;
    if (data.dateOfBirth) body.dob = data.dateOfBirth;
    if (data.dob) body.dob = data.dob; // in case caller already mapped
    // Reconstruct notes if provided via separate UI fields
    const notesParts: string[] = [];
    if (data.email) notesParts.push(`Email: ${data.email}`);
    if (data.address) notesParts.push(`Address: ${data.address}`);
    if (data.notes) notesParts.push(data.notes);
    if (notesParts.length) body.notes = notesParts.join(' | ');
    return api.patch(`/patients/${id}`, body);
  },

  deletePatient: (id: number) => api.delete(`/patients/${id}`),
};

// Analytics API endpoints
export const analyticsApi = {
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/analytics', { params }).then(response => response.data),
  
  exportReport: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/analytics/export', { 
      params, 
      responseType: 'blob' 
    });
    return response.data;
  },
};
