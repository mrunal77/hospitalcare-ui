import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { appointmentApi } from '../api/appointments';
import { Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Appointment, CreateAppointmentDto, RescheduleAppointmentDto } from '../types';
import AppointmentModal from '../components/modals/AppointmentModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function Appointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState<{
    type: 'create' | 'reschedule' | 'cancel' | 'complete' | null;
    appointment?: Appointment;
  }>({ type: null });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAppointmentDto) => appointmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setModalState({ type: null });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleAppointmentDto }) =>
      appointmentApi.reschedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setModalState({ type: null });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setModalState({ type: null });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setModalState({ type: null });
    },
  });

  const canCreate = user?.role === 'HospitalEmployee' || user?.role === 'Admin';
  const canComplete = user?.role === 'Doctor' || user?.role === 'Admin';
  const canCancel = canCreate || user?.role === 'Doctor';
  const canReschedule = canCreate;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = (data: CreateAppointmentDto | RescheduleAppointmentDto) => {
    if (modalState.type === 'create') {
      createMutation.mutate(data as CreateAppointmentDto);
    } else if (modalState.type === 'reschedule' && modalState.appointment) {
      rescheduleMutation.mutate({ id: modalState.appointment.id, data: data as RescheduleAppointmentDto });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'create' })}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.doctorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {appointment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {canComplete && appointment.status === 'Scheduled' && (
                          <button
                            onClick={() => setModalState({ type: 'complete', appointment })}
                            className="text-green-600 hover:text-green-800"
                            title="Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {canReschedule && (appointment.status === 'Scheduled' || appointment.status === 'Rescheduled') && (
                          <button
                            onClick={() => setModalState({ type: 'reschedule', appointment })}
                            className="text-blue-600 hover:text-blue-800"
                            title="Reschedule"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {canCancel && (appointment.status === 'Scheduled' || appointment.status === 'Rescheduled') && (
                          <button
                            onClick={() => setModalState({ type: 'cancel', appointment })}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
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

      {modalState.type === 'create' && (
        <AppointmentModal
          mode="create"
          onSave={handleSave}
          onClose={() => setModalState({ type: null })}
          isLoading={createMutation.isPending}
        />
      )}

      {modalState.type === 'reschedule' && modalState.appointment && (
        <AppointmentModal
          mode="reschedule"
          appointment={modalState.appointment}
          onSave={handleSave}
          onClose={() => setModalState({ type: null })}
          isLoading={rescheduleMutation.isPending}
        />
      )}

      {modalState.type === 'cancel' && modalState.appointment && (
        <ConfirmModal
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment?"
          onConfirm={() => cancelMutation.mutate(modalState.appointment!.id)}
          onClose={() => setModalState({ type: null })}
          isLoading={cancelMutation.isPending}
          danger
        />
      )}

      {modalState.type === 'complete' && modalState.appointment && (
        <ConfirmModal
          title="Complete Appointment"
          message="Mark this appointment as completed?"
          onConfirm={() => completeMutation.mutate(modalState.appointment!.id)}
          onClose={() => setModalState({ type: null })}
          isLoading={completeMutation.isPending}
        />
      )}
    </div>
  );
}
