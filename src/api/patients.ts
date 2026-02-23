import api from './client';
import type { Patient, CreatePatientDto, UpdatePatientDto } from '../types';

export const patientApi = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  search: async (name: string): Promise<Patient[]> => {
    const response = await api.get<Patient[]>('/patients/search', { params: { name } });
    return response.data;
  },

  create: async (data: CreatePatientDto): Promise<Patient> => {
    const response = await api.post<Patient>('/patients', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePatientDto): Promise<Patient> => {
    const response = await api.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};
