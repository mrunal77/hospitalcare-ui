import { useState, useEffect } from 'react';
import type { Appointment, CreateAppointmentDto, RescheduleAppointmentDto, Patient, Doctor } from '../../types';
import { patientApi } from '../../api/patients';
import { doctorApi } from '../../api/doctors';

interface AppointmentModalProps {
  appointment?: Appointment;
  mode: 'create' | 'reschedule';
  onSave: (data: CreateAppointmentDto | RescheduleAppointmentDto) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function AppointmentModal({ mode, onSave, onClose, isLoading }: AppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [formData, setFormData] = useState<CreateAppointmentDto | RescheduleAppointmentDto>(
    mode === 'create'
      ? { patientId: '', doctorId: '', appointmentDate: '', durationMinutes: 30, reason: '', notes: '' }
      : { newDate: '', newDurationMinutes: 30 }
  );

  useEffect(() => {
    const fetchData = async () => {
      if (mode === 'create') {
        const [patientsData, doctorsData] = await Promise.all([
          patientApi.getAll(),
          doctorApi.getAll(),
        ]);
        setPatients(patientsData);
        setDoctors(doctorsData);
      }
    };
    fetchData();
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'New Appointment' : 'Reschedule Appointment'}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {mode === 'create' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
                    required
                    value={(formData as CreateAppointmentDto).patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor</label>
                  <select
                    required
                    value={(formData as CreateAppointmentDto).doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName} - {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={(formData as CreateAppointmentDto).appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="240"
                    value={(formData as CreateAppointmentDto).durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    required
                    rows={2}
                    value={(formData as CreateAppointmentDto).reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={2}
                    value={(formData as CreateAppointmentDto).notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={(formData as RescheduleAppointmentDto).newDate}
                    onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="240"
                    value={(formData as RescheduleAppointmentDto).newDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, newDurationMinutes: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
