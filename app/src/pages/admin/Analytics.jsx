import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Truck, Users, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import AppLayout from '../../components/layouts/appLayout';
import axios from 'axios';
import useAuthStore from '../auth/auth';
import { BACKEND_Local } from '../../../url.js';

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
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

  if (loading) return <AppLayout><div className="flex justify-center items-center h-screen">Loading...</div></AppLayout>;
  if (error) return <AppLayout><div className="text-red-500 text-center">{error}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">

        <div className="mb-6">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clients" stroke="#8884d8" />
                <Line type="monotone" dataKey="truckers" stroke="#82ca9d" />
                <Line type="monotone" dataKey="serviceProviders" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Revenue vs Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="expenses" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Job Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.jobDistribution || []} // Ensure data is an array
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data.jobDistribution || []).map((entry, index) => ( // Ensure data is an array
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Top Routes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topRoutes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Service Provider Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.serviceProviderPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="rating" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="jobs" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
