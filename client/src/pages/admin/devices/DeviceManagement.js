import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, FiPlus, FiFilter, FiDownload, FiEdit2, 
  FiTrash2, FiZap, FiAlertCircle, FiCheckCircle, 
  FiClock, FiActivity, FiBattery, FiWifi, FiWifiOff 
} from 'react-icons/fi';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const devicesPerPage = 10;

  // Mock data - replace with API call
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockDevices = Array.from({ length: 25 }, (_, i) => {
            const types = ['Thermostat', 'Smart Plug', 'Light Bulb', 'Smart TV', 'Refrigerator', 'Washing Machine'];
            const statuses = ['online', 'offline', 'error'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            
            return {
              id: `dev-${i + 1}`,
              name: `${type} ${i + 1}`,
              type,
              status,
              location: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garage'][Math.floor(Math.random() * 5)],
              powerUsage: (Math.random() * 500).toFixed(2),
              lastActive: new Date(Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000).toISOString(),
              owner: `User ${Math.floor(Math.random() * 10) + 1}`,
              ownerId: Math.floor(Math.random() * 10) + 1
            };
          });
          
          setDevices(mockDevices);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Filter devices based on search term and status
  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      device.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get current devices
  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = filteredDevices.slice(indexOfFirstDevice, indexOfLastDevice);
  const totalPages = Math.ceil(filteredDevices.length / devicesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle device status
  const toggleDeviceStatus = (deviceId) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, status: device.status === 'online' ? 'offline' : 'online' } 
        : device
    ));
  };

  // Delete device
  const deleteDevice = (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      setDevices(devices.filter(device => device.id !== deviceId));
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FiWifi className="mr-1" /> Online
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <FiWifiOff className="mr-1" /> Offline
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FiAlertCircle className="mr-1" /> Error
          </span>
        );
      default:
        return null;
    }
  };

  // Get device icon
  const getDeviceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'thermostat':
        return <FiActivity className="h-5 w-5 text-blue-500" />;
      case 'smart plug':
        return <FiZap className="h-5 w-5 text-yellow-500" />;
      case 'light bulb':
        return <FiZap className="h-5 w-5 text-yellow-400" />;
      case 'smart tv':
        return <FiActivity className="h-5 w-5 text-purple-500" />;
      case 'refrigerator':
        return <FiActivity className="h-5 w-5 text-cyan-500" />;
      case 'washing machine':
        return <FiActivity className="h-5 w-5 text-indigo-500" />;
      default:
        return <FiZap className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Device Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all connected devices and their settings
          </p>
        </div>
        <Link
          to="/admin/devices/add"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" /> Add New Device
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg dark:bg-gray-800 dark:text-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <FiFilter className="mr-2" />
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <FiDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Power Usage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentDevices.length > 0 ? (
                currentDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {device.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{device.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(device.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{device.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiZap className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{device.powerUsage} W</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(device.lastActive).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleDeviceStatus(device.id)}
                          className={`p-1.5 rounded-md ${
                            device.status === 'online'
                              ? 'text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
                              : 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                          }`}
                          title={device.status === 'online' ? 'Turn Off' : 'Turn On'}
                        >
                          {device.status === 'online' ? <FiPower /> : <FiPower />}
                        </button>
                        <Link
                          to={`/admin/devices/${device.id}`}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-md"
                          title="Edit"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteDevice(device.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No devices found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
              Showing <span className="font-medium">{indexOfFirstDevice + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastDevice, filteredDevices.length)}
              </span>{' '}
              of <span className="font-medium">{filteredDevices.length}</span> devices
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="hidden sm:flex sm:items-center sm:space-x-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, last page, and pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 py-1 text-gray-500">...</span>
                )}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Missing FiPower icon component
const FiPower = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
    <line x1="12" y1="2" x2="12" y2="12"></line>
  </svg>
);

export default DeviceManagement;
