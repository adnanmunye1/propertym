'use client';

import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <Card className="p-12">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-600 mb-2">Coming Soon</p>
          <p className="text-sm text-gray-500">
            User preferences, password management, and system settings will be available in future updates.
          </p>
        </div>
      </Card>
    </div>
  );
}

