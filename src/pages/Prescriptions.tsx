import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { prescriptionApi } from '../api/prescriptions';
import { Plus, Printer, Search, FileText, Calendar, Stethoscope, Pill, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Prescription } from '../types';
import PrescriptionModal from '../components/modals/PrescriptionModal';

export default function Prescriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{
    type: 'create' | 'view' | null;
    prescription?: Prescription;
  }>({ type: null });

  const canCreate = user?.role === 'Doctor' || user?.role === 'Admin' || user?.role === 'HospitalEmployee';

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getAll,
  });

  const filteredPrescriptions = prescriptions.filter((p) =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (prescription: Prescription) => {
    setModalState({ type: 'view', prescription });
    setTimeout(() => {
      const printContent = printRef.current;
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Prescription - ${prescription.patientName}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
                .prescription { max-width: 800px; margin: 0 auto; border: 2px solid #2563eb; border-radius: 12px; overflow: hidden; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { font-size: 28px; margin-bottom: 5px; }
                .header p { font-size: 14px; opacity: 0.9; }
                .content { padding: 30px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; }
                .info-item label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                .info-item span { font-size: 16px; font-weight: 600; color: #1e293b; }
                .diagnosis { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px; }
                .diagnosis h3 { color: #92400e; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
                .diagnosis p { font-size: 18px; color: #1e293b; font-weight: 500; }
                .medicines h3 { font-size: 18px; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
                .medicine-item { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px; page-break-inside: avoid; }
                .medicine-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .medicine-name { font-size: 16px; font-weight: 700; color: #2563eb; }
                .medicine-dosage { background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                .medicine-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 14px; }
                .medicine-details div { color: #64748b; }
                .medicine-details span { color: #1e293b; font-weight: 500; }
                .instructions { margin-top: 10px; padding: 12px; background: #f0fdf4; border-radius: 6px; font-size: 13px; color: #166534; }
                .notes { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
                .notes h4 { font-size: 14px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
                .notes p { color: #1e293b; }
                .footer { background: #1e293b; color: white; padding: 20px; text-align: center; }
                .footer p { font-size: 12px; opacity: 0.8; }
                .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
                .signature div { text-align: center; }
                .signature-line { width: 200px; border-top: 1px solid #1a1a1a; margin-top: 40px; padding-top: 10px; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }, 100);
  };

  const PrintContent = ({ prescription }: { prescription: Prescription }) => (
    <div ref={printRef} className="prescription">
      <div className="header">
        <h1>HospitalCare</h1>
        <p>Medical Prescription</p>
      </div>
      <div className="content">
        <div className="info-grid">
          <div className="info-item">
            <label>Patient Name</label>
            <span>{prescription.patientName}</span>
          </div>
          <div className="info-item">
            <label>Doctor</label>
            <span>Dr. {prescription.doctorName}</span>
          </div>
          <div className="info-item">
            <label>Date</label>
            <span>{new Date(prescription.prescriptionDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="info-item">
            <label>Prescription ID</label>
            <span>{prescription.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
        <div className="diagnosis">
          <h3>Diagnosis</h3>
          <p>{prescription.diagnosis}</p>
        </div>
        <div className="medicines">
          <h3>Medicines</h3>
          {prescription.medicines.map((medicine) => (
            <div key={medicine.id} className="medicine-item">
              <div className="medicine-header">
                <span className="medicine-name">{medicine.name}</span>
                <span className="medicine-dosage">{medicine.dosage}</span>
              </div>
              <div className="medicine-details">
                <div>Amount: <span>{medicine.amount}</span></div>
                <div>Frequency: <span>{medicine.routine}</span></div>
                <div>Duration: <span>{medicine.durationDays} days</span></div>
              </div>
              {medicine.instructions && (
                <div className="instructions">
                  <strong>Instructions:</strong> {medicine.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
        {prescription.notes && (
          <div className="notes">
            <h4>Additional Notes</h4>
            <p>{prescription.notes}</p>
          </div>
        )}
        <div className="signature">
          <div>
            <div className="signature-line"></div>
            <p>Doctor Signature</p>
          </div>
          <div>
            <div className="signature-line"></div>
            <p>Patient Acknowledgment</p>
          </div>
        </div>
      </div>
      <div className="footer">
        <p>This prescription is valid for 30 days from the date of issue.</p>
        <p>HospitalCare - Providing Quality Healthcare</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 mt-1">View and manage all prescriptions</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalState({ type: 'create' })}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium shadow-lg shadow-blue-600/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Prescription
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-5 hover:bg-gray-50/50 transition-colors duration-150">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{prescription.patientName}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>Dr. {prescription.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(prescription.prescriptionDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
                      <Pill className="h-4 w-4" />
                      {prescription.medicines.length} {prescription.medicines.length === 1 ? 'Medicine' : 'Medicines'}
                    </div>
                    <button
                      onClick={() => handlePrint(prescription)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                      title="Print Prescription"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {user?.role === 'Doctor' || user?.role === 'Admin' ? (
                      <button
                        onClick={() => setModalState({ type: 'create', prescription })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="Edit"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {prescription.medicines.slice(0, 3).map((medicine) => (
                      <span
                        key={medicine.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        <Pill className="h-3 w-3" />
                        {medicine.name} - {medicine.dosage}
                      </span>
                    ))}
                    {prescription.medicines.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{prescription.medicines.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalState.type === 'create' && (
        <PrescriptionModal
          prescription={modalState.prescription}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            setModalState({ type: null });
          }}
          onClose={() => setModalState({ type: null })}
        />
      )}

      {modalState.type === 'view' && modalState.prescription && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Prescription Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const printContent = printRef.current;
                    if (printContent) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Prescription - ${modalState.prescription?.patientName}</title>
                            <style>
                              * { margin: 0; padding: 0; box-sizing: border-box; }
                              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
                              .prescription { max-width: 800px; margin: 0 auto; border: 2px solid #2563eb; border-radius: 12px; overflow: hidden; }
                              .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
                              .header h1 { font-size: 28px; margin-bottom: 5px; }
                              .header p { font-size: 14px; opacity: 0.9; }
                              .content { padding: 30px; }
                              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                              .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; }
                              .info-item label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                              .info-item span { font-size: 16px; font-weight: 600; color: #1e293b; }
                              .diagnosis { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px; }
                              .diagnosis h3 { color: #92400e; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
                              .diagnosis p { font-size: 18px; color: #1e293b; font-weight: 500; }
                              .medicines h3 { font-size: 18px; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
                              .medicine-item { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px; page-break-inside: avoid; }
                              .medicine-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                              .medicine-name { font-size: 16px; font-weight: 700; color: #2563eb; }
                              .medicine-dosage { background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                              .medicine-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 14px; }
                              .medicine-details div { color: #64748b; }
                              .medicine-details span { color: #1e293b; font-weight: 500; }
                              .instructions { margin-top: 10px; padding: 12px; background: #f0fdf4; border-radius: 6px; font-size: 13px; color: #166534; }
                              .notes { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
                              .notes h4 { font-size: 14px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
                              .notes p { color: #1e293b; }
                              .footer { background: #1e293b; color: white; padding: 20px; text-align: center; }
                              .footer p { font-size: 12px; opacity: 0.8; }
                              .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
                              .signature div { text-align: center; }
                              .signature-line { width: 200px; border-top: 1px solid #1a1a1a; margin-top: 40px; padding-top: 10px; }
                              @media print { body { padding: 0; } }
                            </style>
                          </head>
                          <body>
                            ${printContent.innerHTML}
                          </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => setModalState({ type: null })}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <PrintContent prescription={modalState.prescription!} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
