import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/users';
import { roleApi } from '../api/roles';
import { userClaimApi } from '../api/userClaims';
import { claimApi } from '../api/claims';
import { Search, Plus, Trash2, UserCircle, Shield, ToggleLeft, ToggleRight, Key, X, FileKey } from 'lucide-react';
import type { User, RegisterUserDto, Role, Claim, UserClaim } from '../types';

export default function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<{
    type: 'add' | 'delete' | 'reset' | 'role' | 'claims' | null;
    user?: User;
  }>({ type: null });
  const [roles, setRoles] = useState<Role[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [userClaims, setUserClaims] = useState<UserClaim[]>([]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });

  useEffect(() => {
    claimApi.getAll().then(setClaims).catch(console.error);
  }, []);

  useEffect(() => {
    if (modalState.user?.id) {
      userClaimApi.getByUserId(modalState.user.id).then(setUserClaims).catch(console.error);
    }
  }, [modalState.user?.id]);

  const createMutation = useMutation({
    mutationFn: (data: RegisterUserDto) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalState({ type: null });
    },
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => userApi.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => userApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalState({ type: null });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => 
      userApi.resetPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalState({ type: null });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => 
      userApi.updateRole(id, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalState({ type: null });
    },
  });

  const assignClaimMutation = useMutation({
    mutationFn: ({ userId, claimId }: { userId: string; claimId: string }) =>
      userClaimApi.assign({ userId, claimId }),
    onSuccess: () => {
      if (modalState.user?.id) {
        userClaimApi.getByUserId(modalState.user.id).then(setUserClaims).catch(console.error);
      }
    },
  });

  const removeClaimMutation = useMutation({
    mutationFn: ({ userId, claimId }: { userId: string; claimId: string }) =>
      userClaimApi.remove(userId, claimId),
    onSuccess: () => {
      if (modalState.user?.id) {
        userClaimApi.getByUserId(modalState.user.id).then(setUserClaims).catch(console.error);
      }
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-700';
      case 'Doctor':
        return 'bg-blue-100 text-blue-700';
      case 'HospitalEmployee':
        return 'bg-emerald-100 text-emerald-700';
      case 'Nurse':
        return 'bg-purple-100 text-purple-700';
      case 'Receptionist':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const availableClaims = claims.filter(
    (c) => c.isActive && !userClaims.some((uc) => uc.claimId === c.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts, roles and permissions</p>
        </div>
        <button
          onClick={() => {
            roleApi.getActive().then(setRoles).catch(console.error);
            setModalState({ type: 'add' });
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium shadow-lg shadow-blue-600/25"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
            <UserCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <ToggleRight className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                          <ToggleLeft className="h-4 w-4" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            roleApi.getActive().then(setRoles).catch(console.error);
                            setModalState({ type: 'role', user });
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setModalState({ type: 'claims', user });
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Manage Claims"
                        >
                          <FileKey className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'reset', user })}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => user.isActive ? disableMutation.mutate(user.id) : enableMutation.mutate(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.isActive ? 'Disable' : 'Enable'}
                        >
                          {user.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'delete', user })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {modalState.type === 'add' && (
        <AddUserModal
          roles={roles}
          isLoading={createMutation.isPending}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setModalState({ type: null })}
        />
      )}

      {/* Delete Confirmation Modal */}
      {modalState.type === 'delete' && modalState.user && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Delete User</h2>
              <button onClick={() => setModalState({ type: null })} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{modalState.user.firstName} {modalState.user.lastName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalState({ type: null })}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(modalState.user!.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modalState.type === 'reset' && modalState.user && (
        <ResetPasswordModal
          isLoading={resetPasswordMutation.isPending}
          onSave={(password) => resetPasswordMutation.mutate({ id: modalState.user!.id, password })}
          onClose={() => setModalState({ type: null })}
        />
      )}

      {/* Change Role Modal */}
      {modalState.type === 'role' && modalState.user && (
        <ChangeRoleModal
          user={modalState.user}
          roles={roles}
          isLoading={updateRoleMutation.isPending}
          onSave={(roleId) => updateRoleMutation.mutate({ id: modalState.user!.id, roleId })}
          onClose={() => setModalState({ type: null })}
        />
      )}

      {/* Manage Claims Modal */}
      {modalState.type === 'claims' && modalState.user && (
        <ManageClaimsModal
          user={modalState.user}
          userClaims={userClaims}
          availableClaims={availableClaims}
          isAssigning={assignClaimMutation.isPending}
          isRemoving={removeClaimMutation.isPending}
          onAssign={(claimId) => assignClaimMutation.mutate({ userId: modalState.user!.id, claimId })}
          onRemove={(claimId) => removeClaimMutation.mutate({ userId: modalState.user!.id, claimId })}
          onClose={() => setModalState({ type: null })}
        />
      )}
    </div>
  );
}

function AddUserModal({
  roles,
  isLoading,
  onSave,
  onClose,
}: {
  roles: Role[];
  isLoading: boolean;
  onSave: (data: RegisterUserDto) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<RegisterUserDto>({
    email: '',
    password: 'Pass@123',
    firstName: '',
    lastName: '',
    role: roles[0]?.name || 'HospitalEmployee',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add User</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({
  isLoading,
  onSave,
  onClose,
}: {
  isLoading: boolean;
  onSave: (password: string) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState('Pass@123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(password);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Default password: Pass@123</p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangeRoleModal({
  user,
  roles,
  isLoading,
  onSave,
  onClose,
}: {
  user: User;
  roles: Role[];
  isLoading: boolean;
  onSave: (roleId: string) => void;
  onClose: () => void;
}) {
  const currentRole = roles.find((r) => r.name === user.role);
  const [selectedRoleId, setSelectedRoleId] = useState(currentRole?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoleId && selectedRoleId !== currentRole?.id) {
      onSave(selectedRoleId);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Change User Role</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">User</p>
              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">Current Role: <span className="font-medium">{user.role}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Role</label>
              <select
                required
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                <option value="">-- Select a role --</option>
                {roles.filter(r => r.isActive).map((role) => (
                  <option 
                    key={role.id} 
                    value={role.id}
                    disabled={role.name === user.role}
                  >
                    {role.name} {role.name === user.role ? '(current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedRoleId || selectedRoleId === currentRole?.id}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Updating...' : 'Change Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageClaimsModal({
  user,
  userClaims,
  availableClaims,
  isAssigning,
  isRemoving,
  onAssign,
  onRemove,
  onClose,
}: {
  user: User;
  userClaims: UserClaim[];
  availableClaims: Claim[];
  isAssigning: boolean;
  isRemoving: boolean;
  onAssign: (claimId: string) => void;
  onRemove: (claimId: string) => void;
  onClose: () => void;
}) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-100 max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Manage User Claims</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-500">{user.email} - {user.role}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Custom Claims (User-specific)</p>
            {userClaims.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No custom claims assigned. User uses role-based permissions.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userClaims.map((uc) => (
                  <span
                    key={uc.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-700"
                  >
                    {uc.claimName}
                    <button
                      onClick={() => onRemove(uc.claimId)}
                      disabled={isRemoving}
                      className="hover:bg-amber-200 rounded p-0.5 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {showAssign && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available Claims</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableClaims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => {
                      onAssign(claim.id);
                      setShowAssign(false);
                    }}
                    disabled={isAssigning}
                    className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-gray-900 text-sm">{claim.name}</div>
                    <div className="text-xs text-gray-500">{claim.description}</div>
                  </button>
                ))}
                {availableClaims.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">All claims are already assigned</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
          {!showAssign ? (
            <button
              onClick={() => setShowAssign(true)}
              disabled={availableClaims.length === 0}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Assign Claim
            </button>
          ) : (
            <button
              onClick={() => setShowAssign(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
