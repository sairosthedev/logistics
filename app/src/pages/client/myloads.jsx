import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/layouts/clientLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';

function MyLoads() {
  const [loads, setLoads] = useState([]);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [error, setError] = useState(null); // State to manage error messages
  const [filter, setFilter] = useState('all'); // State to manage filter
  const { accessToken, clientID } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoads = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_Local}/api/client/requests`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          params: {
            clientID
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Sort loads by createdAt in descending order to display new jobs on top
          const sortedLoads = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLoads(sortedLoads);
        } else {
          console.error('Unexpected response data:', response.data);
          setLoads([]);
        }
      } catch (error) {
        console.error('Error fetching loads:', error);
        setLoads([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoads();
  }, [accessToken, clientID]);

  // Define statusColors here
  const statusColors = {
    "pending": "text-yellow-600",
    "inTransit": "text-blue-600",
    "delivered": "text-green-600"
  };

  const filteredLoads = filter === 'all' ? loads : loads.filter(load => load.status === filter);

  return (
    <ClientLayout>
      <div className="py-6 px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Jobs</h1>
        </div>

        {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}

        <div className="mb-4">
          <label htmlFor="filter" className="mr-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">Filter by status:</label>
          <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)} 
            className="px-2 sm:px-4 py-1 sm:py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="inTransit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Jobs</h2>
          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          ) : filteredLoads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Status</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Pickup Location</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Dropoff Location</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Distance</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Goods Type</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Number of Trucks</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Weight</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {filteredLoads.map((load) => (
                    <tr key={load._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200">
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2">
                        <span className={`font-semibold ${statusColors[load.status]}`}>{load.status}</span>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.pickupLocation}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.dropoffLocation}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.distance} km</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.goodsType}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.numberOfTrucks}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.weight} tons</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{new Date(load.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No job requests at the moment. Keep checking for updates!</p>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}

export default MyLoads;
