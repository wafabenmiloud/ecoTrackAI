import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiLayers, 
  FiBarChart2, 
  FiSettings, 
  FiHelpCircle, 
  FiChevronDown, 
  FiChevronUp,
  FiActivity,
  FiServer,
  FiAlertCircle,
  FiList ,FiUser
} from 'react-icons/fi';

const AdminSidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    users: false,
    devices: false,
    system: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path, exact = true) => {
    return exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/admin',
      exact: true
    },
    {
      title: 'Users',
      icon: <FiUsers className="w-5 h-5" />,
      path: '/admin/users',
      subItems: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Add New', path: '/admin/users/new' }
      ]
    },
    {
      title: 'Devices',
      icon: <FiLayers className="w-5 h-5" />,
      path: '/admin/devices',
      subItems: [
        { title: 'All Devices', path: '/admin/devices' },
        { title: 'Add New', path: '/admin/devices/new' }
      ]
    },
    {
      title: 'Analytics',
      icon: <FiBarChart2 className="w-5 h-5" />,
      path: '/admin/analytics'
    },
    {
      title: 'System',
      icon: <FiServer className="w-5 h-5" />,
      path: '/admin/system',
      subItems: [
        { title: 'Status', path: '/admin/system/status' },
        { title: 'Audit Logs', path: '/admin/system/audit-logs' }
      ]
    },
    {
      title: 'Support',
      icon: <FiHelpCircle className="w-5 h-5" />,
      path: '/admin/support'
    },
    {
      title: 'Settings',
      icon: <FiSettings className="w-5 h-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-16 px-6 bg-gray-800">
        <h1 className="text-xl font-semibold">EcoTrack AI</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <div key={item.title} className="px-2">
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.title.toLowerCase())}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path, false) 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  {openMenus[item.title.toLowerCase()] ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-200 ${
                    openMenus[item.title.toLowerCase()] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="py-1 pl-12 pr-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.title}
                        to={subItem.path}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                          isActive(subItem.path, true)
                            ? 'bg-blue-700 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors duration-200 ${
                  isActive(item.path, item.exact !== false)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 bg-gray-800">
        <div className="flex items-center">
          <div className="w-10 h-10 overflow-hidden bg-gray-600 rounded-full">
            <FiUser className="w-full h-full p-2 text-gray-300" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
