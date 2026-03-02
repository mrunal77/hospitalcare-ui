import api from './client';
import type { Specialization } from '../types';

export const specializationApi = {
  getAll: async (): Promise<Specialization[]> => {
    const response = await api.get<Specialization[]>('/specializations');
    return response.data;
  },

  getActive: async (): Promise<Specialization[]> => {
    const response = await api.get<Specialization[]>('/specializations/active');
    return response.data;
  },
};
