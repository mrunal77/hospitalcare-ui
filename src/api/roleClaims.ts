import api from './client';
import type { RoleClaim, CreateRoleClaimDto, UpdateRoleClaimsDto, Claim } from '../types';

export const roleClaimApi = {
  getByRoleId: async (roleId: string): Promise<RoleClaim[]> => {
    const response = await api.get<RoleClaim[]>(`/roleclaims/role/${roleId}`);
    return response.data;
  },

  getClaimsByRoleId: async (roleId: string): Promise<Claim[]> => {
    const response = await api.get<Claim[]>(`/roleclaims/role/${roleId}/claims`);
    return response.data;
  },

  assign: async (data: CreateRoleClaimDto): Promise<RoleClaim> => {
    const response = await api.post<RoleClaim>('/roleclaims', data);
    return response.data;
  },

  remove: async (roleId: string, claimId: string): Promise<void> => {
    await api.delete(`/roleclaims/${roleId}/${claimId}`);
  },

  update: async (data: UpdateRoleClaimsDto): Promise<void> => {
    await api.put('/roleclaims', data);
  },
};
