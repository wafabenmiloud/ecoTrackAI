import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiLayers, 
  FiBarChart2, 
  FiSettings, 
  FiHelpCircle, 
  FiChevronDown, 
  FiChevronRight,
  FiActivity,
  FiServer,
  FiAlertCircle,
  FiList,
  FiUser,
  FiPower,
  FiChevronLeft
} from 'react-icons/fi';

const AdminSidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    users: false,
    devices: false,
    system: false,
    analytics: false,
    support: false
  });

  // Auto-expand menu based on current route
  useEffect(() => {
    const path = location.pathname;
    const newOpenMenus = { ...openMenus };
    
    // Close all menus first
    Object.keys(newOpenMenus).forEach(key => {
      newOpenMenus[key] = false;
    });

    // Open the relevant menu based on current path
    if (path.startsWith('/admin/users')) {
      newOpenMenus.users = true;
    } else if (path.startsWith('/admin/devices')) {
      newOpenMenus.devices = true;
    } else if (path.startsWith('/admin/system')) {
      newOpenMenus.system = true;
    } else if (path.startsWith('/admin/analytics')) {
      newOpenMenus.analytics = true;
    } else if (path.startsWith('/admin/support')) {
      newOpenMenus.support = true;
    }

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

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
      icon: <FiHome />,
      path: '/admin',
      exact: true
    },
    {
      title: 'Users',
      icon: <FiUsers />,
      path: '/admin/users',
      subItems: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Add New', path: '/admin/users/new' }
      ]
    },
    {
      title: 'Devices',
      icon: <FiLayers />,
      path: '/admin/devices',
      subItems: [
        { title: 'All Devices', path: '/admin/devices' },
        { title: 'Add New', path: '/admin/devices/new' }
      ]
    },
    {
      title: 'Analytics',
      icon: <FiBarChart2 />,
      path: '/admin/analytics',
      subItems: [
        { title: 'Overview', path: '/admin/analytics' },
        { title: 'Reports', path: '/admin/analytics/reports' },
        { title: 'Exports', path: '/admin/analytics/exports' }
      ]
    },
    {
      title: 'System',
      icon: <FiServer />,
      path: '/admin/system',
      subItems: [
        { title: 'Status', path: '/admin/system/status' },
        { title: 'Audit Logs', path: '/admin/system/audit-logs' },
        { title: 'Backup', path: '/admin/system/backup' },
        { title: 'Updates', path: '/admin/system/updates' }
      ]
    },
    {
      title: 'Support',
      icon: <FiHelpCircle />,
      path: '/admin/support',
      subItems: [
        { title: 'Tickets', path: '/admin/support/tickets' },
        { title: 'Knowledge Base', path: '/admin/support/knowledge-base' },
        { title: 'Contact Us', path: '/admin/support/contact' }
      ]
    },
    {
      title: 'Settings',
      icon: <FiSettings />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-logo">
          <FiServer className="text-blue-400" />
          <span>EcoTrack AI</span>
        </Link>
      </div>
      
      <div className="sidebar-menu">
        <div className="menu-category">Main</div>
        
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.title.toLowerCase())}
                  className={`menu-item ${openMenus[item.title.toLowerCase()] ? 'active' : ''}`}
                >
                  <i>{item.icon}</i>
                  <span>{item.title}</span>
                  {openMenus[item.title.toLowerCase()] ? (
                    <FiChevronDown className="ml-auto" />
                  ) : (
                    <FiChevronRight className="ml-auto" />
                  )}
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-200 ${
                    openMenus[item.title.toLowerCase()] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="pl-4">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.title}
                        to={subItem.path}
                        className={`menu-item ${isActive(subItem.path, true) ? 'active' : ''}`}
                        style={{ paddingLeft: '2.5rem' }}
                      >
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Link
                to={item.path}
                className={`menu-item ${isActive(item.path, item.exact !== false) ? 'active' : ''}`}
              >
                <i>{item.icon}</i>
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-white">Admin User</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
            title="Sign out"
          >
            <FiPower size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
