import api from './client';
import type { User, RegisterUserDto } from '../types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: RegisterUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  enable: async (id: string): Promise<void> => {
    await api.put(`/users/${id}/enable`);
  },

  disable: async (id: string): Promise<void> => {
    await api.put(`/users/${id}/disable`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await api.put(`/users/${id}/reset-password`, newPassword);
  },
};
