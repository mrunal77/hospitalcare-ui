import api from './client';
import type { UserClaim, CreateUserClaimDto, UpdateUserClaimsDto, Claim } from '../types';

export const userClaimApi = {
  getByUserId: async (userId: string): Promise<UserClaim[]> => {
    const response = await api.get<UserClaim[]>(`/userclaims/user/${userId}`);
    return response.data;
  },

  getEffectiveClaims: async (userId: string): Promise<Claim[]> => {
    const response = await api.get<Claim[]>(`/userclaims/user/${userId}/effective`);
    return response.data;
  },

  assign: async (data: CreateUserClaimDto): Promise<UserClaim> => {
    const response = await api.post<UserClaim>('/userclaims', data);
    return response.data;
  },

  remove: async (userId: string, claimId: string): Promise<void> => {
    await api.delete(`/userclaims/${userId}/${claimId}`);
  },

  update: async (data: UpdateUserClaimsDto): Promise<void> => {
    await api.put('/userclaims', data);
  },
};
