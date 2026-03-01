import api from './client';
import type { Role, CreateRoleDto, UpdateRoleDto } from '../types';

export const roleApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await api.post<Role>('/roles', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const response = await api.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  activate: async (id: string): Promise<Role> => {
    const response = await api.post<Role>(`/roles/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<Role> => {
    const response = await api.post<Role>(`/roles/${id}/deactivate`);
    return response.data;
  },
};
