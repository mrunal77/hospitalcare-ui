import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleClaimApi } from '../api/roleClaims';
import { roleApi } from '../api/roles';
import { claimApi } from '../api/claims';
import { Plus, Trash2, Shield, X } from 'lucide-react';

export default function RoleClaims() {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [modalState, setModalState] = useState<{ type: 'assign' | null }>({ type: null });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getAll,
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: claimApi.getAll,
  });

  const { data: roleClaims = [], isLoading: isLoadingClaims } = useQuery({
    queryKey: ['roleClaims', selectedRoleId],
    queryFn: () => roleClaimApi.getByRoleId(selectedRoleId),
    enabled: !!selectedRoleId,
  });

  const assignMutation = useMutation({
    mutationFn: ({ roleId, claimId }: { roleId: string; claimId: string }) =>
      roleClaimApi.assign({ roleId, claimId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleClaims', selectedRoleId] });
      setModalState({ type: null });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ roleId, claimId }: { roleId: string; claimId: string }) =>
      roleClaimApi.remove(roleId, claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleClaims', selectedRoleId] });
    },
  });

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const availableClaims = claims.filter(
    (c) => c.isActive && !roleClaims.some((rc) => rc.claimId === c.id)
  );

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Doctor': return 'bg-blue-100 text-blue-700';
      case 'HospitalEmployee': return 'bg-emerald-100 text-emerald-700';
      case 'Nurse': return 'bg-purple-100 text-purple-700';
      case 'Receptionist': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Claims</h1>
          <p className="text-gray-500 mt-1">Manage default claims for each role</p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.filter(r => r.isActive).map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedRoleId === role.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getRoleBadgeColor(role.name)}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{role.name}</div>
                  <div className="text-xs text-gray-500">{role.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedRoleId && selectedRole && (
        <>
          {/* Role Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${getRoleBadgeColor(selectedRole.name)}`}>
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedRole.name}</h3>
                <p className="text-sm text-gray-500">{selectedRole.description}</p>
              </div>
            </div>
          </div>

          {/* Role Claims */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Default Claims for {selectedRole.name}</h3>
                <p className="text-sm text-gray-500">Claims automatically assigned to users with this role</p>
              </div>
              <button
                onClick={() => setModalState({ type: 'assign' })}
                disabled={availableClaims.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Claim
              </button>
            </div>
            {isLoadingClaims ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-3 border-purple-600 border-t-transparent rounded-full"></div>
              </div>
            ) : roleClaims.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No claims assigned to this role.
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roleClaims.map((rc) => (
                    <div
                      key={rc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100"
                    >
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{rc.claimName}</div>
                        <div className="text-xs text-gray-500">{rc.claimCategory}</div>
                      </div>
                      <button
                        onClick={() => removeMutation.mutate({ roleId: selectedRoleId, claimId: rc.claimId })}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Assign Claim Modal */}
      {modalState.type === 'assign' && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Claim to {selectedRole?.name}</h2>
              <button onClick={() => setModalState({ type: null })} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {availableClaims.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => assignMutation.mutate({ roleId: selectedRoleId, claimId: claim.id })}
                  disabled={assignMutation.isPending}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-gray-900">{claim.name}</div>
                  <div className="text-sm text-gray-500">{claim.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{claim.category}</div>
                </button>
              ))}
              {availableClaims.length === 0 && (
                <p className="text-center text-gray-500 py-4">All claims are already assigned</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
