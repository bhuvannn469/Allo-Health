'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin,
  Edit3, 
  Trash2,
  UserPlus,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Patient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export function PatientManagement() {
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: ''
  });

  const queryClient = useQueryClient();

  // Fetch patients with search
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: () => patientApi.getPatients(searchTerm ? { search: searchTerm } : {}),
  });

  const patients = patientsData?.data || [];

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: patientApi.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsAddingPatient(false);
      setNewPatientData({ name: '', phone: '', email: '', dateOfBirth: '', address: '' });
      toast.success('Patient created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create patient');
    },
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      patientApi.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setEditingPatient(null);
      toast.success('Patient updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    },
  });

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: patientApi.deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    },
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientData.name || !newPatientData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    createPatientMutation.mutate({
      name: newPatientData.name,
      phone: newPatientData.phone,
      email: newPatientData.email || undefined,
      dateOfBirth: newPatientData.dateOfBirth || undefined,
      address: newPatientData.address || undefined,
    });
  };

  const handleUpdatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    updatePatientMutation.mutate({
      id: editingPatient.id,
      data: editingPatient,
    });
  };

  const handleDeletePatient = (patient: Patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      deletePatientMutation.mutate(patient.id);
    }
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Patient Management</h3>
        </div>
        <div className="card-content">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
              <h3 className="card-title">Patient Management</h3>
              <p className="card-description">
                Manage patient records and information
              </p>
            </div>
            <button
              onClick={() => setIsAddingPatient(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Patient
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
                placeholder="Search patients by name or phone..."
              />
            </div>
            <button className="btn btn-secondary flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Add Patient Form */}
      {isAddingPatient && (
        <div className="card border-2 border-blue-200">
          <div className="card-header bg-blue-50">
            <h3 className="card-title text-blue-900">Add New Patient</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    value={newPatientData.name}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="patient-phone-new" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="patient-phone-new"
                    type="tel"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="patient-email-new" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="patient-email-new"
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="Enter email address (optional)"
                  />
                </div>
                
                <div>
                  <label htmlFor="patient-dob-new" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="patient-dob-new"
                    type="date"
                    value={newPatientData.dateOfBirth}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="patient-address-new" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="patient-address-new"
                  value={newPatientData.address}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, address: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Enter full address (optional)"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="btn btn-primary"
                >
                  {createPatientMutation.isPending ? 'Creating...' : 'Create Patient'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPatient(false);
                    setNewPatientData({ name: '', phone: '', email: '', dateOfBirth: '', address: '' });
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

      {/* Edit Patient Form */}
      {editingPatient && (
        <div className="card border-2 border-orange-200">
          <div className="card-header bg-orange-50">
            <h3 className="card-title text-orange-900">Edit Patient</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleUpdatePatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-patient-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    id="edit-patient-name"
                    type="text"
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-patient-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="edit-patient-phone"
                    type="tel"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-patient-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="edit-patient-email"
                    type="email"
                    value={editingPatient.email || ''}
                    onChange={(e) => setEditingPatient(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="input"
                    placeholder="Enter email address (optional)"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-patient-dob" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="edit-patient-dob"
                    type="date"
                    value={editingPatient.dateOfBirth || ''}
                    onChange={(e) => setEditingPatient(prev => prev ? { ...prev, dateOfBirth: e.target.value } : null)}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="edit-patient-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="edit-patient-address"
                  value={editingPatient.address || ''}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, address: e.target.value } : null)}
                  className="input"
                  rows={3}
                  placeholder="Enter full address (optional)"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updatePatientMutation.isPending}
                  className="btn btn-primary"
                >
                  {updatePatientMutation.isPending ? 'Updating...' : 'Update Patient'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patients List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            All Patients ({patients.length})
          </h3>
          <p className="card-description">
            Complete list of registered patients
          </p>
        </div>
        
        <div className="card-content">
          <div className="space-y-3">
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No patients found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first patient to get started'}
                </p>
              </div>
            ) : (
              patients.map((patient: Patient) => (
                <div
                  key={patient.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      {/* Patient Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {patient.name}
                          </h4>
                          {patient.dateOfBirth && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              Age: {getAge(patient.dateOfBirth)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </div>
                          )}
                          {patient.dateOfBirth && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                        {patient.address && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {patient.address}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Registered: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit Patient"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient)}
                        disabled={deletePatientMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete Patient"
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
