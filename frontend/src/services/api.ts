import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiError {
  error: string;
  message?: string;
}

// Interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Standardize error message
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject({ ...error, message }); 
  }
);

export interface ActivitySubmission {
  code: string;
  activityType: 'Walking' | 'Running' | 'Cycling' | 'Yoga' | 'Gym' | 'Other';
  distance?: number;
  duration?: number;
  groupCode?: string | null;
}

export interface Stats {
  totalParticipants: number;
  todayActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
  totalCharity: number;
}

export interface Activity {
  _id: string;
  participantCode: string;
  participantName: string;
  activityType: string;
  distance: number;
  duration: number;
  points: number;
  groupCode?: string;
  createdAt: string;
}

export const activitiesApi = {
  submit: (data: ActivitySubmission) => api.post('/activities/submit', data),
  getStats: () => api.get<Stats>('/activities/stats'),
  getToday: () => api.get<Activity[]>('/activities/today'),
  getByParticipant: (code: string) => api.get<Activity[]>(`/activities/participant/${code}`),
};

export interface Participant {
  name: string;
  individualCode: string;
  groupCode: string | null;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
  streakDays: number;
  mobile?: string;
  activityType?: string;
}

export const participantsApi = {
  getLeaderboard: () => api.get<Participant[]>('/participants/leaderboard'),
  getGroupParticipants: (groupCode: string) => api.get<Participant[]>(`/participants/group/${groupCode}`),
  register: (data: { name: string; email: string; mobile: string; activityType: string }) => api.post('/participants/register', data),
  bulkImport: (formData: FormData) => api.post('/participants/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByCode: (code: string) => api.get<Participant>(`/participants/code/${code}`),
};

export interface Group {
  groupName: string;
  groupCode: string;
  totalDistance: number;
  totalDuration: number;
  members: any[];
}

export const groupsApi = {
  getGroup: (code: string) => api.get<Group>(`/groups/${code}`),
  getGroupLeaderboard: (code: string) => api.get<any>(`/groups/${code}/leaderboard`),
  create: (data: { groupName: string; description?: string; individualCode: string }) => api.post('/groups/create', data),
  join: (groupCode: string, individualCode: string) => api.post(`/groups/${groupCode}/join`, { individualCode }),
};

export const settingsApi = {
  get: (key: string) => api.get<{ key: string; value: any }>(`/settings/${key}`),
  update: (key: string, value: any) => api.put<{ key: string; value: any }>(`/settings/${key}`, { value }),
};

export const adminApi = {
  getActivities: () => api.get<Activity[]>('/admin/activities'),
  updateActivity: (id: string, data: Partial<Activity>) => api.put(`/admin/activities/${id}`, data),
  deleteActivity: (id: string) => api.delete(`/admin/activities/${id}`),
};

export default api;
