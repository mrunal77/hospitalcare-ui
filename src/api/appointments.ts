import api from './client';
import type { Appointment, CreateAppointmentDto, RescheduleAppointmentDto } from '../types';

export const appointmentApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  getByPatientId: async (patientId: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments/patient/${patientId}`);
    return response.data;
  },

  getByDoctorId: async (doctorId: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  create: async (data: CreateAppointmentDto): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<void> => {
    await api.put(`/appointments/${id}/cancel`, null, { params: { reason } });
  },

  complete: async (id: string, notes?: string): Promise<void> => {
    await api.put(`/appointments/${id}/complete`, null, { params: { notes } });
  },

  reschedule: async (id: string, data: RescheduleAppointmentDto): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}/reschedule`, data);
    return response.data;
  },
};
