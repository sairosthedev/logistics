import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Truck, Users, Package, DollarSign, TrendingUp, TrendingDown, Activity, Clock, MapPin, Star } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../auth/auth';
import { BACKEND_Local } from '../../../url.js';
import { useDarkMode } from '../../contexts/DarkModeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const { accessToken } = useAuthStore();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    userGrowth: [],
    revenueData: [],
    jobDistribution: [],
    topRoutes: [],
    serviceProviderPerformance: [],
    systemMetrics: [],
    userActivity: [],
    deliveryPerformance: [],
    totalUsers: 0,
    userDistribution: {
      clients: 0,
      truckers: 0,
      serviceProviders: 0
    }
  });
  const { darkMode } = useDarkMode();

  const chartTheme = {
    background: darkMode ? '#1F2937' : '#FFFFFF',
    textColor: darkMode ? '#D1D5DB' : '#374151',
    gridColor: darkMode ? '#374151' : '#E5E7EB',
    tooltipBackground: darkMode ? '#374151' : '#FFFFFF',
    tooltipText: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, usersResponse] = await Promise.all([
        axios.get(`${BACKEND_Local}/api/admin/analytics?timeRange=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }),
        axios.get(`${BACKEND_Local}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      ]);

      const { clients, truckers, serviceProviders } = usersResponse.data;
      const allUsers = [...clients, ...truckers, ...serviceProviders];

      setData({
        ...analyticsResponse.data,
        systemMetrics: analyticsResponse.data.systemMetrics || [],
        userActivity: analyticsResponse.data.userActivity || [],
        deliveryPerformance: analyticsResponse.data.deliveryPerformance || [],
        totalUsers: allUsers.length,
        userDistribution: {
          clients: clients.length,
          truckers: truckers.length,
          serviceProviders: serviceProviders.length
        }
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, timeRange]);

  const StatCard = ({ title, value, subValue, icon: Icon, trend, color = 'blue' }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{title}</h3>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
      <div className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>{value}</div>
      <div className="flex items-center text-sm">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {subValue}
        </span>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} min-h-screen p-6`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Analytics Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`border rounded-lg px-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 border-gray-600' 
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={data.totalUsers || '0'}
          subValue="+12% from last period"
          icon={Users}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Active Deliveries"
          value={data.activeDeliveries || '0'}
          subValue="+5% efficiency"
          icon={Truck}
          trend="up"
          color="green"
        />
        <StatCard
          title="Revenue"
          value={`$${data.totalRevenue || '0'}`}
          subValue="+8% from last month"
          icon={DollarSign}
          trend="up"
          color="yellow"
        />
        <StatCard
          title="System Health"
          value={data.systemHealth || '98%'}
          subValue="All systems operational"
          icon={Activity}
          trend="up"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            User Growth
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <YAxis 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBackground,
                  color: chartTheme.tooltipText,
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ color: chartTheme.textColor }} />
              <Line type="monotone" dataKey="clients" stroke="#8884d8" />
              <Line type="monotone" dataKey="truckers" stroke="#82ca9d" />
              <Line type="monotone" dataKey="serviceProviders" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Revenue vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <YAxis 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBackground,
                  color: chartTheme.tooltipText,
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ color: chartTheme.textColor }} />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Job Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.jobDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(data.jobDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBackground,
                  color: chartTheme.tooltipText,
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
                formatter={(value) => <span style={{ color: chartTheme.textColor }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Top Routes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topRoutes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis 
                type="number" 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBackground,
                  color: chartTheme.tooltipText,
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
                formatter={(value) => <span style={{ color: chartTheme.textColor }}>{value}</span>}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Service Provider Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.serviceProviderPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
            <XAxis 
              dataKey="name" 
              stroke={chartTheme.textColor}
              tick={{ fill: chartTheme.textColor }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8"
              tick={{ fill: chartTheme.textColor }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d"
              tick={{ fill: chartTheme.textColor }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartTheme.tooltipBackground,
                color: chartTheme.tooltipText,
                border: 'none',
                borderRadius: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{ color: chartTheme.textColor }}
              formatter={(value) => <span style={{ color: chartTheme.textColor }}>{value}</span>}
            />
            <Bar yAxisId="left" dataKey="rating" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="jobs" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            System Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.systemMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis 
                dataKey="timestamp" 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <YAxis 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBackground,
                  color: chartTheme.tooltipText,
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ color: chartTheme.textColor }} />
              <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU Usage" />
              <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory Usage" />
              <Line type="monotone" dataKey="responseTime" stroke="#ffc658" name="Response Time" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Delivery Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.deliveryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <YAxis 
                stroke={chartTheme.textColor}
                tick={{ fill: chartTheme.textColor }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBackground,
                  color: chartTheme.tooltipText,
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ color: chartTheme.textColor }} />
              <Bar dataKey="onTime" stackId="a" fill="#8884d8" name="On Time" />
              <Bar dataKey="delayed" stackId="a" fill="#82ca9d" name="Delayed" />
              <Bar dataKey="failed" stackId="a" fill="#ffc658" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
