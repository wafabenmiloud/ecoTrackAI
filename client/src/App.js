// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Layouts
import MainLayout from './Layouts/MainLayout';
import AdminLayout from './Layouts/AdminLayout';

// Consumption Pages
import ConsumptionHistory from './pages/consumption/ConsumptionHistory';
import ConsumptionStats from './pages/consumption/ConsumptionStats';
import AddConsumption from './pages/consumption/AddConsumption';
import AnomalyDetection from './pages/consumption/AnomalyDetection';
import DataTransfer from './pages/consumption/DataTransfer';
import Predictions from './pages/consumption/Predictions';


// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Notifications Pages
import Notifications from './pages/notifications/Notifications';

// User Pages
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import SupportTickets from './pages/support/SupportTickets';
import TicketDetails from './pages/support/TicketDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Admin Pages - users
import UserManagement from './pages/admin/users/UserManagement';
import UserDetails from './pages/admin/users/UserDetails';
import UserAdd from './pages/admin/users/CreateUser';

// Admin Pages - devices
import DeviceManagement from './pages/admin/devices/DeviceManagement';
import DeviceDetails from './pages/admin/devices/DeviceDetails';
import DeviceAdd from './pages/admin/devices/CreateDevice';
import DeviceList from './pages/admin/devices/DeviceList';

// Admin Pages - analytics
import SystemAnalytics from './pages/admin/analytics/SystemAnalytics';

// Admin Pages - system
import AuditLogs from './pages/admin/system/AuditLogs';
import SystemStatus from './pages/admin/system/SystemStatus';

// Admin Pages - support
import AdminSupportTickets from './pages/admin/support/SupportTickets';
import AdminTicketDetails from './pages/admin/support/TicketDetails';

// Nested Layout Components
const UserLayout = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            
            {/* Protected User Routes */}
            <Route element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* User Profile & Settings */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Consumption Management */}
              <Route path="/consumption" element={<ConsumptionHistory />} />
              <Route path="/consumption/stats" element={<ConsumptionStats />} />
              <Route path="/consumption/anomalies" element={<AnomalyDetection />} />
              <Route path="/consumption/predictions" element={<Predictions />} />
              <Route path="/consumption/transfer" element={<DataTransfer />} />
              
              {/* Support */}
              <Route path="/support" element={<SupportTickets />} />
              <Route path="/support/tickets/:ticketId" element={<TicketDetails />} />
            </Route>
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminRoute>
                    <AdminLayoutWrapper />
                  </AdminRoute>
                </PrivateRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              
              {/* User Management */}
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:userId" element={<UserDetails />} />
              
              {/* Device Management */}
              <Route path="devices" element={<DeviceManagement />} />
              <Route path="devices/:deviceId" element={<DeviceDetails />} />
              
              {/* Analytics */}
              <Route path="analytics" element={<SystemAnalytics />} />
              
              {/* System */}
              <Route path="system/status" element={<SystemStatus />} />
              <Route path="system/audit-logs" element={<AuditLogs />} />
              
              {/* Support */}
              <Route path="support" element={<AdminSupportTickets />} />
              <Route path="support/tickets/:ticketId" element={<AdminTicketDetails />} />
            </Route>
            
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Not Found */}
            <Route path="*" element={
              <PrivateRoute>
                <MainLayout>
                  <div className="flex items-center justify-center h-full">
                    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                  </div>
                </MainLayout>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;