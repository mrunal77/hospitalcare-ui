import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { doctorApi } from '../api/doctors';
import { Search, Plus, Trash2, Stethoscope, Mail, Phone, Award } from 'lucide-react';
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

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 mt-1">Manage doctor profiles and specializations</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'add' })}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 font-medium shadow-lg shadow-emerald-600/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Doctor
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by specialization..."
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
          />
        </div>
        {specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setSpecialization('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                specialization === ''
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialization(spec)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  specialization === spec
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
            <Stethoscope className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium mt-1">
                      <Award className="h-3 w-3" />
                      {doctor.specialization}
                    </span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    onClick={() => setModalState({ type: 'delete', doctor })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="truncate">{doctor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                  </div>
                  <span>License: {doctor.licenseNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
          message={`Are you sure you want to delete Dr. ${modalState.doctor.firstName} ${modalState.doctor.lastName}? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(modalState.doctor!.id)}
          onClose={() => setModalState({ type: null })}
          isLoading={deleteMutation.isPending}
          danger
        />
      )}
    </div>
  );
}
