import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: 'payment' | 'invoice' | 'unit' | 'tenant';
}

export function StatusBadge({ status, type = 'payment' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const statusLower = status.toLowerCase();
    
    // Payment statuses
    if (type === 'payment') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    
    // Invoice statuses
    if (type === 'invoice') {
      if (statusLower === 'paid') {
        return 'bg-green-100 text-green-800 border-green-200';
      }
      if (statusLower === 'pending') {
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      }
      if (statusLower === 'overdue' || statusLower === 'partially_paid') {
        return 'bg-red-100 text-red-800 border-red-200';
      }
    }
    
    // Unit statuses
    if (type === 'unit') {
      if (statusLower === 'occupied') {
        return 'bg-green-100 text-green-800 border-green-200';
      }
      if (statusLower === 'vacant') {
        return 'bg-red-100 text-red-800 border-red-200';
      }
      if (statusLower === 'reserved') {
        return 'bg-blue-100 text-blue-800 border-blue-200';
      }
      if (statusLower === 'inactive') {
        return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    // Tenant statuses
    if (type === 'tenant') {
      if (statusLower === 'active') {
        return 'bg-green-100 text-green-800 border-green-200';
      }
      if (statusLower === 'notice_given') {
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      }
      if (statusLower === 'former') {
        return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    // Default
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles()
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

