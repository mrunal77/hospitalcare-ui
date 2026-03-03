import api from './client';
import type { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto } from '../types';

export const prescriptionApi = {
  getAll: async (): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>('/prescriptions');
    return response.data;
  },

  getById: async (id: string): Promise<Prescription> => {
    const response = await api.get<Prescription>(`/prescriptions/${id}`);
    return response.data;
  },

  getByPatientId: async (patientId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  getByDoctorId: async (doctorId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/prescriptions/doctor/${doctorId}`);
    return response.data;
  },

  getByAppointmentId: async (appointmentId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/prescriptions/appointment/${appointmentId}`);
    return response.data;
  },

  create: async (data: CreatePrescriptionDto): Promise<Prescription> => {
    const response = await api.post<Prescription>('/prescriptions', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePrescriptionDto): Promise<Prescription> => {
    const response = await api.put<Prescription>(`/prescriptions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/prescriptions/${id}`);
  },
};
