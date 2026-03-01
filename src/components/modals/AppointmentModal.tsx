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
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'New Appointment' : 'Reschedule Appointment'}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {mode === 'create' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient</label>
                  <select
                    required
                    value={(formData as CreateAppointmentDto).patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor</label>
                  <select
                    required
                    value={(formData as CreateAppointmentDto).doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={(formData as CreateAppointmentDto).appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="240"
                    value={(formData as CreateAppointmentDto).durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                  <textarea
                    required
                    rows={2}
                    value={(formData as CreateAppointmentDto).reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="Enter reason for appointment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={(formData as CreateAppointmentDto).notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="Additional notes"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={(formData as RescheduleAppointmentDto).newDate}
                    onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="240"
                    value={(formData as RescheduleAppointmentDto).newDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, newDurationMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all duration-200"
                  />
                </div>
              </>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 font-medium shadow-lg shadow-violet-600/25 transition-all duration-200"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
