import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  // State for notifications and filters
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Notification types and their corresponding icons/colors
  const notificationTypes = {
    info: {
      icon: InformationCircleIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    success: {
      icon: CheckCircleIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    critical: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  // Fetch notifications (mock data for now)
  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockNotifications = [
          {
            id: 1,
            title: 'Energy Usage Alert',
            message: 'Your energy consumption has increased by 25% compared to last week.',
            type: 'warning',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            read: false,
            action: {
              label: 'View Details',
              onClick: () => console.log('Viewing details for notification 1')
            }
          },
          {
            id: 2,
            title: 'Device Offline',
            message: 'Smart Meter #12345 is currently offline. Last seen 2 hours ago.',
            type: 'critical',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            read: false,
            action: {
              label: 'Troubleshoot',
              onClick: () => console.log('Troubleshooting device')
            }
          },
          {
            id: 3,
            title: 'Bill Payment Reminder',
            message: 'Your monthly energy bill is due in 3 days.',
            type: 'info',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true,
            action: {
              label: 'Pay Now',
              onClick: () => console.log('Initiating payment')
            }
          },
          {
            id: 4,
            title: 'Consumption Goal Achieved',
            message: 'Congratulations! You have achieved your monthly energy saving goal.',
            type: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            read: true,
            action: {
              label: 'View Report',
              onClick: () => console.log('Viewing consumption report')
            }
          },
          {
            id: 5,
            title: 'System Update',
            message: 'A new system update is available. Update now to get the latest features.',
            type: 'info',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            read: true,
            action: {
              label: 'Update Now',
              onClick: () => console.log('Initiating system update')
            }
          }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
        setLoading(false);
      }, 800);
    };
    
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    setUnreadCount(0);
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Get notification type details
  const getNotificationType = (type) => {
    return notificationTypes[type] || notificationTypes.info;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="info">Information</option>
              <option value="warning">Warnings</option>
              <option value="critical">Critical</option>
              <option value="success">Success</option>
            </select>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'You don\'t have any notifications yet.'
              : `No ${filter} notifications to display.`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const type = getNotificationType(notification.type);
              const Icon = type.icon;
              
              return (
                <li 
                  key={notification.id} 
                  className={`${!notification.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${type.color}`}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <p className="ml-3 text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })}
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-2 text-gray-400 hover:text-gray-500"
                            title="Mark as read"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{notification.message}</p>
                    </div>
                    {notification.action && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            notification.action.onClick();
                            markAsRead(notification.id);
                          }}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {notification.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => console.log('Notification settings')}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Notification Settings
        </button>
      </div>
    </div>
  );
};

export default Notifications;
