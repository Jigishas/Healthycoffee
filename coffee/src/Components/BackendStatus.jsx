import React from 'react';
import { Badge } from './ui/badge';
import useBackendHealth from '../hooks/useBackendHealth';

const BackendStatus = () => {
  const { isOnline, isOffline, lastChecked } = useBackendHealth();

  const getStatusColor = () => {
    if (isOnline) return 'bg-green-500';
    if (isOffline) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (isOffline) return 'Offline';
    return 'Checking...';
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    return lastChecked.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-gray-600">Backend:</span>
        <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
          {getStatusText()}
        </Badge>
      </div>
      {lastChecked && (
        <span className="text-gray-500 text-xs">
          (checked {formatLastChecked()})
        </span>
      )}
    </div>
  );
};

export default BackendStatus;
