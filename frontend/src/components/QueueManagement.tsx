'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '@/lib/api';
import { 
  Clock, 
  User, 
  Phone, 
  Trash2, 
  ArrowRight,
  UserPlus,
  SkipForward,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QueueItem {
  id: number;
  queueNumber: number;
  priority: number;
  status: 'waiting' | 'with_doctor' | 'completed' | 'skipped';
  notes?: string;
  createdAt: string; // backend field
  patient?: {
    id?: number;
    name: string;
    phone: string;
  };
  patientPhone?: string; // fallback if older shape
  patientName?: string;  // fallback
}

export function QueueManagement() {
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    phone: '',
    name: '',
    priority: 1,
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch queue data with auto-refresh
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['queue'],
    queryFn: () => queueApi.getQueue(),
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

  const queue = queueData?.data || [];

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientData.phone) {
      toast.error('Phone number is required');
      return;
    }

    addToQueueMutation.mutate({
      patientPhone: newPatientData.phone,
      patientName: newPatientData.name || undefined,
      priority: newPatientData.priority,
      notes: newPatientData.notes || undefined,
    });
  };

  // Add patient to queue mutation
  const addToQueueMutation = useMutation({
    mutationFn: queueApi.addToQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
      setIsAddingPatient(false);
      setNewPatientData({ phone: '', name: '', priority: 1, notes: '' });
      toast.success('Patient added to queue successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add patient to queue');
    },
  });

  // Update queue status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      queueApi.updateQueueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
      toast.success('Queue status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update queue status');
    },
  });

  // Skip queue mutation
  const skipQueueMutation = useMutation({
    mutationFn: queueApi.skipQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
      toast.success('Patient skipped in queue');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to skip patient');
    },
  });

  // Remove from queue mutation
  const removeFromQueueMutation = useMutation({
    mutationFn: queueApi.removeFromQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
      toast.success('Patient removed from queue');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove patient from queue');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'with_doctor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-red-600 font-bold';
    if (priority >= 3) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  const getWaitTime = (joinedAt: string) => {
    const joined = new Date(joinedAt);
    const now = new Date();
    const diffMs = now.getTime() - joined.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const getBorderStyle = (status: string) => {
    if (status === 'waiting') return 'border-blue-200 bg-blue-50';
    if (status === 'with_doctor') return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  const getQueueNumberStyle = (status: string) => {
    if (status === 'waiting') return 'bg-blue-200 text-blue-800';
    if (status === 'with_doctor') return 'bg-orange-200 text-orange-800';
    return 'bg-gray-200 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Queue Management</h3>
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
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="card-title">Queue Management</h3>
            <p className="card-description">
              Real-time patient queue with live updates every 10 seconds
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
        {/* Add Patient Form */}
        {isAddingPatient && (
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patient-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="patient-phone"
                    type="tel"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    value={newPatientData.name}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter patient name (optional)"
                  />
                </div>
                
                <div>
                  <label htmlFor="patient-priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="patient-priority"
                    value={newPatientData.priority}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="input"
                  >
                    <option value={1}>Low (1)</option>
                    <option value={2}>Normal (2)</option>
                    <option value={3}>Medium (3)</option>
                    <option value={4}>High (4)</option>
                    <option value={5}>Emergency (5)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="patient-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <input
                    id="patient-notes"
                    type="text"
                    value={newPatientData.notes}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input"
                    placeholder="Additional notes (optional)"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addToQueueMutation.isPending}
                  className="btn btn-primary"
                >
                  {addToQueueMutation.isPending ? 'Adding...' : 'Add to Queue'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPatient(false);
                    setNewPatientData({ phone: '', name: '', priority: 1, notes: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Queue List */}
        <div className="space-y-3">
          {queue.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">Queue is empty</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add patients to get started with queue management
              </p>
            </div>
          ) : (
            queue.map((item: QueueItem) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 ${getBorderStyle(item.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Queue Number */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getQueueNumberStyle(item.status)}`}>
                      {item.queueNumber}
                    </div>
                    
                    {/* Patient Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {item.patient?.name || item.patientName || 'Walk-in Patient'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                          Priority {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {item.patientPhone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          Waiting: {getWaitTime(item.createdAt || new Date().toISOString())}
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">📝 {item.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
          {item.status === 'waiting' && (
                        <>
                          <button
            onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'with_doctor' })}
                            disabled={updateStatusMutation.isPending}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                            title="Call Patient"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => skipQueueMutation.mutate(item.id)}
                            disabled={skipQueueMutation.isPending}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
                            title="Skip Patient"
                          >
                            <SkipForward className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {item.status === 'with_doctor' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'completed' })}
                          disabled={updateStatusMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                          title="Mark Completed"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      
                      {(item.status === 'waiting' || item.status === 'skipped') && (
                        <button
                          onClick={() => removeFromQueueMutation.mutate(item.id)}
                          disabled={removeFromQueueMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Remove from Queue"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
  );
}
