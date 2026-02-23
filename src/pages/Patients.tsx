import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { patientApi } from '../api/patients';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'add' })}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => setModalState({ type: 'edit', patient })}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setModalState({ type: 'delete', patient })}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          message={`Are you sure you want to delete ${modalState.patient.firstName} ${modalState.patient.lastName}?`}
          onConfirm={() => deleteMutation.mutate(modalState.patient!.id)}
          onClose={() => setModalState({ type: null })}
          isLoading={deleteMutation.isPending}
          danger
        />
      )}
    </div>
  );
}
