// src/pages/admin/system/SystemStatus.js
import React, { useState, useEffect } from 'react';
import { 
  FiServer, FiDatabase, FiCpu, FiWifi, 
  FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw 
} from 'react-icons/fi';

const SystemStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    status: 'operational',
    components: [
      { id: 1, name: 'API Server', status: 'operational', lastChecked: 'Just now' },
      { id: 2, name: 'Database', status: 'operational', lastChecked: 'Just now' },
      { id: 3, name: 'Authentication', status: 'degraded', lastChecked: '2 minutes ago' },
      { id: 4, name: 'File Storage', status: 'operational', lastChecked: 'Just now' },
      { id: 5, name: 'Email Service', status: 'operational', lastChecked: '5 minutes ago' },
      { id: 6, name: 'Scheduler', status: 'outage', lastChecked: '10 minutes ago' },
    ]
  });

  const refreshStatus = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FiCheckCircle className="mr-1" /> Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <FiAlertCircle className="mr-1" /> Degraded
          </span>
        );
      case 'outage':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FiAlertCircle className="mr-1" /> Outage
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <FiClock className="mr-1" /> Unknown
          </span>
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <FiAlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <FiAlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Status</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor the health and status of system components
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium ${
              isRefreshing ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Status Overview</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Current Status:</span>
            {getStatusBadge(systemStatus.status)}
          </div>
        </div>
        
        <div className="space-y-4">
          {systemStatus.components.map((component) => (
            <div key={component.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-4">
                  <FiServer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{component.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last checked: {component.lastChecked}</p>
                </div>
              </div>
              <div className="flex items-center">
                {getStatusIcon(component.status)}
                <span className="ml-2 text-sm font-medium">
                  {component.status === 'operational' ? 'Operational' : 
                   component.status === 'degraded' ? 'Degraded' : 
                   component.status === 'outage' ? 'Outage' : 'Unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</h3>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Normal
            </span>
          </div>
          <div className="h-40 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-blue-500"
                  strokeWidth="10"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${65 * 2 * Math.PI}, ${100 * 2 * Math.PI}`}
                  strokeDashoffset={65 * 2 * Math.PI * 0.65}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">35%</span>
              </div>
            </div>
          </div>
        </div>
        {/* More metric cards... */}
      </div>
    </div>
  );
};

export default SystemStatus;