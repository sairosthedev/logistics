import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Truck, Users, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../auth/auth';
import { BACKEND_Local } from '../../../url.js';
import { useDarkMode } from '../../contexts/DarkModeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const { accessToken } = useAuthStore(); // Get the accessToken from the store
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    userGrowth: [],
    revenueData: [],
    jobDistribution: [],
    topRoutes: [],
    serviceProviderPerformance: []
  });
  const { darkMode } = useDarkMode();

  const chartTheme = {
    background: darkMode ? '#1F2937' : '#FFFFFF',
    textColor: darkMode ? '#D1D5DB' : '#374151',
    gridColor: darkMode ? '#374151' : '#E5E7EB',
    tooltipBackground: darkMode ? '#374151' : '#FFFFFF',
    tooltipText: darkMode ? '#F3F4F6' : '#1F2937'
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

        // Map the updated incoming data to the state structure
        setData({
          userGrowth: response.data.userGrowth,
          revenueData: response.data.revenueData,
          jobDistribution: response.data.jobDistribution,
          topRoutes: response.data.topRoutes,
          serviceProviderPerformance: response.data.serviceProviderPerformance
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const StatCard = ({ title, value, subValue, icon: Icon, trend }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{title}</h3>
        <Icon className="h-8 w-8 text-blue-500" />
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
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`border rounded-lg px-4 py-2 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
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
        </div>
      </div>
    </div>
  );
};

export default Analytics;
