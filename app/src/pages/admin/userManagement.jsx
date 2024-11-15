import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/appLayout';
import { Search, Download, Printer, ChevronDown, Users, Truck, Briefcase } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth'; // Import the useAuthStore hook
import { useDarkMode } from '../../contexts/DarkModeContext';

const DEFAULT_STATUSES = {
  trucker: ['active', 'inactive', 'suspended', 'pending'],
  serviceProvider: ['active', 'inactive', 'suspended', 'pending'],
  client: ['active', 'inactive', 'suspended', 'pending']
};

function UserManagement() {
  const { accessToken } = useAuthStore(); // Get the accessToken from the store
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [visibleUsers, setVisibleUsers] = useState(5); // Initialize visibleUsers state
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [userStatuses, setUserStatuses] = useState(DEFAULT_STATUSES);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        const { clients, truckers, serviceProviders } = response.data;
        
        if (Array.isArray(clients) && Array.isArray(truckers) && Array.isArray(serviceProviders)) {
          // Combine all user types into a single array
          const allUsers = [...clients, ...truckers, ...serviceProviders];
          setUsers(allUsers);
        } else {
          console.error('Unexpected response format:', response.data);
          setUsers([]); // Set to an empty array if the response is not as expected
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Set to an empty array in case of error
      }
    };

    fetchUsers();
  }, [accessToken]);

  useEffect(() => {
    const fetchUserStatuses = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/admin/user-statuses`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (response.data && Object.keys(response.data).length > 0) {
          setUserStatuses(response.data);
        } else {
          console.log('Using default statuses as backend returned no data');
        }
      } catch (error) {
        console.error('Error fetching user statuses:', error);
        console.log('Using default statuses due to error');
      }
    };

    fetchUserStatuses();
  }, [accessToken]);

  const filteredUsers = users.filter(user => {
    const searchMatch = 
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusMatch = 
      selectedStatus === 'all' || 
      user.status?.toLowerCase() === selectedStatus.toLowerCase();
    
    const typeMatch = 
      selectedUserType === null || 
      user.accountType === selectedUserType;

    return searchMatch && statusMatch && typeMatch;
  });

  const UserCard = ({ title, count, icon: Icon, color, onClick }) => (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-4 ${color}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>{count}</p>
        </div>
        <Icon className={`w-12 h-12 ${color.replace('border-', 'text-')}`} />
      </div>
    </div>
  );

  const UserTable = ({ users }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden mt-6`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <tr>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>First Name</th>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Last Name</th>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Account Type</th>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Rating</th>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Created At</th>
            <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Updated At</th>
          </tr>
        </thead>
        <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {users.map((user) => (
            <tr key={user.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{user.firstName}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{user.lastName}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{user.email}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{user.accountType}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{user.rating}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{new Date(user.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No users found
        </div>
      )}
    </div>
  );

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <UserCard
                title="Total Users"
                count={users.length}
                icon={Users}
                color="border-purple-500"
                onClick={() => setSelectedUserType(null)}
              />
              <UserCard
                title="Service Providers"
                count={users.filter(u => u.accountType === 'serviceProvider').length}
                icon={Briefcase}
                color="border-blue-500"
                onClick={() => setSelectedUserType('serviceProvider')}
              />
              <UserCard
                title="Truckers"
                count={users.filter(u => u.accountType === 'trucker').length}
                icon={Truck}
                color="border-green-500"
                onClick={() => setSelectedUserType('trucker')}
              />
              <UserCard
                title="Clients"
                count={users.filter(u => u.accountType === 'client').length}
                icon={Users}
                color="border-yellow-500"
                onClick={() => setSelectedUserType('client')}
              />
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search users..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <div className="flex space-x-2">
                <button className={`px-4 py-2 rounded-lg flex items-center ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button className={`px-4 py-2 rounded-lg flex items-center ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {showFilters && (
              <div className={`mb-4 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg flex flex-wrap gap-4`}>
                <select
                  className={`border rounded-lg px-4 py-2 ${
                    darkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {selectedUserType ? (
                    // Show statuses for selected user type
                    userStatuses[selectedUserType]?.map(status => (
                      <option key={status} value={status.toLowerCase()}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))
                  ) : (
                    // Show all unique statuses when no user type is selected
                    [...new Set([
                      ...userStatuses.trucker,
                      ...userStatuses.serviceProvider,
                      ...userStatuses.client
                    ])].map(status => (
                      <option key={status} value={status.toLowerCase()}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <UserTable users={filteredUsers} />
          </div>
        </AppLayout>
      </div>
    </div>
  );
}

export default UserManagement;
