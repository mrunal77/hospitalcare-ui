import api from './client';
import type { AuthResponse, LoginDto, RegisterUserDto, User, ChangePasswordDto, ResetPasswordDto } from '../types';

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterUserDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await api.put('/auth/change-password', data);
  },

  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    await api.put('/auth/reset-password', data);
  },
};
