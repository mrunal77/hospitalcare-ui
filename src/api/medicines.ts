import api from './client';
import type { Medicine, SearchMedicineResult } from '../types';

export const medicineApi = {
  getAll: async (): Promise<Medicine[]> => {
    const response = await api.get<Medicine[]>('/medicines');
    return response.data;
  },

  search: async (query: string, limit: number = 20): Promise<SearchMedicineResult[]> => {
    const response = await api.get<SearchMedicineResult[]>('/medicines/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/medicines/categories');
    return response.data;
  },

  getByCategory: async (subCategory: string): Promise<Medicine[]> => {
    const response = await api.get<Medicine[]>(`/medicines/category/${subCategory}`);
    return response.data;
  },
};
