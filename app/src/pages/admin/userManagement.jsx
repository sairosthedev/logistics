import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/appLayout';
import { Search, Download, Printer, ChevronDown, Users, Truck, Briefcase, Filter, MoreVertical, Edit, Ban, CheckCircle, AlertTriangle, UserPlus, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const DEFAULT_STATUSES = {
  trucker: ['active', 'unverified', 'suspended', 'pending'],
  serviceProvider: ['active', 'unverified', 'suspended', 'pending'],
  client: ['active', 'unverified', 'suspended', 'pending']
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

  const handleVerifyUser = async (email) => {
    try {
      const response = await fetch(`${BACKEND_Local}/api/auth/verifyUser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          status: "verified" 
        }),
      });

      if (response.ok) {
        toast.success('User verified successfully');
        fetchUsers(); // Refresh the users list
      } else {
        const errorData = await response.json();
        toast.error(`Failed to verify user: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`${BACKEND_Local}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          toast.success('User deleted successfully');
          fetchUsers(); // Refresh the users list
        } else {
          const errorData = await response.json();
          toast.error(`Failed to delete user: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_Local}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`User status updated to ${newStatus} successfully`);
        fetchUsers(); // Refresh the users list
      } else {
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          toast.error(`Failed to update user status: ${errorData.message}`);
        } else {
          toast.error(`Failed to update user status: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status. Please check your connection and try again.');
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

  const exportUsers = () => {
    try {
      // Create CSV headers
      const headers = ['First Name', 'Last Name', 'Email', 'Account Type', 'Status'];
      
      // Convert users data to CSV format
      const csvData = sortedUsers.map(user => [
        user.firstName || '',
        user.lastName || '',
        user.email || '',
        user.accountType || '',
        user.status || ''
      ]);
      
      // Combine headers and data
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  const UserCard = ({ title, count, icon: Icon, color, onClick }) => (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${color} flex flex-col space-y-4`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{count}</p>
        </div>
        <div className={`p-4 rounded-full ${color.replace('border-l-4 border-', 'bg-').replace('500', '100')}`}>
          <Icon className={`h-8 w-8 ${color.replace('border-l-4 border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const UserActionMenu = ({ user }) => (
    <div className="relative group">
      <button 
        type="button"
        className={`p-2 rounded-lg transition-all duration-200 ${
          darkMode 
            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
        }`}
        aria-label="User actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2 divide-y divide-gray-100 dark:divide-gray-700">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Actions</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => setSelectedUser(user)}
              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <Edit className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
              Edit User
            </button>

            {user.status !== 'verified' && (
              <button
                type="button"
                onClick={() => handleVerifyUser(user.email)}
                className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <CheckCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-green-500" />
                Verify User
              </button>
            )}

            {user.status !== 'suspended' && (
              <button
                type="button"
                onClick={() => handleStatusChange(user.id, 'suspended')}
                className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <Ban className="h-4 w-4 mr-3 text-gray-400 group-hover:text-orange-500" />
                Suspend User
              </button>
            )}

            {user.status !== 'active' && (
              <button
                type="button"
                onClick={() => handleStatusChange(user.id, 'active')}
                className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <CheckCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-green-500" />
                Activate User
              </button>
            )}
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleDeleteUser(user.id)}
              className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <AlertTriangle className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-600" />
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const printToPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('User Management Report', 14, 15);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      
      const headers = [['Name', 'Email', 'Account Type', 'Status']];
      const data = sortedUsers.map(user => [
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        user.email || '',
        user.accountType || '',
        user.status || ''
      ]);

      doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 70 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
        },
      });

      // Save with formatted filename
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`user_management_report_${timestamp}.pdf`);
      toast.success('Users exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const UserModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      accountType: 'client',
      status: 'active'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await fetch(`${BACKEND_Local}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || '',
            password: formData.password,
            accountType: formData.accountType,
            termsAccepted: true
          }),
        });

        if (response.ok) {
          const otpResponse = await fetch(`${BACKEND_Local}/api/send-email/user/verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: formData.email }),
          });

          if (otpResponse.ok) {
            toast.success('User created successfully. Verification email sent.');
            fetchUsers();
            onClose();
          } else {
            const errorData = await otpResponse.json();
            toast.error(`Error sending verification email: ${errorData.message}`);
          }
        } else {
          const errorData = await response.json();
          toast.error(`User creation failed: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Add New User
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="123-456-7890"
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="client">Client</option>
                <option value="trucker">Trucker</option>
                <option value="serviceProvider">Service Provider</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-200 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 space-y-4 sm:space-y-0">
          <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <button
            onClick={() => setShowUserModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add New User
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">
          <UserCard
            title="Total Clients"
            count={users.filter(u => u.accountType === 'client').length}
            icon={Users}
            color="border-l-4 border-blue-500"
            onClick={() => setSelectedUserType('client')}
          />
          <UserCard
            title="Total Truckers"
            count={users.filter(u => u.accountType === 'trucker').length}
            icon={Truck}
            color="border-l-4 border-green-500"
            onClick={() => setSelectedUserType('trucker')}
          />
          <UserCard
            title="Service Providers"
            count={users.filter(u => u.accountType === 'serviceProvider').length}
            icon={Briefcase}
            color="border-l-4 border-purple-500"
            onClick={() => setSelectedUserType('serviceProvider')}
          />
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-8 mb-8`}>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:items-center sm:space-x-4">
              <div className="relative w-full sm:w-64">
                <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-2 sm:py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 sm:py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                } transition-colors duration-200`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => fetchUsers()}
                className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-xl ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                <RefreshCw className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                onClick={exportUsers}
                className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-xl ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                <Download className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={printToPdf}
                className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-xl ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                <Printer className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full sm:w-auto px-4 py-2 sm:py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              >
                <option value="all">All Statuses</option>
                {Object.values(userStatuses).flat().map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={selectedUserType || 'all'}
                onChange={(e) => setSelectedUserType(e.target.value === 'all' ? null : e.target.value)}
                className={`w-full sm:w-auto px-4 py-2 sm:py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              >
                <option value="all">All Types</option>
                <option value="client">Clients</option>
                <option value="trucker">Truckers</option>
                <option value="serviceProvider">Service Providers</option>
              </select>
            </div>
          )}

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <th 
                      className="px-3 sm:px-6 py-3 sm:py-4 text-left cursor-pointer first:rounded-l-xl group"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider group-hover:text-blue-500 transition-colors`}>Name</span>
                        <ChevronDown className={`h-4 w-4 ml-1 transition-colors ${sortBy === 'name' ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th 
                      className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left cursor-pointer group"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider group-hover:text-blue-500 transition-colors`}>Email</span>
                        <ChevronDown className={`h-4 w-4 ml-1 transition-colors ${sortBy === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 sm:py-4 text-left cursor-pointer group"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider group-hover:text-blue-500 transition-colors`}>Type</span>
                        <ChevronDown className={`h-4 w-4 ml-1 transition-colors ${sortBy === 'type' ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th 
                      className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left cursor-pointer group"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider group-hover:text-blue-500 transition-colors`}>Status</span>
                        <ChevronDown className={`h-4 w-4 ml-1 transition-colors ${sortBy === 'status' ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left last:rounded-r-xl">
                      <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider`}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                          <span className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} text-lg`}>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedUsers.slice(0, visibleUsers).map((user) => (
                    <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            user.accountType === 'client' ? 'bg-blue-100 text-blue-600' :
                            user.accountType === 'trucker' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {user.firstName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-sm sm:text-base">{user.firstName} {user.lastName}</p>
                            <p className="sm:hidden text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {user.email}
                      </td>
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap`}>
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.accountType === 'client' ? 'bg-blue-100 text-blue-800' :
                          user.accountType === 'trucker' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.accountType}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                            user.status === 'active' ? 'bg-green-600' :
                            user.status === 'suspended' ? 'bg-red-600' :
                            user.status === 'pending' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <UserActionMenu user={user} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {sortedUsers.length > visibleUsers && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleUsers(prev => prev + 10)}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-all duration-200 hover:shadow-md`}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
      <UserModal 
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
    </AppLayout>
  );
}

export default UserManagement;
