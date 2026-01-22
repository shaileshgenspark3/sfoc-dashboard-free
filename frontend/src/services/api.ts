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

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: string;
  isNew?: boolean;
}

export const activitiesApi = {
  submit: (data: ActivitySubmission) => api.post<{ activity: Activity, streak: number, newBadges: Badge[], participant: Participant }>('/activities/submit', data),
  getStats: () => api.get<Stats>('/activities/stats'),
  getToday: () => api.get<Activity[]>('/activities/today'),
  getByParticipant: (code: string) => api.get<Activity[]>(`/activities/participant/${code}`),
};

export interface Participant {
  _id?: string;
  name: string;
  individualCode: string;
  groupCode: string | null;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
  streakDays: number;
  mobile?: string;
  activityType?: string;
  badges: Badge[];
  profilePicture: string | null;
}

export const participantsApi = {
  getLeaderboard: () => api.get<Participant[]>('/participants/leaderboard'),
  getGroupParticipants: (groupCode: string) => api.get<Participant[]>(`/participants/group/${groupCode}`),
  register: (data: { name: string; email: string; mobile: string; activityType: string }) => api.post('/participants/register', data),
  bulkImport: (formData: FormData) => api.post('/participants/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByCode: (code: string) => api.get<Participant>(`/participants/code/${code}`),
  uploadProfilePicture: (code: string, formData: FormData) => api.post<{ success: boolean; profilePicture: string }>(
    `/participants/${code}/upload-profile`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  ),
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
  getGroupActivities: (code: string) => api.get<Activity[]>(`/groups/${code}/activities`),
  create: (data: { groupName: string; description?: string; individualCode: string }) => api.post('/groups/create', data),
  join: (groupCode: string, individualCode: string) => api.post(`/groups/${groupCode}/join`, { individualCode }),
  update: (code: string, data: { groupName?: string; description?: string }) => api.put(`/groups/${code}`, data),
  getAll: () => api.get<Group[]>('/groups'),
};

export const stravaApi = {
  getAuthUrl: (code: string) => api.get<{ url: string }>(`/strava/auth/${code}`),
  sync: (code: string) => api.post<{ success: boolean; syncedCount: number }>(`/strava/sync/${code}`),
};

export const settingsApi = {
  get: (key: string) => api.get<{ key: string; value: any }>(`/settings/${key}`),
  update: (key: string, value: any) => api.put<{ key: string; value: any }>(`/settings/${key}`, { value }),
};

export const adminApi = {
  getActivities: () => api.get<Activity[]>('/admin/activities'),
  updateActivity: (id: string, data: Partial<Activity>) => api.put(`/admin/activities/${id}`, data),
  deleteActivity: (id: string) => api.delete(`/admin/activities/${id}`),
  syncStrava: () => api.post<{ success: boolean; count: number }>('/admin/sync-strava'),
  getAllParticipants: () => api.get<Participant[]>('/participants'),
  updateParticipant: (id: string, data: Partial<Participant>) => api.put(`/participants/admin/${id}`, data),
  deleteParticipant: (id: string) => api.delete(`/participants/admin/${id}`),
};

// Chat Types
export interface ChatMessage {
  _id: string;
  roomId: string;
  roomType: 'global' | 'group' | 'direct';
  senderCode: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  mentions: string[];
  reactions: { emoji: string; userCodes: string[] }[];
  readBy: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  _id: string;
  roomId: string;
  roomType: 'global' | 'group' | 'direct';
  participants: string[];
  name: string;
  description?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    senderCode: string;
    createdAt: string;
  };
  unreadCounts: Record<string, number>;
  otherParticipant?: {
    code: string;
    name: string;
    avatar?: string;
  };
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const chatApi = {
  getRooms: (userCode: string) =>
    api.get<ChatRoom[]>(`/chat/rooms/${userCode}`),
  getMessages: (roomId: string, page?: number) =>
    api.get<MessagesResponse>(`/chat/messages/${encodeURIComponent(roomId)}`, { params: { page } }),
  createDMRoom: (userCode1: string, userCode2: string) =>
    api.post<ChatRoom>('/chat/rooms/direct', { userCode1, userCode2 }),
  addReaction: (messageId: string, emoji: string, userCode: string) =>
    api.post<ChatMessage>(`/chat/messages/${messageId}/reactions`, { emoji, userCode }),
  markRead: (roomId: string, userCode: string) =>
    api.put(`/chat/messages/${encodeURIComponent(roomId)}/read`, { userCode }),
  searchMessages: (roomId: string, query: string) =>
    api.get<ChatMessage[]>(`/chat/messages/${encodeURIComponent(roomId)}/search`, { params: { query } }),
  deleteMessage: (messageId: string, userCode: string) =>
    api.delete(`/chat/messages/${messageId}`, { data: { userCode } }),
  getParticipants: (userCode: string) =>
    api.get<Participant[]>(`/chat/participants/${userCode}`),
};

export default api;
