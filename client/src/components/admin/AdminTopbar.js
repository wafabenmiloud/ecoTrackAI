import React, { useState, useEffect } from 'react';
import { 
  FiBell, 
  FiMenu, 
  FiSearch, 
  FiUser, 
  FiMoon, 
  FiSun,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';

const AdminTopbar = ({ onMenuClick, sidebarOpen }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New user registered', time: '10 min ago', read: false },
    { id: 2, text: 'Server #1 is down', time: '2 hours ago', read: false },
    { id: 3, text: 'New message from John', time: '5 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You can add logic to persist dark mode preference
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <div className="admin-topbar">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="toggle-sidebar"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FiMenu /> : <FiMenu />}
        </button>
        
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="admin-actions">
        <button 
          className="notification-btn" 
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
        
        <div className="relative">
          <button 
            className="notification-btn"
            onClick={() => setUserMenuOpen(false)}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {unreadCount > 0 && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p className="text-sm text-gray-800">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
                <a href="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative user-menu">
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="user-avatar">
              <FiUser className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="user-name">Admin User</p>
              <p className="user-role">Administrator</p>
            </div>
            <FiChevronDown className={`transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          {/* User dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <a 
                href="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="mr-2" />
                Profile
              </a>
              <a 
                href="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiSettings className="mr-2" />
                Settings
              </a>
              <a 
                href="/support" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiMessageSquare className="mr-2" />
                Support
              </a>
              <div className="border-t border-gray-100 my-1"></div>
              <a 
                href="/logout" 
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" />
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;