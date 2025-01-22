import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/appLayout';
import { Search, Download, Printer, ChevronDown, Users, Truck, Briefcase, Filter, MoreVertical, Edit, Ban, CheckCircle, AlertTriangle, UserPlus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { toast } from 'react-hot-toast';

const DEFAULT_STATUSES = {
  trucker: ['active', 'inactive', 'suspended', 'pending'],
  serviceProvider: ['active', 'inactive', 'suspended', 'pending'],
  client: ['active', 'inactive', 'suspended', 'pending']
};

function UserManagement() {
  const { accessToken } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [visibleUsers, setVisibleUsers] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [userStatuses, setUserStatuses] = useState(DEFAULT_STATUSES);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { darkMode } = useDarkMode();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_Local}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const { clients, truckers, serviceProviders } = response.data;
      
      if (Array.isArray(clients) && Array.isArray(truckers) && Array.isArray(serviceProviders)) {
        const allUsers = [...clients, ...truckers, ...serviceProviders];
        setUsers(allUsers);
      } else {
        console.error('Unexpected response format:', response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`${BACKEND_Local}/api/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'type':
        comparison = a.accountType.localeCompare(b.accountType);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const UserCard = ({ title, count, icon: Icon, color, onClick }) => (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-4 ${color}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{count}</p>
        </div>
        <Icon className={`h-10 w-10 ${color.replace('border-l-4 border-', 'text-')}`} />
      </div>
    </div>
  );

  const UserActionMenu = ({ user }) => (
    <div className="relative group">
      <button className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
        <MoreVertical className="h-5 w-5" />
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg hidden group-hover:block z-10">
        <div className="py-1">
          <button
            onClick={() => setSelectedUser(user)}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </button>
          <button
            onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
          >
            {user.status === 'active' ? (
              <Ban className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {user.status === 'active' ? 'Suspend User' : 'Activate User'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add New User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UserCard
            title="Total Clients"
            count={users.filter(u => u.accountType === 'client').length}
            icon={Users}
            color="border-blue-500"
            onClick={() => setSelectedUserType('client')}
          />
          <UserCard
            title="Total Truckers"
            count={users.filter(u => u.accountType === 'trucker').length}
            icon={Truck}
            color="border-green-500"
            onClick={() => setSelectedUserType('trucker')}
          />
          <UserCard
            title="Service Providers"
            count={users.filter(u => u.accountType === 'serviceProvider').length}
            icon={Briefcase}
            color="border-purple-500"
            onClick={() => setSelectedUserType('serviceProvider')}
          />
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchUsers()}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Printer className="h-5 w-5 mr-2" />
                Print
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Statuses</option>
                {Object.values(userStatuses).flat().map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={selectedUserType || 'all'}
                onChange={(e) => setSelectedUserType(e.target.value === 'all' ? null : e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Types</option>
                <option value="client">Clients</option>
                <option value="trucker">Truckers</option>
                <option value="serviceProvider">Service Providers</option>
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span className={darkMode ? 'text-gray-200' : 'text-gray-600'}>Name</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <span className={darkMode ? 'text-gray-200' : 'text-gray-600'}>Email</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      <span className={darkMode ? 'text-gray-200' : 'text-gray-600'}>Type</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span className={darkMode ? 'text-gray-200' : 'text-gray-600'}>Status</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className={darkMode ? 'text-gray-200' : 'text-gray-600'}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : sortedUsers.slice(0, visibleUsers).map((user) => (
                  <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {user.email}
                    </td>
                    <td className={`px-6 py-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {user.accountType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <UserActionMenu user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedUsers.length > visibleUsers && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setVisibleUsers(prev => prev + 10)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default UserManagement;
