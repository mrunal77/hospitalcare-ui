import { useQuery } from '@tanstack/react-query';
import { patientApi } from '../api/patients';
import { doctorApi } from '../api/doctors';
import { appointmentApi } from '../api/appointments';
import { Users, Stethoscope, Calendar, Activity, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: patientApi.getAll,
  });

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorApi.getAll,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentApi.getAll,
  });

  const isLoading = patientsLoading || doctorsLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  );

  const completedAppointments = appointments.filter((a) => a.status === 'Completed').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Rescheduled').length;

  const stats = [
    { 
      name: 'Total Patients', 
      value: patients.length, 
      icon: Users, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: '+12%'
    },
    { 
      name: 'Total Doctors', 
      value: doctors.length, 
      icon: Stethoscope, 
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      trend: '+5%'
    },
    { 
      name: 'Total Appointments', 
      value: appointments.length, 
      icon: Calendar, 
      color: 'bg-gradient-to-br from-violet-500 to-violet-600',
      trend: '+18%'
    },
    { 
      name: "Today's Appointments", 
      value: todayAppointments.length, 
      icon: Activity, 
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      trend: 'Today'
    },
  ];

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'Scheduled' || a.status === 'Rescheduled')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 6);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700 ring-blue-500/20';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 ring-red-500/20';
      case 'Rescheduled':
        return 'bg-amber-100 text-amber-700 ring-amber-500/20';
      default:
        return 'bg-gray-100 text-gray-700 ring-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Pending Appointments</p>
              <p className="text-3xl font-bold mt-1">{pendingAppointments}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Completed Appointments</p>
              <p className="text-3xl font-bold mt-1">{completedAppointments}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          </div>
          <span className="text-sm text-gray-500">{upcomingAppointments.length} appointments</span>
        </div>
        
        {upcomingAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {appointment.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">Dr. {appointment.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.durationMinutes} min</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusStyles(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
