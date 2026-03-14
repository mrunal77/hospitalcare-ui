import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimApi } from '../api/claims';
import { Search, Plus, Trash2, Shield, ToggleLeft, ToggleRight, X } from 'lucide-react';
import type { Claim, CreateClaimDto } from '../types';

export default function Claims() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    claim?: Claim;
  }>({ type: null });

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: claimApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClaimDto) => claimApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setModalState({ type: null });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateClaimDto }) => claimApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setModalState({ type: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => claimApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setModalState({ type: null });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => claimApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => claimApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.name.toLowerCase().includes(search.toLowerCase()) ||
      claim.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || claim.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(claims.map((c) => c.category))];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Administration: 'bg-purple-100 text-purple-700',
      Doctor: 'bg-blue-100 text-blue-700',
      Patient: 'bg-green-100 text-green-700',
      Appointment: 'bg-amber-100 text-amber-700',
      Prescription: 'bg-pink-100 text-pink-700',
      Medicine: 'bg-cyan-100 text-cyan-700',
      System: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Claims</h1>
          <p className="text-gray-500 mt-1">Manage system permissions and claims</p>
        </div>
        <button
          onClick={() => setModalState({ type: 'add' })}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium shadow-lg shadow-blue-600/25"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Claim
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No claims found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Claim</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 font-mono text-sm">{claim.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(claim.category)}`}>
                        {claim.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {claim.description}
                    </td>
                    <td className="px-6 py-4">
                      {claim.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <ToggleRight className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                          <ToggleLeft className="h-4 w-4" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalState({ type: 'edit', claim })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => claim.isActive ? deactivateMutation.mutate(claim.id) : activateMutation.mutate(claim.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            claim.isActive
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={claim.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {claim.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'delete', claim })}
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

      {/* Add/Edit Modal */}
      {modalState.type === 'add' && (
        <ClaimModal
          isLoading={createMutation.isPending}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setModalState({ type: null })}
        />
      )}

      {modalState.type === 'edit' && modalState.claim && (
        <ClaimModal
          claim={modalState.claim}
          isLoading={updateMutation.isPending}
          onSave={(data) => updateMutation.mutate({ id: modalState.claim!.id, data })}
          onClose={() => setModalState({ type: null })}
        />
      )}

      {/* Delete Confirmation Modal */}
      {modalState.type === 'delete' && modalState.claim && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Delete Claim</h2>
              <button onClick={() => setModalState({ type: null })} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the claim <strong>{modalState.claim.name}</strong>?
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
                onClick={() => deleteMutation.mutate(modalState.claim!.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimModal({
  claim,
  isLoading,
  onSave,
  onClose,
}: {
  claim?: Claim;
  isLoading: boolean;
  onSave: (data: CreateClaimDto) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<CreateClaimDto>({
    name: claim?.name || '',
    description: claim?.description || '',
    category: claim?.category || 'System',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories = ['Administration', 'Doctor', 'Patient', 'Appointment', 'Prescription', 'Medicine', 'System'];

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{claim ? 'Edit Claim' : 'Add Claim'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Claim Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-sm"
                placeholder="e.g., view_doctors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                rows={3}
                placeholder="Describe what this claim allows"
              />
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
              {isLoading ? 'Saving...' : claim ? 'Update Claim' : 'Create Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
