import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { appointmentApi } from '../api/appointments';
import { Plus, CheckCircle, XCircle, RefreshCw, Calendar, Clock, Stethoscope } from 'lucide-react';
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-500/20', icon: Clock };
      case 'Completed':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500/20', icon: CheckCircle };
      case 'Cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500/20', icon: XCircle };
      case 'Rescheduled':
        return { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-500/20', icon: RefreshCw };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-500/20', icon: Clock };
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">View and manage all appointments</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'create' })}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 font-medium shadow-lg shadow-violet-600/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Appointment
          </button>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => {
              const statusStyle = getStatusStyles(appointment.status);
              const StatusIcon = statusStyle.icon;
              
              return (
                <div key={appointment.id} className="p-5 hover:bg-gray-50/50 transition-colors duration-150">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Patient & Doctor Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        {appointment.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>Dr. {appointment.doctorName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-gray-500" />
                        </div>
                        <span>
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-500" />
                        </div>
                        <span>
                          {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-gray-400">({appointment.durationMinutes} min)</span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {appointment.status}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {canComplete && appointment.status === 'Scheduled' && (
                          <button
                            onClick={() => setModalState({ type: 'complete', appointment })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                            title="Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {canReschedule && (appointment.status === 'Scheduled' || appointment.status === 'Rescheduled') && (
                          <button
                            onClick={() => setModalState({ type: 'reschedule', appointment })}
                            className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors duration-150"
                            title="Reschedule"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {canCancel && (appointment.status === 'Scheduled' || appointment.status === 'Rescheduled') && (
                          <button
                            onClick={() => setModalState({ type: 'cancel', appointment })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Reason:</span> {appointment.reason}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium text-gray-700">Notes:</span> {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
          message="Are you sure you want to cancel this appointment? This action cannot be undone."
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
