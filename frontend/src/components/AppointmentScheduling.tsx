'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, doctorApi } from '@/lib/api';
import { 
  Calendar, 
  User, 
  Phone, 
  Edit3, 
  Trash2,
  CalendarPlus,
  Stethoscope
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  patientPhone: string;
  patientName?: string;
  doctorId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: 'booked' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  doctor?: {
    id: number;
    name: string;
    specialization: string;
  };
  patient?: {
    id: number;
    name: string;
    phone: string;
  };
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  location?: string;
}

export function AppointmentScheduling() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    patientPhone: '',
    patientName: '',
    doctorId: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch appointments for selected date
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () => appointmentApi.getAppointments({ date: selectedDate }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch doctors
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorApi.getDoctors(),
  });

  const appointments = appointmentsData?.data || [];
  const doctors = doctorsData?.data || [];

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: appointmentApi.bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsBookingAppointment(false);
      setNewAppointmentData({
        patientPhone: '',
        patientName: '',
        doctorId: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        duration: 30,
        notes: ''
      });
      toast.success('Appointment booked successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      appointmentApi.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    },
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: appointmentApi.cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointmentData.patientPhone || !newAppointmentData.doctorId) {
      toast.error('Patient phone and doctor are required');
      return;
    }

    const scheduledAt = `${newAppointmentData.date}T${newAppointmentData.time}:00`;
    
    bookAppointmentMutation.mutate({
      patientPhone: newAppointmentData.patientPhone,
      patientName: newAppointmentData.patientName || undefined,
      doctorId: newAppointmentData.doctorId,
      scheduledAt,
      durationMinutes: newAppointmentData.duration,
      notes: newAppointmentData.notes || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const isSlotBooked = (date: string, time: string) => {
    return appointments.some((apt: Appointment) => {
      const aptDate = format(new Date(apt.scheduledAt), 'yyyy-MM-dd');
      const aptTime = format(new Date(apt.scheduledAt), 'HH:mm');
      return aptDate === date && aptTime === time && apt.status !== 'cancelled';
    });
  };

  if (appointmentsLoading || doctorsLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Appointment Scheduling</h3>
        </div>
        <div className="card-content">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector and Book Button */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="card-title">Appointment Scheduling</h3>
              <p className="card-description">
                Manage appointments and schedules
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <input
                  id="appointment-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setIsBookingAppointment(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Form */}
      {isBookingAppointment && (
        <div className="card border-2 border-blue-200">
          <div className="card-header bg-blue-50">
            <h3 className="card-title text-blue-900">Book New Appointment</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apt-patient-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Phone *
                  </label>
                  <input
                    id="apt-patient-phone"
                    type="tel"
                    value={newAppointmentData.patientPhone}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="apt-patient-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    id="apt-patient-name"
                    type="text"
                    value={newAppointmentData.patientName}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, patientName: e.target.value }))}
                    className="input"
                    placeholder="Enter patient name (optional)"
                  />
                </div>
                
                <div>
                  <label htmlFor="apt-doctor" className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>
                  <select
                    id="apt-doctor"
                    value={newAppointmentData.doctorId}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, doctorId: parseInt(e.target.value) }))}
                    className="input"
                    required
                  >
                    <option value={0}>Select a doctor</option>
                    {doctors.map((doctor: Doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="apt-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    id="apt-date"
                    type="date"
                    value={newAppointmentData.date}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                    className="input"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="apt-time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <select
                    id="apt-time"
                    value={newAppointmentData.time}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                    className="input"
                    required
                  >
                    {getTimeSlots().map(time => {
                      const isBooked = isSlotBooked(newAppointmentData.date, time);
                      return (
                        <option key={time} value={time} disabled={isBooked}>
                          {time} {isBooked ? '(Booked)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="apt-duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    id="apt-duration"
                    value={newAppointmentData.duration}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="input"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="apt-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="apt-notes"
                  value={newAppointmentData.notes}
                  onChange={(e) => setNewAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Additional notes (optional)"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={bookAppointmentMutation.isPending}
                  className="btn btn-primary"
                >
                  {bookAppointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingAppointment(false);
                    setNewAppointmentData({
                      patientPhone: '',
                      patientName: '',
                      doctorId: 0,
                      date: format(new Date(), 'yyyy-MM-dd'),
                      time: '09:00',
                      duration: 30,
                      notes: ''
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Appointments for {format(new Date(selectedDate), 'MMM dd, yyyy')}
          </h3>
          <p className="card-description">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        
        <div className="card-content">
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No appointments</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No appointments scheduled for this date
                </p>
              </div>
            ) : (
              appointments
                .sort((a: Appointment, b: Appointment) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Time */}
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-sm font-bold text-gray-900">
                            {format(new Date(appointment.scheduledAt), 'HH:mm')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.durationMinutes}min
                          </div>
                        </div>
                        
                        {/* Appointment Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {appointment.patient?.name || appointment.patientName || 'Patient'}
                            </span>
                            <Phone className="h-3 w-3 text-gray-400 ml-2" />
                            <span className="text-sm text-gray-600">
                              {appointment.patientPhone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Stethoscope className="h-3 w-3" />
                            <span>Dr. {appointment.doctor?.name || 'Unknown'}</span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {appointment.doctor?.specialization || 'General'}
                            </span>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-1">📝 {appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          {appointment.status === 'booked' && (
                            <>
                              <button
                                onClick={() => updateAppointmentMutation.mutate({ 
                                  id: appointment.id, 
                                  data: { status: 'completed' } 
                                })}
                                disabled={updateAppointmentMutation.isPending}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                title="Mark Completed"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                disabled={cancelAppointmentMutation.isPending}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                title="Cancel Appointment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {appointment.status === 'completed' && (
                            <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
