import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { doctorApi } from '../api/doctors';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Doctor, CreateDoctorDto } from '../types';
import DoctorModal from '../components/modals/DoctorModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function Doctors() {
  const [specialization, setSpecialization] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState<{
    type: 'add' | 'delete' | null;
    doctor?: Doctor;
  }>({ type: null });

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors', specialization],
    queryFn: specialization ? () => doctorApi.getBySpecialization(specialization) : doctorApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDoctorDto) => doctorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setModalState({ type: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setModalState({ type: null });
    },
  });

  const canCreate = user?.role === 'Admin';
  const canDelete = user?.role === 'Admin';

  const handleSave = (data: CreateDoctorDto) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'add' })}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by specialization..."
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading...</div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">No doctors found</div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => setModalState({ type: 'delete', doctor })}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Email:</span> {doctor.email}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Phone:</span> {doctor.phone}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">License:</span> {doctor.licenseNumber}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {modalState.type === 'add' && (
        <DoctorModal
          onSave={handleSave}
          onClose={() => setModalState({ type: null })}
          isLoading={createMutation.isPending}
        />
      )}

      {modalState.type === 'delete' && modalState.doctor && (
        <ConfirmModal
          title="Delete Doctor"
          message={`Are you sure you want to delete Dr. ${modalState.doctor.firstName} ${modalState.doctor.lastName}?`}
          onConfirm={() => deleteMutation.mutate(modalState.doctor!.id)}
          onClose={() => setModalState({ type: null })}
          isLoading={deleteMutation.isPending}
          danger
        />
      )}
    </div>
  );
}
