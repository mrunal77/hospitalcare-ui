import api from './client';
import type { Doctor, CreateDoctorDto } from '../types';

export const doctorApi = {
  getAll: async (): Promise<Doctor[]> => {
    const response = await api.get<Doctor[]>('/doctors');
    return response.data;
  },

  getById: async (id: string): Promise<Doctor> => {
    const response = await api.get<Doctor>(`/doctors/${id}`);
    return response.data;
  },

  getBySpecialization: async (specialization: string): Promise<Doctor[]> => {
    const response = await api.get<Doctor[]>(`/doctors/specialization/${specialization}`);
    return response.data;
  },

  create: async (data: CreateDoctorDto): Promise<Doctor> => {
    const response = await api.post<Doctor>('/doctors', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/doctors/${id}`);
  },
};
