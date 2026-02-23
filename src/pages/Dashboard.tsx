import { useQuery } from '@tanstack/react-query';
import { patientApi } from '../api/patients';
import { doctorApi } from '../api/doctors';
import { appointmentApi } from '../api/appointments';
import { Users, Stethoscope, Calendar, Activity } from 'lucide-react';

export default function Dashboard() {
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: patientApi.getAll,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorApi.getAll,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentApi.getAll,
  });

  const todayAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  );

  const stats = [
    { name: 'Total Patients', value: patients.length, icon: Users, color: 'bg-blue-500' },
    { name: 'Total Doctors', value: doctors.length, icon: Stethoscope, color: 'bg-green-500' },
    { name: 'Total Appointments', value: appointments.length, icon: Calendar, color: 'bg-purple-500' },
    { name: "Today's Appointments", value: todayAppointments.length, icon: Activity, color: 'bg-orange-500' },
  ];

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'Scheduled' || a.status === 'Rescheduled')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-md`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
        </div>
        <div className="overflow-x-auto">
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No upcoming appointments
                  </td>
                </tr>
              ) : (
                upcomingAppointments.map((appointment) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
