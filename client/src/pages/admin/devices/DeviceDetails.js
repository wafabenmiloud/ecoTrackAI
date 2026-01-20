import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit2, FiSave, FiX, FiPower, FiClock, 
  FiZap, FiActivity, FiWifi, FiWifiOff, FiAlertCircle,
  FiUser, FiHome, FiBattery, FiInfo, FiSettings, FiBarChart2, FiTrash2, FiDownload 
} from 'react-icons/fi';

const DeviceDetails = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - replace with API call
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const types = ['Thermostat', 'Smart Plug', 'Light Bulb', 'Smart TV', 'Refrigerator', 'Washing Machine'];
          const statuses = ['online', 'offline', 'error'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const type = types[Math.floor(Math.random() * types.length)];
          
          const mockDevice = {
            id: deviceId,
            name: `${type} ${deviceId.split('-')[1]}`,
            type,
            status,
            location: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garage'][Math.floor(Math.random() * 5)],
            powerRating: (Math.random() * 2000 + 100).toFixed(0),
            currentPower: (Math.random() * 500).toFixed(2),
            energyToday: (Math.random() * 5).toFixed(2),
            energyThisMonth: (Math.random() * 50 + 10).toFixed(2),
            totalEnergy: (Math.random() * 1000 + 100).toFixed(2),
            manufacturer: ['EcoTech', 'SmartHome Inc', 'PowerSavvy', 'GreenTech', 'EcoPower'][Math.floor(Math.random() * 5)],
            model: `${type.replace(/\s+/g, '')}-${Math.floor(Math.random() * 1000) + 1000}`,
            serialNumber: `SN-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
            firmwareVersion: `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            macAddress: Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
            lastSeen: new Date(Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000).toISOString(),
            owner: `User ${Math.floor(Math.random() * 10) + 1}`,
            ownerId: Math.floor(Math.random() * 10) + 1,
            notes: 'No additional notes available.'
          };
          
          setDevice(mockDevice);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching device:', error);
        setLoading(false);
      }
    };

    fetchDevice();
  }, [deviceId]);

  const toggleDeviceStatus = () => {
    setDevice(prev => ({
      ...prev,
      status: prev.status === 'online' ? 'offline' : 'online'
    }));
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'online':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
            <FiWifi className="mr-1" /> Online
          </span>
        );
      case 'offline':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
            <FiWifiOff className="mr-1" /> Offline
          </span>
        );
      case 'error':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>
            <FiAlertCircle className="mr-1" /> Error
          </span>
        );
      default:
        return null;
    }
  };

  const getDeviceIcon = (type) => {
    const iconClass = 'h-6 w-6';
    
    switch (type.toLowerCase()) {
      case 'thermostat':
        return <FiActivity className={`${iconClass} text-blue-500`} />;
      case 'smart plug':
        return <FiZap className={`${iconClass} text-yellow-500`} />;
      case 'light bulb':
        return <FiZap className={`${iconClass} text-yellow-400`} />;
      case 'smart tv':
        return <FiActivity className={`${iconClass} text-purple-500`} />;
      case 'refrigerator':
        return <FiActivity className={`${iconClass} text-cyan-500`} />;
      case 'washing machine':
        return <FiActivity className={`${iconClass} text-indigo-500`} />;
      default:
        return <FiZap className={`${iconClass} text-gray-500`} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Device not found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">The requested device could not be found.</p>
        <Link
          to="/admin/devices"
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Devices
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to="/admin/devices"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Devices
        </Link>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <div className="mr-4 p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
              {getDeviceIcon(device.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {device.name}
              </h1>
              <div className="flex items-center mt-1">
                {getStatusBadge(device.status)}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {device.status === 'online' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleDeviceStatus}
              className={`px-4 py-2 rounded-lg flex items-center ${
                device.status === 'online'
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
                  : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
              }`}
            >
              <FiPower className="mr-2" />
              {device.status === 'online' ? 'Turn Off' : 'Turn On'}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <FiEdit2 className="mr-2" /> {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manufacturer</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.manufacturer}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.model}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serial Number</p>
                <p className="text-sm text-gray-900 dark:text-white">{device.serialNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span>View Energy Usage</span>
                <FiBarChart2 className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span>Check for Updates</span>
                <FiDownload className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <span>Remove Device</span>
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                          <FiZap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Power</p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">{device.currentPower} W</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                          <FiActivity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Today's Energy</p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">{device.energyToday} kWh</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
                          <FiBarChart2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">This Month</p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">{device.energyThisMonth} kWh</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mr-3">
                          <FiBattery className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Energy</p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">{device.totalEnergy} kWh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Device Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                          defaultValue={device.name}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                          defaultValue={device.location}
                          disabled={!isEditing}
                        />
                      </div>
                      {isEditing && (
                        <div className="pt-2">
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;
