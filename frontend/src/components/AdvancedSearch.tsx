'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientApi, doctorApi, appointmentApi } from '@/lib/api';
import { 
  Search, 
  Filter,
  User,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

type SearchType = 'patients' | 'doctors' | 'appointments';

export function AdvancedSearch() {
  const [searchType, setSearchType] = useState<SearchType>('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['advancedSearch', searchType, searchQuery, filters],
    queryFn: async () => {
      if (!searchQuery.trim() && !Object.values(filters).some(v => v)) return [];

      setIsSearching(true);
      try {
        switch (searchType) {
          case 'patients': {
            const patientResponse = await patientApi.getPatients({
              search: searchQuery,
            });
            return patientResponse.data;
          }
          case 'doctors': {
            const doctorResponse = await doctorApi.getDoctors({
              search: searchQuery,
              ...(filters.specialization && { specialization: filters.specialization }),
            });
            return doctorResponse.data;
          }
            
          case 'appointments': {
            const appointmentResponse = await appointmentApi.getAppointments({
              ...(filters.status && { status: filters.status }),
              ...(filters.dateFrom && { date: filters.dateFrom }),
            });
            return appointmentResponse.data;
          }
          default:
            return [];
        }
      } finally {
        setIsSearching(false);
      }
    },
    enabled: false,
  });

  const getAppointmentStatusClass = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'scheduled') return 'bg-blue-100 text-blue-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSearch = () => {
    setIsSearching(true);
    refetch();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      specialization: '',
      location: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const renderPatientResult = (patient: any) => (
    <div key={patient.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {patient.phone}
              </span>
              {patient.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {patient.email}
                </span>
              )}
            </div>
            {patient.address && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {patient.address}
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">
          Added {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
        </span>
      </div>
    </div>
  );

  const renderDoctorResult = (doctor: any) => (
    <div key={doctor.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Stethoscope className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-green-600 font-medium">{doctor.specialization}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {doctor.phone}
              </span>
              {doctor.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {doctor.email}
                </span>
              )}
            </div>
            {doctor.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {doctor.location}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointmentResult = (appointment: any) => (
    <div key={appointment.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
            <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(appointment.scheduledAt), 'MMM dd, yyyy HH:mm')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusClass(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
            {appointment.notes && (
              <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (isLoading || isSearching) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (searchResults && searchResults.length > 0) {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </h2>
          <div className="grid gap-4">
            {searchResults.map((result: any) => {
              switch (searchType) {
                case 'patients':
                  return renderPatientResult(result);
                case 'doctors':
                  return renderDoctorResult(result);
                case 'appointments':
                  return renderAppointmentResult(result);
                default:
                  return null;
              }
            })}
          </div>
        </div>
      );
    }

    if (searchQuery.trim() || Object.values(filters).some(v => v)) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No results found for your search criteria.</p>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Enter search terms or apply filters to find results.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
        <p className="text-gray-600">Search across patients, doctors, and appointments with advanced filters</p>
      </div>

      {/* Search Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'patients', label: 'Patients', icon: User },
          { key: 'doctors', label: 'Doctors', icon: Stethoscope },
          { key: 'appointments', label: 'Appointments', icon: Calendar }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchType(tab.key as SearchType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchType === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        {/* Main Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {searchType === 'doctors' && (
            <select
              value={filters.specialization}
              onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Specializations</option>
              <option value="General Practice">General Practice</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Other">Other</option>
            </select>
          )}

          {(searchType === 'patients' || searchType === 'doctors') && (
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}

          {searchType === 'appointments' && (
            <>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </>
          )}

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        {renderResults()}
      </div>
    </div>
  );
}
