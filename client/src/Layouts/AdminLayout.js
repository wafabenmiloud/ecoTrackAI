import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import '../styles/Admin.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on mobile when clicking outside
  const handleBackdropClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <AdminSidebar />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={handleBackdropClick}
        ></div>
      )}

      <div className={`admin-main ${!sidebarOpen ? 'expanded' : ''}`}>
        {/* Topbar */}
        <AdminTopbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

        {/* Main content */}
        <main className="admin-content">
          <div className="container px-6 py-8 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;