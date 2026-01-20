import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, 
  FiMapPin, FiEdit2, FiSave, FiX, FiKey, FiClock, FiActivity ,FiZap, FiMessageSquare, FiTrash2, FiAlertTriangle, FiLogIn, FiPlus, FiUserPlus
} from 'react-icons/fi';
const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'User',
    status: 'Active',
    address: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Mock data - replace with API call
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockUser = {
            id: userId,
            name: `User ${userId}`,
            email: `user${userId}@example.com`,
            phone: `+1 (555) 123-${Math.floor(1000 + Math.random() * 9000)}`,
            role: userId % 3 === 0 ? 'Admin' : 'User',
            status: userId % 5 === 0 ? 'Inactive' : 'Active',
            address: `${Math.floor(Math.random() * 1000) + 100} Main St, City, Country`,
            joinDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lastLogin: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toLocaleString(),
            devices: Math.floor(Math.random() * 5) + 1,
            monthlyConsumption: (Math.random() * 500).toFixed(2),
            totalSavings: (Math.random() * 200).toFixed(2)
          };
          setUser(mockUser);
          setFormData({
            name: mockUser.name,
            email: mockUser.email,
            phone: mockUser.phone,
            role: mockUser.role,
            status: mockUser.status,
            address: mockUser.address,
            joinDate: mockUser.joinDate
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the user
    console.log('Updated user data:', formData);
    setIsEditing(false);
    // Update the user data in the UI (in a real app, this would come from the API response)
    setUser(prev => ({
      ...prev,
      ...formData
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">User not found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">The requested user could not be found.</p>
        <Link
          to="/admin/users"
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Users
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'Edit User' : 'User Details'}
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiEdit2 className="mr-2" /> Edit User
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX className="mr-2" /> Cancel
              </button>
              <button
                type="submit"
                form="userForm"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiSave className="mr-2" /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-24"></div>
            <div className="px-6 pb-6 -mt-12">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <FiUser className="h-12 w-12 text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:outline-none"
                    />
                  ) : (
                    user.name
                  )}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:outline-none"
                    />
                  ) : (
                    user.email
                  )}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Joined</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Last Login</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(user.lastLogin).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiActivity className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Devices</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.devices}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiZap className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Monthly Usage</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.monthlyConsumption} kWh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiMessageSquare className="mr-2" /> Send Message
              </button>
              <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiKey className="mr-2" /> Reset Password
              </button>
              <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                <FiTrash2 className="mr-2" /> Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* User Details Form */}
        <div className="lg:col-span-2">
          <form id="userForm" onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {user.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {user.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    {isEditing ? (
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : user.status === 'Inactive'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                      {user.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* User Devices */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Connected Devices</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user.devices} devices connected to this account.
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Device management is not yet implemented in this demo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="px-6 py-4">
              <ul className="space-y-4">
                {[
                  { id: 1, action: 'Logged in', time: '2 hours ago', icon: FiLogIn },
                  { id: 2, action: 'Updated profile', time: '1 day ago', icon: FiUser },
                  { id: 3, action: 'Changed password', time: '1 week ago', icon: FiKey },
                  { id: 4, action: 'Added new device', time: '2 weeks ago', icon: FiPlus },
                  { id: 5, action: 'Account created', time: '1 month ago', icon: FiUserPlus },
                ].map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <activity.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-center">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
