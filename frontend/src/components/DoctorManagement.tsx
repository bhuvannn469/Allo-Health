'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api';
import { 
  Stethoscope, 
  Phone, 
  Mail, 
  MapPin,
  Edit3, 
  Trash2,
  UserPlus,
  Search,
  Clock,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

const specializations = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology',
  'Other'
];

export function DoctorManagement() {
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [newDoctorData, setNewDoctorData] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    location: ''
  });

  const queryClient = useQueryClient();

  // Fetch doctors with search and filter
  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ['doctors', searchTerm, filterSpecialization],
    queryFn: () => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterSpecialization) params.specialization = filterSpecialization;
      return doctorApi.getDoctors(Object.keys(params).length ? params : {});
    },
  });

  const doctors = doctorsData?.data || [];

  // Create doctor mutation
  const createDoctorMutation = useMutation({
    mutationFn: doctorApi.createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsAddingDoctor(false);
      setNewDoctorData({ name: '', specialization: '', phone: '', email: '', location: '' });
      toast.success('Doctor created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    },
  });

  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      doctorApi.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setEditingDoctor(null);
      toast.success('Doctor updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: doctorApi.deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    },
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorData.name || !newDoctorData.specialization || !newDoctorData.phone) {
      toast.error('Name, specialization, and phone are required');
      return;
    }

    createDoctorMutation.mutate({
      name: newDoctorData.name,
      specialization: newDoctorData.specialization,
      phone: newDoctorData.phone,
      email: newDoctorData.email || undefined,
      location: newDoctorData.location || undefined,
    });
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    updateDoctorMutation.mutate({
      id: editingDoctor.id,
      data: editingDoctor,
    });
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
      deleteDoctorMutation.mutate(doctor.id);
    }
  };

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      'General Practice': 'bg-blue-100 text-blue-800',
      'Cardiology': 'bg-red-100 text-red-800',
      'Dermatology': 'bg-pink-100 text-pink-800',
      'Endocrinology': 'bg-purple-100 text-purple-800',
      'Gastroenterology': 'bg-green-100 text-green-800',
      'Neurology': 'bg-indigo-100 text-indigo-800',
      'Orthopedics': 'bg-yellow-100 text-yellow-800',
      'Pediatrics': 'bg-cyan-100 text-cyan-800',
      'Psychiatry': 'bg-violet-100 text-violet-800',
      'Radiology': 'bg-gray-100 text-gray-800',
      'Surgery': 'bg-orange-100 text-orange-800',
      'Urology': 'bg-teal-100 text-teal-800',
    };
    return colors[specialization as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Doctor Management</h3>
        </div>
        <div className="card-content">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="card-title">Doctor Management</h3>
              <p className="card-description">
                Manage doctor profiles and specializations
              </p>
            </div>
            <button
              onClick={() => setIsAddingDoctor(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Doctor
            </button>
          </div>
        </div>
        
        <div className="card-content">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search doctors by name or phone..."
              />
            </div>
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="input w-48"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Doctor Form */}
      {isAddingDoctor && (
        <div className="card border-2 border-blue-200">
          <div className="card-header bg-blue-50">
            <h3 className="card-title text-blue-900">Add New Doctor</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doctor-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name *
                  </label>
                  <input
                    id="doctor-name"
                    type="text"
                    value={newDoctorData.name}
                    onChange={(e) => setNewDoctorData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="doctor-specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <select
                    id="doctor-specialization"
                    value={newDoctorData.specialization}
                    onChange={(e) => setNewDoctorData(prev => ({ ...prev, specialization: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="doctor-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="doctor-phone"
                    type="tel"
                    value={newDoctorData.phone}
                    onChange={(e) => setNewDoctorData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="doctor-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="doctor-email"
                    type="email"
                    value={newDoctorData.email}
                    onChange={(e) => setNewDoctorData(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="Enter email address (optional)"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="doctor-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Office
                </label>
                <input
                  id="doctor-location"
                  type="text"
                  value={newDoctorData.location}
                  onChange={(e) => setNewDoctorData(prev => ({ ...prev, location: e.target.value }))}
                  className="input"
                  placeholder="Enter office location or room number (optional)"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createDoctorMutation.isPending}
                  className="btn btn-primary"
                >
                  {createDoctorMutation.isPending ? 'Creating...' : 'Create Doctor'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingDoctor(false);
                    setNewDoctorData({ name: '', specialization: '', phone: '', email: '', location: '' });
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

      {/* Edit Doctor Form */}
      {editingDoctor && (
        <div className="card border-2 border-orange-200">
          <div className="card-header bg-orange-50">
            <h3 className="card-title text-orange-900">Edit Doctor</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleUpdateDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-doctor-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name *
                  </label>
                  <input
                    id="edit-doctor-name"
                    type="text"
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-doctor-specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <select
                    id="edit-doctor-specialization"
                    value={editingDoctor.specialization}
                    onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                    className="input"
                    required
                  >
                    <option value="">Select specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-doctor-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="edit-doctor-phone"
                    type="tel"
                    value={editingDoctor.phone}
                    onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-doctor-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="edit-doctor-email"
                    type="email"
                    value={editingDoctor.email || ''}
                    onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="input"
                    placeholder="Enter email address (optional)"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="edit-doctor-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Office
                </label>
                <input
                  id="edit-doctor-location"
                  type="text"
                  value={editingDoctor.location || ''}
                  onChange={(e) => setEditingDoctor(prev => prev ? { ...prev, location: e.target.value } : null)}
                  className="input"
                  placeholder="Enter office location or room number (optional)"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateDoctorMutation.isPending}
                  className="btn btn-primary"
                >
                  {updateDoctorMutation.isPending ? 'Updating...' : 'Update Doctor'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            All Doctors ({doctors.length})
          </h3>
          <p className="card-description">
            Complete list of registered doctors
          </p>
        </div>
        
        <div className="card-content">
          <div className="space-y-4">
            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No doctors found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || filterSpecialization 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Add your first doctor to get started'}
                </p>
              </div>
            ) : (
              doctors.map((doctor: Doctor) => (
                <div
                  key={doctor.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-blue-600" />
                      </div>
                      
                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Dr. {doctor.name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecializationColor(doctor.specialization)}`}>
                            {doctor.specialization}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {doctor.phone}
                          </div>
                          {doctor.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {doctor.email}
                            </div>
                          )}
                          {doctor.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {doctor.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Joined: {format(new Date(doctor.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Available Today
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            5 appointments scheduled
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingDoctor(doctor)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit Doctor"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor)}
                        disabled={deleteDoctorMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete Doctor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
