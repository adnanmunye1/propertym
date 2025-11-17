'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/layout/global-search';
import { LogOut, User } from 'lucide-react';

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          {/* Page title will be handled by individual pages */}
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search */}
          <GlobalSearch />
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-blue-500 rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

