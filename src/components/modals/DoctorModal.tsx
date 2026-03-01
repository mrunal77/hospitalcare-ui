import { useState } from 'react';
import type { Doctor, CreateDoctorDto } from '../../types';

interface DoctorModalProps {
  doctor?: Doctor;
  onSave: (data: CreateDoctorDto) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function DoctorModal({ doctor, onSave, onClose, isLoading }: DoctorModalProps) {
  const [formData, setFormData] = useState<CreateDoctorDto>(
    doctor
      ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialization: doctor.specialization,
          email: doctor.email,
          phone: doctor.phone,
          licenseNumber: doctor.licenseNumber,
        }
      : { firstName: '', lastName: '', specialization: '', email: '', phone: '', licenseNumber: '' }
  );

  const isEdit = !!doctor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Doctor' : 'Add Doctor'}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                placeholder="e.g., Cardiology, Neurology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                placeholder="doctor@hospitalcare.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                placeholder="Enter license number"
              />
            </div>
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
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium shadow-lg shadow-emerald-600/25 transition-all duration-200"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
