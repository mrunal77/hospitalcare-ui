import { useState, useEffect, useRef } from 'react';
import type { Prescription, CreatePrescriptionDto, CreateMedicineDetailDto, Patient, Doctor, Appointment, SearchMedicineResult } from '../../types';
import { patientApi } from '../../api/patients';
import { doctorApi } from '../../api/doctors';
import { appointmentApi } from '../../api/appointments';
import { prescriptionApi } from '../../api/prescriptions';
import { medicineApi } from '../../api/medicines';
import { Plus, Trash2, X, Pill, Save, Search, Loader2 } from 'lucide-react';

interface PrescriptionModalProps {
  prescription?: Prescription;
  onSave: () => void;
  onClose: () => void;
}

const routineOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Before meals',
  'After meals',
  'At bedtime',
];

const dosageOptions = [
  '10mg', '25mg', '50mg', '100mg', '200mg', '250mg', '500mg', '750mg', '1g',
  '5ml', '10ml', '15ml', '20ml', '30ml',
  '1 tablet', '1/2 tablet', '2 tablets', '3 tablets',
  '1 capsule', '2 capsules',
  '1 injection', '2 injections',
];

function MedicineSearchInput({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (medicine: SearchMedicineResult) => void;
}) {
  const [searchResults, setSearchResults] = useState<SearchMedicineResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await medicineApi.search(value, 10);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching medicines:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          onSelect(searchResults[highlightedIndex]);
          setShowResults(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search medicine..."
          className="w-full px-3 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
          {searchResults.map((medicine, index) => (
            <button
              key={medicine.id}
              type="button"
              onClick={() => {
                onSelect(medicine);
                setShowResults(false);
              }}
              className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors duration-150 ${
                index === highlightedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{medicine.productName}</p>
                  <p className="text-xs text-gray-500">{medicine.saltComposition}</p>
                </div>
                <span className="text-xs text-gray-400">{medicine.manufacturer}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrescriptionModal({ prescription, onSave, onClose }: PrescriptionModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [medicines, setMedicines] = useState<CreateMedicineDetailDto[]>([]);
  
  const [formData, setFormData] = useState<CreatePrescriptionDto>({
    appointmentId: prescription?.appointmentId || '',
    doctorId: prescription?.doctorId || '',
    patientId: prescription?.patientId || '',
    diagnosis: prescription?.diagnosis || '',
    notes: prescription?.notes || '',
    medicines: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const [patientsData, doctorsData] = await Promise.all([
        patientApi.getAll(),
        doctorApi.getAll(),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
      
      if (prescription) {
        setMedicines(prescription.medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          amount: m.amount,
          routine: m.routine,
          instructions: m.instructions,
          durationDays: m.durationDays,
        })));
      }
    };
    fetchData();
  }, [prescription]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        let patientAppointments: Appointment[] = [];
        let doctorAppointments: Appointment[] = [];
        
        if (formData.patientId) {
          console.log('Fetching by patient:', formData.patientId);
          patientAppointments = await appointmentApi.getByPatientId(formData.patientId);
          console.log('Patient appointments:', patientAppointments);
        }
        if (formData.doctorId) {
          console.log('Fetching by doctor:', formData.doctorId);
          doctorAppointments = await appointmentApi.getByDoctorId(formData.doctorId);
          console.log('Doctor appointments:', doctorAppointments);
        }
        
        let filteredAppointments: Appointment[] = [];
        
        if (formData.patientId && formData.doctorId) {
          const doctorAppointmentIds = new Set(doctorAppointments.map(a => a.id));
          filteredAppointments = patientAppointments.filter(a => doctorAppointmentIds.has(a.id));
        } else if (formData.patientId) {
          filteredAppointments = patientAppointments;
        } else if (formData.doctorId) {
          filteredAppointments = doctorAppointments;
        }
        
        console.log('All filtered:', filteredAppointments);
        console.log('Statuses:', filteredAppointments.map(a => a.status));
        
        const completedAppointments = filteredAppointments;
        // .filter(a => a.status === 'Completed');
        console.log('Completed appointments:', completedAppointments);
        setAppointments(completedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };
    
    if (formData.patientId || formData.doctorId) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [formData.patientId, formData.doctorId]);

  const handleAppointmentChange = (appointmentId: string) => {
    const selectedAppointment = appointments.find(a => a.id === appointmentId);
    setFormData({
      ...formData,
      appointmentId,
      doctorId: selectedAppointment?.doctorId || formData.doctorId,
    });
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', amount: '', routine: '', instructions: '', durationDays: 7 },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof CreateMedicineDetailDto, value: string | number) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleMedicineSelect = (index: number, medicine: SearchMedicineResult) => {
    const updated = [...medicines];
    updated[index] = { 
      ...updated[index], 
      name: medicine.productName,
      instructions: medicine.saltComposition ? `${medicine.saltComposition} - ${medicine.manufacturer}` : undefined,
    };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (prescription) {
        await prescriptionApi.update(prescription.id, {
          diagnosis: formData.diagnosis,
          notes: formData.notes,
        });
      } else {
        await prescriptionApi.create({
          ...formData,
          medicines,
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {prescription ? 'View Prescription' : 'New Prescription'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value, appointmentId: '' })}
                  disabled={!!prescription}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-60"
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
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value, appointmentId: '' })}
                  disabled={!!prescription}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-60"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} - {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment</label>
              <select
                required
                value={formData.appointmentId}
                onChange={(e) => handleAppointmentChange(e.target.value)}
                disabled={!!prescription || appointmentsLoading || (!formData.patientId && !formData.doctorId)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-60"
              >
                <option value="">
                  {appointmentsLoading ? 'Loading...' : !formData.patientId && !formData.doctorId ? 'Select patient or doctor first' : 'Select Appointment'}
                </option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {new Date(a.appointmentDate).toLocaleDateString()} - {a.reason} (Dr. {a.doctorName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnosis</label>
              <textarea
                required
                rows={2}
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
                placeholder="Enter diagnosis"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Medicines</label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </button>
              </div>

              <div className="space-y-4">
                {medicines.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No medicines added yet</p>
                    <p className="text-sm text-gray-400">Click "Add Medicine" to add medicines to this prescription</p>
                  </div>
                ) : (
                  medicines.map((medicine, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Medicine #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Medicine Name</label>
                          <MedicineSearchInput
                            value={medicine.name}
                            onChange={(value) => handleMedicineChange(index, 'name', value)}
                            onSelect={(med) => handleMedicineSelect(index, med)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                          <select
                            required
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">Select Dosage</option>
                            {dosageOptions.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Amount</label>
                          <input
                            type="text"
                            required
                            value={medicine.amount}
                            onChange={(e) => handleMedicineChange(index, 'amount', e.target.value)}
                            placeholder="e.g., 10 tablets, 1 bottle"
                            className="w-full px-3 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                          <select
                            required
                            value={medicine.routine}
                            onChange={(e) => handleMedicineChange(index, 'routine', e.target.value)}
                            className="w-full px-3 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">Select Frequency</option>
                            {routineOptions.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Duration (days)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="365"
                            value={medicine.durationDays}
                            onChange={(e) => handleMedicineChange(index, 'durationDays', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Instructions (optional)</label>
                          <input
                            type="text"
                            value={medicine.instructions || ''}
                            onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                            placeholder="e.g., Take after food, Avoid alcohol"
                            className="w-full px-3 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes (optional)</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
                placeholder="Enter any additional notes for the patient"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || medicines.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium shadow-lg shadow-blue-600/25 transition-all duration-200 inline-flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
