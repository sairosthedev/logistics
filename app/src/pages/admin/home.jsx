import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Calendar, 
  Truck, 
  Users, 
  Package, 
  DollarSign, 
  Search, 
  Settings, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../components/layouts/appLayout';
import UserManagement from './userManagement';
import MyLoads from './myloads';
import Analytics from './Analytics';
import axios from 'axios';
import useAuthStore from '../auth/auth';
import { BACKEND_Local } from '../../../url.js'
import { useDarkMode } from '../../contexts/DarkModeContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AdminDashboard = () => {
  const { accessToken } = useAuthStore(); // Get the accessToken from the store
  const [stats, setStats] = useState({
    clients: { total: 0, active: 0, new: 0 },
    truckers: { total: 0, active: 0, new: 0 },
    serviceProviders: { total: 0, active: 0, new: 0 },
    jobs: { total: 0, completed: 0, inProgress: 0 },
    services: { total: 0, popular: '' },
    notifications: { total: 0, unread: 0 },
    revenue: { total: '$0', growth: '0%' },
    chartData: [],
    systemAlerts: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [selectedFilter, setSelectedFilter] = useState('week');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dashboardRef = useRef(null);

  const [filteredData, setFilteredData] = useState({
    stats: {},
    chartData: [],
    systemAlerts: [],
    users: []
  });

  const [visibleUsers, setVisibleUsers] = useState(5);

  const [selectedUserType, setSelectedUserType] = useState(null);

  const { darkMode } = useDarkMode();

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
    setVisibleUsers(5); // Reset visible users when changing type
  };

  // Add new function to filter data by time range
  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7)); // Default to week
    }

    return data.filter(item => new Date(item.name) >= startDate);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_Local}/api/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        // Create sample chart data with dates
        const today = new Date();
        const sampleChartData = [
          { name: new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString(), clients: 40, truckers: 24, serviceProviders: 18, revenue: 2400, expenses: 1800 },
          { name: new Date(today.getFullYear(), today.getMonth() - 4, 1).toISOString(), clients: 30, truckers: 28, serviceProviders: 22, revenue: 3000, expenses: 2100 },
          { name: new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString(), clients: 45, truckers: 32, serviceProviders: 25, revenue: 3500, expenses: 2400 },
          { name: new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString(), clients: 50, truckers: 35, serviceProviders: 30, revenue: 4000, expenses: 2800 },
          { name: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString(), clients: 55, truckers: 40, serviceProviders: 35, revenue: 4500, expenses: 3200 },
          { name: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(), clients: 60, truckers: 45, serviceProviders: 40, revenue: 5000, expenses: 3600 }
        ];

        const newStats = {
          clients: { total: response.data.totalClients, active: response.data.totalClients, new: response.data.newClients },
          truckers: { total: response.data.totalTruckers, active: response.data.totalTruckers, new: response.data.newTruckers },
          serviceProviders: { total: response.data.userDistribution.serviceProviders, active: response.data.userDistribution.serviceProviders, new: 0 },
          jobs: { total: response.data.activeJobs + response.data.completedJobs, completed: response.data.completedJobs, inProgress: response.data.activeJobs },
          services: { total: 0, popular: '' },
          notifications: { total: 0, unread: 0 },
          revenue: { total: `$${response.data.totalRevenue}`, growth: '0%' },
          chartData: sampleChartData,
          systemAlerts: response.data.systemAlerts || [],
          users: []
        };

        // Initialize filtered data with the default time range (week)
        const initialFilteredData = filterDataByTimeRange(sampleChartData, 'week');
        
        setStats(newStats);
        setFilteredData({
          stats: newStats,
          chartData: initialFilteredData,
          systemAlerts: response.data.systemAlerts || [],
          users: []
        });
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          setError(`Error: ${error.response.data.message || 'An error occurred while fetching data.'}`);
        } else if (error.request) {
          // The request was made but no response was received
          setError('Error: No response received from the server. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium text-gray-800 dark:text-white`}>{title}</h3>
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>
      <div className={`text-3xl font-bold text-gray-800 dark:text-white mb-2`}>{value}</div>
      <div className="flex items-center text-sm">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`font-medium text-green-500 dark:text-green-500`}>
          {subValue}
        </span>
      </div>
    </motion.div>
  );

  const TabButton = ({ name, label, icon: Icon }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(name)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
        activeTab === name 
          ? 'bg-blue-500 text-white' 
          : `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:hover:bg-gray-600 hover:bg-gray-200`
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </motion.button>
  );

  const AlertItem = ({ alert }) => {
    const alertStyles = {
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      error: 'bg-red-100 border-red-500 text-red-700',
      success: 'bg-green-100 border-green-500 text-green-700',
    };

    const AlertIcon = {
      warning: AlertTriangle,
      error: XCircle,
      success: CheckCircle,
    };

    const Icon = AlertIcon[alert.type];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`p-4 rounded-md ${alertStyles[alert.type]} mb-4`}
      >
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</h3>
        </div>
        <p className="mt-2">{alert.message}</p>
        <p className="text-xs mt-1">{alert.timestamp}</p>
      </motion.div>
    );
  };

  const handleGlobalSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    if (!searchTerm) {
      // If search is empty, reset to original data
      setFilteredData({
        stats: stats,
        chartData: stats.chartData,
        systemAlerts: stats.systemAlerts,
        users: stats.users
      });
      return;
    }

    // Filter chart data
    const filteredChartData = stats.chartData.filter(data => 
      Object.entries(data).some(([key, value]) => 
        value.toString().toLowerCase().includes(searchTerm)
      )
    );

    

    // Filter stats based on their string values
    const filteredStats = {
      ...stats,
      clients: searchInObject(stats.clients, searchTerm) ? stats.clients : { total: 0, active: 0, new: 0 },
      truckers: searchInObject(stats.truckers, searchTerm) ? stats.truckers : { total: 0, active: 0, new: 0 },
      serviceProviders: searchInObject(stats.serviceProviders, searchTerm) ? stats.serviceProviders : { total: 0, active: 0, new: 0 },
      jobs: searchInObject(stats.jobs, searchTerm) ? stats.jobs : { total: 0, completed: 0, inProgress: 0 }
    };

    setFilteredData({
      stats: filteredStats,
      chartData: filteredChartData,
      users: stats.users.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm) ||
        user.lastName?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.accountType?.toLowerCase().includes(searchTerm)
      )
    });
  };

  // Helper function to search within nested objects
  const searchInObject = (obj, searchTerm) => {
    return Object.values(obj).some(value => 
      value.toString().toLowerCase().includes(searchTerm)
    );
  };

  // Update handleFilterClick to filter the data
  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    setTimeRange(filter);

    // Filter chart data based on time range
    const filteredChartData = filterDataByTimeRange(stats.chartData, filter);

    // Update filtered data with new time range
    setFilteredData(prevData => ({
      ...prevData,
      chartData: filteredChartData,
      stats: {
        ...prevData.stats,
        // Update stats based on filtered data
        clients: {
          ...prevData.stats.clients,
          new: calculateNewItems(filteredChartData, 'clients')
        },
        truckers: {
          ...prevData.stats.truckers,
          new: calculateNewItems(filteredChartData, 'truckers')
        },
        serviceProviders: {
          ...prevData.stats.serviceProviders,
          new: calculateNewItems(filteredChartData, 'serviceProviders')
        },
        revenue: {
          ...prevData.stats.revenue,
          growth: calculateGrowth(filteredChartData, 'revenue')
        }
      }
    }));
  };

  // Helper function to calculate new items in the selected time range
  const calculateNewItems = (data, key) => {
    if (!data.length) return 0;
    const latestValue = data[data.length - 1][key];
    const firstValue = data[0][key];
    return latestValue - firstValue;
  };

  // Helper function to calculate growth percentage
  const calculateGrowth = (data, key) => {
    if (!data.length) return '0%';
    const latestValue = data[data.length - 1][key];
    const firstValue = data[0][key];
    const growth = ((latestValue - firstValue) / firstValue) * 100;
    return `${growth.toFixed(1)}%`;
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Move formatDate function before handleDownload
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' });
  };

  const handleDownload = useCallback(async () => {
    try {
      setLoading(true);

      // Create table data from dashboard stats
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set title
      doc.setFontSize(16);
      doc.text('Admin Dashboard Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

      // Start y position for tables
      let yPos = 30;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // User Statistics Table
      doc.setFontSize(12);
      doc.text('User Statistics', 14, yPos);
      yPos += 8;

      const userHeaders = [['Category', 'Total', 'Active', 'New']];
      const userData = [
        ['Clients', stats.clients.total, stats.clients.active, stats.clients.new],
        ['Truckers', stats.truckers.total, stats.truckers.active, stats.truckers.new],
        ['Service Providers', stats.serviceProviders.total, stats.serviceProviders.active, stats.serviceProviders.new]
      ];

      doc.autoTable({
        startY: yPos,
        head: userHeaders,
        body: userData,
        margin: { left: 14 },
        theme: 'grid'
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Jobs Statistics Table
      doc.setFontSize(12);
      doc.text('Jobs Statistics', 14, yPos);
      yPos += 8;

      const jobHeaders = [['Category', 'Value']];
      const jobData = [
        ['Total Jobs', stats.jobs.total],
        ['Completed Jobs', stats.jobs.completed],
        ['In Progress', stats.jobs.inProgress]
      ];

      doc.autoTable({
        startY: yPos,
        head: jobHeaders,
        body: jobData,
        margin: { left: 14 },
        theme: 'grid'
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Revenue Statistics
      doc.setFontSize(12);
      doc.text('Revenue Statistics', 14, yPos);
      yPos += 8;

      const revenueHeaders = [['Category', 'Value']];
      const revenueData = [
        ['Total Revenue', stats.revenue.total],
        ['Growth', stats.revenue.growth]
      ];

      doc.autoTable({
        startY: yPos,
        head: revenueHeaders,
        body: revenueData,
        margin: { left: 14 },
        theme: 'grid'
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Monthly Activity Table
      doc.setFontSize(12);
      doc.text('Monthly Activity', 14, yPos);
      yPos += 8;

      const activityHeaders = [['Month', 'Clients', 'Truckers', 'Service Providers', 'Revenue']];
      const activityData = filteredData.chartData.map(data => [
        formatDate(data.name),
        data.clients,
        data.truckers,
        data.serviceProviders,
        `$${data.revenue}`
      ]);

      doc.autoTable({
        startY: yPos,
        head: activityHeaders,
        body: activityData,
        margin: { left: 14 },
        theme: 'grid'
      });

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      // Save the PDF
      doc.save(`admin_dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  }, [stats, filteredData.chartData, formatDate]);

  // Add this component inside AdminDashboard before the return statement
  const UserCard = ({ title, count, icon: Icon, color, type }) => (
    <div
      className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 border-l-4 ${color}`}
      onClick={() => handleUserTypeSelect(type)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-3xl font-bold text-gray-600 mt-2">{count}</p>
        </div>
        <Icon className={`w-12 h-12 ${color.replace('border-', 'text-')}`} />
      </div>
    </div>
  );

  const ServiceProviderTable = ({ users }) => {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <th className={`w-[16%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Name
                </th>
                <th className={`w-[20%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Email
                </th>
                <th className={`w-[16%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Account Type
                </th>
                <th className={`w-[16%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Location
                </th>
                <th className={`w-[10%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Rating
                </th>
                <th className={`w-[12%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`w-[10%] px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((user, index) => (
                <tr key={index} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap truncate ${darkMode ? 'text-gray-300' : ''}`}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap truncate ${darkMode ? 'text-gray-300' : ''}`}>
                    {user.email}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap truncate ${darkMode ? 'text-gray-300' : ''} capitalize`}>
                    {user.accountType}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap truncate ${darkMode ? 'text-gray-300' : ''}`}>
                    {user.location || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : ''}`}>
                    <div className="flex items-center">
                      <span className={`text-yellow-500 ${darkMode ? 'text-gray-300' : ''}`}>★</span>
                      <span className={`ml-1 ${darkMode ? 'text-gray-300' : ''}`}>{user.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : ''}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'inactive'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-300' : ''}`}>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(user.id)} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No users found
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div 
        className={`container mx-auto px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} 
        ref={dashboardRef}
        style={{ minHeight: '100vh' }}
      >
        {/* Check if stats are defined before rendering */}
        {stats && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Global Search..."
                    className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white'
                    }`}
                    value={searchTerm}
                    onChange={handleGlobalSearch}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={handleSettingsClick}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-100 p-4 rounded-lg mb-8"
                >
                  <div className="flex space-x-4">
                    <button
                      className={`px-4 py-2 rounded-lg ${selectedFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                      onClick={() => handleFilterClick('week')}
                    >
                      This Week
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${selectedFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                      onClick={() => handleFilterClick('month')}
                    >
                      This Month
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${selectedFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                      onClick={() => handleFilterClick('year')}
                    >
                      This Year
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex space-x-4 mb-8">
              <TabButton name="overview" label="Overview" icon={Calendar} />
              <TabButton name="analytics" label="Analytics" icon={BarChart} />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {activeTab === 'overview' && (
              <>
                <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Clients"
                    value={filteredData.stats.clients?.total || 0}
                    subValue={`${filteredData.stats.clients?.new || 0} new (30d)`}
                    icon={Users}
                    color="blue"
                    trend="up"
                  />
                  <StatCard
                    title="Total Truckers"
                    value={filteredData.stats.truckers?.total || 0}
                    subValue={`${filteredData.stats.truckers?.new || 0} new (30d)`}
                    icon={Truck}
                    color="green"
                    trend="up"
                  />
                 
                  <StatCard
                    title="Active Jobs"
                    value={filteredData.stats.jobs?.inProgress || 0}
                    subValue={`${filteredData.stats.jobs?.completed || 0} completed (30d)`}
                    icon={Package}
                    color="purple"
                    trend="down"
                  />
                </div>


                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Clients', value: stats.clients.total },
                            { name: 'Truckers', value: stats.truckers.total },
                            { name: 'Service Providers', value: stats.serviceProviders.total },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Clients', value: stats.clients.total },
                            { name: 'Truckers', value: stats.truckers.total },
                            { name: 'Service Providers', value: stats.serviceProviders.total },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
                  <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : ''}`}>Activity Overview</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={filteredData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="clients" fill="#0088FE" />
                      <Bar dataKey="truckers" fill="#00C49F" />
                      <Bar dataKey="serviceProviders" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
                    onClick={() => {
                      console.log('Download button clicked');
                      handleDownload();
                    }}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {loading ? 'Generating PDF...' : 'Download Report'}
                  </motion.button>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                </div>
                {loading ? (
                  <div className="text-center py-10">
                    <h2 className="text-xl font-semibold text-gray-600">Loading...</h2>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <UserCard
                        title="Total Users"
                        count={filteredData.users.length}
                        icon={Users}
                        color="border-purple-500"
                        type={null}
                      />
                      <UserCard
                        title="Service Providers"
                        count={filteredData.users.filter(u => u.accountType === 'serviceProvider').length}
                        icon={Briefcase}
                        color="border-blue-500"
                        type="serviceProvider"
                      />
                      <UserCard
                        title="Truckers"
                        count={filteredData.users.filter(u => u.accountType === 'trucker').length}
                        icon={Truck}
                        color="border-green-500"
                        type="trucker"
                      />
                      <UserCard
                        title="Clients"
                        count={filteredData.users.filter(u => u.accountType === 'client').length}
                        icon={Users}
                        color="border-yellow-500"
                        type="client"
                      />
                    </div>
                    <ServiceProviderTable 
                      users={filteredData.users.filter(user => 
                        selectedUserType ? user.accountType === selectedUserType : true
                      )} 
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <MyLoads />
              </div>
            )}

            {activeTab === 'analytics' && (
              <Analytics loading={loading} />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
