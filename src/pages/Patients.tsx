import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { patientApi } from '../api/patients';
import { Search, Plus, Edit2, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Patient, CreatePatientDto, UpdatePatientDto } from '../types';
import PatientModal from '../components/modals/PatientModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function Patients() {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState<{
    type: 'add' | 'edit' | 'delete' | null;
    patient?: Patient;
  }>({ type: null });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', search],
    queryFn: search ? () => patientApi.search(search) : patientApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePatientDto) => patientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setModalState({ type: null });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) =>
      patientApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setModalState({ type: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setModalState({ type: null });
    },
  });

  const canCreate = user?.role === 'HospitalEmployee' || user?.role === 'Admin';
  const canEdit = canCreate;
  const canDelete = user?.role === 'Admin';

  const handleSave = (data: CreatePatientDto | UpdatePatientDto) => {
    if (modalState.type === 'add') {
      createMutation.mutate(data as CreatePatientDto);
    } else if (modalState.type === 'edit' && modalState.patient) {
      updateMutation.mutate({ id: modalState.patient.id, data: data as UpdatePatientDto });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">Manage patient records and information</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'add' })}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium shadow-lg shadow-blue-600/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Patient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No patients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {patient.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button
                            onClick={() => setModalState({ type: 'edit', patient })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setModalState({ type: 'delete', patient })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalState.type === 'add' && (
        <PatientModal
          onSave={handleSave}
          onClose={() => setModalState({ type: null })}
          isLoading={createMutation.isPending}
        />
      )}

      {modalState.type === 'edit' && modalState.patient && (
        <PatientModal
          patient={modalState.patient}
          onSave={handleSave}
          onClose={() => setModalState({ type: null })}
          isLoading={updateMutation.isPending}
        />
      )}

      {modalState.type === 'delete' && modalState.patient && (
        <ConfirmModal
          title="Delete Patient"
          message={`Are you sure you want to delete ${modalState.patient.firstName} ${modalState.patient.lastName}? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(modalState.patient!.id)}
          onClose={() => setModalState({ type: null })}
          isLoading={deleteMutation.isPending}
          danger
        />
      )}
    </div>
  );
}
