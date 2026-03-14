import api from './client';
import type { Claim, CreateClaimDto, UpdateClaimDto } from '../types';

export const claimApi = {
  getAll: async (): Promise<Claim[]> => {
    const response = await api.get<Claim[]>('/claims');
    return response.data;
  },

  getActive: async (): Promise<Claim[]> => {
    const response = await api.get<Claim[]>('/claims/active');
    return response.data;
  },

  getByCategory: async (category: string): Promise<Claim[]> => {
    const response = await api.get<Claim[]>(`/claims/category/${category}`);
    return response.data;
  },

  getById: async (id: string): Promise<Claim> => {
    const response = await api.get<Claim>(`/claims/${id}`);
    return response.data;
  },

  create: async (data: CreateClaimDto): Promise<Claim> => {
    const response = await api.post<Claim>('/claims', data);
    return response.data;
  },

  update: async (id: string, data: UpdateClaimDto): Promise<Claim> => {
    const response = await api.put<Claim>(`/claims/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/claims/${id}`);
  },

  activate: async (id: string): Promise<Claim> => {
    const response = await api.post<Claim>(`/claims/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<Claim> => {
    const response = await api.post<Claim>(`/claims/${id}/deactivate`);
    return response.data;
  },
};
