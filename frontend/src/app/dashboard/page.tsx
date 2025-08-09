'use client';

import { QueueManagement } from '@/components/QueueManagement';
import { AppointmentScheduling } from '@/components/AppointmentScheduling';
import { Calendar, Clock, Users, AlertCircle, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  // Mock data for now since auth is bypassed
  const queueStats = {
    data: {
      waiting: 5,
      withDoctor: 2,
      completed: 12
    }
  };

  const appointments = {
    data: [
      {
        id: 1,
        patient: { name: 'Alice Johnson' },
        doctor: { name: 'Dr. Smith' },
        scheduledAt: new Date().toISOString(),
        status: 'booked'
      },
      {
        id: 2,
        patient: { name: 'Bob Wilson' },
        doctor: { name: 'Dr. Brown' },
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        status: 'booked'
      }
    ]
  };

  const stats = [
    {
      name: 'Patients in Queue',
      value: queueStats?.data?.waiting || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Today\'s Appointments',
      value: appointments?.data?.length || 0,
      change: '+5%',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'With Doctor',
      value: queueStats?.data?.withDoctor || 0,
      change: '0%',
      changeType: 'neutral' as const,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Completed Today',
      value: queueStats?.data?.completed || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the Clinic Front Desk System - Real-time overview of your clinic operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                      <p className={`ml-2 flex items-baseline text-sm font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Live Queue Status
              </h3>
              <p className="card-description">
                Current patient queue status with real-time updates
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                    <span className="font-medium text-blue-900">Waiting</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {queueStats?.data?.waiting || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse mr-3"></div>
                    <span className="font-medium text-orange-900">With Doctor</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {queueStats?.data?.withDoctor || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-green-900">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {queueStats?.data?.completed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments Preview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Today's Schedule
              </h3>
              <p className="card-description">
                Quick overview of {format(new Date(), 'MMM dd, yyyy')} appointments
              </p>
            </div>
            <div className="card-content">
              {appointments?.data && appointments.data.length > 0 ? (
                <div className="space-y-3">
                  {appointments.data.slice(0, 4).map((appointment: any) => {
                    const getStatusColor = (status: string) => {
                      if (status === 'booked') return 'bg-blue-100 text-blue-800';
                      if (status === 'completed') return 'bg-green-100 text-green-800';
                      return 'bg-red-100 text-red-800';
                    };

                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.patient?.name || appointment.patientName || 'Patient'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Dr. {appointment.doctor?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(appointment.scheduledAt), 'h:mm a')}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {appointments.data.length > 4 && (
                    <p className="text-sm text-gray-500 text-center pt-2 border-t">
                      +{appointments.data.length - 4} more appointments
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No appointments today
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Perfect day for walk-ins!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Queue Management */}
        <QueueManagement />

        {/* Appointment Scheduling */}
        <AppointmentScheduling />
      </div>
    );
}
