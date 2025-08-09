'use client';

import { Layout } from '@/components/Layout';
import { AppointmentScheduling } from '@/components/AppointmentScheduling';

export default function AppointmentsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage and schedule patient appointments
          </p>
        </div>
        
        <AppointmentScheduling />
      </div>
    </Layout>
  );
}
