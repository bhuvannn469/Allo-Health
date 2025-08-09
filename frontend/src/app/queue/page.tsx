'use client';

import { Layout } from '@/components/Layout';
import { QueueManagement } from '@/components/QueueManagement';

export default function QueuePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-gray-600 mt-2">
            Manage the real-time patient queue and workflow
          </p>
        </div>
        
        <QueueManagement />
      </div>
    </Layout>
  );
}
