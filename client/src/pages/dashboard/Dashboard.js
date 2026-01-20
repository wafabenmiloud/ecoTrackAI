// client/src/pages/dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { consumptionAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Line } from 'react-chartjs-2';
import { 
  FiActivity, 
  FiAlertCircle, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiZap, 
  FiClock,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle
} from 'react-icons/fi';
import { format } from 'date-fns';

// Mock data for the chart
const generateChartData = () => {
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const data = labels.map(() => Math.floor(Math.random() * 10) + 1);
  
  return {
    labels,
    datasets: [
      {
        label: 'Energy Usage (kWh)',
        data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'kWh',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

const quickActions = [
  { icon: <FiZap />, label: 'Add Device', path: '/devices/add' },
  { icon: <FiCalendar />, label: 'Schedule', path: '/schedule' },
  { icon: <FiDollarSign />, label: 'Billing', path: '/billing' },
  { icon: <FiTrendingUp />, label: 'Reports', path: '/reports' },
];

const energyTips = [
  'Turn off lights when leaving a room',
  'Use smart power strips to reduce standby power',
  'Set your thermostat 1°C lower to save energy',
  'Run full loads in your dishwasher and washing machine',
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    today: 15.2,
    thisMonth: 245.6,
    changeFromYesterday: -5.2,
    changeFromLastMonth: -12.7,
    deviceCount: 8,
    co2Saved: 45.3,
  });
  const [recentConsumption, setRecentConsumption] = useState([
    { _id: '1', device: 'Living Room AC', consumption: 2.4, timestamp: new Date(Date.now() - 3600000) },
    { _id: '2', device: 'Refrigerator', consumption: 1.8, timestamp: new Date(Date.now() - 7200000) },
    { _id: '3', device: 'Washing Machine', consumption: 3.2, timestamp: new Date(Date.now() - 10800000) },
    { _id: '4', device: 'Kitchen Lights', consumption: 0.8, timestamp: new Date(Date.now() - 14400000) },
    { _id: '5', device: 'Home Office', consumption: 1.5, timestamp: new Date(Date.now() - 18000000) },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState(generateChartData());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setChartData(generateChartData());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Here's your energy consumption overview for {new Date().toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center"
        >
          <FiAlertCircle className="mr-2" />
          Logout
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center h-32"
          >
            <span className="text-2xl text-indigo-600 dark:text-indigo-400 mb-2">
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Usage</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.today.toFixed(1)} kWh
              </h3>
              <p className={`text-sm mt-1 ${stats.changeFromYesterday < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.changeFromYesterday >= 0 ? '↑' : '↓'} {Math.abs(stats.changeFromYesterday)}% from yesterday
              </p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
              <FiActivity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Usage</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.thisMonth.toFixed(1)} kWh
              </h3>
              <p className={`text-sm mt-1 ${stats.changeFromLastMonth < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.changeFromLastMonth >= 0 ? '↑' : '↓'} {Math.abs(stats.changeFromLastMonth)}% from last month
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Devices</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.deviceCount}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.deviceCount > 0 ? 'All systems normal' : 'No active devices'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
              <FiZap size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CO₂ Saved</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.co2Saved} kg
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Equivalent to {Math.round(stats.co2Saved * 2.5)} trees planted
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
              <FiCheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Energy Usage Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Energy Usage</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                Day
              </button>
              <button className="px-3 py-1 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Week
              </button>
              <button className="px-3 py-1 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Month
              </button>
            </div>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentConsumption.map((item) => (
              <div key={item._id} className="flex items-start">
                <div className={`p-2 rounded-lg mr-3 ${
                  item.consumption > 2.5 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                }`}>
                  <FiZap size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.device}</h4>
                    <span className="text-sm font-medium">{item.consumption} kWh</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(item.timestamp, 'h:mm a')} • {format(item.timestamp, 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Energy Saving Tips */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Energy Saving Tips
          </h2>
          <ul className="space-y-3">
            {energyTips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">•</span>
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Show more tips
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">All Systems Operational</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Online
              </span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">45% used</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Sync</span>
                <span className="text-sm text-green-600 dark:text-green-400">Up to date</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;